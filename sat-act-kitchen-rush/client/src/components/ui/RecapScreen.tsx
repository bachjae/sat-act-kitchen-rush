import { useGameStore } from '@store/gameStore';
import type { StationType } from '@app-types/game.types';
import { useNavigationStore } from '@store/navigationStore';

export function RecapScreen() {
  const { stats, score, resetGame } = useGameStore();
  const { navigateTo } = useNavigationStore();

  const accuracy = stats.totalQuestionsAttempted > 0
    ? Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAttempted) * 100)
    : 0;

  const getGrade = (acc: number) => {
    if (acc >= 90) return { label: 'A', color: 'text-green-600' };
    if (acc >= 80) return { label: 'B', color: 'text-blue-600' };
    if (acc >= 70) return { label: 'C', color: 'text-yellow-600' };
    if (acc >= 60) return { label: 'D', color: 'text-orange-600' };
    return { label: 'F', color: 'text-red-600' };
  };

  const grade = getGrade(accuracy);

  const stations: StationType[] = ['ticket', 'fridge', 'prep', 'stove', 'plating'];

  return (
    <div className="fixed inset-0 bg-navy bg-opacity-90 flex items-center justify-center z-[100] p-4 overflow-y-auto">
      <div className="bg-cream w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
        {/* Header */}
        <div className="bg-navy p-6 text-white text-center relative">
          <h1 className="text-4xl font-bold tracking-tight">SESSION RECAP</h1>
          <div className={`absolute top-1/2 right-8 -translate-y-1/2 text-6xl font-black ${grade.color} bg-white rounded-full w-20 h-20 flex items-center justify-center border-4 border-current`}>
            {grade.label}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
            <StatCard label="Total Score" value={score.toLocaleString()} color="bg-blue-100 text-blue-800" />
            <StatCard label="Orders Done" value={stats.totalOrdersCompleted} color="bg-green-100 text-green-800" />
            <StatCard label="Accuracy" value={`${accuracy}%`} color="bg-yellow-100 text-yellow-800" />
            <StatCard label="Coins Earned" value={`+${stats.totalCoinsEarned}`} color="bg-orange-100 text-orange-800" />
          </div>

          {/* Station Breakdown */}
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-navy mb-4 border-b-2 border-navy pb-2">Station Performance</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {stations.map(station => {
                const sStat = stats.stationBreakdown[station];
                const sAcc = sStat.attempted > 0 ? Math.round((sStat.correct / sStat.attempted) * 100) : 0;
                const avgTime = sStat.attempted > 0 ? (sStat.totalTime / sStat.attempted).toFixed(1) : '0';

                return (
                  <div key={station} className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-lg capitalize text-gray-800">{station}</h3>
                      <p className="text-sm text-gray-500">{sStat.attempted} attempted • {avgTime}s avg</p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-navy">{sAcc}%</div>
                      <div className="w-24 h-2 bg-gray-200 rounded-full mt-1">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${sAcc}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Question Review */}
          <section>
            <h2 className="text-2xl font-bold text-navy mb-4 border-b-2 border-navy pb-2">Question Review</h2>
            <div className="space-y-3">
              {stats.questionReview.length === 0 ? (
                <p className="text-gray-500 italic">No questions attempted this session.</p>
              ) : (
                stats.questionReview.map((q, i) => (
                  <div key={i} className={`p-4 rounded-lg border-l-4 ${q.isCorrect ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'}`}>
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">{q.stationType} • {q.skillId}</span>
                      <span className="text-xs font-mono text-gray-500">{q.timeTaken.toFixed(1)}s</span>
                    </div>
                    <p className="text-gray-800 font-medium mb-2 line-clamp-2">{q.stem}</p>
                    <div className="text-sm">
                      <span className={q.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        Your answer: <strong>{q.userAnswer}</strong>
                      </span>
                      {!q.isCorrect && (
                        <span className="text-green-700 ml-4">
                          Correct: <strong>{q.correctAnswer}</strong>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-gray-50 border-t flex gap-4">
          <button
            onClick={() => resetGame()}
            className="flex-1 py-4 bg-navy text-white rounded-xl font-bold text-xl hover:bg-blue-900 transition-colors shadow-lg"
          >
            PLAY AGAIN
          </button>
          <button
            onClick={() => navigateTo('main-menu')}
            className="flex-1 py-4 bg-white text-navy border-2 border-navy rounded-xl font-bold text-xl hover:bg-gray-100 transition-colors"
          >
            MAIN MENU
          </button>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, color }: { label: string, value: string | number, color: string }) {
  return (
    <div className={`${color} p-4 rounded-xl text-center shadow-sm`}>
      <div className="text-xs font-bold uppercase tracking-widest opacity-70 mb-1">{label}</div>
      <div className="text-2xl font-black">{value}</div>
    </div>
  );
}
