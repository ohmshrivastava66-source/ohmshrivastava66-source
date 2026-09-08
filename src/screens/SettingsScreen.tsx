import React, { useState } from 'react';
import { StorageManager, GameSettings } from '../persistence/StorageManager';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Settings, Volume2, VolumeX, Eye, PlayCircle, RotateCcw, ArrowLeft, Check } from 'lucide-react';
import { sounds } from '../audio/SoundEffects';

interface SettingsScreenProps {
  onBack: () => void;
  onLaunchJudgeDemo: () => void;
  onProfileReset: () => void;
}

export const SettingsScreen: React.FC<SettingsScreenProps> = ({
  onBack,
  onLaunchJudgeDemo,
  onProfileReset,
}) => {
  const [settings, setSettings] = useState<GameSettings>(() => StorageManager.loadSettings());
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleToggleMute = () => {
    const updated = { ...settings, isMuted: !settings.isMuted };
    setSettings(updated);
    sounds.setMuted(updated.isMuted);
    StorageManager.saveSettings(updated);
    if (!updated.isMuted) sounds.playClick();
  };

  const handleVolumeChange = (vol: number) => {
    const updated = { ...settings, volume: vol };
    setSettings(updated);
    sounds.setVolume(vol);
    StorageManager.saveSettings(updated);
  };

  const handleToggleReducedMotion = () => {
    const updated = { ...settings, reducedMotion: !settings.reducedMotion };
    setSettings(updated);
    StorageManager.saveSettings(updated);
    sounds.playClick();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleResetData = () => {
    if (window.confirm('Are you sure you want to wipe local progress? This is helpful for testing from scratch.')) {
      sounds.playClick();
      StorageManager.resetAllData();
      onProfileReset();
    }
  };

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-4 sm:p-8 flex flex-col items-center select-none overflow-y-auto">
      <ParticleCanvas color="#06b6d4" count={25} />

      <div className="z-10 text-center max-w-xl mb-6">
        <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center text-cyan-300 mx-auto mb-2 shadow-md">
          <Settings className="w-5 h-5" />
        </div>
        <h2 className="font-cinzel font-bold text-2xl sm:text-3xl text-slate-100 tracking-wide">
          Settings & Demo Utilities
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Configure game feel, audio synthesis, accessibility preferences, and demo modes.
        </p>
      </div>

      <div className="z-10 w-full max-w-lg glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col gap-5">
        {/* Audio Section */}
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-800">
          <span className="text-xs font-cinzel font-bold text-slate-300 uppercase tracking-wider">
            Audio & SFX Synthesizer
          </span>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              {settings.isMuted ? <VolumeX className="w-4 h-4 text-slate-500" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
              Procedural Web Audio SFX
            </span>
            <button
              onClick={handleToggleMute}
              className={`px-3 py-1 rounded-lg text-xs font-mono-code font-bold transition-colors ${
                !settings.isMuted
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {settings.isMuted ? 'MUTED' : 'ACTIVE'}
            </button>
          </div>

          <div className="flex flex-col gap-1 mt-1">
            <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400">
              <span>Master Volume</span>
              <span>{Math.round(settings.volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={settings.volume}
              onChange={e => handleVolumeChange(parseFloat(e.target.value))}
              disabled={settings.isMuted}
              className="w-full accent-cyan-400 bg-slate-900 rounded-lg cursor-pointer"
            />
          </div>
        </div>

        {/* Accessibility & Visuals */}
        <div className="flex flex-col gap-3 pb-4 border-b border-slate-800">
          <span className="text-xs font-cinzel font-bold text-slate-300 uppercase tracking-wider">
            Visuals & Accessibility
          </span>

          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-300 flex items-center gap-2">
              <Eye className="w-4 h-4 text-purple-400" />
              Reduced Motion
            </span>
            <button
              onClick={handleToggleReducedMotion}
              className={`px-3 py-1 rounded-lg text-xs font-mono-code font-bold transition-colors ${
                settings.reducedMotion
                  ? 'bg-purple-950 text-purple-300 border border-purple-500/50'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              {settings.reducedMotion ? 'ENABLED' : 'DISABLED'}
            </button>
          </div>

          {savedSuccess && (
            <span className="text-[11px] text-emerald-400 flex items-center gap-1">
              <Check className="w-3 h-3" /> Preferences saved!
            </span>
          )}
        </div>

        {/* Hackathon Judge Utilities */}
        <div className="flex flex-col gap-3">
          <span className="text-xs font-cinzel font-bold text-amber-400 uppercase tracking-wider">
            Hackathon Judge Utilities
          </span>

          <button
            onClick={() => { sounds.playClick(); onLaunchJudgeDemo(); }}
            className="btn-fantasy-gold w-full py-2.5 rounded-xl font-cinzel font-bold text-slate-950 text-xs tracking-wider flex items-center justify-center gap-2 shadow-md"
          >
            <PlayCircle className="w-4 h-4" />
            Launch 5-Minute Judge Demo Encounter
          </button>

          <button
            onClick={handleResetData}
            className="w-full py-2 rounded-xl glass-panel text-xs font-mono-code text-rose-400 hover:text-rose-300 border border-rose-900/40 hover:bg-rose-950/30 flex items-center justify-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset All Profile Progression Data
          </button>
        </div>
      </div>

      <div className="z-10 mt-auto pb-4">
        <button
          onClick={() => { sounds.playClick(); onBack(); }}
          className="px-5 py-2 rounded-xl glass-panel text-xs font-cinzel font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Return to Citadel
        </button>
      </div>
    </div>
  );
};
