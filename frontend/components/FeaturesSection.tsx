'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Section from './ui/Section';
import Container from './ui/Container';

interface Feature {
  title: string;
  description: string;
  icon: string;
  gradient: string;
}

export default function FeaturesSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });

  const features: Feature[] = [
    {
      title: 'Event Discovery',
      description: 'Find the perfect event near you with our intelligent recommendation system',
      icon: '🔍',
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Easy Ticketing',
      description: 'Seamless booking and instant ticket confirmation in seconds',
      icon: '🎫',
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'Chat with Hosts',
      description: 'Direct communication with event organizers for any questions',
      icon: '💬',
      gradient: 'from-green-500 to-teal-500',
    },
  ];

  const phoneY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  return (
    <Section id="features" className="relative overflow-hidden bg-gradient-to-br from-light-blue to-white dark:from-dark-black dark:to-dark-navy" ref={sectionRef}>
      <Container>
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">Powerful Features</span>
          </h2>
          <p className="text-xl text-light-secondary dark:text-dark-slate max-w-3xl mx-auto">
            Everything you need to discover, book, and enjoy incredible events
          </p>
        </motion.div>

        <div className="space-y-32">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className={`grid lg:grid-cols-2 gap-12 items-center ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-100px' }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              {/* Content */}
              <motion.div
                className={`${index % 2 === 1 ? 'lg:order-2' : ''}`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <motion.div
                  className={`inline-block text-7xl mb-6 p-6 rounded-3xl bg-gradient-to-br ${feature.gradient} shadow-2xl`}
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-4xl font-bold mb-4 text-light-text dark:text-dark-text">
                  {feature.title}
                </h3>
                <p className="text-xl text-light-secondary dark:text-dark-slate mb-6">
                  {feature.description}
                </p>
                <ul className="space-y-3">
                  <li className="flex items-center text-light-secondary dark:text-dark-slate">
                    <svg className="w-6 h-6 mr-3 text-light-primary dark:text-dark-neon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Lightning-fast performance
                  </li>
                  <li className="flex items-center text-light-secondary dark:text-dark-slate">
                    <svg className="w-6 h-6 mr-3 text-light-primary dark:text-dark-neon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure and reliable
                  </li>
                  <li className="flex items-center text-light-secondary dark:text-dark-slate">
                    <svg className="w-6 h-6 mr-3 text-light-primary dark:text-dark-neon" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    User-friendly interface
                  </li>
                </ul>
              </motion.div>

              {/* Phone Mockup */}
              <motion.div
                className={`relative ${index % 2 === 1 ? 'lg:order-1' : ''}`}
                style={{
                  y: phoneY,
                  rotateY: phoneRotate,
                }}
              >
                <motion.div
                  className="relative mx-auto max-w-sm"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  whileHover={{ scale: 1.05, rotateY: 5 }}
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* Phone Frame */}
                  <div className="relative bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] p-3 shadow-2xl">
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10" />

                    {/* Screen */}
                    <div className={`relative bg-gradient-to-br ${feature.gradient} rounded-[2.5rem] overflow-hidden aspect-[9/19.5]`}>
                      <div className="absolute inset-0 bg-white/10 backdrop-blur-sm flex items-center justify-center">
                        <motion.div
                          className="text-8xl"
                          animate={{
                            scale: [1, 1.2, 1],
                            rotate: [0, 360],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: 'easeInOut',
                          }}
                        >
                          {feature.icon}
                        </motion.div>
                      </div>
                    </div>
                  </div>

                  {/* Floating Elements */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-24 h-24 bg-light-primary/20 dark:bg-dark-neon/20 rounded-full blur-xl"
                    animate={{
                      scale: [1, 1.5, 1],
                      opacity: [0.3, 0.6, 0.3],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                  <motion.div
                    className="absolute -bottom-10 -left-10 w-32 h-32 bg-light-indigo/20 dark:bg-dark-purple/20 rounded-full blur-xl"
                    animate={{
                      scale: [1.5, 1, 1.5],
                      opacity: [0.6, 0.3, 0.6],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: 'easeInOut',
                    }}
                  />
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Container>
    </Section>
  );
}
