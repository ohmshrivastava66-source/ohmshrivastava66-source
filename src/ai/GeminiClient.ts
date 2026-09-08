import { DiagnosisResult } from '../types/telemetry';

export class GeminiClient {
  private static apiKey: string | null = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_GEMINI_API_KEY || null;

  public static isAvailable(): boolean {
    return !!this.apiKey;
  }

  public static async enhanceDiagnosis(
    fallbackDiagnosis: DiagnosisResult,
    playerSequence: string[],
    expectedSequence: string[],
    problemContext: string
  ): Promise<DiagnosisResult> {
    if (!this.apiKey) {
      return fallbackDiagnosis;
    }

    try {
      const prompt = `You are the AI Cognitive Diagnostic Engine for Algo-Spire RPG.
The player made a mistake during an educational encounter.
Context: "${problemContext}"
Player action sequence: [${playerSequence.join(' -> ')}]
Expected sequence: [${expectedSequence.join(' -> ')}]
Current heuristic diagnosis: ${fallbackDiagnosis.diagnosisType} - ${fallbackDiagnosis.explanation}

Provide a refined, high-precision dark-fantasy RPG diagnostic JSON response with:
{
  "explanation": "concise 2-sentence explanation of why their sequence revealed a cognitive gap",
  "recommendedRepair": "short topic title to practice",
  "confidence": 0.95
}
Output ONLY valid JSON.`;

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' },
          }),
        }
      );

      if (!response.ok) {
        return fallbackDiagnosis;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!text) return fallbackDiagnosis;

      const parsed = JSON.parse(text);
      return {
        ...fallbackDiagnosis,
        explanation: parsed.explanation || fallbackDiagnosis.explanation,
        recommendedRepair: parsed.recommendedRepair || fallbackDiagnosis.recommendedRepair,
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : fallbackDiagnosis.confidence,
      };
    } catch {
      // API error or network failure: gracefully fallback to deterministic engine
      return fallbackDiagnosis;
    }
  }
}
