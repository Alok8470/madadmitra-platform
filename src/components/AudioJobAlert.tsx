import React, { useEffect, useState } from 'react';
import { Volume2, Check, X, MapPin, IndianRupee, MessageSquareQuote, BellRing } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { playStudioFemaleVoice, stopJobSpeech, playDispatchChime } from '../services/audioService';

interface AudioJobAlertProps {
  areaName: string;
  serviceTitleHi: string;
  serviceTitleEn?: string;
  estimatedFee: number;
  distanceKm?: number;
  onAccept: () => void;
  onDecline: () => void;
}

export const AudioJobAlert: React.FC<AudioJobAlertProps> = ({
  areaName,
  serviceTitleHi,
  serviceTitleEn,
  estimatedFee,
  distanceKm = 1.2,
  onAccept,
  onDecline,
}) => {
  const { language } = useLanguage();
  const isHi = language === 'hi';

  const [isPlaying, setIsPlaying] = useState(false);

  const startPlayback = () => {
    setIsPlaying(true);
    playStudioFemaleVoice({
      serviceCategory: serviceTitleEn || serviceTitleHi,
      onStart: () => setIsPlaying(true),
      onEnd: () => setIsPlaying(false),
    });
  };

  const handleToggleAudio = () => {
    if (isPlaying) {
      stopJobSpeech();
      setIsPlaying(false);
    } else {
      startPlayback();
    }
  };

  useEffect(() => {
    startPlayback();
    return () => {
      stopJobSpeech();
    };
  }, [areaName, serviceTitleHi, serviceTitleEn]);

  const handleAccept = () => {
    stopJobSpeech();
    playDispatchChime();
    onAccept();
  };

  const handleDecline = () => {
    stopJobSpeech();
    onDecline();
  };

  const displayService = isHi ? serviceTitleHi : serviceTitleEn || serviceTitleHi;

  return (
    <div className="w-full max-w-lg mx-auto rounded-3xl bg-slate-900 border-4 border-amber-400 p-6 sm:p-7 shadow-2xl text-white animate-fade-in relative overflow-hidden">
      {/* Background Amber Glow */}
      <div className="absolute top-0 right-0 h-44 w-44 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Top Status Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-3 w-3 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </span>
          <span className="font-display text-sm font-black tracking-wide uppercase text-amber-300 flex items-center gap-1.5">
            <BellRing className="h-4 w-4 text-amber-400 animate-bounce" />
            {isHi ? 'नया काम उपलब्ध है!' : 'NEW BOOKING ALERT!'}
          </span>
        </div>

        <span className="text-[11px] bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 font-bold flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {isHi ? '🎙️ स्टूडियो वॉइस' : '🎙️ Studio Voice Audio'}
        </span>
      </div>

      {/* Big Interactive "Tap to Listen" Sound Wave Controller */}
      <div className="mt-4">
        <button
          onClick={handleToggleAudio}
          className={`w-full py-3.5 px-4 rounded-2xl flex items-center justify-between transition-all active:scale-98 shadow-md ${
            isPlaying
              ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-amber-300 shadow-amber-400/30'
              : 'bg-slate-800 hover:bg-slate-750 text-amber-300 font-bold border border-amber-500/40'
          }`}
        >
          <div className="flex items-center gap-3">
            {isPlaying ? (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-950 text-amber-400">
                <Volume2 className="h-5 w-5 animate-pulse" />
              </div>
            ) : (
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-amber-400/20 text-amber-400">
                <Volume2 className="h-5 w-5" />
              </div>
            )}
            <div className="text-left">
              <p className="text-sm font-extrabold leading-tight">
                {isPlaying
                  ? isHi
                    ? 'आवाज़ बज रही है (रोकने के लिए टैप करें)'
                    : 'Audio Playing (Tap to Pause)'
                  : isHi
                  ? '🔊 पूरा संदेश सुनें'
                  : '🔊 Play Voice Alert (Tap to Listen)'}
              </p>
              <p className={`text-[10px] ${isPlaying ? 'text-slate-800 font-bold' : 'text-slate-400'}`}>
                {isPlaying
                  ? isHi
                    ? 'स्पष्ट स्टूडियो वॉइस'
                    : 'Crisp studio female voice'
                  : isHi
                  ? 'क्लिक करके प्राकृतिक आवाज़ में संदेश सुनें'
                  : 'Tap to listen to dispatch announcement'}
              </p>
            </div>
          </div>

          {/* Equalizer animation */}
          <div className="flex items-center gap-1.5 h-6 px-2">
            <span className={`w-1 rounded-full transition-all ${isPlaying ? 'h-6 bg-slate-950 animate-bounce' : 'h-2 bg-amber-400/40'}`} />
            <span className={`w-1 rounded-full transition-all ${isPlaying ? 'h-4 bg-slate-950 animate-pulse' : 'h-3 bg-amber-400/40'}`} />
            <span className={`w-1 rounded-full transition-all ${isPlaying ? 'h-7 bg-slate-950 animate-bounce' : 'h-2 bg-amber-400/40'}`} />
            <span className={`w-1 rounded-full transition-all ${isPlaying ? 'h-3 bg-slate-950 animate-pulse' : 'h-1.5 bg-amber-400/40'}`} />
          </div>
        </button>
      </div>

      {/* Human Voice Message Box */}
      <div className="mt-4 p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
          <MessageSquareQuote className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{isHi ? 'मदद मित्र वॉइस संदेश:' : 'MadadMitra Dispatch Voice Note:'}</span>
        </div>
        <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed italic bg-slate-900/60 p-3 rounded-xl border border-slate-800">
          {isHi
            ? `"नया काम! आपके इलाके से ${displayService} का काम आया है। कुल कमाई ₹${estimatedFee} नकद। काम स्वीकार करने के लिए तुरंत हरा बटन दबाएं।"`
            : `"New Job Alert! A new ${displayService} booking has arrived from your area. Total earnings ₹${estimatedFee} cash. Tap the green button to accept immediately."`}
        </p>
      </div>

      {/* Quick Visual Snapshot */}
      <div className="my-5 grid grid-cols-2 gap-3">
        <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700">
          <span className="text-[10px] uppercase font-bold text-slate-400">
            {isHi ? 'इलाका / दूरी' : 'Area / Distance'}
          </span>
          <p className="text-sm font-bold text-white flex items-center gap-1 mt-0.5">
            <MapPin className="h-3.5 w-3.5 text-rose-400" />
            <span>{areaName}</span>
          </p>
          <p className="text-[10px] text-slate-400">({distanceKm} {isHi ? 'किमी' : 'km away'})</p>
        </div>

        <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
          <span className="text-[10px] uppercase font-bold text-emerald-300">
            {isHi ? 'आपकी नकद कमाई' : 'Direct Cash Payment'}
          </span>
          <p className="text-xl font-black text-emerald-400 flex items-center gap-0.5 mt-0.5">
            <IndianRupee className="h-5 w-5" />
            <span>{estimatedFee}</span>
          </p>
          <p className="text-[10px] text-emerald-200">
            {isHi ? '100% नकद आपको' : '100% kept by you'}
          </p>
        </div>
      </div>

      <p className="text-[11px] text-slate-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-700/50 mb-5 leading-relaxed">
        {isHi ? (
          <>💡 <strong>शून्य कमीशन:</strong> काम पूरा होने पर ग्राहक से ₹{estimatedFee} सीधे आपको नकद मिलेंगे। वॉलेट से केवल <strong>1 सिक्का (₹10)</strong> कटेगा।</>
        ) : (
          <>💡 <strong>Zero Commission:</strong> You collect ₹{estimatedFee} directly in cash or UPI upon completion. Only <strong>1 Lead Token (₹10)</strong> is deducted from your wallet.</>
        )}
      </p>

      {/* Large Action Buttons */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          onClick={handleDecline}
          className="h-16 rounded-2xl bg-rose-700 hover:bg-rose-600 active:scale-95 text-white font-extrabold text-base flex flex-col items-center justify-center gap-0.5 shadow-lg border border-rose-500 transition-transform"
        >
          <X className="h-5 w-5" />
          <span>{isHi ? 'मना करें' : 'Decline'}</span>
        </button>
        <button
          onClick={handleAccept}
          className="h-16 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-black text-lg flex flex-col items-center justify-center gap-0.5 shadow-lg border-2 border-emerald-300 transition-transform"
        >
          <Check className="h-6 w-6" />
          <span>{isHi ? 'स्वीकार करें' : 'Accept Job'}</span>
        </button>
      </div>
    </div>
  );
};

export default AudioJobAlert;
