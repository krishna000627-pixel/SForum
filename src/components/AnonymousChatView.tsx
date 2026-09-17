import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  Send, 
  UserPlus, 
  ArrowLeft, 
  ShieldCheck, 
  Search, 
  Sparkles, 
  Check, 
  Copy,
  Smile,
  Clock,
  Circle,
  Image as ImageIcon,
  Paperclip,
  Loader2,
  X,
  Cloud
} from 'lucide-react';
import { ChatConversation, ChatMessage, UserRole, AgentAccount, StudentAccount } from '../types';
import { VerifiedBadgeTick } from './VerifiedBadgeTick';
import { uploadToFirebaseStorage } from '../firebase/firebase';
import { compressImageToDataUrl, parseGoogleDriveLink, uploadDirectMedia } from '../utils/driveMediaUtils';
import { Link2 } from 'lucide-react';

interface AnonymousChatViewProps {
  currentRole: UserRole;
  myCode: string; // e.g. "member#01" or "Agent#01"
  myLabel?: string;
  chats: { conversations: ChatConversation[]; messages: Record<string, ChatMessage[]> };
  agents: AgentAccount[];
  students: StudentAccount[];
  onSendMessage: (conversationId: string, text: string, attachmentUrl?: string) => void;
  onStartNewChat: (participantCode: string, name?: string, isAgent?: boolean) => string;
  onClose?: () => void;
}

