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
  CheckCircle2, 
  XCircle,
  MessageCircle
} from 'lucide-react';
import { Profile, CustomField } from '../types';
import { DEFAULT_STUDENT_AVATAR } from '../utils/avatarPresets';
import { VerifiedBadgeTick } from './VerifiedBadgeTick';

interface ProfileTableProps {
  profiles: Profile[];
  customFields: CustomField[];
  canEdit: boolean;
  isAdmin: boolean;
  onViewProfile: (p: Profile) => void;
  onEditProfile: (p: Profile) => void;
  onDeleteProfile: (id: string) => void;
}

export const ProfileTable: React.FC<ProfileTableProps> = ({
  profiles,
  customFields,
  canEdit,
  isAdmin,
  onViewProfile,
  onEditProfile,
  onDeleteProfile,
}) => {
  const tableFields = customFields.filter((f) => f.showInTable);

  if (profiles.length === 0) {
    return (
      <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
        <p className="text-sm font-medium text-slate-300">No profile records found</p>
        <p className="text-xs text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
      </div>
    );
  }

  const renderCustomCellValue = (field: CustomField, value: any) => {
    if (value === undefined || value === null || value === '') {
      return <span className="text-slate-600">—</span>;
    }

    switch (field.type) {
      case 'boolean':
        return value ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" /> Yes
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500">
            <XCircle className="w-3.5 h-3.5" /> No
          </span>
        );
      case 'badge':
        return (
          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-950/60 text-blue-300 border border-blue-800/40">
            {String(value)}
          </span>
        );
      case 'url':
        return (
          <a
            href={String(value)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300 text-xs hover:underline truncate max-w-[140px]"
            onClick={(e) => e.stopPropagation()}
          >
            <span>{String(value).replace(/^https?:\/\//, '')}</span>
            <ExternalLink className="w-3 h-3 shrink-0" />
          </a>
        );
      case 'date':
        return (
          <span className="text-xs text-slate-300 font-mono">
            {new Date(value).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
          </span>
        );
      default:
        return <span className="text-xs text-slate-300 truncate max-w-[150px] inline-block">{String(value)}</span>;
    }
  };

  return (
    <div className="w-full bg-[#0d131f] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4 min-w-[220px]">Profile</th>
              <th className="py-3 px-4 min-w-[170px]">Contact & Phone</th>
              <th className="py-3 px-4 min-w-[160px]">Address</th>
              <th className="py-3 px-4 min-w-[120px]">Media</th>
              {tableFields.map((field) => (
                <th key={field.id} className="py-3 px-4 min-w-[130px]">
                  {field.label}
                </th>
              ))}
              <th className="py-3 px-4 text-right min-w-[110px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
            {profiles.map((profile, index) => {
              const cleanPhone = profile.phone.replace(/[^0-9+]/g, '');
              const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                `${profile.address.street}, ${profile.address.city}, ${profile.address.country}`
              )}`;

              return (
                <tr
                  key={profile.id}
                  onClick={() => onViewProfile(profile)}
                  className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                >
                  {/* Index */}
                  <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                    {index + 1}
                  </td>

                  {/* Profile Name & Title */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={profile.avatarUrl || DEFAULT_STUDENT_AVATAR}
                        alt={profile.fullName}
                        className="w-10 h-10 rounded-xl object-cover border border-slate-700/80 shrink-0 bg-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <div className="font-semibold text-white text-sm group-hover:text-blue-400 transition-colors truncate flex items-center gap-1.5">
                          <span>{profile.fullName}</span>
                          {profile.category === 'Admin' || profile.roleTitle?.toLowerCase().includes('admin') ? (
                            <VerifiedBadgeTick role="admin" size="sm" />
                          ) : profile.category === 'Agent' || profile.roleTitle?.toLowerCase().includes('agent') || profile.roleTitle?.toLowerCase().includes('counselor') ? (
                            <VerifiedBadgeTick role="agent" size="sm" />
                          ) : (Number(profile.customValues?.referrals || 0) >= 3) ? (
                            <VerifiedBadgeTick role="student" referralCount={Number(profile.customValues?.referrals || 0)} size="sm" />
                          ) : null}
                        </div>
                        <div className="text-[11px] text-slate-400 truncate">
                          {profile.roleTitle}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {profile.category}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            profile.status === 'active' ? 'bg-emerald-400' : 'bg-amber-400'
                          }`} />
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Contact & Phone */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-200 font-mono text-[11px]">
                        <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {profile.email}
                      </div>
                      <div className="flex items-center gap-2 pt-0.5">
                        <a
                          href={`tel:${cleanPhone}`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors inline-flex items-center gap-1"
                          title="Call Phone"
                        >
                          <Phone className="w-2.5 h-2.5 text-blue-400" />
                          Call
                        </a>
                        <a
                          href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                          target="_blank"
                          rel="noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 transition-colors inline-flex items-center gap-1"
                          title="WhatsApp Chat"
                        >
                          <MessageCircle className="w-2.5 h-2.5 text-emerald-400" />
                          Chat
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Address */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-0.5 max-w-[200px]">
                      <div className="text-slate-200 font-medium truncate">
                        {profile.address.city}, {profile.address.country}
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        {profile.address.street}
                      </div>
                      <a
                        href={mapsUrl}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="text-[10px] text-blue-400 hover:underline inline-flex items-center gap-1 pt-0.5"
                      >
                        <MapPin className="w-2.5 h-2.5" />
                        <span>Map View</span>
                      </a>
                    </div>
                  </td>

                  {/* Media (Photos & Videos) */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                        <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
                        <span>{profile.photos.length}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800/80 border border-slate-700/60 text-[11px] text-slate-300">
                        <Video className="w-3.5 h-3.5 text-rose-400" />
                        <span>{profile.videos.length}</span>
                      </div>
                    </div>
                  </td>

                  {/* Dynamic Custom Fields */}
                  {tableFields.map((field) => (
                    <td key={field.id} className="py-3.5 px-4">
                      {renderCustomCellValue(field, profile.customValues?.[field.key])}
                    </td>
                  ))}

                  {/* Row Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        onClick={() => onViewProfile(profile)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {canEdit && (
                        <button
                          type="button"
                          onClick={() => onEditProfile(profile)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800 transition-colors"
                          title="Edit Profile"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      )}
                      {isAdmin && (
                        <button
                          type="button"
                          onClick={() => onDeleteProfile(profile.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                          title="Delete Profile"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
