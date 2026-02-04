import { useGameStore } from '@store/gameStore';
import { OrderList } from './OrderList';

export function HUD() {
  const { score, status, timeLeft, orders } = useGameStore();

  if (status !== 'playing' && status !== 'paused') return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = Math.floor(timeLeft % 60);

  return (
    <div className="absolute top-0 left-0 w-full h-full p-6 flex flex-col pointer-events-none">
      <div className="flex justify-between items-start w-full relative z-10">
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

        {/* Top Right: Session Info */}
        <div className="bg-teal-500 text-gray-900 px-6 py-3 rounded-xl shadow-lg border-2 border-gray-900 pointer-events-auto min-w-[120px]">
          <div className="text-xs uppercase font-bold tracking-widest opacity-70 text-center">Done</div>
          <div className="text-xl font-bold uppercase text-center">
            {orders.filter(o => o.status === 'completed').length}
          </div>
        </div>
      </div>

      {/* Order List Overlay (Top Right below HUD) */}
      <div className="mt-20 self-end">
        <OrderList />
      </div>
    </div>
  );
}
