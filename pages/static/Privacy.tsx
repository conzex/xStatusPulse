import React from 'react';
import StaticPageLayout from '../../components/StaticPageLayout';

const Privacy: React.FC = () => (
  <StaticPageLayout title="Privacy Policy">
    <h3 className="font-bold text-xl">Who we are</h3>
    <p>Our website address is: <a href="https://www.conzex.com/statuspulse">https://www.conzex.com/statuspulse</a></p>
    <p>This policy is effective as of 01 January 2025.</p>

    <h3 className="font-bold text-xl mt-6">What personal data we collect and why we collect it</h3>
    <h4 className="font-bold text-lg mt-2">Log Data</h4>
    <p>When you visit our website, our servers may automatically log the standard data provided by your web browser. This may include your device’s Internet Protocol (IP) address, your browser type and version, the pages you visit, the time and date of your visit, the time spent on each page, and other details.</p>
    <p>Additionally, if you encounter certain errors while using the site, we may automatically collect data about the error and the circumstances surrounding its occurrence. This data may include technical details about your device, what you were trying to do when the error happened, and other technical information relating to the problem.</p>

    <h4 className="font-bold text-lg mt-2">Cookies</h4>
    <p>This website uses cookies to help personalize your online experience. A cookie is a text file that is placed on your hard disk by a web server.</p>
    <p>If you visit our login page, we will set a temporary cookie to determine if your browser accepts cookies. This cookie contains no personal data and is discarded when you close your browser.</p>
    <p>When you log in, we will also set up several cookies to save your login information and your screen display choices. Login cookies last for two days, and screen options cookies last for a year. If you select “Remember Me”, your login will persist for two weeks. If you log out of your account, the login cookies will be removed.</p>

    <h4 className="font-bold text-lg mt-2">Embedded content from other websites</h4>
    <p>Articles on this site may include embedded content (e.g. videos, images, articles, etc.). Embedded content from other websites behaves in the exact same way as if the visitor has visited the other website. These websites may collect data about you, use cookies, embed additional third-party tracking, and monitor your interaction with that embedded content.</p>

    <h3 className="font-bold text-xl mt-6">How long we retain your data</h3>
    <p>For users that register on our website (if any), we store the personal information they provide in their user profile. All users can see, edit, or delete their personal information at any time (except they cannot change their username). Website administrators can also see and edit that information.</p>

    <h3 className="font-bold text-xl mt-6">What rights you have over your data</h3>
    <p>If you have an account on this site, you can request to receive an exported file of the personal data we hold about you, including any data you’ve provided to us. You can also request that we erase any personal data we hold about you. This does not include any data we’re obliged to keep for administrative, legal, or security purposes.</p>

    <h3 className="font-bold text-xl mt-6">How we protect your data</h3>
    <p>We have the following security measures in place:</p>
    <ul>
        <li>The website uses SSL/TLS encryption on all pages so the communications between you and the website are secured.</li>
        <li>The website backend and services are also regularly updated to the latest security releases.</li>
    </ul>

    <h3 className="font-bold text-xl mt-6">Changes and Amendments</h3>
    <p>We reserve the right to modify this privacy policy at any time. We will notify you of any changes by posting the new privacy policy on this page.</p>

    <h3 className="font-bold text-xl mt-6">Accepting this Policy</h3>
    <p>By using and visiting our website, you consent to our privacy policy and the terms within this policy page. You acknowledge that you have read the policy above and agree to it. If you do not agree with the terms of this policy, you are not authorized to use or access our website.</p>

    <h3 className="font-bold text-xl mt-6">Contact Information</h3>
    <p>If you have any concerns or queries with regard to this privacy policy, please reach out using the details on our <a href="/contact">Contact Support</a> page.</p>
  </StaticPageLayout>
);

export default Privacy;