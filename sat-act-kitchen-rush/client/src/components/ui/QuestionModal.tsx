import { useState } from 'react';
import { useGameStore } from '@store/gameStore';

export function QuestionModal() {
  const activeQuestion = useGameStore((s) => s.activeQuestion);
  const setActiveQuestion = useGameStore((s) => s.setActiveQuestion);
  const updateScore = useGameStore((s) => s.updateScore);

  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!activeQuestion) return null;

  const isCorrect = selectedChoice === activeQuestion.correctChoiceId;

  const handleSubmit = () => {
    if (!selectedChoice) return;
    setShowFeedback(true);
    if (selectedChoice === activeQuestion.correctChoiceId) {
      updateScore(100);
    }
  };

  const handleContinue = () => {
    setActiveQuestion(null);
    setShowFeedback(false);
    setSelectedChoice(null);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
      data-testid="question-modal-overlay"
    >
      <div
        className="bg-white rounded-xl shadow-2xl border-4 border-kitchen-navy max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
        data-testid="question-modal"
      >
        <div className="p-6">
          {!showFeedback ? (
            <>
              {/* Header */}
              <div className="mb-4">
                <span
                  className="inline-block text-xs font-bold px-3 py-1 rounded-full bg-kitchen-teal text-kitchen-navy uppercase tracking-wide"
                  data-testid="question-station-type"
                >
                  {activeQuestion.stationType} Station
                </span>
                <span className="ml-2 text-xs text-gray-500">
                  Difficulty: {'★'.repeat(activeQuestion.difficulty)}{'☆'.repeat(5 - activeQuestion.difficulty)}
                </span>
              </div>

              {/* Passage (if present) */}
              {activeQuestion.passage && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border text-sm text-gray-700 italic">
                  {activeQuestion.passage}
                </div>
              )}

              {/* Question stem */}
              <h2
                className="text-lg font-bold text-kitchen-navy mb-5"
                data-testid="question-stem"
              >
                {activeQuestion.stem}
              </h2>

              {/* Choices */}
              <div className="space-y-3" data-testid="question-choices">
                {activeQuestion.choices.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedChoice(choice.id)}
                    data-testid={`choice-${choice.id}`}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all duration-150
                      ${selectedChoice === choice.id
                        ? 'border-kitchen-blue bg-kitchen-teal/30 shadow-md'
                        : 'border-gray-200 hover:border-kitchen-blue/50 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="font-bold text-kitchen-navy mr-2">{choice.id}.</span>
                    <span className="text-gray-800">{choice.text}</span>
                  </button>
                ))}
              </div>

              {/* Submit */}
              <button
                onClick={handleSubmit}
                disabled={!selectedChoice}
                data-testid="submit-answer"
                className={`
                  w-full mt-6 py-3 px-6 rounded-lg font-semibold text-white transition-all
                  ${selectedChoice
                    ? 'bg-kitchen-blue hover:bg-kitchen-navy shadow-lg cursor-pointer'
                    : 'bg-gray-300 cursor-not-allowed'
                  }
                `}
              >
                Submit Answer
              </button>
            </>
          ) : (
            <>
              {/* Feedback */}
              <div
                className={`p-6 rounded-lg ${isCorrect ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'}`}
                data-testid="question-feedback"
              >
                <h3
                  className={`text-2xl font-bold mb-2 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}
                  data-testid="feedback-result"
                >
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </h3>
                {!isCorrect && (
                  <p className="text-sm text-red-600 mb-3">
                    The correct answer was <strong>{activeQuestion.correctChoiceId}</strong>.
                  </p>
                )}
                <p className="text-gray-700" data-testid="feedback-explanation">
                  {activeQuestion.explanation}
                </p>
              </div>

              {isCorrect && (
                <div className="mt-4 text-center text-kitchen-green font-bold text-lg">
                  +100 points
                </div>
              )}

              {/* Continue */}
              <button
                onClick={handleContinue}
                data-testid="continue-button"
                className="btn-primary w-full mt-6"
              >
                Continue
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
