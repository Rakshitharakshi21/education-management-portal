import { IAIStructuredResult } from '../../models/AIInsight.model';

export function parseAIResponse(raw: string): IAIStructuredResult | null {
  try {
    // Try to parse as JSON directly
    let parsed: Partial<IAIStructuredResult>;
    
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Try to extract JSON block from markdown
      const jsonMatch = raw.match(/```json\n?([\s\S]*?)\n?```/) || raw.match(/\{[\s\S]*\}/);
      if (!jsonMatch) return null;
      parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    }

    // Validate and normalize the structure
    const result: IAIStructuredResult = {
      summary: parsed.summary || 'Academic analysis complete.',
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weakSubjects: Array.isArray(parsed.weakSubjects) ? parsed.weakSubjects : [],
      riskLevel: validateRiskLevel(parsed.riskLevel),
      riskFactors: Array.isArray(parsed.riskFactors) ? parsed.riskFactors : [],
      recommendations: Array.isArray(parsed.recommendations)
        ? parsed.recommendations.map((r) => ({
            title: r.title || 'Recommendation',
            description: r.description || '',
            priority: validatePriority(r.priority),
          }))
        : [],
      trend: validateTrend(parsed.trend),
      studyPlan: Array.isArray(parsed.studyPlan) ? parsed.studyPlan : undefined,
      keyMetrics: parsed.keyMetrics || undefined,
    };

    return result;
  } catch {
    return null;
  }
}

function validateRiskLevel(level: unknown): IAIStructuredResult['riskLevel'] {
  const valid = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  return valid.includes(String(level).toUpperCase())
    ? (String(level).toUpperCase() as IAIStructuredResult['riskLevel'])
    : 'LOW';
}

function validatePriority(p: unknown): 'high' | 'medium' | 'low' {
  const valid = ['high', 'medium', 'low'];
  return valid.includes(String(p).toLowerCase())
    ? (String(p).toLowerCase() as 'high' | 'medium' | 'low')
    : 'medium';
}

function validateTrend(trend: unknown): IAIStructuredResult['trend'] {
  const valid = ['IMPROVING', 'DECLINING', 'STABLE'];
  return valid.includes(String(trend).toUpperCase())
    ? (String(trend).toUpperCase() as IAIStructuredResult['trend'])
    : 'STABLE';
}
