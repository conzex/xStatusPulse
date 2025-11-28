import { Incident, IncidentUpdate, AppSettings } from '../types';

export const generateEmailTemplate = (incident: Incident, update: IncidentUpdate, appSettings: AppSettings): string => {
  const brandColor = '#10B981'; // emerald-500
  const lightBg = '#F8FAFC'; // slate-50
  const darkText = '#1E293B'; // slate-800
  const lightText = '#64748B'; // slate-500
  const fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

  const statusInfo = {
    investigating: { text: 'Investigating', color: '#F97316' }, // orange-500
    identified: { text: 'Identified', color: '#EAB308' }, // yellow-500
    monitoring: { text: 'Monitoring', color: '#3B82F6' }, // blue-500
    resolved: { text: 'Resolved', color: '#10B981' }, // emerald-500
  };

  const currentStatus = statusInfo[update.status];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>[${appSettings.appName}] ${incident.title}</title>
    <style>
        body { font-family: ${fontFamily}; margin: 0; padding: 0; background-color: ${lightBg}; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #E2E8F0; border-radius: 12px; overflow: hidden; }
        .header { background-color: #ffffff; padding: 24px; text-align: left; border-bottom: 1px solid #E2E8F0;}
        .logo { display: inline-block; color: ${darkText}; text-decoration: none; font-size: 24px; font-weight: bold; }
        .content { padding: 32px; }
        h1 { color: ${darkText}; font-size: 24px; margin-top: 0; margin-bottom: 12px; font-weight: 700;}
        p { color: ${lightText}; line-height: 1.6; }
        .status-box { background-color: ${currentStatus.color}; color: white; padding: 4px 12px; border-radius: 9999px; font-weight: bold; text-transform: uppercase; display: inline-block; margin-bottom: 20px; font-size: 12px; }
        .update-message { background-color: ${lightBg}; border-left: 4px solid ${brandColor}; padding: 16px; border-radius: 4px; }
        .footer { background-color: #F1F5F9; padding: 24px; text-align: center; font-size: 12px; color: #94A3B8; }
        .footer a { color: ${brandColor}; text-decoration: none; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <a href="#" class="logo" style="color: ${darkText};">${appSettings.appName}</a>
        </div>
        <div class="content">
            <div class="status-box" style="background-color: ${currentStatus.color};">${currentStatus.text}</div>
            <h1>${incident.title}</h1>
            <div class="update-message">
                <p style="margin:0; color: ${darkText};">${update.message.replace(/\n/g, '<br>')}
            </div>
            <p style="margin-top: 24px;">We will continue to provide updates as more information becomes available. You can view the full status page for more details.</p>
        </div>
        <div class="footer">
            <p>You are receiving this email because you are subscribed to updates from ${appSettings.appName}.</p>
            <p>${appSettings.footerCredit}</p>
        </div>
    </div>
</body>
</html>
  `;
};