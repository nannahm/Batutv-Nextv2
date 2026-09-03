import React, { useState, useEffect } from 'react';
import { CloudSun, Radio, Youtube, Facebook, Instagram, Twitter, MessageCircle } from 'lucide-react';
import { WeatherData } from '../types/news';

interface TopBarProps {
  weather: WeatherData;
  onOpenLiveStream: () => void;
  fontSizeLevel: number;
  onChangeFontSize: (level: number) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  weather,
  onOpenLiveStream,
  fontSizeLevel,
  onChangeFontSize,
}) => {
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };
      const dateStr = now.toLocaleDateString('id-ID', options);
      const timeStr = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentDateTime(`${dateStr} | ${timeStr} WIB`);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div id="top-bar" className="bg-[#0f172a] text-slate-300 text-xs border-b border-slate-800">
      <div className="max-w-[980px] mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex flex-wrap items-center justify-between gap-2">
        {/* Left: Date & Time + Weather */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="font-medium text-slate-200">{currentDateTime || 'Memuat waktu...'}</span>
          <span className="hidden sm:inline-block text-slate-600">|</span>
          <div className="hidden sm:flex items-center gap-1.5 text-amber-300">
            <CloudSun className="w-3.5 h-3.5 text-amber-400" />
            <span>
              {weather.city}: <strong>{weather.temp}°C</strong> ({weather.condition})
            </span>
            <span className="text-[10px] text-slate-400 ml-1 bg-slate-800 px-1.5 py-0.5 rounded">
              Udara: {weather.airQuality}
            </span>
          </div>
        </div>

        {/* Right: Live shortcut, Font Size Adjuster & Socials */}
        <div className="flex items-center gap-3 sm:gap-5 ml-auto">
          {/* Font Resizer */}
          <div className="hidden md:flex items-center gap-1 text-[11px] text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            <span>Ukuran:</span>
            <button
              id="btn-font-smaller"
              onClick={() => onChangeFontSize(Math.max(0, fontSizeLevel - 1))}
              className={`px-1 hover:text-white transition font-bold ${fontSizeLevel === 0 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300'}`}
              title="Perkecil huruf"
            >
              A-
            </button>
            <button
              id="btn-font-normal"
              onClick={() => onChangeFontSize(1)}
              className={`px-1 hover:text-white transition font-bold ${fontSizeLevel === 1 ? 'text-red-400' : 'text-slate-300'}`}
              title="Ukuran normal"
            >
              A
            </button>
            <button
              id="btn-font-larger"
              onClick={() => onChangeFontSize(Math.min(2, fontSizeLevel + 1))}
              className={`px-1 hover:text-white transition font-bold ${fontSizeLevel === 2 ? 'text-slate-600 cursor-not-allowed' : 'text-slate-300'}`}
              title="Perbesar huruf"
            >
              A+
            </button>
          </div>

          {/* BatuTV Live Stream Fast Button */}
          <button
            id="btn-top-live"
            onClick={onOpenLiveStream}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-2.5 py-0.5 rounded transition shadow-sm animate-pulse"
          >
            <Radio className="w-3 h-3" />
            <span className="tracking-wide text-[11px]">BATUTV LIVE</span>
          </button>

          {/* Social Icons */}
          <div className="hidden lg:flex items-center gap-2.5 text-slate-400">
            <a href="#youtube" onClick={(e) => e.preventDefault()} title="YouTube BatuTV" className="hover:text-red-500 transition">
              <Youtube className="w-3.5 h-3.5" />
            </a>
            <a href="#facebook" onClick={(e) => e.preventDefault()} title="Facebook BatuTV" className="hover:text-blue-500 transition">
              <Facebook className="w-3.5 h-3.5" />
            </a>
            <a href="#instagram" onClick={(e) => e.preventDefault()} title="Instagram @batutv_official" className="hover:text-pink-500 transition">
              <Instagram className="w-3.5 h-3.5" />
            </a>
            <a href="#twitter" onClick={(e) => e.preventDefault()} title="X / Twitter BatuTV" className="hover:text-slate-200 transition">
              <Twitter className="w-3.5 h-3.5" />
            </a>
            <a href="#whatsapp" onClick={(e) => e.preventDefault()} title="Saluran WhatsApp BatuTV" className="hover:text-emerald-400 transition">
              <MessageCircle className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
