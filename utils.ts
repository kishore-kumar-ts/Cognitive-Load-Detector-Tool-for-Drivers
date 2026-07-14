import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function calculateCognitiveLoad(stats: {
  blinkRate: number;
  headPose: { x: number; y: number; z: number };
  steeringIrregularity: number;
  reactionTime: number;
}): 'Low' | 'Medium' | 'High' {
  let score = 0;

  // Blink rate: Low blink rate can mean high focus or fatigue
  // Normal is 15-20 per min. Very low (<5) or very high (>30) adds to load/stress
  if (stats.blinkRate < 5 || stats.blinkRate > 35) score += 2;
  else if (stats.blinkRate < 10 || stats.blinkRate > 25) score += 1;

  // Head pose: Deviation from center
  const headDev = Math.abs(stats.headPose.x) + Math.abs(stats.headPose.y);
  if (headDev > 0.5) score += 3; // Distracted
  else if (headDev > 0.2) score += 1;

  // Steering: High irregularity = stress/fatigue
  if (stats.steeringIrregularity > 0.7) score += 3;
  else if (stats.steeringIrregularity > 0.4) score += 1;

  // Reaction time: Higher = fatigue/load
  if (stats.reactionTime > 1000) score += 3;
  else if (stats.reactionTime > 600) score += 1;

  if (score >= 6) return 'High';
  if (score >= 3) return 'Medium';
  return 'Low';
}

export function speak(text: string) {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }
}
