import React from 'react';

/**
 * ApplianceIcon Component
 * Renders pure, high-resolution SVG vector illustration icons for each service category.
 * Supports matching by category ID (1-16) or name string.
 */
export default function ApplianceIcon({ name = '', id = null, className = 'w-12 h-12', style = {} }) {
  const str = String(name || '').toLowerCase().trim();
  const numId = Number(id);

  // Direct ID matching
  if (numId === 1) return <AcIcon className={className} style={style} />;
  if (numId === 2) return <RefrigeratorIcon className={className} style={style} />;
  if (numId === 3) return <WashingMachineIcon className={className} style={style} />;
  if (numId === 4) return <MicrowaveIcon className={className} style={style} />;
  if (numId === 5) return <MixerGrinderIcon className={className} style={style} />;
  if (numId === 6) return <PumpMotorIcon className={className} style={style} />;
  if (numId === 7) return <AirCoolerIcon className={className} style={style} />;
  if (numId === 8) return <InductionCooktopIcon className={className} style={style} />;
  if (numId === 9) return <StabilizerIcon className={className} style={style} />;
  if (numId === 10) return <PressIronIcon className={className} style={style} />;
  if (numId === 11) return <TvIcon className={className} style={style} />;
  if (numId === 12) return <CeilingFanIcon className={className} style={style} />;
  if (numId === 13) return <GeyserIcon className={className} style={style} />;
  if (numId === 14) return <StandFanIcon className={className} style={style} />;
  if (numId === 15) return <TableFanIcon className={className} style={style} />;
  if (numId === 16) return <WiringSwitchBoardIcon className={className} style={style} />;

  // String matching
  if (/\bwashing\b/i.test(str)) return <WashingMachineIcon className={className} style={style} />;
  if (/\b(ac|air conditioner)\b/i.test(str)) return <AcIcon className={className} style={style} />;
  if (/refrigerator|fridge/i.test(str)) return <RefrigeratorIcon className={className} style={style} />;
  if (/microwave/i.test(str)) return <MicrowaveIcon className={className} style={style} />;
  if (/mixer|grinder|mixi/i.test(str)) return <MixerGrinderIcon className={className} style={style} />;
  if (/pump/i.test(str)) return <PumpMotorIcon className={className} style={style} />;
  if (/cooler/i.test(str)) return <AirCoolerIcon className={className} style={style} />;
  if (/induction|cooktop/i.test(str)) return <InductionCooktopIcon className={className} style={style} />;
  if (/stabilizer/i.test(str)) return <StabilizerIcon className={className} style={style} />;
  if (/iron/i.test(str)) return <PressIronIcon className={className} style={style} />;
  if (/\btv\b|television/i.test(str)) return <TvIcon className={className} style={style} />;
  if (/ceiling/i.test(str)) return <CeilingFanIcon className={className} style={style} />;
  if (/geyser|heater/i.test(str)) return <GeyserIcon className={className} style={style} />;
  if (/stand/i.test(str)) return <StandFanIcon className={className} style={style} />;
  if (/table|wall/i.test(str)) return <TableFanIcon className={className} style={style} />;
  if (/wiring|switch/i.test(str)) return <WiringSwitchBoardIcon className={className} style={style} />;
  if (/fan/i.test(str)) return <CeilingFanIcon className={className} style={style} />;

  return <GenericApplianceIcon className={className} style={style} />;
}

/* ───────────────────────────────────────────────────────────────────────────── */
/* PURE SVG VECTOR ILLUSTRATIONS FOR APPLIANCES                                 */
/* ───────────────────────────────────────────────────────────────────────────── */

// 1. Air Conditioner SVG Vector
export function AcIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4" y="16" width="56" height="32" rx="6" fill="#F1F5F9" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="8" y="22" width="48" height="4" rx="2" fill="#CBD5E1" />
      <rect x="8" y="38" width="48" height="6" rx="3" fill="#0284C7" />
      <circle cx="50" cy="28" r="3" fill="#38BDF8" />
      <text x="38" y="30" fill="#0284C7" fontSize="7" fontWeight="bold" fontFamily="sans-serif">18°</text>
      <path d="M16 48 L14 54 M24 48 L24 56 M32 48 L32 58 M40 48 L40 56 M48 48 L50 54" stroke="#0284C7" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// 2. Refrigerator SVG Vector
export function RefrigeratorIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="6" width="36" height="52" rx="6" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2.5" />
      <line x1="14" y1="24" x2="50" y2="24" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="18" y="12" width="3" height="8" rx="1.5" fill="#0284C7" />
      <rect x="18" y="28" width="3" height="16" rx="1.5" fill="#0284C7" />
      <rect x="34" y="32" width="12" height="12" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <circle cx="40" cy="38" r="2" fill="#38BDF8" />
    </svg>
  );
}

