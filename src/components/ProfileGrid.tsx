import React from 'react';
import { 
  Phone, 
  MapPin, 
  Image as ImageIcon, 
  Video, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  Eye, 
  MessageCircle, 
  Play
} from 'lucide-react';
import { Profile, CustomField } from '../types';

interface ProfileGridProps {
  profiles: Profile[];
  customFields: CustomField[];
  canEdit: boolean;
  isAdmin: boolean;
  onViewProfile: (p: Profile) => void;
  onEditProfile: (p: Profile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileGrid: React.FC<ProfileGridProps> = ({
  profiles,
  customFields,
  canEdit,
  isAdmin,
  onViewProfile,
  onEditProfile,
  onDeleteProfile,
}) => {
  if (profiles.length === 0) {
    return (
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-sm font-medium text-slate-300">No profile records found</p>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
      {profiles.map((profile) => {
        const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
        const coverPhoto = profile.photos[0] || profile.avatarUrl;
        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          `${profile.address.street}, ${profile.address.city}, ${profile.address.country}`
        )}`;

        // Get key custom fields to display in card
        const cardCustomFields = customFields
          .filter((f) => profile.customValues?.[f.key] !== undefined && profile.customValues?.[f.key] !== '')
          .slice(0, 3);

        return (
          <div
            key={profile.id}
            onClick={() => onViewProfile(profile)}
            className="bg-[#0d131f] border border-slate-800/80 hover:border-slate-700/90 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-200 flex flex-col group cursor-pointer"
          >
            {/* Top Cover / Media Banner */}
            <div className="relative h-36 w-full bg-slate-800 overflow-hidden">
              <img
                src={coverPhoto}
                alt={profile.fullName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-80"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0d131f] via-transparent to-black/30" />

              {/* Status Badge */}
              <div className="absolute top-3 right-3 flex items-center gap-1.5">
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10">
                  {profile.category}
                </span>
              </div>

              {/* Media Counts */}
              <div className="absolute bottom-2 right-3 flex items-center gap-1.5 text-xs text-white">
                {profile.photos.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-medium flex items-center gap-1">
                    <ImageIcon className="w-3 h-3 text-indigo-400" />
                    {profile.photos.length}
                  </span>
                )}
                {profile.videos.length > 0 && (
                  <span className="px-1.5 py-0.5 rounded bg-black/70 backdrop-blur-md text-[10px] font-medium flex items-center gap-1">
                    <Video className="w-3 h-3 text-rose-400" />
                    {profile.videos.length}
                  </span>
                )}
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-4 flex-1 flex flex-col">
              {/* Avatar + Main Title */}
              <div className="flex items-start gap-3 -mt-8 mb-2 relative z-10">
                <img
                  src={profile.avatarUrl}
                  alt={profile.fullName}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#0d131f] bg-slate-800 shadow-md shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="pt-2 min-w-0 flex-1">
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors truncate">
                    {profile.fullName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {profile.roleTitle}
                  </p>
                </div>
              </div>

              {/* Location & Phone Information */}
              <div className="space-y-1.5 text-xs text-slate-300 my-2 pt-1 border-t border-slate-800/60">
                <div className="flex items-center gap-2 text-slate-300">
                  <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-mono text-[11px]">{profile.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                  <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                  <span className="truncate">
                    {profile.address.city}, {profile.address.country}
                  </span>
                </div>
              </div>

              {/* Dynamic Custom Field Pills */}
              {cardCustomFields.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 mb-3">
                  {cardCustomFields.map((f) => {
                    const val = profile.customValues[f.key];
                    return (
                      <span
                        key={f.id}
                        className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-800/80 text-slate-300 border border-slate-700/60"
                      >
                        <span className="text-slate-500">{f.label}: </span>
                        <span>{String(val)}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Action Buttons Footer */}
              <div
                className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Contact Quick Triggers */}
                <div className="flex items-center gap-1">
                  <a
                    href={`tel:${cleanPhone}`}
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Call"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-400" />
                  </a>
                  <a
                    href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                  </a>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                    title="Google Maps"
                  >
                    <MapPin className="w-3.5 h-3.5 text-amber-400" />
                  </a>
                </div>

                {/* Edit / Delete / View */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onViewProfile(profile)}
                    className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600/20 text-blue-300 hover:bg-blue-600/30 border border-blue-500/30 transition-colors"
                  >
                    View
                  </button>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => onEditProfile(profile)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                      title="Edit"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={() => onDeleteProfile(profile.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg hover:bg-slate-800 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
