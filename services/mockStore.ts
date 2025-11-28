import React, { useState, useEffect, useSyncExternalStore } from 'react';
import { Service, ServiceGroup, ServiceType, ServiceStatus, Incident, IncidentUpdate, UptimePoint, IncidentStatus, Subscriber, SMTPSettings, User, UserRole, Theme, AppSettings, IncidentPriority, CompanyInfoLink } from '../types';
import { MAX_HISTORY_POINTS } from '../constants';
import { generateEmailTemplate } from '../components/EmailTemplate';

// --- DEMO DATA GENERATION ---
const getLatency = (status: ServiceStatus): number => {
  switch (status) {
    case ServiceStatus.OPERATIONAL: return Math.floor(Math.random() * 40) + 10;
    case ServiceStatus.DEGRADED: return Math.floor(Math.random() * 150) + 100;
    case ServiceStatus.PARTIAL_OUTAGE: return Math.floor(Math.random() * 400) + 300;
    case ServiceStatus.MAJOR_OUTAGE: return 999;
    case ServiceStatus.MAINTENANCE: return 0;
    default: return 0;
  }
};

const createHistoryFromPattern = (pattern: { status: ServiceStatus, days: number }[]): UptimePoint[] => {
    const history: UptimePoint[] = [];
    const now = new Date();
    const startDate = new Date(now.getTime() - 89 * 24 * 60 * 60 * 1000);
    const flatPattern: ServiceStatus[] = pattern.flatMap(({ status, days }) => Array(days).fill(status));

    for (let i = 0; i < MAX_HISTORY_POINTS; i++) {
        const status = flatPattern[i] || ServiceStatus.OPERATIONAL;
        const pointDate = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        history.push({
            timestamp: pointDate.getTime(),
            status: status,
            latency: getLatency(status),
        });
    }
    return history;
};

const createInitialService = (id: string, name: string, type: ServiceType, history: UptimePoint[], details: Partial<Service>): Service => {
    const latestPoint = history.length > 0 ? history[history.length - 1] : { status: ServiceStatus.OPERATIONAL, latency: 20 };
    return {
        id, name, type, status: latestPoint.status, uptimeHistory: history,
        currentLatency: latestPoint.latency, lastCheck: new Date(),
        publiclyDisplayDetails: true, description: '', ...details,
    };
};

