import React from 'react';
import logoImage from '../assets/yenopay-logo.png';

export function BrandLogo({
  variant = 'light',
  portalLabel,
  imageClassName = 'w-28',
}) {
  const isLightText = variant === 'dark';

  return (
    <div className="flex min-w-0 flex-col items-start gap-0.5 select-none">
      <img
        src={logoImage}
        alt="YenoPay"
        className={`block h-auto ${imageClassName} rounded-lg object-contain pt-1`}
      />
      {portalLabel && (
        <span
          className={`max-w-40 truncate pl-1 text-[10px] font-medium tracking-wide ${
            isLightText ? 'text-white' : 'text-slate-600'
          }`}
        >
        </span>
      )}
    </div>
  );
}