export const AnonymousChatView: React.FC<AnonymousChatViewProps> = ({
  currentRole,
  myCode,
  myLabel,
  chats,
  agents,
  students,
  onSendMessage,
  onStartNewChat,
}) => {
  const mappedConversations = chats.conversations.map((c) => {
    let pCode = c.participantCode;
    if (c.participantACode && c.participantBCode) {
      pCode = c.participantACode === myCode ? c.participantBCode : c.participantACode;
    }
    return { ...c, participantCode: pCode || c.participantCode };
  });

  const [activeConvId, setActiveConvId] = useState<string>(
    mappedConversations[0]?.id || ''
  );
  const [inputText, setInputText] = useState('');
  const [attachedImageUrl, setAttachedImageUrl] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newFriendCodeInput, setNewFriendCodeInput] = useState('');
  const [newChatError, setNewChatError] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Mobile navigation: whether in list mode or conversation mode
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list');

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Identify current student account to show friendCode
  const currentStudent = students.find(
    (s) => s.memberCode.toLowerCase() === myCode.toLowerCase()
  );
  const myFriendCode = currentStudent?.friendCode || 'FRND-7K29';

  const activeConversation = mappedConversations.find((c) => c.id === activeConvId);
  const activeMessages = (activeConvId && chats.messages[activeConvId]) || [];

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeMessages.length, activeConvId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!inputText.trim() && !attachedImageUrl) || !activeConvId) return;
    onSendMessage(activeConvId, inputText.trim(), attachedImageUrl || undefined);
    setInputText('');
    setAttachedImageUrl(null);
    setUploadError(null);
  };

  const handleSelectImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file (JPG, PNG, WebP).');
      return;
    }

    // 15MB limit per image
    if (file.size > 15 * 1024 * 1024) {
      setUploadError('Image size exceeds 15MB limit.');
      return;
    }

    setIsUploadingImage(true);
    setUploadError(null);

    try {
      const uploadRes = await uploadDirectMedia(file, 'chats');
      setAttachedImageUrl(uploadRes.url || uploadRes.directImageUrl || null);
    } catch (err: any) {
      console.error('Chat media upload failed:', err);
      setUploadError(err?.message || 'Could not upload media attachment.');
    } finally {
      setIsUploadingImage(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleCreateChat = (codeToUse: string, name?: string, isAgent: boolean = false) => {
    setNewChatError(null);
    const clean = codeToUse.trim();
    if (!clean) {
      setNewChatError('Please enter a friend code (e.g. FRND-7K29) or member ID (e.g. member#02).');
      return;
    }

    // Check if input is a friend code
    const matchedByFriendCode = students.find(
      (s) => s.friendCode && s.friendCode.toLowerCase() === clean.toLowerCase()
    );

    let targetCode = clean;
    let targetName = name;

    if (matchedByFriendCode) {
      targetCode = matchedByFriendCode.memberCode;
      targetName = `Friend (${matchedByFriendCode.memberCode})`;
    } else if (clean.toUpperCase().startsWith('FRND-')) {
      setNewChatError(`Friend code "${clean.toUpperCase()}" not recognized. Please verify the code.`);
      return;
    }

    if (targetCode.toLowerCase() === myCode.toLowerCase()) {
      setNewChatError("You cannot start an anonymous chat with yourself!");
      return;
    }

    const convId = onStartNewChat(targetCode, targetName || `Friend (${targetCode})`, isAgent);
    setActiveConvId(convId);
    setShowNewChatModal(false);
    setNewFriendCodeInput('');
    setMobileView('chat');
  };

  const copyMyFriendCode = () => {
    navigator.clipboard.writeText(myFriendCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredConversations = mappedConversations.filter(
    (c) =>
      c.participantCode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      c.participantName.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="w-full h-full flex-1 bg-[#0a0f1d] border-0 sm:border-x sm:border-b border-slate-800 flex flex-col overflow-hidden">
      {/* Top Banner / My Anonymous Code Header */}
      <div className="px-4 py-3 bg-slate-900/95 border-b border-slate-800 flex items-center justify-between flex-wrap gap-2">

        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              Anonymous Friend & Support Chats
            </h2>
            <p className="text-[11px] text-slate-400">
              End-to-end confidential student messaging. No real names shared.
            </p>
          </div>
        </div>

        {/* My Anonymous Code & Friend Code Pill */}
        <div className="flex items-center gap-2">
          {currentRole === 'student' ? (
            <>
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                <span className="text-slate-400">ID:</span>
                <span className="text-blue-400 font-bold">{myCode}</span>
                <span className="text-slate-700">|</span>
                <span className="text-slate-400">Friend Code:</span>
                <span className="text-emerald-400 font-bold">{myFriendCode}</span>
              </div>
              <button
                type="button"
                onClick={copyMyFriendCode}
                title="Copy and share your unique friend code"
                className="px-2.5 py-1.5 bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-all min-h-[36px]"
              >
                {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCode ? 'Copied Code!' : 'Share Friend Code'}</span>
              </button>
            </>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950/40 border border-emerald-700/60 rounded-lg text-xs text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{myLabel || myCode}</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Body: Left sidebar + Right message area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* LEFT SIDEBAR: Conversations List */}
        <div
          className={`w-full sm:w-80 border-r border-slate-800 bg-[#0a0e18] flex flex-col shrink-0 ${
            mobileView === 'chat' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {/* Action header */}
          <div className="p-3 border-b border-slate-800 space-y-2">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder="Search chats..."
                  className="w-full pl-8 pr-3 py-1.5 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <button
                type="button"
                onClick={() => setShowNewChatModal(true)}
                title="Start a new anonymous friend or agent chat"
                className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg flex items-center justify-center shrink-0 cursor-pointer shadow-sm min-h-[36px] min-w-[36px]"
              >
                <UserPlus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversations Scroll Area */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-800/60">
            {filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <MessageSquare className="w-8 h-8 text-slate-700 mx-auto mb-2" />
                <p>No chats found.</p>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(true)}
                  className="mt-2 text-blue-400 hover:underline cursor-pointer"
                >
                  + Add Friend by Member Code
                </button>
              </div>
            ) : (
              filteredConversations.map((conv) => {
                const isSelected = conv.id === activeConvId;
                return (
                  <button
                    key={conv.id}
                    type="button"
                    onClick={() => {
                      setActiveConvId(conv.id);
                      setMobileView('chat');
                    }}
                    className={`w-full p-3.5 text-left flex items-start gap-3 transition-colors cursor-pointer min-h-[64px] ${
                      isSelected
                        ? 'bg-slate-800/60 border-l-2 border-blue-500'
                        : 'hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Avatar Icon */}
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold border ${
                        conv.participantRole === 'admin'
                          ? 'bg-black border-slate-700 text-white'
                          : conv.isAgent || conv.participantRole === 'agent'
                          ? 'bg-slate-900 border-slate-700 text-slate-300'
                          : 'bg-indigo-950 border-indigo-700 text-indigo-400'
                      }`}
                    >
                      {conv.participantRole === 'admin' ? (
                        <VerifiedBadgeTick role="admin" size="md" />
                      ) : conv.isAgent || conv.participantRole === 'agent' ? (
                        <VerifiedBadgeTick role="agent" size="md" />
                      ) : (
                        conv.participantCode.replace('member#', '#')
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                          <span className="truncate">{conv.participantName}</span>
                          <VerifiedBadgeTick 
                            role={conv.participantRole || (conv.isAgent ? 'agent' : 'student')} 
                            referralCount={conv.referralCount || 0}
                            size="sm"
                          />
                        </span>
                        <span className="text-[10px] text-slate-400 shrink-0 ml-1">
                          {conv.lastMessageTime}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">
                        {conv.lastMessage || 'Tap to begin conversation...'}
                      </p>
                    </div>

                    {conv.unreadCount > 0 && (
                      <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* RIGHT AREA: Active Chat Thread */}
        <div
          className={`flex-1 flex flex-col bg-[#0c101c] ${
            mobileView === 'list' ? 'hidden sm:flex' : 'flex'
          }`}
        >
          {activeConversation ? (
            <>
              {/* Chat Room Header */}
              <div className="px-4 py-3 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {/* Mobile Back Button */}
                  <button
                    type="button"
                    onClick={() => setMobileView('list')}
                    className="sm:hidden p-2 text-slate-400 hover:text-white rounded-lg -ml-1 cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>

                  <div
                    className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold border ${
                      activeConversation.participantRole === 'admin'
                        ? 'bg-black border-slate-700 text-white'
                        : activeConversation.isAgent || activeConversation.participantRole === 'agent'
                        ? 'bg-slate-900 border-slate-700 text-slate-300'
                        : 'bg-indigo-950 border-indigo-700 text-indigo-400'
                    }`}
                  >
                    {activeConversation.participantRole === 'admin' ? (
                      <VerifiedBadgeTick role="admin" size="md" />
                    ) : activeConversation.isAgent || activeConversation.participantRole === 'agent' ? (
                      <VerifiedBadgeTick role="agent" size="md" />
                    ) : (
                      activeConversation.participantCode.replace('member#', '#')
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                      <span>{activeConversation.participantName}</span>
                      <VerifiedBadgeTick 
                        role={activeConversation.participantRole || (activeConversation.isAgent ? 'agent' : 'student')} 
                        referralCount={activeConversation.referralCount || 0}
                        size="sm"
                      />
                    </h3>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                      <span className="text-slate-300 font-medium font-mono">{activeConversation.participantCode}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">Confidential Direct Message</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {activeMessages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
                    <Sparkles className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-sm font-medium text-slate-300">
                      You are chatting anonymously with {activeConversation.participantName}.
                    </p>
                    <p className="text-xs text-slate-400 mt-1 max-w-xs">
                      Send a message below. Your identity is hidden behind your member code.
                    </p>
                  </div>
                ) : (
                  activeMessages.map((msg) => {
                    const isMe = msg.senderCode.toLowerCase() === myCode.toLowerCase();
                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div className="flex items-end gap-2 max-w-[85%] sm:max-w-[70%]">
                          {!isMe && (
                            <div className="w-6 h-6 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-[10px] text-slate-300 shrink-0 mb-1">
                              <VerifiedBadgeTick 
                                role={msg.senderRole} 
                                referralCount={msg.senderReferralCount || 0}
                                size="sm" 
                              />
                            </div>
                          )}

                          <div
                            className={`p-3 rounded-2xl text-sm leading-relaxed min-w-0 ${
                              isMe
                                ? 'bg-blue-600 text-white rounded-br-xs shadow-md'
                                : msg.senderRole === 'admin'
                                ? 'bg-slate-950 border border-slate-700 text-slate-100 rounded-bl-xs'
                                : msg.senderRole === 'agent'
                                ? 'bg-slate-900 border border-slate-700 text-slate-200 rounded-bl-xs'
                                : 'bg-slate-800/90 border border-slate-700/60 text-slate-200 rounded-bl-xs'
                            }`}
                          >
                            {!isMe && (
                              <div className="text-[10px] font-mono font-semibold mb-1 opacity-75 flex items-center gap-1">
                                <span>{msg.senderCode}</span>
                                <VerifiedBadgeTick 
                                  role={msg.senderRole} 
                                  referralCount={msg.senderReferralCount || 0}
                                  size="sm" 
                                />
                              </div>
                            )}
                            {msg.text && (
                              <p className="whitespace-pre-wrap break-words break-all [overflow-wrap:anywhere]">{msg.text}</p>
                            )}
                            
                            {/* Attached Image / File / Google Drive Photo */}
                            {msg.attachmentUrl && (() => {
                              const drive = parseGoogleDriveLink(msg.attachmentUrl);
                              const displaySrc = drive.isDriveLink && drive.directImageUrl ? drive.directImageUrl : msg.attachmentUrl;

                              return (
                                <div className="mt-2 rounded-xl overflow-hidden border border-white/20 max-w-sm">
                                  <a 
                                    href={msg.attachmentUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="block group relative"
                                  >
                                    <img 
                                      src={displaySrc} 
                                      alt="Chat attachment" 
                                      className="max-h-64 w-auto rounded-lg object-contain bg-black/40 hover:opacity-95 transition-opacity"
                                      loading="lazy"
                                    />
                                    {drive.isDriveLink && (
                                      <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-black/70 text-[9px] text-white flex items-center gap-1 font-mono">
                                        <span>Drive File</span>
                                      </div>
                                    )}
                                  </a>
                                </div>
                              );
                            })()}

                            {/* Message Reactions */}
                            {msg.reactions && Object.keys(msg.reactions).length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1.5 pt-1 border-t border-white/10">
                                {Object.entries(msg.reactions).map(([emoji, count]) => (
                                  <span
                                    key={`${msg.id}_rx_${emoji}`}
                                    className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] bg-black/30 border border-white/10"
                                  >
                                    <span>{emoji}</span>
                                    <span className="font-semibold text-xs">{count}</span>
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 mt-1 px-1">
                          {msg.timestamp}
                        </span>
                      </div>
                    );
                  })
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Upload Error & Attached Image Preview */}
              {uploadError && (
                <div className="px-4 py-1.5 bg-rose-950/70 border-t border-rose-800 text-rose-300 text-xs flex items-center justify-between">
                  <span>{uploadError}</span>
                  <button type="button" onClick={() => setUploadError(null)} className="text-rose-400 hover:text-white">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {attachedImageUrl && (
                <div className="px-4 py-2 bg-slate-950/90 border-t border-slate-800 flex items-center gap-3">
                  <div className="relative w-14 h-14 rounded-lg overflow-hidden border border-blue-500/50">
                    <img src={attachedImageUrl} alt="Attachment preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedImageUrl(null)}
                      className="absolute top-0.5 right-0.5 p-0.5 bg-black/80 rounded-full text-white hover:text-rose-400"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="text-xs text-slate-300">
                    <p className="font-medium text-blue-400">Photo attached</p>
                    <p className="text-[11px] text-slate-400">Ready for instant real-time delivery</p>
                  </div>
                </div>
              )}

              {/* Message Input Form */}
              <form
                onSubmit={handleSend}
                className="p-3 bg-slate-900/90 border-t border-slate-800 flex items-center gap-2"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleSelectImage}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingImage}
                  title="Upload photo or screenshot (Firebase 5GB Free Storage)"
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-blue-400 border border-slate-800 rounded-xl flex items-center justify-center transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                >
                  {isUploadingImage ? (
                    <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                  ) : (
                    <ImageIcon className="w-5 h-5" />
                  )}
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Message anonymously as ${myCode}...`}
                  className="flex-1 px-3.5 py-2.5 bg-slate-950 border border-slate-700/80 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                />
                <button
                  type="submit"
                  disabled={(!inputText.trim() && !attachedImageUrl) || isUploadingImage}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center gap-1.5 font-medium text-sm transition-all cursor-pointer min-h-[44px] shrink-0 active:scale-95"
                >
                  <Send className="w-4 h-4" />
                  <span className="hidden xs:inline">Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-700 mb-3" />
              <p className="text-sm font-medium text-slate-300">Select a conversation</p>
              <p className="text-xs text-slate-400 mt-1">
                Choose a chat from the sidebar or enter a friend's code.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* NEW CHAT MODAL */}
      <AnimatePresence>
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Start Anonymous Chat
                </h3>
                <button
                  type="button"
                  onClick={() => setShowNewChatModal(false)}
                  className="text-slate-400 hover:text-white text-xs cursor-pointer min-h-[36px] px-2"
                >
                  Cancel
                </button>
              </div>

              {newChatError && (
                <div className="p-2.5 bg-rose-950/50 border border-rose-800 text-rose-300 text-xs rounded-xl">
                  {newChatError}
                </div>
              )}

              {/* Option 1: Enter Friend's Code or Member ID */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Friend's Secret Code or Member ID:
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newFriendCodeInput}
                    onChange={(e) => setNewFriendCodeInput(e.target.value)}
                    placeholder="e.g. FRND-7K29 or member#02"
                    className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      handleCreateChat(newFriendCodeInput, undefined, false)
                    }
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold cursor-pointer min-h-[44px]"
                  >
                    Connect & Chat
                  </button>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ask your classmate for their private Friend Code (e.g. FRND-XXXX) to start chatting.
                </p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-2 text-slate-400 text-[11px]">OR SELECT FROM CAMPUS</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>

              {/* Option 2: Quick Pick School Support Agents (if any created) */}
              {agents.length > 0 && (
                <div>
                  <span className="block text-xs font-medium text-emerald-400 mb-2 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    School Support Agents & Counselors:
                  </span>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {agents.map((ag) => (
                      <button
                        key={ag.id}
                        type="button"
                        onClick={() =>
                          handleCreateChat(ag.agentCode, `${ag.name} [${ag.agentCode}]`, true)
                        }
                        className="w-full p-2 bg-slate-900/80 hover:bg-emerald-950/40 border border-slate-800 hover:border-emerald-600/40 rounded-xl text-left flex items-center justify-between cursor-pointer transition-colors min-h-[44px]"
                      >
                        <div>
                          <div className="text-xs font-semibold text-white">{ag.name} ({ag.agentCode})</div>
                          <div className="text-[11px] text-slate-400">{ag.department}</div>
                        </div>
                        <span className="text-[11px] text-emerald-400 font-medium">Chat &rarr;</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Option 3: Quick Pick Active Student Codes */}
              {students.filter((s) => s.memberCode.toLowerCase() !== myCode.toLowerCase()).length > 0 && (
                <div>
                  <span className="block text-xs font-medium text-slate-400 mb-2">
                    Known Campus Students:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {students
                      .filter((s) => s.memberCode.toLowerCase() !== myCode.toLowerCase())
                      .slice(0, 5)
                      .map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() =>
                            handleCreateChat(s.memberCode, `${s.alias} (${s.memberCode})`, false)
                          }
                          className="px-2.5 py-1.5 bg-slate-900 border border-slate-800 hover:border-blue-500/40 text-xs font-mono text-slate-300 rounded-lg cursor-pointer hover:text-blue-400 transition-colors min-h-[36px]"
                        >
                          {s.memberCode}
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
