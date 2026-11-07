'use client';

import React from 'react';
import { cn } from '@/lib/utils/cn';
import { MapPinIcon } from '@/components/ui/Icons';
import { DemographicCity } from '@/types';

export interface DemographicsBarProps {
  gender: {
    male: number;
    female: number;
  };
  topCities: DemographicCity[];
  title?: string;
  showCities?: boolean;
  compact?: boolean;
  className?: string;
}

/**
 * Normalizes male and female percentages to sum strictly to 100%
 */
export function normalizeGenderPercentages(
  male: number,
  female: number
): { male: number; female: number } {
  const safeMale = Math.max(0, typeof male === 'number' && !isNaN(male) ? male : 0);
  const safeFemale = Math.max(0, typeof female === 'number' && !isNaN(female) ? female : 0);
  const total = safeMale + safeFemale;

  if (total === 0) {
    return { male: 50, female: 50 };
  }

  const normMale = Math.round((safeMale / total) * 100);
  const normFemale = 100 - normMale;

  return { male: normMale, female: normFemale };
}

export function DemographicsBar({
  gender,
  topCities,
  title = 'Demografi Audiens',
  showCities = true,
  compact = false,
  className = '',
}: DemographicsBarProps) {
  const safeGender = gender || { male: 50, female: 50 };
  const { male, female } = normalizeGenderPercentages(safeGender.male, safeGender.female);

  return (
    <div className={cn('space-y-4', className)}>
      {title && (
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-ink/80 flex items-center gap-1.5 font-mono">
            <span className="w-2 h-2 bg-mustard border border-ink inline-block" />
            {title}
          </h4>
          <span className="text-[11px] font-mono font-bold text-ink/60">
            Terverifikasi Internal
          </span>
        </div>
      )}

      {/* Gender Distribution Dual-Bar */}
      <div>
        <div className="flex justify-between items-center text-xs font-mono font-bold text-ink mb-1.5">
          <span className="flex items-center gap-1 text-coral-hover">
            <span className="w-2 h-2 rounded-full bg-coral border border-ink" />
            Perempuan {female}%
          </span>
          <span className="flex items-center gap-1 text-mint-hover">
            Laki-laki {male}%
            <span className="w-2 h-2 rounded-full bg-mint border border-ink" />
          </span>
        </div>

        <div
          className="h-6 w-full bg-paper border-2 border-ink rounded-lg shadow-neo-sm overflow-hidden flex"
          role="progressbar"
          aria-label={`Distribusi Gender: ${female}% Perempuan, ${male}% Laki-laki`}
          aria-valuenow={female}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            style={{ width: `${female}%` }}
            className="h-full bg-coral border-r-2 border-ink flex items-center justify-start pl-2 transition-all duration-500 ease-out"
          >
            {female >= 20 && (
              <span className="text-[10px] font-mono font-black text-ink select-none">
                {female}%
              </span>
            )}
          </div>
          <div
            style={{ width: `${male}%` }}
            className="h-full bg-mint flex items-center justify-end pr-2 transition-all duration-500 ease-out"
          >
            {male >= 20 && (
              <span className="text-[10px] font-mono font-black text-ink select-none">
                {male}%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Top Cities Distribution (West Sumatra Core) */}
      {showCities && (
        <div>
          <div className="text-[11px] font-mono font-bold uppercase tracking-wider text-ink/70 mb-2 flex items-center gap-1">
            <MapPinIcon size={12} className="text-ink" />
            Sebaran Kota Terbesar
          </div>

          {!topCities || topCities.length === 0 ? (
            <div className="text-xs font-mono font-bold text-ink/60 bg-paper/60 p-2.5 rounded-lg border border-ink/30 text-center">
              Data Belum Tersedia
            </div>
          ) : (
            <div className={cn('grid gap-2', compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2')}>
              {topCities.slice(0, 4).map((item, idx) => {
                const clampedPercent = Math.min(Math.max(item.percentage, 0), 100);
                return (
                  <div
                    key={`${item.city}-${idx}`}
                    className="p-2 bg-paper/50 rounded-lg border border-ink/40 flex flex-col justify-between"
                  >
                    <div className="flex justify-between items-center text-xs font-bold mb-1">
                      <span className="truncate text-ink flex items-center gap-1">
                        <span className="font-mono text-[10px] text-ink/60">#{idx + 1}</span>
                        {item.city}
                      </span>
                      <span className="font-mono font-black text-ink text-xs ml-1">
                        {clampedPercent}%
                      </span>
                    </div>
                    <div className="w-full bg-white h-2 rounded-full border border-ink/40 overflow-hidden">
                      <div
                        className="bg-mustard h-full border-r border-ink/30 transition-all duration-500"
                        style={{ width: `${clampedPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

