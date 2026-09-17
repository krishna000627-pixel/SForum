import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Shield, 
  ShieldAlert,
  ShieldCheck, 
  UserPlus, 
  Trash2, 
  KeyRound, 
  GraduationCap, 
  HardDrive, 
  Cloud,
  Copy, 
  Check, 
  X, 
  AlertCircle, 
  CheckCircle2, 
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Pin,
  Lock,
  Unlock,
  RefreshCw,
  Plus,
  Search,
  Users,
  MessageSquare,
  Share2,
  Instagram,
  Heart,
  BookOpen,
  Phone,
  Home,
  FileSpreadsheet
} from 'lucide-react';
import { 
  AgentAccount, 
  StudentAccount, 
  ForumPost, 
  ForumChannel, 
  GoogleDriveBackendConfig, 
  Profile, 
  CustomField, 
  AccessPass 
} from '../types';
import { GoogleDriveTab } from './GoogleDriveTab';
import { WhatsAppReferralModal } from './WhatsAppReferralModal';
import { SqlDiagnosticsTab } from './SqlDiagnosticsTab';
import { Database } from 'lucide-react';

interface SchoolAdminPageProps {
  agents: AgentAccount[];
  students: StudentAccount[];
  posts: ForumPost[];
  channels: ForumChannel[];
  profiles: Profile[];
  customFields: CustomField[];
  accessPasses: AccessPass[];
  driveConfig: GoogleDriveBackendConfig;
  onUpdateAgents: (agents: AgentAccount[]) => void;
  onUpdateStudents: (students: StudentAccount[]) => void;
  onDeleteAgent?: (agentId: string) => void;
  onDeleteStudent?: (studentId: string) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string) => void;
  onToggleLockPost: (postId: string) => void;
  onUpdateDriveConfig: (config: GoogleDriveBackendConfig) => void;
  onExportDriveData: () => any;
  onImportDriveData: (data: any) => void;
  onResetAllData: () => void;
  onAddNewProfile: () => void;
  onViewProfile: (profile: Profile) => void;
  onReturnToForum: () => void;
}

