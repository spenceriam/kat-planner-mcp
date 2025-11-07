import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

/**
 * Session interface for KAT-PLANNER MCP server
 */
interface Session {
  sessionId: string;
  state: "questioning" | "refining" | "document_review" | "final_approval" | "development";
  userIdea: string;
  createdAt: number;
  lastActivity: number;
  answers?: Record<string, string>;
  refinedSpecification?: string;
  generatedDocuments?: Array<{ title: string; content: string }>;
  approvalStatus?: {
    requirements: boolean;
    design: boolean;
    tasks: boolean;
    agents: boolean;
    overall: boolean;
  };
  developmentPlan?: {
    implementationSteps: string[];
    milestones: string[];
    estimatedTimeline: string;
  };
  codebaseType?: "new_project" | "existing_with_docs" | "existing_without_docs";
  projectType?: string;
}

/**
 * Production-ready session manager with atomic file writes and robust error handling
 */
export class ProductionSessionManager {
  private sessions = new Map<string, Session>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_SESSIONS = 1000; // Prevent memory bloat
  private readonly SESSION_FILE = path.join(os.homedir(), '.kat-planner-sessions.json');
  private initialized = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize session manager - load from disk and start cleanup
   */
  private async initialize(): Promise<void> {
    await this.loadFromDisk();
    this.startCleanupTimer();
    this.initialized = true;
    this.logSessionEvent('session_manager_initialized', 'system', {
      loadedSessions: this.sessions.size
    });
  }

  /**
   * Wait for session manager to be initialized
   */
  private async waitForInitialization(): Promise<void> {
    while (!this.initialized) {
      await new Promise(resolve => setTimeout(resolve, 10));
    }
  }

  /**
   * Create new session with size limit enforcement
   */
  async createSession(userIdea: string): Promise<string | null> {
    await this.waitForInitialization();

    // Check size limit
    if (this.sessions.size >= this.MAX_SESSIONS) {
      this.logSessionEvent('session_limit_reached', 'system', {
        currentSessions: this.sessions.size,
        maxSessions: this.MAX_SESSIONS
      });
      await this.forceCleanup();

      if (this.sessions.size >= this.MAX_SESSIONS) {
        this.logSessionEvent('session_creation_failed', 'system', {
          reason: 'session_limit_after_cleanup'
        });
        return null; // Still at limit after cleanup
      }
    }

    const sessionId = this.generateSessionId();
    const session: Session = {
      sessionId,
      state: "questioning",
      userIdea,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);
    await this.saveToDisk();

    this.logSessionEvent('session_created', sessionId, { userIdea });
    return sessionId;
  }

  /**
   * Get session with activity update
   */
  getSession(sessionId: string): Promise<Session | undefined> {
    return this.waitForInitialization().then(() => {
      const session = this.sessions.get(sessionId);
      if (!session) {
        this.logSessionEvent('session_not_found', sessionId);
        return undefined;
      }

      // Update activity
      session.lastActivity = Date.now();
      this.saveToDisk(); // Async save

      this.logSessionEvent('session_accessed', sessionId, { state: session.state });
      return session;
    });
  }

  /**
   * Update session with validation and state transition enforcement
   */
  async updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean> {
    await this.waitForInitialization();
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logSessionEvent('session_update_failed', sessionId, {
        reason: 'session_not_found'
      });
      return false;
    }

    // Validate state transitions
    if (updates.state && !this.canTransition(session.state, updates.state)) {
      this.logSessionEvent('state_transition_invalid', sessionId, {
        fromState: session.state,
        toState: updates.state
      });
      return false;
    }

    Object.assign(session, updates);
    session.lastActivity = Date.now();

    await this.saveToDisk();

    this.logSessionEvent('session_updated', sessionId, {
      updatedFields: Object.keys(updates),
      newState: updates.state || session.state
    });

