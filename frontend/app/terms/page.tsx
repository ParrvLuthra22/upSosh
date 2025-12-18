'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';

export default function TermsPage() {
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
              <div className="inline-block px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-full text-sm font-semibold mb-4">
                Terms & Conditions
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Terms of Service</span>
              </h1>
              <p className="text-xl text-light-secondary dark:text-dark-slate mb-6">
                Legal terms governing your use of the upSosh platform
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-light-secondary dark:text-dark-slate">
                <span><strong>Last Updated:</strong> 24th November 2025</span>
                <span><strong>Document Version:</strong> 1.0</span>
              </div>
            </div>

            {/* Introduction */}
            <div className="glass-card mb-8">
              <p className="mb-4">
                These Terms & Conditions ("Terms") govern your use of the upSosh mobile application, website, and all related services ("Platform"), owned and operated by upSosh Technologies ("Company", "we", "us", "our").
              </p>
              <p className="mb-4">
                By accessing, installing, or using upSosh, you ("User", "Attendee", "Host", "Organizer") agree to be legally bound by these Terms.
              </p>
              <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                <strong className="text-red-700 dark:text-red-400">Important:</strong>
                <span className="ml-2">If you do not agree, you must not use the Platform.</span>
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 text-light-secondary dark:text-dark-slate">
              
              {/* Definitions */}
              <section className="glass-card" id="definitions">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">1. Definitions</h2>
                <p className="mb-6">For the purpose of these Terms:</p>
                
                <div className="space-y-4">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-l-4 border-blue-500">
                    <p className="font-bold mb-2">"Platform"</p>
                    <p className="text-sm">means the upSosh app, website, and services.</p>
                  </div>
                  
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-l-4 border-green-500">
                    <p className="font-bold mb-2">"User" / "Attendee"</p>
                    <p className="text-sm">means any person who browses, registers, purchases a ticket, or attends an event via upSosh.</p>
                  </div>
                  
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border-l-4 border-purple-500">
                    <p className="font-bold mb-2">"Host" / "Organizer"</p>
                    <p className="text-sm">means any individual or entity that lists, manages, or conducts events on the Platform.</p>
                  </div>
                  
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg border-l-4 border-yellow-500">
                    <p className="font-bold mb-2">"Event"</p>
                    <p className="text-sm">means any gathering, party, performance, activity, house event, terrace event, private event, or formal event listed on the Platform.</p>
                  </div>
                  
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="font-bold mb-2">"FMC (Fixed Minimal Cost)"</p>
                    <p className="text-sm">means the minimum cost declared by the Host required to cover event expenses.</p>
                  </div>
                  
                  <div className="bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-lg border-l-4 border-indigo-500">
                    <p className="font-bold mb-2">"Data Fiduciary"</p>
                    <p className="text-sm">means upSosh as defined under the DPDP Act.</p>
                  </div>
                  
                  <div className="bg-teal-50 dark:bg-teal-900/20 p-4 rounded-lg border-l-4 border-teal-500">
                    <p className="font-bold mb-2">"Data Principal"</p>
                    <p className="text-sm">means any individual whose personal data is collected.</p>
                  </div>
                  
                  <div className="bg-pink-50 dark:bg-pink-900/20 p-4 rounded-lg border-l-4 border-pink-500">
                    <p className="font-bold mb-2">"Policy"</p>
                    <p className="text-sm mb-3">refers to any rule, guideline, or policy published by upSosh, including:</p>
                    <ul className="text-sm space-y-1 ml-4">
                      <li>• Privacy Policy</li>
                      <li>• Cookie Policy</li>
                      <li>• Refund & Cancellation Policy</li>
                      <li>• Host Agreement</li>
                      <li>• Event Safety Policy</li>
                      <li>• User Code of Conduct</li>
                      <li>• Host Code of Conduct</li>
                      <li>• Risk Waiver & Indemnity</li>
                      <li>• Listing Guidelines</li>
                      <li>• Anti-Fraud Policy</li>
                    </ul>
                  </div>
                </div>
                
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="font-semibold">All Policies are integral and binding parts of these Terms.</p>
                </div>
              </section>

              {/* Nature of Platform */}
              <section className="glass-card" id="nature">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">2. Nature of the Platform</h2>
                <p className="mb-6">upSosh is a technology intermediary that allows Hosts to publish events and Users to discover and purchase tickets.</p>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-6">
                  <h3 className="font-bold text-blue-700 dark:text-blue-400 mb-4">upSosh:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Is NOT an event organizer</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Is NOT responsible for event delivery</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Does NOT own, manage, or supervise venues</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Does NOT validate host claims or venue safety</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Does NOT guarantee event accuracy, or legality</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-6 rounded-xl">
                  <p className="text-lg font-bold mb-2">Important Notice:</p>
                  <p className="mb-2">All events are created, managed, and executed solely by Hosts.</p>
                  <p className="font-bold">Users attend events at their own risk.</p>
                </div>
              </section>

              {/* Account Creation */}
              <section className="glass-card" id="account">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">3. Account Creation & User Eligibility</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">To use upSosh:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> You must be 16 years or older.</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> You must use accurate and truthful information.</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> You must not impersonate another person.</li>
                  </ul>
                </div>

                <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                  <h3 className="font-bold text-purple-700 dark:text-purple-400 mb-4">upSosh may:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Perform identity verification</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Suspend accounts for suspicious activity</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Deny access at its discretion</li>
                  </ul>
                </div>
              </section>

              {/* Host Registration */}
              <section className="glass-card" id="host-registration">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">4. Host Registration & Obligations</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">All Hosts must:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Provide accurate event details</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Ensure venue safety</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Comply with all legal requirements</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not exceed venue capacity</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not misrepresent the event</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not charge hidden or mandatory fees</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Uphold the Host Agreement and Event Listing Guidelines</li>
                  </ul>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded">
                  <h3 className="font-bold text-red-700 dark:text-red-400 mb-4">Violation may result in:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Payout withholding</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Event removal</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Permanent suspension</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Legal action (if required)</li>
                  </ul>
                </div>
              </section>

              {/* User Responsibilities */}
              <section className="glass-card" id="user-responsibilities">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">5. User Responsibilities</h2>
                
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-4">Users must:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Provide accurate information</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Behave respectfully and safely at events</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Follow Host instructions</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not share event addresses publicly</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not engage in fraud, harassment, or misconduct</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not duplicate or misuse tickets</li>
                  </ul>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded">
                  <h3 className="font-bold text-yellow-700 dark:text-yellow-400 mb-4">Violation may lead to:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Ticket cancellation</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Platform ban</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Legal escalation</li>
                  </ul>
                </div>
              </section>

              {/* FMC Framework */}
              <section className="glass-card" id="fmc">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">6. Fixed Minimal Cost (FMC) Framework</h2>
                <p className="mb-6">FMC is the minimum cost declared by Hosts to cover event expenses.</p>
                
                <div className="space-y-6">
                  <div className="border-l-4 border-primary pl-6">
                    <h3 className="text-xl font-bold text-primary mb-4">6.1 Host Responsibilities for FMC</h3>
                    <p className="mb-3">Hosts must:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Declare FMC truthfully</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Maintain receipts for FMC above thresholds</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not inflate FMC</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not use FMC to issue illegal at-venue charges</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Not modify FMC after ticket sales begin</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-green-500 pl-6">
                    <h3 className="text-xl font-bold text-green-600 dark:text-green-400 mb-4">6.2 Refunds & FMC</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Host-cancelled events → Users get 100% full refund (FMC does not apply).</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> User-cancelled events → Refund amount depends on Host Refund Policy.</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> No retroactive FMC changes are allowed.</li>
                    </ul>
                  </div>

                  <div className="border-l-4 border-orange-500 pl-6">
                    <h3 className="text-xl font-bold text-orange-600 dark:text-orange-400 mb-4">6.3 Payouts & FMC</h3>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> upSosh is not responsible for Host FMC recovery.</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Misuse of FMC may lead to payout blocking.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Tickets & Payments */}
              <section className="glass-card" id="payments">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">7. Tickets, Payments & Fees</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">7.1 Ticket Purchase</h3>
                    <p className="mb-3">When a User purchases a ticket:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> A contract is formed between User and Host, not with upSosh.</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> upSosh only facilitates payments.</li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">7.2 Pricing & Fees</h3>
                    <p className="mb-3">Ticket prices may include:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> FMC</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Service fee</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Convenience fee</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Taxes</li>
                    </ul>
                    <p className="mt-4 text-sm italic">All fees are disclosed at checkout.</p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-6 rounded">
                    <h3 className="text-xl font-bold mb-4">7.3 At-Venue Charges</h3>
                    <p className="mb-3 font-bold">Hosts are strictly prohibited from:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Additional entry fees</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Mandatory cover charges</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Forced purchases</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Cancellations & Refunds */}
              <section className="glass-card" id="cancellations">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">8. Cancellations, Refunds & Rescheduling</h2>
                
                <p className="mb-4">Refund rules follow the Host's refund policy, except when:</p>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> The event is illegal</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> The venue is unsafe</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> The event violates platform policies</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Fraud or misconduct occurs</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Authorities intervene</li>
                </ul>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded mb-6">
                  <p className="font-semibold">upSosh may override the Host refund policy in such cases.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border-2 border-green-500">
                    <h4 className="font-bold mb-2">Host Cancels</h4>
                    <p className="text-sm">Full refund to User</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-2 border-orange-500">
                    <h4 className="font-bold mb-2">User Cancels</h4>
                    <p className="text-sm">Follow Host's stated policy</p>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border-2 border-blue-500">
                    <h4 className="font-bold mb-2">Reschedule</h4>
                    <p className="text-sm">User may accept or request refund</p>
                  </div>
                </div>
              </section>

              {/* Safety, Risk & Liability */}
              <section className="glass-card" id="liability">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">9. Safety, Risk, & Liability</h2>
                
                <div className="space-y-6">
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">9.1 User Assumption of Risk</h3>
                    <p className="mb-3">Users acknowledge that:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Events may involve inherent risks</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> House/terrace/pool events carry additional safety hazards</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Alcohol may be served</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users attend events at their sole risk.</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">9.2 Host Responsibility</h3>
                    <p className="mb-3">Hosts must ensure:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Venue safety</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Legal compliance</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Crowd control</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Alcohol restrictions</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Emergency readiness</li>
                    </ul>
                  </div>

                  <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">9.3 upSosh Liability Limit</h3>
                    <p className="mb-4">To the fullest extent permitted by Indian law:</p>
                    <p className="mb-4 font-bold">upSosh's maximum liability shall not exceed the total ticket amount paid by the User.</p>
                    <p className="mb-3 font-bold">upSosh is not liable for:</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Injuries</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Accidents</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Property loss</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Harassment</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Third-party misconduct</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Host misrepresentation</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Illegal events</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> Safety failures by Hosts</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Prohibited Actions */}
              <section className="glass-card" id="prohibited">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">10. Prohibited Actions</h2>
                <p className="mb-6">Users and Hosts must NOT:</p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Sell or duplicate tickets</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Host illegal or unsafe events</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Serve alcohol to minors</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Harass or assault anyone</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Violate privacy</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Misuse user data</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Create fraudulent listings</span>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                    <span className="text-2xl text-red-500 font-bold">X</span>
                    <span className="text-sm font-semibold">Disturb neighbors or societies</span>
                  </div>
                </div>
              </section>

              {/* Privacy & Data Protection */}
              <section className="glass-card" id="privacy">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">11. Privacy & Data Protection</h2>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl mb-6">
                  <p className="mb-4 font-bold">upSosh complies with the Digital Personal Data Protection Act (DPDP) 2023.</p>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> upSosh acts as the Data Fiduciary</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users are Data Principals</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Personal data is collected only with consent</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users have rights to correction, access, erasure</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">•</span> A Grievance Officer must respond within 7 days</li>
                  </ul>
                </div>

                <p className="text-sm italic">Full details are in the <a href="/privacy" className="text-primary hover:underline font-semibold">Privacy Policy</a>.</p>
              </section>

              {/* Intellectual Property */}
              <section className="glass-card" id="ip">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">12. Intellectual Property</h2>
                
                <p className="mb-4">All of the following are the intellectual property of upSosh Technologies:</p>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">App designs</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Logos</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">UI/UX</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Content</p>
                  </div>
                  <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg text-center">
                    <p className="font-bold">Branding</p>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500 p-4 rounded">
                  <p className="font-semibold">Users and Hosts may not copy, modify, distribute, or reverse-engineer the Platform.</p>
                </div>
              </section>

              {/* Suspension & Termination */}
              <section className="glass-card" id="suspension">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">13. Suspension & Termination</h2>
                
                <p className="mb-4">upSosh may suspend or terminate:</p>
                <div className="grid md:grid-cols-2 gap-4 mb-6">
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="font-bold">Accounts</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="font-bold">Hosts</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="font-bold">Events</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border-l-4 border-orange-500">
                    <p className="font-bold">Payouts</p>
                  </div>
                </div>

                <p className="mb-4">...for violations of any policy, fraudulent behavior, or safety concerns.</p>
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <p className="font-semibold">Payouts may be withheld during investigation.</p>
                </div>
              </section>

              {/* Indemnity */}
              <section className="glass-card" id="indemnity">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">14. Indemnity</h2>
                
                <p className="mb-4">Users and Hosts agree to indemnify and hold upSosh harmless from:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Claims</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Losses</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Damages</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Legal fees</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Injuries</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Third-party disputes</p>
                  </div>
                  <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                    <p className="font-semibold">• Regulatory penalties</p>
                  </div>
                </div>
                <p className="mt-4 text-sm italic">...arising from their actions or events.</p>
              </section>

              {/* Dispute Resolution */}
              <section className="glass-card" id="disputes">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">15. Dispute Resolution & Governing Law</h2>
                
                <div className="space-y-6">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">15.1 Governing Law</h3>
                    <p className="font-semibold">These Terms are governed by the laws of India.</p>
                  </div>

                  <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-xl">
                    <h3 className="text-xl font-bold mb-4">15.2 Arbitration</h3>
                    <p className="mb-4">All disputes shall be resolved through binding arbitration under the Arbitration and Conciliation Act, 1996.</p>
                    <ul className="space-y-2">
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Arbitration Seat:</strong> [Insert City]</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Language:</strong> English</li>
                      <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Arbitrator:</strong> Appointed mutually or by court</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Amendments */}
              <section className="glass-card" id="amendments">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">16. Amendments</h2>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-6 rounded">
                  <p className="mb-3">upSosh may modify these Terms at any time.</p>
                  <p className="mb-3">Changes will be posted on the Platform.</p>
                  <p className="font-bold">Continued use constitutes acceptance.</p>
                </div>
              </section>

              {/* Contact Information */}
              <section className="glass-card" id="contact">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">17. Contact Information</h2>
                
                <div className="bg-gradient-to-r from-primary to-primary/70 text-white p-6 rounded-xl">
                  <h3 className="text-2xl font-bold mb-4">upSosh Technologies</h3>
                  <div className="space-y-2">
                    <p><strong>Email:</strong> <a href="mailto:support@upsosh.app" className="underline hover:no-underline">support@upsosh.app</a></p>
                    <p><strong>Phone:</strong> <a href="tel:+919625789901" className="underline hover:no-underline">+91 96257 89901</a></p>
                    <p><strong>Address:</strong> [Insert Business Address]</p>
                    <p><strong>Grievance Officer:</strong> <a href="mailto:grievance@upsosh.app" className="underline hover:no-underline">grievance@upsosh.app</a></p>
                    <p><strong>Response Time:</strong> 7 days</p>
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