export const SchoolAdminPage: React.FC<SchoolAdminPageProps> = ({
  agents,
  students,
  posts,
  channels,
  profiles,
  customFields,
  accessPasses,
  driveConfig,
  onUpdateAgents,
  onUpdateStudents,
  onDeleteAgent,
  onDeleteStudent,
  onDeletePost,
  onPinPost,
  onToggleLockPost,
  onUpdateDriveConfig,
  onExportDriveData,
  onImportDriveData,
  onResetAllData,
  onAddNewProfile,
  onViewProfile,
  onReturnToForum,
}) => {
  const [activeTab, setActiveTab] = useState<'moderation' | 'agents' | 'directory' | 'discussions' | 'referrals' | 'sql_diagnostics' | 'backup'>('moderation');
  const [studentSearch, setStudentSearch] = useState('');
  const [directorySearch, setDirectorySearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // New Agent Form State
  const [newAgentCode, setNewAgentCode] = useState(`Agent#0${agents.length + 1}`);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDept, setNewAgentDept] = useState('Senior Student Counselor');
  const [newAgentPasscode, setNewAgentPasscode] = useState(`AGNT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newAgentBio, setNewAgentBio] = useState('');
  const [agentCanBan, setAgentCanBan] = useState(true);
  const [agentCanVerify, setAgentCanVerify] = useState(true);
  const [agentCanPin, setAgentCanPin] = useState(true);
  const [agentFormMsg, setAgentFormMsg] = useState<string | null>(null);

  // WhatsApp referral modal
  const [showReferralModal, setShowReferralModal] = useState(false);

  // Ban action modal/prompt
  const handleToggleBan = (studentId: string) => {
    const student = students.find((s) => s.id === studentId);
    if (!student) return;

    if (student.isBanned) {
      // Unban
      const updated = students.map((s) =>
        s.id === studentId
          ? { ...s, isBanned: false, banReason: undefined, warningStrikes: 0 }
          : s
      );
      onUpdateStudents(updated);
    } else {
      // Ban
      const reason = prompt(
        `Specify reason for suspending student ${student.memberCode} (${student.alias || 'Anonymous'}):`,
        'Disruptive behavior / inappropriate forum language'
      );
      if (reason === null) return;

      const updated = students.map((s) =>
        s.id === studentId
          ? {
              ...s,
              isBanned: true,
              banReason: reason || 'Violation of school forum guidelines',
              warningStrikes: Math.max(s.warningStrikes || 0, 3),
            }
          : s
      );
      onUpdateStudents(updated);
    }
  };

  const handleAddStrike = (studentId: string) => {
    const updated = students.map((s) => {
      if (s.id !== studentId) return s;
      const newStrikes = (s.warningStrikes || 0) + 1;
      return {
        ...s,
        warningStrikes: newStrikes,
        isBanned: newStrikes >= 3 ? true : s.isBanned,
        banReason: newStrikes >= 3 ? 'Exceeded 3 warning strikes' : s.banReason,
      };
    });
    onUpdateStudents(updated);
  };

  const handleClearStrikes = (studentId: string) => {
    const updated = students.map((s) =>
      s.id === studentId
        ? { ...s, warningStrikes: 0, isBanned: false, banReason: undefined }
        : s
    );
    onUpdateStudents(updated);
  };

  // Toggle Agent Permissions
  const handleToggleAgentPermission = (agentId: string, perm: 'canBanUsers' | 'canVerifyAnswers' | 'canPinPosts' | 'isActive' | 'hasDatabaseAccess') => {
    const updated = agents.map((a) => {
      if (a.id !== agentId) return a;
      return {
        ...a,
        [perm]: !a[perm],
      };
    });
    onUpdateAgents(updated);
  };

  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim()) {
      setAgentFormMsg('Please enter the faculty or counselor name.');
      return;
    }

    const newAgent: AgentAccount = {
      id: `agent_${Date.now()}`,
      agentCode: newAgentCode.trim() || `Agent#0${agents.length + 1}`,
      name: newAgentName.trim(),
      department: newAgentDept.trim() || 'General Academic Counseling',
      passcode: newAgentPasscode.trim(),
      isActive: true,
      canBanUsers: agentCanBan,
      canVerifyAnswers: agentCanVerify,
      canPinPosts: agentCanPin,
      hasDatabaseAccess: true,
      createdAt: new Date().toISOString(),
      bio: newAgentBio.trim() || 'Verified school faculty & student counselor.',
    };

    onUpdateAgents([...agents, newAgent]);
    setNewAgentName('');
    setNewAgentBio('');
    setNewAgentPasscode(`AGNT-${Math.floor(1000 + Math.random() * 9000)}`);
    setNewAgentCode(`Agent#0${agents.length + 2}`);
    setAgentFormMsg(`Faculty Agent ${newAgent.agentCode} successfully created!`);
    setTimeout(() => setAgentFormMsg(null), 3000);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Filter students
  const filteredStudents = students.filter(
    (s) =>
      s.memberCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.friendCode.toLowerCase().includes(studentSearch.toLowerCase()) ||
      (s.alias && s.alias.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  // Filter directory profiles
  const filteredProfiles = profiles.filter(
    (p) =>
      p.fullName.toLowerCase().includes(directorySearch.toLowerCase()) ||
      p.category.toLowerCase().includes(directorySearch.toLowerCase()) ||
      (p.rollNo && p.rollNo.toLowerCase().includes(directorySearch.toLowerCase())) ||
      (p.classGrade && p.classGrade.toLowerCase().includes(directorySearch.toLowerCase())) ||
      (p.coachingInstitute && p.coachingInstitute.toLowerCase().includes(directorySearch.toLowerCase())) ||
      (p.instagramId && p.instagramId.toLowerCase().includes(directorySearch.toLowerCase()))
  );

  const bannedCount = students.filter((s) => s.isBanned).length;

  return (
    <div className="min-h-screen bg-[#090e17] text-slate-200 pb-16">
      {/* Top Banner Header */}
      <div className="bg-[#0f172a] border-b border-slate-800 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/20 border border-purple-500/40 text-purple-400 flex items-center justify-center shadow-lg shadow-purple-600/20 shrink-0">
              <Shield className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  Sunrays School Admin Portal
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-purple-500/20 text-purple-300 border border-purple-500/30 font-mono">
                  DEDICATED CONSOLE
                </span>
              </div>
              <p className="text-xs text-slate-400">
                School proctoring, student ban controls, faculty agent permissions & comprehensive student records
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onReturnToForum}
              className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer border border-slate-700 transition-colors min-h-[40px]"
            >
              <MessageSquare className="w-4 h-4 text-blue-400" />
              <span>Back to Forum</span>
            </button>
          </div>
        </div>

        {/* Admin Navigation Tabs */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex gap-2 overflow-x-auto py-2 border-t border-slate-800/80 no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'moderation'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Student Ban & Moderation</span>
            {bannedCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold font-mono">
                {bannedCount} Banned
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'agents'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Faculty & Agent Powers</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              {agents.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('directory')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'directory'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Indian Student & Staff Directory</span>
            <span className="px-1.5 py-0.2 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
              {profiles.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('discussions')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'discussions'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Topic Pin & Lock Controls</span>
            <span className="px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 text-[10px] font-mono">
              {posts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('referrals')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'referrals'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>WhatsApp Referral System</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sql_diagnostics')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'sql_diagnostics'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Database className="w-4 h-4 text-emerald-400" />
            <span>SQL Database & Diagnostics Center</span>
            <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
              LIVE TEST
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 shrink-0 transition-all cursor-pointer min-h-[38px] ${
              activeTab === 'backup'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <Cloud className="w-4 h-4" />
            <span>Cloud & Cloud JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6">
        {/* TAB 1: STUDENT BANS & MODERATION */}
        {activeTab === 'moderation' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span>Student Forum Moderation & Ban Management</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Manage warning strikes, issue temporary/permanent forum bans, and review anonymous identity mappings
                </p>
              </div>

              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search code, friend code or alias..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Quick summary cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Total Registered Codes</span>
                <span className="text-lg font-bold text-white font-mono">{students.length} Students</span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Active Students</span>
                <span className="text-lg font-bold text-emerald-400 font-mono">
                  {students.filter((s) => !s.isBanned).length}
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Banned / Suspended</span>
                <span className="text-lg font-bold text-rose-400 font-mono">
                  {bannedCount}
                </span>
              </div>
              <div className="p-3.5 bg-slate-900/80 border border-slate-800 rounded-xl">
                <span className="text-[11px] text-slate-400 block">Total Referrals Generated</span>
                <span className="text-lg font-bold text-purple-400 font-mono">
                  {students.reduce((acc, s) => acc + (s.referralCount || 0), 0)} Invites
                </span>
              </div>
            </div>

            {/* Student Table */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950/80 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
                    <tr>
                      <th className="py-3 px-4">MEMBER CODE</th>
                      <th className="py-3 px-4">FRIEND CODE</th>
                      <th className="py-3 px-4">STUDENT ALIAS</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">WARNINGS</th>
                      <th className="py-3 px-4">REFERRALS</th>
                      <th className="py-3 px-4 text-right">PROCTOR ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {filteredStudents.map((s) => (
                      <tr key={s.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-blue-400">
                          {s.memberCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-emerald-400">
                          {s.friendCode}
                        </td>
                        <td className="py-3 px-4 text-slate-200">
                          {s.alias || <span className="text-slate-500 italic">No alias</span>}
                        </td>
                        <td className="py-3 px-4">
                          {s.isBanned ? (
                            <div className="space-y-0.5">
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30">
                                BANNED
                              </span>
                              {s.banReason && (
                                <p className="text-[10px] text-rose-400 italic max-w-xs truncate">
                                  {s.banReason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={`font-bold font-mono ${
                                (s.warningStrikes || 0) >= 3
                                  ? 'text-rose-400'
                                  : (s.warningStrikes || 0) > 0
                                  ? 'text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            >
                              {s.warningStrikes || 0} / 3
                            </span>
                            <button
                              type="button"
                              onClick={() => handleAddStrike(s.id)}
                              title="Add 1 warning strike"
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-amber-600/30 text-amber-300 rounded text-[10px] cursor-pointer"
                            >
                              + Strike
                            </button>
                            {(s.warningStrikes || 0) > 0 && (
                              <button
                                type="button"
                                onClick={() => handleClearStrikes(s.id)}
                                title="Clear all strikes"
                                className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-400 rounded text-[10px] cursor-pointer"
                              >
                                Reset
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-purple-300">
                          {s.referralCount || 0}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleBan(s.id)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                                s.isBanned
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                                  : 'bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40'
                              }`}
                            >
                              {s.isBanned ? 'Unban' : 'Ban'}
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm('Are you sure you want to permanently delete this student account?')) {
                                  onDeleteStudent && onDeleteStudent(s.id);
                                }
                              }}
                              className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg cursor-pointer"
                              title="Delete Student"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: FACULTY & AGENT POWERS */}
        {activeTab === 'agents' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* List & Permission Controls */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span>School Counselor & Faculty Agents (Authority & Permissions)</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Agents can chat privately with students, verify official academic answers, and pin exam notices.
                </p>
              </div>

              <div className="space-y-3">
                {agents.map((ag) => (
                  <div
                    key={ag.id}
                    className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl space-y-3"
                  >
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-emerald-400 text-sm">
                            {ag.agentCode}
                          </span>
                          <span className="text-white font-bold">{ag.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-slate-300">
                            {ag.department}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1">{ag.bio}</p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          Passcode: <strong className="text-emerald-300">{ag.passcode}</strong>
                        </span>
                      </div>
                    </div>

                    {/* Granular Permission Toggles */}
                    <div className="pt-3 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <button
                        type="button"
                        onClick={() => handleToggleAgentPermission(ag.id, 'canBanUsers')}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${
                          ag.canBanUsers
                            ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>Ban Users</span>
                        {ag.canBanUsers ? <ToggleRight className="w-5 h-5 text-rose-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAgentPermission(ag.id, 'canVerifyAnswers')}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${
                          ag.canVerifyAnswers
                            ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>Verify Doubts</span>
                        {ag.canVerifyAnswers ? <ToggleRight className="w-5 h-5 text-emerald-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAgentPermission(ag.id, 'canPinPosts')}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${
                          ag.canPinPosts
                            ? 'bg-blue-950/40 border-blue-800/60 text-blue-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>Pin Notices</span>
                        {ag.canPinPosts ? <ToggleRight className="w-5 h-5 text-blue-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleToggleAgentPermission(ag.id, 'hasDatabaseAccess')}
                        className={`p-2 rounded-xl flex items-center justify-between cursor-pointer border transition-all ${
                          ag.hasDatabaseAccess
                            ? 'bg-purple-950/40 border-purple-800/60 text-purple-300'
                            : 'bg-slate-950 border-slate-800 text-slate-500'
                        }`}
                      >
                        <span>DB Access</span>
                        {ag.hasDatabaseAccess ? <ToggleRight className="w-5 h-5 text-purple-400" /> : <ToggleLeft className="w-5 h-5 text-slate-600" />}
                      </button>
                    </div>

                    {/* Actions */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => onDeleteAgent && onDeleteAgent(ag.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg cursor-pointer flex items-center gap-1 text-[11px]"
                        title="Delete Agent"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Remove Agent
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Create New Agent Form */}
            <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-2xl space-y-4 h-fit">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Create New Faculty / Agent</h3>
              </div>

              {agentFormMsg && (
                <div className="p-2.5 rounded-lg bg-emerald-950/50 border border-emerald-800 text-emerald-300 text-xs">
                  {agentFormMsg}
                </div>
              )}

              <form onSubmit={handleCreateAgent} className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-400 mb-1">Agent Code</label>
                  <input
                    type="text"
                    value={newAgentCode}
                    onChange={(e) => setNewAgentCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Full Name & Title</label>
                  <input
                    type="text"
                    value={newAgentName}
                    onChange={(e) => setNewAgentName(e.target.value)}
                    placeholder="e.g. Mrs. Anjali Deshmukh"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Department / Role</label>
                  <input
                    type="text"
                    value={newAgentDept}
                    onChange={(e) => setNewAgentDept(e.target.value)}
                    placeholder="e.g. Chemistry Faculty & NEET Mentor"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Access Passcode</label>
                  <input
                    type="text"
                    value={newAgentPasscode}
                    onChange={(e) => setNewAgentPasscode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-emerald-400 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1">Bio / Specialty</label>
                  <textarea
                    rows={2}
                    value={newAgentBio}
                    onChange={(e) => setNewAgentBio(e.target.value)}
                    placeholder="Available for student counseling, doubt clearing..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white"
                  />
                </div>

                <div className="space-y-1 pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={agentCanBan}
                      onChange={(e) => setAgentCanBan(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600"
                    />
                    <span>Permission to Ban Users</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={agentCanVerify}
                      onChange={(e) => setAgentCanVerify(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600"
                    />
                    <span>Permission to Verify Solutions</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={agentCanPin}
                      onChange={(e) => setAgentCanPin(e.target.checked)}
                      className="rounded bg-slate-950 border-slate-700 text-purple-600"
                    />
                    <span>Permission to Pin Notices</span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold cursor-pointer transition-all shadow-md shadow-purple-600/20"
                >
                  Create Agent Account
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: INDIAN STUDENT & STAFF DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-400" />
                  <span>Indian School Student & Staff Master Directory</span>
                </h2>
                <p className="text-xs text-slate-400">
                  Comprehensive student profiles including Instagram IDs, Coaching Institutes, Parents' info, and House allotments
                </p>
              </div>

              <div className="flex items-center gap-2.5 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={directorySearch}
                    onChange={(e) => setDirectorySearch(e.target.value)}
                    placeholder="Search name, class, coaching, roll no..."
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <button
                  type="button"
                  onClick={onAddNewProfile}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md shadow-blue-600/20 shrink-0 min-h-[38px]"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Profile</span>
                </button>
              </div>
            </div>

            {/* Profile Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredProfiles.map((prof) => (
                <div
                  key={prof.id}
                  onClick={() => onViewProfile(prof)}
                  className="p-4 bg-slate-900/80 hover:bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-2xl transition-all cursor-pointer space-y-3 relative group"
                >
                  <div className="flex items-start gap-3">
                    <img
                      src={prof.avatarUrl}
                      alt={prof.fullName}
                      className="w-14 h-14 rounded-xl object-cover bg-slate-800 border-2 border-slate-700 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <h3 className="text-sm font-bold text-white truncate group-hover:text-blue-400 transition-colors">
                          {prof.fullName}
                        </h3>
                        {prof.rollNo && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Roll #{prof.rollNo}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-blue-400 font-medium truncate">
                        {prof.classGrade || prof.roleTitle}
                      </p>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                        <span>{prof.board || 'MP Board'}</span>
                        {prof.house && (
                          <>
                            <span>•</span>
                            <span className="text-amber-400">{prof.house} House</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Highlights Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-950/70 p-2.5 rounded-xl border border-slate-800/80">
                    <div>
                      <span className="text-slate-500 block">Coaching:</span>
                      <span className="text-slate-200 font-semibold truncate block">
                        {prof.coachingInstitute || 'Self Study'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Instagram:</span>
                      <span className="text-pink-400 font-mono truncate block">
                        {prof.instagramId || 'None'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Relationship:</span>
                      <span className="text-purple-300 font-medium truncate block">
                        {prof.relationshipStatus || 'Unknown'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block">Father:</span>
                      <span className="text-slate-300 truncate block">
                        {prof.fathersName || 'Recorded'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1 text-emerald-400 font-medium">
                      <Phone className="w-3 h-3" />
                      <span>{prof.whatsappNumber || prof.phone}</span>
                    </span>
                    <span className="text-blue-400 group-hover:underline font-semibold">
                      View Full File →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DISCUSSIONS & POST CONTROLS */}
        {activeTab === 'discussions' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                <span>Discussion Thread Governance (Pin, Lock & Purge)</span>
              </h2>
              <p className="text-xs text-slate-400">
                School proctors can pin official notices, lock sensitive threads against comments, or delete violating content
              </p>
            </div>

            <div className="space-y-3">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-start justify-between flex-wrap gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-blue-400 font-mono font-medium">
                        {channels.find((c) => c.id === post.channelId)?.name || 'General'}
                      </span>
                      {post.isPinned && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> Pinned
                        </span>
                      )}
                      {post.isLocked && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] bg-rose-500/20 text-rose-300 font-semibold border border-rose-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> Locked Thread
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm font-bold text-white">{post.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2">{post.content}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1 font-mono">
                      <span>Author: {post.authorLabel || post.authorCode}</span>
                      <span>•</span>
                      <span>{post.likes} Upvotes</span>
                      <span>•</span>
                      <span>{post.commentsCount} Comments</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => onPinPost(post.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        post.isPinned
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <Pin className="w-3.5 h-3.5" />
                      <span>{post.isPinned ? 'Unpin' : 'Pin'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onToggleLockPost(post.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-colors ${
                        post.isLocked
                          ? 'bg-rose-600 text-white'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      {post.isLocked ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                      <span>{post.isLocked ? 'Unlock' : 'Lock'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onDeletePost(post.id)}
                      className="p-1.5 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/60 text-rose-400 rounded-lg cursor-pointer"
                      title="Permanently Delete Discussion"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 5: WHATSAPP REFERRAL SYSTEM */}
        {activeTab === 'referrals' && (
          <div className="space-y-6">
            <div className="p-5 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-800/50 rounded-2xl flex items-start justify-between flex-wrap gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <Share2 className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white">
                    School WhatsApp Viral Referral & Share Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-300 mt-1 max-w-xl">
                  Allow students to invite entire tuition and school class batches onto the portal with auto-written captions for MP Board / JEE doubts, notes, and canteen buzz.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowReferralModal(true)}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 min-h-[40px]"
              >
                <Share2 className="w-4 h-4" />
                <span>Test WhatsApp Auto-Caption Share</span>
              </button>
            </div>

            {/* Student Leaderboard */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Student Invite Leaderboard</h3>
              <div className="space-y-2">
                {students
                  .slice()
                  .sort((a, b) => (b.referralCount || 0) - (a.referralCount || 0))
                  .map((s, idx) => (
                    <div
                      key={s.id}
                      className="p-3 bg-slate-950/80 border border-slate-800/80 rounded-xl flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 rounded-full bg-slate-800 text-white font-mono text-xs font-bold flex items-center justify-center">
                          #{idx + 1}
                        </span>
                        <div>
                          <span className="font-mono font-bold text-blue-400 text-xs">{s.memberCode}</span>
                          <span className="text-xs text-slate-400 ml-2">({s.alias || 'Anonymous Student'})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-emerald-400 font-bold">
                          Friend Code: {s.friendCode}
                        </span>
                        <span className="px-2.5 py-1 rounded-lg bg-purple-500/20 text-purple-300 font-mono text-xs font-bold">
                          {s.referralCount || 0} Invites
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: SQL RELATIONAL DATABASE & DIAGNOSTICS */}
        {activeTab === 'sql_diagnostics' && (
          <SqlDiagnosticsTab />
        )}

        {/* TAB 7: CLOUD & BACKUP */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <GoogleDriveTab
              driveConfig={driveConfig}
              profiles={profiles}
              customFields={customFields}
              accessPasses={accessPasses}
              onSaveDriveConfig={onUpdateDriveConfig}
              onImportDriveData={onImportDriveData}
              onExportLocalData={onExportDriveData}
              onImportLocalData={onImportDriveData}
            />

            {/* Danger Zone: Factory Reset */}
            <div className="p-5 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex items-center justify-between flex-wrap gap-4">
              <div>
                <h4 className="text-sm font-bold text-rose-300">Factory Reset Portal Data</h4>
                <p className="text-xs text-slate-400">
                  Reset all forum discussions, student accounts, and profiles back to initial Indian school presets.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (confirm('Are you sure you want to reset all data to default Indian school presets?')) {
                    onResetAllData();
                  }
                }}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Reset All Data
              </button>
            </div>
          </div>
        )}
      </div>

      {/* WhatsApp Referral Modal */}
      <WhatsAppReferralModal
        isOpen={showReferralModal}
        onClose={() => setShowReferralModal(false)}
        myCode="Admin#01"
      />
    </div>
  );
};
