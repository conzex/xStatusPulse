import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Check } from 'lucide-react';

const FeatureItem: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li className="flex items-start">
    <Check className="w-6 h-6 text-emerald-500 mr-3 mt-1 flex-shrink-0" />
    <span>{children}</span>
  </li>
);

const Features: React.FC = () => (
  <StaticPageLayout title="Core Features">
    <p className="text-lg text-slate-600 dark:text-slate-300">
      StatusPulse is the ultimate choice for monitoring your network and servers. It offers a powerful suite of features designed for reliability and ease of use.
    </p>
    <ul className="list-none !pl-0 mt-8 space-y-4">
      <FeatureItem>
        <strong>Comprehensive Monitoring:</strong> Monitor uptime for any network service, including HTTP/HTTPS URLs, TCP Ports, HTTP(s) Keywords, JSON queries, Databases (MySQL, PostgreSQL), Ping, DNS records, and Docker Containers.
      </FeatureItem>
       <FeatureItem>
        <strong>Beautiful & Reactive UI:</strong> A modern, fast, and intuitive user interface that makes monitoring a pleasure, not a chore.
      </FeatureItem>
       <FeatureItem>
        <strong>Powerful Visualizations:</strong> Beautiful, interactive charts provide a clear view of historical uptime and performance data for every monitor.
      </FeatureItem>
      <FeatureItem>
        <strong>95+ Notification Channels:</strong> Get notified instantly when an alert fires for a downed service. We support Slack, Telegram, Discord, SendGrid, Email (SMTP), and many more.
      </FeatureItem>
      <FeatureItem>
        <strong>High-Frequency Monitoring:</strong> With monitoring intervals as low as 20 seconds, you can catch critical downtime events the moment they happen.
      </FeatureItem>
      <FeatureItem>
        <strong>Customizable Status Pages:</strong> Create multiple, beautiful, public-facing status pages to keep your customers informed during maintenance or incidents.
      </FeatureItem>
       <FeatureItem>
        <strong>SSL Certificate Monitoring:</strong> Keep a close eye on your SSL certificates and get notified well before they expire to prevent security warnings.
      </FeatureItem>
       <FeatureItem>
        <strong>Multi-Role User Management:</strong> Secure your dashboard with a robust user management system, featuring roles for Viewers, Managers, and Super Admins.
      </FeatureItem>
      <FeatureItem>
        <strong>Dynamic Service Groups:</strong> Organize your monitors into logical groups that can be managed directly from the admin dashboard.
      </FeatureItem>
      <FeatureItem>
        <strong>AI-Assisted Incident Management:</strong> Leverage the power of Google's Gemini AI to draft professional, reassuring incident reports and updates in seconds.
      </FeatureItem>
      <FeatureItem>
        <strong>Multi-Language Support:</strong> StatusPulse is available in over 20+ languages, with more being added continuously, making it accessible for teams around the world.
      </FeatureItem>
    </ul>
  </StaticPageLayout>
);

export default Features;