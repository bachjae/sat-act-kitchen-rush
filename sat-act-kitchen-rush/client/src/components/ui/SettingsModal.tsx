import { useState, useEffect } from 'react';

interface Settings {
  musicVolume: number;
  sfxVolume: number;
  colorblindMode: boolean;
  textSize: 'small' | 'medium' | 'large';
  reducedMotion: boolean;
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
  timerSpeed: 'normal' | 'relaxed';
}

const DEFAULT_SETTINGS: Settings = {
  musicVolume: 50,
  sfxVolume: 70,
  colorblindMode: false,
  textSize: 'medium',
  reducedMotion: false,
  difficulty: 'all',
  timerSpeed: 'normal',
};

export function SettingsModal({ onClose }: { onClose: () => void }) {
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem('game-settings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('game-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl border-8 border-blue-500 shadow-2xl flex flex-col max-h-[90vh]">
        <div className="bg-blue-500 p-6 text-white flex justify-between items-center">
          <h2 className="text-3xl font-black italic tracking-tighter">SETTINGS</h2>
          <button onClick={onClose} className="text-4xl font-black hover:scale-110 transition-transform">&times;</button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-10">
          {/* Audio Section */}
          <section>
            <h3 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-red-500 rounded-full" /> AUDIO
            </h3>
            <div className="space-y-6 pl-4">
              <VolumeSlider
                label="Music Volume"
                value={settings.musicVolume}
                onChange={(v) => updateSetting('musicVolume', v)}
              />
              <VolumeSlider
                label="SFX Volume"
                value={settings.sfxVolume}
                onChange={(v) => updateSetting('sfxVolume', v)}
              />
            </div>
          </section>

          {/* Accessibility Section */}
          <section>
            <h3 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-green-500 rounded-full" /> ACCESSIBILITY
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
              <ToggleSetting
                label="Colorblind Mode"
                enabled={settings.colorblindMode}
                onToggle={() => updateSetting('colorblindMode', !settings.colorblindMode)}
              />
              <ToggleSetting
                label="Reduced Motion"
                enabled={settings.reducedMotion}
                onToggle={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              />
              <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-600">Text Size</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['small', 'medium', 'large'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => updateSetting('textSize', size)}
                      className={`flex-1 py-2 rounded-md font-bold text-xs uppercase transition-all ${settings.textSize === size ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Difficulty Section */}
          <section>
            <h3 className="text-xl font-black text-navy mb-4 flex items-center gap-2">
              <span className="w-2 h-6 bg-yellow-400 rounded-full" /> GAMEPLAY
            </h3>
            <div className="space-y-4 pl-4">
               <div className="flex flex-col gap-2">
                <label className="font-bold text-gray-600">Question Difficulty</label>
                <div className="flex bg-gray-100 rounded-lg p-1">
                  {(['all', 'easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => updateSetting('difficulty', diff)}
                      className={`flex-1 py-2 rounded-md font-bold text-xs uppercase transition-all ${settings.difficulty === diff ? 'bg-white shadow text-blue-600' : 'text-gray-400'}`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>
              <ToggleSetting
                label="Relaxed Timers (+50% time)"
                enabled={settings.timerSpeed === 'relaxed'}
                onToggle={() => updateSetting('timerSpeed', settings.timerSpeed === 'normal' ? 'relaxed' : 'normal')}
              />
            </div>
          </section>
        </div>

        <div className="p-8 bg-gray-50 border-t">
          <button
            onClick={onClose}
            className="w-full py-4 bg-navy text-white rounded-2xl font-black text-xl hover:bg-blue-900 transition-colors shadow-lg"
          >
            SAVE & CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}

function VolumeSlider({ label, value, onChange }: { label: string, value: number, onChange: (v: number) => void }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex justify-between font-bold">
        <label className="text-gray-600">{label}</label>
        <span className="text-navy">{value}%</span>
      </div>
      <input
        type="range"
        min="0" max="100"
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
      />
    </div>
  );
}

function ToggleSetting({ label, enabled, onToggle }: { label: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center p-4 bg-gray-50 rounded-xl border-2 border-transparent hover:border-blue-200 transition-all cursor-pointer" onClick={onToggle}>
      <label className="font-bold text-gray-700 cursor-pointer">{label}</label>
      <div className={`w-14 h-8 rounded-full p-1 transition-colors duration-200 ${enabled ? 'bg-green-400' : 'bg-gray-300'}`}>
        <div className={`w-6 h-6 bg-white rounded-full shadow-md transition-transform duration-200 ${enabled ? 'translate-x-6' : 'translate-x-0'}`} />
      </div>
    </div>
  );
}
