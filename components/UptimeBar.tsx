import React, { useRef, useEffect, useState, useMemo } from 'react';
import { UptimePoint, ServiceStatus } from '../types';
import { CheckCircle, AlertTriangle, XCircle, Settings, Info } from 'lucide-react';
import { STATUS_COLORS } from '../constants';

interface UptimeBarProps {
  history: UptimePoint[];
}

const statusInfo: { [key in ServiceStatus]: { text: string; icon: React.ElementType; iconColor: string; } } = {
  [ServiceStatus.OPERATIONAL]: { text: "Operational", icon: CheckCircle, iconColor: 'text-emerald-400' },
  [ServiceStatus.DEGRADED]: { text: "Degraded Performance", icon: AlertTriangle, iconColor: 'text-yellow-400' },
  [ServiceStatus.PARTIAL_OUTAGE]: { text: "Partial Outage", icon: AlertTriangle, iconColor: 'text-orange-400' },
  [ServiceStatus.MAJOR_OUTAGE]: { text: "Major Outage", icon: XCircle, iconColor: 'text-rose-400' },
  [ServiceStatus.MAINTENANCE]: { text: "Maintenance", icon: Settings, iconColor: 'text-blue-400' },
};

const UptimeBar: React.FC<UptimeBarProps> = ({ history }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const [activeDayIndex, setActiveDayIndex] = useState<number | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0, opacity: 0 });

  useEffect(() => {
    if (activeDayIndex === null || !containerRef.current || !tooltipRef.current) {
      setTooltipPosition(prev => ({ ...prev, opacity: 0 }));
      return;
    }

    const dayElement = containerRef.current.children[activeDayIndex] as HTMLElement;
    const tooltipElement = tooltipRef.current;

    if (dayElement && tooltipElement) {
        const containerRect = containerRef.current.getBoundingClientRect();
        const dayRect = dayElement.getBoundingClientRect();
        const tooltipRect = tooltipElement.getBoundingClientRect();

        const top = -tooltipRect.height - 12; // 12px gap
        const left = (dayRect.left - containerRect.left) + (dayRect.width / 2);
        
        setTooltipPosition({ top, left, opacity: 1 });
    }
  }, [activeDayIndex]);

  const handleFocus = (index: number) => setActiveDayIndex(index);
  const handleBlur = () => setActiveDayIndex(null);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (activeDayIndex === null && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
        const firstDay = containerRef.current?.children[0] as HTMLButtonElement;
        firstDay?.focus();
        setActiveDayIndex(0);
        return;
    }
    if (activeDayIndex === null) return;
    
    let nextIndex = activeDayIndex;
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      nextIndex = Math.min(history.length - 1, activeDayIndex + 1);
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      nextIndex = Math.max(0, activeDayIndex - 1);
    }
    
    if (nextIndex !== activeDayIndex) {
      setActiveDayIndex(nextIndex);
      const nextElement = containerRef.current?.children[nextIndex] as HTMLButtonElement;
      nextElement?.focus();
    }
  };

  const activeDayData = useMemo(() => {
    if (activeDayIndex !== null && history[activeDayIndex]) {
      const day = history[activeDayIndex];
      const date = new Date(day.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const info = statusInfo[day.status] || { text: "Unknown Status", icon: Info, iconColor: 'text-slate-400' };
      return { ...day, date, info };
    }
    return null;
  }, [activeDayIndex, history]);

  return (
    <div className="relative w-full">
        {/* Tooltip */}
        <div
            ref={tooltipRef}
            role="tooltip"
            style={{
                top: `${tooltipPosition.top}px`,
                left: `${tooltipPosition.left}px`,
                opacity: tooltipPosition.opacity,
                transform: 'translateX(-50%)',
                willChange: 'transform, opacity',
            }}
            className="absolute z-30 transition-opacity duration-200 pointer-events-none"
        >
            {activeDayData && (
                <div className="bg-slate-800 dark:bg-slate-900/90 dark:backdrop-blur-sm dark:border dark:border-slate-700 text-white rounded-lg shadow-2xl px-4 py-3 w-max max-w-xs animate-zoom-in">
                    <p className="font-bold text-sm mb-2">{activeDayData.date}</p>
                    <div className="flex items-center text-xs">
                        <activeDayData.info.icon size={16} className={`mr-2 ${activeDayData.info.iconColor}`} />
                        <span className="font-medium">{activeDayData.info.text}</span>
                    </div>
                    {activeDayData.incidentTitle && (
                         <div className="mt-2 pt-2 border-t border-slate-600">
                             <p className="text-xs text-slate-300">
                                 <span className="font-bold">Related Incident:</span> {activeDayData.incidentTitle}
                             </p>
                         </div>
                    )}
                    <div className="absolute left-1/2 -translate-x-1/2 bottom-[-5px] w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-slate-800 dark:border-t-slate-900"></div>
                </div>
            )}
        </div>

        <div 
          ref={containerRef} 
          onKeyDown={handleKeyDown}
          className="flex items-end gap-px w-full"
        >
            {history.map((day, index) => {
                const dayHeight = day.status === ServiceStatus.OPERATIONAL ? 'h-10' :
                                day.status === ServiceStatus.DEGRADED ? 'h-8' :
                                day.status === ServiceStatus.PARTIAL_OUTAGE ? 'h-6' :
                                day.status === ServiceStatus.MAJOR_OUTAGE ? 'h-4' :
                                'h-8';

                return (
                    <button
                        key={day.timestamp}
                        aria-label={`${new Date(day.timestamp).toLocaleDateString()}: ${statusInfo[day.status].text}`}
                        onMouseEnter={() => handleFocus(index)}
                        onMouseLeave={handleBlur}
                        onFocus={() => handleFocus(index)}
                        onBlur={handleBlur}
                        className={`flex-1 rounded-[1px] outline-none transition-all duration-150 ${STATUS_COLORS[day.status]} ${activeDayIndex === index ? 'ring-2 ring-emerald-500 ring-offset-2 ring-offset-slate-50 dark:ring-offset-slate-900' : ''} ${dayHeight}`}
                    />
                );
            })}
        </div>
        
        <div className="flex justify-between text-xs font-medium text-slate-400 dark:text-slate-500 mt-2 px-1">
            <span>90 Days Ago</span>
            <span>Today</span>
        </div>
    </div>
  );
};

export default UptimeBar;
