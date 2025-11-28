import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Zap, BarChart2, Bell, ShieldCheck, Settings2, Languages } from 'lucide-react';

const WhyItem: React.FC<{ icon: React.ElementType, title: string, children: React.ReactNode }> = ({ icon: Icon, title, children }) => (
  <div className="flex items-start">
    <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg mr-5">
        <Icon size={24} />
    </div>
    <div>
        <h4 className="font-bold text-lg">{title}</h4>
        <p className="text-slate-600 mt-1">{children}</p>
    </div>
  </div>
);

const WhyStatusPulse: React.FC = () => (
  <StaticPageLayout title="Why StatusPulse?">
    <p className="text-lg text-slate-600">
        With a powerful feature set, a beautiful interface, and a focus on reliability, StatusPulse is one of the best monitoring tools available.
        It gets continuous improvements and can monitor simple websites to more complex environments involving Docker Containers, SQL Databases, and more.
    </p>
    <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 mt-10">
        <WhyItem icon={Zap} title="Comprehensive Monitoring">
            Monitor uptime for any network service. StatusPulse can monitor HTTP/HTTPS URLs, TCP Ports, HTTP(s) Keywords, JSON queries, Databases, Ping, DNS records, and Docker Containers.
        </WhyItem>
        <WhyItem icon={BarChart2} title="Beautiful Ping Charts">
            The monitoring data collected by StatusPulse is visualized beautifully in interactive, fluid, and easy-to-understand charts, available for every monitor you add.
        </WhyItem>
        <WhyItem icon={Bell} title="Receive Instant Notifications">
            Receive notifications on over 95+ different channels. Set up Email (SMTP), Telegram, Slack, Discord, and many more. Never miss a critical alert again.
        </WhyItem>
        <WhyItem icon={ShieldCheck} title="SSL Certificate Monitoring">
            Get notified well in advance of SSL certificate expirations, so you can renew them in a timely manner and ensure uninterrupted service.
        </WhyItem>
        <WhyItem icon={Settings2} title="Multiple Status Pages">
            Create multiple, beautiful status pages for specific services or customers. Clearly communicate system health, incidents, and outages.
        </WhyItem>
         <WhyItem icon={Languages} title="Multi-Language Support">
            StatusPulse is available in over 20+ languages, with more being added continuously, making it accessible for teams around the world.
        </WhyItem>
    </div>
  </StaticPageLayout>
);

export default WhyStatusPulse;