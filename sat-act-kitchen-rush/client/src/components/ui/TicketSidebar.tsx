import { useGameStore } from '@store/gameStore';

export function TicketSidebar() {
  const { orders } = useGameStore();
  const activeOrders = orders.filter(o => o.status === 'in_progress' || o.status === 'pending');

  if (activeOrders.length === 0) return null;

  return (
    <div className="absolute top-20 right-4 w-64 space-y-4 pointer-events-none">
      {activeOrders.map(order => (
        <div key={order.id} className="bg-white rounded-lg shadow-xl overflow-hidden border-2 border-gray-800 pointer-events-auto">
          {/* Header */}
          <div className="bg-orange-500 text-white px-3 py-2 flex justify-between items-center">
            <span className="font-bold text-sm uppercase truncate">{order.dishName}</span>
            <span className={`text-xs font-mono px-2 py-0.5 rounded ${
              order.timeRemaining < 30 ? 'bg-red-600 animate-pulse' : 'bg-orange-700'
            }`}>
              {Math.floor(order.timeRemaining / 60)}:{Math.floor(order.timeRemaining % 60).toString().padStart(2, '0')}
            </span>
          </div>

          {/* Steps */}
          <div className="p-3 space-y-2">
            {order.steps.map((step, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs">
                <div className={`w-4 h-4 rounded-full flex items-center justify-center border ${
                  step.status === 'completed' ? 'bg-green-500 border-green-600 text-white' :
                  step.status === 'active' ? 'bg-blue-500 border-blue-600 animate-pulse' :
                  'bg-gray-200 border-gray-300'
                }`}>
                  {step.status === 'completed' ? '✓' : ''}
                </div>
                <span className={`capitalize ${
                  step.status === 'completed' ? 'line-through text-gray-400' :
                  step.status === 'active' ? 'font-bold text-blue-700' : 'text-gray-500'
                }`}>
                  {step.stationType}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div className="h-1 bg-gray-200">
            <div
              className="h-full bg-green-500 transition-all duration-500"
              style={{ width: `${(order.steps.filter(s => s.status === 'completed').length / order.steps.length) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
