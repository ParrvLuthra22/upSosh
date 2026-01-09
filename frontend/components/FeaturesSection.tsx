'use client';

import { motion, useScroll, useTransform } from 'framer-motion';
import { useRef } from 'react';
import Section from './ui/Section';
import Container from './ui/Container';

interface Feature {
  title: string;
  description: string;
  icon: string;
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
    },
    {
      title: 'Easy Ticketing',
      description: 'Seamless booking and instant ticket confirmation in seconds',
      icon: '🎫',
    },
    {
      title: 'Chat with Hosts',
      description: 'Direct communication with event organizers for any questions',
      icon: '💬',
    },
  ];

  const phoneY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const phoneRotate = useTransform(scrollYProgress, [0, 1], [-10, 10]);

  return (
    <Section id="features" className="relative overflow-hidden bg-black" ref={sectionRef}>
      <Container>
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
            <span className="text-[#D4A017]" style={{ fontFamily: 'var(--font-jersey)' }}>Powerful Features</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto font-body" style={{ fontFamily: 'var(--font-lora)', lineHeight: '1.7' }}>
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
                  className="inline-block text-7xl mb-6 p-6 rounded-3xl border border-white/20"
                  whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                  transition={{ duration: 0.5 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="text-4xl font-bold mb-4 text-white" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
                  {feature.title}
                </h3>
                <p className="text-xl text-white/60 mb-6 font-body" style={{ fontFamily: 'var(--font-lora)', lineHeight: '1.7' }}>
                  {feature.description}
                </p>
                <ul className="space-y-3 font-body" style={{ fontFamily: 'var(--font-lora)' }}>
                  <li className="flex items-center text-white/60">
                    <svg className="w-6 h-6 mr-3 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Lightning-fast performance
                  </li>
                  <li className="flex items-center text-white/60">
                    <svg className="w-6 h-6 mr-3 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    Secure and reliable
                  </li>
                  <li className="flex items-center text-white/60">
                    <svg className="w-6 h-6 mr-3 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
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
                  <div className="relative bg-black border border-white/20 rounded-[3rem] p-3">
                    {/* Notch */}
                    <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-32 h-6 bg-black rounded-full z-10" />

                    {/* Screen */}
                    <div className="relative bg-black border border-white/10 rounded-[2.5rem] overflow-hidden aspect-[9/19.5]">
                      <div className="absolute inset-0 flex items-center justify-center">
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

                  {/* Floating Elements - mustard accent */}
                  <motion.div
                    className="absolute -top-10 -right-10 w-24 h-24 bg-[#D4A017]/10 rounded-full blur-xl"
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
                    className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#D4A017]/10 rounded-full blur-xl"
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
