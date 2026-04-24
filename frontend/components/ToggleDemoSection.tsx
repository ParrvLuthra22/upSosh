'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Section from './ui/Section';
import Container from './ui/Container';
import { gsap } from 'gsap';

type Mode = 'formal' | 'informal';

export default function ToggleDemoSection() {
  const [mode, setMode] = useState<Mode>('informal');

  useEffect(() => {
    
    gsap.to('.toggle-background', {
      backgroundColor: mode === 'formal' ? '#0B1020' : '#E7F1FF',
      duration: 0.8,
      ease: 'power2.inOut',
    });
  }, [mode]);

  const modeData = {
    informal: {
      title: 'Informal Events',
      subtitle: 'Casual, Fun & Social',
      description: 'House parties, meetups, game nights, and spontaneous gatherings',
      icon: '🎉',
      color: 'from-blue-500 to-purple-500',
      features: ['Relaxed Atmosphere', 'Meet New People', 'Flexible Timing', 'Authentic Connections'],
    },
    formal: {
      title: 'Formal Events',
      subtitle: 'Professional & Polished',
      description: 'Conferences, galas, corporate events, and networking sessions',
      icon: '🎭',
      color: 'from-purple-500 to-pink-500',
      features: ['Professional Setting', 'Industry Networking', 'Structured Agenda', 'Career Growth'],
    },
  };

  const currentMode = modeData[mode];

  return (
    <Section className="relative overflow-hidden toggle-background transition-colors duration-800">
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-light-primary/5 to-transparent dark:via-dark-neon/5" />
      
      <Container className="relative z-10">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 
            className="text-5xl md:text-6xl font-bold mb-6 text-white"
            style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
          >
            One App, <span className="text-[#D4A017]">Two Worlds</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto font-sans">
            Seamlessly switch between formal and informal events based on your mood
          </p>
        </motion.div>

        
        <motion.div
          className="flex justify-center mb-16"
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
        >
          <div className="relative flex items-center bg-black border border-white/20 rounded-full p-1">
            
            <motion.div
              className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#D4A017] rounded-full"
              animate={{
                left: mode === 'informal' ? '4px' : 'calc(50% + 2px)',
              }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            />
            <motion.button
              onClick={() => setMode('informal')}
              className={`relative z-10 px-8 py-3 rounded-full transition-colors duration-300 ${
                mode === 'informal'
                  ? 'text-black'
                  : 'text-white/70 hover:text-white'
              }`}
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: '1.35rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Informal
            </motion.button>
            <motion.button
              onClick={() => setMode('formal')}
              className={`relative z-10 px-8 py-3 rounded-full transition-colors duration-300 ${
                mode === 'formal'
                  ? 'text-black'
                  : 'text-white/70 hover:text-white'
              }`}
              style={{
                fontFamily: 'VT323, monospace',
                fontSize: '1.35rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
              whileTap={{ scale: 0.95 }}
            >
              Formal
            </motion.button>
          </div>
        </motion.div>

        
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 50, rotateX: -15 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            exit={{ opacity: 0, y: -50, rotateX: 15 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto"
          >
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div
                  className={`inline-block text-8xl mb-6 p-8 rounded-3xl bg-gradient-to-br ${currentMode.color} shadow-2xl`}
                  animate={{
                    rotate: [0, -5, 5, 0],
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  {currentMode.icon}
                </motion.div>
                <h3 className="text-4xl font-bold mb-2 text-light-text dark:text-dark-text">
                  {currentMode.title}
                </h3>
                <p className={`text-2xl font-semibold mb-4 bg-gradient-to-r ${currentMode.color} bg-clip-text text-transparent`}>
                  {currentMode.subtitle}
                </p>
                <p className="text-xl text-light-secondary dark:text-dark-slate mb-8">
                  {currentMode.description}
                </p>

                <div className="space-y-4">
                  {currentMode.features.map((feature, index) => (
                    <motion.div
                      key={feature}
                      className="flex items-center space-x-3"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    >
                      <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${currentMode.color}`} />
                      <span className="text-light-secondary dark:text-dark-slate">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="relative aspect-square">
                  
                  <motion.div
                    className={`absolute inset-0 rounded-full bg-gradient-to-br ${currentMode.color} opacity-20 blur-3xl`}
                    animate={{
                      scale: [1, 1.2, 1],
                      rotate: [0, 180, 360],
                    }}
                    transition={{
                      duration: 20,
                      repeat: Infinity,
                      ease: 'linear',
                    }}
                  />

                  
                  {[0, 1, 2, 3].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute glass-effect rounded-2xl p-6 shadow-xl"
                      style={{
                        top: `${20 + i * 15}%`,
                        left: `${10 + (i % 2) * 40}%`,
                        width: '150px',
                      }}
                      animate={{
                        y: [0, -20, 0],
                        rotate: [0, i * 5, 0],
                      }}
                      transition={{
                        duration: 3 + i,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: i * 0.2,
                      }}
                    >
                      <div className="text-3xl mb-2">{currentMode.icon}</div>
                      <div className="h-2 bg-light-primary/20 dark:bg-dark-neon/20 rounded-full mb-1" />
                      <div className="h-2 bg-light-primary/10 dark:bg-dark-neon/10 rounded-full w-3/4" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        
        <motion.div
          className="text-center mt-20 glass-effect rounded-3xl p-8 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <p className="text-lg text-light-secondary dark:text-dark-slate">
            <span className="font-semibold gradient-text">Pro Tip:</span> Toggle between modes instantly
            in the app to see what matches your vibe today!
          </p>
        </motion.div>
      </Container>
    </Section>
  );
}
