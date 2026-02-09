
import React, { useState, useMemo, useEffect } from 'react';
import { 
  Calculator, 
  Home, 
  PieChart, 
  Settings, 
  ChevronRight, 
  Info, 
  Zap,
  Square,
  Layers,
  DoorOpen,
  ArrowRight,
  Sparkles,
  Save,
  FolderOpen,
  Trash2,
  Edit3,
  Plus,
  Download,
  RefreshCw,
  X,
  AlertCircle
} from 'lucide-react';
import { 
  QualityType, 
  CalculatorState,
  CategoryKey,
  SavedProject
} from './types';
import { formatCurrency, numberToWords, RATES } from './constants';
import { CalculatorEngine } from './services/CalculatorEngine';
import { ProjectRepository } from './services/ProjectRepository';
import { PieChart as RePieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

// --- UI Components ---

const Header = () => (
  <header className="bg-sky-600 text-white p-6 pt-12 rounded-b-[2.5rem] shadow-xl border-b-4 border-yellow-400">
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-black tracking-tighter text-white drop-shadow-sm">EasyBuild</h1>
        <p className="text-sky-100 text-[10px] font-black mt-0.5 uppercase tracking-[0.2em]">Smart Estimation Engine</p>
      </div>
      <div className="bg-yellow-400 p-2.5 rounded-2xl shadow-lg transform rotate-6 border-2 border-sky-700">
        <Sparkles className="text-sky-900" size={20} />
      </div>
    </div>
  </header>
);

const SectionCard: React.FC<{
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
  description: string;
}> = ({ title, icon, active, onClick, description }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center justify-between p-5 rounded-2xl transition-all duration-300 ${
      active 
        ? 'bg-white border-2 border-sky-500 shadow-xl ring-4 ring-sky-50 -translate-y-1' 
        : 'bg-white border border-slate-200 hover:border-sky-200 hover:shadow-md'
    }`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl transition-colors shadow-sm ${active ? 'bg-sky-600 text-white' : 'bg-sky-50 text-sky-600'}`}>
        {icon}
      </div>
      <div className="text-left">
        <p className={`font-black text-base tracking-tight ${active ? 'text-slate-900' : 'text-slate-800'}`}>{title}</p>
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{description}</p>
      </div>
    </div>
    <ChevronRight className={`w-5 h-5 transition-transform duration-300 ${active ? 'text-sky-600 rotate-90' : 'text-slate-300'}`} />
  </button>
);

const FormField: React.FC<{ label: string; children: React.ReactNode; helper?: string; error?: string; disabled?: boolean }> = ({ label, children, helper, error, disabled }) => (
  <div className={`space-y-1.5 transition-all duration-300 ${disabled ? 'opacity-40 pointer-events-none grayscale' : 'opacity-100'}`}>
    <label className="text-xs font-black text-slate-900 block uppercase tracking-widest">{label}</label>
    {children}
    {error ? (
      <p className="text-[10px] text-red-500 font-black flex items-center gap-1">
        <AlertCircle size={10} /> {error}
      </p>
    ) : helper && (
      <p className="text-[10px] text-slate-500 font-bold">{helper}</p>
    )}
  </div>
);

