import React, { useState, useRef, useEffect } from 'react';
import { useCBT } from '../../context/CBTContext';
import { Sun, Moon, BookOpen, Sparkles, Check, ChevronDown } from 'lucide-react';
import { AppTheme } from '../../types/cbt';

interface ThemeSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const THEME_OPTIONS: {
  id: AppTheme;
  name: string;
  badge: string;
  description: string;
  icon: typeof Sun;
  previewBg: string;
  previewBorder: string;
  previewAccent: string;
  previewText: string;
}[] = [
  {
    id: 'soft-blue',
    name: 'Biru Sejuk (Default)',
    badge: 'CBT Sekolah',
    description: 'Latar biru lembut sejuk standar ANBK & Pusmendik',
    icon: Sun,
    previewBg: 'bg-[#eef4fc]',
    previewBorder: 'border-blue-300',
    previewAccent: 'bg-blue-600',
    previewText: 'text-blue-700',
  },
  {
    id: 'sky-pastel',
    name: 'Biru Langit Pastel',
    badge: 'Sky Blue',
    description: 'Nuansa biru langit cerah dengan kontras tinggi',
    icon: Sparkles,
    previewBg: 'bg-[#e0edff]',
    previewBorder: 'border-blue-400',
    previewAccent: 'bg-blue-700',
    previewText: 'text-blue-800',
  },
  {
    id: 'pure-white',
    name: 'Putih Bersih',
    badge: 'Pure White',
    description: 'Latar putih salju jernih & bersih maksimal',
    icon: Sun,
    previewBg: 'bg-white',
    previewBorder: 'border-slate-300',
    previewAccent: 'bg-slate-800',
    previewText: 'text-slate-800',
  },
  {
    id: 'cool-slate',
    name: 'Abu-Abu Sejuk',
    badge: 'Cool Slate',
    description: 'Latar netral slate modern bebas silau',
    icon: Sun,
    previewBg: 'bg-[#f1f5f9]',
    previewBorder: 'border-slate-300',
    previewAccent: 'bg-slate-600',
    previewText: 'text-slate-700',
  },
  {
    id: 'dark',
    name: 'Mode Gelap OLED',
    badge: 'Dark OLED',
    description: 'Kontras tinggi redup, nyaman di ruangan malam',
    icon: Moon,
    previewBg: 'bg-[#090d16]',
    previewBorder: 'border-slate-700',
    previewAccent: 'bg-blue-500',
    previewText: 'text-slate-100',
  },
  {
    id: 'midnight',
    name: 'Midnight Samudra',
    badge: 'Deep Navy',
    description: 'Biru samudra gelap berpadu aksen neon modern',
    icon: Sparkles,
    previewBg: 'bg-[#050a14]',
    previewBorder: 'border-sky-800',
    previewAccent: 'bg-cyan-500',
    previewText: 'text-cyan-100',
  },
  {
    id: 'sepia',
    name: 'Kertas Sepia',
    badge: 'Eye-Care',
    description: 'Kertas hangat lembut untuk relaksasi mata',
    icon: BookOpen,
    previewBg: 'bg-[#f7eedb]',
    previewBorder: 'border-amber-300',
    previewAccent: 'bg-amber-700',
    previewText: 'text-amber-950',
  },
];

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({ compact = false, className = '' }) => {
  const { theme, setTheme } = useCBT();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Normalize 'light' to 'soft-blue' if matched
  const currentOption = THEME_OPTIONS.find(t => t.id === theme) || (theme === 'light' ? THEME_OPTIONS[0] : THEME_OPTIONS[0]);
  const CurrentIcon = currentOption.icon;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-[11px] sm:text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
          theme === 'dark' || theme === 'midnight'
            ? 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
            : theme === 'sepia'
            ? 'bg-[#f4ebd9] hover:bg-[#ebdcc3] text-[#423224] border border-[#d8c6a7]'
            : 'bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200'
        }`}
        title={`Warna latar saat ini: ${currentOption.name}. Klik untuk mengganti warna latar belakang (Biru Sejuk, Putih Bersih, Abu Modern, Dark, Sepia)`}
      >
        <CurrentIcon className="w-3.5 h-3.5 text-blue-600 shrink-0" />
        {!compact && (
          <span className="hidden xs:inline truncate max-w-[95px] sm:max-w-none">
            {currentOption.name}
          </span>
        )}
        <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Popover Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-72 sm:w-80 rounded-2xl shadow-2xl border border-slate-200 bg-white/98 backdrop-blur-md z-[100] p-2 animate-in fade-in zoom-in-95 duration-150 theme-dropdown-panel max-h-[85vh] overflow-y-auto">
          <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Pilihan Warna Latar Belakang</span>
            </span>
            <span className="text-[10px] text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full font-semibold">
              {THEME_OPTIONS.length} Opsi
            </span>
          </div>

          <div className="py-1 space-y-1">
            {THEME_OPTIONS.map(opt => {
              const Icon = opt.icon;
              const isSelected = opt.id === theme || (theme === 'light' && opt.id === 'soft-blue');

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => {
                    setTheme(opt.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer group ${
                    isSelected
                      ? 'bg-blue-50 text-blue-950 font-bold border border-blue-200 shadow-2xs'
                      : 'hover:bg-slate-100/80 text-slate-700 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    {/* Visual Swatch */}
                    <div
                      className={`w-7 h-7 rounded-lg ${opt.previewBg} border ${opt.previewBorder} flex items-center justify-center shrink-0 shadow-xs ring-1 ring-black/5`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${opt.previewText}`} />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold leading-none">{opt.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded-full font-mono font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                          {opt.badge}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-1">
                        {opt.description}
                      </p>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="w-5 h-5 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0 ml-2">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          <div className="px-2.5 py-1.5 mt-1 border-t border-slate-100 text-[10px] text-slate-400 text-center">
            Pilihan latar belakang tersimpan otomatis di perangkat Anda
          </div>
        </div>
      )}
    </div>
  );
};
