import React from 'react';
import { useTranslation } from 'react-i18next';

/**
 * InvestigationStamp - Detective rubber-stamp badge.
 * Evokes an official investigation bureau seal on dossiers or verified evidence.
 * 
 * Accessible: supports prefers-reduced-motion via Tailwind motion-reduce utilities.
 */
const VARIANTS = {
  solved: {
    textKey: 'stampSolvedText',
    subtextKey: 'stampSolvedSubtext',
    borderClass: 'border-emerald-500/80 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10',
    ringClass: 'ring-emerald-500/30',
  },
  verified: {
    textKey: 'stampVerifiedText',
    subtextKey: 'stampVerifiedSubtext',
    borderClass: 'border-amber-500/80 text-amber-600 dark:text-amber-400 bg-amber-500/10',
    ringClass: 'ring-amber-500/30',
  },
  confidential: {
    textKey: 'stampConfidentialText',
    subtextKey: 'stampConfidentialSubtext',
    borderClass: 'border-red-600/80 text-red-600 dark:text-red-400 bg-red-600/10',
    ringClass: 'ring-red-600/30',
  },
  classified: {
    textKey: 'stampClassifiedText',
    subtextKey: 'stampClassifiedSubtext',
    borderClass: 'border-primary/80 text-primary bg-primary/10',
    ringClass: 'ring-primary/30',
  },
  evidence_secured: {
    textKey: 'stampSecuredText',
    subtextKey: 'stampSecuredSubtext',
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
  const { t } = useTranslation('investigation');
  const currentVariant = VARIANTS[variant] || VARIANTS.solved;
  const currentSize = SIZES[size] || SIZES.md;
  const displayText = label || t(currentVariant.textKey);
  const displaySubtext = sublabel !== undefined ? sublabel : t(currentVariant.subtextKey);

  const animationClass = animated
    ? 'animate-stamp motion-reduce:animate-none'
    : '';

  return (
    <div
      data-testid={testId}
      role="status"
      aria-label={`${displayText} - ${displaySubtext || t('stampLabelDefault')}`}
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
