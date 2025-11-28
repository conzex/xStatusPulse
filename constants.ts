import { ServiceType } from './types';

export const MOCK_REFRESH_RATE = 5000; 
export const MAX_HISTORY_POINTS = 90; // 90 Days view

export const STATUS_COLORS = {
  operational: 'bg-green-500',
  degraded: 'bg-amber-400',
  partial_outage: 'bg-orange-500',
  major_outage: 'bg-red-500',
  maintenance: 'bg-sky-500',
};

export const STATUS_TEXT_COLORS = {
  operational: 'text-green-700',
  degraded: 'text-amber-700',
  partial_outage: 'text-orange-700',
  major_outage: 'text-red-700',
  maintenance: 'text-sky-700',
};

export const STATUS_TAG_CLASSES = {
  operational: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  degraded: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300',
  partial_outage: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  major_outage: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  maintenance: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300',
};

export const STATUS_DETAIL_BADGE_CLASSES = {
  operational: 'bg-green-500 bg-opacity-10 text-green-600 border border-green-500 border-opacity-20',
  degraded: 'bg-amber-500 bg-opacity-10 text-amber-600 border border-amber-500 border-opacity-20',
  partial_outage: 'bg-orange-500 bg-opacity-10 text-orange-600 border border-orange-500 border-opacity-20',
  major_outage: 'bg-red-500 bg-opacity-10 text-red-600 border border-red-500 border-opacity-20',
  maintenance: 'bg-sky-500 bg-opacity-10 text-sky-600 border border-sky-500 border-opacity-20',
};

export const SERVICE_ICONS_MAP: Record<string, string> = {
  HTTP: 'Globe',
  HTTPS: 'Lock',
  TCP: 'Network',
  DNS: 'Route',
  DOCKER: 'Container',
  DATABASE: 'Database',
  PING: 'Activity',
  SSH: 'Terminal',
  RDP: 'Monitor',
  FTP: 'Folder',
  SMTP: 'Mail',
  LDAP: 'Users',
  NTP: 'Clock',
  TELNET: 'MessageSquare',
  VPN: 'Shield',
  SNMP: 'Router',
  DHCP: 'Network',
  HTTP_KEYWORD: 'Search',
  JSON_QUERY: 'Code',
};

export const DEFAULT_SERVICE_PORTS: Partial<Record<ServiceType, number>> = {
  [ServiceType.HTTP]: 80,
  [ServiceType.HTTPS]: 443,
  [ServiceType.FTP]: 21,
  [ServiceType.SSH]: 22,
  [ServiceType.TELNET]: 23,
  [ServiceType.SMTP]: 25,
  [ServiceType.DNS]: 53,
  [ServiceType.DHCP]: 67,
  [ServiceType.NTP]: 123,
  [ServiceType.SNMP]: 161,
  [ServiceType.LDAP]: 389,
};


export const INCIDENT_STATUS_THEME = {
  investigating: { icon: 'Search', color: 'orange', text: 'Investigating' },
  identified: { icon: 'FileCheck', color: 'yellow', text: 'Identified' },
  monitoring: { icon: 'Eye', color: 'blue', text: 'Monitoring' },
  resolved: { icon: 'CheckCircle', color: 'emerald', text: 'Resolved' },
};

export const INCIDENT_PRIORITY_THEME = {
  critical: { text: 'Critical', icon: 'Radiation', classes: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300 border-red-500/50' },
  high: { text: 'High', icon: 'Flame', classes: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300 border-orange-500/50' },
  medium: { text: 'Medium', icon: 'Triangle', classes: 'bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-300 border-amber-500/50' },
  low: { text: 'Low', icon: 'Info', classes: 'bg-sky-100 text-sky-800 dark:bg-sky-900/50 dark:text-sky-300 border-sky-500/50' },
};