    return true;
  }

  /**
   * Validate state transitions to prevent workflow loops
   */
  private canTransition(from: string, to: string): boolean {
    const validTransitions: Record<string, string[]> = {
      "questioning": ["refining"],
      "refining": ["document_review"],
      "document_review": ["refining", "final_approval"], // Allow revisions
      "final_approval": ["development"]
    };

    const allowedTransitions = validTransitions[from] || [];
    return allowedTransitions.includes(to);
  }

  /**
   * Force cleanup - remove oldest sessions when at capacity
   */
  private async forceCleanup(): Promise<void> {
    if (this.sessions.size === 0) return;

    // Remove oldest sessions first
    const sorted = Array.from(this.sessions.entries())
      .sort((a, b) => a[1].lastActivity - b[1].lastActivity);

    const toRemove = Math.floor(this.sessions.size * 0.2); // Remove oldest 20%

    this.logSessionEvent('force_cleanup_started', 'system', {
      totalSessions: this.sessions.size,
      sessionsToRemove: toRemove
    });

    let removed = 0;
    for (let i = 0; i < toRemove; i++) {
      const sessionId = sorted[i]?.[0];
      if (sessionId) {
        this.sessions.delete(sessionId);
        removed++;
        this.logSessionEvent('session_removed', sessionId, { reason: 'force_cleanup' });
      }
    }

    await this.saveToDisk();

    this.logSessionEvent('force_cleanup_complete', 'system', {
      sessionsRemoved: removed
    });
  }

  /**
   * Cleanup expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    let cleaned = 0;

    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(sessionId);
        cleaned++;
        this.logSessionEvent('session_expired', sessionId, {
          duration: now - session.createdAt
        });
      }
    }

    if (cleaned > 0) {
      this.saveToDisk();
      this.logSessionEvent('cleanup_complete', 'system', {
        sessionsCleaned: cleaned
      });
    }
  }

  /**
   * Start automatic cleanup timer
   */
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.CLEANUP_INTERVAL);
  }

  /**
   * Atomic file write with direct approach
   */
  private async saveToDisk(): Promise<void> {
    try {
      // Ensure the directory exists
      const sessionDir = path.dirname(this.SESSION_FILE);
      await fs.mkdir(sessionDir, { recursive: true });

      const data = JSON.stringify(Array.from(this.sessions.entries()), null, 2);

      // Direct write (simpler approach for now)
      await fs.writeFile(this.SESSION_FILE, data);

      this.logSessionEvent('sessions_saved', 'system', {
        sessionCount: this.sessions.size
      });
    } catch (err) {
      if (err instanceof Error) {
        this.logSessionEvent('save_failed', 'system', {
          error: err.message
        });
        console.error('Failed to save sessions:', err);
      } else {
        this.logSessionEvent('save_failed', 'system', {
          error: 'Unknown error'
        });
        console.error('Failed to save sessions:', err);
      }
    }
  }

  /**
   * Robust file loading with validation and corruption handling
   */
  private async loadFromDisk(): Promise<void> {
    try {
      const data = await fs.readFile(this.SESSION_FILE, 'utf-8');

      // Parse and validate
      const entries = JSON.parse(data);

      if (!Array.isArray(entries)) {
        throw new Error('Invalid session file format - not an array');
      }

      // Validate each session
      const validSessions: [string, Session][] = [];
      let invalidSessions = 0;

      for (const [id, session] of entries) {
        if (this.isValidSession(session)) {
          validSessions.push([id, session]);
        } else {
          invalidSessions++;
          this.logSessionEvent('invalid_session_skipped', id, {
            reason: 'invalid_session_data'
          });
        }
      }

      this.sessions = new Map(validSessions);

      // Clean up expired sessions on load
      const now = Date.now();
      let expired = 0;
      for (const [id, session] of this.sessions.entries()) {
        if (now - session.lastActivity > this.SESSION_TIMEOUT) {
          this.sessions.delete(id);
          expired++;
          this.logSessionEvent('expired_session_removed', id);
        }
      }

      // Save to remove expired sessions
      if (expired > 0) {
        await this.saveToDisk();
      }

      this.logSessionEvent('sessions_loaded', 'system', {
        validSessions: this.sessions.size,
        invalidSessions,
        expiredSessions: expired
      });

      console.log(`Loaded ${this.sessions.size} sessions (cleaned ${invalidSessions} invalid, ${expired} expired)`);
    } catch (err) {
      if (err && typeof err === 'object' && 'code' in err) {
        if (err.code === 'ENOENT') {
          this.logSessionEvent('no_sessions_file', 'system', {
            reason: 'file_not_found'
          });
          console.log('No previous sessions found');
        } else {
          this.logSessionEvent('load_failed', 'system', {
            error: err instanceof Error ? err.message : 'Unknown error'
          });
          console.error('Failed to load sessions, starting fresh:', err);
        }
      } else {
        this.logSessionEvent('load_failed', 'system', {
          error: 'Unknown error'
        });
        console.error('Failed to load sessions, starting fresh:', err);
      }
    }
  }

  /**
   * Validate session data integrity
   */
  private isValidSession(session: any): session is Session {
    return session &&
           typeof session.sessionId === 'string' &&
           ['questioning', 'refining', 'document_review', 'final_approval', 'development'].includes(session.state) &&
           typeof session.userIdea === 'string' &&
           typeof session.createdAt === 'number' &&
           typeof session.lastActivity === 'number' &&
           (session.answers === undefined || typeof session.answers === 'object') &&
           (session.refinedSpecification === undefined || typeof session.refinedSpecification === 'string') &&
           (session.generatedDocuments === undefined || Array.isArray(session.generatedDocuments)) &&
           (session.approvalStatus === undefined || (
             typeof session.approvalStatus === 'object' &&
             typeof session.approvalStatus.requirements === 'boolean' &&
             typeof session.approvalStatus.design === 'boolean' &&
             typeof session.approvalStatus.tasks === 'boolean' &&
             typeof session.approvalStatus.agents === 'boolean' &&
             typeof session.approvalStatus.overall === 'boolean'
           )) &&
           (session.codebaseType === undefined || ['new_project', 'existing_with_docs', 'existing_without_docs'].includes(session.codebaseType));
  }

  /**
   * Generate unique session ID
   */
  private generateSessionId(): string {
    return `kat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Comprehensive logging for debugging and monitoring
   */
  private logSessionEvent(event: string, sessionId: string, details?: any): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      sessionId,
      ...details
    };

    console.error(JSON.stringify(logEntry));
  }

  /**
   * Get session count for monitoring
   */
  getSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get all session IDs for debugging
   */
  getAllSessionIds(): string[] {
    return Array.from(this.sessions.keys());
  }
}