import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  MessageSquare, 
  ThumbsUp, 
  Pin, 
  Tag, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  ShieldCheck, 
  EyeOff, 
  GraduationCap, 
  Compass, 
  Trophy, 
  Megaphone,
  X,
  Share2,
  Clock,
  Trash2,
  Lock,
  Unlock,
  CheckCircle2,
  CornerDownRight,
  AlertTriangle,
  Send,
  MessageCircle,
  Award,
  Video,
  Film,
  FileVideo,
  ShieldAlert,
  ChevronDown
} from 'lucide-react';
import { ForumChannel, ForumPost, ForumComment, UserRole, AgentAccount, StudentAccount } from '../types';
import { VerifiedBadgeTick } from './VerifiedBadgeTick';
import { validateVideoDuration, formatDuration, MAX_VIDEO_DURATION_SECONDS } from '../utils/videoUtils';
import { uploadToFirebaseStorage } from '../firebase/firebase';
import { parseGoogleDriveLink, compressImageToDataUrl, uploadDirectMedia, isGoogleDriveConnected, connectGoogleDrive } from '../utils/driveMediaUtils';
import { Image as ImageIcon, Loader2, ExternalLink, HardDrive, UploadCloud } from 'lucide-react';

interface ForumViewProps {
  channels: ForumChannel[];
  posts: ForumPost[];
  comments: ForumComment[];
  currentRole: UserRole;
  myCode: string;
  myLabel?: string;
  isBanned?: boolean;
  banReason?: string;
  agentAccount?: AgentAccount;
  students?: StudentAccount[];
  currentStudent?: StudentAccount;
  onLikePost: (postId: string) => void;
  onLikeComment?: (commentId: string) => void;
  onAddComment: (postId: string, content: string, parentId?: string | null, replyToCode?: string) => void;
  onCreatePost: (post: { 
    channelId: string; 
    title: string; 
    content: string; 
    tags: string[]; 
    isAnonymous: boolean;
    mediaUrl?: string;
    mediaType?: 'video' | 'image';
    mediaDuration?: number;
    mediaFileName?: string;
  }) => void;
  onDeletePost?: (postId: string) => void;
  onPinPost?: (postId: string) => void;
  onToggleLockPost?: (postId: string) => void;
  onToggleVerifyComment?: (commentId: string) => void;
  onDeleteComment?: (commentId: string) => void;
  onOpenWhatsAppReferral?: () => void;
}

