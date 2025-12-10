
import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, 
  MessageCircle, 
  Footprints, 
  Send, 
  Sparkles, 
  Save, 
  Copy,
  ChevronRight,
  ChevronLeft,
  Plus,
  Trash2,
  User,
  Download,
  Upload,
  Calendar,
  AlertTriangle,
  FileText,
  Key,
  ExternalLink,
  Settings,
  X,
  RotateCcw
} from 'lucide-react';
import { SessionData, TabView, LabelConfig } from './types';
import { generateSessionSummary, generateBriefSummary } from './services/geminiService';
import { TextArea } from './components/TextArea';
import { QuestionBank } from './components/QuestionBank';

const INITIAL_DATA: SessionData = {
  coacheeName: '',
  date: new Date().toISOString().split('T')[0],
  profile: {
    iamStatements: '',
    vision: '',
    pastMeetings: '',
    meetingHistory: []
  },
  engage: {
    goodnessOfGod: '',
    wins: '',
    improvements: '',
    nextStepForward: '',
    learning: ''
  },
  explore: {
    foundationIams: '',
    conversationNotes: ''
  },
  express: {
    nextStepsThinking: '',
    firstSteps: '',
    stickToIt: '',
    whenWillYouDoThis: '',
    obstacles: '',
    whoToTell: '',
    visualCue: '',
    importance: '',
    sacrifices: '',
    actionSteps: ['', '', ''],
    encouragement: ''
  },
  extend: {
    keyInsight: '',
    prayerPoint: '',
    nextMeeting: ''
  }
};

const DEFAULT_LABELS: LabelConfig = {
  engage: {
    goodnessOfGod: "Where have you seen the goodness of God lately?",
    wins: "What wins have you noticed?",
    learning: "What are you learning?",
    improvements: "What could you improve?",
    nextStepForward: "What's the next step forward?"
  },
  express: {
    nextStepsThinking: "What do you think are your next steps?",
    firstSteps: "Tell me your very first step?",
    importance: "Why is this important?",
    whenWillYouDoThis: "When will you do this?",
    obstacles: "What stops you? (Obstacles & Plan)",
    whoToTell: "Accountability: Who can you tell?",
    sacrifices: "Consequences / Sacrifices (Saying No)",
    stickToIt: "What is your worst day plan?",
    visualCue: "Helpful reminders (visual? automated?)",
    encouragement: "Encouragement & Coach Input"
  }
};

// --- Extracted Components (Fixes focus loss issue) ---