// 3. Washing Machine SVG Vector
export function WashingMachineIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="6" width="40" height="52" rx="6" fill="#FFFFFF" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="16" y="11" width="14" height="6" rx="1.5" fill="#CBD5E1" />
      <circle cx="42" cy="14" r="3" fill="#0284C7" />
      <circle cx="34" cy="14" r="2" fill="#94A3B8" />
      <circle cx="32" cy="38" r="16" fill="#E0F2FE" stroke="#0284C7" strokeWidth="3" />
      <circle cx="32" cy="38" r="11" fill="#38BDF8" fillOpacity="0.3" stroke="#0284C7" strokeWidth="2" />
      <path d="M26 38 C28 34, 34 34, 36 38 C38 42, 34 44, 32 40" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 4. Microwave SVG Vector
export function MicrowaveIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="14" width="52" height="36" rx="5" fill="#F8FAFC" stroke="#475569" strokeWidth="2.5" />
      <rect x="10" y="18" width="32" height="28" rx="3" fill="#1E293B" stroke="#64748B" strokeWidth="2" />
      <rect x="14" y="22" width="24" height="20" rx="2" fill="#0F172A" />
      <circle cx="26" cy="32" r="5" fill="#F59E0B" fillOpacity="0.5" />
      <rect x="45" y="18" width="9" height="28" rx="2" fill="#E2E8F0" />
      <circle cx="49" cy="24" r="2" fill="#EF4444" />
      <circle cx="49" cy="32" r="2.5" fill="#475569" />
      <circle cx="49" cy="40" r="2.5" fill="#475569" />
    </svg>
  );
}

// 5. Mixer Grinder SVG Vector
export function MixerGrinderIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M22 34 L20 54 C20 56 22 58 24 58 L40 58 C42 58 44 56 44 54 L42 34 Z" fill="#E2E8F0" stroke="#0284C7" strokeWidth="2.5" />
      <path d="M20 12 L44 12 L40 34 L24 34 Z" fill="#CBD5E1" stroke="#334155" strokeWidth="2.5" />
      <path d="M18 10 C18 7, 46 7, 46 10 L44 12 L20 12 Z" fill="#EF4444" />
      <circle cx="32" cy="46" r="4" fill="#0284C7" />
      <line x1="32" y1="46" x2="34" y2="44" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
      <path d="M40 20 L48 20 L46 26 L40 24 Z" fill="#CBD5E1" stroke="#475569" strokeWidth="2" />
    </svg>
  );
}

// 6. Pump Motor SVG Vector
export function PumpMotorIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="20" width="30" height="28" rx="4" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
      <line x1="18" y1="20" x2="18" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="24" y1="20" x2="24" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="30" y1="20" x2="30" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
      <line x1="36" y1="20" x2="36" y2="48" stroke="#FFFFFF" strokeWidth="1.5" />
      <circle cx="48" cy="34" r="10" fill="#64748B" stroke="#334155" strokeWidth="2.5" />
      <rect x="12" y="48" width="40" height="6" rx="2" fill="#334155" />
    </svg>
  );
}

// 7. Air Cooler SVG Vector
export function AirCoolerIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="14" y="8" width="36" height="48" rx="6" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="32" cy="24" r="10" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2" />
      <path d="M32 18 L32 30 M26 24 L38 24 M28 20 L36 28 M36 20 L28 28" stroke="#0284C7" strokeWidth="2" />
      <rect x="18" y="38" width="28" height="12" rx="2" fill="#E2E8F0" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="18" y1="42" x2="46" y2="42" stroke="#94A3B8" strokeWidth="1.5" />
      <line x1="18" y1="46" x2="46" y2="46" stroke="#94A3B8" strokeWidth="1.5" />
    </svg>
  );
}

// 8. Induction Cooktop SVG Vector
export function InductionCooktopIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="16" width="48" height="32" rx="4" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
      <circle cx="28" cy="32" r="10" stroke="#EF4444" strokeWidth="2.5" strokeDasharray="3 2" />
      <circle cx="28" cy="32" r="6" stroke="#F59E0B" strokeWidth="2" />
      <rect x="42" y="22" width="10" height="20" rx="2" fill="#1E293B" />
      <circle cx="47" cy="26" r="1.5" fill="#10B981" />
      <circle cx="47" cy="32" r="1.5" fill="#EF4444" />
      <circle cx="47" cy="38" r="1.5" fill="#38BDF8" />
    </svg>
  );
}