// --- Main Application ---

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'calc' | 'summary' | 'projects'>('calc');
  const [activeSection, setActiveSection] = useState<CategoryKey>('civil');
  
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('My Dream Home');
  const [state, setState] = useState<CalculatorState>({
    civil: { area: 1000, quality: QualityType.STANDARD, floors: 1, customRate: 0 },
    painting: { area: 3500, quality: QualityType.STANDARD },
    flooring: { area: 900, material: 'VITRIFIED' },
    electrical: { area: 1000, pointsCount: 40 },
    plumbing: { toilets: 2, kitchens: 1 },
    doorsWindows: { doors: 4, windows: 5 },
  });

  const [savedProjects, setSavedProjects] = useState<SavedProject[]>([]);

  useEffect(() => {
    setSavedProjects(ProjectRepository.getAll());
  }, []);

  const result = useMemo(() => CalculatorEngine.calculate(state), [state]);

  const updateState = (category: CategoryKey, data: any) => {
    setState(prev => ({
      ...prev,
      [category]: { ...prev[category], ...data }
    }));
  };

  const handleQualityChange = (q: QualityType) => {
    updateState('civil', { quality: q, customRate: 0 });
  };

  const handleCustomRateChange = (rate: number) => {
    updateState('civil', { customRate: rate });
  };

  const syncRelatedAreas = () => {
    if (state.civil.area <= 0) return alert('Please enter a valid Built-up Area first.');
    const suggestions = CalculatorEngine.getAreaBasedOnCivil(state.civil.area);
    setState(prev => ({
      ...prev,
      painting: { ...prev.painting, area: suggestions.painting?.area || prev.painting.area },
      flooring: { ...prev.flooring, area: suggestions.flooring?.area || prev.flooring.area },
      electrical: { ...prev.electrical, area: state.civil.area }
    }));
    alert('Smart Sync Complete: Calculated based on Standard Floor-to-Wall ratios.');
  };

  const chartData = [
    { name: 'Civil', value: result.civilWork, color: '#0284c7' },
    { name: 'Paint', value: result.painting, color: '#fbbf24' },
    { name: 'Floor', value: result.flooring, color: '#0ea5e9' },
    { name: 'Elec', value: result.electrical, color: '#f59e0b' },
    { name: 'Plumb', value: result.plumbing, color: '#0369a1' },
    { name: 'D&W', value: result.doorsWindows, color: '#eab308' },
  ];

  const handleSaveProject = () => {
    const finalName = projectName.trim() || 'Untitled Project';
    const saved = ProjectRepository.save(finalName, state, result.total, editingProjectId || undefined);
    setSavedProjects(ProjectRepository.getAll());
    setEditingProjectId(saved.id);
    alert(`Project "${finalName}" archived.`);
  };

  const handleExportProject = (project: SavedProject) => {
    const calculation = CalculatorEngine.calculate(project.state);
    const report = `
EASYBUILD CONSTRUCTION ESTIMATE
===============================
Project Name: ${project.name}
Generated: ${new Date(project.timestamp).toLocaleString()}

FINANCIAL SUMMARY
-----------------
Total Estimated Project Cost: ${formatCurrency(project.total)}
Words: ${numberToWords(project.total)}

COMPONENT BREAKDOWN
-------------------
1. Civil Structure: ${formatCurrency(calculation.civilWork)}
2. Finishing (Paint): ${formatCurrency(calculation.painting)}
3. Flooring: ${formatCurrency(calculation.flooring)}
4. Electrical Systems: ${formatCurrency(calculation.electrical)}
5. Plumbing & Sanitary: ${formatCurrency(calculation.plumbing)}
6. Openings (Doors/Windows): ${formatCurrency(calculation.doorsWindows)}

TECHNICAL SPECS
---------------
- Built-up Area: ${project.state.civil.area} sq.ft
- Rate Basis: ${project.state.civil.customRate ? 'CUSTOM (₹' + project.state.civil.customRate + ')' : 'STANDARD (' + project.state.civil.quality + ')'}
===============================
`.trim();

    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${project.name.replace(/\s+/g, '_')}_Estimate.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNewProject = () => {
    if (confirm('Create New Estimation? Current unsaved data will be lost.')) {
      setEditingProjectId(null);
      setProjectName('New Estimation');
      setState({
        civil: { area: 1000, quality: QualityType.STANDARD, floors: 1, customRate: 0 },
        painting: { area: 3500, quality: QualityType.STANDARD },
        flooring: { area: 900, material: 'VITRIFIED' },
        electrical: { area: 1000, pointsCount: 40 },
        plumbing: { toilets: 2, kitchens: 1 },
        doorsWindows: { doors: 4, windows: 5 },
      });
      setActiveTab('calc');
    }
  };

  const handleLoadProject = (project: SavedProject) => {
    setEditingProjectId(project.id);
    setProjectName(project.name);
    setState(project.state);
    setActiveTab('calc');
  };

  const handleDeleteProject = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Delete this project record?')) {
      ProjectRepository.delete(id);
      setSavedProjects(ProjectRepository.getAll());
      if (editingProjectId === id) setEditingProjectId(null);
    }
  };

  const isCustomMode = !!state.civil.customRate && state.civil.customRate > 0;

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-slate-50 shadow-2xl overflow-hidden text-slate-900 pb-24 relative">
      <Header />

      <main className="flex-1 overflow-y-auto px-4 py-6">
        
        {activeTab === 'calc' && (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-6 duration-500">
            <div className="flex justify-between items-center mb-2 px-1">
              <h2 className="text-lg font-black text-sky-900 uppercase tracking-tighter">
                {editingProjectId ? 'Editing Project' : 'New Estimation'}
              </h2>
              <button 
                onClick={handleNewProject}
                className="bg-white text-sky-600 p-2.5 rounded-2xl border-2 border-sky-100 hover:bg-sky-50 transition-all active:scale-90 shadow-sm"
              >
                <Plus size={18} strokeWidth={4} />
              </button>
            </div>

            <div className="mb-6">
              <FormField label="Project Label">
                <input 
                  type="text" 
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full p-4 bg-white border-2 border-sky-100 rounded-2xl focus:border-sky-500 outline-none font-black text-slate-900 shadow-sm transition-all"
                />
              </FormField>
            </div>
            
            <SectionCard 
              title="Civil Work" 
              description="Foundation & Superstructure"
              icon={<Home size={20} />} 
              active={activeSection === 'civil'}
              onClick={() => setActiveSection('civil')}
            />
            {activeSection === 'civil' && (
              <div className="p-6 bg-white rounded-2xl border-2 border-sky-200 mt-2 space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
                <FormField label="Built-up Area (sq.ft)">
                  <div className="relative">
                    <input 
                      type="number" 
                      value={state.civil.area || ''}
                      onChange={(e) => updateState('civil', { area: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:border-sky-500 outline-none font-black text-slate-900 text-xl shadow-inner" 
                    />
                    <button 
                      onClick={syncRelatedAreas}
                      className="absolute right-2 top-2 p-2.5 bg-yellow-400 text-sky-950 rounded-xl hover:bg-yellow-500 active:scale-95 transition-all shadow-md"
                    >
                      <RefreshCw size={18} strokeWidth={4} />
                    </button>
                  </div>
                </FormField>
                
                <div className="h-px bg-slate-100 w-full" />

                <FormField 
                  label="Option A: Material Grade" 
                  disabled={isCustomMode}
                >
                  <div className="grid grid-cols-3 gap-2">
                    {Object.values(QualityType).map(q => (
                      <button 
                        key={q}
                        onClick={() => handleQualityChange(q)}
                        className={`py-3 text-[10px] font-black rounded-xl border-2 transition-all ${
                          !isCustomMode && state.civil.quality === q
                            ? 'bg-sky-600 text-white border-sky-600 shadow-lg scale-105' 
                            : 'bg-white text-slate-400 border-slate-100'
                        }`}
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </FormField>

                <div className="relative py-2 flex items-center">
                  <div className="flex-grow border-t border-slate-100"></div>
                  <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase italic">OR</span>
                  <div className="flex-grow border-t border-slate-100"></div>
                </div>

                <FormField 
                  label="Option B: Custom Rate" 
                  helper="Overrides Grade Selection"
                >
                  <div className="relative">
                    <span className="absolute left-4 top-4 text-slate-400 font-black">₹</span>
                    <input 
                      type="number" 
                      placeholder="e.g. 2100"
                      value={state.civil.customRate || ''}
                      onChange={(e) => handleCustomRateChange(Number(e.target.value))}
                      className={`w-full p-4 pl-8 bg-slate-50 border-2 rounded-2xl focus:border-sky-500 outline-none font-black text-slate-900 shadow-inner transition-all ${
                        isCustomMode ? 'border-sky-400 ring-2 ring-sky-50' : 'border-slate-200'
                      }`} 
                    />
                    {isCustomMode && (
                      <button 
                        onClick={() => updateState('civil', { customRate: 0 })}
                        className="absolute right-4 top-4 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <X size={18} strokeWidth={3} />
                      </button>
                    )}
                  </div>
                </FormField>

                {!isCustomMode ? (
                   <div className="p-3 bg-sky-50 rounded-xl border border-sky-100 flex items-start gap-2">
                      <Info size={14} className="text-sky-600 mt-0.5 shrink-0" />
                      <p className="text-[10px] text-sky-800 font-bold leading-tight">
                        Calculating using <b>{state.civil.quality} Grade</b>. Entry in Custom Rate overrides this.
                      </p>
                   </div>
                ) : (
                  <div className="p-3 bg-yellow-50 rounded-xl border border-yellow-200 flex items-start gap-2">
                    <AlertCircle size={14} className="text-yellow-700 mt-0.5 shrink-0" />
                    <p className="text-[10px] text-yellow-900 font-bold leading-tight">
                      <b>Custom Rate Active</b>. Grades are disabled. Clear the field to revert.
                    </p>
                  </div>
                )}
              </div>
            )}

            <SectionCard 
              title="Painting" 
              description="Wall & Ceiling Finishes"
              icon={<Layers size={20} />} 
              active={activeSection === 'painting'}
              onClick={() => setActiveSection('painting')}
            />
            {activeSection === 'painting' && (
              <div className="p-6 bg-white rounded-2xl border-2 border-sky-200 mt-2 space-y-5 shadow-xl animate-in zoom-in-95 duration-300">
                <FormField label="Painting Area (sq.ft)">
                  <input 
                    type="number" 
                    value={state.painting.area || ''}
                    onChange={(e) => updateState('painting', { area: Number(e.target.value) })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 shadow-inner outline-none focus:border-sky-500" 
                  />
                </FormField>
              </div>
            )}

            <SectionCard 
              title="Flooring" 
              icon={<Square size={20} />} 
              description="Tile, Stone & Woodwork"
              active={activeSection === 'flooring'}
              onClick={() => setActiveSection('flooring')}
            />
            {activeSection === 'flooring' && (
              <div className="p-6 bg-white rounded-2xl border-2 border-sky-200 mt-2 space-y-6 shadow-xl animate-in zoom-in-95 duration-300">
                <FormField label="Material Choice">
                  <div className="grid grid-cols-2 gap-2">
                    {['VITRIFIED', 'MARBLE', 'GRANITE', 'WOODEN'].map(m => (
                      <button 
                        key={m}
                        onClick={() => updateState('flooring', { material: m as any })}
                        className={`py-3 text-[10px] font-black rounded-xl border-2 transition-all ${
                          state.flooring.material === m ? 'bg-sky-600 text-white border-sky-600 shadow-md' : 'bg-white text-slate-400 border-slate-100'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </FormField>
                <FormField label="Floor Surface (sq.ft)">
                  <input 
                    type="number" 
                    value={state.flooring.area || ''}
                    onChange={(e) => updateState('flooring', { area: Number(e.target.value) })}
                    className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black text-slate-900 shadow-inner outline-none focus:border-sky-500" 
                  />
                </FormField>
              </div>
            )}

            <SectionCard 
              title="Utilities" 
              description="MEP Services"
              icon={<Zap size={20} />} 
              active={activeSection === 'electrical'}
              onClick={() => setActiveSection('electrical')}
            />
            {activeSection === 'electrical' && (
              <div className="p-6 bg-white rounded-2xl border-2 border-sky-200 mt-2 space-y-5 shadow-xl animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Bathrooms">
                    <input 
                      type="number" 
                      value={state.plumbing.toilets || ''}
                      onChange={(e) => updateState('plumbing', { toilets: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black shadow-inner outline-none focus:border-sky-500" 
                    />
                  </FormField>
                  <FormField label="Kitchens">
                    <input 
                      type="number" 
                      value={state.plumbing.kitchens || ''}
                      onChange={(e) => updateState('plumbing', { kitchens: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black shadow-inner outline-none focus:border-sky-500" 
                    />
                  </FormField>
                </div>
              </div>
            )}

            <SectionCard 
              title="Doors & Windows" 
              description="Openings & Frames"
              icon={<DoorOpen size={20} />} 
              active={activeSection === 'doorsWindows'}
              onClick={() => setActiveSection('doorsWindows')}
            />
            {activeSection === 'doorsWindows' && (
              <div className="p-6 bg-white rounded-2xl border-2 border-sky-200 mt-2 space-y-5 shadow-xl animate-in zoom-in-95 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <FormField label="Total Doors">
                    <input 
                      type="number" 
                      value={state.doorsWindows.doors || ''}
                      onChange={(e) => updateState('doorsWindows', { doors: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black shadow-inner outline-none focus:border-sky-500" 
                    />
                  </FormField>
                  <FormField label="Total Windows">
                    <input 
                      type="number" 
                      value={state.doorsWindows.windows || ''}
                      onChange={(e) => updateState('doorsWindows', { windows: Number(e.target.value) })}
                      className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-2xl font-black shadow-inner outline-none focus:border-sky-500" 
                    />
                  </FormField>
                </div>
              </div>
            )}

            <div className="pt-8 pb-4">
              <button 
                onClick={() => setActiveTab('summary')}
                className="w-full bg-yellow-400 text-sky-950 p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-lg border-b-8 border-yellow-600 active:translate-y-1 active:border-b-4 transition-all"
              >
                GENERATE ESTIMATE <ArrowRight size={26} strokeWidth={4} />
              </button>
            </div>
          </div>
        )}

        {activeTab === 'summary' && (
          <div className="space-y-6 animate-in fade-in duration-700 pb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter border-l-8 border-sky-500 pl-4 uppercase">Project Review</h2>
            
            <div className="bg-white p-8 rounded-[3rem] shadow-2xl border border-sky-100 flex flex-col items-center">
              <div className="w-full h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <RePieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={105}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={200}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', fontWeight: '900', padding: '15px' }}
                    />
                  </RePieChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-2 text-center space-y-4 w-full">
                <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px]">Grand Estimation</p>
                <p className="text-5xl font-black text-sky-900 drop-shadow-md tracking-tighter">{formatCurrency(result.total)}</p>
                
                <div className="p-6 bg-yellow-50 rounded-[2rem] border-2 border-yellow-200 shadow-inner">
                  <p className="text-[11px] font-black text-sky-950 leading-relaxed uppercase tracking-tight">
                    {numberToWords(result.total)}
                  </p>
                </div>

                <div className="flex justify-center gap-2">
                  <div className="bg-sky-600 px-5 py-2.5 rounded-2xl shadow-lg border-b-4 border-sky-800">
                    <span className="text-white font-black text-xs">AVG: {formatCurrency(result.total / (state.civil.area || 1))} / sq.ft</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[2rem] border-2 border-sky-50 divide-y divide-sky-50 shadow-xl overflow-hidden">
              {chartData.map((item) => (
                <div key={item.name} className="flex items-center justify-between p-5 bg-white hover:bg-sky-50 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-5 h-5 rounded-full shadow-inner" style={{ backgroundColor: item.color }} />
                    <span className="text-slate-700 font-black text-sm uppercase tracking-wider">{item.name}</span>
                  </div>
                  <span className="text-slate-900 font-black text-base">{formatCurrency(item.value)}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 pt-6">
              <button 
                onClick={handleSaveProject}
                className="w-full bg-sky-600 text-white p-6 rounded-[2rem] font-black text-xl flex items-center justify-center gap-4 shadow-xl border-b-8 border-sky-800 active:translate-y-1 active:border-b-4 transition-all"
              >
                <Save size={24} strokeWidth={4} />
                {editingProjectId ? 'UPDATE PROJECT' : 'SAVE TO ARCHIVE'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="space-y-6 animate-in slide-in-from-right-8 duration-600">
            <h2 className="text-2xl font-black text-slate-900 tracking-tighter border-l-8 border-yellow-500 pl-4 uppercase">Archive</h2>
            
            {savedProjects.length === 0 ? (
              <div className="bg-white p-12 rounded-[3.5rem] border-4 border-dashed border-sky-100 flex flex-col items-center justify-center text-center space-y-6">
                <div className="bg-sky-50 p-6 rounded-full">
                  <FolderOpen size={64} className="text-sky-300" />
                </div>
                <div>
                  <p className="font-black text-slate-800 text-lg">NO SAVED PROJECTS</p>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Saved reports appear here.</p>
                </div>
                <button 
                  onClick={() => setActiveTab('calc')}
                  className="bg-sky-600 text-white px-8 py-4 rounded-2xl font-black text-sm uppercase shadow-xl active:scale-95 transition-all"
                >
                  Start Estimation
                </button>
              </div>
            ) : (
              <div className="grid gap-5">
                {savedProjects.map((p) => (
                  <div 
                    key={p.id}
                    onClick={() => handleLoadProject(p)}
                    className="bg-white p-6 rounded-[2.5rem] border-2 border-sky-50 shadow-lg hover:border-sky-400 hover:shadow-2xl transition-all group cursor-pointer relative"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="pr-16">
                        <h3 className="font-black text-slate-900 text-xl group-hover:text-sky-700 transition-colors line-clamp-1">{p.name}</h3>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em] mt-1">
                          {new Date(p.timestamp).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex gap-2 absolute top-6 right-6">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleExportProject(p); }}
                          className="p-3 bg-yellow-50 text-yellow-700 rounded-2xl hover:bg-yellow-100 transition-all active:scale-90"
                        >
                          <Download size={18} strokeWidth={4} />
                        </button>
                        <button 
                          onClick={(e) => handleDeleteProject(p.id, e)}
                          className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all active:scale-90"
                        >
                          <Trash2 size={18} strokeWidth={4} />
                        </button>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t-2 border-slate-50">
                      <div>
                        <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Total Value</p>
                        <p className="font-black text-sky-900 text-2xl tracking-tighter">{formatCurrency(p.total)}</p>
                      </div>
                      <div className="bg-sky-600 p-3 rounded-full shadow-lg text-white group-hover:translate-x-1 transition-transform border-b-4 border-sky-800">
                        <ArrowRight size={20} strokeWidth={4} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white border-t-4 border-slate-100 flex justify-around items-center h-24 safe-area-bottom shadow-2xl rounded-t-[3.5rem] z-50 px-8">
        <NavButton 
          active={activeTab === 'calc'} 
          icon={<Calculator size={26} />} 
          label="Estimate" 
          onClick={() => setActiveTab('calc')} 
        />
        <NavButton 
          active={activeTab === 'summary'} 
          icon={<PieChart size={26} />} 
          label="Review" 
          onClick={() => setActiveTab('summary')} 
        />
        <NavButton 
          active={activeTab === 'projects'} 
          icon={<FolderOpen size={26} />} 
          label="Archive" 
          onClick={() => setActiveTab('projects')} 
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{ active: boolean; icon: React.ReactNode; label: string; onClick: () => void }> = ({ active, icon, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex flex-col items-center gap-1.5 transition-all duration-400 relative group ${active ? 'text-sky-600 -translate-y-2' : 'text-slate-300'}`}
  >
    <div className={`p-3 rounded-2xl transition-all ${active ? 'bg-sky-50 shadow-inner ring-2 ring-sky-100' : 'group-hover:bg-slate-50'}`}>
      {React.cloneElement(icon as React.ReactElement<any>, { strokeWidth: active ? 4 : 2 })}
    </div>
    <span className={`text-[9px] font-black uppercase tracking-[0.2em] transition-all ${active ? 'opacity-100 scale-110 text-sky-700' : 'opacity-60 text-slate-400'}`}>{label}</span>
    {active && <div className="absolute -bottom-4 w-10 h-2 bg-yellow-400 rounded-full shadow-[0_4px_10px_rgba(234,179,8,0.5)] animate-pulse" />}
  </button>
);

export default App;
