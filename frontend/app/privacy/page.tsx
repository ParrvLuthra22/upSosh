'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';

export default function PrivacyPage() {
  return (
    <main className="pt-24">
      <Section className="bg-gradient-to-br from-light-blue to-white dark:from-dark-navy to-dark-black">
        <Container>
          <motion.div
            className="max-w-6xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="mb-12">
              <div className="inline-block px-4 py-2 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-semibold mb-4">
                India-Compliant Privacy Policy
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Privacy Policy</span>
              </h1>
              <p className="text-xl text-light-secondary dark:text-dark-slate mb-6">
                Your privacy and data protection rights under Indian law
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-light-secondary dark:text-dark-slate">
                <span><strong>Last Updated:</strong> 19th December 2025</span>
                <span><strong>Effective From:</strong> 19th December 2025</span>
              </div>
            </div>

            {/* Introduction */}
            <div className="glass-card mb-8">
              <p className="mb-4">
                upSosh Technologies ("Company", "we", "our", "us") operates the upSosh mobile application, website, platform, and services ("Platform"). This Privacy Policy explains how we collect, use, store, share, and protect your personal data.
              </p>
              <p className="mb-4">
                By creating an account, submitting information, purchasing tickets, hosting events, or using any part of the Platform, you ("User", "Attendee", "Host", "Organizer") agree to this Privacy Policy.
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                <strong className="text-yellow-700 dark:text-yellow-400">Important:</strong>
                <span className="ml-2">If you do not agree, please stop using the Platform immediately.</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 text-light-secondary dark:text-dark-slate">
              
              {/* Scope & Legal Compliance */}
              <section className="glass-card" id="scope">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">1. Scope & Legal Compliance</h2>
                <p className="mb-4">This Privacy Policy is drafted to comply fully with:</p>
                
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded mb-4">
                  <h3 className="font-bold text-green-700 dark:text-green-400 mb-3">Indian Laws</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Digital Personal Data Protection Act (DPDP Act), 2023</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Information Technology Act, 2000</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> IT (Reasonable Security Practices and SPDI Rules), 2011</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Consumer Protection Act, 2019</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> CERT-In Cybersecurity Directions (2022)</li>
                  </ul>
                </div>
              </section>

              {/* Types of Data Collected */}
              <section className="glass-card" id="data-types">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">2. Types of Personal Data We Collect</h2>
                <p className="mb-6">We collect personal and sensitive personal data as defined under Indian law:</p>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <div className="glass-card border-2 border-primary">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">2.1 Personal Data You Provide</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Name</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Phone number</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Email address</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Date of birth / Age</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Gender (optional)</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Profile photo (optional)</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Event interests or preferences</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Location (if you enable it)</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Host identity verification documents (KYC-type)</li>
                    </ul>
                  </div>

                  <div className="glass-card border-2 border-red-500">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">2.2 Sensitive Personal Data (SPDI)</h3>
                    <p className="text-sm mb-4 text-red-600 dark:text-red-400 font-semibold">Collected only when necessary:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Payment information</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> UPI IDs</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Transaction IDs</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Financial metadata from payment gateways</li>
                    </ul>
                    <div className="mt-4 bg-blue-50 dark:bg-blue-900/20 p-3 rounded">
                      <p className="text-sm"><strong>Important:</strong> We do NOT store your card numbers or bank credentials — payment processors handle them.</p>
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card border-2 border-light-border dark:border-dark-border">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">2.3 Automatically Collected Data</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Device information</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> IP address</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Browsing behavior</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Location (if enabled)</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> App interaction logs</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Error/crash reports</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Time spent on screens</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Chat metadata (NOT message content unless flagged)</li>
                    </ul>
                  </div>

                  <div className="glass-card border-2 border-light-border dark:border-dark-border">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">2.4 Data from Third Parties</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Payment confirmation from gateways</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> OTP verification services</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Host interactions</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Fraud-prevention partners</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Purpose of Data Collection */}
              <section className="glass-card" id="purpose">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">3. Purpose of Data Collection</h2>
                <p className="mb-6">We use your information for:</p>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-6">
                    <h3 className="text-xl font-bold text-primary mb-3">3.1 Service Delivery (Contractual Necessity)</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Creating accounts</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Ticket booking & checkout</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Sending event confirmations</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Event hosting & listing</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Customer support</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Resolving disputes</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-3">3.2 Legal Compliance</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> DPDP Act obligations</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Tax & financial records</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> KYC verification (for hosts)</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Government/law enforcement requests</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-red-500 pl-6">
                    <h3 className="text-xl font-bold text-red-600 dark:text-red-400 mb-3">3.3 Platform Safety & Fraud Prevention</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Detecting suspicious activity</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Preventing duplicate tickets</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Securing accounts</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Verifying host legitimacy</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-blue-500 pl-6">
                    <h3 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-3">3.4 Communication</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Booking emails/SMS</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Important service updates</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Security alerts</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Event reminders</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-purple-500 pl-6">
                    <h3 className="text-xl font-bold text-purple-600 dark:text-purple-400 mb-3">3.5 Consent-based Processing</h3>
                    <p className="mb-3 text-sm">Used only if you give consent:</p>
                    <ul className="space-y-2 mb-4">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Marketing communications</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Personalized recommendations</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Optional surveys</li>
                    </ul>
                    <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded">
                      <p className="text-sm font-semibold">You can withdraw consent anytime.</p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Legal Basis */}
              <section className="glass-card" id="legal-basis">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">4. Legal Basis for Processing Personal Data</h2>
                <p className="mb-4">As required under the DPDP Act, upSosh processes data under:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <h3 className="font-bold mb-2">Consent</h3>
                    <p className="text-sm">Explicit opt-in for marketing</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <h3 className="font-bold mb-2">Contractual Necessity</h3>
                    <p className="text-sm">Ticketing services</p>
                  </div>
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                    <h3 className="font-bold mb-2">Legal Obligation</h3>
                    <p className="text-sm">Compliance with authorities</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                    <h3 className="font-bold mb-2">Legitimate Interest</h3>
                    <p className="text-sm">Fraud detection & safety</p>
                  </div>
                </div>
              </section>

              {/* Data Sharing */}
              <section className="glass-card" id="sharing">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">5. Data Sharing & Disclosure</h2>
                
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6 rounded-xl mb-6">
                  <p className="text-xl font-bold">We NEVER sell your personal data.</p>
                </div>

                <p className="mb-6">We share data only with:</p>

                <div className="space-y-6">
                  <div className="glass-card border-2 border-primary">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">5.1 Third-Party Service Providers</h3>
                    <ul className="grid md:grid-cols-2 gap-3">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Payment gateways</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> SMS/OTP providers</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Hosting/cloud infrastructure</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Analytics tools</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Customer support tools</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Identity verification partners</li>
                    </ul>
                    <p className="mt-4 text-sm italic">All vendors follow strict confidentiality and Indian data-protection laws.</p>
                  </div>

                  <div className="glass-card border-2 border-primary">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">5.2 Event Hosts</h3>
                    <p className="mb-3">We share MINIMUM necessary info:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Name</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Booking ID</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Number of attendees</li>
                    </ul>
                    <p className="mt-4 text-sm italic">Hosts cannot market to you unless you consent.</p>
                  </div>

                  <div className="glass-card border-2 border-red-500">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">5.3 Government & Law Enforcement</h3>
                    <p className="mb-3">We disclose data:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> If required by law</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> To prevent fraud or harm</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> During cyber incidents</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> When responding to legal summons</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Storage & Retention */}
              <section className="glass-card" id="storage">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">6. Storage & Retention</h2>
                <p className="mb-4">We store data on secure servers that use:</p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Encryption</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Firewall Protection</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Access Controls</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Backup Redundancy</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Secure Coding Practices</p>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">6.1 Data Retention</h3>
                <p className="mb-3">We retain data:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> As long as your account is active</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> As required under tax & legal obligations</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> For 180 days for logs (CERT-In mandatory rule)</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> As long as necessary for dispute resolution</li>
                </ul>
                <p className="text-sm italic">After this, data is securely deleted or anonymized.</p>
              </section>

              {/* Data Security */}
              <section className="glass-card" id="security">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">7. Data Security Measures</h2>
                <p className="mb-4">As required by the IT Act, SPDI Rules, and CERT-In:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                    <p className="font-bold mb-2">Encryption</p>
                    <p className="text-sm">Data at rest & in transit</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                    <p className="font-bold mb-2">Secure Infrastructure</p>
                    <p className="text-sm">Protected server environment</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                    <p className="font-bold mb-2">Security Audits</p>
                    <p className="text-sm">Regular vulnerability assessments</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                    <p className="font-bold mb-2">Access Restrictions</p>
                    <p className="text-sm">Limited employee access</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                    <p className="font-bold mb-2">Breach Response</p>
                    <p className="text-sm">Incident response procedures</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                    <p className="font-bold mb-2">Mandatory Reporting</p>
                    <p className="text-sm">Security incidents within 6 hours</p>
                  </div>
                </div>
              </section>

              {/* Children's Data */}
              <section className="glass-card" id="children">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">8. Children's Data (DPDP Act Compliance)</h2>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded mb-4">
                  <ul className="space-y-3">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users under 16 should not use the Platform.</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users under 18 cannot access age-restricted events.</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> We do not track, profile, or target children.</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Parental consent may be required for minors.</li>
                  </ul>
                </div>
                <p className="text-sm italic">If we discover a minor using the service without consent, we will delete their data.</p>
              </section>

              {/* User Rights */}
              <section className="glass-card" id="rights">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">9. User Rights (DPDP Act, 2023)</h2>
                <p className="mb-6">You have the legal right to:</p>
                
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Access your personal data</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Correct inaccurate or outdated data</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Delete your personal data</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Withdraw consent at any time</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">File a grievance with our Grievance Officer</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Receive communication in clear language</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold">Get information on data sharing</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <p className="font-semibold">Requests will be responded to within 15 days.</p>
                </div>
              </section>

              {/* Cross-border Transfers */}
              <section className="glass-card" id="transfers">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">10. Cross-Border Data Transfers</h2>
                <p className="mb-4">Some services (hosting/backup/analytics) may store data outside India.</p>
                <p className="mb-4">upSosh ensures:</p>
                <ul className="space-y-2">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Contractual safeguards</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Secure transfer mechanisms</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Compliance with the DPDP Act</li>
                </ul>
              </section>

              {/* Cookies */}
              <section className="glass-card" id="cookies">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">11. Cookies (For Website Users)</h2>
                <p className="mb-4">We use:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Essential cookies</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Analytics cookies</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Crash tracking cookies</li>
                </ul>
                <p className="text-sm italic">You may disable cookies, but some features may not work.</p>
              </section>

              {/* Third-party Links */}
              <section className="glass-card" id="third-party">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">12. Third-Party Links</h2>
                <p className="mb-4">upSosh is not responsible for:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Privacy policies of external websites</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Accuracy of third-party content</li>
                </ul>
                <p className="text-sm italic">You must review those policies separately.</p>
              </section>

              {/* Policy Updates */}
              <section className="glass-card" id="updates">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">13. Updates to This Policy</h2>
                <p className="mb-4">We may modify this Privacy Policy at any time.</p>
                <p className="mb-4">If changes are significant, we will notify you via:</p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> App notification</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Email</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Website notice</li>
                </ul>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="font-semibold">Continued use = acceptance.</p>
                </div>
              </section>

              {/* Grievance Officer */}
              <section className="glass-card" id="grievance">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">14. Grievance Officer (Mandatory Under DPDP Act)</h2>
                <div className="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-500 p-6 rounded-xl">
                  <p className="mb-4 font-semibold">As required by law:</p>
                  <div className="space-y-2 mb-4">
                    <p><strong>Grievance Officer:</strong> [Full Name]</p>
                    <p><strong>Email:</strong> <a href="mailto:grievance@upsosh.app" className="text-primary hover:underline">grievance@upsosh.app</a></p>
                    <p><strong>Phone:</strong> +91 96257 89901</p>
                    <p><strong>Address:</strong> [Insert Business Address]</p>
                  </div>
                  <div className="bg-white dark:bg-dark-card p-4 rounded">
                    <p className="font-bold">We aim to resolve all complaints within 15 days.</p>
                  </div>
                </div>
              </section>

              {/* Contact */}
              <section className="glass-card" id="contact">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">15. How to Contact Us</h2>
                <div className="glass-card border-2 border-primary p-6">
                  <h3 className="text-xl font-bold mb-4">upSosh Technologies</h3>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:privacy@upsosh.app" className="text-primary hover:underline">privacy@upsosh.app</a></p>
                    <p><strong>Support Phone:</strong> <a href="tel:+919625789901" className="text-primary hover:underline">+91 96257 89901</a></p>
                    <p><strong>Business Address:</strong> [Insert Business Address]</p>
                  </div>
                </div>
              </section>

            </div>
          </motion.div>
        </Container>
      </Section>
    </main>
  );
}
