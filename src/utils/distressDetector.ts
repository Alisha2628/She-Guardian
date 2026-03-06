export interface ThreatAnalysis {
  isThreat: boolean;
  threatLevel: 'low' | 'medium' | 'high' | 'critical';
  detectedKeywords: string[];
  confidence: number;
}

const DISTRESS_KEYWORDS = {
  critical: ['help me', 'rape', 'kidnap', 'attack', 'someone help', 'being followed'],
  high: ['help', 'stop', 'no', 'leave me', 'danger', 'scared', 'threatened', 'emergency'],
  medium: ['uncomfortable', 'unsafe', 'worried', 'following', 'suspicious', 'alone'],
  low: ['concerned', 'nervous', 'uneasy']
};

const NEGATION_WORDS = ['not', 'no', "don't", "isn't", "wasn't", 'never', 'nothing'];

export function analyzeText(text: string): ThreatAnalysis {
  const lowerText = text.toLowerCase().trim();
  const words = lowerText.split(/\s+/);

  const detectedKeywords: string[] = [];
  let maxThreatLevel: 'low' | 'medium' | 'high' | 'critical' = 'low';
  let threatScore = 0;

  const hasNegation = NEGATION_WORDS.some(word => lowerText.includes(word));

  for (const [level, keywords] of Object.entries(DISTRESS_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        detectedKeywords.push(keyword);

        switch (level) {
          case 'critical':
            threatScore += 100;
            maxThreatLevel = 'critical';
            break;
          case 'high':
            threatScore += 50;
            if (maxThreatLevel !== 'critical') maxThreatLevel = 'high';
            break;
          case 'medium':
            threatScore += 25;
            if (maxThreatLevel === 'low') maxThreatLevel = 'medium';
            break;
          case 'low':
            threatScore += 10;
            break;
        }
      }
    }
  }

  if (hasNegation && maxThreatLevel !== 'critical') {
    threatScore = Math.floor(threatScore * 0.5);
  }

  const isThreat = threatScore >= 25;
  const confidence = Math.min(threatScore / 100, 1);

  return {
    isThreat,
    threatLevel: maxThreatLevel,
    detectedKeywords,
    confidence
  };
}

export function shouldTriggerAlert(analysis: ThreatAnalysis): boolean {
  return analysis.isThreat && analysis.confidence > 0.3;
}
