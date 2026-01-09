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
    <Section id="how-it-works" className="relative overflow-hidden bg-black">
      {/* Floating Background Elements - mustard accent */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[#D4A017]/10 blur-3xl"
          animate={{
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute top-40 right-20 w-96 h-96 rounded-full bg-[#D4A017]/10 blur-3xl"
          animate={{
            y: [0, -50, 0],
            scale: [1.2, 1, 1.2],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-80 h-80 rounded-full bg-[#D4A017]/10 blur-3xl"
          animate={{
            y: [0, 30, 0],
            x: [0, -30, 0],
            scale: [1, 1.1, 1],
            opacity: [0.1, 0.2, 0.1],
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
          <h2 className="text-5xl md:text-6xl font-bold mb-6 text-white" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
            <span className="text-[#D4A017]" style={{ fontFamily: 'var(--font-jersey)' }}>How It Works</span>
          </h2>
          <p className="text-xl text-white/60 max-w-3xl mx-auto font-body" style={{ fontFamily: 'var(--font-lora)', lineHeight: '1.7' }}>
            Getting started is as easy as 1-2-3
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-px bg-white/20" style={{ transform: 'translateY(-50%)' }} />

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
                  className="relative bg-black border border-white/20 rounded-2xl p-8 text-center group hover:border-[#D4A017]/50"
                  whileHover={{ y: -10, scale: 1.05 }}
                  transition={{ type: 'spring', stiffness: 300 }}
                >
                  {/* Number Badge */}
                  <div className="absolute -top-6 left-1/2 transform -translate-x-1/2">
                    <motion.div
                      className="w-16 h-16 rounded-full bg-[#D4A017] flex items-center justify-center text-2xl font-bold text-black"
                      whileHover={{ rotate: 360, scale: 1.2 }}
                      transition={{ duration: 0.6 }}
                    >
                      {step.number}
                    </motion.div>
                  </div>

                  {/* Icon */}
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
                    <div className="relative z-10">{step.icon}</div>
                  </motion.div>

                  {/* Content */}
                  <h3 className="text-3xl font-bold mb-4 text-white group-hover:text-[#D4A017] transition-all duration-300" style={{ fontFamily: 'var(--font-roboto-bbh)' }}>
                    {step.title}
                  </h3>
                  <p className="text-lg text-white/60 font-body" style={{ fontFamily: 'var(--font-lora)', lineHeight: '1.7' }}>
                    {step.description}
                  </p>
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
                      className="w-16 h-16 text-[#D4A017]"
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
          <p className="text-xl text-white/60 mb-6 font-body" style={{ fontFamily: 'var(--font-lora)' }}>
            Ready to start your journey?
          </p>
          <motion.button
            className="px-10 py-5 rounded-full bg-[#D4A017] text-black font-semibold text-lg hover:scale-105 transform transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{ fontFamily: 'var(--font-roboto-bbh)' }}
          >
            Get Started Now
          </motion.button>
        </motion.div>
      </Container>
    </Section>
  );
}
