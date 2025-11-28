import React, { useMemo } from 'react';
import { Service, Incident, ServiceStatus, IncidentPriority } from '../types';
import { ArrowLeft, CheckCircle, AlertTriangle, ShieldCheck, Search, FileCheck, Eye, Info, Radiation, Flame, Triangle } from 'lucide-react';
import UptimeBar from '../components/UptimeBar';
import { STATUS_DETAIL_BADGE_CLASSES, INCIDENT_STATUS_THEME, INCIDENT_PRIORITY_THEME } from '../constants';

interface ServiceDetailsProps {
  service: Service;
  incidents: Incident[];
  onBack: () => void;
}

const IconMap = {
    Search, FileCheck, Eye, CheckCircle, Info, Radiation, Flame, Triangle
};


const ServiceDetails: React.FC<ServiceDetailsProps> = ({ service, incidents, onBack }) => {
  const serviceIncidents = useMemo(() => 
    incidents
      .filter(i => i.affectedServiceIds.includes(service.id) || i.affectedServiceIds.includes('global'))
      .sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), 
    [incidents, service.id]
  );
  
  const uptimePercentage = useMemo(() => {
    const total = service.uptimeHistory.length;
    if (total === 0) return '100.000';
    const downCount = service.uptimeHistory.filter(p => p.status === ServiceStatus.MAJOR_OUTAGE).length;
    return ((total - downCount) / total * 100).toFixed(3);
  }, [service.uptimeHistory]);

  return (
    <div className="space-y-8 animate-slide-up">
      <button 
        onClick={onBack}
        className="flex items-center text-sm font-bold text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-500 transition-colors"
      >
        <ArrowLeft size={16} className="mr-2" /> Back to All Services
      </button>

      <div className="bg-white dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm p-8">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
             <div>
                <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{service.name}</h1>
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-bold uppercase tracking-wider">{service.type}</span>
                </div>
                <p className="text-slate-500 dark:text-slate-400 font-mono text-sm">{service.url || 'Endpoint Hidden'}{service.port && `:${service.port}`}</p>
             </div>
             
             <div className={`flex items-center px-4 py-2 rounded-full font-bold uppercase tracking-wide text-xs ${STATUS_DETAIL_BADGE_CLASSES[service.status]} dark:bg-opacity-20`}>
                 {service.status === ServiceStatus.OPERATIONAL ? <CheckCircle className="mr-2" /> : <AlertTriangle className="mr-2" />}
                 <span>{service.status.replace(/_/g, ' ')}</span>
             </div>
         </div>

         <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8 pt-8 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center md:text-left">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">90-Day Uptime</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 mt-1">{uptimePercentage}%</p>
            </div>
            <div className="text-center md:text-left">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Latency</p>
                <p className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1">{service.currentLatency}ms</p>
            </div>
            {service.sslExpiry !== undefined && (
                <div className="text-center md:text-left">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">SSL Certificate</p>
                    <p className={`text-2xl font-bold mt-1 flex items-center justify-center md:justify-start gap-2 ${service.sslExpiry < 30 ? 'text-orange-500' : 'text-slate-800 dark:text-slate-200'}`}>
                        <ShieldCheck size={20} /> Expires in {service.sslExpiry} days
                    </p>
                </div>
            )}
        </div>
         <div className="mt-8">
            <UptimeBar history={service.uptimeHistory} />
        </div>
      </div>

      {serviceIncidents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-6">Incident History</h2>
          <div className="space-y-8">
            {serviceIncidents.map(incident => (
              <div key={incident.id} className="bg-white dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/50 p-6 shadow-sm">
                <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-4 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200">{incident.title}</h3>
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-bold ${INCIDENT_PRIORITY_THEME[incident.priority].classes}`}>
                            {React.createElement(IconMap[INCIDENT_PRIORITY_THEME[incident.priority].icon as keyof typeof IconMap] || Info, { size: 12 })}
                            {INCIDENT_PRIORITY_THEME[incident.priority].text}
                        </span>
                        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase ${incident.updates[0].status === 'resolved' ? STATUS_DETAIL_BADGE_CLASSES.operational : STATUS_DETAIL_BADGE_CLASSES.major_outage}`}>
                            {incident.updates[0].status}
                        </span>
                    </div>
                </div>
                
                <div className="relative">
                    <div className="absolute left-[5.5px] top-2.5 bottom-2.5 w-0.5 bg-slate-200 dark:bg-slate-700"></div>
                    {incident.updates.slice().sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((update) => {
                        const theme = INCIDENT_STATUS_THEME[update.status];
                        
                        const colorClasses = {
                            orange: { bg: 'bg-orange-500', text: 'text-orange-500 dark:text-orange-400' },
                            yellow: { bg: 'bg-yellow-500', text: 'text-yellow-500 dark:text-yellow-400' },
                            blue: { bg: 'bg-blue-500', text: 'text-blue-500 dark:text-blue-400' },
                            emerald: { bg: 'bg-emerald-500', text: 'text-emerald-500 dark:text-emerald-400' },
                        };
                        const currentThemeClasses = colorClasses[theme.color as keyof typeof colorClasses];

                        return (
                             <div key={update.id} className="relative pl-8 pb-6 last:pb-0">
                                <div className="absolute left-0 top-2">
                                     <div className={`h-3 w-3 rounded-full ${currentThemeClasses.bg}`}></div>
                                </div>
                                
                                <div className="flex flex-col items-start">
                                    <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                                        {new Date(update.createdAt).toLocaleString('en-US', { month: 'numeric', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true })}
                                    </p>
                                    <p className={`mt-1 font-semibold text-md ${currentThemeClasses.text}`}>
                                        {theme.text}
                                    </p>
                                    <div className="mt-1 text-slate-600 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                                        {update.message}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ServiceDetails;