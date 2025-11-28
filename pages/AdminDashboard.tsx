import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Service, ServiceType, ServiceStatus, Incident, IncidentStatus, ServiceGroup, Subscriber, SMTPSettings, User, UserRole, Theme, AppSettings, ContactDetail, IncidentPriority } from '../types';
import { generateInitialIncidentReport, generateIncidentUpdate } from '../services/geminiService';
import { Plus, Trash2, Sparkles, X, MessageSquare, Monitor as MonitorIcon, AlertTriangle, CheckCircle, Settings, Users, ChevronRight, Edit2, Shield, LifeBuoy, Mail, Server, Eye, EyeOff, Upload, Download, FileCheck, FileX, RefreshCcw, Palette, Laptop, Sun, Moon, RefreshCw, KeyRound, Send, ChevronDown, MoveVertical, Info, Radiation, Flame, Triangle, Layers, Image as ImageIcon, Star } from 'lucide-react';
// FIX: Corrected typo from INCIDENTS_STATUS_THEME to INCIDENT_STATUS_THEME.
import { STATUS_COLORS, STATUS_TAG_CLASSES, DEFAULT_SERVICE_PORTS, SERVICE_ICONS_MAP, INCIDENT_STATUS_THEME, INCIDENT_PRIORITY_THEME } from '../constants';

// --- PROPS INTERFACE ---
interface AdminDashboardProps {
  serviceGroups: ServiceGroup[];
  allServices: Service[];
  incidents: Incident[];
  subscribers: Subscriber[];
  smtpSettings: SMTPSettings;
  appSettings: AppSettings;
  users: User[];
  currentUser: User | null;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  updateAppSettings: (settings: Partial<AppSettings>) => void;
  restoreDefaultAppSettings: () => void;
  addService: (svc: any, groupId: string) => void;
  updateService: (id: string, updatedSvcData: Partial<Service>) => void;
  deleteService: (id: string) => void;
  addServiceGroup: (name: string, desc: string) => void;
  updateServiceGroup: (id: string, name: string, desc: string) => void;
  deleteServiceGroup: (id: string) => void;
  addIncident: (incident: any) => void;
  addIncidentUpdate: (incidentId: string, update: { status: IncidentStatus, message: string }) => void;
  updateSmtpSettings: (settings: SMTPSettings) => void;
  addUser: (username: string, role: UserRole, password: string) => boolean;
  deleteUser: (id: string) => void;
  importSubscribers: (csvData: string) => { imported: number; duplicates: number; invalid: number };
  testSmtpConnection: (settings: SMTPSettings, recipientEmail: string) => Promise<{ success: boolean; message: string }>;
  forcePasswordReset: (userId: string) => boolean;
  resetApplication: () => void;
}

// --- REUSABLE COMPONENTS ---
const StatCard: React.FC<{ title: string, value: number | string, color: string, icon: React.ElementType }> = ({ title, value, color, icon: Icon }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex items-start justify-between">
        <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
            <p className={`text-3xl font-bold text-slate-900 dark:text-slate-100 mt-1 ${color}`}>{value}</p>
        </div>
        <div className={`p-3 rounded-full ${color.replace('text', 'bg').replace('-600', '-100').replace('-500', '-100').replace('-900', '-100')} dark:bg-opacity-10 ${color}`}>
            <Icon size={20} />
        </div>
    </div>
);

