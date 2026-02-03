import { useState, useEffect, useRef } from 'react';
import { useGameStore } from '@store/gameStore';
import { OrderSystem } from '@game/systems/OrderSystem';

const STATION_TIMES: Record<string, number> = {
  ticket: 10,
  fridge: 25,
  prep: 45,
  stove: 90,
  plating: 40,
  serving: 0,
};

export function QuestionModal() {
  const { activeQuestion, setActiveQuestion, updateScore } = useGameStore();
  const [selectedChoice, setSelectedChoice] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    if (activeQuestion && !showFeedback) {
      const time = STATION_TIMES[activeQuestion.stationType] || 30;
      setTimeLeft(time);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            setShowFeedback(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeQuestion, showFeedback]);

  if (!activeQuestion) {
    return null;
  }

  const handleSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setShowFeedback(true);

    const isCorrect = selectedChoice === activeQuestion.correctChoiceId;

    if (isCorrect) {
      // Points based on time remaining
      const basePoints = 100;
      const timeBonus = Math.floor(timeLeft * 2);
      updateScore(basePoints + timeBonus);
    }

    // Advance orders that are waiting for this station
    const { orders } = useGameStore.getState();
    const activeOrder = orders.find(o =>
      (o.status === 'pending' || o.status === 'in_progress') &&
      o.steps.some(s => s.status === 'active' && s.stationType === activeQuestion.stationType)
    );

    if (activeOrder) {
      OrderSystem.getInstance().advanceOrder(activeOrder.id, isCorrect);
    }
  };

  const handleContinue = () => {
    console.log('➡️ Continue clicked, closing modal');
    setActiveQuestion(null);
    setShowFeedback(false);
    setSelectedChoice(null);
  };

  const isCorrect = selectedChoice === activeQuestion.correctChoiceId;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {!showFeedback ? (
            <>
              {/* Question Header */}
              <div className="mb-4 flex justify-between items-start">
                <div>
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold mb-2">
                    {activeQuestion.stationType.toUpperCase()} STATION
                  </span>
                  <h2 className="text-2xl font-bold text-gray-900 mt-2">
                    {activeQuestion.stem}
                  </h2>
                </div>
                <div className={`text-2xl font-mono font-bold ${timeLeft < 10 ? 'text-red-600 animate-pulse' : 'text-gray-700'}`}>
                  {timeLeft}s
                </div>
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
                    onClick={() => {
                      console.log('Choice selected:', choice.id);
                      setSelectedChoice(choice.id);
                    }}
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
                <div className="mb-6 text-center text-green-600 font-bold text-xl">
                  +100 points
                </div>
              )}

              {/* Continue Button */}
              <button
                onClick={handleContinue}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-lg transition-all"
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
