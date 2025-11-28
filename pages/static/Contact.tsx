import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';
import { Ticket, BookOpen, Globe, Mail, Phone, MessageSquare, Info } from 'lucide-react';
import { ContactDetail } from '../../types';

const iconMap: { [key: string]: React.ElementType } = {
    Ticket, BookOpen, Globe, Mail, Phone, MessageSquare
};

interface ContactItemProps {
  detail: ContactDetail;
}
const ContactItem: React.FC<ContactItemProps> = ({ detail }) => {
    const Icon = iconMap[detail.icon] || Ticket;
    return (
      <a
        href={detail.link}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start p-6 bg-slate-50/70 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-emerald-300 dark:hover:border-emerald-600 hover:bg-white dark:hover:bg-slate-800 transition-all group no-underline shadow-sm hover:shadow-lg"
      >
        <div className={`p-4 rounded-full ${detail.iconColor} mr-5 shadow-inner`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-700 dark:group-hover:text-emerald-500">{detail.title}</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-1">{detail.description}</p>
          <p className="text-emerald-600 dark:text-emerald-500 font-mono text-sm mt-2 font-bold">{detail.value}</p>
        </div>
      </a>
    );
};

interface ContactProps {
    contactDetails: ContactDetail[];
}

const Contact: React.FC<ContactProps> = ({ contactDetails }) => {
  const enabledContactDetails = contactDetails.filter(detail => detail.enabled);

  return (
      <StaticPageLayout title="Contact Support">
        <p className="text-lg text-slate-600 dark:text-slate-300">
          We're here to help. Whether you have a question about features, need assistance with your setup, or have any feedback,
          please don't hesitate to reach out through one of our official channels.
        </p>
        {enabledContactDetails.length > 0 ? (
            <div className="not-prose grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {enabledContactDetails.map(detail => <ContactItem key={detail.id} detail={detail} />)}
            </div>
        ) : (
            <div className="not-prose mt-10 p-8 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                <Info size={32} className="mx-auto text-slate-400 dark:text-slate-500 mb-3" />
                <p className="text-slate-500 dark:text-slate-400 font-medium">Contact information is not available at this time.</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm">Please check back later or contact the site administrator.</p>
            </div>
        )}
      </StaticPageLayout>
  );
};
export default Contact;
