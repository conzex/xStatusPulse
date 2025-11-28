import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Requirements: React.FC = () => (
  <StaticPageLayout title="System Requirements">
    <p className="text-lg text-slate-600">
      System requirements for StatusPulse vary based on usage, particularly the number of monitoring probes you have set up. The resources needed also depend on how it is run (e.g., directly on a server or as a container using Docker).
    </p>
    <p>
      The following requirements have been tested with a setup that had 25 probes of various endpoints including IP addresses, Websites, Ports, and Databases. The more probes you monitor, the more resources you will need.
    </p>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-8">
      <div>
        <h4 className="font-bold text-xl">Minimum Configuration</h4>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>CPU:</strong> 1 vCPU</li>
          <li><strong>RAM:</strong> 1 GB</li>
          <li><strong>Storage:</strong> 20 GB</li>
        </ul>
      </div>
      <div>
        <h4 className="font-bold text-xl">Recommended Configuration</h4>
        <ul className="list-disc pl-5 mt-2 space-y-1">
          <li><strong>CPU:</strong> 2 vCPU</li>
          <li><strong>RAM:</strong> 2 GB</li>
          <li><strong>Storage:</strong> 20 GB+</li>
        </ul>
      </div>
    </div>
    <h3 className="font-bold text-2xl">Supported Host Operating Systems</h3>
    <p>
        StatusPulse is designed to run on most modern server operating systems, including:
    </p>
    <ul className="list-disc pl-5 space-y-1">
        <li>Ubuntu, Debian, CentOS, Rocky Linux, ArchLinux</li>
        <li>Windows 10/11 (x64)</li>
        <li>Windows Server 2012 R2 and above</li>
    </ul>
  </StaticPageLayout>
);

export default Requirements;