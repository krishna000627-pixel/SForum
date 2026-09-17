import React from 'react';
import { Check } from 'lucide-react';
import { UserRole } from '../types';

interface VerifiedBadgeTickProps {
  role?: UserRole;
  referralCount?: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showTooltip?: boolean;
}

export const VerifiedBadgeTick: React.FC<VerifiedBadgeTickProps> = ({
  role = 'student',
  referralCount = 0,
  className = '',
  size = 'sm',
  showTooltip = true,
}) => {
  // Size mapping
  const sizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const iconSizeClasses = {
    sm: 'w-2 h-2',
    md: 'w-2.5 h-2.5',
    lg: 'w-3 h-3',
  };

  // 1. Admin gets Black Tick
  if (role === 'admin') {
    return (
      <span
        title={showTooltip ? 'Administrator Verified (Official Black Tick)' : undefined}
        className={`inline-flex items-center justify-center rounded-full bg-black border border-slate-600 text-white shadow-sm shrink-0 cursor-default select-none ${sizeClasses[size]} ${className}`}
      >
        <Check className={`${iconSizeClasses[size]} stroke-[3.5]`} />
      </span>
    );
  }

  // 2. Agents (Faculty / Counselors) get Grey Tick
  if (role === 'agent') {
    return (
      <span
        title={showTooltip ? 'Faculty & Counselor Agent Verified (Official Grey Tick)' : undefined}
        className={`inline-flex items-center justify-center rounded-full bg-slate-600 border border-slate-500 text-white shadow-sm shrink-0 cursor-default select-none ${sizeClasses[size]} ${className}`}
      >
        <Check className={`${iconSizeClasses[size]} stroke-[3.5]`} />
      </span>
    );
  }

  // 3. Students with 3+ Referrals get Blue Tick
  if (role === 'student' && referralCount >= 3) {
    return (
      <span
        title={showTooltip ? `Verified Campus Ambassador (${referralCount} Referrals • Official Blue Tick)` : undefined}
        className={`inline-flex items-center justify-center rounded-full bg-sky-500 border border-sky-400 text-white shadow-sm shadow-sky-500/30 shrink-0 cursor-default select-none ${sizeClasses[size]} ${className}`}
      >
        <Check className={`${iconSizeClasses[size]} stroke-[3.5]`} />
      </span>
    );
  }

  return null;
};
