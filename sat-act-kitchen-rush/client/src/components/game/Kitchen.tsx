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

  useEffect(() => {
    if (!canvasRef.current) return;
    if (appRef.current) return;
    let mounted = true;
    async function init() {
      if (!canvasRef.current || !mounted) return;
      try {
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
        const engine = new GameEngine(app);
        await engine.init();
        if (!mounted) { app.destroy(); return; }
        engineRef.current = engine;
        engine.start();
      } catch (err) {
        console.error('Failed to initialize PixiJS:', err);
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

  if (error) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-8 text-center"><h1 className="text-xl font-bold text-red-500 mb-2">Renderer Error</h1><p>{error}</p></div>;
  }

  const { activeMechanic, activeStation, setActiveMechanic, updateScore, updateOrderTimers, status } = useGameStore();

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

  const handleMechanicComplete = async (success: boolean) => {
    setActiveMechanic(null);
    if (success) {
      updateScore(50);
      if (engineRef.current && activeStation) {
        await engineRef.current.showQuestionForStation(activeStation);
      }
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
      <canvas ref={canvasRef} className="pixel-perfect border-4 border-gray-800 shadow-2xl" style={{ imageRendering: 'pixelated' }} />
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
      <QuestionModal />
    </div>
  );
}
