import React from 'react';
import { AlignLeft, List, CheckSquare, Calendar, Target, BookOpen } from 'lucide-react';

interface SettingsPanelProps {
  settings: any;
  setSettings: (settings: any) => void;
  toolId: string;
}

export function SettingsPanel({ settings, setSettings, toolId }: SettingsPanelProps) {
  const updateSetting = (key: string, value: any) => {
    setSettings((prev: any) => ({ ...prev, [key]: value }));
  };

  const Toggle = ({ label, icon: Icon, stateKey }: { label: string, icon: any, stateKey: string }) => {
    const isActive = settings[stateKey];
    return (
      <div 
        onClick={() => updateSetting(stateKey, !isActive)}
        className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${
          isActive 
            ? 'bg-blue-900/20 border-blue-500/50 text-blue-100' 
            : 'bg-[#1a1a1a] border-gray-800 text-gray-400 hover:border-gray-600'
        }`}
      >
        <div className="flex items-center gap-3">
          <Icon size={16} className={isActive ? 'text-blue-400' : 'text-gray-500'} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <div className={`w-10 h-5 rounded-full relative transition-colors ${isActive ? 'bg-blue-600' : 'bg-gray-700'}`}>
          <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform ${isActive ? 'translate-x-5' : 'translate-x-0'}`} />
        </div>
      </div>
    );
  };

  const SelectGroup = ({ label, options, stateKey }: { label: string, options: string[], stateKey: string }) => (
    <div className="flex flex-col gap-2">
      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{label}</label>
      <div className="flex bg-[#1a1a1a] p-1 rounded-lg border border-gray-800">
        {options.map(opt => (
          <button
            key={opt}
            onClick={() => updateSetting(stateKey, opt)}
            className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
              settings[stateKey] === opt 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
            }`}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 mt-4 overflow-y-auto pr-2" style={{ scrollbarWidth: 'none' }}>
      
      <div className="flex flex-col gap-4">
        {toolId === 'pdf-summary' && <SelectGroup label="Summary Length" options={['Short', 'Medium', 'Detailed']} stateKey="summaryLength" />}
        <SelectGroup label="Output Style" options={['Bullet Points', 'Paragraph', 'Study Notes']} stateKey="outputStyle" />
        
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Tone</label>
            <select 
              value={settings.tone} 
              onChange={e => updateSetting('tone', e.target.value)}
              className="bg-[#1a1a1a] border border-gray-800 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors"
            >
              <option>Simple</option>
              <option>Professional</option>
              <option>Academic</option>
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Language</label>
            <select 
              value={settings.language} 
              onChange={e => updateSetting('language', e.target.value)}
              className="bg-[#1a1a1a] border border-gray-800 text-white text-sm rounded-lg p-2.5 outline-none focus:border-blue-500 transition-colors"
            >
              <option>English</option>
              <option>Hindi</option>
              <option>Urdu</option>
            </select>
          </div>
        </div>
      </div>

      <div className="w-full h-px bg-gray-800/50" />

      <div className="flex flex-col gap-3">
        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Include Features</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Toggle label="Key Points" icon={List} stateKey="includeKeyPoints" />
          <Toggle label="Action Items" icon={CheckSquare} stateKey="includeActionItems" />
          <Toggle label="Important Dates" icon={Calendar} stateKey="includeImportantDates" />
          <Toggle label="Conclusion" icon={Target} stateKey="includeConclusion" />
          <Toggle label="Simple Ex." icon={BookOpen} stateKey="includeSimpleExplanation" />
          <Toggle label="Page Refs" icon={AlignLeft} stateKey="includePageReferences" />
        </div>
      </div>

    </div>
  );
}
