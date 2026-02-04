import mockQuestions from '@data/mock-questions.json';
import type { Question } from '@app-types/question.types';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_QUESTIONS !== 'false';

interface FetchParams {
  count: number;
  skills?: string[];
  stationType?: string;
}

export async function fetchQuestions(params: FetchParams): Promise<Question[]> {
  console.log('📦 Fetching questions:', params);

  if (USE_MOCK) {
    console.log('✅ Using mock questions');
    return filterAndShuffle(mockQuestions.questions as Question[], params);
  }

  console.warn('⚠️ Mock mode disabled, no questions available');
  return [];
}

function filterAndShuffle(questions: Question[], params: FetchParams): Question[] {
  let filtered = [...questions];

  if (params.stationType) {
    filtered = filtered.filter(q => q.stationType === params.stationType);
    console.log(`🔍 Filtered to ${params.stationType}: ${filtered.length} questions`);
  }

  if (params.skills && params.skills.length > 0) {
    const skills = params.skills;
    filtered = filtered.filter(q => skills.includes(q.skillId));
  }

  // Shuffle
  const shuffled = filtered.sort(() => Math.random() - 0.5);
  const result = shuffled.slice(0, params.count);

  console.log(`✨ Returning ${result.length} questions`);
  return result as Question[];
}
