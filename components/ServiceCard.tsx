import React, { useMemo } from 'react';
import { Service, ServiceStatus, Incident } from '../types';
import { SERVICE_ICONS_MAP, STATUS_TEXT_COLORS } from '../constants';
import { 
  Globe, Lock, Server, Database, ShieldCheck, AlertTriangle, 
  CheckCircle, Activity, Terminal, Monitor, Folder, EyeOff, ChevronRight,
  Mail, Users, Clock, MessageSquare, Router, Network, Route, Container, Search, Code
} from 'lucide-react';
import UptimeBar from './UptimeBar';

interface ServiceCardProps {
  service: Service;
  incidents: Incident[];
  onClick?: (id: string) => void;
}

const IconComponent: React.FC<{ name: string, className?: string }> = ({ name, className }) => {
  const icons: { [key: string]: React.ElementType } = {
    Globe, Lock, Network, Route, Container, Database, Activity, Terminal, Monitor, Folder,
    Mail, Users, Clock, MessageSquare, Router, Shield: ShieldCheck, Search, Code
  };
  const Icon = icons[name] || Activity;
  return <Icon className={className} />;
};

const ServiceCard: React.FC<ServiceCardProps> = ({ service, incidents, onClick }) => {
  const isOperational = service.status === ServiceStatus.OPERATIONAL;
  
  const formatStatus = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

  const uptimePercentage = useMemo(() => {
    const total = service.uptimeHistory.length;
    if (total === 0) return '100.00';
    const downCount = service.uptimeHistory.filter(p => p.status === ServiceStatus.MAJOR_OUTAGE).length;
    return ((total - downCount) / total * 100).toFixed(2);
  }, [service.uptimeHistory]);

  return (
    <div 
      onClick={() => onClick && onClick(service.id)}
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-lg hover:border-emerald-300 dark:hover:border-emerald-600 transition-all duration-300 p-5 mb-4 group relative hover:z-10 ${onClick ? 'cursor-pointer' : ''}`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-5">
        <div className="flex items-center mb-4 md:mb-0">
          <div className={`p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mr-4`}>
             <IconComponent name={SERVICE_ICONS_MAP[service.type]} className="w-6 h-6" />
          </div>
          <div>
             <div className="flex items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 tracking-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-500 transition-colors">{service.name}</h3>
                <span className="ml-3 text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 rounded uppercase tracking-wide">
                    {service.type}
                </span>
             </div>
             
             <div className="flex items-center mt-1">
                {service.publiclyDisplayDetails && service.url ? (
                    <p className="text-sm text-slate-500 dark:text-slate-400 font-mono flex items-center">
                        {service.url}
                    </p>
                ) : (
                     <p className="text-xs text-slate-500 dark:text-slate-400 font-medium flex items-center">
                        <EyeOff size={12} className="mr-1.5"/> Resource details hidden
                    </p>
                )}
             </div>
          </div>
        </div>
        
        <div className="flex shrink-0 items-center justify-end md:space-x-6 lg:space-x-8">
           {service.sslExpiry !== undefined && (
             <div className={`hidden sm:flex items-center gap-1.5 text-xs font-medium ${service.sslExpiry < 30 ? 'text-orange-600 dark:text-orange-400' : 'text-slate-500 dark:text-slate-400'}`}>
                <ShieldCheck size={14} />
                <span>{service.sslExpiry} days left</span>
             </div>
           )}
           <div className="hidden sm:block text-center">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">{uptimePercentage}%</span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase font-medium whitespace-nowrap block">90-Day Uptime</span>
           </div>

           <div className="flex items-center space-x-4">
            <div className="flex flex-col items-end min-w-[120px]">
              <div className={`flex items-center font-bold text-sm ${STATUS_TEXT_COLORS[service.status]} ${isOperational ? 'dark:text-emerald-400' : ''}`}>
                {isOperational ? <CheckCircle size={16} className="mr-1.5" /> : <AlertTriangle size={16} className="mr-1.5" />}
                {formatStatus(service.status)}
              </div>
              <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 font-medium whitespace-nowrap">
                  {service.currentLatency}ms response
              </span>
            </div>
            
            {onClick && <ChevronRight className="text-slate-300 dark:text-slate-600 group-hover:text-emerald-500 transition-colors" size={20} />}
           </div>
        </div>
      </div>

      <UptimeBar history={service.uptimeHistory} />
    </div>
  );
};

export default ServiceCard;
