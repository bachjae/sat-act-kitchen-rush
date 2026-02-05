import { useGameStore } from '@store/gameStore';

const SKILLS = [
  { id: 'all', name: 'ALL SKILLS', color: 'bg-gray-600' },
  { id: 'sat-math', name: 'SAT MATH', color: 'bg-red-500' },
  { id: 'sat-english', name: 'SAT ENGLISH', color: 'bg-red-600' },
  { id: 'act-math', name: 'ACT MATH', color: 'bg-blue-500' },
  { id: 'act-english', name: 'ACT ENGLISH', color: 'bg-blue-600' },
  { id: 'act-science', name: 'ACT SCIENCE', color: 'bg-teal-500' },
];

export function SkillSelectView() {
  const { setView, setSelectedSkill, setStatus } = useGameStore();

  const handleStart = (skillId: string) => {
    setSelectedSkill(skillId);
    setStatus('playing');
    setView('playing');
  };

  return (
    <div className="min-h-screen bg-kitchen-navy flex flex-col items-center justify-center p-4 text-white overflow-y-auto">
      <div className="max-w-4xl w-full text-center space-y-8 py-12">
        <h2 className="text-4xl font-black italic uppercase text-kitchen-teal">Choose Your Focus</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-8">
          {SKILLS.map((skill) => (
            <button
              key={skill.id}
              onClick={() => handleStart(skill.id)}
              className={`
                ${skill.color} p-6 rounded-2xl transition-all hover:scale-105 shadow-lg
                flex flex-col items-center justify-center min-h-[160px] group
              `}
            >
              <h3 className="text-xl font-black group-hover:scale-110 transition-transform">
                {skill.name}
              </h3>
            </button>
          ))}
        </div>

        <button
          onClick={() => setView('mode-select')}
          className="mt-12 text-kitchen-teal font-bold hover:underline block mx-auto"
        >
          BACK TO MODE SELECTION
        </button>
      </div>
    </div>
  );
}