// 9. Stabilizer SVG Vector
export function StabilizerIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="16" width="44" height="32" rx="5" fill="#1E293B" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="16" y="22" width="20" height="10" rx="2" fill="#0284C7" fillOpacity="0.2" stroke="#0369A1" strokeWidth="1.5" />
      <text x="17" y="30" fill="#38BDF8" fontSize="7" fontWeight="bold" fontFamily="monospace">220V</text>
      <circle cx="44" cy="24" r="2.5" fill="#10B981" />
      <circle cx="44" cy="32" r="2.5" fill="#F59E0B" />
      <rect x="16" y="36" width="32" height="6" rx="1.5" fill="#334155" />
    </svg>
  );
}

// 10. Press Iron SVG Vector
export function PressIronIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 40 L52 40 C54 40 56 36 50 30 C44 24 34 20 20 20 L12 20 Z" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
      <rect x="8" y="40" width="48" height="4" rx="1" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
      <path d="M14 20 L24 10 L38 10 L34 20" stroke="#475569" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="28" cy="28" r="3" fill="#F59E0B" />
    </svg>
  );
}

// 11. TV SVG Vector
export function TvIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="12" width="52" height="34" rx="3" fill="#0F172A" stroke="#475569" strokeWidth="2.5" />
      <rect x="9" y="15" width="46" height="28" rx="1" fill="#1E293B" />
      <path d="M14 38 L24 24 L34 32 L40 26 L50 38 Z" fill="#0284C7" fillOpacity="0.4" />
      <path d="M26 46 L38 46 M32 46 L32 52 M24 52 L40 52" stroke="#475569" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

// 12. Ceiling Fan SVG Vector
export function CeilingFanIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="32" r="7" fill="#0284C7" stroke="#0369A1" strokeWidth="2.5" />
      <path d="M32 25 C32 10 40 8 34 6 C26 4 28 20 32 25 Z" fill="#38BDF8" />
      <path d="M38 34 C50 38 52 46 54 40 C56 32 40 30 38 34 Z" fill="#38BDF8" />
      <path d="M26 34 C14 38 12 46 10 40 C8 32 24 30 26 34 Z" fill="#38BDF8" />
      <circle cx="32" cy="32" r="3" fill="#FFFFFF" />
    </svg>
  );
}

// 13. Geyser SVG Vector
export function GeyserIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="18" y="8" width="28" height="48" rx="8" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="22" y="14" width="20" height="30" rx="4" fill="#E2E8F0" />
      <circle cx="32" cy="24" r="5" fill="#EF4444" fillOpacity="0.2" stroke="#EF4444" strokeWidth="2" />
      <circle cx="32" cy="24" r="2" fill="#EF4444" />
      <circle cx="28" cy="48" r="2.5" fill="#10B981" />
      <circle cx="36" cy="48" r="2.5" fill="#EF4444" />
    </svg>
  );
}

// 14. Stand Fan SVG Vector
export function StandFanIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="22" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="32" cy="22" r="4" fill="#0284C7" />
      <line x1="32" y1="36" x2="32" y2="54" stroke="#475569" strokeWidth="3.5" />
      <path d="M22 54 L42 54" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}

// 15. Table Fan SVG Vector
export function TableFanIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="32" cy="24" r="14" fill="#E0F2FE" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="32" cy="24" r="4" fill="#0284C7" />
      <path d="M26 38 L32 46 L38 38" stroke="#475569" strokeWidth="3.5" fill="none" />
      <rect x="22" y="46" width="20" height="6" rx="2" fill="#334155" />
    </svg>
  );
}

// 16. Wiring & Switch Board SVG Vector
export function WiringSwitchBoardIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="10" y="14" width="44" height="36" rx="4" fill="#F8FAFC" stroke="#0284C7" strokeWidth="2.5" />
      <rect x="16" y="20" width="8" height="12" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
      <rect x="18" y="22" width="4" height="4" fill="#0284C7" />
      <rect x="28" y="20" width="8" height="12" rx="1.5" fill="#E2E8F0" stroke="#64748B" strokeWidth="1.5" />
      <rect x="30" y="26" width="4" height="4" fill="#94A3B8" />
      <circle cx="44" cy="26" r="5" fill="#CBD5E1" stroke="#64748B" strokeWidth="1.5" />
      <circle cx="44" cy="24" r="1" fill="#334155" />
      <circle cx="42" cy="27" r="1" fill="#334155" />
      <circle cx="46" cy="27" r="1" fill="#334155" />
    </svg>
  );
}

// Generic Fallback SVG Vector
export function GenericApplianceIcon({ className = 'w-12 h-12', style = {} }) {
  return (
    <svg viewBox="0 0 64 64" className={className} style={style} fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="12" y="12" width="40" height="40" rx="8" fill="#F1F5F9" stroke="#0284C7" strokeWidth="2.5" />
      <circle cx="32" cy="32" r="10" stroke="#0284C7" strokeWidth="2" strokeDasharray="4 2" />
      <circle cx="32" cy="32" r="4" fill="#0284C7" />
    </svg>
  );
}
