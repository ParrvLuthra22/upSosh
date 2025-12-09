'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import Section from './ui/Section';
import Container from './ui/Container';

interface Testimonial {
  name: string;
  role: string;
  content: string;
  avatar: string;
  rating: number;
}

export default function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  const testimonials: Testimonial[] = [
    {
      name: 'Sarah Johnson',
      role: 'Event Enthusiast',
      content: 'UpSosh has completely changed how I discover events! I\'ve met amazing people and attended incredible parties I never would have found otherwise.',
      avatar: '👩‍💼',
      rating: 5,
    },
    {
      name: 'Michael Chen',
      role: 'Tech Professional',
      content: 'The perfect blend of professional and casual events. I use it for both networking conferences and weekend hangouts. Absolutely love it!',
      avatar: '👨‍💻',
      rating: 5,
    },
    {
      name: 'Emily Rodriguez',
      role: 'College Student',
      content: 'Best app for finding fun things to do! The Superhost system gives me confidence that events are legit and well-organized.',
      avatar: '👩‍🎓',
      rating: 5,
    },
    {
      name: 'David Thompson',
      role: 'Entrepreneur',
      content: 'As a host, UpSosh has helped me grow my event business exponentially. The platform is intuitive and the community is amazing!',
      avatar: '🧑‍💼',
      rating: 5,
    },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % testimonials.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [testimonials.length]);

  return (
    <Section className="relative overflow-hidden bg-gradient-to-br from-light-blue via-white to-light-blue dark:from-dark-navy dark:via-dark-black dark:to-dark-navy">
      {/* Parallax Background Layers */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-0 left-0 w-full h-full"
          style={{ transform: 'translateZ(-100px)' }}
        >
          <motion.div
            className="absolute top-20 left-20 w-40 h-40 bg-light-primary/10 dark:bg-dark-neon/10 rounded-full blur-3xl"
            animate={{
              y: [0, 50, 0],
              x: [0, 30, 0],
            }}
            transition={{
              duration: 15,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
          <motion.div
            className="absolute bottom-20 right-20 w-60 h-60 bg-light-indigo/10 dark:bg-dark-purple/10 rounded-full blur-3xl"
            animate={{
              y: [0, -40, 0],
              x: [0, -20, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        </motion.div>
      </div>

      <Container className="relative z-10">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl md:text-6xl font-bold mb-6">
            <span className="gradient-text">What People Say</span>
          </h2>
          <p className="text-xl text-light-secondary dark:text-dark-slate max-w-3xl mx-auto">
            Join thousands of happy users experiencing the best events
          </p>
        </motion.div>

        {/* Carousel */}
        <div className="relative max-w-5xl mx-auto">
          <div className="relative overflow-hidden">
            <motion.div
              className="flex"
              animate={{ x: `-${activeIndex * 100}%` }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={index}
                  className="min-w-full px-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: index === activeIndex ? 1 : 0.3 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="glass-card p-12 relative"
                    whileHover={{ scale: 1.02 }}
                  >
                    {/* Quote Icon */}
                    <div className="absolute top-8 left-8 text-6xl text-light-primary/20 dark:text-dark-neon/20">
                      "
                    </div>

                    {/* Stars */}
                    <div className="flex justify-center mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <motion.svg
                          key={i}
                          className="w-8 h-8 text-yellow-400"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                          initial={{ opacity: 0, scale: 0 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </motion.svg>
                      ))}
                    </div>

                    {/* Content */}
                    <p className="text-xl md:text-2xl text-center text-light-text dark:text-dark-text mb-8 leading-relaxed">
                      {testimonial.content}
                    </p>

                    {/* Author */}
                    <div className="flex items-center justify-center space-x-4">
                      <motion.div
                        className="w-16 h-16 rounded-full bg-gradient-blue-indigo flex items-center justify-center text-3xl shadow-lg"
                        whileHover={{ scale: 1.1, rotate: 360 }}
                        transition={{ duration: 0.5 }}
                      >
                        {testimonial.avatar}
                      </motion.div>
                      <div className="text-left">
                        <div className="font-bold text-lg text-light-text dark:text-dark-text">
                          {testimonial.name}
                        </div>
                        <div className="text-light-secondary dark:text-dark-slate">
                          {testimonial.role}
                        </div>
                      </div>
                    </div>

                    {/* Decorative Elements */}
                    <motion.div
                      className="absolute bottom-0 right-0 w-32 h-32 bg-gradient-to-br from-light-primary/10 to-transparent dark:from-dark-neon/10 rounded-full blur-2xl"
                      animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    />
                  </motion.div>
                </motion.div>
              ))}
            </motion.div>
          </div>

          {/* Navigation Dots */}
          <div className="flex justify-center mt-8 space-x-3">
            {testimonials.map((_, index) => (
              <motion.button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === activeIndex
                    ? 'bg-gradient-blue-indigo w-12'
                    : 'bg-light-secondary/30 dark:bg-dark-slate/30'
                  }`}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              />
            ))}
          </div>

          {/* Navigation Arrows */}
          <motion.button
            onClick={() => setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
            className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-4 glass-effect p-4 rounded-full hover:glow-effect"
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          <motion.button
            onClick={() => setActiveIndex((prev) => (prev + 1) % testimonials.length)}
            className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-4 glass-effect p-4 rounded-full hover:glow-effect"
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-20 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          {[
            { value: '4.9★', label: 'App Rating' },
            { value: '50K+', label: 'Reviews' },
            { value: '100K+', label: 'Downloads' },
            { value: '98%', label: 'Satisfaction' },
          ].map((stat, index) => (
            <motion.div
              key={index}
              className="text-center"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
            >
              <div className="text-4xl md:text-5xl font-bold gradient-text mb-2">
                {stat.value}
              </div>
              <div className="text-light-secondary dark:text-dark-slate">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </Section>
  );
}