const Modal: React.FC<{ title: string | React.ReactNode; children: React.ReactNode; onClose: () => void; maxWidth?: string; }> = ({ title, children, onClose, maxWidth = 'max-w-lg' }) => {
    const modalContent = (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full ${maxWidth} p-8 animate-zoom-in relative border border-slate-200 dark:border-slate-700`}>
                <button onClick={onClose} className="absolute top-4 right-4 p-1 rounded-full text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-300">
                    <X size={24} />
                </button>
                <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-6 flex items-center gap-3">{title}</h3>
                {children}
            </div>
        </div>
    );
    return createPortal(modalContent, document.body);
};


const ConfirmationModal: React.FC<{ title: string, message: string, onConfirm: () => void, onClose: () => void, confirmText?: string }> = ({ title, message, onConfirm, onClose, confirmText = "Confirm" }) => (
    <Modal title={title} onClose={onClose}>
        <p className="text-slate-500 dark:text-slate-400 mb-6">{message}</p>
        <div className="flex justify-end gap-3">
            <button onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
            <button onClick={onConfirm} className="bg-rose-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-rose-700">{confirmText}</button>
        </div>
    </Modal>
);

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

const ToggleSwitch: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label: string }> = ({ checked, onChange, label }) => (
    <label className="flex items-center justify-between cursor-pointer">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
      <div className="relative">
        <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <div className={`block w-12 h-6 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${checked ? 'translate-x-6' : ''}`}></div>
      </div>
    </label>
);

const Toast: React.FC<{ message: string; onDismiss: () => void }> = ({ message, onDismiss }) => {
    useEffect(() => {
        const timer = setTimeout(onDismiss, 3000);
        return () => clearTimeout(timer);
    }, [onDismiss]);

    return createPortal(
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-3 animate-zoom-in z-50">
            <CheckCircle size={18} className="text-emerald-400" />
            <span className="font-bold text-sm">{message}</span>
        </div>,
        document.body
    );
};


// --- TAB CONTENT COMPONENTS ---

const MonitorsTab: React.FC<Pick<AdminDashboardProps, 'serviceGroups' | 'addService' | 'updateService' | 'deleteService' | 'addServiceGroup' | 'updateServiceGroup' | 'deleteServiceGroup'>> = (props) => {
    const [showAddGroup, setShowAddGroup] = useState(false);
    const [showEditGroup, setShowEditGroup] = useState<ServiceGroup | null>(null);
    const [groupName, setGroupName] = useState('');
    const [groupDesc, setGroupDesc] = useState('');
    
    const [showServiceModal, setShowServiceModal] = useState<{ group: string; service?: Service } | null>(null);
    const [serviceData, setServiceData] = useState<Partial<Service>>({});

    const [confirmDelete, setConfirmDelete] = useState<{type: 'group' | 'service', id: string, name: string} | null>(null);

    const handleOpenEditGroup = (group: ServiceGroup) => {
        setGroupName(group.name);
        setGroupDesc(group.description);
        setShowEditGroup(group);
    };

    const handleGroupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (groupName.trim()) {
            if (showEditGroup) {
                props.updateServiceGroup(showEditGroup.id, groupName, groupDesc);
            } else {
                props.addServiceGroup(groupName, groupDesc);
            }
            setGroupName(''); setGroupDesc(''); 
            setShowAddGroup(false);
            setShowEditGroup(null);
            scrollToTop();
        }
    };
    
    const handleServiceSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (serviceData.name?.trim() && showServiceModal) {
            const finalServiceData = { ...serviceData, port: serviceData.port ? Number(serviceData.port) : undefined };
            if (showServiceModal.service) { // Editing existing service
                 props.updateService(showServiceModal.service.id, finalServiceData);
            } else { // Adding new service
                props.addService(finalServiceData, showServiceModal.group);
            }
            setShowServiceModal(null);
            setServiceData({});
            scrollToTop();
        }
    };
    
    const openAddServiceModal = (groupId?: string) => {
        setServiceData({ name: '', type: ServiceType.HTTPS, url: '', port: 443, publiclyDisplayDetails: true, description: '' });
        setShowServiceModal({ group: groupId || props.serviceGroups[0]?.id });
    };

    const openEditServiceModal = (service: Service, groupId: string) => {
        setServiceData({...service});
        setShowServiceModal({ group: groupId, service: service });
    };

    useEffect(() => {
        if (showServiceModal && !showServiceModal.service) {
            const port = DEFAULT_SERVICE_PORTS[serviceData.type as ServiceType];
            setServiceData(s => ({ ...s, port: port }));
        }
    }, [serviceData.type, showServiceModal]);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Monitors</h2>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => openAddServiceModal()} 
                        disabled={props.serviceGroups.length === 0}
                        className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus size={16}/>Add Monitor
                    </button>
                    <button 
                        onClick={() => { setGroupName(''); setGroupDesc(''); setShowAddGroup(true); }} 
                        className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-emerald-700"
                    >
                        <Plus size={16}/>Add Group
                    </button>
                </div>
            </div>
            {props.serviceGroups.length === 0 ? (
                <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <Layers size={40} className="mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">No Monitor Groups Created</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Get started by creating a group to organize your monitors.</p>
                    <button onClick={() => { setGroupName(''); setGroupDesc(''); setShowAddGroup(true); }} className="mt-6 flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-emerald-700 mx-auto"><Plus size={16}/>Create Your First Group</button>
                </div>
            ) : (
                props.serviceGroups.map(group => (
                    <div key={group.id} className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{group.name}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{group.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleOpenEditGroup(group)} className="text-slate-400 hover:text-emerald-500"><Edit2 size={16} /></button>
                                <button onClick={() => setConfirmDelete({ type: 'group', id: group.id, name: group.name })} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                            </div>
                        </div>
                        <div className="mt-4 space-y-3">
                            {group.services.map(service => (
                                <div key={service.id} className="flex justify-between items-center p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                    <div>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{service.name}</span>
                                        <span className={`ml-3 text-xs font-bold px-2 py-0.5 rounded ${STATUS_TAG_CLASSES[service.status]}`}>{service.status.replace('_', ' ')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button onClick={() => openEditServiceModal(service, group.id)} className="text-slate-400 hover:text-emerald-500"><Edit2 size={16} /></button>
                                        <button onClick={() => setConfirmDelete({ type: 'service', id: service.id, name: service.name })} className="text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))
            )}
            {(showAddGroup || showEditGroup) && (
                 <Modal 
                    title={
                        <>
                            {showEditGroup ? <Edit2 size={20}/> : <Layers size={20}/>}
                            {showEditGroup ? "Edit Service Group" : "Add New Service Group"}
                        </>
                    } 
                    onClose={() => { setShowAddGroup(false); setShowEditGroup(null); }}
                >
                    <form onSubmit={handleGroupSubmit} className="space-y-4 pt-4">
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Group Name</label>
                            <input required value={groupName} onChange={e => setGroupName(e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Description</label>
                            <input required value={groupDesc} onChange={e => setGroupDesc(e.target.value)} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                        </div>
                        <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4 hover:bg-slate-800 dark:hover:bg-emerald-700">{showEditGroup ? 'Save Changes' : 'Add Group'}</button>
                    </form>
                </Modal>
            )}
            {showServiceModal && (
                <Modal 
                    title={
                        <>
                            {showServiceModal.service ? <Edit2 size={20}/> : <MonitorIcon size={20}/>}
                            {showServiceModal.service ? 'Edit Monitor' : 'Add New Monitor'}
                        </>
                    } 
                    onClose={() => setShowServiceModal(null)}
                >
                    <form onSubmit={handleServiceSubmit} className="space-y-4 pt-4">
                        {props.serviceGroups.length > 1 && (
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Service Group</label>
                                <select 
                                    value={showServiceModal.group} 
                                    onChange={e => setShowServiceModal(s => s ? ({...s, group: e.target.value}) : null)} 
                                    className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white"
                                >
                                    {props.serviceGroups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                        )}
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Monitor Name</label>
                            <input required value={serviceData.name} onChange={e => setServiceData(s => ({...s, name: e.target.value}))} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Monitor Type</label>
                            <select value={serviceData.type} onChange={e => setServiceData(s => ({...s, type: e.target.value as ServiceType}))} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white">
                                <option disabled>Select Type</option>{Object.values(ServiceType).map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-300">URL or IP</label>
                                <input value={serviceData.url} onChange={e => setServiceData(s => ({...s, url: e.target.value}))} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Port</label>
                                <input type="number" value={serviceData.port || ''} onChange={e => setServiceData(s => ({...s, port: Number(e.target.value)}))} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-bold text-slate-600 dark:text-slate-300">Description</label>
                            <input value={serviceData.description} onChange={e => setServiceData(s => ({...s, description: e.target.value}))} className="w-full border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 text-slate-900 dark:text-white placeholder-slate-400"/>
                        </div>
                        <div className="pt-2">
                            <ToggleSwitch 
                                checked={serviceData.publiclyDisplayDetails || false} 
                                onChange={checked => setServiceData(s => ({...s, publiclyDisplayDetails: checked}))}
                                label="Show host/IP details on public page"
                            />
                        </div>
                        <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-2.5 rounded-lg mt-4 hover:bg-slate-800 dark:hover:bg-emerald-700">{showServiceModal.service ? 'Save Changes' : 'Add Monitor'}</button>
                    </form>
                </Modal>
            )}
             {confirmDelete && (
                <ConfirmationModal 
                    title={`Delete ${confirmDelete.type === 'group' ? 'Service Group' : 'Monitor'}`}
                    message={`Are you sure you want to delete "${confirmDelete.name}"? All associated data, including incident history, will be permanently removed. This action is irreversible.`}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => {
                        if (confirmDelete.type === 'group') props.deleteServiceGroup(confirmDelete.id);
                        else props.deleteService(confirmDelete.id);
                        setConfirmDelete(null);
                        scrollToTop();
                    }}
                    confirmText="Yes, Delete"
                />
            )}
        </div>
    );
};

const IncidentsTab: React.FC<Pick<AdminDashboardProps, 'incidents' | 'allServices' | 'addIncident' | 'addIncidentUpdate'>> = (props) => {
    const [showCreate, setShowCreate] = useState(false);
    const [showUpdate, setShowUpdate] = useState<Incident | null>(null);
    const [newIncident, setNewIncident] = useState({ title: '', details: '', affected: [] as string[], message: '', status: 'investigating' as IncidentStatus, priority: IncidentPriority.MEDIUM });
    const [newUpdate, setNewUpdate] = useState({ message: '', status: 'identified' as IncidentStatus });
    const [isGenerating, setIsGenerating] = useState(false);

    const handleGenerateInitial = async () => {
        if (!newIncident.title || !newIncident.details) return;
        setIsGenerating(true);
        const serviceNames = newIncident.affected.map(id => props.allServices.find(s => s.id === id)?.name || 'a service').join(', ');
        const report = await generateInitialIncidentReport(serviceNames, newIncident.details);
        setNewIncident(i => ({ ...i, message: report }));
        setIsGenerating(false);
    };

    const handleCreateIncident = (e: React.FormEvent) => {
        e.preventDefault();
        props.addIncident({
            title: newIncident.title,
            priority: newIncident.priority,
            affectedServiceIds: newIncident.affected.length > 0 ? newIncident.affected : ['global'],
            initialUpdate: { status: newIncident.status, message: newIncident.message }
        });
        setNewIncident({ title: '', details: '', affected: [], message: '', status: 'investigating', priority: IncidentPriority.MEDIUM });
        setShowCreate(false);
        scrollToTop();
    };
    
    const handleGenerateUpdate = async () => {
        if (!showUpdate) return;
        setIsGenerating(true);
        const report = await generateIncidentUpdate(showUpdate.title, newUpdate.status, showUpdate.updates);
        setNewUpdate(u => ({ ...u, message: report }));
        setIsGenerating(false);
    };

    const handleUpdateIncident = (e: React.FormEvent) => {
        e.preventDefault();
        if (!showUpdate) return;
        props.addIncidentUpdate(showUpdate.id, { status: newUpdate.status, message: newUpdate.message });
        setNewUpdate({ message: '', status: 'identified' });
        setShowUpdate(null);
        scrollToTop();
    };


    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Incidents</h2>
                <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-emerald-700"><Plus size={16}/>Create Incident</button>
            </div>
            {props.incidents.length === 0 ? (
                <div className="text-center bg-white dark:bg-slate-800 p-12 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700">
                    <CheckCircle size={40} className="mx-auto text-emerald-500 mb-4" />
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">All Clear!</h3>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">There are no active or past incidents to display. All systems are running smoothly.</p>
                </div>
            ) : (
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
                    {props.incidents.map(inc => {
                        const latestUpdate = inc.updates[0];
                        const priorityTheme = INCIDENT_PRIORITY_THEME[inc.priority];
                        return (
                            <div key={inc.id} className="flex flex-col md:flex-row justify-between md:items-center p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                                <div>
                                    <p className="font-bold text-slate-800 dark:text-slate-200">{inc.title}</p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{new Date(inc.createdAt).toLocaleString()}</p>
                                </div>
                                <div className="flex items-center gap-3 mt-3 md:mt-0">
                                    <span className={`text-xs font-bold px-2 py-1 rounded-md uppercase border ${priorityTheme.classes}`}>{priorityTheme.text}</span>
                                    <span className={`text-xs font-bold px-2 py-1 rounded uppercase ${latestUpdate.status === 'resolved' ? STATUS_TAG_CLASSES.operational : STATUS_TAG_CLASSES.major_outage}`}>{latestUpdate.status}</span>
                                    <button onClick={() => setShowUpdate(inc)} className="flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-500 hover:underline"><MessageSquare size={14}/>Post Update</button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
            {showCreate && (
                <Modal title={<><AlertTriangle size={20}/>Create New Incident</>} onClose={() => setShowCreate(false)} maxWidth="max-w-2xl">
                    <form onSubmit={handleCreateIncident} className="space-y-4 pt-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Title</label><input required value={newIncident.title} onChange={e => setNewIncident(i => ({...i, title: e.target.value}))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                            <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Priority</label><select value={newIncident.priority} onChange={e => setNewIncident(i => ({...i, priority: e.target.value as IncidentPriority}))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white capitalize">{Object.values(IncidentPriority).map(p => <option key={p} value={p}>{p}</option>)}</select></div>
                        </div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Affected Services</label><select multiple value={newIncident.affected} onChange={e => setNewIncident(i => ({...i, affected: Array.from(e.target.selectedOptions, option => option.value)}))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white h-24"><option value="global">All Services</option>{props.allServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Initial Issue Details (for AI)</label><textarea placeholder="e.g., API is returning 500 errors, database connection is slow..." value={newIncident.details} onChange={e => setNewIncident(i => ({...i, details: e.target.value}))} rows={2} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Initial Status</label><select value={newIncident.status} onChange={e => setNewIncident(i => ({...i, status: e.target.value as IncidentStatus}))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white">{Object.entries(INCIDENT_STATUS_THEME).map(([key, { text }]) => <option key={key} value={key}>{text}</option>)}</select></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Update Message</label><textarea required value={newIncident.message} onChange={e => setNewIncident(i => ({...i, message: e.target.value}))} rows={4} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        <button type="button" onClick={handleGenerateInitial} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold py-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50"><Sparkles size={16}/>{isGenerating ? 'Generating...' : 'Generate with AI'}</button>
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700">Create Incident</button>
                    </form>
                </Modal>
            )}
            {showUpdate && (
                <Modal title={<>Update: {showUpdate.title}</>} onClose={() => setShowUpdate(null)} maxWidth="max-w-2xl">
                    <form onSubmit={handleUpdateIncident} className="space-y-4 pt-4">
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">New Status</label><select value={newUpdate.status} onChange={e => setNewUpdate(u => ({...u, status: e.target.value as IncidentStatus}))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white">{Object.entries(INCIDENT_STATUS_THEME).map(([key, { text }]) => <option key={key} value={key}>{text}</option>)}</select></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Update Message</label><textarea required value={newUpdate.message} onChange={e => setNewUpdate(u => ({...u, message: e.target.value}))} rows={4} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        <button type="button" onClick={handleGenerateUpdate} disabled={isGenerating} className="w-full flex justify-center items-center gap-2 bg-emerald-50 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 font-bold py-2 rounded-lg hover:bg-emerald-100 disabled:opacity-50"><Sparkles size={16}/>{isGenerating ? 'Generating...' : 'Generate with AI'}</button>
                        <button type="submit" className="w-full bg-slate-900 text-white font-bold py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-slate-700">Post Update</button>
                    </form>
                </Modal>
            )}
        </div>
    );
};

const UsersTab: React.FC<Pick<AdminDashboardProps, 'users' | 'currentUser' | 'addUser' | 'deleteUser' | 'forcePasswordReset'>> = (props) => {
    const [showAdd, setShowAdd] = useState(false);
    const [newUser, setNewUser] = useState({ username: '', role: UserRole.VIEWER, password: '' });
    const [error, setError] = useState('');
    const [confirmDelete, setConfirmDelete] = useState<User | null>(null);

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (newUser.password.length < 6) {
            setError("Password must be at least 6 characters long.");
            return;
        }
        if (props.addUser(newUser.username, newUser.role, newUser.password)) {
            setShowAdd(false);
            setNewUser({ username: '', role: UserRole.VIEWER, password: '' });
        } else {
            setError("A user with this username already exists.");
        }
    };
    
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Users</h2>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 bg-slate-900 dark:bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:hover:bg-emerald-700"><Plus size={16}/>Add User</button>
            </div>
             <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                <table className="w-full">
                    <thead>
                        <tr className="border-b dark:border-slate-700">
                            <th className="text-left p-3 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Username</th>
                            <th className="text-left p-3 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Role</th>
                            <th className="text-right p-3 text-xs uppercase font-bold text-slate-500 dark:text-slate-400">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {props.users.map(user => (
                            <tr key={user.id} className="border-b dark:border-slate-700 last:border-b-0">
                                <td className="p-3 font-medium text-slate-700 dark:text-slate-300">{user.username} {user.id === props.currentUser?.id && '(You)'}</td>
                                <td className="p-3 text-slate-600 dark:text-slate-400 capitalize">{user.role.replace('_', ' ')}</td>
                                <td className="p-3">
                                    <div className="flex justify-end gap-2">
                                        {user.role !== UserRole.SUPER_ADMIN && (
                                            <>
                                                <button onClick={() => props.forcePasswordReset(user.id)} title="Force Password Reset" className="p-2 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400"><KeyRound size={16}/></button>
                                                <button onClick={() => setConfirmDelete(user)} title="Delete User" className="p-2 text-slate-500 hover:text-rose-600 dark:hover:text-rose-400"><Trash2 size={16}/></button>
                                            </>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
             {showAdd && (
                <Modal title={<><Users size={20}/> Add New User</>} onClose={() => setShowAdd(false)}>
                    <form onSubmit={handleAddUser} className="space-y-4 pt-4">
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Username</label><input required value={newUser.username} onChange={e => setNewUser(u => ({...u, username: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Role</label><select value={newUser.role} onChange={e => setNewUser(u => ({...u, role: e.target.value as UserRole}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white"><option value={UserRole.VIEWER}>Viewer</option><option value={UserRole.MANAGER}>Manager</option></select></div>
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Password</label><input required type="password" value={newUser.password} onChange={e => setNewUser(u => ({...u, password: e.target.value}))} className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        {error && <p className="text-sm text-rose-500">{error}</p>}
                        <button type="submit" className="w-full bg-slate-900 dark:bg-emerald-600 text-white font-bold py-2 rounded-lg hover:bg-slate-800 dark:hover:bg-emerald-700">Add User</button>
                    </form>
                </Modal>
            )}
            {confirmDelete && (
                <ConfirmationModal 
                    title="Delete User"
                    message={`Are you sure you want to delete the user "${confirmDelete.username}"? This action is irreversible.`}
                    onClose={() => setConfirmDelete(null)}
                    onConfirm={() => {
                        props.deleteUser(confirmDelete.id);
                        setConfirmDelete(null);
                    }}
                    confirmText="Yes, Delete"
                />
            )}
        </div>
    );
};

const TestSmtpModal: React.FC<{
    onClose: () => void;
    onTest: (email: string) => void;
    status: 'idle' | 'testing' | 'success' | 'error';
    message: string;
}> = ({ onClose, onTest, status, message }) => {
    const [email, setEmail] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onTest(email);
    };

    return (
        <Modal title={<><Send size={20}/>Test SMTP Connection</>} onClose={onClose}>
            <form onSubmit={handleSubmit} className="pt-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">Enter an email address to send a test notification to. This will verify that your SMTP credentials and server settings are correct.</p>
                <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="recipient@example.com"
                    required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"
                />
                 <div className="flex justify-end gap-3 pt-4">
                    <button type="button" onClick={onClose} className="bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600">Cancel</button>
                    <button type="submit" disabled={status === 'testing'} className="flex items-center gap-2 bg-emerald-600 text-white py-2 px-4 rounded-lg font-bold hover:bg-emerald-700 disabled:opacity-50">
                        {status === 'testing' && <RefreshCw size={16} className="animate-spin" />} Send Test Email
                    </button>
                 </div>
                  {message && (
                    <div className={`mt-4 text-sm p-3 rounded-lg flex items-start gap-2 ${status === 'success' ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' : 'bg-rose-50 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300'}`}>
                        {status === 'success' ? <CheckCircle size={16} className="text-emerald-500 mt-0.5"/> : <AlertTriangle size={16} className="text-rose-500 mt-0.5"/>}
                        <span>{message}</span>
                    </div>
                  )}
            </form>
        </Modal>
    );
};

