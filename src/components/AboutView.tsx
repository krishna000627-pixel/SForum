import React, { useState } from 'react';
import { 
  GraduationCap, 
  Shield, 
  ShieldCheck, 
  Lock, 
  MessageSquare, 
  MessagesSquare, 
  Check, 
  Award, 
  AlertTriangle, 
  HeartHandshake, 
  Sparkles, 
  Edit3, 
  Save, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Share2, 
  ExternalLink, 
  Instagram, 
  Mail, 
  CheckCircle2,
  FileText,
  UserCheck,
  Video,
  Info
} from 'lucide-react';
import { SchoolPortalAboutConfig, UserRole } from '../types';
import { VerifiedBadgeTick } from './VerifiedBadgeTick';
import { DEFAULT_ALUMNI_AVATAR } from '../utils/avatarPresets';
import { DEFAULT_ABOUT_CONFIG } from '../utils/aboutStorage';

interface AboutViewProps {
  aboutConfig: SchoolPortalAboutConfig;
  currentRole: UserRole;
  isAdmin: boolean;
  onSaveConfig: (config: SchoolPortalAboutConfig) => void;
  onNavigateTab: (tab: 'forum' | 'chats' | 'database' | 'admin') => void;
  onOpenReferralModal?: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({
  aboutConfig,
  currentRole,
  isAdmin,
  onSaveConfig,
  onNavigateTab,
  onOpenReferralModal,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [activeEditorTab, setActiveEditorTab] = useState<'persona' | 'portal' | 'guidelines' | 'contact'>('persona');
  const [formConfig, setFormConfig] = useState<SchoolPortalAboutConfig>(aboutConfig);
  const [newCredentialInput, setNewCredentialInput] = useState('');
  const [newGuidelineInput, setNewGuidelineInput] = useState('');
  const [saveToast, setSaveToast] = useState(false);

  // Sync form when aboutConfig updates or entering edit mode
  const handleStartEdit = (defaultTab?: 'persona' | 'portal' | 'guidelines' | 'contact') => {
    setFormConfig({ ...aboutConfig });
    if (defaultTab) setActiveEditorTab(defaultTab);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setFormConfig({ ...aboutConfig });
    setIsEditing(false);
  };

  const handleSave = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const updated: SchoolPortalAboutConfig = {
      ...formConfig,
      updatedAt: new Date().toISOString(),
    };
    onSaveConfig(updated);
    setIsEditing(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3500);
  };

  const handleResetDefaults = () => {
    if (window.confirm('Reset all biographical details, credentials, and portal copy to defaults?')) {
      setFormConfig(DEFAULT_ABOUT_CONFIG);
      onSaveConfig(DEFAULT_ABOUT_CONFIG);
      setIsEditing(false);
      setSaveToast(true);
      setTimeout(() => setSaveToast(false), 3500);
    }
  };

  const handleAddCredential = () => {
    if (!newCredentialInput.trim()) return;
    const currentList = formConfig.credentials || [];
    setFormConfig({
      ...formConfig,
      credentials: [...currentList, newCredentialInput.trim()],
    });
    setNewCredentialInput('');
  };

  const handleRemoveCredential = (index: number) => {
    const currentList = formConfig.credentials || [];
    setFormConfig({
      ...formConfig,
      credentials: currentList.filter((_, i) => i !== index),
    });
  };

  const handleAddGuideline = () => {
    if (!newGuidelineInput.trim()) return;
    const currentList = formConfig.guidelines || [];
    setFormConfig({
      ...formConfig,
      guidelines: [...currentList, newGuidelineInput.trim()],
    });
    setNewGuidelineInput('');
  };

  const handleRemoveGuideline = (index: number) => {
    const currentList = formConfig.guidelines || [];
    setFormConfig({
      ...formConfig,
      guidelines: currentList.filter((_, i) => i !== index),
    });
  };

  const activeCredentials = aboutConfig.credentials && aboutConfig.credentials.length > 0 
    ? aboutConfig.credentials 
    : (DEFAULT_ABOUT_CONFIG.credentials || []);

  return (
    <div className="w-full max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed top-20 right-4 sm:right-8 z-50 bg-emerald-600 text-white px-4 py-2.5 rounded-xl shadow-xl flex items-center gap-2 border border-emerald-400/40 text-xs font-semibold animate-bounce">
          <CheckCircle2 className="w-4 h-4" />
          <span>Founder profile & portal bio saved successfully!</span>
        </div>
      )}

