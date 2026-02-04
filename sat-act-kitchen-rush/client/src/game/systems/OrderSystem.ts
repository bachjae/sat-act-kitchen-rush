import { useGameStore } from '@store/gameStore';
import type { Order, OrderStep, StationType } from '@app-types/game.types';

const DISHES = [
  'Algebraic Apple Pie',
  'Geometric Goulash',
  'Trig Tacos',
  'Calculus Curry',
  'Statistical Salad',
  'Grammar Gumbo',
  'Reading Roast',
  'Writing Waffles'
];

export async function generateOrder(): Promise<Order> {
  const id = Math.random().toString(36).substr(2, 9);
  const dishName = DISHES[Math.floor(Math.random() * DISHES.length)] ?? 'Chef\'s Special';

  const steps: OrderStep[] = [
    { stationType: 'ticket', status: 'active', questionId: '' },
    { stationType: 'fridge', status: 'locked', questionId: '' },
    { stationType: 'prep', status: 'locked', questionId: '' },
    { stationType: 'stove', status: 'locked', questionId: '' },
    { stationType: 'plating', status: 'locked', questionId: '' },
  ];

  return {
    id,
    dishName,
    steps,
    deadline: 180,
    timeRemaining: 180,
    status: 'pending',
    qualityScore: 100
  };
}

export function updateOrders(deltaTime: number) {
  const { orders, failOrder, status } = useGameStore.getState();
  if (status !== 'playing') return;

  orders.forEach(order => {
    const newTime = order.timeRemaining - deltaTime;
    if (newTime <= 0) {
      failOrder(order.id);
    } else {
      // We need a way to update the timeRemaining in the store without triggering massive re-renders
      // For now, let's just use a simple update
      // Optimization: only update every second or so
    }
  });
}

export async function checkAndRefillOrders(count?: number) {
  const { orders, addOrder, status, sessionTimeRemaining } = useGameStore.getState();

  if (status !== 'playing') return;

  const activeOrders = orders.filter(o => o.status === 'pending' || o.status === 'in_progress');
  const MAX_ACTIVE = 3;

  if (count) {
    for (let i = 0; i < count; i++) {
      const newOrder = await generateOrder();
      addOrder(newOrder);
    }
    return;
  }

  if (sessionTimeRemaining < 60) return; // Final wave

  if (activeOrders.length < MAX_ACTIVE) {
    // For now just add one at a time to avoid spamming
    const newOrder = await generateOrder();
    addOrder(newOrder);
  }
}

export function progressOrder(stationType: StationType, isCorrect: boolean) {
  const { orders, completeOrder, failOrder } = useGameStore.getState();

  // Find the first order that has this station as its current active step
  const orderIndex = orders.findIndex(o =>
    o.steps.some(s => s.stationType === stationType && s.status === 'active')
  );

  if (orderIndex === -1) return;

  const order = { ...orders[orderIndex] } as Order;
  const stepIndex = order.steps.findIndex(s => s.stationType === stationType && s.status === 'active');
  if (stepIndex === -1) return;
  const step = { ...order.steps[stepIndex] } as OrderStep;

  if (isCorrect) {
    step.status = 'completed';
    order.status = 'in_progress';

    // Unlock next step
    const nextStep = order.steps[stepIndex + 1];
    if (nextStep) {
      nextStep.status = 'active';
    } else {
      // Order complete!
      order.status = 'completed';
      setTimeout(() => completeOrder(order.id), 0);
      return;
    }
  } else {
    // Check for failure condition
    order.qualityScore = (order.qualityScore || 100) - 10;
    if (order.qualityScore <= 70) {
      failOrder(order.id);
      return;
    }
  }

  order.steps[stepIndex] = step;
  // Update order in store
  useGameStore.getState().updateOrder(order);
}
