import React, { useState } from 'react';
import {
  X,
  Radio,
  Tv,
  Volume2,
  Maximize2,
  Send,
  Calendar,
  Users,
  Play,
  Share2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { LiveScheduleItem } from '../types/news';
import { BatuTVBrandLogo } from './common/BatuTVBrandLogo';

interface LiveStreamModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedule: LiveScheduleItem[];
}

export const LiveStreamModal: React.FC<LiveStreamModalProps> = ({
  isOpen,
  onClose,
  schedule,
}) => {
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([
    { id: 1, user: 'Arema_Batu87', text: 'Salam dari Alun-Alun Kota Batu! Gambar jernih banget min 👍', time: '11:42' },
    { id: 2, user: 'Siti_Agro', text: 'Liputan apel Bumiaji tadi mantap, semoga petani semakin makmur', time: '11:43' },
    { id: 3, user: 'WisataJatim_Guide', text: 'Info jalur lingkar barat Klemuk apakah sudah buka normal?', time: '11:44' },
    { id: 4, user: 'BatuTV_Moderator', text: 'Selamat bergabung pemirsa! Pantau terus update lalu lintas dan berita terkini di BatuTV.', time: '11:45' },
  ]);

  if (!isOpen) return null;

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    setChatMessages([
      ...chatMessages,
      {
        id: Date.now(),
        user: 'Anda',
        text: chatInput.trim(),
        time: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setChatInput('');
  };

  return (
    <div id="livestream-modal-backdrop" className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div
        id="livestream-modal-container"
        className="bg-[#0f172a] text-white rounded-2xl w-full max-w-6xl shadow-2xl border border-slate-800 overflow-hidden my-4 flex flex-col max-h-[92vh]"
      >
        {/* Header */}
        <div className="bg-slate-900 px-4 sm:px-6 py-3 border-b border-slate-800 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              <BatuTVBrandLogo height={28} theme="dark" showSlogan={false} />
            </div>
            <div className="flex items-center gap-1.5 bg-red-600/90 text-white font-bold text-xs px-2.5 py-0.5 rounded shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              <span>LIVE SIARAN LANGSUNG</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:flex items-center gap-1.5 text-xs text-amber-400 font-medium">
              <Users className="w-3.5 h-3.5" />
              12.480 Pemirsa Sedang Menonton
            </span>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Main Grid: Player (8 cols) + Chat/Schedule Tabs (4 cols) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 flex-1 overflow-hidden">
          {/* Video Broadcast Stage (8 cols) */}
          <div className="lg:col-span-8 p-3 sm:p-5 flex flex-col justify-between overflow-y-auto">
            {/* Screen Mockup */}
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-slate-800 group">
              <img
                src="https://images.unsplash.com/photo-1590682680695-43b964a3ae17?q=80&w=1200&auto=format&fit=crop"
                alt="Live Stream BatuTV"
                className="w-full h-full object-cover opacity-80"
              />

              {/* Watermark & Live Overlays */}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <div className="bg-red-600 font-black text-xs px-2 py-1 rounded text-white shadow-md">
                  BATUTV HD
                </div>
                <div className="bg-black/70 backdrop-blur-xs text-xs font-bold px-2 py-1 rounded text-slate-200 border border-white/10">
                  STUDIO 1 KOTA BATU
                </div>
              </div>

              {/* Bottom Ticker overlay inside broadcast */}
              <div className="absolute bottom-0 inset-x-0 bg-red-700/90 backdrop-blur-xs text-white text-[11px] font-bold py-1.5 px-3 flex items-center justify-between border-t border-red-500/50">
                <span className="truncate">SEDANG TAYANG: Batu Hari Ini Siang — Liputan Agropolitan & Pariwisata</span>
                <span className="text-amber-300 ml-2 hidden sm:inline">1080p Full HD</span>
              </div>

              {/* Central play button indicator */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-16 h-16 rounded-full bg-red-600/80 backdrop-blur-xs text-white flex items-center justify-center shadow-2xl border border-white/20">
                  <Radio className="w-7 h-7 animate-pulse text-white" />
                </div>
              </div>
            </div>

            {/* Broadcast Details */}
            <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-white font-serif-heading">
                  Batu Hari Ini Siang (Live Streaming)
                </h3>
                <p className="text-xs text-slate-400">
                  Presenter: Bayu Wicaksono & Dian Anggraini | Studio Pusat BatuTV
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded border border-slate-700">
                  Kualitas: 1080p 60fps
                </span>
                <button
                  onClick={() => alert('Fitur bagikan siaran live disalin ke papan klip!')}
                  className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg transition"
                  title="Bagikan Siaran"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Sidebar: Schedule + Live Chat (4 cols) */}
          <div className="lg:col-span-4 bg-slate-900/70 border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-[400px] lg:h-auto">
            {/* Schedule Section */}
            <div className="p-3 border-b border-slate-800 bg-slate-900 flex-shrink-0">
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                <Calendar className="w-3.5 h-3.5" />
                Jadwal Acara Hari Ini
              </div>
              <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
                {schedule.slice(2, 6).map((prog, idx) => (
                  <div
                    key={idx}
                    className={`p-1.5 rounded text-xs flex items-center justify-between ${
                      prog.isLiveNow
                        ? 'bg-red-600/30 text-red-200 border border-red-500/40 font-bold'
                        : 'text-slate-400 bg-slate-800/40'
                    }`}
                  >
                    <span className="font-mono text-[10px] text-slate-300">{prog.time}</span>
                    <span className="truncate mx-2 text-[11px] text-slate-100">{prog.program}</span>
                    {prog.isLiveNow && (
                      <span className="bg-red-600 text-white text-[9px] px-1.5 py-0.2 rounded uppercase">
                        ON AIR
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Live Chat Header */}
            <div className="px-3 py-2 bg-slate-900/90 border-b border-slate-800 text-xs font-bold text-slate-300 flex items-center justify-between flex-shrink-0">
              <span>Live Chat Pemirsa</span>
              <span className="text-[10px] text-slate-400">Aktif</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-3 space-y-2.5 overflow-y-auto text-xs">
              {chatMessages.map((msg) => (
                <div key={msg.id} className="bg-slate-800/50 p-2 rounded-lg border border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                    <span className="font-bold text-red-400">{msg.user}</span>
                    <span>{msg.time}</span>
                  </div>
                  <p className="text-slate-200 text-[11px] leading-snug">{msg.text}</p>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendChat} className="p-2.5 bg-slate-900 border-t border-slate-800 flex gap-2 flex-shrink-0">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Tulis pesan live chat..."
                className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-400 outline-none focus:border-red-500"
              />
              <button
                type="submit"
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center justify-center"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
