import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Phone, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Image as ImageIcon, 
  Video, 
  Calendar, 
  CheckCircle2, 
  XCircle, 
  Edit3, 
  Trash2, 
  Share2, 
  MessageCircle,
  Play,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { Profile, CustomField } from '../types';

interface ProfileDetailModalProps {
  profile: Profile | null;
  customFields: CustomField[];
  canEdit: boolean;
  isAdmin: boolean;
  onClose: () => void;
  onEdit: (profile: Profile) => void;
  onDelete: (id: string) => void;
}

export const ProfileDetailModal: React.FC<ProfileDetailModalProps> = ({
  profile,
  customFields,
  canEdit,
  isAdmin,
  onClose,
  onEdit,
  onDelete,
}) => {
  const [activeMediaTab, setActiveMediaTab] = useState<'photos' | 'videos'>('photos');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number>(0);
  const [activeVideoUrl, setActiveVideoUrl] = useState<string | null>(null);
  const [lightboxPhoto, setLightboxPhoto] = useState<string | null>(null);
  const [copiedNotification, setCopiedNotification] = useState<string | null>(null);

  if (!profile) return null;

  const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${profile.address.street}, ${profile.address.city}, ${profile.address.country}`
  )}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(`Copied ${label} to clipboard!`);
    setTimeout(() => setCopiedNotification(null), 2200);
  };

  const renderCustomValue = (field: CustomField, val: any) => {
    if (val === undefined || val === null || val === '') {
      return <span className="text-slate-600 italic text-xs">Not specified</span>;
    }

    switch (field.type) {
      case 'boolean':
        return val ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 text-xs font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Yes / Verified
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 text-xs font-medium">
            <XCircle className="w-3.5 h-3.5 text-slate-500" /> No
          </span>
        );
      case 'badge':
        return (
          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-950/80 text-blue-300 border border-blue-800/60">
            {String(val)}
          </span>
        );
      case 'url':
        return (
          <a
            href={String(val)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs hover:underline font-mono"
          >
            <span>{String(val)}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        );
      case 'email':
        return (
          <a
            href={`mailto:${String(val)}`}
            className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs hover:underline"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>{String(val)}</span>
          </a>
        );
      case 'date':
        return (
          <span className="inline-flex items-center gap-1.5 text-xs text-slate-200 font-mono">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            {new Date(val).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        );
      default:
        return <span className="text-xs text-slate-200">{String(val)}</span>;
    }
  };

  return (
    <div
      id="profile-detail-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto"
    >
      {/* Lightbox for Zoomed Photo */}
      <AnimatePresence>
        {lightboxPhoto && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setLightboxPhoto(null)}
          >
            <button
              type="button"
              onClick={() => setLightboxPhoto(null)}
              className="absolute top-4 right-4 p-2 bg-slate-800/90 text-white rounded-full hover:bg-slate-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={lightboxPhoto}
              alt="High resolution view"
              className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden relative text-slate-200"
      >
        {/* Copied alert toast */}
        <AnimatePresence>
          {copiedNotification && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="absolute top-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{copiedNotification}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Modal Top Hero / Cover */}
        <div className="relative h-44 sm:h-52 w-full bg-slate-900 shrink-0">
          <img
            src={profile.photos[0] || profile.avatarUrl}
            alt={profile.fullName}
            className="w-full h-full object-cover opacity-60"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-slate-950/40 to-black/50" />

          {/* Top close & actions */}
          <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
            {canEdit && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(profile);
                }}
                className="px-3 py-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white text-xs font-medium rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>
            )}
            {isAdmin && (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to permanently delete profile for ${profile.fullName}?`)) {
                    onDelete(profile.id);
                    onClose();
                  }
                }}
                className="p-1.5 bg-rose-950/60 hover:bg-rose-900/80 backdrop-blur-md border border-rose-700/60 text-rose-300 rounded-lg transition-colors cursor-pointer"
                title="Delete Profile"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 text-white rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Identity Overlay */}
          <div className="absolute bottom-4 left-6 right-6 flex items-end justify-between gap-4">
            <div className="flex items-end gap-4">
              <img
                src={profile.avatarUrl}
                alt={profile.fullName}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border-4 border-[#0d131f] bg-slate-800 shadow-xl shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="pb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                    {profile.fullName}
                  </h2>
                  <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {profile.category}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    profile.status === 'active'
                      ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800/60'
                      : 'bg-amber-950/80 text-amber-300 border border-amber-800/60'
                  }`}>
                    {profile.status}
                  </span>
                </div>
                <p className="text-sm text-slate-300 font-medium mt-0.5">
                  {profile.roleTitle}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Action Contact Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <a
              href={`tel:${cleanPhone}`}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/70 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0">
                <Phone className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">Phone Call</span>
                <span className="text-xs font-semibold text-white group-hover:text-blue-400 transition-colors truncate block">
                  {profile.phone}
                </span>
              </div>
            </a>

            <a
              href={`https://wa.me/${(profile.whatsappNumber || cleanPhone).replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/70 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0">
                <MessageCircle className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">WhatsApp</span>
                <span className="text-xs font-semibold text-white group-hover:text-emerald-400 transition-colors truncate block">
                  {profile.whatsappNumber || profile.phone}
                </span>
              </div>
            </a>

            <a
              href={`mailto:${profile.email}`}
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/70 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">Email</span>
                <span className="text-xs font-semibold text-white group-hover:text-indigo-400 transition-colors truncate block">
                  {profile.email}
                </span>
              </div>
            </a>

            <a
              href={mapsUrl}
              target="_blank"
              rel="noreferrer"
              className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/70 transition-all flex items-center gap-3 group"
            >
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] text-slate-400 block">Address Location</span>
                <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate block">
                  {profile.address.city}, {profile.address.country}
                </span>
              </div>
            </a>
          </div>

          {/* Indian School Academic, Coaching & Social Dossier */}
          <div className="bg-slate-900/70 p-4 sm:p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <span>Student Academic, Coaching & Social Records</span>
              </h3>
              <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 text-[10px] font-mono">
                {profile.board || 'MP Board'} Board
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Class & Stream</span>
                <span className="text-white font-semibold block truncate">
                  {profile.classGrade || 'Class 12-A'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Roll & Admission No</span>
                <span className="text-blue-400 font-mono font-bold block truncate">
                  Roll #{profile.rollNo || 'N/A'} • {profile.admissionNo || 'N/A'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Coaching Institute</span>
                <span className="text-emerald-400 font-semibold block truncate">
                  {profile.coachingInstitute || 'Self Study'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">House & Score</span>
                <span className="text-amber-400 font-semibold block truncate">
                  {profile.house ? `${profile.house} House` : 'Tagore'} {profile.averageScore ? `• ${profile.averageScore}%` : ''}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Gender & Relationship</span>
                <span className="text-purple-300 font-medium block truncate">
                  {profile.gender || 'Not specified'} • {profile.relationshipStatus || 'Single'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Instagram Primary</span>
                <span className="text-pink-400 font-mono font-semibold block truncate">
                  {profile.instagramId || 'None'} {profile.instaStatus ? `(${profile.instaStatus})` : ''}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Secondary Instagram</span>
                <span className="text-pink-300 font-mono block truncate">
                  {profile.secondaryInstagramId || 'None'}
                </span>
              </div>

              <div className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                <span className="text-slate-500 block text-[11px]">Faculty Advisor</span>
                <span className="text-slate-200 font-medium block truncate">
                  {profile.teacherAdvisor || 'Mr. Rakesh Verma'}
                </span>
              </div>
            </div>

            {/* Parents Details Grid */}
            <div className="p-3 bg-slate-950/90 rounded-lg border border-slate-800 space-y-2 text-xs">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Parental & Family Records
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Father: </span>
                  <strong className="text-white">{profile.fathersName || 'Not recorded'}</strong>
                  {profile.fathersOccupation && (
                    <span className="text-slate-400"> ({profile.fathersOccupation})</span>
                  )}
                </div>
                <div>
                  <span className="text-slate-500">Mother: </span>
                  <strong className="text-white">{profile.mothersName || 'Not recorded'}</strong>
                  {profile.mothersOccupation && (
                    <span className="text-slate-400"> ({profile.mothersOccupation})</span>
                  )}
                </div>
                {profile.emergencyContact && (
                  <div className="sm:col-span-2 text-amber-400 font-mono text-[11px]">
                    Emergency Parent Contact: {profile.emergencyContact}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bio / Summary */}
          {profile.bio && (
            <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                Professional Bio & Background
              </h3>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {profile.bio}
              </p>
            </div>
          )}

          {/* Address Card */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-amber-400" />
                Physical Address Details
              </h3>
              <button
                type="button"
                onClick={() =>
                  copyToClipboard(
                    `${profile.address.street}, ${profile.address.city}, ${profile.address.country}`,
                    'Address'
                  )
                }
                className="text-[11px] text-slate-400 hover:text-white transition-colors"
              >
                Copy Address
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-500 block">Street Address:</span>
                <span className="text-white font-medium">{profile.address.street}</span>
              </div>
              <div>
                <span className="text-slate-500 block">City & State/Province:</span>
                <span className="text-white font-medium">
                  {profile.address.city}
                  {profile.address.state ? `, ${profile.address.state}` : ''}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Country:</span>
                <span className="text-white font-medium">{profile.address.country}</span>
              </div>
              <div>
                <span className="text-slate-500 block">Postal / Zip Code:</span>
                <span className="text-white font-mono">{profile.address.postalCode || '—'}</span>
              </div>
            </div>
          </div>

          {/* Dynamic Custom Fields Section */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                Dynamic Custom Fields (Admin Defined)
              </h3>
              <span className="text-[11px] text-slate-500">
                {customFields.length} configured fields
              </span>
            </div>

            {customFields.length === 0 ? (
              <p className="text-xs text-slate-500 italic">
                No custom fields configured yet. Create new fields in the Admin Panel.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {customFields.map((field) => (
                  <div
                    key={field.id}
                    className="p-3 bg-slate-950/70 rounded-lg border border-slate-800/80"
                  >
                    <span className="text-[11px] text-slate-400 block font-medium mb-1">
                      {field.label}
                    </span>
                    <div>{renderCustomValue(field, profile.customValues?.[field.key])}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Media Section: Photos & Videos Tabs */}
          <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('photos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMediaTab === 'photos'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Photos Gallery ({profile.photos.length})</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveMediaTab('videos')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    activeMediaTab === 'videos'
                      ? 'bg-blue-600 text-white'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Video className="w-3.5 h-3.5" />
                  <span>Videos Gallery ({profile.videos.length})</span>
                </button>
              </div>
              <span className="text-[11px] text-slate-500 hidden sm:inline">
                Click any photo to inspect full resolution
              </span>
            </div>

            {/* Photos Tab */}
            {activeMediaTab === 'photos' && (
              <div>
                {profile.photos.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No photos attached to this profile.
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {profile.photos.map((photoUrl, idx) => (
                      <div
                        key={idx}
                        onClick={() => setLightboxPhoto(photoUrl)}
                        className="group relative h-28 sm:h-36 rounded-xl overflow-hidden bg-slate-950 border border-slate-800 cursor-zoom-in"
                      >
                        <img
                          src={photoUrl}
                          alt={`${profile.fullName} media ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                          <Maximize2 className="w-5 h-5" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Videos Tab */}
            {activeMediaTab === 'videos' && (
              <div>
                {profile.videos.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-4 text-center">
                    No video clips attached to this profile.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {profile.videos.map((videoUrl, vIdx) => (
                      <div
                        key={vIdx}
                        className="rounded-xl overflow-hidden bg-black border border-slate-800"
                      >
                        <div className="p-2 bg-slate-950 text-xs font-mono text-slate-400 flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Video className="w-3.5 h-3.5 text-rose-400" />
                            Video Stream #{vIdx + 1}
                          </span>
                          <a
                            href={videoUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[11px] text-blue-400 hover:underline flex items-center gap-1"
                          >
                            <span>Open Direct Link</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                        <video
                          src={videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-[360px] bg-black"
                        >
                          Your browser does not support the video tag.
                        </video>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Modal Bottom Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-500">
          <span>Profile ID: <code className="text-slate-400">{profile.id}</code></span>
          <span>Last Updated: {new Date(profile.updatedAt).toLocaleString()}</span>
        </div>
      </motion.div>
    </div>
  );
};
