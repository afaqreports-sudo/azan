import React, { useState } from 'react';
import { ShieldAlert, ChevronDown, ChevronUp, Sliders } from 'lucide-react';

interface DisclaimerBannerProps {
  onOpenSettings: () => void;
}

export const DisclaimerBanner: React.FC<DisclaimerBannerProps> = ({ onOpenSettings }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="w-full bg-amber-50/90 border border-amber-200/80 rounded-xl p-3.5 text-xs text-amber-950 transition-all">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-semibold">
          <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
          <span>Religious & Timing Disclaimer</span>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-stone-500 hover:text-stone-800 p-1 rounded-md"
          title={isExpanded ? 'Collapse disclaimer' : 'Read full disclaimer'}
        >
          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      <p className="mt-1 text-stone-700 text-[11px] leading-relaxed">
        Prayer times vary based on astronomical calculation methods, jurisprudential conventions (Hanafi vs Standard Shafi&apos;i), twilight criteria, and local mosque timetables. Calculated times are provided for personal guidance and are not universally authoritative.
      </p>

      {isExpanded && (
        <div className="mt-2.5 pt-2.5 border-t border-amber-200/60 text-[11px] text-stone-600 space-y-2">
          <p>
            Please use the <strong>± Minute Adjustments</strong> on each prayer card to align with your local community mosque timetable or azan schedule.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenSettings}
              className="inline-flex items-center gap-1 font-semibold text-emerald-800 hover:text-emerald-950 underline underline-offset-2"
            >
              <Sliders className="w-3 h-3" />
              <span>Adjust Calculation Method & Madhab</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
