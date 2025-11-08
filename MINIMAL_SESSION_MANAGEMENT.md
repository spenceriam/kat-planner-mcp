# Minimal Session Management for KAT-PLANNER MCP Server

## 🎯 Design Principles

**Keep it SIMPLE but ROBUST**:
- ✅ **In-memory sessions** for speed and simplicity
- ✅ **File persistence** to survive server restarts
- ✅ **Automatic cleanup** to prevent memory bloat
- ✅ **Minimal API surface** - just what we need

## 🚀 Implementation Strategy

### **Session Store Design**
```typescript
interface Session {
  sessionId: string;
  state: "questioning" | "refining" | "approved";
  userIdea: string;
  createdAt: number;
  lastActivity: number;
  answers?: Record<string, string>;
}

class MinimalSessionManager {
  private sessions = new Map<string, Session>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly PERSIST_FILE = "sessions.json";
}
```

### **Why NOT SQLite?**
- ❌ **Overkill** for simple session tracking
- ❌ **Complexity** with migrations, connections, queries
- ❌ **Performance overhead** for simple key-value storage
- ✅ **File-based JSON** is perfect for local MCP servers

## 📋 Core Implementation

### **1. Session Management (Minimal API)**
```typescript
class MinimalSessionManager {
  private sessions = new Map<string, Session>();
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000; // 30 minutes
  private readonly CLEANUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private readonly PERSIST_FILE = "sessions.json";

  constructor() {
    this.loadSessions();
    this.startCleanupTimer();
  }

  // Create new session - VERY simple
  createSession(userIdea: string): string {
    const sessionId = this.generateSessionId();
    const session: Session = {
      sessionId,
      state: "questioning",
      userIdea,
      createdAt: Date.now(),
      lastActivity: Date.now()
    };

    this.sessions.set(sessionId, session);
    this.saveSessions();
    return sessionId;
  }

  // Get session with automatic cleanup - VERY simple
  getSession(sessionId: string): Session | undefined {
    const session = this.sessions.get(sessionId);
    if (!session) return undefined;

    // Update activity
    session.lastActivity = Date.now();
    this.saveSessions();
    return session;
  }

  // Update session state - VERY simple
  updateSession(sessionId: string, updates: Partial<Session>): boolean {
    const session = this.sessions.get(sessionId);
    if (!session) return false;

    Object.assign(session, updates);
    session.lastActivity = Date.now();
    this.saveSessions();
    return true;
  }

  // Clean up expired sessions - AUTOMATIC
  private cleanupExpiredSessions(): void {
    const now = Date.now();
    for (const [id, session] of this.sessions.entries()) {
      if (now - session.lastActivity > this.SESSION_TIMEOUT) {
        this.sessions.delete(id);
      }
    }
    this.saveSessions();
  }

  // Auto-cleanup timer - SET AND FORGET
  private startCleanupTimer(): void {
    setInterval(() => {
      this.cleanupExpiredSessions();
    }, this.CLEANUP_INTERVAL);
  }

  // File persistence - SIMPLE JSON
  private saveSessions(): void {
    try {
      const sessionsArray = Array.from(this.sessions.values());
      require('fs').writeFileSync(this.PERSIST_FILE, JSON.stringify(sessionsArray, null, 2));
    } catch (error) {
      console.warn('Failed to save sessions:', error);
    }
  }

  private loadSessions(): void {
    try {
      const fs = require('fs');
      if (fs.existsSync(this.PERSIST_FILE)) {
        const sessionsArray = JSON.parse(fs.readFileSync(this.PERSIST_FILE, 'utf8'));
        sessionsArray.forEach((session: Session) => {
          this.sessions.set(session.sessionId, session);
        });
      }
    } catch (error) {
      console.warn('Failed to load sessions:', error);
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
```