      {/* Hero Banner with Portal Overview & Action Jump */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-950/70 via-slate-900/90 to-purple-950/60 border border-slate-800 p-6 sm:p-10 shadow-2xl">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Independent Student Sanctuary & Grievance Portal</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight flex items-center gap-3 flex-wrap">
              <span>{aboutConfig.title}</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700 text-slate-200 text-xs font-mono font-normal">
                <span>Verified Network</span>
                <VerifiedBadgeTick role="admin" size="sm" />
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {aboutConfig.tagline}
            </p>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              A cryptographically decoupled campus community engineered to give students an unfiltered voice. 
              Report genuine school issues, review past teachers, solve hard MP Board / MPBSE numericals, and connect 
              with peers anonymously without fear of disciplinary threats or withheld practical marks.
            </p>

            {aboutConfig.disclaimer && (
              <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-[11px] text-slate-400 font-mono flex items-center gap-2">
                <Info className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <span>{aboutConfig.disclaimer}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col sm:flex-row md:flex-col gap-2.5 w-full md:w-auto shrink-0">
            {isAdmin && (!isEditing ? (
              <button
                type="button"
                onClick={() => handleStartEdit('persona')}
                className="px-5 py-3 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-600/30 cursor-pointer min-h-[44px]"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit About Page</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer min-h-[44px]"
              >
                <span>Close Editor</span>
              </button>
            ))}

            <button
              type="button"
              onClick={() => onNavigateTab('forum')}
              className="px-5 py-3 rounded-xl bg-blue-600/90 hover:bg-blue-500 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer min-h-[44px]"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Enter Student Forum</span>
            </button>

            <button
              type="button"
              onClick={() => onNavigateTab('chats')}
              className="px-5 py-3 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-slate-700 cursor-pointer min-h-[44px]"
            >
              <MessagesSquare className="w-4 h-4" />
              <span>Anonymous Peer Chats</span>
            </button>

            {onOpenReferralModal && (
              <button
                type="button"
                onClick={onOpenReferralModal}
                className="px-5 py-3 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all border border-emerald-700/50 cursor-pointer min-h-[44px]"
              >
                <Share2 className="w-4 h-4 text-emerald-400" />
                <span>Invite Classmates for Blue Tick</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPREHENSIVE ABOUT EDITOR */}
      {isEditing && (
        <div className="p-6 sm:p-8 bg-slate-950 border-2 border-blue-500/70 rounded-3xl shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                <Edit3 className="w-5 h-5" />
                <span>Portal & Community Profile Editor</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Customize the founder profile, portal identity, community rules, and verified credentials.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Defaults</span>
              </button>
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>

          {/* Editor Category Tabs */}
          <div className="flex flex-wrap gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveEditorTab('persona')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeEditorTab === 'persona'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Founder Profile & Bio</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorTab('portal')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeEditorTab === 'portal'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Shield className="w-4 h-4" />
              <span>Portal Identity & Title</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorTab('guidelines')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeEditorTab === 'guidelines'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>Rules & Shield Policy</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveEditorTab('contact')}
              className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
                activeEditorTab === 'contact'
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Social & Contact</span>
            </button>
          </div>

          <form onSubmit={handleSave} className="space-y-6 text-xs">
            {/* TAB 1: FOUNDER PROFILE & CREDENTIALS */}
            {activeEditorTab === 'persona' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3 bg-blue-950/30 border border-blue-800/40 rounded-xl text-blue-300">
                  <span className="font-bold block mb-1">Founder Alumni Background:</span>
                  Describe the founder's passed-out status (e.g., Ex-Head Boy, Batch of 2023) so students recognize that the school administration holds zero disciplinary leverage over the platform.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Founder Name</label>
                    <input
                      type="text"
                      value={formConfig.founderName}
                      onChange={(e) => setFormConfig({ ...formConfig, founderName: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Batch & Class Affiliation</label>
                    <input
                      type="text"
                      value={formConfig.founderBatch}
                      onChange={(e) => setFormConfig({ ...formConfig, founderBatch: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Role Title & Designation</label>
                    <input
                      type="text"
                      value={formConfig.founderRole}
                      onChange={(e) => setFormConfig({ ...formConfig, founderRole: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Showcase Credentials Manager */}
                <div className="space-y-2 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <label className="block text-slate-200 font-bold">
                    Showcase Specific Credentials & Academic Honors (Badges)
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Add impressive credentials (e.g. MP Board 98.2%, State Rank 3, Ex-Head Boy) displayed on the founder profile.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newCredentialInput}
                      onChange={(e) => setNewCredentialInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCredential();
                        }
                      }}
                      placeholder="e.g. MP Board 98.2% Science Stream or State Merit Rank 3"
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddCredential}
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Badge</span>
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {(formConfig.credentials || []).map((cred, idx) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1.5 rounded-lg bg-blue-950/60 border border-blue-700/50 text-blue-200 text-xs flex items-center gap-2"
                      >
                        <Award className="w-3.5 h-3.5 text-blue-400" />
                        <span>{cred}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveCredential(idx)}
                          className="text-slate-400 hover:text-rose-400 cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Biographical Background & Student Sanctuary Narrative
                  </label>
                  <textarea
                    rows={5}
                    value={formConfig.founderBio}
                    onChange={(e) => setFormConfig({ ...formConfig, founderBio: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    required
                  />
                </div>
              </div>
            )}

            {/* TAB 2: PORTAL IDENTITY & BRANDING */}
            {activeEditorTab === 'portal' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3 bg-purple-950/30 border border-purple-800/40 rounded-xl text-purple-300">
                  <span className="font-bold block mb-1">Portal Title & Public Branding:</span>
                  Update the platform headline, hero tagline, and the notice displayed to all students.
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portal Main Title</label>
                  <input
                    type="text"
                    value={formConfig.title}
                    onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-semibold focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Hero Subtitle / Tagline</label>
                  <textarea
                    rows={3}
                    value={formConfig.tagline}
                    onChange={(e) => setFormConfig({ ...formConfig, tagline: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    required
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Portal Information Notice</label>
                  <input
                    type="text"
                    value={formConfig.disclaimer || ''}
                    onChange={(e) => setFormConfig({ ...formConfig, disclaimer: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}

            {/* TAB 3: RULES & WHISTLEBLOWER SHIELD */}
            {activeEditorTab === 'guidelines' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3 bg-emerald-950/30 border border-emerald-800/40 rounded-xl text-emerald-300">
                  <span className="font-bold block mb-1">Safety Guarantees & Honor Code:</span>
                  Define your identity-shield guarantees and manage the list of student conduct guidelines.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Whistleblower Safety Guarantee</label>
                    <textarea
                      rows={4}
                      value={formConfig.whistleblowerPolicy}
                      onChange={(e) => setFormConfig({ ...formConfig, whistleblowerPolicy: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Portal Mission Story</label>
                    <textarea
                      rows={4}
                      value={formConfig.missionStory}
                      onChange={(e) => setFormConfig({ ...formConfig, missionStory: e.target.value })}
                      className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    />
                  </div>
                </div>

                {/* Guidelines & Rules Manager */}
                <div className="space-y-3 p-4 bg-slate-900/60 rounded-2xl border border-slate-800">
                  <label className="block text-slate-200 font-bold">
                    Community Honor Code Guidelines Manager
                  </label>
                  <p className="text-[11px] text-slate-400">
                    Add or remove rules shown in the Community Honor Code card on the right sidebar.
                  </p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newGuidelineInput}
                      onChange={(e) => setNewGuidelineInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddGuideline();
                        }
                      }}
                      placeholder="e.g. Document genuine grievances with clarity; zero tolerance for bullying"
                      className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs focus:ring-1 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={handleAddGuideline}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Rule</span>
                    </button>
                  </div>

                  <div className="space-y-2 pt-2">
                    {(formConfig.guidelines || []).map((rule, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 text-slate-300"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {idx + 1}
                          </span>
                          <span className="text-xs">{rule}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveGuideline(idx)}
                          className="text-slate-500 hover:text-rose-400 cursor-pointer p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: CONTACT & SOCIAL HANDLES */}
            {activeEditorTab === 'contact' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="p-3 bg-pink-950/30 border border-pink-800/40 rounded-xl text-pink-300">
                  <span className="font-bold block mb-1">Official Contact & Social Links:</span>
                  Configure the social links and contact email displayed on the founder dossier and footer.
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Official Instagram / Social Handle</label>
                    <input
                      type="text"
                      value={formConfig.instagramHandle || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, instagramHandle: e.target.value })}
                      placeholder="@sunrays.forum"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Secure Whistleblower Email Handle</label>
                    <input
                      type="text"
                      value={formConfig.contactEmail || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, contactEmail: e.target.value })}
                      placeholder="sanctuary@sforum.org"
                      className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Form Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleResetDefaults}
                className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-rose-400 border border-slate-800 font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Defaults</span>
              </button>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 shadow-lg shadow-blue-600/30 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Save All Changes</span>
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Founder Profile & Community Guidelines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Founder Profile, Credentials & Mission */}
        <div className="lg:col-span-2 space-y-6">
          {/* Founder Profile Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={DEFAULT_ALUMNI_AVATAR}
                    alt={aboutConfig.founderName}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-purple-500/50 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 bg-black rounded-full p-0.5">
                    <VerifiedBadgeTick role="admin" size="md" />
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-lg sm:text-xl font-bold text-white">
                      {aboutConfig.founderName}
                    </h2>
                    <VerifiedBadgeTick role="admin" size="md" />
                  </div>
                  <p className="text-xs sm:text-sm text-purple-300 font-semibold mt-0.5">
                    {aboutConfig.founderRole}
                  </p>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    {aboutConfig.founderBatch}
                  </p>
                </div>
              </div>

              {isAdmin && !isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit('persona')}
                  className="px-3.5 py-2 rounded-xl bg-purple-950/60 hover:bg-purple-900/80 border border-purple-700/60 text-purple-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
                >
                  <Edit3 className="w-3.5 h-3.5 text-purple-400" />
                  <span>Edit Profile & Bio</span>
                </button>
              )}
            </div>

            {/* Showcase Specific Credentials & Badges */}
            <div className="space-y-2.5 pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>Verified Credentials & Honors</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">Campus Verified</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {activeCredentials.map((cred, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/90 flex items-start gap-2.5"
                  >
                    <div className="w-5 h-5 rounded-lg bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0 mt-0.5">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-xs font-medium text-slate-200 leading-snug">
                      {cred}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Founder Background Story */}
            <div className="space-y-2 pt-2 border-t border-slate-800/80">
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-purple-400" />
                <span>Founder Background & Student Sanctuary Narrative</span>
              </span>

              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80">
                {aboutConfig.founderBio}
              </p>
            </div>

            {/* Contact & Social Proof */}
            <div className="flex items-center gap-4 pt-2 border-t border-slate-800/80 text-xs text-slate-400 flex-wrap">
              {aboutConfig.instagramHandle && (
                <div className="flex items-center gap-1.5 text-pink-400">
                  <Instagram className="w-3.5 h-3.5" />
                  <span className="font-mono">{aboutConfig.instagramHandle}</span>
                </div>
              )}
              {aboutConfig.contactEmail && (
                <div className="flex items-center gap-1.5 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span className="font-mono">{aboutConfig.contactEmail}</span>
                </div>
              )}
              <div className="text-slate-500 text-[11px] font-mono ml-auto">
                Updated: {new Date(aboutConfig.updatedAt).toLocaleDateString()}
              </div>
            </div>
          </div>

          {/* Portal Mission & Security Tenets */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-blue-400" />
                <span>Core Tenets: How Student Anonymity Works</span>
              </h3>
              {isAdmin && !isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit('guidelines')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Edit Mission</span>
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold">
                  1
                </div>
                <div className="font-bold text-white text-sm">Zero Personal Data</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  No Gmail address, school roll number, or phone number is ever collected. You login solely via a randomly issued student code pair (e.g. member#01).
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold">
                  2
                </div>
                <div className="font-bold text-white text-sm">Anti-Retaliation Safe</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Posts, grievances, and discussions are cryptographically severed from real-world school registries. Teachers and proctors cannot identify the speaker.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
                  3
                </div>
                <div className="font-bold text-white text-sm">Video Proof Verified</div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Support for video attachments (capped strictly at 5 minutes) to document faulty air conditioning, lab equipment damage, or syllabus rushes.
                </p>
              </div>
            </div>

            <div className="p-4 bg-slate-950/80 rounded-2xl border border-slate-800 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {aboutConfig.missionStory}
            </div>
          </div>
        </div>

        {/* Right 1 Column: Whistleblower Guidelines & Channels */}
        <div className="space-y-6">
          {/* Whistleblower Policy & Rules */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <span>Community Honor Code</span>
              </h3>
              {isAdmin && !isEditing && (
                <button
                  type="button"
                  onClick={() => handleStartEdit('guidelines')}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-[11px] font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3 h-3 text-amber-400" />
                  <span>Edit Rules</span>
                </button>
              )}
            </div>

            <div className="space-y-2.5">
              {aboutConfig.guidelines.map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                  <div className="w-4 h-4 rounded-full bg-slate-800 text-blue-400 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                    {idx + 1}
                  </div>
                  <span className="leading-snug">{rule}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Channels Directory */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-3">
            <div className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Whistleblower Channels
            </div>
            <div className="space-y-2 text-xs">
              <button
                type="button"
                onClick={() => onNavigateTab('forum')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-blue-500 text-left flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>⚠️ Teachers & Faculty Grievances</span>
                <span className="text-blue-400 font-mono text-[10px]">Explore →</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('forum')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-purple-500 text-left flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>🏫 School Problems & Campus Infrastructure</span>
                <span className="text-purple-400 font-mono text-[10px]">Explore →</span>
              </button>
              <button
                type="button"
                onClick={() => onNavigateTab('forum')}
                className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500 text-left flex items-center justify-between text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <span>📚 MP Board Exams & Doubt Haven</span>
                <span className="text-emerald-400 font-mono text-[10px]">Explore →</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
