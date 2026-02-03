import { useGameStore } from '@store/gameStore';
import type { Order, StationType, OrderStep } from '@app-types/game.types';

const DISH_NAMES = [
  'Comma Curry',
  'Quadratic Quiche',
  'Algebra Alfredo',
  'Grammar Gumbo',
  'Calculus Casserole',
];

const STEPS: StationType[] = ['ticket', 'fridge', 'prep', 'stove', 'plating'];

export class OrderSystem {
  private static instance: OrderSystem;

  public static getInstance(): OrderSystem {
    if (!OrderSystem.instance) {
      OrderSystem.instance = new OrderSystem();
    }
    return OrderSystem.instance;
  }

  public generateOrder(): Order {
    const id = Math.random().toString(36).substring(7);
    const dishName = DISH_NAMES[Math.floor(Math.random() * DISH_NAMES.length)];

    const steps: OrderStep[] = STEPS.map((type, index) => ({
      stationType: type,
      questionId: '', // Will be filled when active
      status: index === 0 ? 'active' : 'locked',
    }));

    return {
      id,
      dishName,
      steps,
      deadline: 180, // 3 minutes
      timeRemaining: 180,
      status: 'pending',
      qualityScore: 100,
    };
  }

  public advanceOrder(orderId: string, isCorrect: boolean) {
    const { orders } = useGameStore.getState();
    const orderIndex = orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) return;

    const order = { ...orders[orderIndex] };
    const currentStepIndex = order.steps.findIndex(s => s.status === 'active');

    if (currentStepIndex === -1) return;

    // Update current step
    order.steps[currentStepIndex].status = isCorrect ? 'completed' : 'failed';
    order.steps[currentStepIndex].isCorrect = isCorrect;

    if (!isCorrect) {
      order.qualityScore -= 10;
    }

    // Unlock next step
    if (currentStepIndex < order.steps.length - 1) {
      order.steps[currentStepIndex + 1].status = 'active';
    } else {
      order.status = 'completed';
    }

    // Update store (this is a simplified update)
    const newOrders = [...orders];
    newOrders[orderIndex] = order;
    useGameStore.setState({ orders: newOrders });
  }
}
