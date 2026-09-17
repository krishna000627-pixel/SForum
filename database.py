#!/usr/bin/env python3
"""
Profile Database Hub - Python Database Engine & Passcode Generator
Features:
- SQLite persistent storage with dynamic schema fields (JSON metadata)
- Auto-generation of secure usernames (e.g. AGENT-7492) and passcodes (e.g. 9K4M-7X2P)
- Profile management with photos, videos, phone, address, and dynamic custom fields
- Built-in HTTP REST API server using Python standard library (no pip packages needed)
"""

import sys
import os
import json
import sqlite3
import random
import secrets
from http.server import HTTPServer, BaseHTTPRequestHandler
from datetime import datetime

DB_FILE = "database.sqlite3"
PASS_CHARS = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"
PREFIXES = ["USER", "AGENT", "CLIENT", "MEMBER", "SECURE", "DEV", "ADMIN"]

def get_db():
    conn = sqlite3.connect(DB_FILE)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    conn = get_db()
    cursor = conn.cursor()

    # Profiles table
    cursor.execute("""
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
    )
    """)

    # Custom fields table
    cursor.execute("""
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
    )
    """)

    # Auto-generated Access Passes table
    cursor.execute("""
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
    )
    """)

    # Seed initial profiles if empty
    cursor.execute("SELECT COUNT(*) FROM profiles")
    if cursor.fetchone()[0] == 0:
        now = datetime.utcnow().isoformat() + "Z"
        sample_profiles = [
            ("prof_01", "Elena Rostova", "Principal Systems Architect", "Engineering", "+1 (415) 892-4910", "elena.rostova@nexusdb.internal",
             json.dumps({"street": "450 Townsend St", "city": "San Francisco", "state": "CA", "country": "United States", "postalCode": "94107"}),
             "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
             "Lead distributed systems architect specializing in high-throughput data pipelines and fault-tolerant infrastructure.",
             json.dumps(["https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=900&q=80"]),
             json.dumps(["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"]),
             json.dumps({"department": "Engineering", "clearance_level": "Tier 3 - Top Secret", "is_verified": True}), "active", now, now),
            ("prof_02", "Marcus Vance", "Director of Global Operations", "Operations", "+44 20 7946 0831", "marcus.vance@nexusdb.internal",
             json.dumps({"street": "10 St Mary Axe, Floor 18", "city": "London", "country": "United Kingdom", "postalCode": "EC3A 8EP"}),
             "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
             "Over 14 years directing international logistics and vendor compliance.",
             json.dumps(["https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=80"]),
             json.dumps(["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4"]),
             json.dumps({"department": "Operations", "clearance_level": "Tier 2 - Confidential", "is_verified": True}), "active", now, now),
            ("prof_03", "Aria Chen", "Lead Design Technologist", "Design", "+81 3 5555 0192", "aria.chen@nexusdb.internal",
             json.dumps({"street": "1-1-2 Roppongi, Minato-ku", "city": "Tokyo", "country": "Japan", "postalCode": "106-0032"}),
             "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=600&q=80",
             "Specializing in human-computer interfaces and responsive spatial data visualizations.",
             json.dumps(["https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=900&q=80"]),
             json.dumps(["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4"]),
             json.dumps({"department": "Design", "clearance_level": "Tier 2 - Confidential", "is_verified": True}), "active", now, now)
        ]
        cursor.executemany("""
        INSERT INTO profiles (id, full_name, role_title, category, phone, email, address_json, avatar_url, bio, photos_json, videos_json, custom_values_json, status, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, sample_profiles)

    conn.commit()
    conn.close()
    print("[Python DB] Database schema initialized in database.sqlite3")

def auto_generate_passcode():
    part1 = "".join(secrets.choice(PASS_CHARS) for _ in range(4))
    part2 = "".join(secrets.choice(PASS_CHARS) for _ in range(4))
    return f"{part1}-{part2}"

def auto_generate_username(prefix=None):
    if not prefix:
        prefix = secrets.choice(PREFIXES)
    digits = random.randint(1000, 9999)
    return f"{prefix}-{digits}"

def create_access_pass(role="viewer", label=None, prefix=None):
    username = auto_generate_username(prefix)
    passcode = auto_generate_passcode()
    pass_id = f"pass_{int(datetime.utcnow().timestamp())}_{secrets.token_hex(3)}"
    now = datetime.utcnow().isoformat() + "Z"
    lbl = label or f"Auto-Generated Pass ({username})"

    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("""
    INSERT INTO access_passes (id, username, passcode, role, label, usage_count, is_active, created_at)
    VALUES (?, ?, ?, ?, ?, 0, 1, ?)
    """, (pass_id, username, passcode, role, lbl, now))
    conn.commit()
    conn.close()

    print("\n==========================================")
    print("  NEW AUTO-GENERATED ACCESS PASS CREATED  ")
    print("==========================================")
    print(f" Username : {username}")
    print(f" Passcode : {passcode}")
    print(f" Role     : {role}")
    print(f" Label    : {lbl}")
    print(f" Created  : {now}")
    print("==========================================\n")
    return {"username": username, "passcode": passcode, "role": role}

def list_access_passes():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT username, passcode, role, label, is_active, usage_count, created_at FROM access_passes ORDER BY created_at DESC")
    rows = cursor.fetchall()
    conn.close()

    print("\n--- ACTIVE ACCESS PASSES ---")
    for r in rows:
        status = "ACTIVE" if r["is_active"] else "REVOKED"
        print(f"[{status}] User: {r['username']:<12} Pass: {r['passcode']:<10} Role: {r['role']:<7} Uses: {r['usage_count']} ({r['label']})")
    print("----------------------------\n")

def list_profiles():
    conn = get_db()
    cursor = conn.cursor()
    cursor.execute("SELECT id, full_name, role_title, phone, email, address_json, custom_values_json FROM profiles")
    rows = cursor.fetchall()
    conn.close()

    print("\n--- PROFILES DIRECTORY ---")
    for r in rows:
        addr = json.loads(r["address_json"]) if r["address_json"] else {}
        city_country = f"{addr.get('city', '')}, {addr.get('country', '')}".strip(", ")
        print(f"• {r['full_name']} | {r['role_title']} | Phone: {r['phone']} | Loc: {city_country}")
    print("--------------------------\n")

# Built-in REST API Server
class APIServerHandler(BaseHTTPRequestHandler):
    def _send_json(self, data, status=200):
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Authorization, X-API-Key, X-API-Username")
        self.end_headers()
        self.wfile.write(json.dumps(data, indent=2).encode("utf-8"))

    def do_OPTIONS(self):
        self._send_json({"status": "ok"})

    def _get_auth_info(self):
        auth_header = self.headers.get("Authorization", "")
        api_key = self.headers.get("X-API-Key", "")
        username = self.headers.get("X-API-Username", "anonymous")
        if auth_header.startswith("Bearer "):
            api_key = auth_header.replace("Bearer ", "").strip()
        return username, api_key

    def do_GET(self):
        username, api_key = self._get_auth_info()

        if self.path == "/api/health":
            conn = get_db()
            c = conn.cursor()
            c.execute("SELECT COUNT(*) FROM profiles")
            p_count = c.fetchone()[0]
            c.execute("SELECT COUNT(*) FROM access_passes WHERE is_active = 1")
            pass_count = c.fetchone()[0]
            conn.close()
            self._send_json({
                "status": "healthy",
                "service": "Python Profile SQLite DB",
                "authenticated_user": username,
                "profiles_count": p_count,
                "active_passes": pass_count,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            })
        elif self.path == "/api/passes":
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT id, username, passcode, role, label, is_active, usage_count, created_at FROM access_passes")
            passes = [dict(r) for r in cursor.fetchall()]
            conn.close()
            self._send_json({"passes": passes})
        elif self.path.startswith("/api/profiles"):
            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM profiles ORDER BY created_at DESC")
            profiles = []
            for row in cursor.fetchall():
                p = dict(row)
                p["address"] = json.loads(p.get("address_json") or "{}")
                p["photos"] = json.loads(p.get("photos_json") or "[]")
                p["videos"] = json.loads(p.get("videos_json") or "[]")
                p["customValues"] = json.loads(p.get("custom_values_json") or "{}")
                profiles.append(p)
            conn.close()
            self._send_json({"profiles": profiles, "count": len(profiles)})
        else:
            self._send_json({"error": "Not Found"}, status=404)

    def do_POST(self):
        username, api_key = self._get_auth_info()
        length = int(self.headers.get("Content-Length", 0))
        body = json.loads(self.rfile.read(length).decode("utf-8")) if length > 0 else {}

        if self.path == "/api/generate-pass":
            new_pass = create_access_pass(
                role=body.get("role", "viewer"),
                label=body.get("label"),
                prefix=body.get("prefix")
            )
            self._send_json({"success": True, "pass": new_pass})

        elif self.path == "/api/profiles":
            # Push profile from Web Form / External System
            now = datetime.utcnow().isoformat() + "Z"
            profile_id = body.get("id") or f"prof_{int(datetime.utcnow().timestamp() * 1000)}"
            full_name = body.get("fullName", "").strip()
            if not full_name:
                self._send_json({"error": "fullName is required"}, status=400)
                return

            role_title = body.get("roleTitle", "Team Member")
            category = body.get("category", "General")
            phone = body.get("phone", "")
            email = body.get("email", "")
            address_json = json.dumps(body.get("address") or {})
            avatar_url = body.get("avatarUrl", "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=400&q=80")
            bio = body.get("bio", "")
            photos_json = json.dumps(body.get("photos") or [])
            videos_json = json.dumps(body.get("videos") or [])
            custom_values_json = json.dumps(body.get("customValues") or {})
            status = body.get("status", "active")

            conn = get_db()
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO profiles 
            (id, full_name, role_title, category, phone, email, address_json, avatar_url, bio, photos_json, videos_json, custom_values_json, status, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                profile_id, full_name, role_title, category, phone, email,
                address_json, avatar_url, bio, photos_json, videos_json,
                custom_values_json, status, body.get("createdAt", now), now
            ))
            conn.commit()
            conn.close()

            self._send_json({
                "success": True,
                "message": "Profile recorded successfully into SQLite database",
                "profile_id": profile_id,
                "recorded_by": username
            }, status=201)

        else:
            self._send_json({"error": "Endpoint not supported"}, status=404)

def run_server(port=8080):
    init_db()
    server_address = ("0.0.0.0", port)
    httpd = HTTPServer(server_address, APIServerHandler)
    print(f"[Python HTTP API] Running server at http://0.0.0.0:{port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        print("\n[Python HTTP API] Server stopped.")

if __name__ == "__main__":
    init_db()
    args = sys.argv[1:]
    if not args or "--help" in args:
        print("Usage:")
        print("  python database.py --init             # Initialize database")
        print("  python database.py --generate-pass    # Auto-generate new access pass")
        print("  python database.py --list-passes      # List all active access passes")
        print("  python database.py --list-profiles    # List all profiles")
        print("  python database.py --serve            # Start Python REST API server")
    elif "--init" in args:
        print("Database ready.")
    elif "--generate-pass" in args:
        create_access_pass()
    elif "--list-passes" in args:
        list_access_passes()
    elif "--list-profiles" in args:
        list_profiles()
    elif "--serve" in args:
        run_server()
