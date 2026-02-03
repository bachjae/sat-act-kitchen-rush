import { useGameStore } from '@store/gameStore';

export function HUD() {
  const { score, status, timeLeft, orders } = useGameStore();

  if (status !== 'playing' && status !== 'paused') return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  return (
    <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col pointer-events-none">
      <div className="flex justify-between items-start w-full">
        {/* Top Left: Score */}
        <div className="bg-gray-900 text-white px-6 py-3 rounded-xl shadow-lg border-2 border-white pointer-events-auto">
          <div className="text-xs uppercase font-bold tracking-widest opacity-70">Score</div>
          <div className="text-3xl font-mono font-bold">{score.toLocaleString()}</div>
        </div>

        {/* Top Center: Timer */}
        <div className="bg-white px-8 py-2 rounded-full shadow-lg border-2 border-gray-900 pointer-events-auto">
          <div className={`text-3xl font-mono font-bold ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
            {minutes}:{seconds.toString().padStart(2, '0')}
          </div>
        </div>

        {/* Top Right: Progress */}
        <div className="bg-teal-500 text-gray-900 px-6 py-3 rounded-xl shadow-lg border-2 border-gray-900 pointer-events-auto">
          <div className="text-xs uppercase font-bold tracking-widest opacity-70">Orders</div>
          <div className="text-xl font-bold uppercase">
            {orders.filter(o => o.status === 'completed').length} / {orders.length}
          </div>
        </div>
      </div>

      {/* Left Sidebar: Active Orders */}
      <div className="mt-8 flex flex-col gap-4 w-64 pointer-events-auto">
        {orders.filter(o => o.status === 'pending' || o.status === 'in_progress').map(order => (
          <div key={order.id} className="bg-white p-4 rounded-lg shadow-md border-l-8 border-orange-500">
            <h3 className="font-bold text-gray-900">{order.dishName}</h3>
            <div className="text-xs text-gray-500 mb-2">
              Time: {Math.floor(order.timeRemaining / 60)}:{(order.timeRemaining % 60).toString().padStart(2, '0')}
            </div>
            <div className="flex gap-1">
              {order.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`w-3 h-3 rounded-full ${
                    step.status === 'completed' ? 'bg-green-500' :
                    step.status === 'active' ? 'bg-blue-500 animate-pulse' :
                    'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