const getDemoData = () => {
  const serviceGroups: ServiceGroup[] = [
    {
      id: 'group-1', name: 'Production Grid (Data Center)', description: 'Core services for customer-facing applications and IT infrastructure.',
      services: [
         createInitialService('1', 'PVE_PRD', ServiceType.HTTPS, createHistoryFromPattern([
             { status: ServiceStatus.OPERATIONAL, days: 65 }, { status: ServiceStatus.DEGRADED, days: 3 },
             { status: ServiceStatus.OPERATIONAL, days: 10 }, { status: ServiceStatus.DEGRADED, days: 2 },
             { status: ServiceStatus.MAJOR_OUTAGE, days: 2 }, { status: ServiceStatus.DEGRADED, days: 3 },
             { status: ServiceStatus.OPERATIONAL, days: 5 },
         ]), { url: 'pve-prod.conzex.com:443', description: "Primary production hypervisor cluster.", sslExpiry: 25 }),
        createInitialService('2', 'PVE_WHM', ServiceType.HTTPS, createHistoryFromPattern([
            { status: ServiceStatus.OPERATIONAL, days: 50 }, { status: ServiceStatus.MAINTENANCE, days: 1 },
            { status: ServiceStatus.OPERATIONAL, days: 20 }, { status: ServiceStatus.MAINTENANCE, days: 1 },
            { status: ServiceStatus.OPERATIONAL, days: 18 },
        ]), { url: 'pve-whm.conzex.com', description: "Web hosting management panel.", sslExpiry: 120 }),
        createInitialService('3', 'VPN_Server', ServiceType.TCP, createHistoryFromPattern([
            { status: ServiceStatus.OPERATIONAL, days: 88 }, { status: ServiceStatus.DEGRADED, days: 2 }
        ]), { url: 'vpn.conzex.com', port: 1194, description: 'Corporate VPN access gateway.' }),
      ]
    },
    {
      id: 'group-2', name: 'Cloud Services', description: 'Third-party and cloud-native services.',
      services: [
        createInitialService('4', 'Cloud SQL Database', ServiceType.DATABASE, createHistoryFromPattern([
            { status: ServiceStatus.OPERATIONAL, days: 90 }
        ]), { url: 'db-us-central1.cloud.conzex', port: 3306, publiclyDisplayDetails: false }),
        createInitialService('5', 'Docker Registry', ServiceType.DOCKER, createHistoryFromPattern([
            { status: ServiceStatus.OPERATIONAL, days: 90 }
        ]), { url: 'registry.conzex.io', description: 'Private container image registry.' }),
      ]
    }
  ];

  const incidents: Incident[] = [
    {
      id: 'inc-1',
      title: 'API Latency Issues',
      createdAt: new Date(new Date().setDate(new Date().getDate() - 3)),
      affectedServiceIds: ['1'],
      priority: IncidentPriority.HIGH,
      updates: [
        { id: 'upd-1-5', status: 'resolved' as IncidentStatus, message: 'Could not generate an update from the AI model.', createdAt: new Date('2025-01-25T22:03:37Z')},
        { id: 'upd-1-4', status: 'resolved' as IncidentStatus, message: 'The issue has been fully resolved. All systems are operating normally. We apologize for any inconvenience caused.', createdAt: new Date('2025-01-23T22:02:49Z')},
        { id: 'upd-1-3', status: 'monitoring' as IncidentStatus, message: 'A fix has been deployed and we are monitoring the results. API latency appears to be returning to normal levels.', createdAt: new Date('2025-01-23T10:02:49Z')},
        { id: 'upd-1-2', status: 'identified' as IncidentStatus, message: 'We have identified a database query that is causing a bottleneck. Our team is working on optimizing the query.', createdAt: new Date('2025-01-22T22:02:49Z')},
        { id: 'upd-1-1', status: 'investigating' as IncidentStatus, message: 'We are investigating reports of increased latency on our primary production cluster. We will provide more details shortly.', createdAt: new Date('2025-01-22T10:02:49Z')},
      ].sort((a,b) => b.createdAt.getTime() - a.createdAt.getTime()),
    }
  ];
  
  return { serviceGroups, incidents };
};


// --- CORE STORE LOGIC ---
interface AppState {
    serviceGroups: ServiceGroup[];
    incidents: Incident[];
    users: User[];
    subscribers: Subscriber[];
    smtpSettings: SMTPSettings;
    appSettings: AppSettings;
    currentUser: User | null;
    lastUpdated: Date;
    theme: Theme;
    isSetupComplete: boolean;
}

let state: AppState;
const listeners = new Set<() => void>();

const defaultSvg = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 13H7L10 5L16 19L19 13H22" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const defaultLogoUrl = `data:image/svg+xml;base64,${btoa(defaultSvg)}`;


