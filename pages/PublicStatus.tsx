import React, { useMemo, useState } from 'react';
import { ServiceGroup, Incident, ServiceStatus, IncidentPriority } from '../types';
import ServiceCard from '../components/ServiceCard';
import { CheckCircle, AlertOctagon, AlertTriangle, Search, Info, RefreshCw, ChevronDown, Rss, Eye, FileCheck, Radiation, Flame, Triangle } from 'lucide-react';
import { INCIDENT_STATUS_THEME, INCIDENT_PRIORITY_THEME } from '../constants';

interface PublicStatusProps {
  serviceGroups: ServiceGroup[];
  incidents: Incident[];
  onServiceClick: (id: string) => void;
  allServices: any[]; // for overall status calculation
}

const IconMap = {
    Search, FileCheck, Eye, CheckCircle, Info, Radiation, Flame, Triangle
};

const IncidentTimeline: React.FC<{ incident: Incident }> = ({ incident }) => {
  const priorityTheme = INCIDENT_PRIORITY_THEME[incident.priority];
  const PriorityIcon = IconMap[priorityTheme.icon as keyof typeof IconMap] || Info;

  return (
    <div className="relative pl-8 md:pl-10">
      <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-orange-500 ring-4 ring-orange-100 dark:ring-orange-500/20"></div>
      <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">{incident.title}</h3>
      <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-slate-500 dark:text-slate-400 mt-2 mb-4">
        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border tracking-wider font-bold ${priorityTheme.classes}`}>
            <PriorityIcon size={12} /> {priorityTheme.text}
        </span>
        <span className="uppercase bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-600 tracking-wider text-slate-600 dark:text-slate-300 font-bold">{incident.updates[0].status}</span>
        <span className="text-slate-300 dark:text-slate-600 hidden sm:inline">|</span>
        <span>First Reported: {new Date(incident.createdAt).toLocaleString()}</span>
      </div>
      
      <div className="space-y-4">
        {incident.updates.map((update) => {
          const theme = INCIDENT_STATUS_THEME[update.status];
          const Icon = IconMap[theme.icon as keyof typeof IconMap] || Info;
          const color = theme.color;

          const colorClasses = {
              orange: { bg: 'bg-orange-100 dark:bg-orange-900/50', text: 'text-orange-600 dark:text-orange-400' },
              yellow: { bg: 'bg-yellow-100 dark:bg-yellow-900/50', text: 'text-yellow-600 dark:text-yellow-400' },
              blue: { bg: 'bg-blue-100 dark:bg-blue-900/50', text: 'text-blue-600 dark:text-blue-400' },
              emerald: { bg: 'bg-emerald-100 dark:bg-emerald-900/50', text: 'text-emerald-600 dark:text-emerald-400' },
          };
          const currentThemeClasses = colorClasses[color as keyof typeof colorClasses];

          return (
            <div key={update.id} className="relative pl-8 before:content-[''] before:absolute before:left-[3px] before:top-2.5 before:bottom-0 before:w-[2px] before:bg-slate-200 dark:before:bg-slate-700 last:before:hidden">
              <div className={`absolute -left-1 top-1 w-5 h-5 rounded-full ${currentThemeClasses.bg} flex items-center justify-center`}>
                <Icon size={12} className={currentThemeClasses.text} />
              </div>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-1">{new Date(update.createdAt).toLocaleString()}</p>
              <p className="font-semibold text-sm text-slate-800 dark:text-slate-200 capitalize mb-2">{theme.text}</p>
              <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">{update.message}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};


const ServiceGroupSection: React.FC<{ group: ServiceGroup; incidents: Incident[]; onServiceClick: (id: string) => void; }> = ({ group, incidents, onServiceClick }) => {
    const [isOpen, setIsOpen] = useState(true);

    const groupStatus = useMemo(() => {
        if (!group.services || group.services.length === 0) return ServiceStatus.OPERATIONAL;
        if (group.services.some(s => s.status === ServiceStatus.MAJOR_OUTAGE)) return ServiceStatus.MAJOR_OUTAGE;
        if (group.services.some(s => s.status === ServiceStatus.PARTIAL_OUTAGE)) return ServiceStatus.PARTIAL_OUTAGE;
        if (group.services.some(s => s.status === ServiceStatus.DEGRADED)) return ServiceStatus.DEGRADED;
        if (group.services.some(s => s.status === ServiceStatus.MAINTENANCE)) return ServiceStatus.MAINTENANCE;
        return ServiceStatus.OPERATIONAL;
    }, [group.services]);
    
    const StatusIcon = groupStatus === 'operational' ? CheckCircle : AlertTriangle;
    const statusColorClass = groupStatus === 'operational' ? 'text-green-600 dark:text-green-500' : 'text-orange-500 dark:text-orange-400';

    return (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full p-6 flex justify-between items-center hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors rounded-t-2xl">
                <div className="text-left">
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{group.name}</h2>
                    <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">{group.description}</p>
                </div>
                <div className="flex items-center gap-6">
                    <div className={`flex items-center font-bold text-sm ${statusColorClass}`}>
                       <StatusIcon size={18} className="mr-2" />
                       <span className="hidden sm:inline">{groupStatus.replace(/_/g, ' ').toUpperCase()}</span>
                    </div>
                    <ChevronDown size={24} className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </button>
            <div className={`grid transition-all duration-500 ease-in-out ${isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <div className="px-6 pb-2 pt-2">
                        {group.services.map(service => (
                            <ServiceCard key={service.id} service={service} incidents={incidents} onClick={onServiceClick} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


const PublicStatus: React.FC<PublicStatusProps> = ({ serviceGroups, incidents, onServiceClick, allServices }) => {
  const overallStatus = useMemo(() => {
    if (allServices.some(s => s.status === ServiceStatus.MAJOR_OUTAGE)) return 'major_outage';
    if (allServices.some(s => s.status === ServiceStatus.PARTIAL_OUTAGE)) return 'partial_outage';
    if (allServices.some(s => s.status === ServiceStatus.DEGRADED)) return 'degraded';
    if (allServices.some(s => s.status === ServiceStatus.MAINTENANCE)) return 'maintenance';
    return 'operational';
  }, [allServices]);

  const activeIncidents = incidents.filter(i => i.updates.length > 0 && i.updates[0].status !== 'resolved');

  const BannerConfig = {
    operational: { color: 'bg-green-600', icon: CheckCircle, text: 'All Systems Operational' },
    degraded: { color: 'bg-amber-500', icon: AlertTriangle, text: 'Performance Issues Detected' },
    partial_outage: { color: 'bg-orange-500', icon: AlertOctagon, text: 'Partial System Outage' },
    major_outage: { color: 'bg-red-600', icon: AlertOctagon, text: 'Critical System Outage' },
    maintenance: { color: 'bg-sky-500', icon: RefreshCw, text: 'Scheduled Maintenance' },
  };

  const currentBanner = BannerConfig[overallStatus as keyof typeof BannerConfig];
  const BannerIcon = currentBanner.icon;

  return (
    <div className="space-y-12 animate-fade-in">
      
      <div className={`${currentBanner.color} rounded-2xl shadow-lg shadow-emerald-900/10 p-5 text-white flex items-center`}>
        <div className="bg-white/20 p-2.5 rounded-lg mr-4">
            <BannerIcon size={24} className="text-white" />
        </div>
        <div>
            <h1 className="text-xl font-bold tracking-tight">{currentBanner.text}</h1>
            <p className="text-white/80 mt-1 font-medium text-sm flex items-center">
                <RefreshCw size={13} className="mr-2 animate-spin-slow" />
                Status checked moments ago. Auto-refresh is active.
            </p>
        </div>
      </div>

      <div className="space-y-6">
        {serviceGroups.map(group => (
            <ServiceGroupSection key={group.id} group={group} incidents={incidents} onServiceClick={onServiceClick} />
        ))}
      </div>
      
      {activeIncidents.length > 0 && (
        <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-orange-200 dark:border-orange-500/30 shadow-lg shadow-orange-100/50 dark:shadow-orange-900/20 p-8 relative">
           <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 mb-8 flex items-center">
               <AlertTriangle className="text-orange-500 mr-3" /> Active Incidents
           </h2>
           <div className="space-y-10">
              {activeIncidents.map(incident => <IncidentTimeline key={incident.id} incident={incident} />)}
           </div>
        </div>
      )}
    </div>
  );
};

export default PublicStatus;