/**
 * Session interface for KAT-PLANNER MCP server
 */
interface Session {
    sessionId: string;
    state: "questioning" | "refining" | "approved";
    userIdea: string;
    createdAt: number;
    lastActivity: number;
    answers?: Record<string, string>;
}
/**
 * Production-ready session manager with atomic file writes and robust error handling
 */
export declare class ProductionSessionManager {
    private sessions;
    private readonly SESSION_TIMEOUT;
    private readonly CLEANUP_INTERVAL;
    private readonly MAX_SESSIONS;
    private readonly SESSION_FILE;
    constructor();
    /**
     * Initialize session manager - load from disk and start cleanup
     */
    private initialize;
    /**
     * Create new session with size limit enforcement
     */
    createSession(userIdea: string): Promise<string | null>;
    /**
     * Get session with activity update
     */
    getSession(sessionId: string): Session | undefined;
    /**
     * Update session with validation and state transition enforcement
     */
    updateSession(sessionId: string, updates: Partial<Session>): Promise<boolean>;
    /**
     * Validate state transitions to prevent workflow loops
     */
    private canTransition;
    /**
     * Force cleanup - remove oldest sessions when at capacity
     */
    private forceCleanup;
    /**
     * Cleanup expired sessions
     */
    private cleanupExpiredSessions;
    /**
     * Start automatic cleanup timer
     */
    private startCleanupTimer;
    /**
     * Atomic file write with temp file → rename pattern
     */
    private saveToDisk;
    /**
     * Robust file loading with validation and corruption handling
     */
    private loadFromDisk;
    /**
     * Validate session data integrity
     */
    private isValidSession;
    /**
     * Generate unique session ID
     */
    private generateSessionId;
    /**
     * Comprehensive logging for debugging and monitoring
     */
    private logSessionEvent;
    /**
     * Get session count for monitoring
     */
    getSessionCount(): number;
    /**
     * Get all session IDs for debugging
     */
    getAllSessionIds(): string[];
}
export {};
//# sourceMappingURL=session-manager-new.d.ts.map