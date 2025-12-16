import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  GitMerge, 
  Settings, 
  PieChart, 
  Search, 
  Bell, 
  MessageSquare, 
  X,
  Send,
  Sparkles,
  ChevronRight,
  TrendingUp,
  UserPlus,
  MoreHorizontal,
  FileText,
  Briefcase,
  DollarSign,
  Calendar,
  CheckCircle,
  Upload,
  User,
  MapPin,
  Phone
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  PieChart as RePieChart,
  Pie
} from 'recharts';

import { ViewState, Candidate, ChatMessage } from './types';
import { MOCK_CANDIDATES, MOCK_EMPLOYEES, HIRING_DATA, ATTRITION_DATA } from './constants';
import * as geminiService from './services/geminiService';

// --- Subcomponents ---

interface SidebarItemProps {
  icon: React.ElementType;
  label: string;
  active?: boolean;
  onClick: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-6 py-3 transition-all duration-200 group ${
      active 
        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
    }`}
  >
    <Icon className={`w-5 h-5 ${active ? 'fill-blue-600/20' : ''}`} />
    <span className="font-medium">{label}</span>
  </button>
);

interface CandidateCardProps {
  candidate: Candidate;
  onAnalyze: (c: Candidate) => void | Promise<void>;
}

const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onAnalyze }) => (
  <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="flex justify-between items-start mb-4">
      <div className="flex space-x-4">
        <img src={candidate.avatar} alt={candidate.name} className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm" />
        <div>
          <h3 className="font-semibold text-slate-800">{candidate.name}</h3>
          <p className="text-sm text-slate-500">{candidate.role}</p>
        </div>
      </div>
      <div className={`px-2 py-1 rounded-full text-xs font-semibold ${
        candidate.matchScore > 90 ? 'bg-green-100 text-green-700' :
        candidate.matchScore > 80 ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
      }`}>
        {candidate.matchScore}% Match
      </div>
    </div>
    
    <div className="space-y-3 mb-4">
      <div className="flex flex-wrap gap-2">
        {candidate.skills.slice(0, 3).map(skill => (
          <span key={skill} className="px-2 py-1 bg-slate-50 text-slate-600 text-xs rounded-md border border-slate-200">
            {skill}
          </span>
        ))}
      </div>
      <div className="flex items-center text-xs text-slate-400 space-x-4">
        <span>{candidate.experience} Years Exp</span>
        <span>•</span>
        <span>{candidate.location}</span>
      </div>
    </div>

    <button 
      onClick={() => onAnalyze(candidate)}
      className="w-full py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-medium hover:from-blue-600 hover:to-indigo-700 flex items-center justify-center space-x-2 transition-all shadow-md shadow-blue-500/20"
    >
      <Sparkles className="w-4 h-4" />
      <span>Analyze with AI</span>
    </button>
  </div>
);

const Modal = ({ isOpen, onClose, title, children }: { isOpen: boolean, onClose: () => void, title: string, children?: React.ReactNode }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose}></div>
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col animate-[fadeIn_0.2s_ease-out]">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-500" />
            {title}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

// --- Form Components for Employee Wizard ---

const FormInput = ({ label, type = "text", placeholder, className = "" }: { label: string, type?: string, placeholder?: string, className?: string }) => (
  <div className={`flex flex-col space-y-1.5 ${className}`}>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <input 
      type={type} 
      placeholder={placeholder}
      className="px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none transition-all placeholder:text-slate-300" 
    />
  </div>
);

const FormSelect = ({ label, options, className = "" }: { label: string, options: string[], className?: string }) => (
  <div className={`flex flex-col space-y-1.5 ${className}`}>
    <label className="text-sm font-semibold text-slate-700">{label}</label>
    <div className="relative">
      <select className="w-full px-4 py-2 border border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none appearance-none bg-white text-slate-700">
        <option value="" disabled selected>Select an option</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronRight className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" />
    </div>
  </div>
);

// --- Main Application ---

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null);
  const [isAnalysisModalOpen, setIsAnalysisModalOpen] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string>("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  
  // Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: '1', role: 'ai', text: 'Hello! I am Horizon AI. How can I assist with your workforce planning today?', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Employee Wizard State
  const [employeeWizardStep, setEmployeeWizardStep] = useState(1);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleAnalyzeCandidate = async (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setIsAnalysisModalOpen(true);
    setAiAnalysisResult("");
    setIsAiLoading(true);

    const result = await geminiService.generateCandidateAnalysis(candidate);
    setAiAnalysisResult(result);
    setIsAiLoading(false);
  };

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: chatInput,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setChatInput("");

    // Simulate thinking time briefly for UI feel before API call
    const aiResponseText = await geminiService.chatWithHRBot(userMsg.text);
    
    const aiMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'ai',
      text: aiResponseText,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, aiMsg]);
  };

  // --- Views ---

  const renderDashboard = () => (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      {/* Top Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Employees', value: '1,248', change: '+12%', color: 'blue' },
          { label: 'Open Positions', value: '42', change: '+5%', color: 'indigo' },
          { label: 'Time to Hire', value: '18 Days', change: '-2 Days', color: 'emerald' },
          { label: 'Attrition Rate', value: '4.2%', change: '-0.8%', color: 'orange' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stat.value}</h3>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                stat.color === 'emerald' ? 'bg-emerald-100 text-emerald-700' :
                stat.color === 'orange' ? 'bg-orange-100 text-orange-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {stat.change}
              </span>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  stat.color === 'emerald' ? 'bg-emerald-400' :
                  stat.color === 'orange' ? 'bg-orange-400' :
                  'bg-blue-500'
                }`} 
                style={{ width: `${60 + Math.random() * 30}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-bold text-slate-800">Talent Acquisition Velocity</h3>
            <select className="bg-slate-50 border border-slate-200 text-sm rounded-lg px-3 py-1 outline-none">
              <option>Last 6 Months</option>
              <option>This Year</option>
            </select>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={HIRING_DATA}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Area type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                <Area type="monotone" dataKey="value2" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="5 5" fill="none" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <h3 className="font-bold text-slate-800 mb-6">Attrition Risk by Dept</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={ATTRITION_DATA} layout="vertical">
                 <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                  {ATTRITION_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={['#3b82f6', '#f59e0b', '#10b981', '#6366f1', '#ec4899'][index % 5]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );

  const renderTalentScout = () => (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex justify-between items-center bg-gradient-to-r from-blue-600 to-indigo-700 p-8 rounded-2xl text-white shadow-lg">
        <div>
          <h2 className="text-3xl font-bold mb-2">AI Talent Scout</h2>
          <p className="text-blue-100 max-w-xl">
            Our AI engine has analyzed 450+ profiles across GitHub and LinkedIn today. 
            Here are your top matched candidates for open roles.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/20">
          <p className="text-sm font-medium text-blue-100 mb-1">Pipeline Health</p>
          <div className="text-2xl font-bold">Excellent</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_CANDIDATES.map(c => (
          <CandidateCard key={c.id} candidate={c} onAnalyze={handleAnalyzeCandidate} />
        ))}
      </div>
    </div>
  );

  const renderEmployeeModule = () => {
    const steps = [
      { id: 1, title: "Personal Information", icon: User },
      { id: 2, title: "Contact Information", icon: Phone },
      { id: 3, title: "Employment Information", icon: Briefcase },
      { id: 4, title: "Compensation", icon: DollarSign },
      { id: 5, title: "Documents", icon: FileText },
      { id: 6, title: "Leave & Attendance", icon: Calendar },
      { id: 7, title: "Review", icon: CheckCircle }
    ];

    const renderStepContent = () => {
      switch(employeeWizardStep) {
        case 1:
          return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
              <div className="flex items-center space-x-2 mb-6">
                <User className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800">Basic Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer group">
                  <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:scale-105 transition-transform">
                    <Upload className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-xs font-medium text-slate-500">Upload Photo</p>
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormSelect label="Title" options={["Mr.", "Ms.", "Mrs.", "Dr.", "Prof."]} />
                  <FormInput label="First Name" placeholder="e.g. John" />
                  <FormInput label="Middle Name" placeholder="e.g. William" />
                  <FormInput label="Last Name" placeholder="e.g. Doe" />
                  <FormInput label="Date of Birth" type="date" />
                  <FormSelect label="Gender" options={["Male", "Female", "Non-binary", "Prefer not to say"]} />
                  <FormSelect label="Marital Status" options={["Single", "Married", "Divorced", "Widowed"]} />
                  <FormInput label="Nationality" placeholder="e.g. American" />
                </div>
              </div>
            </div>
          );
        case 2:
          return (
             <div className="animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center space-x-2 mb-6">
                <MapPin className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800">Contact Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Personal Email" type="email" placeholder="john.doe@gmail.com" />
                <FormInput label="Work Email" type="email" placeholder="john.doe@company.com" />
                <FormInput label="Mobile Number" type="tel" placeholder="+1 (555) 000-0000" />
                <FormInput label="Home Phone" type="tel" placeholder="Optional" />
                <div className="md:col-span-2">
                   <FormInput label="Current Address" placeholder="Street Address, Apt, Suite, Unit" />
                </div>
                <FormInput label="City" placeholder="City" />
                <FormInput label="State/Province" placeholder="State" />
                <FormInput label="Postal Code" placeholder="12345" />
                <FormSelect label="Country" options={["United States", "United Kingdom", "Canada", "Germany", "France"]} />
              </div>
             </div>
          );
        case 3:
          return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center space-x-2 mb-6">
                <Briefcase className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800">Employment Details</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Employee ID" placeholder="Auto-generated" className="opacity-70" />
                <FormInput label="Date of Joining" type="date" />
                <FormSelect label="Department" options={["Engineering", "Product", "Sales", "Marketing", "HR", "Finance"]} />
                <FormSelect label="Designation" options={["Software Engineer", "Product Manager", "Sales Representative", "HR Specialist"]} />
                <FormSelect label="Reporting Manager" options={["Dr. Alistair Wright", "Martha Nielsen", "Lucifer Morningstar"]} />
                <FormSelect label="Employment Type" options={["Full-time", "Part-time", "Contract", "Intern"]} />
                <FormSelect label="Work Location" options={["Headquarters", "Remote", "London Branch", "Berlin Branch"]} />
                <FormSelect label="Probation Period" options={["None", "3 Months", "6 Months"]} />
              </div>
            </div>
          );
        case 4:
          return (
            <div className="animate-[fadeIn_0.3s_ease-out]">
               <div className="flex items-center space-x-2 mb-6">
                <DollarSign className="w-5 h-5 text-blue-500" />
                <h3 className="text-lg font-semibold text-slate-800">Compensation & Payroll</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormInput label="Annual Salary (CTC)" type="number" placeholder="0.00" />
                <FormSelect label="Currency" options={["USD", "EUR", "GBP", "CAD"]} />
                <FormSelect label="Pay Frequency" options={["Monthly", "Bi-weekly", "Weekly"]} />
                <FormInput label="Bank Name" placeholder="e.g. Chase" />
                <FormInput label="Account Number" type="password" placeholder="************" />
                <FormInput label="IFSC / Swift Code" placeholder="CODE123" />
                <FormInput label="Tax ID / SSN" placeholder="XXX-XX-XXXX" />
              </div>
            </div>
          );
        case 5:
           return (
             <div className="animate-[fadeIn_0.3s_ease-out]">
                <div className="flex items-center space-x-2 mb-6">
                 <FileText className="w-5 h-5 text-blue-500" />
                 <h3 className="text-lg font-semibold text-slate-800">Documents</h3>
               </div>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {['Resume / CV', 'ID Proof (Passport/DL)', 'Education Certificates', 'Offer Letter Signed'].map(doc => (
                   <div key={doc} className="border border-slate-200 rounded-lg p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center space-x-3">
                         <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                            <FileText className="w-5 h-5" />
                         </div>
                         <div>
                            <p className="text-sm font-semibold text-slate-700">{doc}</p>
                            <p className="text-xs text-slate-400">PDF, JPG up to 5MB</p>
                         </div>
                      </div>
                      <button className="text-blue-600 text-sm font-medium hover:underline">Upload</button>
                   </div>
                 ))}
               </div>
             </div>
           );
        default:
          return (
            <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col items-center justify-center py-12 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6">
                <CheckCircle className="w-10 h-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-2">Review & Submit</h3>
              <p className="text-slate-500 max-w-md mb-8">
                Please review all the information entered in the previous steps. Once submitted, the employee profile will be created and onboarding emails will be sent.
              </p>
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 w-full max-w-lg text-left text-sm space-y-3 mb-8">
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Full Name</span>
                    <span className="font-semibold text-slate-800">John William Doe</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Department</span>
                    <span className="font-semibold text-slate-800">Engineering</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-200 pb-2">
                    <span className="text-slate-500">Role</span>
                    <span className="font-semibold text-slate-800">Software Engineer</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Work Email</span>
                    <span className="font-semibold text-slate-800">john.doe@company.com</span>
                  </div>
              </div>
            </div>
          )
      }
    };

    return (
      <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
         {/* Header & Progress */}
         <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Add New Employee</h2>
                <p className="text-slate-500 text-sm mt-1">Create a new employee profile in Nexus Horizon.</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-blue-600 mb-1">Step {employeeWizardStep} of 7</p>
                <p className="text-xs text-slate-400">Next: {steps[employeeWizardStep]?.title || 'Finish'}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-8">
               <div 
                 className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500 ease-in-out relative" 
                 style={{ width: `${(employeeWizardStep / 7) * 100}%` }}
               >
                 <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/30 animate-pulse"></div>
               </div>
            </div>

            {/* Steps Tabs */}
            <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide -mx-2 px-2">
              {steps.map(step => (
                 <button
                    key={step.id}
                    onClick={() => setEmployeeWizardStep(step.id)}
                    className={`px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center space-x-2 flex-shrink-0 ${
                       employeeWizardStep === step.id 
                       ? 'bg-slate-800 text-white shadow-lg shadow-slate-200' 
                       : 'bg-white text-slate-500 border border-slate-200 hover:bg-slate-50 hover:text-slate-700'
                    }`}
                 >
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                       employeeWizardStep === step.id ? 'bg-white/20' : 'bg-slate-100 text-slate-500'
                    }`}>{step.id}</div>
                    <span>{step.title}</span>
                 </button>
              ))}
            </div>
         </div>
  
         {/* Form Content Panel */}
         <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-sm min-h-[500px] flex flex-col justify-between">
            {renderStepContent()}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-8 border-t border-slate-100 mt-8">
               <button 
                  disabled={employeeWizardStep === 1}
                  onClick={() => setEmployeeWizardStep(prev => prev - 1)}
                  className="px-6 py-2.5 rounded-lg border border-slate-200 text-slate-600 font-medium hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
               >
                  <ChevronRight className="w-4 h-4 rotate-180 mr-2" />
                  Previous
               </button>
               <button 
                  onClick={() => setEmployeeWizardStep(prev => Math.min(7, prev + 1))}
                  className="px-8 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/20 flex items-center transition-all hover:scale-105"
               >
                  {employeeWizardStep === 7 ? 'Submit Employee' : 'Next Step'}
                  {employeeWizardStep !== 7 && <ChevronRight className="w-4 h-4 ml-2" />}
               </button>
            </div>
         </div>
      </div>
    )
  }

  const renderOrgChart = () => (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 min-h-[80vh] animate-[fadeIn_0.4s_ease-out] overflow-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-slate-800">Organization Structure</h2>
        <div className="flex space-x-2">
            <button className="px-4 py-2 border rounded-lg hover:bg-slate-50">Filter</button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Member</button>
        </div>
      </div>
      
      {/* Simplified Visualization of the MOCK_EMPLOYEES tree */}
      <div className="flex flex-col items-center space-y-12">
        {/* Level 1: CEO */}
        <div className="relative group">
           <div className="w-64 p-4 bg-white border-2 border-indigo-100 rounded-xl shadow-lg flex items-center space-x-4 z-10 relative">
              <img src={MOCK_EMPLOYEES[0].avatar} className="w-12 h-12 rounded-full" alt="" />
              <div>
                 <p className="font-bold text-slate-800">{MOCK_EMPLOYEES[0].name}</p>
                 <p className="text-xs text-indigo-600 font-semibold">{MOCK_EMPLOYEES[0].role}</p>
              </div>
           </div>
           {/* Connector */}
           <div className="absolute top-full left-1/2 w-0.5 h-12 bg-slate-200 -translate-x-1/2"></div>
        </div>

        {/* Level 2 */}
        <div className="grid grid-cols-2 gap-16 relative">
             {/* Horizontal Bar */}
             <div className="absolute -top-12 left-[25%] right-[25%] h-0.5 bg-slate-200"></div>
             <div className="absolute -top-12 left-[25%] h-6 w-0.5 bg-slate-200"></div>
             <div className="absolute -top-12 right-[25%] h-6 w-0.5 bg-slate-200"></div>

             {MOCK_EMPLOYEES.filter(e => e.reportsTo === 'e1').map(mgr => (
                <div key={mgr.id} className="flex flex-col items-center">
                    <div className="w-64 p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:shadow-md transition-all flex items-center space-x-4 relative z-10">
                        <img src={mgr.avatar} className="w-10 h-10 rounded-full grayscale group-hover:grayscale-0" alt="" />
                        <div>
                          <p className="font-bold text-sm text-slate-800">{mgr.name}</p>
                          <p className="text-xs text-slate-500">{mgr.role}</p>
                        </div>
                    </div>
                    {/* Check if has reports */}
                    {MOCK_EMPLOYEES.some(sub => sub.reportsTo === mgr.id) && (
                       <div className="w-0.5 h-8 bg-slate-200"></div>
                    )}
                     {/* Level 3 rendering (simplified for this demo) */}
                     {MOCK_EMPLOYEES.filter(sub => sub.reportsTo === mgr.id).map(sub => (
                        <div key={sub.id} className="mt-4 w-56 p-3 bg-slate-50 border border-slate-100 rounded-lg flex items-center space-x-3 opacity-80">
                            <img src={sub.avatar} className="w-8 h-8 rounded-full" alt="" />
                            <div>
                                <p className="font-medium text-xs text-slate-800">{sub.name}</p>
                                <p className="text-[10px] text-slate-500">{sub.role}</p>
                            </div>
                        </div>
                     ))}
                </div>
             ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-[#F8FAFF] font-sans">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col flex-shrink-0 z-20">
        <div className="p-6 flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/30">
            N
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
            Nexus Horizon
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-1">
          <p className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">Main</p>
          <SidebarItem icon={LayoutDashboard} label="Dashboard" active={currentView === ViewState.DASHBOARD} onClick={() => setCurrentView(ViewState.DASHBOARD)} />
          <SidebarItem icon={UserPlus} label="AI Talent Scout" active={currentView === ViewState.TALENT_SCOUT} onClick={() => setCurrentView(ViewState.TALENT_SCOUT)} />
          <SidebarItem icon={GitMerge} label="Org Chart" active={currentView === ViewState.ORG_CHART} onClick={() => setCurrentView(ViewState.ORG_CHART)} />
          <SidebarItem icon={PieChart} label="Analytics" active={currentView === ViewState.ANALYTICS} onClick={() => setCurrentView(ViewState.ANALYTICS)} />
          
          <p className="px-6 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-6">Operations</p>
          <SidebarItem icon={Users} label="Employees" active={currentView === ViewState.EMPLOYEES} onClick={() => setCurrentView(ViewState.EMPLOYEES)} />
          <SidebarItem icon={TrendingUp} label="Performance" onClick={() => {}} />
          <SidebarItem icon={Settings} label="Settings" onClick={() => {}} />
        </div>

        <div className="p-4 border-t border-slate-100">
          <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50">
            <img src="https://picsum.photos/id/64/100/100" className="w-10 h-10 rounded-full" alt="User" />
            <div>
              <p className="text-sm font-medium text-slate-800">Sarah Connor</p>
              <p className="text-xs text-slate-500">Head of HR</p>
            </div>
            <MoreHorizontal className="w-4 h-4 text-slate-400 ml-auto cursor-pointer" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden relative">
        {/* Header */}
        <header className="h-16 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10 sticky top-0">
          <div className="flex items-center bg-slate-100 rounded-full px-4 py-2 w-96 border border-transparent focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100 transition-all">
            <Search className="w-4 h-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search employees, candidates, or modules..." 
              className="bg-transparent border-none outline-none text-sm w-full text-slate-700 placeholder-slate-400"
            />
          </div>
          <div className="flex items-center space-x-4">
            <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* View Content */}
        <main className="flex-1 overflow-y-auto p-8 relative">
          {currentView === ViewState.DASHBOARD && renderDashboard()}
          {currentView === ViewState.TALENT_SCOUT && renderTalentScout()}
          {currentView === ViewState.ORG_CHART && renderOrgChart()}
          {currentView === ViewState.EMPLOYEES && renderEmployeeModule()}
          {currentView === ViewState.ANALYTICS && (
            <div className="flex flex-col items-center justify-center h-full text-slate-400">
              <PieChart className="w-16 h-16 mb-4 opacity-50" />
              <p>Analytics Module requires Enterprise Data connection.</p>
            </div>
          )}
        </main>

        {/* AI Chat Widget */}
        <div className={`fixed right-8 bottom-8 z-40 flex flex-col items-end transition-all duration-300 ${isChatOpen ? 'translate-y-0' : 'translate-y-0'}`}>
           {isChatOpen && (
             <div className="mb-4 w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden animate-[slideUp_0.3s_ease-out]">
               <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-4 text-white flex justify-between items-center">
                 <div className="flex items-center gap-2">
                   <Sparkles className="w-4 h-4 text-yellow-400" />
                   <span className="font-semibold">Horizon AI Assistant</span>
                 </div>
                 <button onClick={() => setIsChatOpen(false)}><X className="w-4 h-4 opacity-70 hover:opacity-100" /></button>
               </div>
               
               <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                  {chatMessages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user' 
                          ? 'bg-blue-600 text-white rounded-tr-sm' 
                          : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                      }`}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
               </div>

               <form onSubmit={handleChatSubmit} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                 <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask about retention, policies..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2 text-sm outline-none focus:border-blue-500"
                 />
                 <button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors">
                   <Send className="w-4 h-4" />
                 </button>
               </form>
             </div>
           )}
           <button 
             onClick={() => setIsChatOpen(!isChatOpen)}
             className="w-14 h-14 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full shadow-xl shadow-blue-500/40 flex items-center justify-center hover:scale-105 transition-transform"
           >
             {isChatOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
           </button>
        </div>
      </div>

      {/* Analysis Modal */}
      <Modal 
        isOpen={isAnalysisModalOpen} 
        onClose={() => setIsAnalysisModalOpen(false)}
        title={selectedCandidate ? `AI Analysis: ${selectedCandidate.name}` : 'AI Analysis'}
      >
        <div className="space-y-4">
          <div className="flex items-center space-x-4 mb-6">
            <img src={selectedCandidate?.avatar} className="w-16 h-16 rounded-full border-4 border-slate-50" alt="" />
            <div>
              <h3 className="text-lg font-bold text-slate-800">{selectedCandidate?.name}</h3>
              <p className="text-slate-500">{selectedCandidate?.role}</p>
            </div>
            <div className="ml-auto text-center">
               <p className="text-xs text-slate-400 uppercase font-bold tracking-wider">Match Score</p>
               <p className="text-3xl font-bold text-blue-600">{selectedCandidate?.matchScore}%</p>
            </div>
          </div>
          
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-100 min-h-[200px]">
            {isAiLoading ? (
              <div className="flex flex-col items-center justify-center h-32 space-y-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-slate-500 animate-pulse">Generating insights with Gemini 2.5 Flash...</p>
              </div>
            ) : (
              <div className="prose prose-sm prose-slate max-w-none">
                {aiAnalysisResult.split('\n').map((line, i) => (
                  <p key={i} className="mb-2">{line}</p>
                ))}
              </div>
            )}
          </div>
          
          {!isAiLoading && (
            <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
              <button onClick={() => setIsAnalysisModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Close</button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20">Schedule Interview</button>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default App;