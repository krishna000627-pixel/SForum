import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Database,
  Search,
  Filter,
  Plus,
  GraduationCap,
  Award,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  ExternalLink,
  MessageCircle,
  Eye,
  Edit3,
  Trash2,
  Table as TableIcon,
  LayoutGrid,
  ShieldCheck,
  UserCheck,
  Sparkles,
  X,
  Check,
  ChevronDown
} from 'lucide-react';
import { Profile, CustomField, UserRole } from '../types';
import { DEFAULT_STUDENT_AVATAR } from '../utils/avatarPresets';

interface SchoolDatabaseViewProps {
  currentRole: UserRole;
  profiles: Profile[];
  customFields: CustomField[];
  onUpdateProfiles: (updated: Profile[]) => void;
  canEdit: boolean;
}

export const SchoolDatabaseView: React.FC<SchoolDatabaseViewProps> = ({
  currentRole,
  profiles,
  customFields,
  onUpdateProfiles,
  canEdit,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  // Form State for Add / Edit
  const [formName, setFormName] = useState('');
  const [formRoleTitle, setFormRoleTitle] = useState('Honor Student');
  const [formCategory, setFormCategory] = useState<'Student' | 'Teacher' | 'Counselor' | 'Staff'>('Student');
  const [formClassGrade, setFormClassGrade] = useState('Class 10-A');
  const [formTeacher, setFormTeacher] = useState('Dr. Sarah Miller');
  const [formAverageScore, setFormAverageScore] = useState('92.5');
  const [formPhone, setFormPhone] = useState('+1 (555) 234-5678');
  const [formEmail, setFormEmail] = useState('');
  const [formStreet, setFormStreet] = useState('100 Campus Way');
  const [formCity, setFormCity] = useState('Springfield');
  const [formState, setFormState] = useState('IL');
  const [formAvatarUrl, setFormAvatarUrl] = useState('');
  const [formBio, setFormBio] = useState('');

  // Extract unique classes for filter
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    profiles.forEach((p) => {
      if (p.classGrade) set.add(p.classGrade);
    });
    return Array.from(set);
  }, [profiles]);

  // Filtered Profiles
  const filteredProfiles = useMemo(() => {
    return profiles.filter((p) => {
      const matchSearch =
        p.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.classGrade && p.classGrade.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.teacherAdvisor && p.teacherAdvisor.toLowerCase().includes(searchTerm.toLowerCase())) ||
        p.address.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.phone.includes(searchTerm);

      const matchCategory =
        selectedCategory === 'all' || p.category.toLowerCase() === selectedCategory.toLowerCase();

      const matchClass =
        selectedClass === 'all' || (p.classGrade && p.classGrade === selectedClass);

      return matchSearch && matchCategory && matchClass;
    });
  }, [profiles, searchTerm, selectedCategory, selectedClass]);

  // Stats calculation
  const totalStudents = profiles.filter((p) => p.category.toLowerCase() === 'student').length;
  const totalFaculty = profiles.filter((p) => p.category.toLowerCase() === 'teacher' || p.category.toLowerCase() === 'counselor').length;
  const avgScore = useMemo(() => {
    const scores = profiles.filter((p) => p.averageScore !== undefined).map((p) => p.averageScore as number);
    if (scores.length === 0) return 0;
    const sum = scores.reduce((a, b) => a + b, 0);
    return Math.round((sum / scores.length) * 10) / 10;
  }, [profiles]);

  // Open Edit Modal
  const handleOpenEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setFormName(profile.fullName);
    setFormRoleTitle(profile.roleTitle);
    setFormCategory((profile.category as any) || 'Student');
    setFormClassGrade(profile.classGrade || 'Class 10-A');
    setFormTeacher(profile.teacherAdvisor || '');
    setFormAverageScore(profile.averageScore !== undefined ? String(profile.averageScore) : '90');
    setFormPhone(profile.phone);
    setFormEmail(profile.email);
    setFormStreet(profile.address.street);
    setFormCity(profile.address.city);
    setFormState(profile.address.state || 'IL');
    setFormAvatarUrl(profile.avatarUrl);
    setFormBio(profile.bio || '');
    setIsAddModalOpen(true);
  };

  // Open Add Modal
  const handleOpenAdd = () => {
    setEditingProfile(null);
    setFormName('');
    setFormRoleTitle('Enrolled Student');
    setFormCategory('Student');
    setFormClassGrade('Class 10-A');
    setFormTeacher('Dr. Sarah Miller');
    setFormAverageScore('92.0');
    setFormPhone('+91 ');
    setFormEmail('');
    setFormStreet('MP Nagar Zone 1');
    setFormCity('Bhopal');
    setFormState('Madhya Pradesh');
    setFormAvatarUrl(DEFAULT_STUDENT_AVATAR);
    setFormBio('Active student member of Sunrays School.');
    setIsAddModalOpen(true);
  };

  // Handle Form Submit
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) return;

    const parsedAvg = parseFloat(formAverageScore) || 90;

    if (editingProfile) {
      const updated = profiles.map((p) =>
        p.id === editingProfile.id
          ? {
              ...p,
              fullName: formName.trim(),
              roleTitle: formRoleTitle.trim(),
              category: formCategory,
              classGrade: formClassGrade,
              teacherAdvisor: formTeacher.trim(),
              averageScore: parsedAvg,
              phone: formPhone.trim(),
              email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@sunrays.edu`,
              address: {
                ...p.address,
                street: formStreet.trim(),
                city: formCity.trim(),
                state: formState.trim(),
              },
              avatarUrl: formAvatarUrl.trim() || p.avatarUrl,
              bio: formBio.trim(),
              updatedAt: new Date().toISOString(),
            }
          : p
      );
      onUpdateProfiles(updated);
      if (selectedProfile?.id === editingProfile.id) {
        setSelectedProfile(updated.find((p) => p.id === editingProfile.id) || null);
      }
    } else {
      const newProf: Profile = {
        id: `prof_${Date.now()}`,
        fullName: formName.trim(),
        roleTitle: formRoleTitle.trim(),
        category: formCategory,
        classGrade: formClassGrade,
        teacherAdvisor: formTeacher.trim(),
        averageScore: parsedAvg,
        phone: formPhone.trim(),
        email: formEmail.trim() || `${formName.toLowerCase().replace(/\s+/g, '.')}@sunrays.edu`,
        address: {
          street: formStreet.trim(),
          city: formCity.trim(),
          state: formState.trim(),
          country: 'India',
          postalCode: '462001',
        },
        avatarUrl: formAvatarUrl.trim() || DEFAULT_STUDENT_AVATAR,
        bio: formBio.trim(),
        photos: [
          formAvatarUrl.trim() || DEFAULT_STUDENT_AVATAR
        ],
        videos: [],
        customValues: {
          class_grade: formClassGrade,
          teacher_advisor: formTeacher.trim(),
          average_score: parsedAvg,
          category_type: formCategory,
        },
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      onUpdateProfiles([newProf, ...profiles]);
    }

    setIsAddModalOpen(false);
  };

  // Delete profile
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this school record?')) {
      const updated = profiles.filter((p) => p.id !== id);
      onUpdateProfiles(updated);
      if (selectedProfile?.id === id) setSelectedProfile(null);
    }
  };

  // Helper score color
  const getScoreBadgeClass = (score?: number) => {
    if (score === undefined) return 'bg-slate-800 text-slate-400 border-slate-700';
    if (score >= 93) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    if (score >= 85) return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    if (score >= 75) return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner */}
      <div className="bg-[#0f172a]/90 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                <Database className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                School Records Database
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Agent & Admin Access
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-2xl">
              Confidential campus directory for school counselors, peer agents, and staff. Search student and teacher records by image, class, teacher advisor, average scores, phone, and address.
            </p>
          </div>

          {canEdit && (
            <button
              type="button"
              onClick={handleOpenAdd}
              className="self-start sm:self-auto px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer min-h-[44px] transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Record</span>
            </button>
          )}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Total Records</span>
            <span className="text-lg font-bold text-white mt-0.5 block">{profiles.length}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Avg Academic Score</span>
            <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{avgScore}%</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Enrolled Students</span>
            <span className="text-lg font-bold text-blue-400 mt-0.5 block">{totalStudents}</span>
          </div>
          <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-800">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block">Faculty & Staff</span>
            <span className="text-lg font-bold text-purple-400 mt-0.5 block">{totalFaculty}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-[#0f172a]/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-lg">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, class, teacher, city..."
            className="w-full pl-9 pr-4 py-2 bg-slate-950/80 border border-slate-700/80 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[40px]"
          />
        </div>

        {/* Filters and View Mode */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-between md:justify-end">
          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none min-h-[40px]"
          >
            <option value="all">All Categories</option>
            <option value="student">Students</option>
            <option value="teacher">Teachers</option>
            <option value="counselor">Counselors</option>
          </select>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none min-h-[40px]"
          >
            <option value="all">All Classes</option>
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              title="Table View"
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'table' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              title="Card Grid View"
              className={`p-2 rounded-lg cursor-pointer transition-colors ${
                viewMode === 'cards' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Records Display */}
      {filteredProfiles.length === 0 ? (
        <div className="bg-[#0f172a]/60 border border-slate-800 rounded-2xl p-12 text-center text-slate-400">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-300">No school records found</p>
          <p className="text-xs text-slate-500 mt-1">Try resetting the class or category filter.</p>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="w-full bg-[#0d131f] border border-slate-800/80 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 bg-slate-900/70 text-[11px] uppercase tracking-wider font-semibold text-slate-400">
                  <th className="py-3 px-4 w-12 text-center">#</th>
                  <th className="py-3 px-4 min-w-[220px]">Image & Full Name</th>
                  <th className="py-3 px-4 min-w-[130px]">Class / Grade</th>
                  <th className="py-3 px-4 min-w-[150px]">Teacher / Advisor</th>
                  <th className="py-3 px-4 min-w-[110px]">Category</th>
                  <th className="py-3 px-4 min-w-[120px]">Average Number</th>
                  <th className="py-3 px-4 min-w-[160px]">Contact & Phone</th>
                  <th className="py-3 px-4 min-w-[160px]">Address</th>
                  <th className="py-3 px-4 text-right min-w-[100px]">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                {filteredProfiles.map((p, idx) => {
                  const cleanPhone = p.phone.replace(/[^0-9+]/g, '');
                  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${p.address.street}, ${p.address.city}, ${p.address.country}`
                  )}`;

                  return (
                    <tr
                      key={p.id}
                      onClick={() => setSelectedProfile(p)}
                      className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4 text-center text-slate-500 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Image & Name */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.avatarUrl}
                            alt={p.fullName}
                            className="w-10 h-10 rounded-xl object-cover border border-slate-700/80 shrink-0 bg-slate-800 shadow-sm"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0">
                            <div className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors truncate">
                              {p.fullName}
                            </div>
                            <div className="text-[11px] text-slate-400 truncate">
                              {p.roleTitle}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Class */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-blue-950/60 border border-blue-800/40 text-blue-300 font-semibold text-[11px]">
                          {p.classGrade || 'N/A'}
                        </span>
                      </td>

                      {/* Teacher / Advisor */}
                      <td className="py-3.5 px-4">
                        <span className="text-slate-300 font-medium truncate block max-w-[140px]">
                          {p.teacherAdvisor || '—'}
                        </span>
                      </td>

                      {/* Category */}
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[11px]">
                          {p.category}
                        </span>
                      </td>

                      {/* Average Number */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg border text-xs font-bold font-mono inline-flex items-center gap-1 ${getScoreBadgeClass(
                            p.averageScore
                          )}`}
                        >
                          <Award className="w-3 h-3" />
                          <span>{p.averageScore !== undefined ? `${p.averageScore}%` : 'N/A'}</span>
                        </span>
                      </td>

                      {/* Phone */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <div className="text-slate-300 font-mono text-[11px] flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            <span>{p.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 pt-0.5">
                            <a
                              href={`tel:${cleanPhone}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 inline-flex items-center gap-1"
                            >
                              Call
                            </a>
                            <a
                              href={`https://wa.me/${cleanPhone.replace('+', '')}`}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 inline-flex items-center gap-1"
                            >
                              WhatsApp
                            </a>
                          </div>
                        </div>
                      </td>

                      {/* Address */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5 max-w-[180px]">
                          <div className="text-slate-300 font-medium truncate">
                            {p.address.street}
                          </div>
                          <div className="text-[11px] text-slate-400 truncate">
                            {p.address.city}, {p.address.state || p.address.country}
                          </div>
                          <a
                            href={mapsUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[10px] text-emerald-400 hover:underline inline-flex items-center gap-1"
                          >
                            <MapPin className="w-2.5 h-2.5" />
                            <span>Map</span>
                          </a>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => setSelectedProfile(p)}
                            title="View Profile Details"
                            className="p-1.5 text-slate-400 hover:text-emerald-400 rounded-lg cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          {canEdit && (
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(p)}
                              title="Edit Record"
                              className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg cursor-pointer"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          {currentRole === 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id)}
                              title="Delete Record"
                              className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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
      ) : (
        /* CARDS GRID VIEW */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProfiles.map((p) => {
            const cleanPhone = p.phone.replace(/[^0-9+]/g, '');
            const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
              `${p.address.street}, ${p.address.city}, ${p.address.country}`
            )}`;

            return (
              <div
                key={p.id}
                onClick={() => setSelectedProfile(p)}
                className="bg-[#0f172a]/90 border border-slate-800 hover:border-emerald-500/40 rounded-2xl p-4 transition-all shadow-xl hover:shadow-emerald-950/20 cursor-pointer space-y-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={p.avatarUrl}
                        alt={p.fullName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-700 shrink-0 bg-slate-800"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base leading-snug">
                          {p.fullName}
                        </h3>
                        <p className="text-xs text-slate-400">{p.roleTitle}</p>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium shrink-0">
                      {p.category}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80 text-xs">
                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Class</span>
                      <span className="text-blue-300 font-semibold truncate block mt-0.5">
                        {p.classGrade || 'N/A'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[10px] uppercase text-slate-400 block font-semibold">Average Number</span>
                      <span className={`px-2 py-0.5 rounded border font-mono font-bold text-[11px] inline-block mt-0.5 ${getScoreBadgeClass(p.averageScore)}`}>
                        {p.averageScore !== undefined ? `${p.averageScore}%` : 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-xs">
                    <span className="text-[10px] uppercase text-slate-400 block font-semibold">Teacher / Advisor</span>
                    <span className="text-slate-300 font-medium truncate block mt-0.5">
                      {p.teacherAdvisor || 'None assigned'}
                    </span>
                  </div>

                  <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{p.address.street}, {p.address.city}</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={`tel:${cleanPhone}`}
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px]"
                    >
                      <Phone className="w-2.5 h-2.5 text-emerald-400" />
                      <span>Call</span>
                    </a>
                    <a
                      href={mapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg flex items-center gap-1 text-[11px]"
                    >
                      <MapPin className="w-2.5 h-2.5 text-blue-400" />
                      <span>Map</span>
                    </a>
                  </div>

                  <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    {canEdit && (
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-400 hover:text-blue-400 rounded-lg cursor-pointer"
                        title="Edit Record"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {currentRole === 'admin' && (
                      <button
                        type="button"
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* RECORD DETAIL MODAL */}
      <AnimatePresence>
        {selectedProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-5 my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-start justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProfile.avatarUrl}
                    alt={selectedProfile.fullName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-700 shadow-md bg-slate-800"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h3 className="text-lg font-bold text-white leading-tight">
                      {selectedProfile.fullName}
                    </h3>
                    <p className="text-xs text-slate-400">{selectedProfile.roleTitle}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      {selectedProfile.category}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedProfile(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Class / Grade</span>
                  <span className="text-blue-300 font-bold text-sm block mt-0.5">
                    {selectedProfile.classGrade || 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Average Number (%)</span>
                  <span className="text-emerald-400 font-bold font-mono text-sm block mt-0.5">
                    {selectedProfile.averageScore !== undefined ? `${selectedProfile.averageScore}%` : 'N/A'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl col-span-2">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Teacher / Homeroom Advisor</span>
                  <span className="text-white font-medium text-sm block mt-0.5">
                    {selectedProfile.teacherAdvisor || 'None assigned'}
                  </span>
                </div>

                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl col-span-2 space-y-1.5">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Contact & Phone</span>
                  <div className="flex items-center justify-between text-slate-200 font-mono">
                    <span>{selectedProfile.phone}</span>
                    <a
                      href={`tel:${selectedProfile.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-xs px-2 py-1 rounded bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center gap-1"
                    >
                      <Phone className="w-3 h-3" /> Call
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-400">{selectedProfile.email}</div>
                </div>

                <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl col-span-2 space-y-1">
                  <span className="text-[10px] uppercase text-slate-400 font-semibold block">Home Address</span>
                  <p className="text-white font-medium text-xs">
                    {selectedProfile.address.street}
                  </p>
                  <p className="text-slate-400 text-xs">
                    {selectedProfile.address.city}, {selectedProfile.address.state || selectedProfile.address.country}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${selectedProfile.address.street}, ${selectedProfile.address.city}, ${selectedProfile.address.country}`
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-emerald-400 hover:underline inline-flex items-center gap-1 pt-1"
                  >
                    <MapPin className="w-3 h-3" /> Open in Google Maps
                  </a>
                </div>

                {selectedProfile.bio && (
                  <div className="p-3 bg-slate-900/70 border border-slate-800 rounded-xl col-span-2 space-y-1">
                    <span className="text-[10px] uppercase text-slate-400 font-semibold block">Notes / Bio</span>
                    <p className="text-slate-300 text-xs leading-relaxed">{selectedProfile.bio}</p>
                  </div>
                )}
              </div>

              <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const prof = selectedProfile;
                    setSelectedProfile(null);
                    handleOpenEdit(prof);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 cursor-pointer min-h-[40px]"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Record
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ADD / EDIT RECORD MODAL */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-[#111827] border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-2xl space-y-4 my-auto max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span>{editingProfile ? 'Edit School Record' : 'Add New Student or Staff Record'}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-300 font-medium mb-1">Full Name *</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. Maya Lin"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    >
                      <option value="Student">Student</option>
                      <option value="Teacher">Teacher</option>
                      <option value="Counselor">Counselor</option>
                      <option value="Staff">Staff</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Class / Grade</label>
                    <input
                      type="text"
                      value={formClassGrade}
                      onChange={(e) => setFormClassGrade(e.target.value)}
                      placeholder="e.g. Class 10-A or Grade 11-AP"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Teacher / Advisor</label>
                    <input
                      type="text"
                      value={formTeacher}
                      onChange={(e) => setFormTeacher(e.target.value)}
                      placeholder="e.g. Dr. Sarah Miller"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Average Number (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={formAverageScore}
                      onChange={(e) => setFormAverageScore(e.target.value)}
                      placeholder="e.g. 92.5"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={formPhone}
                      onChange={(e) => setFormPhone(e.target.value)}
                      placeholder="+1 (555) 234-5678"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-300 font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="student@sunrays.edu"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Address Street</label>
                  <input
                    type="text"
                    value={formStreet}
                    onChange={(e) => setFormStreet(e.target.value)}
                    placeholder="e.g. 742 Evergreen Terrace"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">City</label>
                    <input
                      type="text"
                      value={formCity}
                      onChange={(e) => setFormCity(e.target.value)}
                      placeholder="Springfield"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-medium mb-1">State / Province</label>
                    <input
                      type="text"
                      value={formState}
                      onChange={(e) => setFormState(e.target.value)}
                      placeholder="IL"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Photo / Image URL</label>
                  <input
                    type="url"
                    value={formAvatarUrl}
                    onChange={(e) => setFormAvatarUrl(e.target.value)}
                    placeholder="Preset avatar or custom image URL..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-medium mb-1">Role Title / Bio Note</label>
                  <input
                    type="text"
                    value={formRoleTitle}
                    onChange={(e) => setFormRoleTitle(e.target.value)}
                    placeholder="e.g. Grade 11 Honor Student"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white text-xs min-h-[40px]"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 text-slate-400 hover:text-white text-xs min-h-[40px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer min-h-[44px]"
                  >
                    {editingProfile ? 'Save Changes' : 'Create Record'}
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
