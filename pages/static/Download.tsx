import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Server, Monitor, Container, Code } from 'lucide-react';

const DownloadItem: React.FC<{
  icon: React.ElementType,
  title: string,
  description: string,
  link: string,
}> = ({ icon: Icon, title, description, link }) => (
  <div className="border border-slate-200 rounded-xl p-6 text-center">
    <Icon size={48} className="mx-auto text-emerald-500 mb-4" />
    <h3 className="text-xl font-bold">{title}</h3>
    <p className="text-slate-500 mt-2 mb-6 h-12">{description}</p>
    <a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block bg-slate-900 text-white font-bold py-2 px-6 rounded-lg hover:bg-slate-800 transition-colors"
    >
      Installation Guide
    </a>
  </div>
);

const Download: React.FC = () => (
  <StaticPageLayout title="Download & Installation">
    <p className="text-lg text-slate-600">
      StatusPulse is available for a vast variety of platforms. The installation process is designed to be as simple as possible.
      Please refer to the detailed instructions in our Knowledge Base for your specific platform.
    </p>
    <div className="not-prose grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-10">
      <DownloadItem
        icon={Container}
        title="Docker & Docker Compose"
        description="The recommended method for a fast and isolated deployment."
        link="https://docs.conzex.com/statuspulse/docker"
      />
      <DownloadItem
        icon={Server}
        title="Linux / Ubuntu / Debian"
        description="Install directly on your Linux-based servers."
        link="https://docs.conzex.com/statuspulse/linux"
      />
      <DownloadItem
        icon={Monitor}
        title="Windows Server & Desktop"
        description="Deploy on Windows Server or Windows 10/11 (x64)."
        link="https://docs.conzex.com/statuspulse/windows"
      />
    </div>

    <h3 className="mt-12 font-bold text-2xl">Installation Example (Docker)</h3>
    <p>
      Running StatusPulse with Docker is the quickest way to get started. Use the following command in your terminal:
    </p>
    <pre>
      <code>
        {`docker run -d \\
  --restart=always \\
  -p 3001:3001 \\
  -v statuspulse_data:/app/data \\
  --name statuspulse \\
  conzex/statuspulse:latest`}
      </code>
    </pre>
    <p>
      For more advanced configurations, including Docker Compose, please visit our official documentation on <a href="https://docs.conzex.com">docs.conzex.com</a>.
    </p>
  </StaticPageLayout>
);

export default Download;