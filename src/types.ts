export type VisualizerType = 'tesseract' | 'mandala' | 'hyperspace' | 'quantum_flow' | 'torus';

export type SubscriptionTier = 'free' | 'pro' | 'lifetime';

export type DesireCategory = 
  | 'money' 
  | 'love' 
  | 'confidence' 
  | 'luck' 
  | 'energy' 
  | 'peace' 
  | 'new_life' 
  | 'everything';

export type AbundanceArchetype = 
  | 'THE_BLOCKED_CREATOR' 
  | 'THE_SEEKER' 
  | 'THE_RECEIVER' 
  | 'THE_BUILDER' 
  | 'THE_EXPANDER' 
  | 'THE_MAGNET';

export type StateArchetype = 
  | 'SURVIVAL_MODE' 
  | 'OVERTHINKER' 
  | 'SCATTERED_CREATOR' 
  | 'UNDERVALUED' 
  | 'LOW_ACTION' 
  | 'HESITANT_BUILDER';

export interface DesireOption {
  id: DesireCategory;
  title: string;
  tagline: string;
  hookSubtitle: string;
  iconName: string;
  accentColor: string;
  targetHz: number;
  starterProtocolId: string;
  quickAffirmation: string;
}

export interface ArchetypeProfile {
  id: AbundanceArchetype;
  nameRu: string;
  nameEn: string;
  eraTitle: string;
  tagline: string;
  psychologicalMirror: string;
  rootBlock: string;
  metrics: {
    desire: number;
    action: number;
    selfBelief: number;
    receiving: number;
  };
  firstShiftAdvice: string;
  firstStepAction: string;
  recommendedHz: number;
  recommendedProtocolId: string;
  sevenDayJourneyTheme: string;
  shareableQuote: string;
}

export interface Badge {
  id: string;
  title: string;
  description: string;
  iconName: string;
  unlocked: boolean;
  unlockedAt?: string;
  requiredMetric?: string;
}

export interface AudioMixerState {
  masterVolume: number;
  solfeggioVolume: number;
  binauralVolume: number;
  ambientVolume: number;
  voiceVolume: number;
  solfeggioFreq: number;
  binauralBeat: number;
  selectedAmbient: 'silence' | 'quantum_drone' | 'deep_space' | 'rain_flow' | 'stellar_wind';
  isMuted: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface BreathingPattern {
  id: string;
  name: string;
  description: string;
  inhale: number;
  hold1: number;
  exhale: number;
  hold2: number;
  ratioLabel: string;
  category: string;
}

export interface BinauralPreset {
  id: string;
  name: string;
  targetWave: 'Delta' | 'Theta' | 'Alpha' | 'Beta' | 'Gamma' | 'Solfeggio';
  baseFreq: number;
  beatFreq: number;
  solfeggioFreq?: number;
  droneChord: number[];
  description: string;
  benefit: string;
}

export interface Protocol {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  category: 'money' | 'love' | 'confidence' | 'luck' | 'energy' | 'peace' | 'new_life' | 'deepwork' | 'reset' | 'courage' | 'abundance' | 'creation' | 'night' | 'decision' | 'identity';
  frequencyTag: string;
  baseHz: number;
  targetHz: number;
  durationMin: number;
  visualizer: VisualizerType;
  breathingId: string;
  soundPresetId: string;
  description: string;
  intent: string;
  affirmation: string;
  guidanceSteps: string[];
  accentColor: 'cyan' | 'magenta' | 'purple' | 'gold' | 'emerald';
  isPro?: boolean;
  realWorldAction: {
    title: string;
    description: string;
    suggestedMetric?: string;
  };
  larpPrompt?: string;
  // Блок D: конкретный механизм «почему работает» + маркер «для кого/для чего».
  mechanism: string;
  forState: string;
}

export interface SessionRecord {
  id: string;
  protocolId: string;
  protocolTitle: string;
  durationSec: number;
  timestamp: number;
  dateStr: string;
  startFreqHz: number;
  endFreqHz: number;
  freqDelta: number;
  expGained: number;
  visualizerUsed: VisualizerType;
  intent: string;
  realWorldActionCompleted?: boolean;
  notes?: string;
}

export interface RealityLogEntry {
  id: string;
  timestamp: number;
  dateStr: string;
  category: 'money' | 'love' | 'confidence' | 'luck' | 'energy' | 'peace' | 'focus' | 'courage' | 'creation' | 'boundaries' | 'opportunity';
  title: string;
  details: string;
  metric?: string;
  uncomfortableLevel: 1 | 2 | 3 | 4 | 5;
  shiftRealized: string;
}

export interface UserProfile {
  currentLevel: number;
  levelTitle: string;
  exp: number;
  nextLevelExp: number;
  streakDays: number;
  lastSessionDate: string;
  currentFrequencyHz: number;
  totalMinutes: number;
  totalSessions: number;
  unlockedBadges: string[];
  subscriptionTier: SubscriptionTier;
  invitedCount: number;
  referralCode: string;
  completedQuestDays: number[];
  realityLog: RealityLogEntry[];
  selectedDesire?: DesireCategory;
  abundanceArchetype?: AbundanceArchetype;
  activeStateArchetype?: string;
  stateScanResult?: {
    archetype: StateArchetype;
    score: number;
    recommendedHz: number;
    diagnosis: string;
    prescription: string;
    completedAt: string;
  };
  activeSevenDayJourney?: {
    journeyTheme: string;
    currentDay: number;
    completedDays: number[];
    startedAt: string;
  };
}

export interface SevenDayStep {
  day: number;
  theme: string;
  title: string;
  subtitle: string;
  protocolId: string;
  actionTitle: string;
  actionDescription: string;
  isUnlocked: boolean;
}

export interface AbundancePillar {
  id: 'money' | 'opportunity' | 'creation' | 'courage' | 'receiving' | 'scale' | 'identity';
  title: string;
  subtitle: string;
  iconName: string;
  mindsetShift: {
    scarcity: string;
    abundance: string;
  };
  practiceProtocolId: string;
  realWorldAction: string;
  reflectionPrompt: string;
  keyMantra: string;
}

export interface RealityEngineNode {
  id: 'thought' | 'state' | 'decision' | 'action' | 'result' | 'identity';
  order: number;
  title: string;
  description: string;
  practicalLever: string;
  auditQuestion: string;
}

export interface LarpMission {
  id: string;
  title: string;
  roleAvatar: string;
  badge: string;
  context: string;
  bodyAnchor: string;
  rulesToday: string[];
  innerMonologue: string;
  protocolId: string;
}

export interface CodexArticle {
  id: string;
  number?: string;
  title: string;
  category: 'mindset' | 'frequency' | 'action' | 'identity' | 'larp' | 'wealth' | 'focus' | 'laws';
  summary?: string;
  content: string[];
  practicalRule?: string;
  audioSummaryText: string;
  isProOnly?: boolean;
  categoryTitle?: string;
  readTimeMin?: number;
  subtitle?: string;
  frequencyTag?: string;
  keyMantra?: string;
  practicalExercise?: string | {
    title: string;
    steps: string[];
    recommendedProtocolId?: string;
  };
}

export interface PricingExperimentConfig {
  currency: 'EUR' | 'USD' | 'RUB';
  symbol: string;
  monthly: number;
  yearly: number;
  lifetime: number;
  monthlyOld?: number;
  yearlyOld?: number;
  lifetimeOld?: number;
}
