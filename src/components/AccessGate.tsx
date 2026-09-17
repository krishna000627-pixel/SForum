import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GraduationCap, 
  ShieldCheck, 
  KeyRound, 
  Sparkles, 
  ArrowRight, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  Lock,
  MessageSquare,
  ShieldAlert
} from 'lucide-react';
import { StudentAccount, AgentAccount, UserRole } from '../types';

interface AccessGateProps {
  students: StudentAccount[];
  agents: AgentAccount[];
  adminPin: string;
  onLoginSuccess: (params: {
    role: UserRole;
    studentAccount?: StudentAccount;
    agentAccount?: AgentAccount;
  }) => void;
  onGenerateStudentCode: () => { newStudent: StudentAccount; allStudents: StudentAccount[] };
}

export const AccessGate: React.FC<AccessGateProps> = ({
  students,
  agents,
  adminPin,
  onLoginSuccess,
  onGenerateStudentCode,
}) => {
  // Login Tab: Student | Agent | Admin
  const [activeTab, setActiveTab] = useState<'student' | 'agent' | 'admin'>('student');

  // Student Form State
  const [studentCode, setStudentCode] = useState('');
  const [studentPasscode, setStudentPasscode] = useState('');

  // Agent Form State
  const [agentCode, setAgentCode] = useState('');
  const [agentPasscode, setAgentPasscode] = useState('');

  // Admin Form State
  const [adminPinInput, setAdminPinInput] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [newlyCreatedStudent, setNewlyCreatedStudent] = useState<StudentAccount | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle Generate New Anonymous Student Code Pair
  const handleGenerateStudent = () => {
    setError(null);
    const { newStudent } = onGenerateStudentCode();
    setNewlyCreatedStudent(newStudent);
    setStudentCode(newStudent.memberCode);
    setStudentPasscode(newStudent.passcode);
    setSuccessMsg(`Generated anonymous identity: ${newStudent.memberCode}! Your secret pass is ${newStudent.passcode}. Save it to log in anytime.`);
  };

  // Copy credentials to clipboard
  const handleCopyNewCredentials = () => {
    if (!newlyCreatedStudent) return;
    const text = `School Forum Anonymous Login\nMember Code: ${newlyCreatedStudent.memberCode}\nPasscode: ${newlyCreatedStudent.passcode}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Submit Student Login
  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = studentCode.trim().toLowerCase();
    const cleanPass = studentPasscode.trim().toUpperCase();

    if (!cleanCode || !cleanPass) {
      setError('Please enter your Anonymous Member Code (e.g. member#01) and Passcode.');
      return;
    }

    const matched = students.find(
      (s) =>
        s.memberCode.toLowerCase() === cleanCode &&
        s.passcode.toUpperCase() === cleanPass
    );

    if (!matched) {
      setError('Invalid Member Code or Passcode. Check your code pair or generate a new anonymous identity below.');
      return;
    }

    setSuccessMsg(`Access granted! Entering School Forum as ${matched.memberCode} (Anonymous)...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'student',
        studentAccount: matched,
      });
    }, 600);
  };

  // Submit Agent Login
  const handleAgentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = agentCode.trim().toLowerCase();
    const cleanPass = agentPasscode.trim().toUpperCase();

    if (!cleanCode || !cleanPass) {
      setError('Please enter your Agent ID (e.g. Agent#01) and Agent Passcode.');
      return;
    }

    const matched = agents.find(
      (a) =>
        a.agentCode.toLowerCase() === cleanCode &&
        a.passcode.toUpperCase() === cleanPass
    );

    if (!matched) {
      setError('Invalid Agent ID or Passcode. Contact School Admin if your credentials were changed.');
      return;
    }

    if (!matched.isActive) {
      setError('This Agent account is currently inactive. Please contact the administrator.');
      return;
    }

    setSuccessMsg(`Welcome, ${matched.name}! Launching Agent Portal...`);
    setTimeout(() => {
      onLoginSuccess({
        role: 'agent',
        agentAccount: matched,
      });
    }, 600);
  };

  // Submit Admin Login
  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (adminPinInput.trim() === adminPin.trim()) {
      setSuccessMsg('Admin credentials verified. Launching School Forum Admin Console...');
      setTimeout(() => {
        onLoginSuccess({
          role: 'admin',
        });
      }, 600);
    } else {
      setError('Incorrect Admin Master PIN. Please verify credentials.');
    }
  };

  return (
    <div
      id="access-gate-container"
      className="min-h-screen w-full flex items-center justify-center p-3 sm:p-6 bg-[#090d16] text-[#e2e8f0] relative overflow-hidden"
    >
      {/* Background ambient accents */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-5 right-5 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-lg bg-[#111827]/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-5 sm:p-7 relative z-10"
      >
        {/* School Forum Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 mb-2 shadow-inner">
            <GraduationCap className="w-6 h-6 text-blue-400" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white flex items-center justify-center gap-2">
            Sunrays School Forum
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Safe, anonymous student discussions, counselor support chats, and campus channels.
          </p>
        </div>

        {/* 3 Login Tabs: Student, Agent, Admin */}
        <div className="flex bg-slate-900/90 p-1 rounded-xl border border-slate-800 mb-5">
          <button
            type="button"
            id="tab-login-student"
            onClick={() => {
              setActiveTab('student');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              activeTab === 'student'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student</span>
          </button>

          <button
            type="button"
            id="tab-login-agent"
            onClick={() => {
              setActiveTab('agent');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              activeTab === 'agent'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Agent</span>
          </button>

          <button
            type="button"
            id="tab-login-admin"
            onClick={() => {
              setActiveTab('admin');
              setError(null);
            }}
            className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 min-h-[44px] cursor-pointer ${
              activeTab === 'admin'
                ? 'bg-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Admin</span>
          </button>
        </div>

        {/* Feedback / Alert Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-rose-300 text-xs flex items-start gap-2"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/60 text-emerald-300 text-xs flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 1: STUDENT LOGIN */}
        {activeTab === 'student' && (
          <form onSubmit={handleStudentSubmit} className="space-y-4">
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-800/70 text-xs text-slate-300 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>Anonymous identity: <strong>member#XX</strong></span>
              </span>
              <button
                type="button"
                onClick={handleGenerateStudent}
                className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer bg-blue-500/10 px-2.5 py-1 rounded-md border border-blue-500/20 active:scale-95"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>New Code Pair</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Anonymous Member Code
              </label>
              <input
                id="input-student-code"
                type="text"
                value={studentCode}
                onChange={(e) => setStudentCode(e.target.value)}
                placeholder="e.g. member#01"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Secret Passcode
              </label>
              <input
                id="input-student-pass"
                type="text"
                value={studentPasscode}
                onChange={(e) => setStudentPasscode(e.target.value)}
                placeholder="e.g. STU-1001"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent tracking-wider uppercase font-mono"
                required
              />
            </div>

            {/* Generated Code Display Box */}
            {newlyCreatedStudent && (
              <div className="p-3 bg-blue-950/30 border border-blue-800/60 rounded-xl text-xs">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-blue-300 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                    New Code Pair Ready
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyNewCredentials}
                    className="text-blue-400 hover:text-white flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copied ? 'Copied!' : 'Copy'}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between font-mono bg-slate-900/80 p-2 rounded-lg border border-slate-800">
                  <span className="text-emerald-400 font-bold">{newlyCreatedStudent.memberCode}</span>
                  <span className="text-slate-400 font-bold">{newlyCreatedStudent.passcode}</span>
                </div>
              </div>
            )}

            <button
              type="submit"
              id="btn-login-student"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
            >
              <span>Enter School Forum</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 2: AGENT LOGIN */}
        {activeTab === 'agent' && (
          <form onSubmit={handleAgentSubmit} className="space-y-4">
            <div className="bg-emerald-950/20 p-3 rounded-xl border border-emerald-800/40 text-xs text-emerald-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>For school counselors, peer mentors & safety liaisons created by Admin.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Agent ID
              </label>
              <input
                id="input-agent-code"
                type="text"
                value={agentCode}
                onChange={(e) => setAgentCode(e.target.value)}
                placeholder="e.g. Agent#01"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Agent Passcode
              </label>
              <input
                id="input-agent-pass"
                type="password"
                value={agentPasscode}
                onChange={(e) => setAgentPasscode(e.target.value)}
                placeholder="Enter Agent Passcode"
                className="w-full px-3.5 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent tracking-wider uppercase font-mono"
                required
              />
            </div>

            <button
              type="submit"
              id="btn-login-agent"
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
            >
              <span>Login as Support Agent</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* TAB 3: ADMIN LOGIN */}
        {activeTab === 'admin' && (
          <form onSubmit={handleAdminSubmit} className="space-y-4">
            <div className="bg-purple-950/20 p-3 rounded-xl border border-purple-800/40 text-xs text-purple-300 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Full control: Manage agents, oversee member codes, moderate posts & configure portal.</span>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                School Administrator Master PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="input-admin-pin"
                  type="password"
                  value={adminPinInput}
                  onChange={(e) => setAdminPinInput(e.target.value)}
                  placeholder="Enter School Admin Master PIN"
                  className="w-full pl-9 pr-3 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              id="btn-login-admin"
              className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium text-sm rounded-xl transition-all shadow-lg shadow-purple-600/20 flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] min-h-[44px]"
            >
              <span>Access Admin Console</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* Separator / Footer notice */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-400">
          Android Web & Mobile Optimized • Strict Role Boundary Enforcement
        </div>
      </motion.div>
    </div>
  );
};
