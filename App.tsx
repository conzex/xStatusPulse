import React, { useState, useEffect } from 'react';
import { useStatusStore } from './services/mockStore';
import Layout from './components/Layout';
import PublicStatus from './pages/PublicStatus';
import AdminDashboard from './pages/AdminDashboard';
import ServiceDetails from './pages/ServiceDetails';
import SetupWizard from './pages/SetupWizard';
import ProfilePasswordModal from './components/ProfilePasswordModal';
import ForcePasswordChangeModal from './components/ForcePasswordChangeModal';

// Static Pages
import Contact from './pages/static/Contact';
import Disclaimer from './pages/static/Disclaimer';
import FAQ from './pages/static/FAQ';
import Privacy from './pages/static/Privacy';
import Terms from './pages/static/Terms';
import About from './pages/static/About';
import Download from './pages/static/Download';
import Features from './pages/static/Features';
import Requirements from './pages/static/Requirements';
import WhyStatusPulse from './pages/static/WhyStatusPulse';
import { Shield } from 'lucide-react';

const App: React.FC = () => {
  const store = useStatusStore();
  const [currentPage, setCurrentPage] = useState<string>('public');
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [loginError, setLoginError] = useState(false);
  const [showProfilePasswordModal, setShowProfilePasswordModal] = useState(false);
  
  useEffect(() => {
    const applyTheme = () => {
      const theme = store.theme; // Direct access from hook
      const root = window.document.documentElement;
      const isDark =
        theme === 'dark' ||
        (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
      
      root.classList.toggle('dark', isDark);
    };

    applyTheme();
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', applyTheme);
    
    // The useStatusStore hook already re-renders on state change,
    // so an explicit store.subscribe is not needed here for the theme.
    // The hook handles the subscription via useSyncExternalStore.

    return () => {
      mediaQuery.removeEventListener('change', applyTheme);
    };
  }, [store.theme]);

  if (!store.isSetupComplete) {
    return (
      <SetupWizard
        onComplete={(config) => {
          store.initializeEnvironment(config);
        }}
        changePassword={(pass) => store.changePassword(store.users[0].id, pass)}
        adminUser={store.users[0]}
        testSmtpConnection={store.testSmtpConnection}
      />
    );
  }

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (store.login(usernameInput, passwordInput)) {
      setLoginError(false);
      setPasswordInput('');
      setUsernameInput('');
    } else {
      setLoginError(true);
    }
  };

  const navigateToService = (id: string) => {
    setSelectedServiceId(id);
    setCurrentPage('details');
  };

  const navigateBack = () => {
    setSelectedServiceId(null);
    setCurrentPage('public');
  };

  const handleNavChange = (page: string) => {
    setCurrentPage(page);
    setSelectedServiceId(null);
  };
  
  const staticPages: Record<string, React.ReactNode> = {
    'contact': <Contact contactDetails={store.appSettings.contactDetails} />,
    'disclaimer': <Disclaimer />,
    'faq': <FAQ />,
    'privacy': <Privacy />,
    'terms': <Terms />,
    'about': <About />,
    'download': <Download />,
    'features': <Features />,
    'requirements': <Requirements />,
    'why-statuspulse': <WhyStatusPulse />,
  };
  
  if (store.currentUser?.forcePasswordChange) {
      return (
          <ForcePasswordChangeModal 
              user={store.currentUser}
              onPasswordChanged={(newPass) => {
                  store.changePassword(store.currentUser!.id, newPass)
              }}
          />
      )
  }

  const renderContent = () => {
    if (staticPages[currentPage]) {
      return staticPages[currentPage];
    }
    
    if (currentPage === 'details' && selectedServiceId) {
      const service = store.allServices.find(s => s.id === selectedServiceId);
      if (service) {
        return (
          <ServiceDetails 
            service={service} 
            incidents={store.incidents}
            onBack={navigateBack}
          />
        );
      }
      setCurrentPage('public');
    }

    if (currentPage === 'public') {
      return (
        <PublicStatus 
            serviceGroups={store.serviceGroups} 
            incidents={store.incidents} 
            onServiceClick={navigateToService}
            allServices={store.allServices}
        />
      );
    }

    if (currentPage === 'admin') {
      if (!store.currentUser) {
        return (
          <div className="flex items-center justify-center pt-16 sm:pt-24 animate-fade-in">
            <div className="bg-white dark:bg-slate-800 p-8 sm:p-10 rounded-2xl shadow-lg border border-slate-200 dark:border-slate-700 w-full max-w-md">
              <div className="text-center mb-8">
                 <Shield className="w-12 h-12 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/50 p-3 rounded-full mx-auto mb-4 border-8 border-emerald-100 dark:border-emerald-900/50" />
                <h2 className="text-3xl font-bold text-slate-900 dark:text-slate-100">Admin Login</h2>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Access the StatusPulse dashboard.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                 <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Username</label>
                  <input 
                    type="text" 
                    placeholder="Enter username" 
                    className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${loginError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 dark:border-slate-600'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                    value={usernameInput}
                    onChange={(e) => {
                        setUsernameInput(e.target.value)
                        setLoginError(false);
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter password" 
                    className={`w-full px-4 py-3 rounded-lg border bg-white dark:bg-slate-700 text-slate-900 dark:text-white ${loginError ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-300 dark:border-slate-600'} focus:ring-2 focus:ring-emerald-500 outline-none transition-all`}
                    value={passwordInput}
                    onChange={(e) => {
                        setPasswordInput(e.target.value)
                        setLoginError(false);
                    }}
                  />
                </div>
                {loginError && <p className="text-rose-500 dark:text-rose-400 text-sm font-medium text-center pt-2">Incorrect username or password.</p>}
                <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-3 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 dark:focus:ring-emerald-500">
                  Sign In
                </button>
              </form>
            </div>
          </div>
        );
      }

      return (
        <AdminDashboard 
          serviceGroups={store.serviceGroups}
          allServices={store.allServices}
          incidents={store.incidents}
          subscribers={store.subscribers}
          smtpSettings={store.smtpSettings}
          appSettings={store.appSettings}
          users={store.users}
          currentUser={store.currentUser}
          theme={store.theme}
          setTheme={store.setTheme}
          updateAppSettings={store.updateAppSettings}
          restoreDefaultAppSettings={store.restoreDefaultAppSettings}
          addService={store.addService}
          updateService={store.updateService}
          deleteService={store.deleteService}
          addServiceGroup={store.addServiceGroup}
          updateServiceGroup={store.updateServiceGroup}
          deleteServiceGroup={store.deleteServiceGroup}
          addIncident={store.addIncident}
          addIncidentUpdate={store.addIncidentUpdate}
          updateSmtpSettings={store.updateSmtpSettings}
          addUser={store.addUser}
          deleteUser={store.deleteUser}
          importSubscribers={store.importSubscribers}
          testSmtpConnection={store.testSmtpConnection}
          forcePasswordReset={store.forcePasswordReset}
          resetApplication={store.resetApplication}
        />
      );
    }
  };

  return (
    <>
      <Layout 
        currentUser={store.currentUser} 
        onLogout={() => {
          store.logout();
          setCurrentPage('public');
        }}
        onNavigate={(page) => handleNavChange(page)}
        currentPage={currentPage}
        onSubscribe={store.addSubscriber}
        onChangePasswordClick={() => setShowProfilePasswordModal(true)}
        appSettings={store.appSettings}
      >
        {renderContent()}
      </Layout>
      {showProfilePasswordModal && store.currentUser && (
        <ProfilePasswordModal
            user={store.currentUser}
            onClose={() => setShowProfilePasswordModal(false)}
            onChangePassword={store.changeUserPassword}
        />
      )}
    </>
  );
};

export default App;