const SettingsTab: React.FC<Pick<AdminDashboardProps, 'smtpSettings' | 'subscribers' | 'theme' | 'appSettings' | 'updateSmtpSettings' | 'testSmtpConnection' | 'importSubscribers' | 'setTheme' | 'resetApplication' | 'updateAppSettings' | 'restoreDefaultAppSettings'>> = (props) => {
    const [smtp, setSmtp] = useState(props.smtpSettings);
    const [appSettings, setAppSettings] = useState(props.appSettings);
    const [contactDetails, setContactDetails] = useState(props.appSettings.contactDetails);
    
    const [showTestSmtpModal, setShowTestSmtpModal] = useState(false);
    const [smtpTestStatus, setSmtpTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
    const [smtpTestMessage, setSmtpTestMessage] = useState('');
    const [isSmtpTested, setIsSmtpTested] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importResult, setImportResult] = useState<{ imported: number; duplicates: number; invalid: number } | null>(null);
    const [showResetWizard, setShowResetWizard] = useState(false);
    const [activeContact, setActiveContact] = useState<string | null>(null);
    const [toastMessage, setToastMessage] = useState<string | null>(null);

    const isMounted = useRef(true);
    useEffect(() => {
        isMounted.current = true;
        return () => { isMounted.current = false; };
    }, []);
    
    useEffect(() => {
        if (isMounted.current) {
            setAppSettings(props.appSettings);
            setContactDetails(props.appSettings.contactDetails);
        }
    }, [props.appSettings]);

    const showToast = (message: string) => {
        setToastMessage(message);
    };

    const handleSmtpChange = (field: keyof SMTPSettings, value: string | number) => {
        setSmtp(s => ({ ...s, [field]: value }));
        setIsSmtpTested(false); // Require re-test on change
    };

    const handleSmtpSave = () => {
        props.updateSmtpSettings({ ...smtp, port: smtp.port ? Number(smtp.port) : null });
        showToast("SMTP settings saved!");
    };
    
    const applySmtpPreset = (preset: 'gmail' | 'outlook' | 'zoho' | 'other') => {
        const presets = {
            gmail: { host: 'smtp.gmail.com', port: 587, secure: true },
            outlook: { host: 'smtp.office365.com', port: 587, secure: true },
            zoho: { host: 'smtp.zoho.com', port: 587, secure: true },
            other: { host: '', port: 587, secure: true }
        };
        setSmtp(s => ({ ...s, ...presets[preset] }));
        setIsSmtpTested(false);
    };

    const handleSmtpTest = async (recipientEmail: string) => {
        setSmtpTestStatus('testing');
        setSmtpTestMessage('');
        const result = await props.testSmtpConnection({ ...smtp, port: smtp.port ? Number(smtp.port) : null }, recipientEmail);
        setSmtpTestMessage(result.message);
        setSmtpTestStatus(result.success ? 'success' : 'error');
        if (result.success) setIsSmtpTested(true);
    };
    
    const handleExport = () => {
        const csvContent = "data:text/csv;charset=utf-8," + props.subscribers.map(s => s.email).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "statuspulse_subscribers.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                const text = reader.result as string;
                if (text) {
                    const result = props.importSubscribers(text);
                    setImportResult(result);
                    showToast(`${result.imported} subscribers imported.`);
                    setTimeout(() => setImportResult(null), 5000);
                }
            };
            reader.readAsText(file);
        }
    };
    
    const handleResetWizard = () => {
        props.resetApplication();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'logoUrl' | 'faviconUrl') => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAppSettings({ ...appSettings, [field]: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    
    const handleAppearanceSave = () => {
        props.updateAppSettings(appSettings);
        showToast("Appearance settings saved!");
    };
    
    const handleContactDetailsSave = () => {
        props.updateAppSettings({ ...appSettings, contactDetails });
        showToast("Contact details saved!");
    };

    const handleContactChange = (id: string, field: keyof ContactDetail, value: any) => {
        setContactDetails(currentDetails =>
            currentDetails.map(detail =>
                detail.id === id ? { ...detail, [field]: value } : detail
            )
        );
    };

    return (
        <>
        {toastMessage && <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-3 space-y-8">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3"><Palette size={20}/> Appearance</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Customize the branding and general look of your status page.</p>
                    <div className="mt-6 space-y-4">
                        <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Application Name</label><input value={appSettings.appName} onChange={e => setAppSettings({...appSettings, appName: e.target.value})} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><ImageIcon size={14}/> Logo</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'logoUrl')} accept="image/png, image/jpeg, image/svg+xml" className="mt-1 block w-full text-sm text-slate-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/50 dark:file:text-emerald-300 dark:hover:file:bg-emerald-900"/>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-slate-600 dark:text-slate-300 flex items-center gap-2"><Star size={14}/> Favicon</label>
                                <input type="file" onChange={(e) => handleFileChange(e, 'faviconUrl')} accept="image/png, image/jpeg, image/svg+xml, image/x-icon" className="mt-1 block w-full text-sm text-slate-500 dark:text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-900/50 dark:file:text-emerald-300 dark:hover:file:bg-emerald-900"/>
                            </div>
                        </div>

                         <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Footer Credit</label><input value={appSettings.footerCredit} onChange={e => setAppSettings({...appSettings, footerCredit: e.target.value})} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                        <label className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-300 pt-2"><input type="checkbox" checked={appSettings.showConzexCredits} onChange={e => setAppSettings({...appSettings, showConzexCredits: e.target.checked})} className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-500 dark:bg-slate-600"/>Show "Product Information" popover in header.</label>
                        <div className="flex justify-end pt-2 gap-3">
                             <button onClick={props.restoreDefaultAppSettings} className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600">Restore Defaults</button>
                             <button onClick={handleAppearanceSave} className="bg-slate-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700">Save Appearance</button>
                        </div>
                    </div>
                 </div>

                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3"><LifeBuoy size={20}/> Contact & Support Details</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage the contact methods shown on the public "Contact" page.</p>
                    <div className="mt-4 space-y-2">
                        {contactDetails.map((detail) => (
                             <div key={detail.id} className="border border-slate-200 dark:border-slate-700 rounded-lg">
                                <button onClick={() => setActiveContact(activeContact === detail.id ? null : detail.id)} className="w-full p-3 flex justify-between items-center text-left hover:bg-slate-50/50 dark:hover:bg-slate-700/20">
                                    <div className="flex items-center">
                                        <MoveVertical size={16} className="text-slate-400 mr-3 cursor-grab"/>
                                        <span className="font-bold text-slate-700 dark:text-slate-300">{detail.title}</span>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${detail.enabled ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                                            {detail.enabled ? 'Visible' : 'Hidden'}
                                        </span>
                                        <ChevronDown className={`transform transition-transform duration-300 text-slate-500 ${activeContact === detail.id ? 'rotate-180' : ''}`} />
                                    </div>
                                </button>
                                {activeContact === detail.id && (
                                    <div className="p-4 border-t border-slate-200 dark:border-slate-700 space-y-3 animate-fade-in">
                                        <label className="flex items-center gap-3 text-sm cursor-pointer text-slate-600 dark:text-slate-300"><input type="checkbox" checked={detail.enabled} onChange={e => handleContactChange(detail.id, 'enabled', e.target.checked)} className="h-4 w-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-500 dark:bg-slate-600"/>Enable this contact method</label>
                                        <div><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Title</label><input value={detail.title} onChange={e => handleContactChange(detail.id, 'title', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 mt-1 text-sm bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                                        <div><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Description</label><input value={detail.description} onChange={e => handleContactChange(detail.id, 'description', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 mt-1 text-sm bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                                        <div><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Display Value (e.g., support@conzex.com)</label><input value={detail.value} onChange={e => handleContactChange(detail.id, 'value', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 mt-1 text-sm bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                                        <div><label className="text-xs font-bold text-slate-600 dark:text-slate-300">Link (e.g., mailto:support@conzex.com)</label><input value={detail.link} onChange={e => handleContactChange(detail.id, 'link', e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-1.5 mt-1 text-sm bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                     <div className="flex justify-end pt-4 mt-2 gap-3">
                         <button onClick={props.restoreDefaultAppSettings} className="text-sm bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600">Restore Defaults</button>
                         <button onClick={handleContactDetailsSave} className="bg-slate-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700">Save Contact Details</button>
                    </div>
                </div>

                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3"><Mail size={20}/> Notification Channels</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Configure your email server for sending incident notifications.</p>
                     <div className="mt-6 p-4 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold text-slate-800 dark:text-slate-200">SMTP Settings</h4>
                        <div className="flex gap-2 mt-2 mb-4">
                            <button onClick={() => applySmtpPreset('gmail')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full text-slate-800 dark:text-slate-200">Gmail</button>
                            <button onClick={() => applySmtpPreset('outlook')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full text-slate-800 dark:text-slate-200">Outlook</button>
                             <button onClick={() => applySmtpPreset('zoho')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full text-slate-800 dark:text-slate-200">Zoho Mail</button>
                            <button onClick={() => applySmtpPreset('other')} className="text-xs font-bold bg-slate-200 dark:bg-slate-600 px-3 py-1 rounded-full text-slate-800 dark:text-slate-200">Other</button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="grid grid-cols-3 gap-4">
                                <div className="col-span-2"><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Host</label><input value={smtp.host} onChange={e => handleSmtpChange('host', e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                                <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Port</label><input type="number" value={smtp.port || ''} onChange={e => handleSmtpChange('port', Number(e.target.value))} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                            </div>
                             <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Username</label><input value={smtp.user} onChange={e => handleSmtpChange('user', e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                             <div><label className="text-sm font-bold text-slate-600 dark:text-slate-300">Password</label><input type="password" placeholder="Leave unchanged to keep current password" onChange={e => handleSmtpChange('pass', e.target.value)} className="w-full border rounded-lg px-3 py-2 mt-1 bg-transparent dark:bg-slate-700/50 dark:border-slate-600 text-slate-900 dark:text-white placeholder-slate-400"/></div>
                             <div className="flex justify-end gap-3 pt-2">
                                <button onClick={() => { setSmtpTestStatus('idle'); setSmtpTestMessage(''); setShowTestSmtpModal(true); }} className="flex items-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600">
                                    Test Connection
                                </button>
                                <button onClick={handleSmtpSave} disabled={!isSmtpTested} className="bg-slate-900 text-white py-2 px-4 rounded-lg font-bold hover:bg-slate-800 dark:bg-emerald-600 dark:hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed">Save SMTP</button>
                             </div>
                        </div>
                     </div>
                 </div>
            </div>
            <div className="lg:col-span-2 space-y-8">
                 <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3"><Palette size={20}/> Theme</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Choose the default theme for all users.</p>
                     <div className="grid grid-cols-3 gap-3 mt-6">
                        <button onClick={() => props.setTheme('system')} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${props.theme === 'system' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <Laptop size={20} className="text-slate-600 dark:text-slate-300"/>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">System</span>
                        </button>
                        <button onClick={() => props.setTheme('light')} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${props.theme === 'light' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <Sun size={20} className="text-slate-600 dark:text-slate-300"/>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Light</span>
                        </button>
                        <button onClick={() => props.setTheme('dark')} className={`p-3 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${props.theme === 'dark' ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/20' : 'border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}>
                            <Moon size={20} className="text-slate-600 dark:text-slate-300"/>
                            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">Dark</span>
                        </button>
                    </div>
                 </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 flex items-center gap-3"><Users size={20}/> Subscriber Management</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Manage your email subscriber list.</p>
                     <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                        <span className="font-bold text-slate-600 dark:text-slate-300">Total Subscribers</span>
                        <span className="text-2xl font-bold text-slate-900 dark:text-slate-100">{props.subscribers.length}</span>
                     </div>
                     <div className="grid grid-cols-2 gap-3 mt-4">
                        <input type="file" ref={fileInputRef} onChange={handleImport} accept=".csv, .txt" className="hidden"/>
                        <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600"><Upload size={16}/>Import</button>
                        <button onClick={handleExport} className="flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 py-2 px-4 rounded-lg font-bold hover:bg-slate-200 dark:hover:bg-slate-600"><Download size={16}/>Export</button>
                     </div>
                     {importResult && (
                        <div className="mt-4 text-sm p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-800 dark:text-emerald-300 space-y-1">
                            <p className="font-bold flex items-center gap-2"><FileCheck size={16}/>Import Complete</p>
                            <p>{importResult.imported} new subscribers added.</p>
                            <p>{importResult.duplicates} duplicates ignored.</p>
                            {importResult.invalid > 0 && <p className="text-amber-700 dark:text-amber-400 font-medium">{importResult.invalid} invalid entries found.</p>}
                        </div>
                     )}
                </div>
                 <div className="bg-rose-50 dark:bg-rose-900/30 p-6 rounded-xl border border-rose-200 dark:border-rose-500/30">
                    <h3 className="text-xl font-bold text-rose-900 dark:text-rose-200 flex items-center gap-3"><AlertTriangle size={20}/> Danger Zone</h3>
                    <p className="text-sm text-rose-700 dark:text-rose-300 mt-2">These actions are destructive and cannot be undone.</p>
                     <div className="mt-4">
                        <button onClick={() => setShowResetWizard(true)} className="w-full text-left p-3 rounded-lg bg-white/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-800">
                             <p className="font-bold text-rose-800 dark:text-rose-200">Re-run Setup Wizard</p>
                             <p className="text-xs text-rose-600 dark:text-rose-300 mt-1">This will wipe all existing data (monitors, users, incidents, etc.) and restart the application setup.</p>
                        </button>
                     </div>
                 </div>
            </div>
            {showTestSmtpModal && (
                <TestSmtpModal 
                    onClose={() => setShowTestSmtpModal(false)}
                    onTest={handleSmtpTest}
                    status={smtpTestStatus}
                    message={smtpTestMessage}
                />
            )}
            {showResetWizard && (
                <ConfirmationModal 
                    title="Confirm Application Reset"
                    message="This will completely wipe all data and return you to the setup wizard. Are you sure you wish to proceed?"
                    onClose={() => setShowResetWizard(false)}
                    onConfirm={handleResetWizard}
                    confirmText="Yes, Reset Everything"
                />
            )}
        </div>
        </>
    );
};


// --- MAIN DASHBOARD COMPONENT ---
const AdminDashboard: React.FC<AdminDashboardProps> = (props) => {
    const [activeTab, setActiveTab] = useState('monitors');
    
    const operationalCount = useMemo(() => props.allServices.filter(s => s.status === ServiceStatus.OPERATIONAL).length, [props.allServices]);
    const activeIncidentsCount = useMemo(() => props.incidents.filter(i => i.updates[0]?.status !== 'resolved').length, [props.incidents]);

    const isMountedRef = useRef(false);
    useEffect(() => {
        isMountedRef.current = true;
        return () => { isMountedRef.current = false; };
    }, []);

    const handleResetWizard = () => {
        if (!isMountedRef.current) return;
        props.resetApplication();
    };

    const tabComponents: { [key: string]: React.ReactNode } = {
        monitors: <MonitorsTab {...props} />,
        incidents: <IncidentsTab {...props} />,
        users: <UsersTab {...props} />,
        settings: <SettingsTab {...props} resetApplication={handleResetWizard} />,
    };

    const tabIcons: { [key: string]: React.ElementType } = {
        monitors: MonitorIcon,
        incidents: AlertTriangle,
        users: Users,
        settings: Settings,
    };
    
    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">Admin Dashboard</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Welcome back, {props.currentUser?.username}.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Monitors" value={props.allServices.length} color="text-sky-600" icon={MonitorIcon} />
                <StatCard title="Operational" value={operationalCount} color="text-emerald-600" icon={CheckCircle} />
                <StatCard title="Active Incidents" value={activeIncidentsCount} color="text-orange-500" icon={AlertTriangle} />
                <StatCard title="Subscribers" value={props.subscribers.length} color="text-indigo-500" icon={Users} />
            </div>

            <div className="border-b border-slate-200 dark:border-slate-700">
                <nav className="-mb-px flex space-x-6">
                    {Object.keys(tabComponents).map(tab => {
                         const Icon = tabIcons[tab];
                         return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-2 py-4 px-1 border-b-2 font-bold text-sm capitalize ${activeTab === tab ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400' : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 hover:border-slate-300 dark:hover:text-slate-200 dark:hover:border-slate-500'}`}
                            >
                               <Icon size={16} /> {tab}
                            </button>
                         )
                    })}
                </nav>
            </div>

            <div className="pt-4">
                {tabComponents[activeTab]}
            </div>
        </div>
    );
};

// FIX: Removed extraneous text causing compilation errors.
export default AdminDashboard;
