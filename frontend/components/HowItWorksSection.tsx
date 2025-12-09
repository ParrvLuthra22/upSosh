'use client';

import { motion } from 'framer-motion';
import Section from './ui/Section';
import Container from './ui/Container';

interface Step {
  number: string;
  title: string;
  description: string;
  icon: string;
}

export default function HowItWorksSection() {
  const steps: Step[] = [
    {
      number: '01',
      title: 'Discover',
      description: 'Browse through curated events tailored to your interests and location',
      icon: '🔍',
    },
    {
      number: '02',
      title: 'Book Tickets',
      description: 'Secure your spot with instant booking and digital ticket confirmation',
      icon: '🎫',
    },
    {
      number: '03',
      title: 'Join the Vibe',
      description: 'Show up and experience unforgettable moments with amazing people',
      icon: '✨',
    },
  ];

  return (
    <Section id="how-it-works" className="relative overflow-hidden bg-gradient-to-br from-dark-navy via-dark-black to-dark-navy dark:from-dark-black dark:via-dark-navy dark:to-dark-black">
      {/* Floating 3D Spheres Background */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gradient-to-br from-light-neon/30 to-dark-purple/30 blur-3xl"
          animate={{
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 rounded-full bg-gradient-to-br from-light-indigo/20 to-light-primary/20 blur-3xl"
          animate={{
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.7, 0.4],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-gradient-to-br from-dark-purple/30 to-light-neon/30 blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white">
            <span className="gradient-text">How It Works</span>
          </h2>
          <p className="text-xl text-dark-slate max-w-3xl mx-auto">
            Getting started is as easy as 1-2-3
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-light-primary via-light-indigo to-dark-purple opacity-20" style={{ transform: 'translateY(-50%)' }} />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
              >
                {/* Card */}
                <motion.div
                  className="relative glass-effect rounded-3xl p-8 text-center group hover:glow-effect"
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-gradient-blue-purple flex items-center justify-center text-2xl font-bold text-white shadow-2xl"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Icon with Neon Glow */}
                  <motion.div
                    className="mt-8 mb-6 text-8xl relative"
                    animate={{
                      y: [0, -10, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut',
                      delay: index * 0.3,
                    }}
                  >
                    {/* Glow Effect */}
                    <motion.div
                      className="absolute inset-0 flex items-center justify-center text-8xl opacity-50 blur-xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.6, 0.3],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    <div className="relative z-10">{step.icon}</div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-3xl font-bold mb-4 text-white group-hover:gradient-text transition-all duration-300">
                    {step.title}
                  </h3>
                  <p className="text-lg text-dark-slate">
                    {step.description}
                  </p>

                  {/* Decorative Corner Elements */}
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-light-primary/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="absolute bottom-4 left-4 w-16 h-16 bg-gradient-to-tr from-dark-purple/10 to-transparent rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.div>

                {/* Arrow Between Steps (Desktop) */}
                {index < steps.length - 1 && (
                  <motion.div
                    className="hidden lg:block absolute top-1/2 -right-8 transform -translate-y-1/2 z-20"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.5 + index * 0.2 }}
                  >
                    <svg
                      className="w-16 h-16 text-light-primary dark:text-dark-neon"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 7l5 5m0 0l-5 5m5-5H6"
                      />
                    </svg>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-20"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <p className="text-xl text-dark-slate mb-6">
            Ready to start your journey?
          </p>
          <motion.button
            className="px-10 py-5 rounded-full bg-gradient-blue-purple text-white font-semibold text-lg hover:scale-105 transform transition-all duration-300 shadow-2xl glow-effect"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </Container>
    </Section>
  );
}
