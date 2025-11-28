import React, { useState } from 'react';
import { User, SMTPSettings, Theme } from '../types';
import { KeyRound, CheckCircle, AlertCircle, Eye, EyeOff, Server, FlaskConical, Rocket, Mail, Sun, Moon, Laptop, ArrowRight, ArrowLeft, Users, ChevronDown, Settings, Palette, RefreshCw } from 'lucide-react';

type EnvironmentProfile = 'demo' | 'dev-with-data' | 'clean';

interface SetupWizardProps {
  onComplete: (config: {
    profile: EnvironmentProfile;
    smtp: SMTPSettings;
    subscribers: string[];
    theme: Theme;
  }) => void;
  changePassword: (newPass: string) => boolean;
  adminUser: User;
  testSmtpConnection: (settings: SMTPSettings, recipientEmail: string) => Promise<{ success: boolean; message: string }>;
}

const OptionalConfigToggle: React.FC<{ title: string; icon: React.ElementType; children: React.ReactNode; }> = ({ title, icon: Icon, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border border-slate-200 dark:border-slate-700 rounded-lg">
            <button type="button" onClick={() => setIsOpen(!isOpen)} className="w-full p-4 flex justify-between items-center text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors">
                <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3 text-slate-500 dark:text-slate-400"/>
                    <span className="font-bold text-slate-700 dark:text-slate-300">{title}</span>
                </div>
                <ChevronDown className={`transform transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                <div className="overflow-hidden">
                    <div className="p-4 pt-0 border-t border-slate-200 dark:border-slate-700">
                         <div className="pt-4">
                            {children}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, changePassword, adminUser, testSmtpConnection }) => {
  const [step, setStep] = useState(1); // 1: Profile, 2: Password, 3: Optional, 4: Finish
  const [config, setConfig] = useState({
    profile: 'demo' as 'demo' | 'dev' | 'prod',
    importDevData: true,
    smtp: { host: '', port: 587, user: '', pass: '', secure: true },
    subscribers: '',
    theme: 'system' as Theme,
  });

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const [smtpTestStatus, setSmtpTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [smtpTestMessage, setSmtpTestMessage] = useState('');
  const [isSmtpTestedSuccessfully, setIsSmtpTestedSuccessfully] = useState(false);
  const [smtpTestEmail, setSmtpTestEmail] = useState('');
  
  const handleNext = () => setStep(s => s + 1);
  const handleBack = () => setStep(s => s - 1);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError(null);
    if (changePassword(newPassword)) {
        handleNext();
    } else {
        setError("Could not update password. Please refresh and try again.")
    }
  };
  
  const handleSmtpChange = (field: keyof SMTPSettings, value: string | number) => {
    setConfig(c => ({...c, smtp: {...c.smtp, [field]: value}}));
    setIsSmtpTestedSuccessfully(false); // Require re-test on change
  };
  
  const applySmtpPreset = (preset: 'gmail' | 'outlook') => {
      const presets = {
          gmail: { host: 'smtp.gmail.com', port: 587, secure: true },
          outlook: { host: 'smtp.office365.com', port: 587, secure: true }
      };
      setConfig(c => ({ ...c, smtp: { ...c.smtp, ...presets[preset]} }));
      setIsSmtpTestedSuccessfully(false);
  };

  const handleSmtpTest = async () => {
    if (!smtpTestEmail) {
      setSmtpTestStatus('error');
      setSmtpTestMessage('Please enter a recipient email address to send the test to.');
      return;
    }
    setSmtpTestStatus('testing');
    setSmtpTestMessage('');
    const settingsToTest: SMTPSettings = { ...config.smtp, port: config.smtp.port ? Number(config.smtp.port) : null };
    const result = await testSmtpConnection(settingsToTest, smtpTestEmail);
    setSmtpTestMessage(result.message);
    setSmtpTestStatus(result.success ? 'success' : 'error');
    if (result.success) setIsSmtpTestedSuccessfully(true);
  };
  
  const handleFinishSetup = () => {
    let finalProfile: EnvironmentProfile = 'clean';
    if (config.profile === 'demo') {
        finalProfile = 'demo';
    } else if (config.profile === 'dev' && config.importDevData) {
        finalProfile = 'dev-with-data';
    }
    
    onComplete({
        profile: finalProfile,
        smtp: { ...config.smtp, port: config.smtp.port ? Number(config.smtp.port) : null },
        subscribers: config.subscribers.split(/[\n,]+/).map(s => s.trim()).filter(Boolean),
        theme: config.theme
    });
  }

  const StepIndicator: React.FC<{ current: number, total: number, labels: string[] }> = ({ current, total, labels }) => (
    <div className="w-full flex justify-center mb-10">
      <div className="w-full max-w-sm">
        <div className="relative">
          <div className="absolute top-4 left-0 w-full h-0.5 bg-slate-200 dark:bg-slate-700"></div>
          <div className="absolute top-4 left-0 h-0.5 bg-emerald-500 transition-all duration-500" style={{ width: `${((current-1.5)/(total-1))*100}%`}}></div>
          <div className="relative flex justify-between items-start">
            {Array.from({ length: total }).map((_, i) => (
                <div key={i} className="flex flex-col items-center z-10 text-center w-1/4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 border-2 ${i + 1 < current ? 'bg-emerald-500 border-emerald-500 text-white' : i + 1 === current ? 'bg-white dark:bg-slate-800 border-emerald-500' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                        {i + 1 < current ? <CheckCircle size={16}/> : <span className={`font-bold ${i+1 === current ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{i+1}</span>}
                    </div>
                    <span className={`mt-2 text-sm font-bold transition-colors w-20 truncate ${i + 1 <= current ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`}>{labels[i]}</span>
                </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderStepContent = () => {
    switch (step) {
      case 1:
        return (
          <>
            <StepIndicator current={1} total={4} labels={['Profile', 'Admin', 'Configure', 'Finish']} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">Choose Environment Profile</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">Select a profile that best matches your use case.</p>
            <div className="mt-8 space-y-3">
                <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${config.profile === 'demo' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <input type="radio" name="profile" value="demo" checked={config.profile === 'demo'} onChange={() => setConfig(c => ({...c, profile: 'demo'}))} className="sr-only" />
                    <div className="flex items-center"><Server size={20} className="text-emerald-600 mr-4"/><div><span className="font-bold text-slate-800 dark:text-slate-200">Demo</span><p className="text-sm text-slate-500 dark:text-slate-400">For evaluation. Installs sample monitors & incidents.</p></div></div>
                </label>
                 <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${config.profile === 'dev' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <input type="radio" name="profile" value="dev" checked={config.profile === 'dev'} onChange={() => setConfig(c => ({...c, profile: 'dev'}))} className="sr-only" />
                     <div className="flex items-center"><FlaskConical size={20} className="text-purple-600 mr-4"/><div><span className="font-bold text-slate-800 dark:text-slate-200">Development / QA</span><p className="text-sm text-slate-500 dark:text-slate-400">For testing and integration.</p></div></div>
                     {config.profile === 'dev' && (<div className="mt-3 pl-9"><label className="flex items-center text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" checked={config.importDevData} onChange={e => setConfig(c => ({...c, importDevData: e.target.checked}))} className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-500 bg-slate-100 dark:bg-slate-600 mr-2"/>Import sample data</label></div>)}
                </label>
                 <label className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${config.profile === 'prod' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'}`}>
                    <input type="radio" name="profile" value="prod" checked={config.profile === 'prod'} onChange={() => setConfig(c => ({...c, profile: 'prod'}))} className="sr-only" />
                    <div className="flex items-center"><CheckCircle size={20} className="text-blue-600 mr-4"/><div><span className="font-bold text-slate-800 dark:text-slate-200">Production</span><p className="text-sm text-slate-500 dark:text-slate-400">Starts with a completely blank slate.</p></div></div>
                </label>
            </div>
            <button onClick={handleNext} className="w-full mt-8 bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2">Next <ArrowRight size={18}/></button>
          </>
        );
      case 2:
        return (
          <form onSubmit={handlePasswordSubmit}>
             <StepIndicator current={2} total={4} labels={['Profile', 'Admin', 'Configure', 'Finish']} />
            <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">Secure Your Account</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">Set a new password for the default Super Admin, <strong>{adminUser.username}</strong>.</p>
            <div className="mt-8 space-y-4">
              <div className="relative">
                <input 
                    type={showPassword ? "text" : "password"} 
                    required 
                    placeholder="New Password" 
                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg pl-4 pr-10 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                />
                <button type="button" tabIndex={-1} onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
              <input 
                type="password" 
                required 
                placeholder="Confirm New Password" 
                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2.5 bg-white dark:bg-slate-700 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
              />
              {error && (<p className="text-sm text-rose-600 dark:text-rose-400 flex items-center gap-2 animate-fade-in"><AlertCircle size={16}/>{error}</p>)}
              <div className="flex gap-3 pt-4">
                  <button type="button" onClick={handleBack} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2"><ArrowLeft size={18}/> Back</button>
                  <button type="submit" className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2">Next <ArrowRight size={18}/></button>
              </div>
            </div>
          </form>
        );
      case 3:
        return (
            <>
                <StepIndicator current={3} total={4} labels={['Profile', 'Admin', 'Configure', 'Finish']} />
                <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100 text-center">Optional Configuration</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-center text-sm">You can set these up now or configure them later from the admin dashboard.</p>
                <div className="mt-8 space-y-3">
                    <OptionalConfigToggle title="SMTP Settings" icon={Settings}>
                       <div className="space-y-3">
                            <div className="flex gap-2 mt-2 mb-2">
                                <button type="button" onClick={() => applySmtpPreset('gmail')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full">Gmail Preset</button>
                                <button type="button" onClick={() => applySmtpPreset('outlook')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full">Outlook Preset</button>
                            </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div className="col-span-2"><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Host</label><input className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={config.smtp.host} onChange={e => handleSmtpChange('host', e.target.value)} /></div>
                            <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Port</label><input type="number" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={config.smtp.port || ''} onChange={e => handleSmtpChange('port', Number(e.target.value))} /></div>
                          </div>
                          <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Username</label><input className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" value={config.smtp.user} onChange={e => handleSmtpChange('user', e.target.value)} /></div>
                          <div><label className="text-xs font-bold text-slate-500 dark:text-slate-400">Password</label><input type="password" placeholder="Your SMTP Password" className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" onChange={e => handleSmtpChange('pass', e.target.value)} /></div>
                          <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Recipient for Test</label>
                            <input 
                                type="email" 
                                placeholder="test-recipient@example.com"
                                className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                                value={smtpTestEmail}
                                onChange={e => {
                                    setSmtpTestEmail(e.target.value);
                                    if (smtpTestStatus !== 'idle' || smtpTestMessage) {
                                        setSmtpTestStatus('idle');
                                        setSmtpTestMessage('');
                                    }
                                }}
                            />
                          </div>
                          <button type="button" onClick={handleSmtpTest} disabled={smtpTestStatus === 'testing'} className="w-full flex justify-center items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50">
                            {smtpTestStatus === 'testing' ? <RefreshCw size={16} className="animate-spin" /> : <Mail size={16} />}
                            Test Connection
                          </button>
                           {smtpTestMessage && (
                            <div className={`text-sm p-3 rounded-lg flex items-start gap-2 ${smtpTestStatus === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                                {smtpTestStatus === 'success' ? <CheckCircle size={16} className="text-emerald-500 mt-0.5"/> : <AlertCircle size={16} className="text-rose-500 mt-0.5"/>}
                                <span>{smtpTestMessage}</span>
                            </div>
                          )}
                       </div>
                    </OptionalConfigToggle>
                     <OptionalConfigToggle title="Initial Subscribers" icon={Users}>
                        <div>
                            <label className="text-xs font-bold text-slate-500 dark:text-slate-400">Subscriber Emails</label>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1 mb-2">Enter a list of emails to subscribe to notifications, separated by commas or new lines.</p>
                            <textarea value={config.subscribers} onChange={e => setConfig(c => ({...c, subscribers: e.target.value}))} rows={4} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-white dark:bg-slate-700 text-slate-900 dark:text-white" />
                        </div>
                    </OptionalConfigToggle>
                    <OptionalConfigToggle title="Theme" icon={Palette}>
                        <div className="grid grid-cols-3 gap-3">
                             <button type="button" onClick={() => setConfig(c=>({...c, theme: 'system'}))} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${config.theme === 'system' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <Laptop size={20} className="text-slate-600 dark:text-slate-300"/>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System</span>
                            </button>
                             <button type="button" onClick={() => setConfig(c=>({...c, theme: 'light'}))} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${config.theme === 'light' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <Sun size={20} className="text-slate-600 dark:text-slate-300"/>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Light</span>
                            </button>
                            <button type="button" onClick={() => setConfig(c=>({...c, theme: 'dark'}))} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${config.theme === 'dark' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                                <Moon size={20} className="text-slate-600 dark:text-slate-300"/>
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Dark</span>
                            </button>
                        </div>
                    </OptionalConfigToggle>
                </div>
                <div className="flex gap-3 mt-8">
                    <button type="button" onClick={handleBack} className="w-full bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-3 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 flex items-center justify-center gap-2"><ArrowLeft size={18}/> Back</button>
                    <button type="button" onClick={handleNext} className="w-full bg-slate-900 dark:bg-slate-800 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-slate-700 flex items-center justify-center gap-2">Next <ArrowRight size={18}/></button>
                </div>
            </>
        );
      case 4:
        return (
            <>
                <StepIndicator current={4} total={4} labels={['Profile', 'Admin', 'Configure', 'Finish']} />
                <div className="text-center">
                    <CheckCircle size={40} className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/50 p-4 rounded-full mx-auto mb-5 border-8 border-emerald-100 dark:border-emerald-900" />
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Setup Complete!</h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-3">Your StatusPulse instance is ready. Click the button below to go to your new status page.</p>
                    <button onClick={handleFinishSetup} className="w-full mt-8 bg-slate-900 dark:bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 flex items-center justify-center gap-2">
                        Go to Dashboard <ArrowRight size={18}/>
                    </button>
                </div>
            </>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-lg bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 animate-zoom-in">
            {renderStepContent()}
        </div>
    </div>
  );
};

export default SetupWizard;
