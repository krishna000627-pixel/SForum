import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Share2, 
  Copy, 
  Check, 
  MessageCircle, 
  Sparkles, 
  Users, 
  X, 
  Award,
  BookOpen,
  EyeOff,
  Flame
} from 'lucide-react';
import { StudentAccount } from '../types';

interface WhatsAppReferralModalProps {
  studentAccount?: StudentAccount;
  myCode: string;
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppReferralModal: React.FC<WhatsAppReferralModalProps> = ({
  studentAccount,
  myCode,
  isOpen,
  onClose,
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'doubts' | 'confessions' | 'notes' | 'canteen'>('doubts');

  if (!isOpen) return null;

  const friendCode = studentAccount?.friendCode || 'FRND-INDIAN';
  const referralCount = studentAccount?.referralCount ?? 3;
  const currentUrl = typeof window !== 'undefined' ? window.location.origin + window.location.pathname : 'https://school-portal.edu';
  const inviteLink = `${currentUrl}?ref=${friendCode}&code=${myCode}`;

  const captionTemplates = {
    doubts: `📚 *MP Board / JEE / NEET Doubt Portal for Our School!*\n\nHey classmates! Join our private anonymous school forum to discuss NCERT derivations, Allen & PW coaching DPPs, and MPBSE model papers without hesitation.\n\n🔑 *My Secret Friend Code:* ${friendCode}\n👤 *Connect with me as:* ${myCode}\n👉 *Join directly here:* ${inviteLink}\n\n100% anonymous & secure student community!`,
    confessions: `🤫 *Anonymous Confessions & Campus Chat Board!*\n\nYo! Our school student forum has a secret confession and gossip board where no one can trace your real name or roll number. Connect with me privately on anonymous chat!\n\n🔑 *Use Friend Code:* ${friendCode}\n👉 *Tap to join:* ${inviteLink}`,
    notes: `⚡ *Free Handwritten Board & Coaching Notes (Class 10th - 12th)*\n\nCheckout our school forum for Chapter formula sheets, Chemistry mechanisms, and PYQ solutions shared by toppers!\n\n🔑 *Invite Code:* ${friendCode}\n👉 *Access here:* ${inviteLink}`,
    canteen: `🥪 *School Canteen & Campus Chatter Hub!*\n\nInter-House sports updates, morning assembly reactions, and canteen reviews! Join our private batch group on the school portal.\n\n🔑 *Friend Code:* ${friendCode}\n👉 *Join Portal:* ${inviteLink}`,
  };

  const currentCaption = captionTemplates[selectedTemplate];

  const handleShareWhatsApp = () => {
    const encoded = encodeURIComponent(currentCaption);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(currentCaption);
    setCopiedCaption(true);
    setTimeout(() => setCopiedCaption(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-200 my-auto"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <MessageCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <span>WhatsApp Classmate Referral</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-500/20 text-emerald-400 font-semibold font-mono">
                  AUTO-CAPTION
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Share with school WhatsApp groups & connect anonymously
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 gap-3 my-4">
          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl">
            <span className="text-[11px] text-slate-400 block">Your Secret Friend Code</span>
            <div className="flex items-center justify-between mt-1">
              <span className="font-mono font-bold text-emerald-400 text-sm">{friendCode}</span>
              <span className="text-[10px] text-slate-400 font-mono">({myCode})</span>
            </div>
          </div>

          <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[11px] text-slate-400 block">Friends Referred</span>
              <span className="font-bold text-white text-base">{referralCount} Classmates</span>
            </div>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Caption Template Picker */}
        <div className="mb-3">
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Select Auto-Written Caption for WhatsApp:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <button
              type="button"
              onClick={() => setSelectedTemplate('doubts')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${
                selectedTemplate === 'doubts'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Doubts</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('confessions')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${
                selectedTemplate === 'confessions'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <EyeOff className="w-3.5 h-3.5" />
              <span>Confessions</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('notes')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${
                selectedTemplate === 'notes'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Notes</span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTemplate('canteen')}
              className={`px-2 py-1.5 rounded-lg text-xs font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${
                selectedTemplate === 'canteen'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Flame className="w-3.5 h-3.5" />
              <span>Canteen</span>
            </button>
          </div>
        </div>

        {/* Message Preview Box */}
        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
            <span>WhatsApp Message Preview</span>
            <button
              type="button"
              onClick={handleCopyCaption}
              className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
            >
              {copiedCaption ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedCaption ? 'Copied Text' : 'Copy Message'}</span>
            </button>
          </div>
          <p className="text-xs font-mono text-slate-300 whitespace-pre-line leading-relaxed max-h-36 overflow-y-auto pr-1">
            {currentCaption}
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={handleCopyLink}
            className="flex-1 py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer min-h-[42px] transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedLink ? 'Invite Link Copied!' : 'Copy Invite Link'}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWhatsApp}
            className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-emerald-600/20 min-h-[42px] transition-all"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Share on WhatsApp 🚀</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};
