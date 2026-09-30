import React from 'react';

interface MediaPrimaLogoProps {
  className?: string;
  height?: number;
  showBadge?: boolean;
}

export const MediaPrimaLogo: React.FC<MediaPrimaLogoProps> = ({
  className = '',
  height = 36,
  showBadge = true,
}) => {
  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${className}`}
      title="Media Prima Berhad (MPB)"
    >
      {/* Official Media Prima Dual-Block Vector Logo */}
      <div className="inline-flex items-center overflow-hidden rounded-md shadow-xs border border-slate-200/60 shrink-0">
        <svg
          viewBox="0 0 240 96"
          height={height}
          width={Math.round(height * 2.5)}
          className="block"
          xmlns="http://www.w3.org/2000/svg"
          role="img"
          aria-label="Media Prima Berhad (MPB)"
        >
          {/* Left Block: Media Prima Red */}
          <rect x="0" y="0" width="120" height="96" fill="#E11D24" />
          {/* Right Block: Media Prima Jet Black */}
          <rect x="120" y="0" width="120" height="96" fill="#111111" />

          {/* 'media' wordmark */}
          <text
            x="60"
            y="64"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="-1.8"
            textAnchor="middle"
          >
            media
          </text>

          {/* 'prima' wordmark */}
          <text
            x="180"
            y="64"
            fill="#FFFFFF"
            fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif"
            fontWeight="900"
            fontSize="44"
            letterSpacing="-1.8"
            textAnchor="middle"
          >
            prima
          </text>
        </svg>
      </div>

      {/* Official MPB Corporate Badge */}
      {showBadge && (
        <div className="flex flex-col justify-center leading-none">
          <div className="flex items-center gap-1.5">
            <span className="bg-slate-900 text-white font-black text-[11px] tracking-wider px-1.5 py-0.5 rounded-sm border border-slate-800">
              MPB
            </span>
            <span className="text-[10px] font-bold text-slate-700 tracking-tight uppercase hidden md:inline">
              BERHAD
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
