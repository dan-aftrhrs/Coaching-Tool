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
  FileJson
} from 'lucide-react';
import { SessionData, TabView } from './types';
import { generateSessionSummary, generateBriefSummary } from './services/geminiService';
import { TextArea } from './components/TextArea';
import { QuestionBank } from './components/QuestionBank';

const INITIAL_DATA: SessionData = {
  clientName: '',
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
        
        // Migration: Ensure meetingHistory exists
        if (!parsed.profile.meetingHistory) {
          parsed.profile.meetingHistory = [];
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

  const [activeTab, setActiveTab] = useState<TabView>(TabView.PROFILE);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedSummary, setGeneratedSummary] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // API Key Check State
  const [isApiKeySet, setIsApiKeySet] = useState<boolean>(false);

  useEffect(() => {
    const checkApiKey = async () => {
      if ('aistudio' in window) {
        const hasKey = await (window as any).aistudio.hasSelectedApiKey();
        setIsApiKeySet(hasKey);
      } else {
        // Fallback for self-hosted environments where .env might be used directly
        setIsApiKeySet(true); 
      }
    };
    checkApiKey();
  }, []);

  const handleSelectApiKey = async () => {
    if ('aistudio' in window) {
      const success = await (window as any).aistudio.openSelectKey();
      if (success) {
        setIsApiKeySet(true);
      }
    }
  };

  useEffect(() => {
    localStorage.setItem('coachingSession', JSON.stringify(data));
  }, [data]);

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
    element.download = `${data.clientName || 'Client'}_Session_Summary_${data.date}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleGenerateSummary = async () => {
    setIsGenerating(true);
    const summary = await generateSessionSummary(data);
    setGeneratedSummary(summary);
    setIsGenerating(false);
    setActiveTab(TabView.SUMMARY);
  };

  // --- Profile File Management ---

  const handleDownloadProfile = async () => {
    setIsGenerating(true);
    
    // 1. Generate summary for THIS session if there is data
    let currentSessionSummary = null;
    const hasData = data.engage.wins || data.explore.conversationNotes || data.extend.keyInsight;
    
    if (hasData) {
      const summaryText = await generateBriefSummary(data);
      
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
      clientName: data.clientName,
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
    element.download = `${data.clientName || 'Client'}_Profile_${data.date}.json`;
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
            clientName: json.clientName || prev.clientName,
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

  const NavButton = ({ tab, icon: Icon, label }: { tab: TabView, icon: any, label: string }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all duration-200 w-full md:w-auto flex-shrink-0
        ${activeTab === tab 
          ? 'bg-blue-600 text-white shadow-md' 
          : 'bg-white text-slate-600 hover:bg-slate-100'}`}
    >
      <Icon size={18} />
      <span className="font-medium">{label}</span>
    </button>
  );

  // --- API Key Missing Screen ---
  if (!isApiKeySet) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center border border-slate-200">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mb-3">Coaching Companion</h1>
          <p className="text-slate-600 mb-8 leading-relaxed">
            To generate summaries and insights, please connect your Google Cloud API Key.
          </p>
          <button
            onClick={handleSelectApiKey}
            className="w-full bg-blue-600 text-white font-semibold py-3.5 px-6 rounded-lg hover:bg-blue-700 transition-colors shadow-md flex items-center justify-center"
          >
            <Sparkles className="w-5 h-5 mr-2" />
            Connect API Key
          </button>
          <div className="mt-6 text-xs text-slate-400">
            <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" rel="noreferrer" className="underline hover:text-slate-600">
              Billing & API Information
            </a>
          </div>
        </div>
      </div>
    );
  }

  // --- Main App Render ---
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
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
                placeholder="Client Name" 
                className="bg-white text-slate-900 px-3 py-2 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-slate-400 shadow-sm"
                value={data.clientName}
                onChange={(e) => setData({...data, clientName: e.target.value})}
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
        
        {/* Navigation Tabs (Mobile optimized: scrollable) */}
        <div className="flex overflow-x-auto space-x-2 mb-6 pb-2 md:pb-0 scrollbar-hide">
          <NavButton tab={TabView.PROFILE} icon={User} label="Profile" />
          <NavButton tab={TabView.ENGAGE} icon={MessageCircle} label="Engage" />
          <NavButton tab={TabView.EXPLORE} icon={BookOpen} label="Explore" />
          <NavButton tab={TabView.EXPRESS} icon={Footprints} label="Express" />
          <NavButton tab={TabView.EXTEND} icon={Send} label="Extend" />
          {generatedSummary && <NavButton tab={TabView.SUMMARY} icon={Save} label="Summary" />}
        </div>

        {/* Content Containers */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[600px] flex flex-col relative overflow-hidden">
          
          {/* Tab: PROFILE */}
          {activeTab === TabView.PROFILE && (
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-slate-800 flex items-center">
                  <User className="w-6 h-6 mr-3 text-slate-500" />
                  Client Profile
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
                   <label className="block text-sm font-semibold text-slate-700 mb-1">Client Name</label>
                   <input 
                      type="text" 
                      placeholder="Enter Client Name" 
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors shadow-sm text-slate-700 mb-4"
                      value={data.clientName}
                      onChange={(e) => setData({...data, clientName: e.target.value})}
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
            <div className="p-6 md:p-8 animate-in fade-in zoom-in-95 duration-200 flex flex-col h-full">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <MessageCircle className="w-6 h-6 mr-3 text-blue-500" />
                Engage: Connection & Review
              </h2>
              <div className="grid md:grid-cols-2 gap-6 flex-grow">
                <div className="md:col-span-2">
                  <TextArea 
                    label="Where have you seen the goodness of God lately?" 
                    value={data.engage.goodnessOfGod}
                    onChange={(v) => updateSection('engage', 'goodnessOfGod', v)}
                    className="mb-0"
                  />
                </div>
                <TextArea 
                  label="What wins have you noticed?" 
                  value={data.engage.wins}
                  onChange={(v) => updateSection('engage', 'wins', v)}
                />
                 <TextArea 
                  label="What are you learning?" 
                  value={data.engage.learning}
                  onChange={(v) => updateSection('engage', 'learning', v)}
                />
                <TextArea 
                  label="What could you improve?" 
                  value={data.engage.improvements}
                  onChange={(v) => updateSection('engage', 'improvements', v)}
                />
                <TextArea 
                  label="What's the next step forward?" 
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
                    <h3 className="font-semibold text-slate-700 mb-3 text-sm uppercase tracking-wide">Coach's Toolkit</h3>
                    
                    <QuestionBank 
                      title="Direction Questions" 
                      questions={[
                        "What's on your mind?",
                        "What's the real challenge in that for you?",
                        "What do you want? (Positive 'I want...')",
                        "What result would you like to take away?",
                        "What about that is important to you?",
                        "What would achieving that do for you/others?",
                        "What's the bigger issue behind the situation?",
                        "What do you mean by ____?",
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
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <Footprints className="w-6 h-6 mr-3 text-green-500" />
                Express: Action Planning
              </h2>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                 <TextArea 
                  label="What are the very first steps?" 
                  placeholder="Immediate action after this call"
                  value={data.express.firstSteps}
                  onChange={(v) => updateSection('express', 'firstSteps', v)}
                />
                <TextArea 
                  label="What can you stick to even on your worst days?" 
                  value={data.express.stickToIt}
                  onChange={(v) => updateSection('express', 'stickToIt', v)}
                />
                <TextArea 
                  label="When will you do this?" 
                  value={data.express.whenWillYouDoThis}
                  onChange={(v) => updateSection('express', 'whenWillYouDoThis', v)}
                />
                 <TextArea 
                  label="What stops you? (Obstacles & Plan)" 
                  placeholder="Obstacles / Plan to overcome"
                  value={data.express.obstacles}
                  onChange={(v) => updateSection('express', 'obstacles', v)}
                />
                 <TextArea 
                  label="Accountability: Who can you tell?" 
                  value={data.express.whoToTell}
                  onChange={(v) => updateSection('express', 'whoToTell', v)}
                />
                 <TextArea 
                  label="Consequences / Sacrifices (Saying No)" 
                  value={data.express.sacrifices}
                  onChange={(v) => updateSection('express', 'sacrifices', v)}
                />
                 <TextArea 
                  label="Why is this important?" 
                  value={data.express.importance}
                  onChange={(v) => updateSection('express', 'importance', v)}
                />
                 <TextArea 
                  label="Helpful reminders (visual cues?)" 
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
                    label="Encouragement & Coach Input" 
                    placeholder="Write a note of encouragement for the client..."
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
                
                <div className="bg-orange-50 p-6 rounded-lg border border-orange-100 flex items-center justify-between">
                   <div>
                     <label className="block text-sm font-semibold text-orange-900 mb-1">When are we meeting next?</label>
                     <input 
                      type="datetime-local" 
                      className="bg-white border border-orange-200 rounded px-3 py-2 text-slate-700 focus:ring-2 focus:ring-orange-400 outline-none"
                      value={data.extend.nextMeeting}
                      onChange={(e) => updateSection('extend', 'nextMeeting', e.target.value)}
                     />
                   </div>
                   <button 
                    onClick={handleGenerateSummary}
                    disabled={isGenerating}
                    className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-900 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl disabled:opacity-70"
                   >
                     <Sparkles className="w-4 h-4" />
                     <span>Finish & Summarize</span>
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
                <button 
                  onClick={handleDownloadProfile}
                  disabled={isGenerating}
                  className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-md"
                >
                   <Download className="w-4 h-4 mr-2" /> 
                   {isGenerating ? "Saving..." : "Save Profile & History (JSON)"}
                </button>
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