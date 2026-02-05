import { useEffect, useRef, useState } from 'react';
import { Application } from 'pixi.js';
import { GameEngine } from '@game/engine/GameEngine';
import { QuestionModal } from '@components/ui/QuestionModal';
import { RecipeTicketModal } from '@components/ui/RecipeTicketModal';
import { FridgeMechanic, PrepMechanic, StoveMechanic, PlatingMechanic } from '@components/mechanics';
import { useGameStore } from '@store/gameStore';

export function Kitchen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const appRef = useRef<Application | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;
    // Prevent double-init from React StrictMode
    if (appRef.current) return;

    let mounted = true;

    async function init() {
      if (!canvasRef.current || !mounted) return;

      console.log('🎮 Initializing Kitchen...');

      try {
        const app = new Application();
        await app.init({
          canvas: canvasRef.current,
          width: 1280,
          height: 720,
          backgroundColor: 0xF1FAEE,
          antialias: false,
        });

        if (!mounted) {
          app.destroy();
          return;
        }

        appRef.current = app;
        const engine = new GameEngine(app);
        await engine.init();

        if (!mounted) {
          app.destroy();
          return;
        }

        engineRef.current = engine;
        engine.start();

        console.log('✅ Kitchen initialized');
      } catch (err) {
        console.error('Failed to initialize PixiJS:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize game renderer');
      }
    }

    init();

    return () => {
      console.log('🛑 Cleaning up Kitchen');
      mounted = false;
      if (engineRef.current) {
        engineRef.current.stop();
        engineRef.current = null;
      }
      if (appRef.current) {
        appRef.current.destroy();
        appRef.current = null;
      }
    };
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="bg-white p-8 rounded-xl text-center max-w-md">
          <h1 className="text-xl font-bold text-red-600 mb-2">Renderer Error</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <p className="text-sm text-gray-500">
            This game requires WebGL support. Please use a modern browser like Chrome, Firefox, or Edge.
          </p>
        </div>
      </div>
    );
  }

  const { activeMechanic, activeStation, setActiveMechanic, updateScore } = useGameStore();

  const handleMechanicComplete = async (success: boolean) => {
    console.log(`🎮 Mechanic complete: ${success ? 'SUCCESS' : 'FAIL'}`);
    setActiveMechanic(null);

    if (success) {
      updateScore(50); // Bonus for completing mechanic

      // After successful mechanic, show a question
      if (engineRef.current && activeStation) {
        console.log(`📝 Showing question after mechanic for ${activeStation}`);
        await engineRef.current.showQuestionForStation(activeStation);
      }
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center bg-gray-900">
      <canvas
        ref={canvasRef}
        className="pixel-perfect border-4 border-gray-800 shadow-2xl"
        style={{
          imageRendering: 'pixelated'
        }}
      />

      {/* Recipe Ticket Modal - shows when picking up an order */}
      <RecipeTicketModal />

      {/* Station Mechanics */}
      {activeMechanic === 'fridge' && (
        <FridgeMechanic onComplete={handleMechanicComplete} />
      )}
      {activeMechanic === 'prep' && (
        <PrepMechanic onComplete={handleMechanicComplete} />
      )}
      {activeMechanic === 'stove' && (
        <StoveMechanic onComplete={handleMechanicComplete} />
      )}
      {activeMechanic === 'plating' && (
        <PlatingMechanic onComplete={handleMechanicComplete} />
      )}

      {/* Question Modal - shows when at question stations */}
      <QuestionModal />
    </div>
  );
}
