import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Shield, 
  Sparkles, 
  GraduationCap, 
  Check, 
  ShieldCheck, 
  Lock, 
  HeartHandshake, 
  MessageSquare, 
  AlertTriangle,
  Instagram,
  Mail,
  ExternalLink,
  Edit3,
  Save,
  RotateCcw,
  Award,
  Plus,
  Trash2,
  Zap,
  EyeOff,
  BookOpen
} from 'lucide-react';
import { SchoolPortalAboutConfig } from '../types';
import { VerifiedBadgeTick } from './VerifiedBadgeTick';
import { DEFAULT_ALUMNI_AVATAR } from '../utils/avatarPresets';
import { DEFAULT_ABOUT_CONFIG } from '../utils/aboutStorage';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  aboutConfig: SchoolPortalAboutConfig;
  isAdmin?: boolean;
  onSaveConfig?: (config: SchoolPortalAboutConfig) => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({
  isOpen,
  onClose,
  aboutConfig,
  isAdmin = false,
  onSaveConfig,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formConfig, setFormConfig] = useState<SchoolPortalAboutConfig>(aboutConfig);
  const [newCredentialInput, setNewCredentialInput] = useState('');
  const [newRuleInput, setNewRuleInput] = useState('');

  useEffect(() => {
    setFormConfig(aboutConfig);
  }, [aboutConfig, isOpen]);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSaveConfig) {
      onSaveConfig({
        ...formConfig,
        updatedAt: new Date().toISOString(),
      });
    }
    setIsEditing(false);
  };

  const handleResetToDefault = () => {
    if (window.confirm('Reset all details to Sunrays MP Board default?')) {
      setFormConfig(DEFAULT_ABOUT_CONFIG);
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

  const handleAddRule = () => {
    if (!newRuleInput.trim()) return;
    const currentRules = formConfig.rules || [];
    setFormConfig({
      ...formConfig,
      rules: [...currentRules, newRuleInput.trim()],
    });
    setNewRuleInput('');
  };

  const handleRemoveRule = (index: number) => {
    const currentRules = formConfig.rules || [];
    setFormConfig({
      ...formConfig,
      rules: currentRules.filter((_, i) => i !== index),
    });
  };

  const triggerEmergencyEscape = () => {
    const url = formConfig.emergencyEscapeUrl || 'https://en.wikipedia.org/wiki/Mathematics';
    document.title = formConfig.panicDisguiseTitle || 'Mathematics - Wikipedia Reference Library';
    window.location.href = url;
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 12 }}
          className="relative w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 my-auto max-h-[90vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-950/40 via-slate-900 to-purple-950/30 border-b border-slate-800 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>{aboutConfig.title}</span>
                  <VerifiedBadgeTick role="admin" size="md" />
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  {aboutConfig.tagline}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {!isEditing ? (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-sm"
                  title="Edit About & Roleplay Persona"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Edit About</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="p-4 sm:p-6 overflow-y-auto space-y-6 text-xs text-slate-300">
            {isEditing ? (
              /* EDIT FORM */
              <form onSubmit={handleSave} className="space-y-4">
                <div className="p-3 bg-blue-950/20 border border-blue-800/40 rounded-xl text-blue-300 text-xs">
                  <span className="font-bold block">Persona & Portal Configuration:</span>
                  Configure the web portal's About details, founder's alumni persona, showcase credentials, and mission tenets so students trust the platform.
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Forum Title</label>
                    <input
                      type="text"
                      value={formConfig.title}
                      onChange={(e) => setFormConfig({ ...formConfig, title: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Tagline</label>
                    <input
                      type="text"
                      value={formConfig.tagline}
                      onChange={(e) => setFormConfig({ ...formConfig, tagline: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Disclaimer Notice</label>
                    <input
                      type="text"
                      value={formConfig.disclaimer || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, disclaimer: e.target.value })}
                      placeholder="Educational & roleplay student grievance simulation..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Founder / Admin Persona Name</label>
                      <input
                        type="text"
                        value={formConfig.founderName}
                        onChange={(e) => setFormConfig({ ...formConfig, founderName: e.target.value })}
                        placeholder="e.g. Aman Verma (Pass-Out Alumni, 2023)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Batch / Graduation Status</label>
                      <input
                        type="text"
                        value={formConfig.founderBatch}
                        onChange={(e) => setFormConfig({ ...formConfig, founderBatch: e.target.value })}
                        placeholder="e.g. Class 12-A Science (Already Passed Out)"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Founder Role Title</label>
                    <input
                      type="text"
                      value={formConfig.founderRole}
                      onChange={(e) => setFormConfig({ ...formConfig, founderRole: e.target.value })}
                      placeholder="e.g. Ex-Head Boy & Independent Whistleblower Founder"
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      required
                    />
                  </div>

                  {/* Credentials / Badges */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 font-semibold">
                      Showcase Specific Credentials & Badges
                    </label>
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
                        placeholder="e.g. MP Board 98.2% Science Stream or State Rank 3"
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddCredential}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {(formConfig.credentials || []).map((cred, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 rounded-lg bg-blue-950/60 border border-blue-700/50 text-blue-200 text-[11px] flex items-center gap-1.5"
                        >
                          <Award className="w-3 h-3 text-blue-400" />
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

                  {/* Add Community Rules */}
                  <div className="p-3 bg-slate-900/60 rounded-xl border border-slate-800 space-y-2">
                    <label className="block text-slate-200 font-semibold flex items-center justify-between">
                      <span>Add & Edit Community Rules</span>
                      <span className="text-[10px] text-slate-400 font-mono">{(formConfig.rules || []).length} Rules</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newRuleInput}
                        onChange={(e) => setNewRuleInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddRule();
                          }
                        }}
                        placeholder="e.g. Rule 5: Keep whistleblowing complaints focused on campus issues"
                        className="flex-1 px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={handleAddRule}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl flex items-center gap-1 text-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Rule</span>
                      </button>
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {(formConfig.rules || []).map((rule, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 text-slate-200 text-[11px] flex items-center justify-between gap-2"
                        >
                          <span className="flex-1 leading-relaxed">{rule}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRule(idx)}
                            className="text-slate-400 hover:text-rose-400 cursor-pointer p-1"
                            title="Delete Rule"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emergency Escape / Panic Disguise Settings */}
                  <div className="p-3 bg-rose-950/20 rounded-xl border border-rose-900/40 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="block text-rose-300 font-semibold text-xs flex items-center gap-1.5">
                        <Zap className="w-3.5 h-3.5 text-rose-400" />
                        <span>Emergency Escape & Panic Disguise Settings</span>
                      </label>
                      <button
                        type="button"
                        onClick={triggerEmergencyEscape}
                        className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-[10px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span>Test Escape</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Escape Target URL</label>
                        <input
                          type="url"
                          value={formConfig.emergencyEscapeUrl || ''}
                          onChange={(e) => setFormConfig({ ...formConfig, emergencyEscapeUrl: e.target.value })}
                          placeholder="https://en.wikipedia.org/wiki/Mathematics"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 text-[11px] mb-1">Disguise Window Title</label>
                        <input
                          type="text"
                          value={formConfig.panicDisguiseTitle || ''}
                          onChange={(e) => setFormConfig({ ...formConfig, panicDisguiseTitle: e.target.value })}
                          placeholder="Mathematics - Wikipedia Reference Library"
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Founder Bio (Pass-Out Alumni Story)</label>
                    <textarea
                      rows={4}
                      value={formConfig.founderBio}
                      onChange={(e) => setFormConfig({ ...formConfig, founderBio: e.target.value })}
                      placeholder="Narrative explaining how they graduated, are immune to teacher threats, and built this safe space..."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Roleplay Immersion Context Summary</label>
                    <input
                      type="text"
                      value={formConfig.roleplayPersonaSummary || ''}
                      onChange={(e) => setFormConfig({ ...formConfig, roleplayPersonaSummary: e.target.value })}
                      placeholder="e.g. Created for immersion and student trust without exposing real developer identities."
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Mission Story & Platform Tenets</label>
                    <textarea
                      rows={4}
                      value={formConfig.missionStory}
                      onChange={(e) => setFormConfig({ ...formConfig, missionStory: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Whistleblower Policy Text</label>
                    <textarea
                      rows={3}
                      value={formConfig.whistleblowerPolicy}
                      onChange={(e) => setFormConfig({ ...formConfig, whistleblowerPolicy: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs leading-relaxed"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Instagram Handle</label>
                      <input
                        type="text"
                        value={formConfig.instagramHandle || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, instagramHandle: e.target.value })}
                        placeholder="@sunrays.sforum"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-300 font-semibold mb-1">Contact Email</label>
                      <input
                        type="email"
                        value={formConfig.contactEmail || ''}
                        onChange={(e) => setFormConfig({ ...formConfig, contactEmail: e.target.value })}
                        placeholder="admin@school.internal"
                        className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={handleResetToDefault}
                    className="px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-400 text-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Defaults</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs cursor-pointer font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              /* VIEW MODE */
              <>
                {/* Emergency Panic Escape Bar */}
                <div className="p-3 bg-gradient-to-r from-rose-950/40 via-slate-900 to-slate-900 border border-rose-900/40 rounded-xl flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-rose-300">
                    <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                    <span>
                      <strong>Emergency Escape:</strong> Teacher nearby? Click to instantly disguise browser as Wikipedia.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={triggerEmergencyEscape}
                    className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg shrink-0 cursor-pointer shadow-sm transition-all"
                  >
                    Escape Now (Esc)
                  </button>
                </div>

                {/* Founder Persona Card (The Pass-out Alumni Persona) */}
                <div className="p-4 sm:p-5 bg-slate-900/90 rounded-xl border border-slate-800/90 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">
                      Founder & Alumni Story
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono text-[10px]">
                        Pass-Out • Independent From School Authority
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 text-blue-300 flex items-center gap-1 text-[11px] font-semibold cursor-pointer"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Edit Info & Rules</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <img
                      src={DEFAULT_ALUMNI_AVATAR}
                      alt={aboutConfig.founderName}
                      className="w-12 h-12 rounded-full border border-slate-700 bg-slate-800 shrink-0 shadow-sm"
                    />
                    <div className="space-y-0.5 min-w-0">
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        <span>{aboutConfig.founderName}</span>
                        <VerifiedBadgeTick role="admin" size="sm" />
                      </h3>
                      <p className="text-[11px] text-blue-300 font-medium">
                        {aboutConfig.founderRole} • {aboutConfig.founderBatch}
                      </p>

                      {aboutConfig.credentials && aboutConfig.credentials.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {aboutConfig.credentials.map((badge, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-blue-950/60 border border-blue-800/40 text-blue-200 text-[10px] font-medium flex items-center gap-1"
                            >
                              <Award className="w-2.5 h-2.5 text-blue-400" />
                              <span>{badge}</span>
                            </span>
                          ))}
                        </div>
                      )}

                      <p className="text-slate-400 text-xs italic mt-2 leading-relaxed">
                        "{aboutConfig.founderBio}"
                      </p>
                    </div>
                  </div>
                </div>

                {/* Whistleblower Protection Guarantee */}
                <div className="p-4 bg-emerald-950/20 border border-emerald-800/40 rounded-xl space-y-2">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
                    <Lock className="w-4 h-4 text-emerald-400" />
                    <span>Whistleblower Protection Guarantee</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed text-xs">
                    {aboutConfig.whistleblowerPolicy}
                  </p>
                </div>

                {/* Verification Tick Tiers Explanation & Live Chat Examples */}
                <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    <span>Verification Tick Tiers & Chat Examples</span>
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <VerifiedBadgeTick role="admin" size="md" className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-white text-xs block">Black Tick</span>
                          <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                            School Administrator & Proctor holding executive authority.
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 font-mono">
                        <span className="text-white font-bold flex items-center gap-1">
                          Proctor#01 <VerifiedBadgeTick role="admin" size="xs" />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">"Your grievance #MP-104 is under review."</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-lg border border-slate-800 flex flex-col justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <VerifiedBadgeTick role="agent" size="md" className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-slate-200 text-xs block">Grey Tick</span>
                          <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                            Confidential counselors & subject proctors. Identities masked.
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-slate-800 text-[11px] text-slate-300 font-mono">
                        <span className="text-slate-300 font-bold flex items-center gap-1">
                          Counselor [Agent#01] <VerifiedBadgeTick role="agent" size="xs" />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">"Verified: Use Lenz's law for question 4."</p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-950/80 rounded-lg border border-sky-900/40 bg-sky-950/10 flex flex-col justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        <VerifiedBadgeTick role="student" referralCount={3} size="md" className="mt-0.5 shrink-0" />
                        <div>
                          <span className="font-bold text-sky-400 text-xs block">Blue Tick</span>
                          <span className="text-[11px] text-slate-400 leading-tight block mt-0.5">
                            Campus Ambassador badge! Unlocked after 3 WhatsApp referrals.
                          </span>
                        </div>
                      </div>
                      <div className="p-2 bg-slate-900 rounded border border-sky-900/40 text-[11px] text-slate-300 font-mono">
                        <span className="text-sky-300 font-bold flex items-center gap-1">
                          member#02 <VerifiedBadgeTick role="student" referralCount={3} size="xs" />
                        </span>
                        <p className="text-[10px] text-slate-400 mt-0.5">"Shared the MP Board 2025 question bank!"</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Community Rules */}
                {formConfig.rules && formConfig.rules.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Community Rules</span>
                      </h4>
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="text-blue-400 hover:text-blue-300 text-[11px] font-semibold cursor-pointer"
                      >
                        + Add Rule
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {formConfig.rules.map((rule, idx) => (
                        <div key={idx} className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{rule}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Mission Story */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Our Mission & Principles
                  </h4>
                  <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/80 whitespace-pre-line leading-relaxed text-slate-300 text-xs">
                    {aboutConfig.missionStory}
                  </div>
                </div>

                {/* Code of Conduct */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Community Guidelines
                  </h4>
                  <ul className="space-y-2 text-xs">
                    {aboutConfig.guidelines.map((g, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-slate-300">
                        <Check className="w-3.5 h-3.5 text-blue-400 mt-0.5 shrink-0" />
                        <span>{g}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Contacts & Social */}
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    {aboutConfig.instagramHandle && (
                      <span className="flex items-center gap-1 text-pink-400">
                        <Instagram className="w-3.5 h-3.5" />
                        {aboutConfig.instagramHandle}
                      </span>
                    )}
                    {aboutConfig.contactEmail && (
                      <span className="flex items-center gap-1 text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-blue-400" />
                        {aboutConfig.contactEmail}
                      </span>
                    )}
                  </div>
                  <span className="text-slate-500 font-mono">
                    S-Forum • Sunrays Higher Secondary School (MPBSE)
                  </span>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
