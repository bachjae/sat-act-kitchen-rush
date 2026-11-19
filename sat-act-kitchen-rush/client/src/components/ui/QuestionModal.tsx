import { useState } from 'react';
import { useGameStore } from '@store/gameStore';

interface QuestionModalProps {
  onAnswered?: (correct: boolean) => void;
}

export function QuestionModal({ onAnswered }: QuestionModalProps) {
  const { activeQuestion, setActiveQuestion, updateScore, activeStation } = useGameStore();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);

  if (!activeQuestion) {
    return null;
  }

  const isCorrect = selectedChoice === activeQuestion.correctChoiceId;

  const handleSubmit = () => {
    setShowFeedback(true);
    if (selectedChoice === activeQuestion.correctChoiceId) {
      updateScore(100);
    }
  };

  const handleContinue = () => {
    // Close the modal first
    setActiveQuestion(null);
    setShowFeedback(false);
    setSelectedChoice(null);

    // Notify parent that question was answered
    // If correct, this triggers the mechanic
    if (onAnswered) {
      onAnswered(isCorrect);
    }
  };

  // Don't allow closing without answering (except X button closes without triggering mechanic)
  const handleClose = () => {
    setActiveQuestion(null);
    setShowFeedback(false);
    setSelectedChoice(null);
    // Don't trigger mechanic if closed without answering
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto relative">
        {/* Close button - only if not showing feedback */}
        {!showFeedback && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-red-500 hover:text-white transition-colors z-10"
          >
            ✕
          </button>
        )}

        <div className="p-6">
          {!showFeedback ? (
            <>
              {/* Question Header */}
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2">
                  {activeQuestion.stationType.toUpperCase()} STATION
                </span>
                <p className="text-xs text-gray-500 mb-2">
                  Answer correctly to access the station
                </p>
                <h2 className="text-2xl font-bold text-gray-900 mt-2">
                  {activeQuestion.stem}
                </h2>
                {activeQuestion.passage && (
                  <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {activeQuestion.passage}
                    </p>
                  </div>
                )}
              </div>

              {/* Choices */}
              <div className="space-y-3 mb-6">
                {activeQuestion.choices.map(choice => (
                  <button
                    key={choice.id}
                    onClick={() => setSelectedChoice(choice.id)}
                    className={`
                      w-full text-left p-4 rounded-lg border-2 transition-all
                      ${selectedChoice === choice.id
                        ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                        : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="font-bold text-lg mr-2">{choice.id}.</span>
                    <span className="text-gray-800">{choice.text}</span>
                  </button>
                ))}
              </div>

              {/* Submit Button */}
              <button
                onClick={handleSubmit}
                disabled={!selectedChoice}
                className={`
                  w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all
                  ${selectedChoice
                    ? 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  }
                `}
              >
                Submit Answer
              </button>
            </>
          ) : (
            <>
              {/* Feedback */}
              <div className={`p-6 rounded-lg mb-6 ${isCorrect ? 'bg-green-100 border-2 border-green-400' : 'bg-red-100 border-2 border-red-400'}`}>
                <h3 className={`text-3xl font-bold mb-3 ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                  {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
                </h3>
                <p className="text-lg text-gray-800 leading-relaxed">
                  {activeQuestion.explanation}
                </p>
                {!isCorrect && (
                  <div className="mt-3 p-3 bg-white bg-opacity-50 rounded">
                    <p className="text-sm font-semibold">
                      Correct answer: <span className="text-green-700">{activeQuestion.correctChoiceId}</span>
                    </p>
                  </div>
                )}
              </div>

              {isCorrect && (
                <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg text-center">
                  <p className="text-blue-700 font-bold text-lg">+100 points</p>
                  <p className="text-blue-600 text-sm mt-1">
                    You can now use the {activeStation?.toUpperCase()} station!
                  </p>
                </div>
              )}

              {!isCorrect && (
                <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg text-center">
                  <p className="text-amber-700 text-sm">
                    You can still try the station, but study the explanation!
                  </p>
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className={`w-full py-4 px-6 rounded-lg font-semibold text-lg transition-all ${
                  isCorrect
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {isCorrect ? 'Continue to Station' : 'Continue Anyway'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
