import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Terminal, Copy, Check, Download, Play, Shield, Database, X, Sparkles } from 'lucide-react';
import { autoGeneratePasscode, autoGenerateUsername } from '../utils/passcodeGenerator';

interface PythonHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PythonHubModal: React.FC<PythonHubModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'code' | 'runner' | 'api'>('code');
  const [simulatedOutput, setSimulatedOutput] = useState<string[]>([
    '$ python3 database.py --init',
    '[Python DB] Database schema initialized in database.sqlite3',
    '$ python3 database.py --list-profiles',
    '• Elena Rostova | Principal Systems Architect | Phone: +1 (415) 892-4910',
    '• Marcus Vance | Director of Global Operations | Phone: +44 20 7946 0831',
    '• Aria Chen | Lead Design Technologist | Phone: +81 3 5555 0192',
    '• David Okafor | Chief Field Intelligence Officer | Phone: +1 (202) 555-0143',
  ]);

  if (!isOpen) return null;

  const pythonCode = `#!/usr/bin/env python3
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

    conn.commit()
    conn.close()

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
    # Saves to SQLite access_passes table...
    return {"username": username, "passcode": passcode, "role": role}
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(pythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([pythonCode], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'database.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSimulatePass = () => {
    const user = autoGenerateUsername();
    const pass = autoGeneratePasscode();
    const timestamp = new Date().toISOString();
    setSimulatedOutput((prev) => [
      ...prev,
      `$ python3 database.py --generate-pass`,
      `[Python secrets] Generated Username : ${user}`,
      `[Python secrets] Generated Passcode : ${pass}`,
      `[SQLite] INSERT INTO access_passes (username='${user}', role='viewer', created_at='${timestamp}')`,
      `==========================================`,
      `>> ACCESS PASS READY FOR CLIENT LOGIN <<`,
      `==========================================`,
    ]);
  };

  return (
    <div
      id="python-hub-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[90vh] bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-white">
                  Python Database Engine & Scripts
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                  database.py active
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Standalone Python 3.10 engine with SQLite storage and cryptographic passcode auto-generation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Code'}</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download .py</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center px-6 pt-3 border-b border-slate-800/80 bg-slate-900/40 gap-4">
          <button
            type="button"
            onClick={() => setActiveTab('code')}
            className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'code'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Python Source Code (database.py)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('runner')}
            className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'runner'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Terminal Output & Generator
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('api')}
            className={`pb-3 text-xs font-medium border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'api'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            CLI & REST Endpoints
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 p-6 overflow-y-auto font-mono text-xs">
          {activeTab === 'code' && (
            <div className="relative">
              <pre className="p-4 bg-[#080d17] border border-slate-800/80 rounded-xl text-slate-300 leading-relaxed overflow-x-auto">
                <code>{pythonCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'runner' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div>
                  <span className="text-white font-sans text-sm font-medium block">
                    Interactive Auto-Passcode Python Simulation
                  </span>
                  <span className="text-slate-400 font-sans text-xs">
                    Simulates calling <code className="text-emerald-400">create_access_pass()</code> using Python's secrets library.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleSimulatePass}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-sans text-xs font-medium rounded-lg flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Execute Python Generator</span>
                </button>
              </div>

              <div className="p-4 bg-black/90 border border-slate-800 rounded-xl text-emerald-400 font-mono text-xs space-y-1 max-h-[350px] overflow-y-auto">
                {simulatedOutput.map((line, i) => (
                  <div key={i} className={line.startsWith('$') ? 'text-cyan-400 font-semibold mt-2' : line.startsWith('==') ? 'text-amber-400' : 'text-slate-300'}>
                    {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'api' && (
            <div className="space-y-4 font-sans text-xs">
              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2 font-sans">
                  CLI Terminal Commands
                </h3>
                <div className="space-y-2 font-mono">
                  <div className="p-2.5 bg-black/60 rounded-lg text-slate-300 flex items-center justify-between">
                    <code>python3 database.py --generate-pass</code>
                    <span className="text-slate-500 text-[11px] font-sans">Auto-generates Username & Passcode</span>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded-lg text-slate-300 flex items-center justify-between">
                    <code>python3 database.py --list-profiles</code>
                    <span className="text-slate-500 text-[11px] font-sans">Prints formatted profile records</span>
                  </div>
                  <div className="p-2.5 bg-black/60 rounded-lg text-slate-300 flex items-center justify-between">
                    <code>python3 database.py --serve</code>
                    <span className="text-slate-500 text-[11px] font-sans">Starts built-in REST API on port 8080</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 p-4 rounded-xl border border-slate-800">
                <h3 className="text-sm font-semibold text-white mb-2 font-sans">
                  Python HTTP REST Endpoints
                </h3>
                <div className="space-y-2 font-mono text-[11px]">
                  <div className="p-2 bg-black/60 rounded border border-slate-800 flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-200">/api/profiles</span>
                    <span className="text-slate-500 font-sans ml-auto">Returns all profiles with media & custom values</span>
                  </div>
                  <div className="p-2 bg-black/60 rounded border border-slate-800 flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 font-bold">POST</span>
                    <span className="text-slate-200">/api/generate-pass</span>
                    <span className="text-slate-500 font-sans ml-auto">Auto-generates new access credentials in SQLite</span>
                  </div>
                  <div className="p-2 bg-black/60 rounded border border-slate-800 flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">GET</span>
                    <span className="text-slate-200">/api/passes</span>
                    <span className="text-slate-500 font-sans ml-auto">Lists issued active access passes</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
