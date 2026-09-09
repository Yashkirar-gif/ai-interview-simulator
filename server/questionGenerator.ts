import { GoogleGenAI, Type } from '@google/genai';
import { Question, Role, Difficulty, InterviewType } from '../src/types';

interface GenerateQuestionsParams {
  role: Role;
  difficulty: Difficulty;
  interviewType?: InterviewType;
  count?: number;
  excludedQuestions?: string[];
}

export async function generateQuestionsWithGemini(
  params: GenerateQuestionsParams
): Promise<Question[]> {
  const {
    role = 'frontend',
    difficulty = 'intermediate',
    interviewType = 'technical',
    count = 3,
    excludedQuestions = []
  } = params;

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === '' || apiKey === 'MY_GEMINI_API_KEY') {
    throw new Error('GEMINI_API_KEY not configured for live question generation');
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  const categoryInstruction = interviewType === 'behavioral'
    ? 'All questions must be behavioral questions assessing communication, conflict resolution, project management, and collaboration using the STAR method.'
    : interviewType === 'hr'
    ? 'All questions must be HR and cultural alignment questions assessing career goals, workplace preferences, work ethic, teamwork, and strengths/weaknesses.'
    : interviewType === 'coding'
    ? 'All questions must be practical coding/algorithm architecture questions testing data structures, time complexity, and practical implementation details.'
    : 'The questions should be primarily deep technical questions tailored to the role, with at most 1 behavioral or scenario-based question.';

  const excludedPrompt = excludedQuestions.length > 0
    ? `\nCRITICAL ANTI-REPETITION CONSTRAINT:
The candidate has already answered or seen the following questions in previous mock interviews.
You MUST NOT ask any question that covers the same primary topic or phrasing as any of these:
${excludedQuestions.slice(-20).map((q, i) => `${i + 1}. "${q}"`).join('\n')}
Ensure every question generated is fresh, novel, and addresses a different aspect or advanced scenario.`
    : '';

  const prompt = `You are a Principal Tech Lead and Senior Technical Hiring Manager conducting a realistic technical interview.
Generate ${count} completely original, high-impact mock interview questions for:
- Specialization Role: ${role.toUpperCase()}
- Experience / Difficulty Level: ${difficulty.toUpperCase()}
- Interview Format: ${interviewType.toUpperCase()}

Guidelines:
${categoryInstruction}
- Questions should feel authentic, conversational, and direct, exactly as asked in top tech companies.
- For technical questions, probe real engineering challenges, browser/engine internals, state management, latency, memory leaks, concurrency, rendering performance, and architectural trade-offs.
- Provide 5 to 7 sharp, realistic expectedKeywords for evaluation.
- Provide a concise tip on what interviewers look for.
- Provide a clear, comprehensive idealResponse summarizing the gold-standard answer.
${excludedPrompt}

Return the response strictly as a JSON object matching the requested schema.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.8-flash',
    contents: prompt,
    config: {
      responseMimeType: 'application/json',
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          questions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                text: { type: Type.STRING, description: 'The exact interview question prompt' },
                category: { 
                  type: Type.STRING, 
                  description: 'Category: technical, behavioral, hr, or coding' 
                },
                expectedKeywords: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: '5-7 critical keywords or concepts expected in a strong answer'
                },
                tips: { type: Type.STRING, description: 'Advice for what the interviewer evaluates' },
                idealResponse: { type: Type.STRING, description: 'Model comprehensive answer' }
              },
              required: ['text', 'category', 'expectedKeywords', 'tips', 'idealResponse']
            }
          }
        },
        required: ['questions']
      }
    }
  });

  const parsed = JSON.parse(response.text || '{}');
  if (!parsed.questions || !Array.isArray(parsed.questions)) {
    throw new Error('Invalid JSON structure returned from Gemini model');
  }

  const generatedQuestions: Question[] = parsed.questions.map((q: any, idx: number) => ({
    id: `ai-${role.slice(0, 2)}-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}-${idx}`,
    text: q.text,
    category: (q.category === 'behavioral' || q.category === 'hr' || q.category === 'coding') ? q.category : 'technical',
    expectedKeywords: Array.isArray(q.expectedKeywords) ? q.expectedKeywords : [],
    tips: q.tips || 'Provide a structured, specific answer with concrete examples.',
    idealResponse: q.idealResponse || '',
    isAiGenerated: true
  }));

  return generatedQuestions;
}
