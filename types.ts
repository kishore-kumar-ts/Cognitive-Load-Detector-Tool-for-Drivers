export type CognitiveLoad = 'Low' | 'Medium' | 'High';

export interface DriverStats {
  blinkRate: number;
  headPose: { x: number; y: number; z: number };
  steeringIrregularity: number;
  reactionTime: number;
  stressScore: number;
}

export interface SessionData {
  timestamp: number;
  load: CognitiveLoad;
  stats: DriverStats;
}

export interface WeatherData {
  condition: string;
  temp: number;
  visibility: string;
  riskFactor: number;
}
