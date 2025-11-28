import React, { useState, useRef, useEffect } from 'react';
import { LogOut, Rss, X, MailCheck, AlertCircle, Building, BookOpen, LifeBuoy, Shield, Eye, LayoutDashboard, ChevronDown, User as UserIcon, KeyRound, Info, Globe, FileText, Code, CheckCircle, BarChart2, Menu } from 'lucide-react';
import { User, AppSettings, FooterMenu as FooterMenuType, CompanyInfoLink } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  currentUser: User | null;
  onLogout: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  onSubscribe: (email: string) => boolean;
  onChangePasswordClick: () => void;
  appSettings: AppSettings;
}

const footerIconMap: { [key: string]: React.ElementType } = {
    Building, BookOpen, LifeBuoy, Globe
};

const SidebarMenu: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  menus: FooterMenuType[];
  onNavigate: (page: string) => void;
}> = ({ isOpen, onClose, menus, onNavigate }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={sidebarRef}
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white dark:bg-slate-900 shadow-2xl transition-transform duration-300 ease-in-out z-50 transform ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
        role="dialog"
        aria-modal="true"
      >
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800 dark:text-slate-200">Menu</h2>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={24} />
          </button>
        </div>
        <div className="p-6 space-y-8">
          {menus.map(menu => (
            <div key={menu.id}>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-200 tracking-wider uppercase flex items-center gap-3">
                {React.createElement(footerIconMap[menu.icon] || LifeBuoy, { size: 16 })} {menu.title}
              </h3>
              <ul className="mt-4 space-y-1">
                {menu.links.map(link => (
                  <li key={link.page}>
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(link.page);
                        onClose();
                      }}
                      className="block pl-9 pr-4 py-2 text-base text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 rounded-md transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

const ProfileMenu: React.FC<{ user: User; onLogout: () => void; onChangePassword: () => void; }> = ({ user, onLogout, onChangePassword }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                <UserIcon size={20} className="text-slate-600 dark:text-slate-300" />
                <span className="font-bold text-sm text-slate-700 dark:text-slate-300 hidden sm:inline">{user.username}</span>
                <ChevronDown size={16} className={`transition-transform text-slate-500 dark:text-slate-400 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-2 animate-zoom-in z-20">
                    <div className="p-3 border-b border-slate-200 dark:border-slate-700">
                        <p className="font-bold text-sm text-slate-900 dark:text-slate-100">{user.username}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
                    </div>
                    <div className="p-1">
                        <button onClick={() => { onChangePassword(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                            <KeyRound size={16} /> Change Password
                        </button>
                         <button onClick={() => { onLogout(); setIsOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10">
                            <LogOut size={16} /> Logout
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const popoverIconMap: { [key: string]: React.ElementType } = {
    Globe, BookOpen
};

const CreditsPopover: React.FC<{ companyName: string, links: CompanyInfoLink[] }> = ({ companyName, links }) => {
    const [isOpen, setIsOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="relative" ref={menuRef}>
            <button onClick={() => setIsOpen(!isOpen)} title="About This Product" className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200 transition-colors">
                <Info size={18} />
            </button>
            {isOpen && (
                <div className="absolute top-full right-0 mt-2 w-80 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-slate-200 dark:border-slate-700 p-4 animate-zoom-in z-20">
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">Product Information</p>
                    <div className="space-y-3 pt-2">
                         <div className="flex items-center">
                            <Building size={16} className="text-slate-400 dark:text-slate-500 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400">Official Owner</p>
                                <p style={{fontFamily: 'Inter, sans-serif'}} className="font-bold text-sm text-slate-700 dark:text-slate-200">{companyName}</p>
                            </div>
                        </div>
                        {links.map(link => {
                             const Icon = popoverIconMap[link.icon] || Globe;
                             return (
                                <a key={link.label} href={link.link} target="_blank" rel="noopener noreferrer" className="flex items-center group">
                                    <Icon className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-emerald-500 mr-3 flex-shrink-0 transition-colors" />
                                    <p className="font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{link.label}</p>
                                </a>
                             )
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

const SubscriptionModal: React.FC<{
  onClose: () => void;
  onSubscribe: (email: string) => boolean;
}> = ({ onClose, onSubscribe }) => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubscribe(email)) {
      setStatus('success');
      setMessage('Thank you for subscribing! You will now receive all status updates.');
      setEmail('');
    } else {
      setStatus('error');
      setMessage('This email is already subscribed.');
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <div ref={modalRef} className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-8 animate-zoom-in relative border border-slate-200 dark:border-slate-700">
            <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300">
                <X size={24} />
            </button>
            <div className="text-center">
                <MailCheck size={32} className="text-emerald-500 bg-emerald-50 dark:bg-emerald-900/50 p-3 rounded-full mx-auto mb-4 border-8 border-emerald-100 dark:border-emerald-900/50" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Subscribe to Updates</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">Get email notifications whenever an incident is created or updated.</p>
            </div>
            
            {status === 'success' ? (
                <div className="mt-6 text-center p-4 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-lg flex items-center gap-3">
                   <CheckCircle size={20} /> <span className="font-medium">{message}</span>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="your.email@example.com" required className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 bg-transparent text-slate-900 dark:text-white"/>
                    {status === 'error' && <p className="text-sm text-rose-500 dark:text-rose-400 flex items-center gap-2"><AlertCircle size={16}/>{message}</p>}
                    <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700">Subscribe</button>
                </form>
            )}
        </div>
    </div>
  );
};

const Layout: React.FC<LayoutProps> = ({ children, currentUser, onLogout, onNavigate, currentPage, onSubscribe, onChangePasswordClick, appSettings }) => {
    const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        const favicon = document.getElementById('favicon') as HTMLLinkElement | null;
        if (favicon && appSettings.faviconUrl) {
            favicon.href = appSettings.faviconUrl;
        }
    }, [appSettings.faviconUrl]);

    const isStaticOrPublic = ['public', 'details'].includes(currentPage) || !['admin'].includes(currentPage);
    
    const appName = appSettings.appName || "StatusPulse";

    return (
        <>
            <div className="min-h-screen flex flex-col">
                <header className="sticky top-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-b border-slate-200 dark:border-slate-800 z-40">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between h-16">
                            <button onClick={() => onNavigate('public')} className="flex items-center gap-3 text-slate-800 dark:text-slate-200 group transition-colors">
                                <div className="w-9 h-9 p-1 flex items-center justify-center bg-emerald-500 rounded-md text-white">
                                    <img src={appSettings.logoUrl} alt={`${appName} Logo`} className="w-full h-full object-contain" />
                                </div>
                                <div className="text-left">
                                    <span className="text-xl font-bold tracking-tight text-slate-800 dark:text-slate-200">{appName}</span>
                                </div>
                            </button>
                            
                            <div className="flex items-center gap-3">
                                <nav className="hidden md:flex items-center gap-2">
                                     <button onClick={() => onNavigate('public')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold ${isStaticOrPublic ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><BarChart2 size={16}/>Status</button>
                                     <button onClick={() => onNavigate('admin')} className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-bold ${currentPage === 'admin' ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/50' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}><LayoutDashboard size={16}/>Dashboard</button>
                                </nav>
                                
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>

                                <button onClick={() => setShowSubscriptionModal(true)} className="hidden sm:flex items-center gap-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-sm px-4 py-2 rounded-lg transition-colors">
                                    <Rss size={16} /> Subscribe
                                </button>

                                {currentUser ? (
                                    <ProfileMenu user={currentUser} onLogout={onLogout} onChangePassword={onChangePasswordClick} />
                                ) : (
                                    <button onClick={() => onNavigate('admin')} className="flex md:hidden items-center gap-2 bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
                                        <LayoutDashboard size={20} className="text-slate-600 dark:text-slate-300" />
                                    </button>
                                )}

                                {appSettings.showConzexCredits && (
                                     <CreditsPopover companyName={appSettings.companyName} links={appSettings.companyInfoLinks} />
                                )}
                                <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 hidden md:block mx-1"></div>
                                <button onClick={() => setIsSidebarOpen(true)} className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                                    <Menu size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                    {children}
                </main>

                <footer className="bg-slate-100 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
                       <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                           <a href="#" onClick={(e) => { e.preventDefault(); onNavigate('public'); }} className="flex items-center gap-3">
                                <div className="w-9 h-9 p-1 flex items-center justify-center bg-emerald-500 rounded-md text-white">
                                    <img src={appSettings.logoUrl} alt={`${appName} Footer Logo`} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-lg font-bold text-slate-800 dark:text-slate-200">{appName}</span>
                            </a>
                            <p className="text-slate-500 dark:text-slate-400 text-sm text-center sm:text-right">{appSettings.footerCredit}</p>
                       </div>
                    </div>
                </footer>
            </div>
            
            {showSubscriptionModal && <SubscriptionModal onClose={() => setShowSubscriptionModal(false)} onSubscribe={onSubscribe} />}
            <SidebarMenu 
                isOpen={isSidebarOpen} 
                onClose={() => setIsSidebarOpen(false)} 
                menus={appSettings.footerMenus}
                onNavigate={onNavigate}
            />
        </>
    );
};

export default Layout;