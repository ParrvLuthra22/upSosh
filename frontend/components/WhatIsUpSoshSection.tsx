'use client';

import { motion, useAnimation } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import Section from './ui/Section';
import Container from './ui/Container';

interface EventCard {
  icon: string;
  title: string;
  description: string;
  color: string;
}

export default function WhatIsUpSoshSection() {
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);
  const sectionRef = useRef<HTMLDivElement>(null);

  const eventTypes: EventCard[] = [
    {
      icon: '🎉',
      title: 'House Parties',
      description: 'Intimate gatherings and social mixers in unique venues',
      color: 'from-blue-500 to-indigo-600',
    },
    {
      icon: '🤝',
      title: 'Meetups',
      description: 'Connect with like-minded people and build communities',
      color: 'from-indigo-500 to-purple-600',
    },
    {
      icon: '💼',
      title: 'Workshops',
      description: 'Learn new skills from industry experts and enthusiasts',
      color: 'from-purple-500 to-pink-600',
    },
    {
      icon: '🎭',
      title: 'Formal Events',
      description: 'Professional conferences, galas, and corporate gatherings',
      color: 'from-pink-500 to-red-600',
    },
  ];

  return (
    <Section id="what-is-upsosh" className="relative overflow-hidden bg-white dark:bg-dark-black">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-light-blue/30 via-transparent to-light-blue/30 dark:from-dark-navy/50 dark:via-transparent dark:to-dark-purple/20" />

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.h2
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <span className="gradient-text">What Is UpSosh?</span>
          </motion.h2>
          <motion.p
            className="text-xl text-light-secondary dark:text-dark-slate max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            Your all-in-one platform for discovering and hosting incredible experiences.
            From casual hangouts to professional events, we&apos;ve got you covered.
          </motion.p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8" ref={sectionRef}>
          {eventTypes.map((event, index) => (
            <motion.div
              key={index}
              className="relative group cursor-pointer"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              onMouseEnter={() => setHoveredCard(index)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <motion.div
                className={`relative h-full p-8 rounded-3xl glass-effect overflow-hidden ${hoveredCard === index ? 'glow-effect' : ''
                  }`}
                whileHover={{
                  y: -10,
                  rotateX: 5,
                  rotateY: 5,
                  scale: 1.05,
                }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                style={{
                  transformStyle: 'preserve-3d',
                  perspective: '1000px',
                }}
              >
                {/* Gradient Background */}
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}
                />

                {/* Icon */}
                <motion.div
                  className="text-6xl mb-6"
                  animate={{
                    scale: hoveredCard === index ? [1, 1.2, 1] : 1,
                    rotate: hoveredCard === index ? [0, 10, -10, 0] : 0,
                  }}
                  transition={{ duration: 0.5 }}
                >
                  {event.icon}
                </motion.div>

                {/* Content */}
                <h3 className="text-2xl font-bold mb-4 text-light-text dark:text-dark-text">
                  {event.title}
                </h3>
                <p className="text-light-secondary dark:text-dark-slate">
                  {event.description}
                </p>

                {/* Decorative Elements */}
                <motion.div
                  className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-light-primary/10 to-transparent dark:from-dark-neon/10 rounded-full blur-2xl"
                  animate={{
                    scale: hoveredCard === index ? 1.5 : 1,
                    opacity: hoveredCard === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />
                <motion.div
                  className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-light-indigo/10 to-transparent dark:from-dark-purple/10 rounded-full blur-2xl"
                  animate={{
                    scale: hoveredCard === index ? 1.5 : 1,
                    opacity: hoveredCard === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                />

                {/* Hover Arrow */}
                <motion.div
                  className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  initial={{ x: -10 }}
                  whileHover={{ x: 0 }}
                >
                  <svg
                    className="w-6 h-6 text-light-primary dark:text-dark-neon"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </motion.div>
              </motion.div>

              {/* 3D Shadow Effect */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${event.color} opacity-20 blur-xl -z-10 transition-all duration-300 ${hoveredCard === index ? 'scale-110' : 'scale-100'
                  }`}
                style={{ transform: 'translateZ(-50px)' }}
              />
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          className="text-center mt-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-lg text-light-secondary dark:text-dark-slate mb-6">
            Ready to discover your next experience?
          </p>
          <motion.button
            className="px-8 py-4 rounded-full bg-gradient-blue-purple text-white font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-xl glow-effect"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Explore Events
          </motion.button>
        </motion.div>
      </Container>
    </Section>
  );
}
