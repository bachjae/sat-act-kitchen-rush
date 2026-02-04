import { useGameStore } from '@store/gameStore';

export function HUD() {
  const { score, sessionTimeRemaining, orders } = useGameStore();

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="absolute inset-0 pointer-events-none p-6 flex flex-col justify-between">
      {/* Top HUD */}
      <div className="flex justify-between items-start">
        {/* Score */}
        <div className="bg-navy text-white p-4 rounded-xl shadow-lg border-2 border-white pointer-events-auto">
          <div className="text-xs font-bold uppercase tracking-wider opacity-70">Score</div>
          <div className="text-3xl font-black tabular-nums">{score.toLocaleString()}</div>
        </div>

        {/* Timer */}
        <div className="bg-white text-navy px-8 py-3 rounded-full shadow-lg border-4 border-navy pointer-events-auto">
          <div className="text-4xl font-black tabular-nums">{formatTime(sessionTimeRemaining)}</div>
        </div>

        {/* Orders List */}
        <div className="flex flex-col gap-3 items-end pointer-events-auto">
          {orders.map(order => (
            <div key={order.id} className="bg-white border-4 border-navy rounded-xl p-3 w-64 shadow-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="font-black text-navy truncate flex-1 mr-2">{order.dishName}</span>
                <span className={`font-mono font-bold ${order.timeRemaining < 30 ? 'text-red-600 animate-pulse' : 'text-navy'}`}>
                  {Math.floor(order.timeRemaining)}s
                </span>
              </div>

              {/* Progress Steps */}
              <div className="flex justify-between gap-1">
                {order.steps.map((step, i) => {
                  let color = 'bg-gray-200';
                  let char = '○';
                  if (step.status === 'completed') {
                    color = 'bg-green-500';
                    char = '✓';
                  } else if (step.status === 'active') {
                    color = 'bg-yellow-400';
                    char = '→';
                  } else if (step.status === 'failed') {
                    color = 'bg-red-500';
                    char = '✗';
                  }

                  return (
                    <div key={i} className={`flex-1 h-6 ${color} rounded flex items-center justify-center text-[10px] font-bold text-white border border-black border-opacity-10`}>
                      {char}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
          {orders.length === 0 && (
            <div className="bg-navy bg-opacity-50 text-white px-4 py-2 rounded-lg italic text-sm">
              Waiting for orders...
            </div>
          )}
        </div>
      </div>

      {/* Footer / Controls could go here */}
    </div>
  );
}