const getInitialState = (): AppState => ({
    serviceGroups: [],
    incidents: [],
    users: [{ id: 'user-0', username: 'admin', role: UserRole.SUPER_ADMIN, password: 'admin', mustChangePassword: true }],
    subscribers: [],
    smtpSettings: { host: '', port: 587, user: '', pass: '', secure: true },
    appSettings: {
        appName: 'StatusPulse',
        logoUrl: defaultLogoUrl,
        faviconUrl: defaultLogoUrl,
        footerCredit: `Copyright © 2025 Conzex Global Private Limited. All Rights Reserved.`,
        showConzexCredits: true,
        companyName: 'Conzex Global Private Limited',
        companyInfoLinks: [
            { label: 'Website', link: 'https://www.conzex.com', icon: 'Globe' },
            { label: 'Documentation', link: 'https://docs.conzex.com', icon: 'BookOpen' }
        ],
        footerMenus: [
            { id: 'company', title: 'Company', icon: 'Building', links: [ { label: 'About Us', page: 'about' }, { label: 'Features', page: 'features' }, { label: 'Why StatusPulse?', page: 'why-statuspulse' }, { label: 'Privacy Policy', page: 'privacy' }, { label: 'Terms of Service', page: 'terms' } ] },
            { id: 'resources', title: 'Resources', icon: 'BookOpen', links: [ { label: 'Download', page: 'download' }, { label: 'Requirements', page: 'requirements' }, { label: 'FAQ', page: 'faq' }, { label: 'Disclaimer', page: 'disclaimer' } ] },
            { id: 'support', title: 'Support', icon: 'LifeBuoy', links: [{ label: 'Contact Support', page: 'contact' }] },
        ],
        contactDetails: [
            { id: 'ticket', icon: 'Ticket', title: 'Ticketing System', description: 'For technical support and detailed inquiries.', link: 'https://support.conzex.com', value: 'support.conzex.com', iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600', enabled: true },
            { id: 'docs', icon: 'BookOpen', title: 'Knowledge Base', description: 'Find setup guides, FAQs, and best practices.', link: 'https://docs.conzex.com', value: 'docs.conzex.com', iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600', enabled: true },
            { id: 'email', icon: 'Mail', title: 'Email Support', description: 'For general questions and sales inquiries.', link: 'mailto:support@conzex.com', value: 'support@conzex.com', iconColor: 'bg-gradient-to-br from-rose-500 to-rose-600', enabled: true },
            { id: 'web', icon: 'Globe', title: 'Corporate Website', description: 'Learn more about Conzex Global.', link: 'https://www.conzex.com', value: 'www.conzex.com', iconColor: 'bg-gradient-to-br from-slate-700 to-slate-900', enabled: true },
            { id: 'phone', icon: 'Phone', title: 'Phone Support', description: 'For urgent sales and support inquiries.', link: 'tel:+918007060308', value: '+91 800 7060 308', iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600', enabled: true },
            { id: 'whatsapp', icon: 'MessageSquare', title: 'WhatsApp', description: 'Connect with us for quick chats.', link: 'https://wa.me/918007060308', value: '+91 800 7060 308', iconColor: 'bg-gradient-to-br from-green-500 to-green-600', enabled: true },
        ],
    },
    currentUser: null,
    lastUpdated: new Date(),
    theme: 'system' as Theme,
    isSetupComplete: localStorage.getItem('statuspulse_setup_complete') === 'true',
});

const store = {
    // --- State Management ---
    getState: () => state,
    setState: (fn: (s: AppState) => AppState) => {
        state = fn(state);
        listeners.forEach(l => l());
    },
    subscribe: (listener: () => void) => {
        listeners.add(listener);
        return () => listeners.delete(listener);
    },

    // --- Derived state ---
    get allServices() {
        return state.serviceGroups.flatMap((g: ServiceGroup) => g.services);
    },

    // --- NOTIFICATIONS ---
    sendNotificationEmail: (incident: Incident, update: IncidentUpdate) => {
      if (!state.smtpSettings.host) {
        console.warn("SMTP not configured. Skipping email notifications.");
        return;
      }
      const emailHtml = generateEmailTemplate(incident, update, state.appSettings);
      console.log(`--- SIMULATING EMAIL NOTIFICATION ---`);
      console.log(`To: ${state.subscribers.map((s: Subscriber) => s.email).join(', ')}`);
      console.log(`Subject: [${state.appSettings.appName}] ${incident.title}`);
      console.log(`--- EMAIL BODY ---`);
      console.log(emailHtml);
      console.log(`-----------------------------------`);
    },

    // --- SETUP & AUTH ---
    initializeEnvironment: (config: any) => {
        let demoData = { serviceGroups: [], incidents: [] };
        if (config.profile === 'demo' || config.profile === 'dev-with-data') {
            demoData = getDemoData();
        }
        
        const initialAdmin = state.users[0];
        initialAdmin.mustChangePassword = false;

        store.setState(s => ({
            ...s,
            serviceGroups: demoData.serviceGroups,
            incidents: demoData.incidents,
            smtpSettings: config.smtp,
            subscribers: config.subscribers.map((email: string, i: number) => ({ id: `sub-${i}`, email, createdAt: new Date() })),
            theme: config.theme,
            users: [initialAdmin],
            isSetupComplete: true,
            currentUser: initialAdmin, // Auto-login after setup
        }));
        localStorage.setItem('statuspulse_setup_complete', 'true');
    },
    
    resetApplication: () => {
        localStorage.removeItem('statuspulse_setup_complete');
        // This fully resets the state object and triggers the re-render in App.tsx
        state = getInitialState();
        listeners.forEach(l => l());
    },

    login: (username, password) => {
        const user = state.users.find((u: User) => u.username === username && u.password === password);
        if (user) {
            store.setState(s => ({ ...s, currentUser: user }));
            return true;
        }
        return false;
    },
    logout: () => {
        store.setState(s => ({ ...s, currentUser: null }));
    },
    changePassword: (userId: string, newPass: string) => {
        const user = state.users.find((u: User) => u.id === userId);
        if (user) {
            user.password = newPass;
            user.mustChangePassword = false;
            user.forcePasswordChange = false;
            store.setState(s => ({ ...s }));
            return true;
        }
        return false;
    },
    changeUserPassword: (userId: string, oldPass: string, newPass: string) => {
        const user = state.users.find((u: User) => u.id === userId);
        if (user && user.password === oldPass) {
            user.password = newPass;
            store.setState(s => ({ ...s }));
            return { success: true, message: 'Password updated successfully!' };
        }
        return { success: false, message: 'Current password was incorrect.' };
    },
    forcePasswordReset: (userId: string) => {
        const user = state.users.find((u: User) => u.id === userId);
        if (user) {
            user.forcePasswordChange = true;
            store.setState(s => ({ ...s }));
            return true;
        }
        return false;
    },

    // --- SUBSCRIBERS ---
    addSubscriber: (email: string) => {
        if (state.subscribers.some(s => s.email === email)) {
            return false;
        }
        store.setState(s => ({
            ...s,
            subscribers: [...s.subscribers, { id: `sub_${Date.now()}`, email, createdAt: new Date() }]
        }));
        return true;
    },
    importSubscribers: (csvData: string) => {
        const emails = csvData.split(/[\n,]+/).map(e => e.trim().toLowerCase()).filter(e => e && e.includes('@'));
        let imported = 0, duplicates = 0, invalid = 0;
        const existingEmails = new Set(state.subscribers.map(s => s.email.toLowerCase()));

        emails.forEach(email => {
            if (!email.includes('@')) { // Basic validation
                invalid++;
                return;
            }
            if (!existingEmails.has(email)) {
                existingEmails.add(email);
                state.subscribers.push({ id: `sub_${Date.now()}_${imported}`, email, createdAt: new Date() });
                imported++;
            } else {
                duplicates++;
            }
        });
        store.setState(s => ({ ...s }));
        return { imported, duplicates, invalid };
    },

    // --- SETTINGS ---
    setTheme: (theme: Theme) => {
        store.setState(s => ({ ...s, theme }));
    },
    updateSmtpSettings: (settings: SMTPSettings) => {
        store.setState(s => ({ ...s, smtpSettings: settings }));
    },
    updateAppSettings: (settings: Partial<AppSettings>) => {
        store.setState(s => ({ ...s, appSettings: { ...s.appSettings, ...settings } }));
    },
    restoreDefaultAppSettings: () => {
        const defaultSettings = getInitialState().appSettings;
        store.setState(s => ({...s, appSettings: defaultSettings }));
    },
    testSmtpConnection: async (settings: SMTPSettings, recipientEmail: string): Promise<{ success: boolean; message: string }> => {
        console.log("Simulating SMTP Test:", { settings, recipientEmail });
        await new Promise(res => setTimeout(res, 1500)); // Simulate network delay
        if (settings.host && settings.user && settings.pass && recipientEmail) {
            if (settings.pass === 'fail') {
                return { success: false, message: "Authentication failed. Please check your username and password." };
            }
            return { success: true, message: `Connection successful! A test email has been sent to ${recipientEmail}.` };
        }
        return { success: false, message: "Connection failed. Please ensure all fields are filled out correctly." };
    },

    // --- SERVICES & GROUPS ---
    addServiceGroup: (name: string, description: string) => {
        const newGroup: ServiceGroup = { id: `group_${Date.now()}`, name, description, services: [] };
        store.setState(s => ({ ...s, serviceGroups: [...s.serviceGroups, newGroup] }));
    },
    updateServiceGroup: (id: string, name: string, description: string) => {
        const group = state.serviceGroups.find(g => g.id === id);
        if (group) {
            group.name = name;
            group.description = description;
            store.setState(s => ({ ...s }));
        }
    },
    deleteServiceGroup: (id: string) => {
        store.setState(s => ({ ...s, serviceGroups: s.serviceGroups.filter(g => g.id !== id) }));
    },
    addService: (svcData: any, groupId: string) => {
        const group = state.serviceGroups.find(g => g.id === groupId);
        if (group) {
            const newService: Service = createInitialService(`svc_${Date.now()}`, svcData.name, svcData.type, createHistoryFromPattern([{ status: ServiceStatus.OPERATIONAL, days: 90 }]), svcData);
            group.services.push(newService);
            store.setState(s => ({ ...s }));
        }
    },
    updateService: (id: string, updatedSvcData: Partial<Service>) => {
        for (const group of state.serviceGroups) {
            const serviceIndex = group.services.findIndex(s => s.id === id);
            if (serviceIndex > -1) {
                group.services[serviceIndex] = { ...group.services[serviceIndex], ...updatedSvcData };
                store.setState(s => ({ ...s }));
                return;
            }
        }
    },
    deleteService: (id: string) => {
        state.serviceGroups.forEach(g => {
            g.services = g.services.filter(s => s.id !== id);
        });
        store.setState(s => ({ ...s }));
    },

    // --- INCIDENTS ---
    addIncident: (incidentData: any) => {
        const newIncident: Incident = {
            id: `inc_${Date.now()}`,
            title: incidentData.title,
            createdAt: new Date(),
            affectedServiceIds: incidentData.affectedServiceIds,
            priority: incidentData.priority,
            updates: [{
                id: `upd_${Date.now()}`,
                status: incidentData.initialUpdate.status,
                message: incidentData.initialUpdate.message,
                createdAt: new Date(),
            }],
        };
        store.setState(s => ({ ...s, incidents: [newIncident, ...s.incidents] }));
        store.sendNotificationEmail(newIncident, newIncident.updates[0]);
    },
    addIncidentUpdate: (incidentId: string, updateData: { status: IncidentStatus; message: string; }) => {
        const incident = state.incidents.find(i => i.id === incidentId);
        if (incident) {
            const newUpdate: IncidentUpdate = {
                id: `upd_${Date.now()}`,
                status: updateData.status,
                message: updateData.message,
                createdAt: new Date()
            };
            incident.updates.unshift(newUpdate); // Add to beginning
            store.setState(s => ({ ...s }));
            store.sendNotificationEmail(incident, newUpdate);
        }
    },

    // --- USERS ---
    addUser: (username: string, role: UserRole, password: string): boolean => {
        if (state.users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
            return false;
        }
        const newUser: User = { id: `user_${Date.now()}`, username, role, password, mustChangePassword: true };
        store.setState(s => ({ ...s, users: [...s.users, newUser] }));
        return true;
    },
    deleteUser: (id: string) => {
        store.setState(s => ({ ...s, users: s.users.filter(u => u.id !== id) }));
    },
};

// Initialize
state = getInitialState();

// Hook for React components
export const useStatusStore = () => {
    const externalState = useSyncExternalStore(store.subscribe, store.getState);
    return { ...externalState, ...store };
};