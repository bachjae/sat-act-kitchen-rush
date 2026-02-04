import type { Order } from '@app-types/game.types';

interface Props {
  order: Order;
}

export function OrderCard({ order }: Props) {
  const completedSteps = order.steps.filter(s => s.status === 'completed' || s.status === 'failed').length;

  const minutes = Math.floor(order.timeRemaining / 60);
  const seconds = Math.floor(order.timeRemaining % 60);
  const timerString = `${minutes}:${seconds.toString().padStart(2, '0')}`;

  let timerColor = 'text-gray-500';
  if (order.timeRemaining < 30) {
    timerColor = 'text-red-600 font-bold animate-pulse';
  } else if (order.timeRemaining < 60) {
    timerColor = 'text-orange-500 font-bold';
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border-2 border-gray-100 p-5 w-[256px] transition-all hover:shadow-xl">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-bold text-gray-900 leading-tight flex-1 mr-2">{order.dishName}</h3>
        <span className={`font-mono text-lg ${timerColor}`}>{timerString}</span>
      </div>

      <div className="space-y-2 mb-4">
        {order.steps.map((step, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <span className={`
              w-5 h-5 flex items-center justify-center rounded-full text-xs font-bold
              ${step.status === 'completed' ? 'bg-green-100 text-green-600' :
                step.status === 'active' ? 'bg-blue-600 text-white animate-bounce' :
                step.status === 'failed' ? 'bg-red-100 text-red-600' :
                'bg-gray-100 text-gray-400'}
            `}>
              {step.status === 'completed' ? '✓' :
               step.status === 'active' ? '→' :
               step.status === 'failed' ? '✗' : '○'}
            </span>
            <span className={`
              text-sm uppercase font-semibold tracking-wide
              ${step.status === 'active' ? 'text-blue-600 font-bold' :
                step.status === 'locked' ? 'text-gray-400' : 'text-gray-700'}
            `}>
              {step.stationType}
            </span>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-3 border-t border-gray-100 text-xs">
        <span className="text-gray-500 font-medium uppercase tracking-wider">Progress</span>
        <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full font-bold">
          {completedSteps} / {order.steps.length}
        </span>
      </div>
    </div>
  );
}
