import React, { useState } from 'react';
import { 
  GraduationCap, 
  MessageSquare, 
  MessagesSquare, 
  Shield, 
  ShieldCheck, 
  LogOut, 
  HardDrive,
  Copy, 
  Check, 
  Database,
  Share2,
  Lock,
  Info
} from 'lucide-react';
import { UserRole, StudentAccount, AgentAccount, GoogleDriveBackendConfig } from '../types';

interface NavbarProps {
  currentRole: UserRole;
  studentAccount?: StudentAccount;
  agentAccount?: AgentAccount;
  activeNavTab: 'forum' | 'chats' | 'database' | 'admin' | 'about';
  onNavTabChange: (tab: 'forum' | 'chats' | 'database' | 'admin' | 'about') => void;
  unreadChatsCount: number;
  driveConfig?: GoogleDriveBackendConfig;
  onOpenWhatsAppReferral?: () => void;
  onOpenAbout?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  studentAccount,
  agentAccount,
  activeNavTab,
  onNavTabChange,
  unreadChatsCount,
  driveConfig,
  onOpenWhatsAppReferral,
  onOpenAbout,
  onLogout,
}) => {
  const [copied, setCopied] = useState(false);

  const myCode = 
    currentRole === 'student' 
      ? studentAccount?.memberCode || 'member#??'
      : currentRole === 'agent'
      ? agentAccount?.agentCode || 'Agent#??'
      : 'Admin';

  const copyMyCode = () => {
    navigator.clipboard.writeText(myCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <header className="sticky top-0 z-30 bg-[#090e17]/95 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
        {/* Brand & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-600/20 shrink-0">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Sunrays School
              </h1>
              <span className="hidden md:inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                CAMPUS PORTAL
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">
              MP Board & Coaching doubts, anonymous student voice & counseling
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile to avoid bottom bar redundancy) */}
        <nav className="hidden sm:flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => onNavTabChange('forum')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              activeNavTab === 'forum'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Forum Feed</span>
          </button>

          <button
            type="button"
            onClick={() => onNavTabChange('chats')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] relative ${
              activeNavTab === 'chats'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessagesSquare className="w-3.5 h-3.5" />
            <span>Anonymous Chats</span>
            {unreadChatsCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-bold">
                {unreadChatsCount}
              </span>
            )}
          </button>

          {(currentRole === 'admin' || (currentRole === 'agent' && agentAccount?.hasDatabaseAccess !== false)) && (
            <button
              type="button"
              onClick={() => onNavTabChange('database')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                activeNavTab === 'database'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Student DB</span>
              <span className="px-1 py-0.2 rounded text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
                {currentRole === 'agent' ? 'Faculty' : 'Admin'}
              </span>
            </button>
          )}

          {currentRole === 'admin' && (
            <button
              type="button"
              onClick={() => onNavTabChange('admin')}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
                activeNavTab === 'admin'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-purple-300 hover:text-white hover:bg-purple-950/40'
              }`}
            >
              <Shield className="w-3.5 h-3.5 text-purple-400" />
              <span>Admin Center</span>
              <span className="px-1 py-0.2 rounded text-[10px] bg-purple-500/20 text-purple-300 font-mono">
                Proctor
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={() => onNavTabChange('about')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer min-h-[36px] ${
              activeNavTab === 'about'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Info className="w-3.5 h-3.5" />
            <span>About</span>
          </button>
        </nav>

        {/* Right Controls: Anonymous Identity, WhatsApp Referral, About, Logout */}
        <div className="flex items-center gap-2">
          {/* About Portal Button */}
          <button
            type="button"
            onClick={() => {
              if (onOpenAbout) onOpenAbout();
              onNavTabChange('about');
            }}
            title="About S-Forum & Founder Story"
            className={`px-2.5 py-1.5 border rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all min-h-[36px] ${
              activeNavTab === 'about'
                ? 'bg-blue-600 border-blue-500 text-white shadow-sm'
                : 'bg-slate-900 hover:bg-slate-800 border-slate-700/80 text-slate-300 hover:text-white'
            }`}
          >
            <Info className="w-3.5 h-3.5 text-blue-400" />
            <span className="hidden sm:inline">About</span>
          </button>

          {/* WhatsApp Share Button */}
          {onOpenWhatsAppReferral && (
            <button
              type="button"
              onClick={onOpenWhatsAppReferral}
              title="Share Friend Code on WhatsApp"
              className="px-2.5 py-1.5 bg-emerald-950/50 hover:bg-emerald-900/70 border border-emerald-800/60 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all min-h-[36px]"
            >
              <Share2 className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">Invite Classmates</span>
            </button>
          )}

          {/* User Identity Pill */}
          {currentRole === 'student' && (
            <div className="flex items-center gap-1 px-2.5 py-1.5 bg-blue-950/40 border border-blue-800/60 rounded-xl text-xs font-mono text-blue-300 min-h-[36px]">
              <span className="text-slate-400 text-[10px] hidden xs:inline">ID:</span>
              <span className="font-bold">{myCode}</span>
              <button
                type="button"
                onClick={copyMyCode}
                title="Copy your anonymous code"
                className="p-1 hover:text-white text-blue-400 cursor-pointer"
              >
                {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              </button>
            </div>
          )}

          {currentRole === 'agent' && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-700/60 rounded-xl text-xs text-emerald-300 min-h-[36px]">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold truncate max-w-[120px]">{agentAccount?.name || myCode}</span>
            </div>
          )}

          {currentRole === 'admin' && (
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-purple-950/40 border border-purple-700/60 rounded-xl text-xs text-purple-300 min-h-[36px]">
              <Shield className="w-4 h-4 text-purple-400 shrink-0" />
              <span className="font-bold">Campus Proctor</span>
            </div>
          )}

          {/* Logout Button */}
          <button
            type="button"
            onClick={onLogout}
            title="Logout of School Portal"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 rounded-xl cursor-pointer transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center border border-slate-800"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
