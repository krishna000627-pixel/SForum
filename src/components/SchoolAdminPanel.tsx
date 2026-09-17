import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Shield, 
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
  RefreshCw,
  Plus
} from 'lucide-react';
import { AgentAccount, StudentAccount, ForumPost, ForumChannel, GoogleDriveBackendConfig } from '../types';
import { GoogleDriveTab } from './GoogleDriveTab';

interface SchoolAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  agents: AgentAccount[];
  students: StudentAccount[];
  posts: ForumPost[];
  channels: ForumChannel[];
  driveConfig: GoogleDriveBackendConfig;
  onUpdateAgents: (agents: AgentAccount[]) => void;
  onUpdateStudents: (students: StudentAccount[]) => void;
  onDeletePost: (postId: string) => void;
  onPinPost: (postId: string) => void;
  onUpdateDriveConfig: (config: GoogleDriveBackendConfig) => void;
  onExportDriveData: () => any;
  onImportDriveData: (data: any) => void;
  onResetAllData: () => void;
}

export const SchoolAdminPanel: React.FC<SchoolAdminPanelProps> = ({
  isOpen,
  onClose,
  agents,
  students,
  posts,
  channels,
  driveConfig,
  onUpdateAgents,
  onUpdateStudents,
  onDeletePost,
  onPinPost,
  onUpdateDriveConfig,
  onExportDriveData,
  onImportDriveData,
  onResetAllData,
}) => {
  const [activeTab, setActiveTab] = useState<'agents' | 'students' | 'moderation' | 'drive'>('agents');

  // New Agent Form State
  const [newAgentCode, setNewAgentCode] = useState(`Agent#0${agents.length + 1}`);
  const [newAgentName, setNewAgentName] = useState('');
  const [newAgentDept, setNewAgentDept] = useState('Mental Health & Wellbeing');
  const [newAgentPasscode, setNewAgentPasscode] = useState(`AGNT-${Math.floor(1000 + Math.random() * 9000)}`);
  const [newAgentBio, setNewAgentBio] = useState('');
  const [agentFormMsg, setAgentFormMsg] = useState<string | null>(null);

  // Copied state
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Create New Agent
  const handleCreateAgent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAgentName.trim() || !newAgentCode.trim()) return;

    const newAgent: AgentAccount = {
      id: `agent_${Date.now()}`,
      agentCode: newAgentCode.trim(),
      name: newAgentName.trim(),
      department: newAgentDept.trim(),
      passcode: newAgentPasscode.trim().toUpperCase(),
      isActive: true,
      createdAt: new Date().toISOString(),
      bio: newAgentBio.trim() || 'School support agent',
    };

    const updated = [newAgent, ...agents];
    onUpdateAgents(updated);

    // Reset Form
    setNewAgentName('');
    setNewAgentBio('');
    setNewAgentCode(`Agent#0${updated.length + 1}`);
    setNewAgentPasscode(`AGNT-${Math.floor(1000 + Math.random() * 9000)}`);
    setAgentFormMsg(`Successfully created agent ${newAgent.name} (${newAgent.agentCode})!`);
    setTimeout(() => setAgentFormMsg(null), 3000);
  };

  // Toggle Agent Active Status
  const handleToggleAgentActive = (agentId: string) => {
    const updated = agents.map((a) =>
      a.id === agentId ? { ...a, isActive: !a.isActive } : a
    );
    onUpdateAgents(updated);
  };

  // Delete Agent
  const handleDeleteAgent = (agentId: string) => {
    if (confirm('Are you sure you want to remove this Agent?')) {
      const updated = agents.filter((a) => a.id !== agentId);
      onUpdateAgents(updated);
    }
  };

  // Generate Batch of Student Code Pairs
  const handleGenerateStudentBatch = () => {
    const count = 5;
    const newStudents: StudentAccount[] = [];
    const currentLen = students.length;
    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    for (let i = 1; i <= count; i++) {
      const num = currentLen + i;
      const numStr = num < 10 ? `0${num}` : `${num}`;
      let rand = '';
      for (let j = 0; j < 4; j++) {
        rand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      let fRand = '';
      for (let j = 0; j < 4; j++) {
        fRand += chars.charAt(Math.floor(Math.random() * chars.length));
      }
      newStudents.push({
        id: `stu_${Date.now()}_${i}`,
        memberCode: `member#${numStr}`,
        passcode: `STU-${rand}`,
        friendCode: `FRND-${fRand}`,
        alias: `Student ${numStr}`,
        createdAt: new Date().toISOString(),
        lastActive: 'Never',
      });
    }

    onUpdateStudents([...newStudents, ...students]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl bg-[#111827] border border-slate-800 rounded-2xl shadow-2xl flex flex-col max-h-[90vh] my-auto overflow-hidden"
      >
        {/* Top Header */}
        <div className="px-5 py-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                School Forum Administration
              </h2>
              <p className="text-xs text-slate-400">
                Manage Support Agents, Student Code Pairs, Moderation, and Google Drive Cloud Sync
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-slate-900/60 px-4 pt-2 border-b border-slate-800 gap-1 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('agents')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] ${
              activeTab === 'agents'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Support Agents ({agents.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] ${
              activeTab === 'students'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-blue-400" />
            <span>Anonymous Students ({students.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] ${
              activeTab === 'moderation'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Pin className="w-4 h-4 text-amber-400" />
            <span>Moderation ({posts.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`px-4 py-2.5 text-xs font-semibold rounded-t-xl border-b-2 transition-all flex items-center gap-1.5 shrink-0 cursor-pointer min-h-[44px] ${
              activeTab === 'drive'
                ? 'border-purple-500 text-purple-400 bg-purple-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cloud className="w-4 h-4 text-cyan-400" />
            <span>Cloud & Cloud JSON Backup</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* TAB 1: AGENTS MANAGEMENT */}
          {activeTab === 'agents' && (
            <div className="space-y-6">
              {/* Add New Agent Form */}
              <div className="p-4 sm:p-5 bg-slate-900/60 border border-slate-800 rounded-xl space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <UserPlus className="w-4 h-4 text-emerald-400" />
                      Add Support Agent
                    </h3>
                    <p className="text-xs text-slate-400">
                      Counselors, tutors, or campus safety staff with school database access
                    </p>
                  </div>
                </div>

                {agentFormMsg && (
                  <div className="p-3 bg-emerald-950/40 border border-emerald-800 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{agentFormMsg}</span>
                  </div>
                )}

                <form onSubmit={handleCreateAgent} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Agent Name *</label>
                    <input
                      type="text"
                      value={newAgentName}
                      onChange={(e) => setNewAgentName(e.target.value)}
                      placeholder="e.g. Counselor Sarah"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white min-h-[40px] focus:ring-2 focus:ring-emerald-500 outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-300 mb-1">Department / Specialty</label>
                    <select
                      value={newAgentDept}
                      onChange={(e) => setNewAgentDept(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white min-h-[40px] focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="Mental Health & Wellbeing">Mental Health & Wellbeing</option>
                      <option value="Academic & STEM Tutoring">Academic & STEM Tutoring</option>
                      <option value="Clubs & Anti-Bullying Liaison">Clubs & Anti-Bullying Liaison</option>
                      <option value="College & Career Guidance">College & Career Guidance</option>
                      <option value="Campus Safety & Support">Campus Safety & Support</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs text-slate-300">Code & Passcode</label>
                      <button
                        type="button"
                        onClick={() => {
                          setNewAgentPasscode(`AGNT-${Math.floor(1000 + Math.random() * 9000)}`);
                        }}
                        className="text-[10px] text-emerald-400 hover:underline cursor-pointer"
                      >
                        ⚡ Randomize Pass
                      </button>
                    </div>
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={newAgentCode}
                        onChange={(e) => setNewAgentCode(e.target.value)}
                        placeholder="Code"
                        className="w-24 px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white font-mono min-h-[40px]"
                        required
                      />
                      <input
                        type="text"
                        value={newAgentPasscode}
                        onChange={(e) => setNewAgentPasscode(e.target.value)}
                        placeholder="Passcode"
                        className="flex-1 px-2.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-emerald-400 font-mono uppercase min-h-[40px]"
                        required
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-slate-300 mb-1">Agent Bio (Optional)</label>
                    <input
                      type="text"
                      value={newAgentBio}
                      onChange={(e) => setNewAgentBio(e.target.value)}
                      placeholder="Short bio shown to students in anonymous chats"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white min-h-[40px]"
                    />
                  </div>

                  <div className="sm:col-span-1 pt-1 sm:pt-6 flex justify-end">
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all min-h-[40px] flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Agent
                    </button>
                  </div>
                </form>
              </div>

              {/* Existing Agents List */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
                  Active Support Agents ({agents.length})
                </h3>

                <div className="divide-y divide-slate-800 border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                  {agents.map((ag) => (
                    <div
                      key={ag.id}
                      className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-800/30 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-950 border border-emerald-700 flex items-center justify-center text-emerald-400 font-bold shrink-0">
                          <ShieldCheck className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-white">{ag.name}</span>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                              {ag.agentCode}
                            </span>
                            <span className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                              ag.isActive ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}>
                              {ag.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{ag.department}</p>
                          <p className="text-[11px] text-slate-500 mt-1 italic">{ag.bio}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <div className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300 flex items-center gap-1.5">
                          <span className="text-slate-500 text-[10px]">PASS:</span>
                          <span>{ag.passcode}</span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ag.passcode, ag.id)}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedId === ag.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleAgentActive(ag.id)}
                          className="p-1.5 text-slate-400 hover:text-slate-200 cursor-pointer"
                          title={ag.isActive ? 'Deactivate Agent' : 'Activate Agent'}
                        >
                          {ag.isActive ? (
                            <ToggleRight className="w-5 h-5 text-emerald-400" />
                          ) : (
                            <ToggleLeft className="w-5 h-5 text-slate-500" />
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAgent(ag.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 cursor-pointer"
                          title="Delete Agent"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ANONYMOUS STUDENTS */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Anonymous Student Code Pairs ({students.length})
                  </h3>
                  <p className="text-xs text-slate-400">
                    Each student uses a unique random code pair (e.g. member#01 + secret pass) to stay anonymous.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateStudentBatch}
                  className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Generate +5 Student Code Pairs</span>
                </button>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-900/40">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono text-[11px]">
                    <tr>
                      <th className="p-3">MEMBER CODE</th>
                      <th className="p-3">PASSCODE</th>
                      <th className="p-3">FRIEND CODE</th>
                      <th className="p-3 hidden sm:table-cell">ALIAS</th>
                      <th className="p-3 hidden sm:table-cell">CREATED</th>
                      <th className="p-3 text-right">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {students.map((stu) => (
                      <tr key={stu.id} className="hover:bg-slate-800/30 transition-colors">
                        <td className="p-3 font-bold text-blue-400">{stu.memberCode}</td>
                        <td className="p-3 text-slate-300">
                          <span className="bg-slate-950 px-2 py-0.5 rounded border border-slate-800 text-[11px]">
                            {stu.passcode}
                          </span>
                        </td>
                        <td className="p-3 text-emerald-400">
                          <span className="bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 text-[11px] font-bold">
                            {stu.friendCode || 'FRND-NONE'}
                          </span>
                        </td>
                        <td className="p-3 text-slate-400 font-sans hidden sm:table-cell">{stu.alias}</td>
                        <td className="p-3 text-slate-500 text-[10px] hidden sm:table-cell">
                          {new Date(stu.createdAt).toLocaleDateString()}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            type="button"
                            onClick={() => handleCopy(`${stu.memberCode} | Pass: ${stu.passcode} | FriendCode: ${stu.friendCode || 'N/A'}`, stu.id)}
                            className="px-2 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded border border-slate-800 text-[10px] cursor-pointer"
                          >
                            {copiedId === stu.id ? 'Copied!' : 'Copy'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: FORUM MODERATION */}
          {activeTab === 'moderation' && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-white">
                Forum Discussions & Moderation ({posts.length})
              </h3>

              <div className="space-y-2">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3.5 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-blue-400">{post.authorCode}</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{post.likes} Upvotes</span>
                        <span className="text-slate-500">•</span>
                        <span className="text-slate-400">{post.commentsCount} Comments</span>
                        {post.isPinned && (
                          <span className="px-1.5 py-0.2 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded text-[10px] font-semibold">
                            Pinned
                          </span>
                        )}
                      </div>
                      <h4 className="font-semibold text-white truncate">{post.title}</h4>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onPinPost(post.id)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-medium cursor-pointer ${
                          post.isPinned
                            ? 'bg-amber-500/20 text-amber-400'
                            : 'bg-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        {post.isPinned ? 'Unpin' : 'Pin'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeletePost(post.id)}
                        className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 rounded-lg cursor-pointer"
                        title="Delete Post"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: GOOGLE DRIVE BACKUP */}
          {activeTab === 'drive' && (
            <div className="space-y-4">
              <GoogleDriveTab
                driveConfig={driveConfig}
                onUpdateDriveConfig={onUpdateDriveConfig}
                onExportDriveData={onExportDriveData}
                onImportDriveData={onImportDriveData}
              />

              <div className="pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Emergency Reset</span>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Reset School Forum to factory defaults?')) {
                      onResetAllData();
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-950/40 border border-rose-800/60 text-rose-300 hover:bg-rose-900/60 rounded-lg cursor-pointer transition-all"
                >
                  Reset Forum to Defaults
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};
