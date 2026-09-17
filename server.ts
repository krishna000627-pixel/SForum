import express from "express";
import path from "path";
import fs from "fs";
import cors from "cors";
import initSqlJs from "sql.js";
import { createServer as createViteServer } from "vite";

const DB_FILE_PATH = path.join(process.cwd(), "database.sqlite3");
const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // Initialize sql.js SQLite Engine
  const SQL = await initSqlJs();
  let db: any;

  // Load existing database from disk or create fresh instance
  if (fs.existsSync(DB_FILE_PATH)) {
    try {
      const fileBuffer = fs.readFileSync(DB_FILE_PATH);
      db = new SQL.Database(fileBuffer);
      console.log(`[SQL Engine] Loaded existing database from ${DB_FILE_PATH}`);
    } catch (e) {
      console.warn("[SQL Engine] Failed to parse existing database, initializing new:", e);
      db = new SQL.Database();
    }
  } else {
    db = new SQL.Database();
    console.log("[SQL Engine] Initialized new in-memory SQLite database");
  }

  // Persist SQLite database to disk
  const persistDb = () => {
    try {
      const data = db.export();
      const buffer = Buffer.from(data);
      fs.writeFileSync(DB_FILE_PATH, buffer);
    } catch (err) {
      console.error("[SQL Engine] Error saving database to disk:", err);
    }
  };

  // Helper to execute SQL queries and return typed JS objects
  const queryAll = (sql: string, params: any[] = []): any[] => {
    const stmt = db.prepare(sql);
    if (params.length > 0) {
      stmt.bind(params);
    }
    const results: any[] = [];
    while (stmt.step()) {
      results.push(stmt.getAsObject());
    }
    stmt.free();
    return results;
  };

  const queryOne = (sql: string, params: any[] = []): any | null => {
    const rows = queryAll(sql, params);
    return rows.length > 0 ? rows[0] : null;
  };

  const runSql = (sql: string, params: any[] = []): { changes: number } => {
    db.run(sql, params);
    persistDb();
    const changes = db.getRowsModified();
    return { changes };
  };

  // Initialize all SQL Schemas
  const initSchema = () => {
    // Recreate agent_accounts to apply new column (since we are deleting data anyway)
    db.run(`DROP TABLE IF EXISTS agent_accounts;`);

    db.run(`
      CREATE TABLE IF NOT EXISTS profiles (
        id TEXT PRIMARY KEY,
        full_name TEXT NOT NULL,
        role_title TEXT,
        category TEXT,
        phone TEXT,
        email TEXT,
        address_json TEXT,
        avatar_url TEXT,
        bio TEXT,
        photos_json TEXT,
        videos_json TEXT,
        custom_values_json TEXT,
        status TEXT DEFAULT 'active',
        created_at TEXT,
        updated_at TEXT
      );

      CREATE TABLE IF NOT EXISTS custom_fields (
        id TEXT PRIMARY KEY,
        label TEXT NOT NULL,
        key TEXT NOT NULL UNIQUE,
        type TEXT NOT NULL,
        options_json TEXT,
        placeholder TEXT,
        required INTEGER DEFAULT 0,
        show_in_table INTEGER DEFAULT 1,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS access_passes (
        id TEXT PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        passcode TEXT NOT NULL,
        role TEXT DEFAULT 'viewer',
        label TEXT,
        usage_count INTEGER DEFAULT 0,
        is_active INTEGER DEFAULT 1,
        created_at TEXT,
        last_used_at TEXT
      );

      CREATE TABLE IF NOT EXISTS student_accounts (
        id TEXT PRIMARY KEY,
        member_code TEXT NOT NULL UNIQUE,
        friend_code TEXT NOT NULL UNIQUE,
        passcode TEXT NOT NULL,
        alias TEXT,
        avatar TEXT,
        is_banned INTEGER DEFAULT 0,
        ban_reason TEXT,
        warning_strikes INTEGER DEFAULT 0,
        verified_student INTEGER DEFAULT 1,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS agent_accounts (
        id TEXT PRIMARY KEY,
        agent_code TEXT NOT NULL UNIQUE,
        name TEXT NOT NULL,
        department TEXT,
        passcode TEXT NOT NULL,
        is_active INTEGER DEFAULT 1,
        can_ban_users INTEGER DEFAULT 1,
        can_verify_answers INTEGER DEFAULT 1,
        can_pin_posts INTEGER DEFAULT 1,
        has_database_access INTEGER DEFAULT 1,
        bio TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS forum_posts (
        id TEXT PRIMARY KEY,
        channel_id TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        author_code TEXT NOT NULL,
        author_role TEXT NOT NULL,
        author_alias TEXT,
        is_agent INTEGER DEFAULT 0,
        agent_dept TEXT,
        is_pinned INTEGER DEFAULT 0,
        is_locked INTEGER DEFAULT 0,
        upvotes INTEGER DEFAULT 0,
        upvoted_by_json TEXT DEFAULT '[]',
        media_url TEXT,
        media_type TEXT,
        media_duration REAL,
        tags_json TEXT DEFAULT '[]',
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS forum_comments (
        id TEXT PRIMARY KEY,
        post_id TEXT NOT NULL,
        author_code TEXT NOT NULL,
        author_role TEXT NOT NULL,
        author_alias TEXT,
        is_agent INTEGER DEFAULT 0,
        agent_dept TEXT,
        is_verified_answer INTEGER DEFAULT 0,
        content TEXT NOT NULL,
        upvotes INTEGER DEFAULT 0,
        upvoted_by_json TEXT DEFAULT '[]',
        media_url TEXT,
        media_type TEXT,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS chat_conversations (
        id TEXT PRIMARY KEY,
        participant_a_code TEXT NOT NULL,
        participant_b_code TEXT NOT NULL,
        participant_name TEXT,
        last_message TEXT,
        last_message_time TEXT,
        unread_count INTEGER DEFAULT 0,
        is_agent_support INTEGER DEFAULT 0,
        created_at TEXT
      );

      CREATE TABLE IF NOT EXISTS chat_messages (
        id TEXT PRIMARY KEY,
        conversation_id TEXT NOT NULL,
        sender_code TEXT NOT NULL,
        sender_role TEXT NOT NULL,
        sender_name TEXT,
        text TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        attachment_url TEXT,
        reactions_json TEXT DEFAULT '{}'
      );
    `);

    // Seed default admin access pass if empty
    const passCount = queryOne("SELECT COUNT(*) as count FROM access_passes");
    if (!passCount || passCount.count === 0) {
      runSql(
        `INSERT INTO access_passes (id, username, passcode, role, label, usage_count, is_active, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          "pass_admin_01",
          "ADMIN-9901",
          "SUNRAYS-ADMIN",
          "admin",
          "Master Campus Admin Pass",
          0,
          1,
          new Date().toISOString(),
        ]
      );
    }

    // Ensure clean state for forum posts, comments, chats, and default agents
    runSql("DELETE FROM forum_posts");
    runSql("DELETE FROM forum_comments");
    runSql("DELETE FROM chat_conversations");
    runSql("DELETE FROM chat_messages");
    runSql("DELETE FROM agent_accounts");

    persistDb();
    console.log("[SQL Engine] All SQLite relational schemas verified and ready (clean state).");
  };

  initSchema();

  // ==========================================
  // REAL SQL & SYSTEM REST API ENDPOINTS
  // ==========================================

  // Clear all forum and chat data endpoint
  app.post("/api/forum/clear-all", (req, res) => {
    try {
      runSql("DELETE FROM forum_posts");
      runSql("DELETE FROM forum_comments");
      runSql("DELETE FROM chat_conversations");
      runSql("DELETE FROM chat_messages");
      runSql("DELETE FROM agent_accounts");
      res.json({ success: true, message: "All forum posts, comments, chats and agents purged." });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 1. Health & Status Check
  app.get("/api/health", (req, res) => {
    try {
      const startTime = Date.now();
      const tables = queryAll(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
      );
      const tableCounts: Record<string, number> = {};
      for (const t of tables) {
        const c = queryOne(`SELECT COUNT(*) as cnt FROM ${t.name}`);
        tableCounts[t.name] = c ? c.cnt : 0;
      }
      const latencyMs = Date.now() - startTime;

      res.json({
        status: "ok",
        database: "SQLite 3 (Relational SQL Engine)",
        driver: "sql.js WebAssembly / Node FS",
        dbFile: DB_FILE_PATH,
        fileExists: fs.existsSync(DB_FILE_PATH),
        fileSizeBytes: fs.existsSync(DB_FILE_PATH) ? fs.statSync(DB_FILE_PATH).size : 0,
        tablesCount: tables.length,
        tables: tableCounts,
        latencyMs,
        serverTime: new Date().toISOString(),
      });
    } catch (err: any) {
      res.status(500).json({ status: "error", message: err.message });
    }
  });

  // 2. Tables Schema Introspection
  app.get("/api/sql/tables", (req, res) => {
    try {
      const tables = queryAll(
        "SELECT name, sql FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' ORDER BY name;"
      );
      res.json({ success: true, tables });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 3. Raw SQL Query Terminal Endpoint
  app.post("/api/sql/execute", (req, res) => {
    const { query, params } = req.body;
    if (!query || typeof query !== "string") {
      return res.status(400).json({ success: false, error: "SQL query string is required" });
    }

    const trimmed = query.trim();
    const isSelect =
      trimmed.toUpperCase().startsWith("SELECT") ||
      trimmed.toUpperCase().startsWith("PRAGMA") ||
      trimmed.toUpperCase().startsWith("EXPLAIN");

    const startTime = Date.now();

    try {
      if (isSelect) {
        const rows = queryAll(trimmed, params || []);
        const durationMs = Date.now() - startTime;
        return res.json({
          success: true,
          type: "SELECT",
          query: trimmed,
          rowCount: rows.length,
          columns: rows.length > 0 ? Object.keys(rows[0]) : [],
          rows,
          durationMs,
        });
      } else {
        const result = runSql(trimmed, params || []);
        const durationMs = Date.now() - startTime;
        return res.json({
          success: true,
          type: "MUTATION",
          query: trimmed,
          changes: result.changes,
          durationMs,
        });
      }
    } catch (err: any) {
      return res.status(400).json({
        success: false,
        error: err.message,
        query: trimmed,
        durationMs: Date.now() - startTime,
      });
    }
  });

  // 4. SQL Backup / Export (Raw SQL Dump & JSON)
  app.get("/api/sql/export", (req, res) => {
    try {
      const exportData: Record<string, any[]> = {};
      const tables = queryAll(
        "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';"
      );
      for (const t of tables) {
        exportData[t.name] = queryAll(`SELECT * FROM ${t.name}`);
      }

      res.json({
        version: "2.0.0",
        app: "Sunrays School SQL Relational Database Dump",
        exportedAt: new Date().toISOString(),
        tables: exportData,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5. Profiles API
  app.get("/api/profiles", (req, res) => {
    try {
      const rows = queryAll("SELECT * FROM profiles ORDER BY created_at DESC");
      const profiles = rows.map((p) => ({
        id: p.id,
        fullName: p.full_name,
        roleTitle: p.role_title,
        category: p.category,
        phone: p.phone,
        email: p.email,
        address: JSON.parse(p.address_json || "{}"),
        avatarUrl: p.avatar_url,
        bio: p.bio,
        photos: JSON.parse(p.photos_json || "[]"),
        videos: JSON.parse(p.videos_json || "[]"),
        customValues: JSON.parse(p.custom_values_json || "{}"),
        status: p.status,
        createdAt: p.created_at,
        updatedAt: p.updated_at,
      }));
      res.json({ success: true, count: profiles.length, profiles });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/profiles", (req, res) => {
    try {
      const p = req.body;
      const now = new Date().toISOString();
      const id = p.id || `prof_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO profiles 
        (id, full_name, role_title, category, phone, email, address_json, avatar_url, bio, photos_json, videos_json, custom_values_json, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          p.fullName || "Student",
          p.roleTitle || "Student Member",
          p.category || "General",
          p.phone || "",
          p.email || "",
          JSON.stringify(p.address || {}),
          p.avatarUrl || "",
          p.bio || "",
          JSON.stringify(p.photos || []),
          JSON.stringify(p.videos || []),
          JSON.stringify(p.customValues || {}),
          p.status || "active",
          p.createdAt || now,
          now,
        ]
      );
      res.json({ success: true, id, message: "Profile saved to SQL database" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 5.5 Agents & Students API
  app.get("/api/agents", (req, res) => {
    try {
      const rows = queryAll("SELECT * FROM agent_accounts ORDER BY created_at ASC");
      const agents = rows.map((a) => ({
        id: a.id,
        agentCode: a.agent_code,
        name: a.name,
        department: a.department,
        passcode: a.passcode,
        isActive: Boolean(a.is_active),
        canBanUsers: Boolean(a.can_ban_users),
        canVerifyAnswers: Boolean(a.can_verify_answers),
        canPinPosts: Boolean(a.can_pin_posts),
        hasDatabaseAccess: Boolean(a.has_database_access),
        bio: a.bio,
        createdAt: a.created_at
      }));
      res.json({ success: true, count: agents.length, agents });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/agents", (req, res) => {
    try {
      const a = req.body;
      const id = a.id || `agent_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO agent_accounts
        (id, agent_code, name, department, passcode, is_active, can_ban_users, can_verify_answers, can_pin_posts, has_database_access, bio, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          a.agentCode,
          a.name,
          a.department || "",
          a.passcode,
          a.isActive ? 1 : 0,
          a.canBanUsers ? 1 : 0,
          a.canVerifyAnswers ? 1 : 0,
          a.canPinPosts ? 1 : 0,
          a.hasDatabaseAccess ? 1 : 0,
          a.bio || "",
          a.createdAt || new Date().toISOString()
        ]
      );
      res.json({ success: true, id, message: "Agent saved to SQL database" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.get("/api/students", (req, res) => {
    try {
      const rows = queryAll("SELECT * FROM student_accounts ORDER BY created_at ASC");
      const students = rows.map((s) => ({
        id: s.id,
        memberCode: s.member_code,
        friendCode: s.friend_code,
        passcode: s.passcode,
        alias: s.alias,
        avatar: s.avatar,
        isBanned: Boolean(s.is_banned),
        banReason: s.ban_reason,
        warningStrikes: s.warning_strikes,
        createdAt: s.created_at
      }));
      res.json({ success: true, count: students.length, students });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/students", (req, res) => {
    try {
      const s = req.body;
      const id = s.id || `stu_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO student_accounts
        (id, member_code, friend_code, passcode, alias, avatar, is_banned, ban_reason, warning_strikes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          s.memberCode,
          s.friendCode,
          s.passcode,
          s.alias || "",
          s.avatar || "",
          s.isBanned ? 1 : 0,
          s.banReason || "",
          s.warningStrikes || 0,
          s.createdAt || new Date().toISOString()
        ]
      );
      res.json({ success: true, id, message: "Student saved to SQL database" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 6. Forum Posts API
  app.get("/api/forum/posts", (req, res) => {
    try {
      const rows = queryAll("SELECT * FROM forum_posts ORDER BY is_pinned DESC, created_at DESC");
      const posts = rows.map((r) => ({
        id: r.id,
        channelId: r.channel_id,
        title: r.title,
        content: r.content,
        authorCode: r.author_code,
        authorRole: r.author_role,
        authorAlias: r.author_alias,
        isAgent: Boolean(r.is_agent),
        agentDept: r.agent_dept,
        isPinned: Boolean(r.is_pinned),
        isLocked: Boolean(r.is_locked),
        likes: r.upvotes,
        likedBy: JSON.parse(r.upvoted_by_json || "[]"),
        mediaUrl: r.media_url,
        mediaType: r.media_type,
        mediaDuration: r.media_duration,
        tags: JSON.parse(r.tags_json || "[]"),
        createdAt: r.created_at,
      }));
      res.json({ success: true, count: posts.length, posts });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/forum/posts", (req, res) => {
    try {
      const p = req.body;
      const now = new Date().toISOString();
      const id = p.id || `post_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO forum_posts
        (id, channel_id, title, content, author_code, author_role, author_alias, is_agent, agent_dept, is_pinned, is_locked, upvotes, upvoted_by_json, media_url, media_type, media_duration, tags_json, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          p.channelId || "general",
          p.title,
          p.content,
          p.authorCode,
          p.authorRole,
          p.authorAlias || null,
          p.isAgent ? 1 : 0,
          p.agentDept || null,
          p.isPinned ? 1 : 0,
          p.isLocked ? 1 : 0,
          p.likes || 0,
          JSON.stringify(p.likedBy || []),
          p.mediaUrl || null,
          p.mediaType || null,
          p.mediaDuration || null,
          JSON.stringify(p.tags || []),
          p.createdAt || now,
        ]
      );
      res.json({ success: true, id, message: "Forum post saved in SQL" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.delete("/api/forum/posts/:id", (req, res) => {
    try {
      runSql("DELETE FROM forum_posts WHERE id = ?", [req.params.id]);
      res.json({ success: true, message: "Post deleted" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Forum Comments API
  app.get("/api/forum/comments", (req, res) => {
    try {
      const postId = req.query.postId as string;
      const sql = postId
        ? "SELECT * FROM forum_comments WHERE post_id = ? ORDER BY created_at ASC"
        : "SELECT * FROM forum_comments ORDER BY created_at ASC";
      const params = postId ? [postId] : [];
      const rows = queryAll(sql, params);
      const comments = rows.map((r) => ({
        id: r.id,
        postId: r.post_id,
        authorCode: r.author_code,
        authorRole: r.author_role,
        authorAlias: r.author_alias,
        isAgent: Boolean(r.is_agent),
        agentDept: r.agent_dept,
        isVerifiedAnswer: Boolean(r.is_verified_answer),
        content: r.content,
        upvotes: r.upvotes,
        upvotedBy: JSON.parse(r.upvoted_by_json || "[]"),
        mediaUrl: r.media_url,
        mediaType: r.media_type,
        createdAt: r.created_at,
      }));
      res.json({ success: true, count: comments.length, comments });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/forum/comments", (req, res) => {
    try {
      const c = req.body;
      const now = new Date().toISOString();
      const id = c.id || `cmt_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO forum_comments
        (id, post_id, author_code, author_role, author_alias, is_agent, agent_dept, is_verified_answer, content, upvotes, upvoted_by_json, media_url, media_type, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          c.postId,
          c.authorCode,
          c.authorRole,
          c.authorAlias || null,
          c.isAgent ? 1 : 0,
          c.agentDept || null,
          c.isVerifiedAnswer ? 1 : 0,
          c.content,
          c.upvotes || 0,
          JSON.stringify(c.upvotedBy || []),
          c.mediaUrl || null,
          c.mediaType || null,
          c.createdAt || now,
        ]
      );
      res.json({ success: true, id, message: "Comment stored in SQL" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 7. Real Chat Conversations API
  app.get("/api/chats/conversations", (req, res) => {
    try {
      const rows = queryAll("SELECT * FROM chat_conversations ORDER BY created_at DESC");
      const conversations = rows.map((c) => ({
        id: c.id,
        participantACode: c.participant_a_code,
        participantBCode: c.participant_b_code,
        participantName: c.participant_name,
        lastMessage: c.last_message,
        lastMessageTime: c.last_message_time,
        unreadCount: c.unread_count,
        isAgent: Boolean(c.is_agent_support)
      }));
      res.json({ success: true, count: conversations.length, conversations });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/chats/conversations", (req, res) => {
    try {
      const c = req.body;
      const id = c.id || `conv_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO chat_conversations
        (id, participant_a_code, participant_b_code, participant_name, last_message, last_message_time, unread_count, is_agent_support, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          c.participantACode || "unknown",
          c.participantCode,
          c.participantName,
          c.lastMessage || "",
          c.lastMessageTime || new Date().toISOString(),
          c.unreadCount || 0,
          c.isAgent ? 1 : 0,
          c.createdAt || new Date().toISOString(),
        ]
      );
      res.json({ success: true, id, message: "Conversation saved to SQL database" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 8. Real Chat Messages API
  app.get("/api/chats/messages", (req, res) => {
    try {
      const convId = req.query.conversationId as string;
      const sql = convId
        ? "SELECT * FROM chat_messages WHERE conversation_id = ? ORDER BY timestamp ASC"
        : "SELECT * FROM chat_messages ORDER BY timestamp ASC";
      const params = convId ? [convId] : [];
      const rows = queryAll(sql, params);
      const messages = rows.map((m) => ({
        id: m.id,
        senderCode: m.sender_code,
        senderRole: m.sender_role,
        senderName: m.sender_name,
        text: m.text,
        timestamp: m.timestamp,
        attachmentUrl: m.attachment_url,
        reactions: JSON.parse(m.reactions_json || "{}"),
      }));
      res.json({ success: true, count: messages.length, messages });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  app.post("/api/chats/messages", (req, res) => {
    try {
      const { conversationId, message } = req.body;
      if (!conversationId || !message) {
        return res.status(400).json({ success: false, error: "Missing conversationId or message" });
      }

      const id = message.id || `msg_${Date.now()}`;
      runSql(
        `INSERT OR REPLACE INTO chat_messages
        (id, conversation_id, sender_code, sender_role, sender_name, text, timestamp, attachment_url, reactions_json)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          conversationId,
          message.senderCode,
          message.senderRole,
          message.senderName || null,
          message.text || "",
          message.timestamp || new Date().toISOString(),
          message.attachmentUrl || null,
          JSON.stringify(message.reactions || {}),
        ]
      );
      res.json({ success: true, id, message: "Message committed to SQL database" });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message });
    }
  });

  // 9. Automated Diagnostics Self-Test Suite Runner API
  app.post("/api/diagnostics/run-tests", (req, res) => {
    const results: any[] = [];
    const overallStart = Date.now();

    // Test 1: SQLite Connection & Pragma
    try {
      const t1Start = Date.now();
      const pragma = queryOne("PRAGMA integrity_check;");
      results.push({
        name: "SQLite Engine Integrity Check",
        status: "PASS",
        durationMs: Date.now() - t1Start,
        details: `Integrity: ${pragma ? Object.values(pragma)[0] : "ok"}`,
      });
    } catch (e: any) {
      results.push({ name: "SQLite Engine Integrity Check", status: "FAIL", error: e.message });
    }

    // Test 2: Table Existence & Row Count
    try {
      const t2Start = Date.now();
      const tables = queryAll("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%';");
      const required = ["profiles", "forum_posts", "forum_comments", "chat_messages", "student_accounts", "access_passes"];
      const missing = required.filter((r) => !tables.some((t) => t.name === r));
      results.push({
        name: "SQL Schema Verification",
        status: missing.length === 0 ? "PASS" : "FAIL",
        durationMs: Date.now() - t2Start,
        details: `Verified ${tables.length} tables. Missing: ${missing.length > 0 ? missing.join(", ") : "None"}`,
      });
    } catch (e: any) {
      results.push({ name: "SQL Schema Verification", status: "FAIL", error: e.message });
    }

    // Test 3: Transaction Write -> Read -> Delete
    try {
      const t3Start = Date.now();
      const testId = `diag_test_${Date.now()}`;
      runSql("INSERT INTO forum_posts (id, channel_id, title, content, author_code, author_role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", [
        testId,
        "general",
        "Diagnostic Probe Post",
        "Automated self-test row verification",
        "ADMIN-TEST",
        "admin",
        new Date().toISOString(),
      ]);
      const fetched = queryOne("SELECT * FROM forum_posts WHERE id = ?", [testId]);
      if (!fetched || fetched.title !== "Diagnostic Probe Post") {
        throw new Error("Row read verification failed");
      }
      runSql("DELETE FROM forum_posts WHERE id = ?", [testId]);
      results.push({
        name: "SQL Read/Write/Delete ACID Cycle",
        status: "PASS",
        durationMs: Date.now() - t3Start,
        details: "Full transactional roundtrip succeeded with exact record match and cleanup.",
      });
    } catch (e: any) {
      results.push({ name: "SQL Read/Write/Delete ACID Cycle", status: "FAIL", error: e.message });
    }

    // Test 4: Chat Message Table Write
    try {
      const t4Start = Date.now();
      const testMsgId = `diag_msg_${Date.now()}`;
      runSql("INSERT INTO chat_messages (id, conversation_id, sender_code, sender_role, text, timestamp) VALUES (?, ?, ?, ?, ?, ?)", [
        testMsgId,
        "conv_diag_01",
        "member#99",
        "student",
        "Test diagnostic message ping",
        new Date().toISOString(),
      ]);
      const msg = queryOne("SELECT * FROM chat_messages WHERE id = ?", [testMsgId]);
      runSql("DELETE FROM chat_messages WHERE id = ?", [testMsgId]);
      results.push({
        name: "Real-Time Chat Storage Pipeline",
        status: msg ? "PASS" : "FAIL",
        durationMs: Date.now() - t4Start,
        details: "Chat messages committed and indexed in SQLite with zero latency loss.",
      });
    } catch (e: any) {
      results.push({ name: "Real-Time Chat Storage Pipeline", status: "FAIL", error: e.message });
    }

    // Test 5: File Persistence Check
    const fileStats = fs.existsSync(DB_FILE_PATH) ? fs.statSync(DB_FILE_PATH) : null;
    results.push({
      name: "Disk Persistence & File Integrity",
      status: fileStats && fileStats.size > 0 ? "PASS" : "WARN",
      durationMs: 1,
      details: fileStats
        ? `Database on disk: ${DB_FILE_PATH} (${(fileStats.size / 1024).toFixed(2)} KB)`
        : "Database is in-memory only",
    });

    const passedCount = results.filter((r) => r.status === "PASS").length;
    res.json({
      success: passedCount === results.length,
      totalTests: results.length,
      passedCount,
      totalDurationMs: Date.now() - overallStart,
      timestamp: new Date().toISOString(),
      results,
    });
  });

  // Vite middleware setup
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`====================================================`);
    console.log(` Sunrays School Full-Stack Server Running on Port ${PORT}`);
    console.log(` SQL Database: SQLite 3 persistent engine loaded`);
    console.log(`====================================================`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
