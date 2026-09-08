import React, { useEffect } from 'react';
import { EndingVariant } from '../types/learningDna';
import { ParticleCanvas } from '../components/ParticleCanvas';
import { Crown, Sparkles, Compass, CheckCircle2, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';
import { sounds } from '../audio/SoundEffects';

interface TrueEndingScreenProps {
  endingVariant: EndingVariant;
  studentResponse: string;
  onReturnToSpire: () => void;
}

const ENDING_DETAILS: Record<
  EndingVariant,
  { title: string; subtitle: string; verdict: string; color: string; emblem: string }
> = {
  'THE SCHOLAR': {
    title: 'THE SCHOLAR',
    subtitle: 'Axiomatic Sovereign of Understanding',
    verdict: 'You do not accept truth until its axioms are proven and its foundations are firm.',
    color: '#38bdf8',
    emblem: '∑',
  },
  'THE ADAPTER': {
    title: 'THE ADAPTER',
    subtitle: 'Warden of Resilience & Iteration',
    verdict: 'You recognized that failure is merely the first iteration of authentic mastery.',
    color: '#34d399',
    emblem: '⟳',
  },
  'THE EXPLORER': {
    title: 'THE EXPLORER',
    subtitle: 'Pioneer of the Uncharted Frontiers',
    verdict: 'For you, every solved equation was only an invitation to search deeper.',
    color: '#fbbf24',
    emblem: '✧',
  },
  'THE STRATEGIST': {
    title: 'THE STRATEGIST',
    subtitle: 'Master of Invariant Architecture',
    verdict: 'You master systems by discerning the hidden symmetry of their constraints.',
    color: '#c084fc',
    emblem: '⟨⟩',
  },
  'THE UNFINISHED MIND': {
    title: 'THE UNFINISHED MIND',
    subtitle: 'The Infinite Seeker',
    verdict: 'You understand the greatest truth of all: the Spire has no summit, because learning has no ceiling.',
    color: '#f472b6',
    emblem: '∞',
  },
};

export const TrueEndingScreen: React.FC<TrueEndingScreenProps> = ({
  endingVariant,
  studentResponse,
  onReturnToSpire,
}) => {
  const details = ENDING_DETAILS[endingVariant] || ENDING_DETAILS['THE UNFINISHED MIND'];

  useEffect(() => {
    sounds.playVictoryFanfare();
    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.4 },
      colors: ['#38bdf8', '#fbbf24', '#c084fc', '#34d399', '#f472b6'],
    });
  }, []);

  return (
    <div className="relative min-h-[calc(100dvh-54px)] p-6 sm:p-12 flex flex-col items-center justify-between select-none bg-gradient-to-b from-[#05030a] via-[#020106] to-black text-slate-100 overflow-y-auto">
      <ParticleCanvas color={details.color} count={60} speed={0.8} />

      {/* Culmination Header */}
      <div className="z-10 max-w-2xl text-center mt-4 animate-fadeIn flex flex-col items-center">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center font-cinzel text-3xl font-black mb-4 border-2 shadow-2xl animate-pulse"
          style={{
            backgroundColor: `${details.color}15`,
            borderColor: details.color,
            color: details.color,
            boxShadow: `0 0 45px ${details.color}50`,
          }}
        >
          {details.emblem}
        </div>

        <span className="font-mono-code text-xs tracking-widest uppercase font-bold" style={{ color: details.color }}>
          ✦ THE SPIRE'S TRUE ENDING ✦
        </span>

        <h1 className="font-cinzel-dec font-black text-3xl sm:text-5xl text-white tracking-wider mt-2">
          {details.title}
        </h1>

        <p className="font-cinzel text-sm sm:text-base text-slate-300 font-semibold mt-1">
          {details.subtitle}
        </p>
      </div>

      {/* Narrative Journey & Student Reflection */}
      <div className="z-10 w-full max-w-2xl my-6 glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl flex flex-col gap-6">
        {/* Philosophical Verdict */}
        <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-center">
          <p className="font-cinzel text-sm sm:text-base text-slate-100 italic leading-relaxed">
            "{details.verdict}"
          </p>
        </div>

        {/* Student's Last Inscription */}
        <div className="flex flex-col gap-1 text-left bg-black/40 p-4 rounded-xl border border-slate-900">
          <span className="font-mono-code text-[10px] text-slate-500 uppercase tracking-widest">
            YOUR FINAL AXIOMATIC INSCRIPTION
          </span>
          <p className="text-xs sm:text-sm text-slate-300 italic font-cinzel">
            "{studentResponse}"
          </p>
        </div>

        {/* Thematic Progression Pipeline */}
        <div className="flex flex-col gap-2 pt-2 border-t border-slate-800/80">
          <span className="font-mono-code text-[10px] text-slate-400 uppercase tracking-widest text-center">
            THE ARCHITECTURE OF YOUR ASCENT
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-[11px] font-mono-code">
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              WHAT YOU KNOW <span className="text-emerald-400 block font-bold">Curriculum</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              HOW YOU SOLVE <span className="text-cyan-400 block font-bold">Counter-Strategy</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              CAN YOU ADAPT? <span className="text-purple-400 block font-bold">Mirror Bosses</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              CAN YOU TRANSFER? <span className="text-amber-400 block font-bold">Compression</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              CAN YOU UNIFY? <span className="text-rose-400 block font-bold">The Convergence</span>
            </div>
            <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-900 text-slate-400">
              WHO ARE YOU? <span className="text-indigo-400 block font-bold">{details.title}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Return Button */}
      <div className="z-10 pb-4 w-full max-w-xs">
        <button
          onClick={() => {
            sounds.playClick();
            onReturnToSpire();
          }}
          className="btn-fantasy-gold w-full py-3.5 px-6 rounded-xl font-cinzel font-bold text-slate-950 text-xs sm:text-sm tracking-wider flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(245,158,11,0.5)]"
        >
          <Compass className="w-4 h-4" /> Return To The Spire
        </button>
      </div>
    </div>
  );
};
