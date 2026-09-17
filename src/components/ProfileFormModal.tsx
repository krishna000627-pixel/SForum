import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  X, 
  Save, 
  Upload, 
  Plus, 
  Trash2, 
  Image as ImageIcon, 
  Video, 
  Sparkles, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  AlertCircle,
  Instagram,
  Heart,
  BookOpen,
  Users
} from 'lucide-react';
import { Profile, CustomField } from '../types';
import { PRESET_AVATARS, DEFAULT_STUDENT_AVATAR } from '../utils/avatarPresets';
import { validateVideoDuration } from '../utils/videoUtils';

interface ProfileFormModalProps {
  isOpen: boolean;
  initialProfile?: Profile | null;
  customFields: CustomField[];
  categories: string[];
  onClose: () => void;
  onSave: (profileData: Partial<Profile>) => void;
}

export const ProfileFormModal: React.FC<ProfileFormModalProps> = ({
  isOpen,
  initialProfile,
  customFields,
  categories,
  onClose,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [roleTitle, setRoleTitle] = useState('');
  const [category, setCategory] = useState('Student');
  const [classGrade, setClassGrade] = useState('Class 12-A (Science PCM + CS - MP Board)');
  const [rollNo, setRollNo] = useState('');
  const [admissionNo, setAdmissionNo] = useState('');
  const [board, setBoard] = useState('MP Board');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other' | 'Prefer not to say'>('Male');
  
  // Instagram & Relationship
  const [instagramId, setInstagramId] = useState('');
  const [secondaryInstagramId, setSecondaryInstagramId] = useState('');
  const [instaStatus, setInstaStatus] = useState<'Active' | 'Private' | 'Inactive' | 'Unknown'>('Active');
  const [relationshipStatus, setRelationshipStatus] = useState<'Single' | 'In a Relationship' | 'Complicated' | 'Prefer not to say' | 'Unknown'>('Single');
  
  // Coaching & Academics
  const [coachingInstitute, setCoachingInstitute] = useState('Allen Kota');
  const [house, setHouse] = useState('Ashoka');
  const [averageScore, setAverageScore] = useState<number | string>('92.5');
  const [teacherAdvisor, setTeacherAdvisor] = useState('Mr. Rakesh Verma');

  // Family & Contacts
  const [fathersName, setFathersName] = useState('');
  const [fathersOccupation, setFathersOccupation] = useState('');
  const [mothersName, setMothersName] = useState('');
  const [mothersOccupation, setMothersOccupation] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [emergencyContact, setEmergencyContact] = useState('');
  const [phone, setPhone] = useState('+91 ');
  const [email, setEmail] = useState('');
  
  // Address
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [state, setState] = useState('Delhi');
  const [country, setCountry] = useState('India');
  const [postalCode, setPostalCode] = useState('110001');

  // Media & Bio
  const [avatarUrl, setAvatarUrl] = useState('');
  const [bio, setBio] = useState('');
  const [status, setStatus] = useState<'active' | 'archived' | 'pending'>('active');
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhotoUrl, setNewPhotoUrl] = useState('');
  const [videos, setVideos] = useState<string[]>([]);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialProfile) {
      setFullName(initialProfile.fullName || '');
      setRoleTitle(initialProfile.roleTitle || '');
      setCategory(initialProfile.category || 'Student');
      setClassGrade(initialProfile.classGrade || 'Class 12-A (Science PCM + CS - MP Board)');
      setRollNo(initialProfile.rollNo || '');
      setAdmissionNo(initialProfile.admissionNo || '');
      setBoard(initialProfile.board || 'MP Board');
      setGender(initialProfile.gender || 'Male');
      setInstagramId(initialProfile.instagramId || '');
      setSecondaryInstagramId(initialProfile.secondaryInstagramId || '');
      setInstaStatus(initialProfile.instaStatus || 'Active');
      setRelationshipStatus(initialProfile.relationshipStatus || 'Single');
      setCoachingInstitute(initialProfile.coachingInstitute || 'None');
      setHouse(initialProfile.house || 'Ashoka');
      setAverageScore(initialProfile.averageScore ?? '');
      setTeacherAdvisor(initialProfile.teacherAdvisor || '');
      setFathersName(initialProfile.fathersName || '');
      setFathersOccupation(initialProfile.fathersOccupation || '');
      setMothersName(initialProfile.mothersName || '');
      setMothersOccupation(initialProfile.mothersOccupation || '');
      setWhatsappNumber(initialProfile.whatsappNumber || '');
      setEmergencyContact(initialProfile.emergencyContact || '');
      setPhone(initialProfile.phone || '+91 ');
      setEmail(initialProfile.email || '');
      setStreet(initialProfile.address?.street || '');
      setCity(initialProfile.address?.city || 'Bhopal');
      setState(initialProfile.address?.state || 'Madhya Pradesh');
      setCountry(initialProfile.address?.country || 'India');
      setPostalCode(initialProfile.address?.postalCode || '462001');
      setAvatarUrl(initialProfile.avatarUrl || '');
      setBio(initialProfile.bio || '');
      setStatus(initialProfile.status || 'active');
      setPhotos(initialProfile.photos || []);
      setVideos(initialProfile.videos || []);
      setCustomValues(initialProfile.customValues || {});
    } else {
      setFullName('');
      setRoleTitle('Student');
      setCategory('Student');
      setClassGrade('Class 12-A (Science PCM + CS - MP Board)');
      setRollNo('');
      setAdmissionNo(`SUNRAYS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`);
      setBoard('MP Board');
      setGender('Male');
      setInstagramId('');
      setSecondaryInstagramId('');
      setInstaStatus('Active');
      setRelationshipStatus('Single');
      setCoachingInstitute('Allen Kota');
      setHouse('Ashoka');
      setAverageScore('92.0');
      setTeacherAdvisor('Mr. Rakesh Verma');
      setFathersName('');
      setFathersOccupation('');
      setMothersName('');
      setMothersOccupation('');
      setWhatsappNumber('+91 ');
      setEmergencyContact('+91 ');
      setPhone('+91 ');
      setEmail('');
      setStreet('MP Nagar Zone 1');
      setCity('Bhopal');
      setState('Madhya Pradesh');
      setCountry('India');
      setPostalCode('462001');
      setAvatarUrl(DEFAULT_STUDENT_AVATAR);
      setBio('');
      setStatus('active');
      setPhotos([DEFAULT_STUDENT_AVATAR]);
      setVideos([]);
      setCustomValues({});
    }
  }, [initialProfile, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'photo' | 'video') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'video') {
      const validation = await validateVideoDuration(file);
      if (!validation.valid) {
        setError(validation.error || 'Video exceeds the 5-minute maximum limit.');
        return;
      }
    }

    const reader = new FileReader();
    reader.onload = (loadEvt) => {
      if (loadEvt.target?.result) {
        if (type === 'photo') {
          setPhotos((prev) => [...prev, String(loadEvt.target!.result)]);
        } else {
          setVideos((prev) => [...prev, String(loadEvt.target!.result)]);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddPhotoUrl = () => {
    if (newPhotoUrl.trim()) {
      setPhotos((prev) => [...prev, newPhotoUrl.trim()]);
      setNewPhotoUrl('');
    }
  };

  const handleAddVideoUrl = () => {
    if (newVideoUrl.trim()) {
      setVideos((prev) => [...prev, newVideoUrl.trim()]);
      setNewVideoUrl('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setError('Student / Staff Full Name is required.');
      return;
    }

    const profileData: Partial<Profile> = {
      id: initialProfile?.id || `prof_${Date.now()}`,
      fullName: fullName.trim(),
      roleTitle: roleTitle.trim() || 'Student',
      category,
      classGrade,
      rollNo: rollNo.trim(),
      admissionNo: admissionNo.trim(),
      board,
      gender,
      instagramId: instagramId.trim(),
      secondaryInstagramId: secondaryInstagramId.trim(),
      instaStatus,
      relationshipStatus,
      coachingInstitute,
      fathersName: fathersName.trim(),
      fathersOccupation: fathersOccupation.trim(),
      mothersName: mothersName.trim(),
      mothersOccupation: mothersOccupation.trim(),
      whatsappNumber: whatsappNumber.trim() || phone.trim(),
      emergencyContact: emergencyContact.trim(),
      house,
      averageScore: averageScore ? parseFloat(String(averageScore)) : undefined,
      teacherAdvisor: teacherAdvisor.trim(),
      phone: phone.trim() || whatsappNumber.trim() || '+91 ',
      email: email.trim() || `${fullName.toLowerCase().replace(/\s+/g, '.')}@school.edu.in`,
      address: {
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        country: country.trim(),
        postalCode: postalCode.trim(),
      },
      avatarUrl: avatarUrl.trim() || DEFAULT_STUDENT_AVATAR,
      bio: bio.trim(),
      photos,
      videos,
      customValues,
      status,
      updatedAt: new Date().toISOString(),
      createdAt: initialProfile?.createdAt || new Date().toISOString(),
    };

    onSave(profileData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="w-full max-w-4xl max-h-[92vh] bg-[#0d131f] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200 my-auto"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0 bg-slate-950/60">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              <span>{initialProfile ? 'Edit School Profile File' : 'Add New Student / Staff Profile'}</span>
            </h2>
            <p className="text-xs text-slate-400">
              Complete Indian school records with coaching, Instagram IDs, parents' details, and photo/video media
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: BASIC & ACADEMIC INFO */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              <span>Academic Details & Board Allotment</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Full Legal Name *</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white placeholder-slate-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Role / Title</label>
                <input
                  type="text"
                  value={roleTitle}
                  onChange={(e) => setRoleTitle(e.target.value)}
                  placeholder="e.g. Head Boy / Science Topper"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Student">Student</option>
                  <option value="Teacher">Teacher / Faculty</option>
                  <option value="Counselor">Counselor</option>
                  <option value="Alumni">Alumni</option>
                  <option value="Staff">Administrative Staff</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Class & Stream</label>
                <select
                  value={classGrade}
                  onChange={(e) => setClassGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Class 10-A (MP Board)">Class 10-A (MP Board)</option>
                  <option value="Class 10-B (MP Board)">Class 10-B (MP Board)</option>
                  <option value="Class 11-A (Science PCM - MP Board)">Class 11-A (Science PCM - MP Board)</option>
                  <option value="Class 11-B (Science PCB - MP Board)">Class 11-B (Science PCB - MP Board)</option>
                  <option value="Class 11-C (Commerce - MP Board)">Class 11-C (Commerce - MP Board)</option>
                  <option value="Class 12-A (Science PCM + CS - MP Board)">Class 12-A (Science PCM + CS - MP Board)</option>
                  <option value="Class 12-B (Commerce with Maths - MP Board)">Class 12-B (Commerce with Maths - MP Board)</option>
                  <option value="Class 12-C (Humanities / Arts - MP Board)">Class 12-C (Humanities / Arts - MP Board)</option>
                  <option value="Faculty - Science & Tech">Faculty - Science & Tech</option>
                  <option value="Faculty - Administration">Faculty - Administration</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Board</label>
                <select
                  value={board}
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="MP Board">MP Board (MPBSE - Madhya Pradesh)</option>
                  <option value="State Board">State Board</option>
                  <option value="CBSE">CBSE (Optional / Transfer)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Roll Number</label>
                <input
                  type="text"
                  value={rollNo}
                  onChange={(e) => setRollNo(e.target.value)}
                  placeholder="e.g. 14"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Admission Number</label>
                <input
                  type="text"
                  value={admissionNo}
                  onChange={(e) => setAdmissionNo(e.target.value)}
                  placeholder="e.g. DPS-2023-4412"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">School House</label>
                <select
                  value={house}
                  onChange={(e) => setHouse(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Ashoka">Ashoka House (Red)</option>
                  <option value="Shivaji">Shivaji House (Blue)</option>
                  <option value="Tagore">Tagore House (Green)</option>
                  <option value="Raman">Raman House (Yellow)</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: COACHING, INSTAGRAM & RELATIONSHIP STATUS */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
              <Instagram className="w-4 h-4" />
              <span>Coaching, Instagram & Relationship Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Coaching Institute</label>
                <select
                  value={coachingInstitute}
                  onChange={(e) => setCoachingInstitute(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Allen Kota">Allen Kota</option>
                  <option value="Aakash Institute">Aakash Institute</option>
                  <option value="PhysicsWallah (PW)">PhysicsWallah (PW)</option>
                  <option value="FIITJEE">FIITJEE</option>
                  <option value="Resonance">Resonance</option>
                  <option value="Self Study / Home Tutors">Self Study / Home Tutors</option>
                  <option value="None">None</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Gender</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Relationship Status</label>
                <select
                  value={relationshipStatus}
                  onChange={(e) => setRelationshipStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Single">Single</option>
                  <option value="In a Relationship">In a Relationship</option>
                  <option value="Complicated">Complicated</option>
                  <option value="Prefer not to say">Prefer not to say</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Primary Instagram ID</label>
                <input
                  type="text"
                  value={instagramId}
                  onChange={(e) => setInstagramId(e.target.value)}
                  placeholder="@aarav.sharma_07"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-pink-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Secondary Instagram (Finsta / Art)</label>
                <input
                  type="text"
                  value={secondaryInstagramId}
                  onChange={(e) => setSecondaryInstagramId(e.target.value)}
                  placeholder="@aarav.dumpzz"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-pink-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Instagram Account Privacy</label>
                <select
                  value={instaStatus}
                  onChange={(e) => setInstaStatus(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Active">Active & Public</option>
                  <option value="Private">Private Account</option>
                  <option value="Inactive">Inactive / Deactivated</option>
                  <option value="Unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 3: PARENTS & EMERGENCY CONTACTS */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4" />
              <span>Parents, Family & WhatsApp Contact</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-400 mb-1">Father's Name</label>
                <input
                  type="text"
                  value={fathersName}
                  onChange={(e) => setFathersName(e.target.value)}
                  placeholder="e.g. Dr. Rajesh Sharma"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Father's Occupation</label>
                <input
                  type="text"
                  value={fathersOccupation}
                  onChange={(e) => setFathersOccupation(e.target.value)}
                  placeholder="e.g. Senior Civil Surgeon"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mother's Name</label>
                <input
                  type="text"
                  value={mothersName}
                  onChange={(e) => setMothersName(e.target.value)}
                  placeholder="e.g. Mrs. Sunita Sharma"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Mother's Occupation</label>
                <input
                  type="text"
                  value={mothersOccupation}
                  onChange={(e) => setMothersOccupation(e.target.value)}
                  placeholder="e.g. High School Vice Principal"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Student WhatsApp Number</label>
                <input
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="+91 98201 44510"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-emerald-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Parents' Emergency Contact</label>
                <input
                  type="text"
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+91 98201 44511"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-amber-400 font-mono"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: ADDRESS (INDIAN LOCALITY) */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4" />
              <span>Residence & Address in India</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div className="sm:col-span-2">
                <label className="block text-slate-400 mb-1">Apartment / House / Street</label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="e.g. Flat 402, Nilgiri Apartments, Sector 14"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">City / Region</label>
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. New Delhi"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">State</label>
                <input
                  type="text"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  placeholder="e.g. Delhi / Rajasthan / Maharashtra"
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 5: PHOTOS, VIDEOS & BIO */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <h3 className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <ImageIcon className="w-4 h-4" />
              <span>Student Photos, Videos & Bio</span>
            </h3>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-slate-400">Choose Preset Vector Avatar or Custom URL</label>
                <span className="text-[11px] text-blue-400">10 Presets Available</span>
              </div>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2 mb-2 p-2 bg-slate-900/80 rounded-xl border border-slate-800">
                {PRESET_AVATARS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setAvatarUrl(preset.avatarUrl)}
                    title={`${preset.name} (${preset.category})`}
                    className={`relative rounded-xl overflow-hidden aspect-square border-2 transition-transform hover:scale-105 cursor-pointer ${
                      avatarUrl === preset.avatarUrl ? 'border-blue-500 ring-2 ring-blue-500/30' : 'border-transparent hover:border-slate-600'
                    }`}
                  >
                    <img src={preset.avatarUrl} alt={preset.name} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                placeholder="Custom image or data URL..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono text-xs"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Student Bio / Achievements</label>
              <textarea
                rows={2}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Targeting IIT-JEE / NEET, Olympiad qualifier, school sports..."
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white leading-relaxed"
              />
            </div>

            {/* Photos gallery */}
            <div>
              <label className="block text-slate-400 mb-1">Student Photos Gallery</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newPhotoUrl}
                  onChange={(e) => setNewPhotoUrl(e.target.value)}
                  placeholder="Paste photo URL (https://...)"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddPhotoUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                >
                  Add Photo
                </button>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photo')}
                    className="hidden"
                  />
                </label>
              </div>

              {photos.length > 0 && (
                <div className="flex gap-2 flex-wrap">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden border border-slate-700 group">
                      <img src={p} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                        className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 flex items-center justify-center text-rose-400 transition-opacity"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Videos gallery */}
            <div>
              <label className="block text-slate-400 mb-1">Student Videos</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Paste video MP4 URL (https://...)"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-white font-mono"
                />
                <button
                  type="button"
                  onClick={handleAddVideoUrl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg"
                >
                  Add Video
                </button>
                <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white rounded-lg cursor-pointer flex items-center gap-1">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="video/*"
                    onChange={(e) => handleFileUpload(e, 'video')}
                    className="hidden"
                  />
                </label>
              </div>

              {videos.length > 0 && (
                <div className="space-y-1">
                  {videos.map((v, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 bg-slate-900 rounded border border-slate-800">
                      <span className="font-mono text-slate-300 truncate max-w-sm">{v}</span>
                      <button
                        type="button"
                        onClick={() => setVideos(videos.filter((_, i) => i !== idx))}
                        className="text-rose-400 hover:text-rose-300"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-slate-400 hover:text-white rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold cursor-pointer shadow-lg shadow-blue-600/20 flex items-center gap-1.5"
            >
              <Save className="w-4 h-4" />
              <span>Save School Record</span>
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
