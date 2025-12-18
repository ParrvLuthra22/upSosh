'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import { useState } from 'react';

export default function SafetyPage() {
  const [checkedItems, setCheckedItems] = useState<{ [key: string]: boolean }>({});

  const toggleCheckbox = (id: string) => {
    setCheckedItems(prev => ({ ...prev, [id]: !prev[id] }));
  };

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
              <div className="inline-block px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-full text-sm font-semibold mb-4">
                Critical Safety Guidelines
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-6">
                <span className="gradient-text">Event Safety Policy</span>
              </h1>
              <p className="text-xl text-light-secondary dark:text-dark-slate mb-6">
                Protecting Users and Hosts at All Events Including Informal Gatherings
              </p>
              <div className="flex flex-wrap gap-4 text-sm text-light-secondary dark:text-dark-slate">
                <span><strong>Last Updated:</strong> 19th December 2025</span>
                <span><strong>Effective From:</strong> 19th December 2025</span>
                <span><strong>Applies To:</strong> All Events (Formal & Informal)</span>
              </div>
            </div>

            {/* Critical Warning Banner */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl mb-12 relative overflow-hidden">
              <div className="absolute right-4 top-1/2 -translate-y-1/2 text-9xl opacity-10">!</div>
              <h3 className="text-2xl font-bold mb-4 relative z-10">CRITICAL SAFETY NOTICE</h3>
              <p className="mb-4 relative z-10">
                <strong>This Event Safety Policy applies to ALL events listed on upSosh</strong>, including Formal Events and Informal Events (house parties, private meetups, terrace events, pool events, social gatherings).
              </p>
              <p className="relative z-10">
                By hosting or attending any event through upSosh, you agree to follow this Policy. upSosh reserves the right to enforce safety rules, suspend users/hosts, or remove events that create risk.
              </p>
            </div>

            {/* Safety Categories Overview */}
            <div className="glass-card mb-12">
              <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">Safety Categories Overview</h2>
              <p className="text-light-secondary dark:text-dark-slate mb-8">
                upSosh enforces safety standards across six critical categories:
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {[
                  { title: 'House/Indoor Safety' },
                  { title: 'Terrace/Balcony Safety' },
                  { title: 'Pool Safety' },
                  { title: 'Crowd Management' },
                  { title: 'Alcohol Safety' },
                  { title: 'Emergency Protocols' },
                ].map((category, index) => (
                  <motion.div
                    key={index}
                    className="glass-card text-center p-6 hover:scale-105 transition-transform cursor-pointer"
                    whileHover={{ y: -5 }}
                  >
                    <h3 className="text-sm font-semibold text-light-text dark:text-dark-text">{category.title}</h3>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Main Content */}
            <div className="space-y-8 text-light-secondary dark:text-dark-slate">
              
              {/* Purpose */}
              <section className="glass-card" id="purpose">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">1. Purpose of This Policy</h2>
                <p className="mb-4">This Policy exists to:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 font-bold">•</span>
                    <span><strong>Protect Users and Hosts</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 font-bold">•</span>
                    <span><strong>Reduce risk at informal/private venues</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 font-bold">•</span>
                    <span><strong>Ensure adherence to safety and legal standards</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 font-bold">•</span>
                    <span><strong>Prevent injuries, conflicts, and liabilities</strong></span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-3 font-bold">•</span>
                    <span><strong>Create a safer event community</strong></span>
                  </li>
                </ul>
                
                <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded">
                  <strong className="text-blue-700 dark:text-blue-400">Important:</strong>
                  <span className="ml-2">upSosh is a technology platform — NOT an event organizer — but safety rules must still be followed.</span>
                </div>
              </section>

              {/* General Safety Guidelines */}
              <section className="glass-card" id="general-safety">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">2. General Safety Guidelines</h2>
                <p className="mb-4">All events must:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Comply with all applicable Indian laws</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Follow venue-specific rules</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Maintain safe capacity limits</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Have clear entry and exit routes</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Ensure emergency access is not blocked</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Prevent harassment, violence, or discrimination</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Have responsible alcohol service (if applicable)</li>
                </ul>
                
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <strong className="text-yellow-700 dark:text-yellow-400">Violation may result in:</strong>
                  <span className="ml-2">Event removal or account suspension.</span>
                </div>
              </section>

              {/* Informal Event Safety */}
              <section className="glass-card" id="informal-safety">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">3. Informal Event Safety Rules</h2>
                <p className="mb-4"><strong>Informal events carry higher risks due to:</strong></p>
                <ul className="space-y-2 ml-6 mb-6">
                  <li className="flex items-start"><span className="mr-3">•</span> Private/unknown venues</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Personal property</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Lack of security personnel</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Alcohol consumption</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Unregulated capacities</li>
                </ul>

                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl mb-6">
                  <h3 className="text-xl font-bold mb-2">MANDATORY COMPLIANCE REQUIRED</h3>
                  <p>The following rules are <strong>MANDATORY</strong> for all informal events. Non-compliance will result in immediate action.</p>
                </div>

                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4 mt-8">3.1 Host Responsibilities (Critical)</h3>
                <p className="mb-6"><strong>Hosts MUST comply with the following:</strong></p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {[
                    {
                      title: 'A. Property Safety',
                      items: [
                        'Stairs, balconies, terraces, rooftops must have railings',
                        'No open edges or unsafe drop-offs',
                        'Well-lit entry/exit areas',
                        'Secure swimming pools & water bodies',
                        'Remove hazardous objects',
                        'Keep floors dry & clutter-free',
                        'Follow building/society guidelines'
                      ]
                    },
                    {
                      title: 'B. Capacity Control',
                      items: [
                        'Adhere strictly to event capacity',
                        'Prevent overcrowding',
                        'Not exceed the safe physical limits of the venue'
                      ]
                    },
                    {
                      title: 'C. Alcohol Safety',
                      items: [
                        'Only persons 18+ may consume',
                        'No force/pressure on guests',
                        'No serving visibly intoxicated individuals',
                        'No illegal sale of alcohol without license'
                      ]
                    },
                    {
                      title: 'D. Identity & Entry',
                      items: [
                        'Admit only valid ticket holders',
                        'Ensure safe, respectful entry',
                        'Not allow unauthorized persons'
                      ]
                    },
                    {
                      title: 'E. Anti-Harassment & Anti-Abuse',
                      items: [
                        'Zero tolerance of harassment',
                        'Immediate action for complaints',
                        'Removal of harassers from event'
                      ]
                    },
                    {
                      title: 'F. Neighbour & Society Compliance',
                      items: [
                        'Respect quiet hours',
                        'Control noise levels',
                        'Prevent crowding in common areas',
                        'Prevent fights or disturbances',
                        'Follow security gate protocols'
                      ]
                    }
                  ].map((section, index) => (
                    <div key={index} className="glass-card border-2 border-light-border dark:border-dark-border hover:border-primary transition-colors">
                      <h4 className="text-lg font-bold text-light-text dark:text-dark-text mb-3">{section.title}</h4>
                      <ul className="space-y-2">
                        {section.items.map((item, idx) => (
                          <li key={idx} className="flex items-start text-sm">
                            <span className="text-green-500 mr-2 mt-1">•</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4 mt-8">3.2 User Responsibilities</h3>
                <p className="mb-4"><strong>Users MUST:</strong></p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Follow host instructions</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Respect the venue property</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Avoid irresponsible drinking</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Avoid harassment, threats, or violence</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Not damage or steal items</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Not bring illegal substances</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Behave responsibly on terraces/pools</li>
                  <li className="flex items-start"><span className="text-green-500 mr-3 font-bold">•</span> Not share ticket QR codes with others</li>
                </ul>
                
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <strong className="text-yellow-700 dark:text-yellow-400">Important:</strong>
                  <span className="ml-2">If a User violates rules, the Host may deny entry without refund.</span>
                </div>
              </section>

              {/* Prohibited Behaviour */}
              <section className="glass-card" id="prohibited">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">4. Prohibited Behaviour</h2>
                <p className="mb-6">The following actions are <strong>strictly NOT allowed</strong>:</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    'Illegal drugs/substances',
                    'Under-age drinking',
                    'Sexual harassment',
                    'Physical violence or threats',
                    'Unauthorized entry or tailgating',
                    'Bringing weapons',
                    'Tampering with event property',
                    'Jumping off balconies/terraces',
                    'Pushing people near edges',
                    'Excessive intoxication',
                    'Vandalism',
                    'Filming people without permission',
                    'Sharing host\'s address publicly'
                  ].map((item, index) => (
                    <div key={index} className="bg-red-50 dark:bg-red-900/20 border-2 border-red-500 rounded-lg p-4 flex items-center gap-3">
                      <span className="text-2xl text-red-500 font-bold">X</span>
                      <span className="text-sm font-semibold text-red-700 dark:text-red-400">{item}</span>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">ZERO TOLERANCE POLICY</h3>
                  <p>upSosh may <strong>permanently ban</strong> users or hosts for violations.</p>
                </div>
              </section>

              {/* Address Privacy */}
              <section className="glass-card" id="privacy">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">5. Address Privacy & Safety</h2>
                <p className="mb-4">For informal events:</p>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> The exact address is shown <strong>only to confirmed attendees</strong></li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Users MUST NOT share the address publicly</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Hosts must NOT send their address outside secure channels</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Screenshots of chat/address are strictly prohibited</li>
                </ul>
                
                <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded">
                  <strong className="text-yellow-700 dark:text-yellow-400">Immediate Suspension:</strong>
                  <span className="ml-2">Sharing venue details without permission leads to immediate suspension.</span>
                </div>
              </section>

              {/* Emergency Protocols */}
              <section className="glass-card" id="emergency">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">6. Emergency Protocols</h2>
                
                <div className="mb-6 bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded">
                  <strong className="text-green-700 dark:text-green-400">Hosts must have:</strong>
                  <span className="ml-2">A basic emergency plan ready before the event begins.</span>
                </div>
                
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Emergency Plan Requirements:</h3>
                <ul className="space-y-2 ml-6 mb-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Exit routes</strong> - clearly marked and accessible</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Fire extinguisher access</strong> - know its location</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Emergency contact numbers</strong> - kept readily available</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> <strong>Local police/ambulance numbers</strong> - programmed in phone</li>
                </ul>
                
                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Immediate Action Required if Emergency Occurs:</h3>
                <ol className="space-y-2 ml-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">1.</span> <strong>Stop the event if necessary</strong></li>
                  <li className="flex items-start"><span className="mr-3 font-bold">2.</span> <strong>Provide assistance to injured users</strong></li>
                  <li className="flex items-start"><span className="mr-3 font-bold">3.</span> <strong>Call emergency services immediately</strong></li>
                  <li className="flex items-start"><span className="mr-3 font-bold">4.</span> <strong>Inform upSosh if a serious incident occurs</strong></li>
                </ol>
              </section>

              {/* Emergency Contact Card */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-8 rounded-2xl relative">
                <h3 className="text-2xl font-bold mb-4">Emergency Quick Reference</h3>
                <p className="mb-6">Save these numbers and keep them accessible during your event:</p>
                
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {[
                    { label: 'Fire Emergency', number: '101' },
                    { label: 'Police Emergency', number: '100' },
                    { label: 'Ambulance', number: '102' },
                    { label: 'upSosh Safety Team', number: '+91 96257 89901' }
                  ].map((contact, index) => (
                    <div key={index} className="bg-white/20 backdrop-blur-sm p-4 rounded-lg">
                      <div className="text-sm opacity-90 mb-1">{contact.label}</div>
                      <div className="text-2xl font-bold">
                        <span>{contact.number}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Interactive Safety Checklist */}
              <section className="glass-card" id="checklist">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                  <h2 className="text-3xl font-bold text-light-text dark:text-dark-text">7. Pre-Event Safety Checklist</h2>
                  <button 
                    onClick={() => window.print()}
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center gap-2"
                  >
                    Print Checklist
                  </button>
                </div>
                
                <div className="space-y-6">
                  {[
                    {
                      category: 'House/Indoor Safety',
                      items: [
                        'All entry and exit routes are clear and well-lit',
                        'Floors are dry, clean, and free from obstacles',
                        'Electrical wiring is safe and covered',
                        'Fire extinguisher is accessible and functional',
                        'Sharp objects and hazardous items removed'
                      ]
                    },
                    {
                      category: 'Terrace/Balcony Safety',
                      items: [
                        'Railings are secure and at safe height (min 3.5 feet)',
                        'No gaps or openings in railings that pose fall risk',
                        'Edge zones are clearly marked or barricaded',
                        'Adequate lighting installed around perimeter',
                        'Warning signs placed near dangerous areas'
                      ]
                    },
                    {
                      category: 'Pool Safety',
                      items: [
                        'Pool depth markers clearly visible',
                        'Life-saving equipment (rings, poles) accessible',
                        'Pool area is well-lit',
                        'Non-slip surfaces around pool perimeter',
                        'Pool rules posted visibly (no diving, no running, etc.)',
                        'Designated sober person monitoring pool area'
                      ]
                    },
                    {
                      category: 'Crowd Management',
                      items: [
                        'Event capacity limit determined and will be enforced',
                        'Entry control system in place (ticket verification)',
                        'Crowd flow plan established (entry, exit, movement)',
                        'Emergency evacuation plan communicated to key helpers'
                      ]
                    },
                    {
                      category: 'Alcohol Safety',
                      items: [
                        'Age verification process established (18+ only)',
                        'Plan to monitor guest intoxication levels',
                        'Non-alcoholic beverages available',
                        'Policy to stop serving visibly intoxicated guests',
                        'If selling alcohol, proper license obtained'
                      ]
                    },
                    {
                      category: 'Emergency Preparedness',
                      items: [
                        'Emergency contact numbers saved (Fire: 101, Police: 100, Ambulance: 102)',
                        'First aid kit available and stocked',
                        'Location of nearest hospital identified',
                        'At least one person knows basic first aid/CPR',
                        'Emergency exit routes marked and communicated'
                      ]
                    }
                  ].map((group, groupIndex) => (
                    <div key={groupIndex} className="border-l-4 border-primary pl-6">
                      <h3 className="text-xl font-bold text-primary mb-4">{group.category}</h3>
                      <div className="space-y-3">
                        {group.items.map((item, itemIndex) => {
                          const checkId = `check-${groupIndex}-${itemIndex}`;
                          return (
                            <div key={itemIndex} className="flex items-start gap-3 p-2 rounded hover:bg-light-blue/30 dark:hover:bg-dark-navy/30 transition-colors">
                              <input
                                type="checkbox"
                                id={checkId}
                                checked={checkedItems[checkId] || false}
                                onChange={() => toggleCheckbox(checkId)}
                                className="mt-1 w-5 h-5 cursor-pointer accent-primary"
                              />
                              <label htmlFor={checkId} className="cursor-pointer flex-1">
                                {item}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Liability & Risk */}
              <section className="glass-card" id="liability">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">8. Liability & Risk Acknowledgment</h2>
                
                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3 mt-6">8.1 User Assumption of Risk</h3>
                <p className="mb-4">Users understand that attending events — especially informal ones — involves:</p>
                <ul className="space-y-2 ml-6 mb-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Crowd-related risks</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Alcohol-related risks</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Physical injury risks</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Property hazards</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Misconduct by other attendees</li>
                </ul>
                
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 rounded mb-6">
                  <strong className="text-yellow-700 dark:text-yellow-400">Acknowledgment:</strong>
                  <span className="ml-2">Users attend at their own discretion and risk.</span>
                </div>
                
                <h3 className="text-2xl font-bold text-light-text dark:text-dark-text mb-3">8.2 Host Liability</h3>
                <p className="mb-4"><strong>Hosts are fully responsible for:</strong></p>
                <ul className="space-y-2 ml-6 mb-6">
                  <li className="flex items-start"><span className="mr-3">•</span> Venue safety</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Guest behavior</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Property conditions</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Accidents/injuries caused by negligence</li>
                  <li className="flex items-start"><span className="mr-3">•</span> Compliance with alcohol/society/municipal laws</li>
                </ul>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-3">upSosh Liability Disclaimer</h3>
                  <p className="mb-3"><strong>upSosh is NOT liable for:</strong></p>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Injuries</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Accidents</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Property loss</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Safety hazards</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Host misconduct</li>
                  </ul>
                  <p className="mt-4 font-bold">Hosts must protect Users and their property.</p>
                </div>
              </section>

              {/* Incident Reporting */}
              <section className="glass-card" id="reporting">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">9. Incident Reporting</h2>
                <p className="mb-4"><strong>Users may report:</strong></p>
                <ul className="grid md:grid-cols-2 gap-3 mb-8">
                  {[
                    'Safety hazards',
                    'Misconduct',
                    'Harassment',
                    'Illegal substances',
                    'Overcrowding',
                    'Unsafe balconies/pools',
                    'Hidden charges',
                    'Fights or violent behavior'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-3 font-bold">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>

                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-6">Incident Reporting Flow</h3>
                <div className="grid md:grid-cols-4 gap-6 mb-6">
                  {[
                    { step: '1', title: 'Report', desc: 'Submit incident via app or email' },
                    { step: '2', title: 'Review', desc: 'Safety team reviews within 24–48 hours' },
                    { step: '3', title: 'Action', desc: 'Appropriate action taken' },
                    { step: '4', title: 'Follow-up', desc: 'Reporter receives update' }
                  ].map((item, index) => (
                    <div key={index} className="relative">
                      <div className="glass-card text-center p-6">
                        <div className="relative inline-block mb-4">
                          <div className="w-20 h-20 bg-gradient-to-br from-primary to-primary/70 rounded-full flex items-center justify-center text-4xl font-bold text-white">
                            {item.step}
                          </div>
                        </div>
                        <h4 className="font-bold text-light-text dark:text-dark-text mb-2">{item.title}</h4>
                        <p className="text-sm">{item.desc}</p>
                      </div>
                      {index < 3 && (
                        <div className="hidden md:block absolute top-1/2 -right-3 text-2xl text-light-border dark:text-dark-border">→</div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500 p-4 rounded mb-4">
                  <strong className="text-blue-700 dark:text-blue-400">Response Time:</strong>
                  <span className="ml-2">Reports are reviewed within 24–48 hours.</span>
                </div>

                <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Possible Actions by upSosh:</h3>
                <ul className="space-y-2 ml-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Suspend the Host</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Suspend Users</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Withhold payouts</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Remove the event</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Notify local authorities</li>
                </ul>
              </section>

              {/* upSosh's Role */}
              <section className="glass-card" id="role">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">10. upSosh's Role & Disclaimer</h2>
                
                <div className="bg-green-50 dark:bg-green-900/20 border-l-4 border-green-500 p-4 rounded mb-6">
                  <strong className="text-green-700 dark:text-green-400">upSosh is:</strong>
                  <span className="ml-2">A technology platform — NOT an event organizer.</span>
                </div>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                  <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">upSosh is NOT Responsible For:</h3>
                  <ul className="space-y-2">
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Venue safety</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Property conditions</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Alcohol consumption</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Crowd management</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Host or attendee behavior</li>
                    <li className="flex items-start"><span className="mr-3 font-bold">X</span> Accidents or injuries</li>
                  </ul>
                </div>
              </section>

              {/* Policy Violations */}
              <section className="glass-card" id="violations">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-4">11. Policy Violations</h2>
                <p className="mb-4"><strong>If this Policy is violated, upSosh may:</strong></p>
                <ul className="space-y-2 ml-6 mb-6">
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Remove events</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Suspend or ban Users</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Suspend or ban Hosts</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Withhold payouts</li>
                  <li className="flex items-start"><span className="mr-3 font-bold">•</span> Report incidents to authorities</li>
                </ul>
                
                <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-6 rounded-xl">
                  <h3 className="text-xl font-bold mb-2">PERMANENT TERMINATION</h3>
                  <p><strong>Repeat violations will lead to permanent termination of the Host account.</strong></p>
                </div>
              </section>

              {/* Contact & Support */}
              <section className="glass-card" id="contact">
                <h2 className="text-3xl font-bold text-light-text dark:text-dark-text mb-6">12. Contact & Support</h2>
                <p className="mb-6">For safety-related concerns, please contact:</p>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="glass-card border-2 border-primary">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">upSosh Safety Team</h3>
                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:safety@upsosh.app" className="text-primary hover:underline">safety@upsosh.app</a></p>
                    <p className="mb-2"><strong>Phone:</strong> <a href="tel:+919625789901" className="text-primary hover:underline">+91 96257 89901</a></p>
                    <p><strong>Response Time:</strong> 24-48 hours</p>
                  </div>
                  
                  <div className="glass-card border-2 border-primary">
                    <h3 className="text-xl font-bold text-light-text dark:text-dark-text mb-3">Grievance Officer (DPDP Act)</h3>
                    <p className="mb-2"><strong>Name:</strong> [To be appointed]</p>
                    <p className="mb-2"><strong>Email:</strong> <a href="mailto:grievance@upsosh.app" className="text-primary hover:underline">grievance@upsosh.app</a></p>
                    <p><strong>Response Time:</strong> 7 days</p>
                  </div>
                </div>
              </section>

              {/* Report Safety Issue CTA */}
              <div className="text-center py-12">
                <a 
                  href="mailto:safety@upsosh.app"
                  className="inline-block px-8 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white text-lg font-bold rounded-full hover:shadow-2xl transition-all hover:scale-105"
                >
                  Report a Safety Issue
                </a>
                <p className="mt-4 text-light-secondary dark:text-dark-slate">
                  See something unsafe? Let us know immediately.
                </p>
              </div>

            </div>
          </motion.div>
        </Container>
      </Section>
    </main>
  );
}
