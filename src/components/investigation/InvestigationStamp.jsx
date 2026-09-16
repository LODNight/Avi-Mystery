import React from 'react';

/**
 * InvestigationStamp - Detective rubber-stamp badge.
 * Evokes an official investigation bureau seal on dossiers or verified evidence.
 * 
 * Accessible: supports prefers-reduced-motion via Tailwind motion-reduce utilities.
 */
const VARIANTS = {
  solved: {
    text: 'ÁN ĐÃ PHÁ',
    subtext: 'CASE CLOSED',
    borderClass: 'border-emerald-500/80 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    ringClass: 'ring-emerald-500/30',
  },
  verified: {
    text: 'ĐÃ XÁC THỰC',
    subtext: 'EVIDENCE VERIFIED',
    borderClass: 'border-amber-500/80 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    ringClass: 'ring-amber-500/30',
  },
  confidential: {
    text: 'HỒ SƠ TUYỆT MẬT',
    subtext: 'CONFIDENTIAL',
    borderClass: 'border-red-600/80 text-red-600 dark:text-red-400 bg-red-600/10',
    ringClass: 'ring-red-600/30',
  },
  classified: {
    text: 'TÀI LIỆU ĐIỀU TRA',
    subtext: 'RESTRICTED ACCESS',
    borderClass: 'border-primary/80 text-primary bg-primary/10',
    ringClass: 'ring-primary/30',
  },
  evidence_secured: {
    text: 'MANH MỐI NIÊM PHONG',
    subtext: 'SECURED ARTIFACT',
    borderClass: 'border-amber-600/80 text-amber-700 dark:text-amber-300 bg-amber-600/10',
    ringClass: 'ring-amber-600/30',
  },
};

const SIZES = {
  sm: {
    container: 'px-2.5 py-1 text-xs tracking-wider',
    subtext: 'text-[9px]',
    border: 'border-2',
  },
  md: {
    container: 'px-3.5 py-1.5 text-sm tracking-widest',
    subtext: 'text-[10px]',
    border: 'border-2',
  },
  lg: {
    container: 'px-5 py-2.5 text-base tracking-widest',
    subtext: 'text-xs',
    border: 'border-[3px]',
  },
};

export default function InvestigationStamp({
  variant = 'solved',
  label,
  sublabel,
  animated = true,
  size = 'md',
  rotate = '-rotate-6',
  className = '',
  testId = 'investigation-stamp',
}) {
  const currentVariant = VARIANTS[variant] || VARIANTS.solved;
  const currentSize = SIZES[size] || SIZES.md;
  const displayText = label || currentVariant.text;
  const displaySubtext = sublabel !== undefined ? sublabel : currentVariant.subtext;

  const animationClass = animated
    ? 'animate-stamp motion-reduce:animate-none'
    : '';

  return (
    <div
      data-testid={testId}
      role="status"
      aria-label={`${displayText} - ${displaySubtext || 'Con dấu điều tra'}`}
      className={`inline-flex flex-col items-center justify-center font-mono font-black uppercase select-none rounded-sm ${currentSize.border} border-dashed shadow-sm transition-transform duration-200 ${rotate} ${animationClass} ${currentVariant.borderClass} ${currentSize.container} ${className}`}
      style={{
        boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.05)',
      }}
    >
      <span className="leading-tight drop-shadow-sm font-extrabold">{displayText}</span>
      {displaySubtext && (
        <span className={`opacity-85 font-medium tracking-normal mt-0.5 ${currentSize.subtext}`}>
          ★ {displaySubtext} ★
        </span>
      )}
    </div>
  );
}