export const ForumView: React.FC<ForumViewProps> = ({
  channels,
  posts,
  comments,
  currentRole,
  myCode,
  myLabel,
  isBanned = false,
  banReason,
  agentAccount,
  students = [],
  currentStudent,
  onLikePost,
  onLikeComment,
  onAddComment,
  onCreatePost,
  onDeletePost,
  onPinPost,
  onToggleLockPost,
  onToggleVerifyComment,
  onDeleteComment,
  onOpenWhatsAppReferral,
}) => {
  const [selectedChannelId, setSelectedChannelId] = useState<string>('all');
  const [isChannelDropdownOpen, setIsChannelDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'trending' | 'newest' | 'comments'>('trending');
  
  // Modals
  const [activePostForComments, setActivePostForComments] = useState<ForumPost | null>(null);
  const [isNewPostOpen, setIsNewPostOpen] = useState(false);

  // New Post Form State
  const [newPostChannelId, setNewPostChannelId] = useState<string>(channels[0]?.id || 'teachers-complaint');
  const [newPostTitle, setNewPostTitle] = useState('');
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostTagInput, setNewPostTagInput] = useState('');
  const [newPostTags, setNewPostTags] = useState<string[]>([]);
  const [newPostAnonymous, setNewPostAnonymous] = useState(true);

  // Video or Image Upload State (up to 5 mins video or 10MB photo)
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'video' | 'image' | null>(null);
  const [videoDuration, setVideoDuration] = useState<number | null>(null);
  const [videoFileName, setVideoFileName] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isValidatingVideo, setIsValidatingVideo] = useState(false);
  const [isUploadingMedia, setIsUploadingMedia] = useState(false);

  // New Comment State & Threading
  const [commentInput, setCommentInput] = useState('');
  const [replyingTo, setReplyingTo] = useState<{
    parentId: string;
    authorCode: string;
    authorLabel?: string;
    content: string;
  } | null>(null);

  // Check agent permission
  const canBan = currentRole === 'admin' || !!agentAccount?.canBanUsers;
  const canVerify = currentRole === 'admin' || !!agentAccount?.canVerifyAnswers;
  const canPin = currentRole === 'admin' || !!agentAccount?.canPinPosts;

  // Render Author Badge with Verified Tick
  // 3 referrals = Blue tick, Admin = Black tick, Agent = Grey tick
  const renderAuthorBadge = (
    role: UserRole, 
    authorCode: string, 
    authorLabel?: string, 
    isAnonymous?: boolean
  ) => {
    if (role === 'admin') {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-slate-100 font-sans text-xs">
          <span>Proctor Admin</span>
          <VerifiedBadgeTick role="admin" size="sm" />
        </span>
      );
    }

    if (role === 'agent') {
      return (
        <span className="inline-flex items-center gap-1 font-semibold text-emerald-300 font-mono text-xs">
          <span>{authorLabel || authorCode}</span>
          <VerifiedBadgeTick role="agent" size="sm" />
        </span>
      );
    }

    // Student: Look up student account by memberCode or friendCode
    const matched = students.find(
      (s) => s.memberCode === authorCode || s.friendCode === authorCode
    );
    const referralCount = matched?.referrals ?? (authorCode === myCode ? (currentStudent?.referrals ?? 0) : 0);
    const hasBlueTick = referralCount >= 3;

    return (
      <span className="inline-flex items-center gap-1 font-semibold text-blue-400 font-mono text-xs">
        <span>{isAnonymous ? authorCode : (authorLabel || authorCode)}</span>
        {hasBlueTick && (
          <VerifiedBadgeTick role="student" referralCount={referralCount} size="sm" />
        )}
      </span>
    );
  };

  // Icon mapping helper
  const renderChannelIcon = (iconName: string, className = 'w-4 h-4') => {
    switch (iconName) {
      case 'ShieldAlert': return <ShieldAlert className={className} />;
      case 'AlertTriangle': return <AlertTriangle className={className} />;
      case 'Megaphone': return <Megaphone className={className} />;
      case 'GraduationCap': return <GraduationCap className={className} />;
      case 'EyeOff': return <EyeOff className={className} />;
      case 'ShieldCheck': return <ShieldCheck className={className} />;
      case 'Trophy': return <Trophy className={className} />;
      case 'Compass': return <Compass className={className} />;
      default: return <MessageSquare className={className} />;
    }
  };

  // Filter & Sort Posts
  const filteredPosts = posts
    .filter((post) => {
      if (selectedChannelId !== 'all' && post.channelId !== selectedChannelId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = post.title.toLowerCase().includes(q);
        const matchesContent = post.content.toLowerCase().includes(q);
        const matchesAuthor = post.authorCode.toLowerCase().includes(q);
        const matchesTag = post.tags.some((t) => t.toLowerCase().includes(q));
        return matchesTitle || matchesContent || matchesAuthor || matchesTag;
      }
      return true;
    })
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      if (sortBy === 'trending') return b.likes - a.likes;
      if (sortBy === 'comments') return b.commentsCount - a.commentsCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  // Handle Add Tag
  const handleAddTag = (e: React.KeyboardEvent | React.MouseEvent) => {
    if ('key' in e && e.key !== 'Enter') return;
    e.preventDefault();
    const clean = newPostTagInput.trim().replace(/^#/, '');
    if (clean && !newPostTags.includes(clean)) {
      setNewPostTags([...newPostTags, clean]);
      setNewPostTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setNewPostTags(newPostTags.filter((t) => t !== tagToRemove));
  };

  // Direct Media Upload via Google Drive API / Cloud Storage
  const [driveConnected, setDriveConnected] = useState<boolean>(() => isGoogleDriveConnected());

  const handleDirectFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoError(null);
    const isVideo = file.type.startsWith('video/');

    if (isVideo) {
      setIsValidatingVideo(true);
      try {
        const validation = await validateVideoDuration(file);
        if (!validation.isValid) {
          setVideoError(validation.errorMessage || 'Video duration exceeds 5 minutes limit.');
          setIsValidatingVideo(false);
          return;
        }
        setVideoDuration(validation.durationSeconds);
      } catch (valErr: any) {
        setVideoError('Could not validate video duration.');
        setIsValidatingVideo(false);
        return;
      }
      setIsValidatingVideo(false);
    } else {
      setVideoDuration(null);
    }

    setVideoFile(file);
    setVideoFileName(file.name);
    setMediaType(isVideo ? 'video' : 'image');
    setIsUploadingMedia(true);

    try {
      const uploadRes = await uploadDirectMedia(file, 'forum');
      setVideoUrl(uploadRes.url);
      setDriveConnected(isGoogleDriveConnected());
    } catch (uploadErr: any) {
      console.error('Direct upload error:', uploadErr);
      setVideoError(uploadErr?.message || 'Media upload failed. Please try again.');
    } finally {
      setIsUploadingMedia(false);
    }
  };

  const handleConnectDrive = () => {
    connectGoogleDrive(
      () => {
        setDriveConnected(true);
      },
      (err) => {
        setVideoError('Google Drive connection cancelled or failed.');
      }
    );
  };

  const clearAttachedMedia = () => {
    setVideoFile(null);
    setVideoUrl(null);
    setMediaType(null);
    setVideoDuration(null);
    setVideoFileName(null);
    setVideoError(null);
  };


  // Handle New Post Submit
  const handleNewPostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;
    if (!newPostTitle.trim() || !newPostContent.trim()) return;

    onCreatePost({
      channelId: newPostChannelId,
      title: newPostTitle.trim(),
      content: newPostContent.trim(),
      tags: newPostTags.length > 0 ? newPostTags : ['Discussion'],
      isAnonymous: newPostAnonymous,
      mediaUrl: videoUrl || undefined,
      mediaType: mediaType || (videoUrl ? 'video' : undefined),
      mediaDuration: videoDuration || undefined,
      mediaFileName: videoFileName || undefined,
    });

    setNewPostTitle('');
    setNewPostContent('');
    setNewPostTags([]);
    clearAttachedMedia();
    setIsNewPostOpen(false);
  };

  // Handle Comment & Threaded Reply Submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isBanned) return;
    if (!activePostForComments || !commentInput.trim()) return;
    if (activePostForComments.isLocked && currentRole === 'student') return;

    onAddComment(
      activePostForComments.id,
      commentInput.trim(),
      replyingTo ? replyingTo.parentId : null,
      replyingTo ? replyingTo.authorCode : undefined
    );

    setCommentInput('');
    setReplyingTo(null);
  };

  // WhatsApp Share Post
  const handleSharePostOnWhatsApp = (post: ForumPost) => {
    const currentUrl = typeof window !== 'undefined' ? window.location.href : 'https://school-portal.edu';
    const text = `📢 *School Forum Discussion:*\n*${post.title}*\n\n"${post.content.slice(0, 140)}..."\n\n👉 Join discussion anonymously: ${currentUrl}`;
    window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`, '_blank');
  };

  // Active comments for modal
  const activeCommentsForPost = activePostForComments
    ? comments.filter((c) => c.postId === activePostForComments.id)
    : [];

  // Group into root comments and child replies
  const rootComments = activeCommentsForPost.filter((c) => !c.parentId);
  const getRepliesFor = (parentId: string) =>
    activeCommentsForPost.filter((c) => c.parentId === parentId);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-6">
      {/* Ban Warning Banner if student is suspended */}
      {isBanned && (
        <div className="p-4 bg-rose-950/60 border border-rose-800 rounded-2xl flex items-start gap-3 text-rose-200">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-rose-100 text-sm">
              Student Account Suspended by Campus Proctor
            </h4>
            <p className="leading-relaxed">
              Reason: <strong>{banReason || 'Repeated warning strikes / inappropriate language'}</strong>. You can read discussions and search study material, but creating posts and sending replies is disabled. Reach out to Counselor Lisa or Proctor via private chat for mediation.
            </p>
          </div>
        </div>
      )}

      {/* Top Action Bar: Search, Sort, New Topic, WhatsApp Referral */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-slate-900/80 p-3 sm:p-4 rounded-2xl border border-slate-800 backdrop-blur-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search MP Board doubts, physics derivations, canteen reviews, grievances..."
            className="w-full pl-10 pr-4 py-2.5 bg-slate-950/90 border border-slate-800 rounded-xl text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]"
          />
        </div>

        {/* Sort & Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-xs shrink-0">
            <button
              type="button"
              onClick={() => setSortBy('trending')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors min-h-[36px] ${
                sortBy === 'trending'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Trending
            </button>
            <button
              type="button"
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors min-h-[36px] ${
                sortBy === 'newest'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Newest
            </button>
            <button
              type="button"
              onClick={() => setSortBy('comments')}
              className={`px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-colors min-h-[36px] ${
                sortBy === 'comments'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Replies
            </button>
          </div>

          {/* WhatsApp Share / Referral Trigger */}
          {onOpenWhatsAppReferral && (
            <button
              type="button"
              onClick={onOpenWhatsAppReferral}
              className="px-3 py-2 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-700/60 text-emerald-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all min-h-[40px]"
              title="Share Friend Code on WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">WhatsApp Invite</span>
            </button>
          )}

          {/* New Discussion Button */}
          <button
            type="button"
            onClick={() => setIsNewPostOpen(true)}
            disabled={isBanned}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-600/20 transition-all min-h-[44px] shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>New Discussion</span>
          </button>
        </div>
      </div>

      {/* Unified Single Touch Downward Forum Selector */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        {/* Active Channel Header Bar with Downward Toggle */}
        <button
          type="button"
          onClick={() => setIsChannelDropdownOpen(!isChannelDropdownOpen)}
          className="w-full p-3.5 sm:p-4 flex items-center justify-between gap-3 text-left cursor-pointer hover:bg-slate-800/50 transition-colors"
          aria-expanded={isChannelDropdownOpen}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className={`p-2.5 rounded-xl border shrink-0 ${
              selectedChannelId === 'all'
                ? 'bg-blue-600/20 border-blue-500/40 text-blue-400'
                : 'bg-slate-800 border-slate-700 text-slate-200'
            }`}>
              {selectedChannelId === 'all' ? (
                <MessageSquare className="w-5 h-5 text-blue-400" />
              ) : (
                renderChannelIcon(channels.find(c => c.id === selectedChannelId)?.iconName || 'MessageSquare', 'w-5 h-5')
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                  Selected Forum Channel
                </span>
                <span className="text-[10px] px-2 py-0.2 rounded-full font-mono bg-blue-500/15 text-blue-400 border border-blue-500/30">
                  {selectedChannelId === 'all' 
                    ? `${posts.length} Topics` 
                    : `${posts.filter(p => p.channelId === selectedChannelId).length} Topics`}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white truncate mt-0.5">
                {selectedChannelId === 'all' 
                  ? 'All Discussions & Whistleblower Feeds' 
                  : channels.find(c => c.id === selectedChannelId)?.name}
              </h3>
              <p className="text-[11px] text-slate-400 truncate hidden sm:block">
                {selectedChannelId === 'all'
                  ? 'Displaying all discussions across Sunrays Higher Secondary School MP Board community.'
                  : channels.find(c => c.id === selectedChannelId)?.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="px-3 py-2 rounded-xl bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/40 text-blue-300 text-xs font-semibold flex items-center gap-1.5 transition-colors">
              <span>{isChannelDropdownOpen ? 'Close Channels' : 'Select Forum ▾'}</span>
              <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isChannelDropdownOpen ? 'rotate-180' : ''}`} />
            </span>
          </div>
        </button>

        {/* Downward Dropdown Channel Selector Grid */}
        <AnimatePresence>
          {isChannelDropdownOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-t border-slate-800 bg-slate-950/95 p-3 sm:p-4 space-y-3 overflow-hidden"
            >
              <div className="flex items-center justify-between text-xs text-slate-400 px-1">
                <span className="font-semibold text-slate-300">Touch or tap downward to select forum:</span>
                <span className="text-[11px] font-mono text-slate-500">{channels.length + 1} Channels Available</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {/* All Discussions Option */}
                <button
                  type="button"
                  onClick={() => {
                    setSelectedChannelId('all');
                    setIsChannelDropdownOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                    selectedChannelId === 'all'
                      ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-600/20'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 shrink-0 mt-0.5">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-white">All Discussions</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950/80 text-blue-400">
                        {posts.length}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                      Unified feed with all MP Board doubts, campus grievances, and confessions.
                    </p>
                  </div>
                </button>

                {/* Specific Channels */}
                {channels.map((ch) => {
                  const isSelected = selectedChannelId === ch.id;
                  const count = posts.filter((p) => p.channelId === ch.id).length;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        setSelectedChannelId(ch.id);
                        setIsChannelDropdownOpen(false);
                      }}
                      className={`p-3 rounded-xl border text-left flex items-start gap-3 cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-blue-600/20 border-blue-500 text-white shadow-md shadow-blue-600/20'
                          : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="p-2 rounded-lg bg-slate-800 text-slate-200 shrink-0 mt-0.5">
                        {renderChannelIcon(ch.iconName, 'w-4 h-4')}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <span className="text-xs font-bold text-white truncate">{ch.name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-950/80 text-slate-300 shrink-0">
                            {count}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                          {ch.description}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Posts Feed */}
      <div className="space-y-4">
          {filteredPosts.length === 0 ? (
            <div className="p-12 text-center bg-slate-900/40 border border-slate-800 rounded-2xl space-y-3">
              <MessageSquare className="w-10 h-10 text-slate-600 mx-auto" />
              <h3 className="text-sm font-bold text-slate-300">No discussions found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                No matching topics for this filter. Be the first to start a conversation or ask a doubt!
              </p>
            </div>
          ) : (
            filteredPosts.map((post) => {
              const channel = channels.find((c) => c.id === post.channelId);
              const postComments = comments.filter((c) => c.postId === post.id);

              return (
                <article
                  key={post.id}
                  className={`p-4 sm:p-5 bg-slate-900/80 border rounded-2xl transition-all space-y-3 ${
                    post.isPinned
                      ? 'border-amber-500/50 bg-amber-950/10'
                      : 'border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Top Meta */}
                  <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/15 text-blue-400 border border-blue-500/30">
                        {channel?.name || 'General'}
                      </span>
                      {post.isPinned && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                          <Pin className="w-3 h-3" /> PINNED NOTICE
                        </span>
                      )}
                      {post.isLocked && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                          <Lock className="w-3 h-3" /> LOCKED
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                      {renderAuthorBadge(post.authorRole, post.authorCode, post.authorLabel, post.isAnonymous)}
                      <span>•</span>
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Title & Body */}
                  <div>
                    <h2
                      onClick={() => setActivePostForComments(post)}
                      className="text-base sm:text-lg font-bold text-white hover:text-blue-400 transition-colors cursor-pointer leading-snug"
                    >
                      {post.title}
                    </h2>
                    <p
                      onClick={() => setActivePostForComments(post)}
                      className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed cursor-pointer line-clamp-3"
                    >
                      {post.content}
                    </p>

                    {/* Attached Video Player or Google Drive Embed */}
                    {post.mediaUrl && post.mediaType === 'video' && (() => {
                      const drive = parseGoogleDriveLink(post.mediaUrl);
                      if (drive.isDriveLink && drive.embedUrl) {
                        return (
                          <div className="mt-3 rounded-xl overflow-hidden bg-black border border-slate-800">
                            <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/90 text-[11px] text-slate-400 border-b border-slate-800">
                              <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                                <Video className="w-3.5 h-3.5" />
                                <span>Google Drive Video Stream (15GB Free)</span>
                              </span>
                              <a
                                href={post.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
                              >
                                <span>Open in Drive</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            </div>
                            <div className="relative aspect-video w-full">
                              <iframe
                                src={drive.embedUrl}
                                title={post.title}
                                className="w-full h-full border-0"
                                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                                allowFullScreen
                              />
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div className="mt-3 rounded-xl overflow-hidden bg-black/90 border border-slate-800">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950/80 text-[11px] text-slate-400 border-b border-slate-800/80">
                            <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                              <Video className="w-3.5 h-3.5" />
                              <span>Video Attachment</span>
                            </span>
                            {post.mediaDuration && (
                              <span className="font-mono text-slate-400 text-[10px]">
                                {formatDuration(post.mediaDuration)}
                              </span>
                            )}
                          </div>
                          <video
                            src={post.mediaUrl}
                            controls
                            className="w-full max-h-[280px] object-contain bg-black"
                            preload="metadata"
                          />
                        </div>
                      );
                    })()}

                    {/* Attached Photo / Screenshot / Google Drive Photo */}
                    {post.mediaUrl && post.mediaType === 'image' && (() => {
                      const drive = parseGoogleDriveLink(post.mediaUrl);
                      const displaySrc = drive.isDriveLink && drive.directImageUrl ? drive.directImageUrl : post.mediaUrl;
                      
                      return (
                        <div className="mt-3 rounded-xl overflow-hidden bg-slate-950/90 border border-slate-800">
                          <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800/80">
                            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                              <ImageIcon className="w-3.5 h-3.5" />
                              <span>{drive.isDriveLink ? 'Google Drive Image (15GB Free)' : 'Photo / Screenshot'}</span>
                            </span>
                            {drive.isDriveLink && (
                              <a
                                href={post.mediaUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                              >
                                <span>Drive File</span>
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <a href={post.mediaUrl} target="_blank" rel="noopener noreferrer" className="block group">
                            <img
                              src={displaySrc}
                              alt={post.title}
                              className="w-full max-h-[300px] object-contain bg-black/40 hover:opacity-95 transition-opacity"
                              loading="lazy"
                            />
                          </a>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Tags */}
                  {post.tags && post.tags.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {post.tags.map((tag, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-lg text-[10px] font-mono bg-slate-950/80 text-slate-400 border border-slate-800"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Bottom Actions Row */}
                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-3 text-xs flex-wrap">
                    <div className="flex items-center gap-2">
                      {/* Upvote Button */}
                      <button
                        type="button"
                        onClick={() => onLikePost(post.id)}
                        className={`px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer transition-colors min-h-[36px] ${
                          post.likedBy?.includes(myCode)
                            ? 'bg-blue-600 text-white'
                            : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5" />
                        <span>{post.likes}</span>
                      </button>

                      {/* Comments / Open Thread Button */}
                      <button
                        type="button"
                        onClick={() => setActivePostForComments(post)}
                        className="px-3 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 rounded-lg font-medium flex items-center gap-1.5 cursor-pointer border border-slate-800 transition-colors min-h-[36px]"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                        <span>{postComments.length} Replies</span>
                      </button>

                      {/* WhatsApp Share Button */}
                      <button
                        type="button"
                        onClick={() => handleSharePostOnWhatsApp(post)}
                        className="px-2.5 py-1.5 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 rounded-lg font-medium flex items-center gap-1 cursor-pointer transition-colors min-h-[36px]"
                        title="Share on WhatsApp class group"
                      >
                        <Share2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="hidden xs:inline text-[11px]">WhatsApp</span>
                      </button>
                    </div>

                    {/* Proctor & Agent Controls */}
                    {(currentRole === 'admin' || currentRole === 'agent') && (
                      <div className="flex items-center gap-1">
                        {canPin && onPinPost && (
                          <button
                            type="button"
                            onClick={() => onPinPost(post.id)}
                            className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg cursor-pointer hover:bg-slate-800"
                            title={post.isPinned ? 'Unpin Discussion' : 'Pin to Top'}
                          >
                            <Pin className="w-4 h-4" />
                          </button>
                        )}

                        {onToggleLockPost && (
                          <button
                            type="button"
                            onClick={() => onToggleLockPost(post.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-slate-800"
                            title={post.isLocked ? 'Unlock Thread' : 'Lock Thread'}
                          >
                            {post.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                          </button>
                        )}

                        {currentRole === 'admin' && onDeletePost && (
                          <button
                            type="button"
                            onClick={() => onDeletePost(post.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer hover:bg-slate-800"
                            title="Delete Discussion"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </article>
              );
            })
          )}
        </div>

      {/* THREADED COMMENTS & REPLY MODAL / DRAWER */}
      <AnimatePresence>
        {activePostForComments && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              className="w-full max-w-3xl bg-[#111827] border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl max-h-[92vh] flex flex-col my-auto text-slate-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 border-b border-slate-800 pb-3 shrink-0">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-blue-400 font-mono font-semibold">
                      {channels.find((c) => c.id === activePostForComments.channelId)?.name}
                    </span>
                    {activePostForComments.isLocked && (
                      <span className="px-2 py-0.5 rounded text-[10px] bg-rose-500/20 text-rose-300 font-mono font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white mt-1">
                    {activePostForComments.title}
                  </h3>
                  <div className="text-xs text-slate-400 mt-1.5 flex items-center gap-2 flex-wrap">
                    <span>Posted by</span>
                    {renderAuthorBadge(
                      activePostForComments.authorRole, 
                      activePostForComments.authorCode, 
                      activePostForComments.authorLabel, 
                      activePostForComments.isAnonymous
                    )}
                    <span>•</span>
                    <span>{new Date(activePostForComments.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setActivePostForComments(null);
                    setReplyingTo(null);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Scrollable Content: Post Body & Threaded Comments */}
              <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
                {/* Post body */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-wrap">
                  {activePostForComments.content}
                </div>

                {/* Attached Video Proof Player or Google Drive Embed */}
                {activePostForComments.mediaUrl && activePostForComments.mediaType === 'video' && (() => {
                  const drive = parseGoogleDriveLink(activePostForComments.mediaUrl);
                  if (drive.isDriveLink && drive.embedUrl) {
                    return (
                      <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
                        <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
                          <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                            <Video className="w-3.5 h-3.5" />
                            <span>Google Drive Video Stream (15GB Free)</span>
                          </span>
                          <a
                            href={activePostForComments.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-blue-400 hover:underline"
                          >
                            <span>Open Drive</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <div className="relative aspect-video w-full">
                          <iframe
                            src={drive.embedUrl}
                            title={activePostForComments.title}
                            className="w-full h-full border-0"
                            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                            allowFullScreen
                          />
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div className="rounded-xl overflow-hidden bg-black/90 border border-slate-800">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 text-blue-400 font-semibold">
                          <Video className="w-3.5 h-3.5" />
                          <span>Attached Video Proof</span>
                        </span>
                        {activePostForComments.mediaDuration && (
                          <span className="font-mono text-slate-400 text-[10px]">
                            {formatDuration(activePostForComments.mediaDuration)}
                          </span>
                        )}
                      </div>
                      <video
                        src={activePostForComments.mediaUrl}
                        controls
                        className="w-full max-h-[360px] object-contain bg-black"
                        preload="metadata"
                      />
                    </div>
                  );
                })()}

                {/* Attached Photo / Screenshot / Drive Photo Preview */}
                {activePostForComments.mediaUrl && activePostForComments.mediaType === 'image' && (() => {
                  const drive = parseGoogleDriveLink(activePostForComments.mediaUrl);
                  const displaySrc = drive.isDriveLink && drive.directImageUrl ? drive.directImageUrl : activePostForComments.mediaUrl;

                  return (
                    <div className="rounded-xl overflow-hidden bg-slate-950 border border-slate-800">
                      <div className="flex items-center justify-between px-3 py-1.5 bg-slate-950 text-[11px] text-slate-400 border-b border-slate-800">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <ImageIcon className="w-3.5 h-3.5" />
                          <span>{drive.isDriveLink ? 'Google Drive Image (15GB Free)' : 'Attached Photo'}</span>
                        </span>
                        {drive.isDriveLink && (
                          <a
                            href={activePostForComments.mediaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-[10px] text-emerald-400 hover:underline"
                          >
                            <span>Drive File</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                      <a href={activePostForComments.mediaUrl} target="_blank" rel="noopener noreferrer" className="block">
                        <img
                          src={displaySrc}
                          alt={activePostForComments.title}
                          className="w-full max-h-[360px] object-contain bg-black/40 hover:opacity-95 transition-opacity"
                          loading="lazy"
                        />
                      </a>
                    </div>
                  );
                })()}

                {/* Upvotes row */}
                <div className="flex items-center justify-between text-xs pt-1 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => onLikePost(activePostForComments.id)}
                      className="px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/40 rounded-lg flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{activePostForComments.likes} Upvotes</span>
                    </button>
                    <span className="text-slate-400">
                      {activeCommentsForPost.length} Total Replies
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSharePostOnWhatsApp(activePostForComments)}
                    className="text-emerald-400 hover:text-emerald-300 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share on WhatsApp</span>
                  </button>
                </div>

                {/* Threaded Comments List */}
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Threaded Discussion & Replies
                  </h4>

                  {rootComments.length === 0 ? (
                    <div className="p-8 text-center bg-slate-900/40 rounded-xl border border-slate-800/60 space-y-2">
                      <MessageSquare className="w-6 h-6 text-slate-600 mx-auto" />
                      <p className="text-xs text-slate-400 italic">
                        No replies yet. Be the first to answer this doubt or join the discussion!
                      </p>
                    </div>
                  ) : (
                    rootComments.map((rootComm) => {
                      const childReplies = getRepliesFor(rootComm.id);

                      return (
                        <div key={rootComm.id} className="space-y-2.5">
                          {/* ROOT COMMENT CARD */}
                          <div
                            className={`p-3.5 bg-slate-900/90 border rounded-xl text-xs space-y-2 transition-all ${
                              rootComm.isVerifiedSolution
                                ? 'border-emerald-500/60 bg-emerald-950/20'
                                : 'border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                {renderAuthorBadge(rootComm.authorRole, rootComm.authorCode, rootComm.authorLabel)}

                                {rootComm.isVerifiedSolution && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[10px] font-bold flex items-center gap-1 font-mono">
                                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                                    VERIFIED SOLUTION
                                  </span>
                                )}
                              </div>

                              <span className="text-[10px] text-slate-500 font-mono">
                                {new Date(rootComm.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>

                            <p className="text-slate-200 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap">
                              {rootComm.content}
                            </p>

                            {/* Comment Actions Row */}
                            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                              <div className="flex items-center gap-3">
                                {/* Like comment */}
                                {onLikeComment && (
                                  <button
                                    type="button"
                                    onClick={() => onLikeComment(rootComm.id)}
                                    className="text-slate-400 hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                                  >
                                    <ThumbsUp className="w-3 h-3" />
                                    <span>{rootComm.likes || 0}</span>
                                  </button>
                                )}

                                {/* Reply Button */}
                                {!activePostForComments.isLocked && !isBanned && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setReplyingTo({
                                        parentId: rootComm.id,
                                        authorCode: rootComm.authorCode,
                                        authorLabel: rootComm.authorLabel,
                                        content: rootComm.content,
                                      });
                                    }}
                                    className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                                  >
                                    <CornerDownRight className="w-3 h-3" />
                                    <span>Reply</span>
                                  </button>
                                )}
                              </div>

                              {/* Proctor / Agent Controls */}
                              <div className="flex items-center gap-2">
                                {canVerify && onToggleVerifyComment && (
                                  <button
                                    type="button"
                                    onClick={() => onToggleVerifyComment(rootComm.id)}
                                    className={`px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors ${
                                      rootComm.isVerifiedSolution
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                                    }`}
                                  >
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>{rootComm.isVerifiedSolution ? 'Verified' : 'Verify Solution'}</span>
                                  </button>
                                )}

                                {(currentRole === 'admin' || canBan) && onDeleteComment && (
                                  <button
                                    type="button"
                                    onClick={() => onDeleteComment(rootComm.id)}
                                    className="p-1 text-slate-500 hover:text-rose-400 cursor-pointer"
                                    title="Delete Comment"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* NESTED / THREADED CHILD REPLIES */}
                          {childReplies.length > 0 && (
                            <div className="ml-4 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-slate-700/60 space-y-2">
                              {childReplies.map((child) => (
                                <div
                                  key={child.id}
                                  className="p-3 bg-slate-900/60 border border-slate-800/80 rounded-xl text-xs space-y-1.5"
                                >
                                  <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      {renderAuthorBadge(child.authorRole, child.authorCode, child.authorLabel)}

                                      {child.replyToCode && (
                                        <span className="text-[10px] text-slate-400 font-mono">
                                          replied to <strong className="text-cyan-400">@{child.replyToCode}</strong>
                                        </span>
                                      )}

                                      {child.isVerifiedSolution && (
                                        <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                                          Verified
                                        </span>
                                      )}
                                    </div>

                                    <span className="text-[10px] text-slate-500 font-mono">
                                      {new Date(child.createdAt).toLocaleTimeString([], {
                                        hour: '2-digit',
                                        minute: '2-digit',
                                      })}
                                    </span>
                                  </div>

                                  <p className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap">
                                    {child.content}
                                  </p>

                                  {/* Sub-reply action */}
                                  <div className="pt-1 flex items-center justify-between text-[10px]">
                                    {!activePostForComments.isLocked && !isBanned && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          setReplyingTo({
                                            parentId: rootComm.id,
                                            authorCode: child.authorCode,
                                            authorLabel: child.authorLabel,
                                            content: child.content,
                                          });
                                        }}
                                        className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 cursor-pointer"
                                      >
                                        <CornerDownRight className="w-2.5 h-2.5" />
                                        <span>Reply to @{child.authorCode}</span>
                                      </button>
                                    )}

                                    {(currentRole === 'admin' || canBan) && onDeleteComment && (
                                      <button
                                        type="button"
                                        onClick={() => onDeleteComment(child.id)}
                                        className="text-slate-500 hover:text-rose-400 cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Bottom Comment Input Form with Replying-To Banner */}
              <div className="pt-3 border-t border-slate-800 space-y-2 shrink-0">
                {/* Replying banner */}
                {replyingTo && (
                  <div className="flex items-center justify-between px-3 py-1.5 bg-blue-950/70 border border-blue-800/60 rounded-xl text-xs text-blue-300">
                    <div className="flex items-center gap-2 truncate">
                      <CornerDownRight className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="font-semibold shrink-0">
                        Replying to @{replyingTo.authorLabel || replyingTo.authorCode}:
                      </span>
                      <span className="text-slate-400 truncate italic">
                        "{replyingTo.content.slice(0, 45)}..."
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setReplyingTo(null)}
                      className="p-1 hover:text-white text-slate-400 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                {activePostForComments.isLocked ? (
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-center text-xs text-slate-400 flex items-center justify-center gap-2">
                    <Lock className="w-4 h-4 text-rose-400" />
                    <span>This discussion thread has been locked by school proctors. Replies are disabled.</span>
                  </div>
                ) : isBanned ? (
                  <div className="p-3 bg-rose-950/40 border border-rose-800 rounded-xl text-center text-xs text-rose-300">
                    Your student account is suspended. You cannot post comments.
                  </div>
                ) : (
                  <form onSubmit={handleCommentSubmit} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={commentInput}
                      onChange={(e) => setCommentInput(e.target.value)}
                      placeholder={
                        replyingTo
                          ? `Replying to @${replyingTo.authorCode}...`
                          : `Reply anonymously as ${myCode}...`
                      }
                      className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-base sm:text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 min-h-[44px]"
                    />
                    <button
                      type="submit"
                      disabled={!commentInput.trim()}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white rounded-xl text-xs font-bold cursor-pointer min-h-[44px] shrink-0 flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </form>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* NEW DISCUSSION MODAL */}
      <AnimatePresence>
        {isNewPostOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl text-slate-200 my-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">Start a New Discussion</h3>
                    <p className="text-xs text-slate-400">
                      Share doubts, study notes, campus confessions, or inquiries
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsNewPostOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleNewPostSubmit} className="space-y-4 pt-4 text-xs">
                {/* Touch Channel Picker Grid */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-slate-300 font-semibold block">
                      Select Campus Channel / Forum Type:
                    </label>
                    <span className="text-[10px] text-blue-400 font-mono">Touch to select</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
                    {channels.map((ch) => {
                      const isSelected = newPostChannelId === ch.id;
                      return (
                        <button
                          key={ch.id}
                          type="button"
                          onClick={() => setNewPostChannelId(ch.id)}
                          className={`p-2.5 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer min-h-[58px] ${
                            isSelected
                              ? 'bg-blue-600/25 border-blue-500 text-white ring-1 ring-blue-500/50 shadow-sm'
                              : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            {renderChannelIcon(ch.iconName, `w-3.5 h-3.5 ${isSelected ? 'text-blue-400' : 'text-slate-400'}`)}
                            <span className="font-semibold text-[11px] truncate leading-tight">{ch.name}</span>
                          </div>
                          <span className="text-[9px] text-slate-500 truncate mt-1">
                            {ch.slug}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Title / Topic:
                  </label>
                  <input
                    type="text"
                    value={newPostTitle}
                    onChange={(e) => setNewPostTitle(e.target.value)}
                    placeholder="e.g. Class 12 Physics: AC Alternating Current derivation doubt"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500"
                    required
                  />
                </div>

                {/* Content */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Discussion Details & Doubt Explanation:
                  </label>
                  <textarea
                    rows={4}
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    placeholder="Explain your problem, add numerical details, or share your thoughts openly..."
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:ring-1 focus:ring-blue-500 leading-relaxed"
                    required
                  />
                </div>

                {/* Tags */}
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">
                    Subject / Topic Tags:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newPostTagInput}
                      onChange={(e) => setNewPostTagInput(e.target.value)}
                      onKeyDown={handleAddTag}
                      placeholder="Add tag (e.g. MPBoard, NCERT, PW) and press Enter"
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddTag}
                      className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg"
                    >
                      Add
                    </button>
                  </div>
                  {newPostTags.length > 0 && (
                    <div className="flex gap-1.5 flex-wrap mt-2">
                      {newPostTags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[11px] font-mono flex items-center gap-1"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="hover:text-white"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Direct Google Drive API & Cloud Media Proof Attachment */}
                <div className="p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="font-semibold text-white flex items-center gap-1.5 text-xs">
                      <HardDrive className="w-4 h-4 text-blue-400" />
                      <span>Attach Proof / Notes (Google Drive API Direct Upload)</span>
                    </label>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-500/15 text-blue-300 border border-blue-500/30 flex items-center gap-1">
                      <UploadCloud className="w-3 h-3 text-blue-400" />
                      <span>{driveConnected ? 'Google Drive (15GB Direct)' : 'Direct Cloud Upload'}</span>
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Upload photos of question papers, handwritten derivations, or video evidence of campus issues (up to 5 mins). Directly uploaded in real-time via Google Drive API with public preview.
                  </p>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Direct Video Upload */}
                    <label className="px-3 py-2 rounded-xl bg-purple-950/40 hover:bg-purple-900/60 border border-purple-800/60 text-purple-300 font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition-colors">
                      <FileVideo className="w-3.5 h-3.5 text-purple-400" />
                      <span>{videoFile && mediaType === 'video' ? 'Change Video' : 'Direct Upload Video (≤5m)'}</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleDirectFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Direct Photo Upload */}
                    <label className="px-3 py-2 rounded-xl bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/60 text-emerald-300 font-semibold cursor-pointer text-xs flex items-center gap-1.5 transition-colors">
                      <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{videoFile && mediaType === 'image' ? 'Change Photo' : 'Direct Upload Photo / Doc'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleDirectFileUpload}
                        className="hidden"
                      />
                    </label>

                    {/* Selected File Badge */}
                    {videoFile && (
                      <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 px-2.5 py-1.5 rounded-lg border border-slate-800">
                        {mediaType === 'video' && videoDuration && (
                          <span className="px-1.5 py-0.2 rounded bg-purple-500/20 text-purple-300 font-mono font-bold text-[10px]">
                            {formatDuration(videoDuration)}
                          </span>
                        )}
                        {mediaType === 'image' && (
                          <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold text-[10px]">
                            PHOTO
                          </span>
                        )}
                        <span className="truncate max-w-[140px] text-slate-300 text-[11px]">
                          {videoFileName}
                        </span>
                        <button
                          type="button"
                          onClick={clearAttachedMedia}
                          className="p-0.5 text-slate-500 hover:text-rose-400 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}

                    {isUploadingMedia && (
                      <span className="text-[11px] text-blue-400 flex items-center gap-1">
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Directly uploading media in real-time...</span>
                      </span>
                    )}

                    {isValidatingVideo && (
                      <span className="text-[11px] text-purple-400 animate-pulse">
                        Checking video duration...
                      </span>
                    )}
                  </div>


                  {videoError && (
                    <div className="p-2 bg-rose-950/40 border border-rose-800/60 rounded-lg text-rose-300 text-[11px] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                      <span>{videoError}</span>
                    </div>
                  )}

                  {videoUrl && mediaType === 'video' && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 bg-black">
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-[160px] object-contain"
                      />
                    </div>
                  )}

                  {videoUrl && mediaType === 'image' && (
                    <div className="mt-2 rounded-lg overflow-hidden border border-slate-800 bg-black/60 flex items-center justify-center p-2">
                      <img
                        src={videoUrl}
                        alt="Preview"
                        className="max-h-[160px] object-contain rounded"
                      />
                    </div>
                  )}
                </div>

                {/* Anonymous Toggle */}
                <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-white block">Post Anonymously</span>
                    <span className="text-[11px] text-slate-400">
                      Displays only your anonymous member code ({myCode})
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPostAnonymous}
                    onChange={(e) => setNewPostAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-blue-600"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsNewPostOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow-md shadow-blue-600/20"
                  >
                    Publish Discussion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
