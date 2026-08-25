import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight, X, Sparkles, Check } from 'lucide-react';
import { Button } from '../../components/ui/Button.jsx';

/**
 * OnboardingSpotlight — Pure React Guided Spotlight Component (Step 6.5.5)
 *
 * Hướng dẫn 4 bước trực quan nổi bật (Highlight Spotlight overlay).
 * Không phụ thuộc thư viện bên ngoài.
 *
 * @param {Object} props
 * @param {Array<{id: string, target: string, title: string, body: string}>} props.steps
 * @param {boolean} props.isOpen
 * @param {Function} [props.onComplete]
 * @param {Function} [props.onSkip]
 */
export function OnboardingSpotlight({ steps = [], isOpen = false, onComplete, onSkip }) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState(null);

  const currentStep = steps[currentStepIndex];

  // Tính toán vị trí và kích thước phần tử target
  const updateTargetRect = useCallback(() => {
    if (!currentStep?.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(currentStep.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect({
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      });
      // Scroll nhẹ nếu phần tử nằm ngoài viewport (an toàn trên JSDOM test)
      if (typeof element.scrollIntoView === 'function') {
        element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    } else {
      setTargetRect(null);
    }
  }, [currentStep]);

  useEffect(() => {
    if (!isOpen) return;

    updateTargetRect();
    window.addEventListener('resize', updateTargetRect);
    window.addEventListener('scroll', updateTargetRect, true);

    return () => {
      window.removeEventListener('resize', updateTargetRect);
      window.removeEventListener('scroll', updateTargetRect, true);
    };
  }, [isOpen, currentStepIndex, updateTargetRect]);

  // Phím tắt bàn phím
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (onSkip) onSkip();
      } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStepIndex, steps.length]);

  if (!isOpen || steps.length === 0 || !currentStep) return null;

  const isFirstStep = currentStepIndex === 0;
  const isLastStep = currentStepIndex === steps.length - 1;

  function handleNext() {
    if (isLastStep) {
      if (onComplete) onComplete();
    } else {
      setCurrentStepIndex((prev) => prev + 1);
    }
  }

  function handlePrev() {
    if (!isFirstStep) {
      setCurrentStepIndex((prev) => prev - 1);
    }
  }

  // Padding thêm xung quanh phần tử target (px)
  const pad = 8;

  // Tính vị trí Tooltip (nằm dưới target hoặc fixed center nếu không có targetRect)
  const getTooltipStyle = () => {
    if (!targetRect) {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const windowHeight = window.innerHeight;
    const windowWidth = window.innerWidth;
    const tooltipWidth = Math.min(360, windowWidth - 32);

    // Ưu tiên hiển thị phía dưới target
    let top = targetRect.top + targetRect.height + 16;
    let left = targetRect.left;

    // Nếu bị tràn cạnh đáy viewport → hiển thị phía trên target
    if (top + 200 > windowHeight) {
      top = Math.max(16, targetRect.top - 210);
    }

    // Đảm bảo không bị dính sát hoặc vượt mép phải viewport
    if (left + tooltipWidth > windowWidth - 16) {
      left = Math.max(16, windowWidth - tooltipWidth - 16);
    }

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${tooltipWidth}px`,
    };
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true" aria-label="Guided Tour">
      {/* ── Backdrop Overlay với Spotlight Cutout Ring ── */}
      {targetRect ? (
        <div
          className="fixed transition-all duration-300 pointer-events-none rounded-2xl ring-4 ring-amber-500 ring-offset-2 ring-offset-background/50 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)] animate-pulse"
          style={{
            top: `${targetRect.top - pad}px`,
            left: `${targetRect.left - pad}px`,
            width: `${targetRect.width + pad * 2}px`,
            height: `${targetRect.height + pad * 2}px`,
          }}
        />
      ) : (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity duration-300" />
      )}

      {/* ── Tooltip Card ── */}
      <div
        className="fixed z-50 bg-card border border-amber-500/40 rounded-2xl p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-200"
        style={getTooltipStyle()}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <span className="grid size-6 place-items-center rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
              {currentStepIndex + 1}
            </span>
            <h3 className="text-sm font-bold text-foreground">
              {currentStep.title}
            </h3>
          </div>

          <button
            onClick={onSkip}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded-lg hover:bg-muted cursor-pointer"
            title="Đóng hướng dẫn (Esc)"
            aria-label="Đóng hướng dẫn"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Body */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
          {currentStep.body}
        </p>

        {/* Progress dots & Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          {/* Step dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-5 bg-amber-500'
                    : 'w-1.5 bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <button
                onClick={handlePrev}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-muted cursor-pointer"
              >
                <ChevronLeft className="size-3.5" />
                Truớc
              </button>
            )}

            <Button
              onClick={handleNext}
              size="sm"
              className="gap-1 bg-amber-500 hover:bg-amber-600 text-amber-950 font-bold shadow-sm cursor-pointer"
            >
              {isLastStep ? (
                <>
                  Bắt đầu làm
                  <Check className="size-3.5" />
                </>
              ) : (
                <>
                  Tiếp theo
                  <ChevronRight className="size-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
