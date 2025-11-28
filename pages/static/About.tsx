import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const About: React.FC = () => (
  <StaticPageLayout title="About StatusPulse">
    <h3 className="font-bold text-2xl">Our Story</h3>
    <p>
      First released in 2024, StatusPulse was created by Conzex Global Private Limited due to the need for a modern, reliable, and powerful
      self-hosted monitoring tool. We observed that many existing solutions were either no longer maintained, lacked a modern user experience,
      or locked essential features behind expensive enterprise plans.
    </p>
    <p>
      StatusPulse is a proprietary, enterprise-grade product developed with modern technologies to deliver a beautiful,
      reactive, and fast user interface. It is designed to be easy to deploy and a pleasure to use, providing clarity and confidence
      in your infrastructure's status. Our platform is built for performance and scalability, supporting most popular server operating systems.
    </p>
    <h3 className="font-bold text-2xl mt-8">Our Mission</h3>
    <p>
      Our mission is to provide a best-in-class monitoring solution that combines powerful, enterprise-grade features with an intuitive,
      beautiful interface. We believe that monitoring tools should empower teams, not overwhelm them. With features like 20-second monitoring intervals,
      multi-channel notifications, and highly customizable status pages, StatusPulse is built to be the central source of truth for your system's health.
    </p>
    
    <h3 className="font-bold text-2xl mt-8">Who is it for?</h3>
    <h4 className="font-bold text-xl mt-4">Home Labs & Personal Projects</h4>
    <p>
      Do you have your own media server, websites, and home automation systems? StatusPulse is perfect for monitoring your home servers,
      providing professional-grade tools for your personal infrastructure.
    </p>
    <h4 className="font-bold text-xl mt-4">Businesses</h4>
    <p>
      If you run a small or medium-sized business and need your infrastructure, network, and servers monitored, StatusPulse can handle it.
      Monitor websites, APIs, and databases without a sweat, and keep your customers informed with professional status pages.
    </p>
    <h4 className="font-bold text-xl mt-4">Enterprises</h4>
    <p>
      No matter the size of your infrastructure, StatusPulse is designed to scale. It can handle thousands of endpoints and monitor them
      at different levels of sensitivity and complexity, from a simple ping check to ensuring a critical database port is alive.
    </p>
  </StaticPageLayout>
);

export default About;