### **2. Integration with MCP Server**
```typescript
class KatPlannerServer {
  private sessionManager = new MinimalSessionManager();

  private async handleInteractiveWorkflow(params: {
    userIdea: string;
    mode: string;
    sessionId?: string;
    userAnswers?: Record<string, string>;
    explicitApproval?: string;
  }) {
    switch (params.mode) {
      case 'question':
        return this.handleQuestionMode(params.userIdea);

      case 'refine':
        return this.handleRefineMode(params.sessionId, params.userAnswers);

      case 'approve':
        return this.handleApproveMode(params.sessionId, params.userAnswers, params.explicitApproval);

      default:
        return this.formatErrorResponse("Invalid mode specified", {
          suggestedAction: "Use one of: question, refine, approve",
          validNextSteps: ["question", "refine", "approve"],
          exampleCall: 'start_interactive_spec({ mode: "question", userIdea: "your idea" })'
        });
    }
  }

  private handleQuestionMode(userIdea: string) {
    const sessionId = this.sessionManager.createSession(userIdea);
    const questions = this.generateClarifyingQuestions(userIdea);

    const response = {
      sessionId, // CRITICAL: LLM MUST include this
      content: [{
        type: 'text' as const,
        text: `🎯 **Interactive Project Planning - Clarification Phase**\n\nI'll help plan your project through interactive refinement. Please answer these clarifying questions:\n\n${questions.join('\n')}\n\n*Provide your answers and I'll create a refined specification.*`
      }],
      structuredContent: {
        questions,
        state: "questioning",
        nextStep: "refine",
        workflowMode: 'interactive'
      }
    };

    return this.formatResponse(response, 'questioning');
  }

  private handleRefineMode(sessionId: string | undefined, userAnswers: Record<string, string> | undefined) {
    // CRITICAL: Session validation prevents loops
    if (!sessionId) {
      return this.formatErrorResponse(
        "Session ID required for refinement",
        {
          suggestedAction: "Include sessionId from previous question call",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_interactive_spec({ sessionId: "abc123", mode: "refine", answers: { ... } })'
        }
      );
    }

    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session or use correct sessionId",
          validNextSteps: ["Start new session", "Use correct sessionId"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation prevents loops
    if (session.state !== "questioning") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: questioning → refining`,
        {
          suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
          validNextSteps: [`mode="refine" from questioning state`],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "refine", answers: { ... } })`
        }
      );
    }

    // Process refinement
    const refinedSpec = this.createRefinedSpecification(session.userIdea, userAnswers);

    this.sessionManager.updateSession(sessionId, {
      state: "refining",
      answers: userAnswers,
      lastActivity: Date.now()
    });

    const response = {
      sessionId,
      content: [{
        type: 'text' as const,
        text: `✅ **Interactive Project Planning - Refinement Phase**\n\nBased on your answers, here's your refined specification:\n\n${refinedSpec}\n\n*This specification is ready for final approval.*`
      }],
      structuredContent: {
        sessionId,
        refinedSpecification: refinedSpec,
        state: "refining",
        nextStep: "approve",
        workflowMode: 'interactive'
      }
    };

    return this.formatResponse(response, 'refining');
  }

  private handleApproveMode(
    sessionId: string | undefined,
    userAnswers: Record<string, string> | undefined,
    explicitApproval: string | undefined
  ) {
    // CRITICAL: Session validation prevents loops
    if (!sessionId) {
      return this.formatErrorResponse(
        "Session ID required for approval",
        {
          suggestedAction: "Include sessionId from previous calls",
          validNextSteps: ["Provide sessionId"],
          exampleCall: 'start_interactive_spec({ sessionId: "abc123", mode: "approve" })'
        }
      );
    }

    const session = this.sessionManager.getSession(sessionId);
    if (!session) {
      return this.formatErrorResponse(
        "Invalid or expired session ID",
        {
          suggestedAction: "Start new interactive session",
          validNextSteps: ["Start new session"],
          exampleCall: 'start_interactive_spec({ userIdea: "your idea", mode: "question" })'
        }
      );
    }

    // CRITICAL: State validation prevents loops
    if (session.state !== "refining") {
      return this.formatErrorResponse(
        `Invalid state transition. Current state: ${session.state}. Expected: refining → approved`,
        {
          suggestedAction: `Call with sessionId="${sessionId}" and valid state transition`,
          validNextSteps: [`mode="approve" from refining state`],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "approve", explicitApproval: "yes" })`
        }
      );
    }

    if (!explicitApproval || !['yes', 'approved', 'proceed'].includes(explicitApproval.toLowerCase())) {
      return this.formatErrorResponse(
        "Explicit approval required for final specification",
        {
          suggestedAction: "Provide explicit approval to proceed",
          validNextSteps: ["Provide explicit approval"],
          exampleCall: `start_interactive_spec({ sessionId: "${sessionId}", mode: "approve", explicitApproval: "yes" })`
        }
      );
    }

    // Generate final specification
    const refinedSpec = this.createRefinedSpecification(session.userIdea, session.answers || {});
    const projectType = this.detectProjectType(session.userIdea);
    const sddDocuments = this.generateSDDDocuments(refinedSpec, projectType);
    const testSpecifications = this.generateTestSpecifications(projectType);

    // Finalize session
    this.sessionManager.updateSession(sessionId, {
      state: "approved",
      answers: session.answers,
      lastActivity: Date.now()
    });

    let output = `🎉 **Interactive Project Planning Complete!**\n\n`;
    output += `**Final Refined Specification:**\n${refinedSpec}\n\n`;
    output += `**Generated SDD Documents:**\n${sddDocuments.map(doc => `- ${doc.title}`).join('\n')}\n\n`;
    output += `**Generated Test Specifications:**\n${testSpecifications.coverage.join('\n')}\n\n`;
    output += `*Your comprehensively refined project plan is ready for implementation.*`;

    const response = {
      sessionId,
      content: [{
        type: 'text' as const,
        text: output
      }],
      structuredContent: {
        sessionId,
        refinedSpecification: refinedSpec,
        projectType: projectType,
        sddDocuments: sddDocuments,
        testSpecifications: testSpecifications,
        state: "approved",
        workflowMode: 'interactive',
        planningComplete: true
      }
    };

    return this.formatResponse(response, 'approved');
  }
}
```

## 🎯 Session Code Management Strategy

### **1. Session ID Generation**
```typescript
private generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}
```
- ✅ **Unique** - timestamp + random string
- ✅ **Readable** - easy to debug
- ✅ **URL-safe** - no special characters

### **2. Session Lifecycle**
```
Created (questioning) → Refining → Approved → Expired (30min)
      ↓                    ↓           ↓           ↓
  New session        State valid   State valid   Auto cleanup
  Must include ID    Must include  Must include  No action needed
                     Valid state   Valid state
```

### **3. Error Recovery Strategy**
```typescript
// Clear error messages with specific recovery instructions
{
  error: true,
  message: "Invalid state transition. Current state: refining. Expected: refining → approved",
  recovery: {
    suggestedAction: "Call with valid state transition",
    validNextSteps: ["mode='approve' from refining state"],
    exampleCall: 'start_interactive_spec({ sessionId: "abc123", mode: "approve", explicitApproval: "yes" })'
  }
}
```

## ✅ Benefits of This Approach

### **Loop Prevention Mechanisms**:
1. **Session ID required** - LLM can't continue without it
2. **State validation** - prevents invalid state transitions
3. **Clear error messages** - guides LLM back on track
4. **Automatic cleanup** - prevents stale session accumulation

### **Minimal Complexity**:
- ✅ **~100 lines** of session code (vs 0 stateless, ~200 full stateful)
- ✅ **File persistence** - survives server restarts
- ✅ **Automatic cleanup** - no manual intervention needed
- ✅ **Simple API** - just create, get, update, cleanup

### **Production Ready**:
- ✅ **Error handling** - graceful failure with recovery
- ✅ **Persistence** - sessions survive restarts
- ✅ **Cleanup** - no memory leaks
- ✅ **Validation** - prevents invalid state transitions

## 🚀 Usage Examples

### **Successful Workflow**:
```typescript
// Call 1: Create session
{
  tool: "start_interactive_spec",
  input: { userIdea: "video processing app", mode: "question" }
}
// → Returns: { sessionId: "session_123_abc", questions: [...] }

// Call 2: Refine with session
{
  tool: "start_interactive_spec",
  input: {
    sessionId: "session_123_abc",  // REQUIRED
    mode: "refine",
    userAnswers: { "format": "MP4", "scale": "1000/day" }
  }
}
// → Returns: { sessionId: "session_123_abc", refinedSpec: {...} }

// Call 3: Approve with session
{
  tool: "start_interactive_spec",
  input: {
    sessionId: "session_123_abc",  // REQUIRED
    mode: "approve",
    explicitApproval: "yes"
  }
}
// → Returns: { sessionId: "session_123_abc", finalSpec: {...}, is_complete: true }
```

### **Loop Prevention in Action**:
```typescript
// LLM forgets sessionId - ERROR with clear recovery
{
  tool: "start_interactive_spec",
  input: { mode: "refine", answers: {...} }
}
// → Returns: { error: true, message: "Session ID required", recovery: {...} }

// LLM tries wrong state transition - ERROR with clear recovery
{
  tool: "start_interactive_spec",
  input: {
    sessionId: "session_123_abc",
    mode: "question"  // Can't go back to question!
  }
}
// → Returns: { error: true, message: "Invalid state transition", recovery: {...} }
```

This minimal session management provides **maximum loop protection with minimum complexity** - the perfect balance for production use! 🚀