const NavButton = ({ 
  tab, 
  activeTab, 
  onClick, 
  icon: Icon, 
  label 
}: { 
  tab: TabView, 
  activeTab: TabView, 
  onClick: (t: TabView) => void, 
  icon: any, 
  label: string 
}) => (
  <button
    onClick={() => onClick(tab)}
    className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 flex-grow md:flex-grow-0
      ${activeTab === tab 
        ? 'bg-blue-600 text-white shadow-md' 
        : 'bg-white text-slate-600 hover:bg-slate-100'}`}
  >
    <Icon size={18} />
    <span className="font-medium whitespace-nowrap">{label}</span>
  </button>
);

interface LabelSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  labels: LabelConfig;
  settingsTab: 'engage' | 'express';
  setSettingsTab: (tab: 'engage' | 'express') => void;
  handleLabelUpdate: (section: 'engage' | 'express', field: string, value: string) => void;
  resetLabels: (section: 'engage' | 'express') => void;
}

const LabelSettingsModal: React.FC<LabelSettingsModalProps> = ({
  isOpen,
  onClose,
  labels,
  settingsTab,
  setSettingsTab,
  handleLabelUpdate,
  resetLabels
}) => {
  if (!isOpen) return null;

  const currentSection = settingsTab === 'engage' ? labels.engage : labels.express;
  
  const formatKey = (key: string) => {
    return key
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center sticky top-0 bg-white rounded-t-xl z-10">
          <h3 className="text-xl font-bold text-slate-800 flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Customize Questions
          </h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex space-x-2 border-b border-slate-200 pb-2">
            <button 
              onClick={() => setSettingsTab('engage')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${settingsTab === 'engage' ? 'bg-blue-100 text-blue-700 border-b-2 border-blue-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Engage
            </button>
            <button 
              onClick={() => setSettingsTab('express')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${settingsTab === 'express' ? 'bg-green-100 text-green-700 border-b-2 border-green-600' : 'text-slate-500 hover:bg-slate-50'}`}
            >
              Express
            </button>
          </div>

          <div className="space-y-6">
            {Object.entries(currentSection).map(([key, value]) => (
              <div key={key} className="bg-slate-50 p-4 rounded-lg border border-slate-200 shadow-sm">
                <label className="block text-sm font-bold text-slate-800 mb-2">
                  {formatKey(key)}
                </label>
                <textarea 
                  value={value}
                  onChange={(e) => handleLabelUpdate(settingsTab, key, e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-slate-800 text-base shadow-sm"
                  rows={2}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 bg-slate-50 rounded-b-xl flex justify-between items-center">
            <button 
            onClick={() => resetLabels(settingsTab)}
            className="flex items-center text-red-600 hover:text-red-700 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-2" /> Reset Defaults
          </button>
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-sm"
          >
            Save & Close
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [data, setData] = useState<SessionData>(() => {
    const saved = localStorage.getItem('coachingSession');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        
        // Migration: Ensure profile exists
        if (!parsed.profile) {
          parsed.profile = { iamStatements: '', vision: '', pastMeetings: '', meetingHistory: [] };
        }
        
        // Migration: clientName -> coacheeName
        if (parsed.clientName && !parsed.coacheeName) {
            parsed.coacheeName = parsed.clientName;
        }
        
        // Migration: Ensure meetingHistory exists
        if (!parsed.profile.meetingHistory) {
          parsed.profile.meetingHistory = [];
        }

        // Migration: Ensure nextStepsThinking exists
        if (parsed.express.nextStepsThinking === undefined) {
          parsed.express.nextStepsThinking = '';
        }

        // Migration: Ensure actionSteps array exists
        if (!parsed.express.actionSteps) {
          parsed.express.actionSteps = [
            parsed.express.step1 || '',
            parsed.express.step2 || '',
            parsed.express.step3 || ''
          ].filter((s: string) => s !== '');
          
          if (parsed.express.actionSteps.length === 0) {
            parsed.express.actionSteps = ['', '', ''];
          }
        }
        
        // Migration: Ensure encouragement exists
        if (parsed.express.encouragement === undefined) {
          parsed.express.encouragement = '';
        }

        return parsed;
      } catch (e) {
        console.error("Error parsing saved session", e);
        return INITIAL_DATA;
      }
    }
    return INITIAL_DATA;
  });

  const [labels, setLabels] = useState<LabelConfig>(() => {
    const savedLabels = localStorage.getItem('coachingLabels');
    if (savedLabels) {
      try {
        const parsed = JSON.parse(savedLabels);
        // Merge with defaults to ensure all keys exist if schema changes
        return {
          engage: { ...DEFAULT_LABELS.engage, ...parsed.engage },
          express: { ...DEFAULT_LABELS.express, ...parsed.express }
        };
      } catch (e) {
        return DEFAULT_LABELS;
      }
    }
    return DEFAULT_LABELS;
  });

  const [activeTab, setActiveTab] = useState<TabView>(TabView.PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini_api_key') || '');
  const [coachEmail, setCoachEmail] = useState(() => localStorage.getItem('coach_email') || '');
  
  // Settings Modal State
  const [showLabelSettings, setShowLabelSettings] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'engage' | 'express'>('engage');

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    localStorage.setItem('coachingSession', JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    localStorage.setItem('coachingLabels', JSON.stringify(labels));
  }, [labels]);

  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('gemini_api_key', apiKey.trim());
    }
  }, [apiKey]);

  useEffect(() => {
    localStorage.setItem('coach_email', coachEmail.trim());
  }, [coachEmail]);

  // Sync Profile Vision & I AMs to Explore tab automatically
  useEffect(() => {
    const profileText = [
      data.profile.iamStatements ? `I AM Statements:\n${data.profile.iamStatements}` : '',
      data.profile.vision ? `Vision:\n${data.profile.vision}` : ''
    ].filter(Boolean).join('\n\n');

    if (profileText && data.explore.foundationIams !== profileText) {
      setData(prev => ({
        ...prev,
        explore: {
          ...prev.explore,
          foundationIams: profileText
        }
      }));
    }
  }, [data.profile.iamStatements, data.profile.vision]);

  const handleClear = () => {
    if (confirm("Are you sure you want to start a new session? This will clear current notes.")) {
      setData(INITIAL_DATA);
      setGeneratedSummary('');
      setActiveTab(TabView.PROFILE);
    }
  };

  const handleDownloadSummary = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedSummary], {type: 'text/plain'});
    element.href = URL.createObjectURL(file);
    element.download = `${data.coacheeName || 'Coachee'}_Session_Summary_${data.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleDownloadFullNotes = () => {
    const lines: string[] = [];
    lines.push(`COACHING SESSION NOTES`);
    lines.push(`Coachee: ${data.coacheeName}`);
    lines.push(`Date: ${data.date}`);
    lines.push('========================================');

    lines.push('\n[PROFILE]');
    lines.push(`I AM Statements:\n${data.profile.iamStatements || 'N/A'}`);
    lines.push(`Vision:\n${data.profile.vision || 'N/A'}`);

    lines.push('\n[ENGAGE]');
    lines.push(`${labels.engage.goodnessOfGod}\n${data.engage.goodnessOfGod || 'N/A'}`);
    lines.push(`${labels.engage.wins}\n${data.engage.wins || 'N/A'}`);
    lines.push(`${labels.engage.learning}\n${data.engage.learning || 'N/A'}`);
    lines.push(`${labels.engage.improvements}\n${data.engage.improvements || 'N/A'}`);
    lines.push(`${labels.engage.nextStepForward}\n${data.engage.nextStepForward || 'N/A'}`);

    lines.push('\n[EXPLORE]');
    lines.push(`Conversation Notes:\n${data.explore.conversationNotes || 'N/A'}`);

    lines.push('\n[EXPRESS]');
    lines.push(`${labels.express.nextStepsThinking}\n${data.express.nextStepsThinking || 'N/A'}`);
    lines.push(`${labels.express.firstSteps}\n${data.express.firstSteps || 'N/A'}`);
    lines.push(`${labels.express.importance}\n${data.express.importance || 'N/A'}`);
    lines.push(`${labels.express.whenWillYouDoThis}\n${data.express.whenWillYouDoThis || 'N/A'}`);
    lines.push(`${labels.express.obstacles}\n${data.express.obstacles || 'N/A'}`);
    lines.push(`${labels.express.whoToTell}\n${data.express.whoToTell || 'N/A'}`);
    lines.push(`${labels.express.sacrifices}\n${data.express.sacrifices || 'N/A'}`);
    
    lines.push(`${labels.express.stickToIt}\n${data.express.stickToIt || 'N/A'}`);
    lines.push(`${labels.express.visualCue}\n${data.express.visualCue || 'N/A'}`);
    lines.push(`${labels.express.encouragement}\n${data.express.encouragement || 'N/A'}`);
    
    lines.push('\nAction Plan:');
    if (data.express.actionSteps.some(s => s.trim())) {
      data.express.actionSteps.forEach((step, i) => {
          if(step.trim()) lines.push(`${i+1}. ${step}`);
      });
    } else {
      lines.push('N/A');
    }

    lines.push('\n[EXTEND]');
    lines.push(`Key Insight:\n${data.extend.keyInsight || 'N/A'}`);
    lines.push(`Prayer Point:\n${data.extend.prayerPoint || 'N/A'}`);
    lines.push(`Next Meeting:\n${data.extend.nextMeeting || 'N/A'}`);

    const blob = new Blob([lines.join('\n\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${data.coacheeName || 'Session'}_FullNotes_${data.date}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateSummary = async () => {
    if (!apiKey) {
      alert("Please enter your Google API Key in the Extend tab to generate a summary.");
      return;
    }
    setIsGenerating(true);
    setGeneratedSummary("Generating summary... please wait.");
    const summary = await generateSessionSummary(data, apiKey);
    setGeneratedSummary(summary);
    setIsGenerating(false);
    setActiveTab(TabView.SUMMARY);
  };

  // --- Google Calendar Link Generator ---
  const getGoogleCalendarUrl = () => {
    const baseUrl = "https://calendar.google.com/calendar/render?action=TEMPLATE";
    const title = encodeURIComponent(`Coaching: ${data.coacheeName || 'Session'}`);
    // Truncate details if too long to avoid URL limit issues
    const safeSummary = generatedSummary.length > 800 ? generatedSummary.substring(0, 800) + "..." : generatedSummary;
    const details = encodeURIComponent(safeSummary || "Notes from coaching session.");
    
    let datesParam = "";
    if (data.extend.nextMeeting) {
      // datetime-local gives YYYY-MM-DDTHH:mm
      // Create date object, assuming local time as selected by user
      const startDate = new Date(data.extend.nextMeeting);
      const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default 1 hour duration
      
      // Format to YYYYMMDDTHHmmSSZ (UTC) for Google Calendar
      const format = (d: Date) => d.toISOString().replace(/-|:|\.\d\d\d/g, "");
      datesParam = `&dates=${format(startDate)}/${format(endDate)}`;
    }
    
    return `${baseUrl}&text=${title}&details=${details}${datesParam}`;
  };

  // --- Profile File Management ---

  const handleDownloadProfile = async () => {
    setIsGenerating(true);
    
    // 1. Generate summary for THIS session if there is data
    let currentSessionSummary = null;
    const hasData = data.engage.wins || data.explore.conversationNotes || data.extend.keyInsight;
    
    if (hasData) {
      const summaryText = await generateBriefSummary(data, apiKey);
      
      // Filter empty steps
      const activeSteps = data.express.actionSteps.filter(s => s.trim().length > 0);
      
      // Combine summary (<30 words) and Action Steps for the history record
      const historyContent = activeSteps.length > 0
        ? `${summaryText}\n\nActions:\n• ${activeSteps.join('\n• ')}`
        : summaryText;

      currentSessionSummary = {
        date: data.date,
        summary: historyContent
      };
    }

    // 2. Prepare export object
    // If we have a current session summary, add it to the history for the file download
    const exportHistory = currentSessionSummary 
      ? [...data.profile.meetingHistory, currentSessionSummary]
      : data.profile.meetingHistory;

    const exportData = {
      coacheeName: data.coacheeName,
      profile: {
        iamStatements: data.profile.iamStatements,
        vision: data.profile.vision,
        pastMeetings: data.profile.pastMeetings,
        meetingHistory: exportHistory
      }
    };

    // 3. Download JSON
    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    element.href = URL.createObjectURL(file);
    element.download = `${data.coacheeName || 'Coachee'}_Profile_${data.date}.json`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    setIsGenerating(false);
  };

  const handleUploadProfile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        
        // Validate structure roughly
        if (json.profile) {
          setData(prev => ({
            ...prev,
            coacheeName: json.coacheeName || json.clientName || prev.coacheeName,
            profile: {
              ...prev.profile,
              iamStatements: json.profile.iamStatements || '',
              vision: json.profile.vision || '',
              pastMeetings: json.profile.pastMeetings || '',
              meetingHistory: Array.isArray(json.profile.meetingHistory) ? json.profile.meetingHistory : []
            }
          }));
          alert("Profile loaded successfully!");
        } else {
          alert("Invalid file format: Missing profile section.");
        }
      } catch (err) {
        console.error(err);
        alert("Error reading file. Please upload a valid JSON profile.");
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again if needed
    event.target.value = '';
  };

  // --- Section Updates ---

  const updateSection = (section: keyof SessionData, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
    }));
  };

  const updateActionStep = (index: number, value: string) => {
    const newSteps = [...data.express.actionSteps];
    newSteps[index] = value;
    setData(prev => ({
      ...prev,
      express: {
        ...prev.express,
        actionSteps: newSteps
      }
    }));
  };

  const addActionStep = () => {
    setData(prev => ({
      ...prev,
      express: {
        ...prev.express,
        actionSteps: [...prev.express.actionSteps, '']
      }
    }));
  };

  const removeActionStep = (index: number) => {
    const newSteps = data.express.actionSteps.filter((_, i) => i !== index);
    setData(prev => ({
      ...prev,
      express: {
        ...prev.express,
        actionSteps: newSteps
      }
    }));
  };

  const handleLabelUpdate = (section: 'engage' | 'express', field: string, value: string) => {
    setLabels(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const resetLabels = (section: 'engage' | 'express') => {
    if (confirm("Reset these questions to default?")) {
      setLabels(prev => ({
        ...prev,
        [section]: DEFAULT_LABELS[section]
      }));
    }
  };

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <LabelSettingsModal 
        isOpen={showLabelSettings}
        onClose={() => setShowLabelSettings(false)}
        labels={labels}
        settingsTab={settingsTab}
        setSettingsTab={setSettingsTab}
        handleLabelUpdate={handleLabelUpdate}
        resetLabels={resetLabels}
      />

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-2 rounded-md">
              <BookOpen className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">Coaching Companion</h1>
              <p className="text-xs text-slate-500 hidden sm:block">4E Framework Note Taker</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
             <div className="hidden md:flex space-x-2">
              <input 
                type="text" 
                placeholder="Coachee Name" 
                className="bg-white text-slate-900 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400 shadow-sm"
                value={data.coacheeName}
                onChange={(e) => setData({...data, coacheeName: e.target.value})}
              />
               <input 
                type="date" 
                className="bg-white text-slate-900 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none shadow-sm"
                value={data.date}
                onChange={(e) => setData({...data, date: e.target.value})}
              />
             </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        
        {/* Navigation Tabs (Mobile optimised: wrapping) */}
        <div className="flex flex-wrap gap-2 mb-6">
          <NavButton tab={TabView.PROFILE} activeTab={activeTab} onClick={setActiveTab} icon={User} label="Profile" />
          <NavButton tab={TabView.ENGAGE} activeTab={activeTab} onClick={setActiveTab} icon={MessageCircle} label="Engage" />
          <NavButton tab={TabView.EXPLORE} activeTab={activeTab} onClick={setActiveTab} icon={BookOpen} label="Explore" />
          <NavButton tab={TabView.EXPRESS} activeTab={activeTab} onClick={setActiveTab} icon={Footprints} label="Express" />
          <NavButton tab={TabView.EXTEND} activeTab={activeTab} onClick={setActiveTab} icon={Send} label="Extend" />
          <NavButton tab={TabView.SUMMARY} activeTab={activeTab} onClick={setActiveTab} icon={Save} label="Summary" />
        </div>

        {/* Content Containers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden">
          
          {/* Tab: PROFILE */}
          {activeTab === TabView.PROFILE && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <User className="w-6 h-6 mr-3 text-slate-500" />
                  Coachee Profile
                </h2>
                
                <div className="flex space-x-3">
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    className="hidden" 
                    accept=".json" 
                    onChange={handleUploadProfile}
                  />
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium border border-slate-200"
                  >
                    <Upload className="w-4 h-4 mr-2" /> Upload Profile
                  </button>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 flex-grow">
                 <div className="md:col-span-2">
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Coachee Name</label>
                   <input 
                      type="text" 
                      placeholder="Enter Coachee Name" 
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-slate-700 mb-4"
                      value={data.coacheeName}
                      onChange={(e) => setData({...data, coacheeName: e.target.value})}
                    />
                 </div>
                
                <TextArea 
                  label="I AM Statements" 
                  placeholder="e.g. I am a child of God..."
                  value={data.profile.iamStatements}
                  onChange={(v) => updateSection('profile', 'iamStatements', v)}
                  rows={4}
                />
                
                <TextArea 
                  label="Vision" 
                  placeholder="Long term vision statement..."
                  value={data.profile.vision}
                  onChange={(v) => updateSection('profile', 'vision', v)}
                  rows={4}
                />
                
                {/* Meeting History Section */}
                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 flex items-center">
                    <Calendar className="w-4 h-4 mr-2 text-slate-500" />
                    Previous Meetings History
                  </h3>
                  
                  {data.profile.meetingHistory.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-sm">
                      No previous meetings recorded. Upload a profile file or complete a session to see history here.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                      {data.profile.meetingHistory.map((meeting, idx) => (
                        <div key={idx} className="bg-white p-3 rounded-lg shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
                          <div className="text-xs font-semibold text-blue-600 mb-1">{meeting.date}</div>
                          <p className="text-slate-600 text-sm leading-snug whitespace-pre-line" title={meeting.summary}>
                            {meeting.summary}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Fallback/Legacy Notes Area */}
                  <div className="mt-4">
                    <button 
                      onClick={() => {
                        const el = document.getElementById('legacy-notes');
                        if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
                      }}
                      className="text-xs text-slate-400 hover:text-slate-600 underline"
                    >
                      Toggle Legacy/General Notes
                    </button>
                    <div id="legacy-notes" style={{display: data.profile.pastMeetings ? 'block' : 'none'}}>
                      <TextArea 
                        label=""
                        placeholder="General notes or context..."
                        value={data.profile.pastMeetings}
                        onChange={(v) => updateSection('profile', 'pastMeetings', v)}
                        rows={3}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={() => setActiveTab(TabView.ENGAGE)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Go to Engage <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Tab: ENGAGE */}
          {activeTab === TabView.ENGAGE && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <MessageCircle className="w-6 h-6 mr-3 text-blue-500" />
                  Engage: Connection & Review
                </h2>
                <button 
                  onClick={() => { setSettingsTab('engage'); setShowLabelSettings(true); }}
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                  title="Customize Questions"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 flex-grow">
                <div className="md:col-span-2">
                  <TextArea 
                    label={labels.engage.goodnessOfGod}
                    value={data.engage.goodnessOfGod}
                    onChange={(v) => updateSection('engage', 'goodnessOfGod', v)}
                    className="mb-0"
                  />
                </div>
                <TextArea 
                  label={labels.engage.wins}
                  value={data.engage.wins}
                  onChange={(v) => updateSection('engage', 'wins', v)}
                />
                 <TextArea 
                  label={labels.engage.learning}
                  value={data.engage.learning}
                  onChange={(v) => updateSection('engage', 'learning', v)}
                />
                <TextArea 
                  label={labels.engage.improvements}
                  value={data.engage.improvements}
                  onChange={(v) => updateSection('engage', 'improvements', v)}
                />
                <TextArea 
                  label={labels.engage.nextStepForward}
                  value={data.engage.nextStepForward}
                  onChange={(v) => updateSection('engage', 'nextStepForward', v)}
                />
              </div>
              <div className="mt-8 flex justify-between">
                 <button 
                  onClick={() => setActiveTab(TabView.PROFILE)} 
                  className="flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2"/> Back
                </button>
                <button 
                  onClick={() => setActiveTab(TabView.EXPLORE)}
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Go to Explore <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </div>
          )}

          {/* Tab: EXPLORE */}
          {activeTab === TabView.EXPLORE && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <BookOpen className="w-6 h-6 mr-3 text-purple-500" />
                  Explore: Deep Dive
                </h2>
              </div>

              {/* Top Section: Vision & I AMs (Read-only reference) */}
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                 <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                   <h3 className="text-sm font-semibold text-purple-900 mb-2">Vision</h3>
                   <div className="text-sm text-slate-700 whitespace-pre-wrap">
                     {data.profile.vision || <span className="text-slate-400 italic">No vision defined in Profile.</span>}
                   </div>
                 </div>
                 <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                   <h3 className="text-sm font-semibold text-purple-900 mb-2">I AM Statements</h3>
                   <div className="text-sm text-slate-700 whitespace-pre-wrap">
                     {data.profile.iamStatements || <span className="text-slate-400 italic">No I AM statements defined in Profile.</span>}
                   </div>
                 </div>
              </div>

              <div className="grid md:grid-cols-3 gap-8 flex-grow">
                {/* Left Column: Toolkit */}
                <div className="md:col-span-1 space-y-4">
                  <div className="bg-slate-100 p-4 rounded-lg">
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Tips</h3>
                    
                    <QuestionBank 
                      title="Direction Questions" 
                      questions={[
                        "What's on your mind?",
                        "What's the real challenge in that for you?",
                        "What do you mean by ____?",
                        "What about that is important to you?",
                        "What do you want? (Positive 'I want...')",
                        "What would achieving that do for you/others?",
                        "What's the bigger issue behind the situation?",
                        "What result would you like to take away?",
                        "What part of that problem would you like to work on right now?"
                      ]} 
                    />
                    
                    <QuestionBank 
                      title="If they have nothing..." 
                      questions={[
                        "Tell me about your personal vision statement.",
                        "What do you feel reading that out?",
                        "Where do you see God transforming you?",
                        "What are barriers keeping you from this life?",
                        "What practices/relationships could help overcome these?"
                      ]} 
                    />
                  </div>
                </div>

                {/* Right Column: Main Notes */}
                <div className="md:col-span-2">
                  <TextArea 
                    label="Conversation Notes" 
                    subLabel="Capture the key dialogue, answers to the questions, and observations."
                    placeholder="Start typing your notes here..."
                    value={data.explore.conversationNotes}
                    onChange={(v) => updateSection('explore', 'conversationNotes', v)}
                    rows={20}
                    className="h-full"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setActiveTab(TabView.ENGAGE)} 
                  className="flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2"/> Back
                </button>
                <button 
                  onClick={() => setActiveTab(TabView.EXPRESS)} 
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Go to Express <ChevronRight className="w-5 h-5 ml-2"/>
                </button>
              </div>
            </div>
          )}

          {/* Tab: EXPRESS */}
          {activeTab === TabView.EXPRESS && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
               <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Footprints className="w-6 h-6 mr-3 text-green-500" />
                  Express: Action Planning
                </h2>
                <button 
                  onClick={() => { setSettingsTab('express'); setShowLabelSettings(true); }}
                  className="p-2 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-colors"
                  title="Customize Questions"
                >
                  <Settings className="w-5 h-5" />
                </button>
              </div>

              {/* Top Box: Next Steps Thinking */}
              <div className="mb-8">
                 <TextArea 
                  label={labels.express.nextStepsThinking}
                  placeholder="Brainstorming next steps..."
                  value={data.express.nextStepsThinking}
                  onChange={(v) => updateSection('express', 'nextStepsThinking', v)}
                  rows={4}
                  className="w-full"
                />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                 <TextArea 
                  label={labels.express.firstSteps}
                  placeholder="Immediate action after this call"
                  value={data.express.firstSteps}
                  onChange={(v) => updateSection('express', 'firstSteps', v)}
                />
                 <TextArea 
                  label={labels.express.importance}
                  value={data.express.importance}
                  onChange={(v) => updateSection('express', 'importance', v)}
                />
                <TextArea 
                  label={labels.express.whenWillYouDoThis}
                  value={data.express.whenWillYouDoThis}
                  onChange={(v) => updateSection('express', 'whenWillYouDoThis', v)}
                />
                 <TextArea 
                  label={labels.express.obstacles}
                  placeholder="Obstacles / Plan to overcome"
                  value={data.express.obstacles}
                  onChange={(v) => updateSection('express', 'obstacles', v)}
                />
                 <TextArea 
                  label={labels.express.whoToTell}
                  value={data.express.whoToTell}
                  onChange={(v) => updateSection('express', 'whoToTell', v)}
                />
                 <TextArea 
                  label={labels.express.sacrifices}
                  value={data.express.sacrifices}
                  onChange={(v) => updateSection('express', 'sacrifices', v)}
                />
                <TextArea 
                  label={labels.express.stickToIt}
                  value={data.express.stickToIt}
                  onChange={(v) => updateSection('express', 'stickToIt', v)}
                />
                 <TextArea 
                  label={labels.express.visualCue}
                  value={data.express.visualCue}
                  onChange={(v) => updateSection('express', 'visualCue', v)}
                />
              </div>

              {/* Flexible Plan Section */}
              <div className="bg-green-50 p-6 rounded-lg border border-green-100 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-green-900">The Plan</h3>
                </div>
                <div className="space-y-4">
                  {data.express.actionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start group">
                      <span className="bg-green-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-3 mt-2 shrink-0">
                        {idx + 1}
                      </span>
                      <div className="w-full flex items-center gap-2">
                        <input 
                          type="text"
                          placeholder={`Action Step ${idx + 1}`}
                          className="w-full px-4 py-2 bg-white text-slate-900 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none placeholder-slate-400"
                          value={step}
                          onChange={(e) => updateActionStep(idx, e.target.value)}
                        />
                         <button 
                            onClick={() => removeActionStep(idx)}
                            className="text-slate-400 hover:text-red-600 p-2 hover:bg-red-50 rounded transition-colors"
                            title="Remove step"
                          >
                            <Trash2 size={18} />
                          </button>
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={addActionStep}
                    className="flex items-center text-sm font-medium text-green-700 hover:text-green-900 mt-2 px-3 py-2 rounded hover:bg-green-100 transition-colors"
                  >
                    <Plus size={18} className="mr-1" /> Add Action Step
                  </button>
                </div>
                
                {/* Encouragement Box */}
                <div className="mt-6 border-t border-green-200 pt-6">
                   <TextArea 
                    label={labels.express.encouragement}
                    placeholder="Write a note of encouragement for the coachee..."
                    value={data.express.encouragement}
                    onChange={(v) => updateSection('express', 'encouragement', v)}
                    className="mb-0"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-between">
                <button 
                  onClick={() => setActiveTab(TabView.EXPLORE)} 
                  className="flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2"/> Back
                </button>
                <button 
                  onClick={() => setActiveTab(TabView.EXTEND)} 
                  className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-sm"
                >
                  Go to Extend <ChevronRight className="w-5 h-5 ml-2"/>
                </button>
              </div>
            </div>
          )}

          {/* Tab: EXTEND */}
          {activeTab === TabView.EXTEND && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200">
               <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Send className="w-6 h-6 mr-3 text-orange-500" />
                Extend: Conclusion
              </h2>
              
              <div className="max-w-2xl mx-auto space-y-8">
                 <TextArea 
                  label="What is your key insight from today?" 
                  value={data.extend.keyInsight}
                  onChange={(v) => updateSection('extend', 'keyInsight', v)}
                  rows={4}
                  className="text-lg"
                />
                 <TextArea 
                  label="What is your prayer point?" 
                  value={data.extend.prayerPoint}
                  onChange={(v) => updateSection('extend', 'prayerPoint', v)}
                  rows={4}
                />
                
                {/* Calendar Section (Moved from Summary) */}
                <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden mb-6">
                   <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                     <h3 className="text-sm font-semibold text-slate-700 flex items-center">
                       <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                       Check Availability
                     </h3>
                      <div className="relative group">
                         <input 
                          type="email"
                          placeholder="your.email@gmail.com"
                          className="text-xs bg-white border border-slate-300 rounded px-2 py-1 w-48 focus:ring-1 focus:ring-indigo-500 outline-none"
                          value={coachEmail}
                          onChange={(e) => setCoachEmail(e.target.value)}
                          title="Enter your Google email to see your specific calendar"
                         />
                         <div className="hidden group-hover:block absolute top-full right-0 mt-1 w-64 bg-slate-800 text-white text-xs p-2 rounded z-10 shadow-lg">
                           Enter your email to display your public/private calendar. If it shows 'Events', you may need to log in to Google in this browser.
                         </div>
                      </div>
                   </div>
                   <iframe 
                     src={`https://calendar.google.com/calendar/embed?height=400&wkst=1&bgcolor=%23ffffff&ctz=Europe%2FLondon&src=${encodeURIComponent(coachEmail || 'en.uk#holiday@group.v.calendar.google.com')}&color=%23039BE5`} 
                     style={{borderWidth: 0}} 
                     width="100%" 
                     height="400" 
                     frameBorder="0" 
                     scrolling="no"
                     title="Google Calendar"
                   ></iframe>
                 </div>

                <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 flex flex-col md:flex-row md:items-end gap-4 justify-between">
                   <div className="flex-grow">
                     <label className="block text-sm font-semibold text-orange-900 mb-1">When are we meeting next?</label>
                     <input 
                      type="datetime-local" 
                      className="w-full bg-white border border-orange-200 rounded px-3 py-2 text-slate-700 focus:ring-2 focus:ring-orange-400 outline-none"
                      value={data.extend.nextMeeting}
                      onChange={(e) => updateSection('extend', 'nextMeeting', e.target.value)}
                     />
                   </div>
                   
                   <div className="flex-grow">
                     <label className="block text-sm font-semibold text-orange-900 mb-1">Google API Key</label>
                     <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Key className="h-4 w-4 text-orange-400" />
                        </div>
                        <input 
                          type="password" 
                          placeholder="Paste API Key (starts with AIza...)"
                          className="w-full bg-white border border-orange-200 rounded px-3 py-2 pl-9 text-slate-700 focus:ring-2 focus:ring-orange-400 outline-none"
                          value={apiKey}
                          onChange={(e) => setApiKey(e.target.value)}
                        />
                     </div>
                   </div>

                   <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="flex items-center justify-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed whitespace-nowrap h-11"
                   >
                     <Sparkles className="w-4 h-4" />
                     <span>Finish & Summarise</span>
                   </button>
                </div>
              </div>
               <div className="mt-8 flex justify-start">
                <button 
                  onClick={() => setActiveTab(TabView.EXPRESS)} 
                  className="flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2"/> Back
                </button>
              </div>
            </div>
          )}

          {/* Tab: SUMMARY */}
          {activeTab === TabView.SUMMARY && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 h-full flex flex-col">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <Sparkles className="w-6 h-6 mr-3 text-indigo-600" />
                  Session Summary
                </h2>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={handleDownloadFullNotes}
                    className="flex items-center px-4 py-2 bg-slate-100 text-slate-700 border border-slate-200 rounded-lg hover:bg-slate-200 transition-colors text-sm font-medium shadow-sm"
                  >
                     <FileText className="w-4 h-4 mr-2" /> 
                     Download Full Notes
                  </button>
                  <button 
                    onClick={handleDownloadProfile}
                    disabled={isGenerating}
                    className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md"
                  >
                     <Download className="w-4 h-4 mr-2" /> 
                     {isGenerating ? "Saving..." : "Save Profile & History (JSON)"}
                  </button>
                </div>
              </div>
              <p className="text-slate-500 mb-4">Generated by Gemini. Review before sending.</p>
              
              <div className="flex-grow relative">
                <textarea 
                  className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  value={generatedSummary}
                  onChange={(e) => setGeneratedSummary(e.target.value)}
                  style={{ minHeight: '500px' }}
                />
                <div className="absolute top-4 right-4 flex space-x-2">
                  <button 
                    onClick={handleDownloadSummary}
                    className="bg-white p-2 rounded-md shadow-sm border border-slate-200 text-slate-500 hover:text-green-600 hover:border-green-300 transition-colors"
                    title="Download as Text File"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={() => {
                      navigator.clipboard.writeText(generatedSummary);
                      alert("Copied to clipboard!");
                    }}
                    className="bg-white p-2 rounded-md shadow-sm border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-300 transition-colors"
                    title="Copy to Clipboard"
                  >
                    <Copy className="w-5 h-5" />
                  </button>
                </div>
              </div>

               {/* Schedule Next Session Section (Reverted to single row/button style) */}
               <div className="mt-6">
                 <div className="p-6 bg-indigo-50 border border-indigo-100 rounded-lg flex flex-col md:flex-row items-center justify-between">
                   <div className="mb-4 md:mb-0">
                     <h3 className="text-indigo-900 font-bold text-lg flex items-center mb-1">
                       <Calendar className="w-5 h-5 mr-2" />
                       Schedule Next Session
                     </h3>
                     <p className="text-sm text-indigo-700">
                       Target Date: <span className="font-semibold">{data.extend.nextMeeting 
                         ? new Date(data.extend.nextMeeting).toLocaleString() 
                         : "Not selected (Set in Extend tab)"}</span>
                     </p>
                   </div>
                   
                   <a
                     href={getGoogleCalendarUrl()}
                     target="_blank"
                     rel="noopener noreferrer"
                     className="flex items-center justify-center px-6 py-3 bg-white text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-600 hover:text-white transition-colors font-bold shadow-sm"
                   >
                     <ExternalLink className="w-5 h-5 mr-2" />
                     Create Event on Google Calendar
                   </a>
                 </div>
               </div>
              
               <div className="mt-6 flex justify-between">
                <button 
                  onClick={() => setActiveTab(TabView.EXTEND)} 
                  className="flex items-center px-6 py-3 bg-white border border-slate-300 text-slate-700 rounded-lg font-semibold hover:bg-slate-50 transition-colors shadow-sm"
                >
                  <ChevronLeft className="w-5 h-5 mr-2"/> Back to Edit
                </button>
                <button 
                  onClick={handleClear} 
                  className="flex items-center px-6 py-3 bg-red-50 text-red-600 border border-red-200 rounded-lg font-semibold hover:bg-red-100 transition-colors shadow-sm"
                >
                  Start New Session
                </button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default App;
