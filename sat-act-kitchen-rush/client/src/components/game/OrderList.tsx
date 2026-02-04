import { useGameStore } from '@store/gameStore';
import { OrderCard } from './OrderCard';

export function OrderList() {
  const orders = useGameStore((state) => state.orders);

  // Show only pending or in_progress orders
  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress');

  return (
    <div className="flex flex-col gap-4 max-h-[80vh] overflow-y-auto pr-2 pointer-events-auto">
      {activeOrders.map((order) => (
        <OrderCard key={order.id} order={order} />
      ))}

      {activeOrders.length === 0 && (
        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 border border-dashed border-gray-300 text-center">
          <p className="text-gray-500 text-sm italic">Waiting for new orders...</p>
        </div>
      )}
    </div>
  );
}
