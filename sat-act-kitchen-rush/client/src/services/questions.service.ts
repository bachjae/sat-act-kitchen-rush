import type { Question, QuestionsData } from '@types/question.types';
import type { StationType } from '@types/game.types';
import mockQuestionsData from '@data/mock-questions.json';

const USE_MOCK = import.meta.env.VITE_USE_MOCK_QUESTIONS !== 'false';

const mockData = mockQuestionsData as QuestionsData;

export interface FetchQuestionsParams {
  count: number;
  skills?: string[];
  stationType?: Exclude<StationType, 'serving'>;
  difficulty?: number[];
}

export async function fetchQuestions(params: FetchQuestionsParams): Promise<Question[]> {
  if (USE_MOCK) {
    return filterAndShuffle(mockData.questions as Question[], params);
  }

  // TODO: Fetch from Firestore when ready
  return [];
}

function filterAndShuffle(questions: Question[], params: FetchQuestionsParams): Question[] {
  let filtered = [...questions];

  if (params.stationType) {
    filtered = filtered.filter(q => q.stationType === params.stationType);
  }

  if (params.skills && params.skills.length > 0) {
    filtered = filtered.filter(q => params.skills!.includes(q.skillId));
  }

  if (params.difficulty && params.difficulty.length > 0) {
    filtered = filtered.filter(q => params.difficulty!.includes(q.difficulty));
  }

  // Fisher-Yates shuffle
  for (let i = filtered.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [filtered[i], filtered[j]] = [filtered[j], filtered[i]];
  }

  return filtered.slice(0, params.count);
}
