import React, { useState } from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';
import { ChevronDown } from 'lucide-react';

interface FAQItemProps {
  question: string;
  children: React.ReactNode;
  isOpen: boolean;
  onClick: () => void;
}

const FAQItem: React.FC<FAQItemProps> = ({ question, children, isOpen, onClick }) => (
  <div className="py-4 border-b border-slate-200">
    <button onClick={onClick} className="w-full flex justify-between items-center text-left group">
      <h3 className={`font-bold text-lg ${isOpen ? 'text-emerald-700' : 'text-slate-800'} group-hover:text-emerald-700 transition-colors`}>{question}</h3>
      <ChevronDown className={`transform transition-transform duration-300 text-slate-500 ${isOpen ? 'rotate-180 text-emerald-700' : ''}`} />
    </button>
    <div className={`grid transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] pt-2' : 'grid-rows-[0fr]'}`} style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
        <div className="overflow-hidden">
            <div className="text-slate-600">
                {children}
            </div>
        </div>
    </div>
  </div>
);

const faqs = [
  {
    question: "What is StatusPulse?",
    answer: <p>StatusPulse is an enterprise-grade, self-hosted monitoring platform designed to provide real-time status updates for your websites, servers, and applications. It combines a beautiful user interface with powerful monitoring features.</p>
  },
  {
    question: "Is StatusPulse free?",
    answer: <p>StatusPulse is a commercial product offered by Conzex Global Private Limited. We offer various pricing tiers to suit different needs, from individual developers to large enterprises. Please visit our main website for pricing details.</p>
  },
  {
    question: "How is StatusPulse Licensed?",
    answer: <p>StatusPulse is licensed under a commercial software license. Please refer to our Terms of Service for full details on usage rights and restrictions.</p>
  },
  {
    question: "How many endpoints can I monitor?",
    answer: <p>The number of monitors depends on your license tier and the resources of your host server. Our platform is designed to be highly scalable to support thousands of endpoints.</p>
  },
  {
    question: "What is the default port for StatusPulse?",
    answer: <p>The default web interface for StatusPulse runs on port 3001.</p>
  },
  {
    question: "Does StatusPulse work with Docker?",
    answer: <p>Yes, absolutely. Docker is our recommended deployment method for a quick, easy, and isolated setup. We provide official Docker images and compose files.</p>
  },
  {
    question: "StatusPulse reports a service is 'Down' but it isn't. Why?",
    answer: <p>This can happen due to several reasons, such as a firewall blocking the probe from StatusPulse's server, a temporary network issue between the two points, or incorrect monitor settings (e.g., wrong port or keyword). Check your network configuration and monitor settings first. If the issue persists, contact our support team.</p>
  }
];

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(prevOpenIndex => (prevOpenIndex === index ? null : index));
  };

  return (
    <StaticPageLayout title="Frequently Asked Questions">
      <p className="text-lg text-slate-600">
        A comprehensive collection of questions that are frequently asked by our users. We hope these answer any concerns or queries you may have.
      </p>
      <div className="not-prose mt-8">
        {faqs.map((faq, index) => (
          <FAQItem
            key={index}
            question={faq.question}
            isOpen={openIndex === index}
            onClick={() => handleToggle(index)}
          >
            {faq.answer}
          </FAQItem>
        ))}
      </div>
    </StaticPageLayout>
  );
};

export default FAQ;
