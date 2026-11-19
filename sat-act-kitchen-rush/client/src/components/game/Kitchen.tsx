import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { GameEngine } from '@game/engine/GameEngine';
import { QuestionModal } from '@components/ui/QuestionModal';
import { RecipeTicketModal } from '@components/ui/RecipeTicketModal';
import { TicketSidebar } from '@components/ui/TicketSidebar';
import { InventoryHotbar } from '@components/ui/InventoryHotbar';
import {
  FridgeMechanic,
  PrepMechanic,
  StoveMechanic,
  PlatingMechanic,
  GrillMechanic,
  FryMechanic,
  OvenMechanic,
  DrinkMechanic,
  DessertMechanic
} from '@components/mechanics';
import { useGameStore } from '@store/gameStore';

export function Kitchen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const appRef = useRef<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  // IMPORTANT: All hooks must be called before any conditional returns
  const { activeMechanic, activeStation, setActiveMechanic, updateScore, updateOrderTimers, status } = useGameStore();

  // Initialize PixiJS and GameEngine
  useEffect(() => {
    if (!canvasRef.current) return;
    if (appRef.current) return;
    let mounted = true;

    async function init() {
      if (!canvasRef.current || !mounted) return;
      try {
        console.log('[Kitchen] Initializing PixiJS...');
        const app = new Application();
        await app.init({
          canvas: canvasRef.current,
          width: 1280,
          height: 720,
          backgroundColor: 0xF1FAEE,
          antialias: false,
        });
        if (!mounted) { app.destroy(); return; }
        appRef.current = app;

        console.log('[Kitchen] Initializing GameEngine...');
        const engine = new GameEngine(app);
        await engine.init();
        if (!mounted) { app.destroy(); return; }
        engineRef.current = engine;

        console.log('[Kitchen] Starting game loop...');
        engine.start();
        console.log('[Kitchen] Game started successfully');
      } catch (err) {
        console.error('[Kitchen] Failed to initialize PixiJS:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize game renderer');
      }
    }
    init();

    return () => {
      mounted = false;
      if (engineRef.current) { engineRef.current.stop(); engineRef.current = null; }
      if (appRef.current) { appRef.current.destroy(); appRef.current = null; }
    };
  }, []);

  // Order timer update effect
  useEffect(() => {
    if (status !== 'playing') return;
    let lastTime = performance.now();
    const interval = setInterval(() => {
      const now = performance.now();
      updateOrderTimers((now - lastTime) / 1000);
      lastTime = now;
    }, 1000);
    return () => clearInterval(interval);
  }, [status, updateOrderTimers]);

  // Error state - shown after all hooks are called
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center">
        <h1 className="text-xl font-bold text-red-500 mb-2">Renderer Error</h1>
        <p>{error}</p>
      </div>
    );
  }

  // NEW FLOW: Mechanic completes AFTER question (no question after mechanic)
  const handleMechanicComplete = (success: boolean) => {
    setActiveMechanic(null);
    if (success) {
      updateScore(50);
    }
    // No question after mechanic - question was already answered first
  };

  // Called from QuestionModal after answer (correct or not)
  // Player can always proceed to mechanic, but gets points only for correct answer
  const handleQuestionAnswered = (_correct: boolean) => {
    if (activeStation && engineRef.current) {
      // Trigger the mechanic after answering question
      engineRef.current.triggerMechanicForStation(activeStation);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900 overflow-hidden">
      <canvas
        ref={canvasRef}
        width={1280}
        height={720}
        className="pixel-perfect border-4 border-gray-800 shadow-2xl max-w-full max-h-full"
        style={{ imageRendering: 'pixelated', aspectRatio: '16/9' }}
      />
      <RecipeTicketModal />
      {activeMechanic === 'fridge' && <FridgeMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'prep' && <PrepMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'stove' && <StoveMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'grill' && <GrillMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'fry' && <FryMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'oven' && <OvenMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'drinks' && <DrinkMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'dessert' && <DessertMechanic onComplete={handleMechanicComplete} />}
      {activeMechanic === 'plating' && <PlatingMechanic onComplete={handleMechanicComplete} />}
      <TicketSidebar />
      <InventoryHotbar />
      <QuestionModal onAnswered={handleQuestionAnswered} />
    </div>
  );
}
