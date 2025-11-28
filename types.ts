export enum ServiceType {
  HTTP = 'HTTP',
  HTTPS = 'HTTPS',
  TCP = 'TCP',
  DNS = 'DNS',
  DOCKER = 'DOCKER',
  DATABASE = 'DATABASE',
  PING = 'PING',
  SSH = 'SSH',
  FTP = 'FTP',
  SMTP = 'SMTP',
  LDAP = 'LDAP',
  NTP = 'NTP',
  TELNET = 'TELNET',
  VPN = 'VPN',
  SNMP = 'SNMP',
  DHCP = 'DHCP',
  HTTP_KEYWORD = 'HTTP_KEYWORD',
  JSON_QUERY = 'JSON_QUERY',
}

export enum ServiceStatus {
  OPERATIONAL = 'operational',
  DEGRADED = 'degraded',
  PARTIAL_OUTAGE = 'partial_outage',
  MAJOR_OUTAGE = 'major_outage',
  MAINTENANCE = 'maintenance',
}

export interface UptimePoint {
  timestamp: number;
  status: ServiceStatus;
  latency: number;
  incidentTitle?: string; // Link to an incident on that day
}

export interface Service {
  id: string;
  name: string;
  description?: string;
  type: ServiceType;
  url?: string; // Can be IP, URL, or Hostname
  port?: number;
  status: ServiceStatus;
  uptimeHistory: UptimePoint[]; // Last 90 days
  currentLatency: number;
  sslExpiry?: number; // Days until expiry
  lastCheck: Date;
  publiclyDisplayDetails: boolean; // Admin control to show/hide URL/IP
}

export interface ServiceGroup {
  id: string;
  name: string;
  description: string;
  services: Service[];
}

export type IncidentStatus = 'investigating' | 'identified' | 'monitoring' | 'resolved';

export interface IncidentUpdate {
  id: string;
  status: IncidentStatus;
  message: string;
  createdAt: Date;
}

export enum IncidentPriority {
    CRITICAL = 'critical',
    HIGH = 'high',
    MEDIUM = 'medium',
    LOW = 'low',
}

export interface Incident {
  id: string;
  title: string;
  createdAt: Date;
  affectedServiceIds: string[]; // List of service IDs, or ['global']
  updates: IncidentUpdate[];
  priority: IncidentPriority;
}

export enum UserRole {
    VIEWER = 'viewer',
    MANAGER = 'manager',
    SUPER_ADMIN = 'super_admin',
}

export interface User {
  id: string;
  username: string;
  role: UserRole;
  password?: string; // For mock store only
  mustChangePassword?: boolean; // For initial login flow
  forcePasswordChange?: boolean; // For admin-forced resets
}

export interface Subscriber {
  id: string;
  email: string;
  createdAt: Date;
}

export interface SMTPSettings {
  host: string;
  port: number | null;
  user: string;
  pass: string;
  secure: boolean;
}

export type Theme = 'system' | 'light' | 'dark';

export interface FooterLink {
    label: string;
    page: string; // Corresponds to a page key in App.tsx
}

export interface FooterMenu {
    id: string;
    title: string;
    icon: string;
    links: FooterLink[];
}

export interface ContactDetail {
    id: string;
    icon: string;
    title: string;
    description: string;
    link: string;
    value: string;
    iconColor: string;
    enabled: boolean;
}

export interface CompanyInfoLink {
    label: string;
    link: string;
    icon: string;
}

export interface AppSettings {
    appName: string;
    logoUrl: string;
    faviconUrl: string;
    footerCredit: string;
    showConzexCredits: boolean;
    companyName: string;
    companyInfoLinks: CompanyInfoLink[];
    footerMenus: FooterMenu[];
    contactDetails: ContactDetail[];
}