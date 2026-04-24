'use client';

import { motion } from 'framer-motion';
import Section from './ui/Section';
import Container from './ui/Container';

export default function DownloadCTASection() {
  return (
    <Section className="relative overflow-hidden bg-black border-t border-white/10">
      
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-10 w-72 h-72 bg-[#D4A017]/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute bottom-10 right-10 w-96 h-96 bg-[#D4A017]/10 rounded-full blur-3xl"
          animate={{
            scale: [1.3, 1, 1.3],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            
            <motion.div
              className="inline-block mb-6 px-6 py-2 border border-white/20 rounded-full text-white"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ 
                fontFamily: 'VT323, monospace',
                fontSize: '1.25rem',
                letterSpacing: '0.05em',
                textTransform: 'uppercase'
              }}
            >
              🚀 AVAILABLE ON iOS & ANDROID
            </motion.div>

            
            <motion.h2
              className="text-5xl md:text-7xl font-bold mb-6 text-white"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              style={{ fontFamily: 'Playfair Display, Georgia, serif' }}
            >
              Ready to <span className="text-[#D4A017]">Switch Up?</span>
            </motion.h2>

            <motion.p
              className="text-xl md:text-2xl text-white/60 mb-12 max-w-2xl mx-auto font-sans"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              style={{ lineHeight: '1.7' }}
            >
              Our app is coming soon. Stay tuned for the ultimate event experience!
            </motion.p>

            
            <motion.div
              className="flex flex-col items-center justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div 
                className="inline-flex items-center justify-center px-12 py-6 bg-[#D4A017]/10 border-2 border-[#D4A017] rounded-2xl"
              >
                <span 
                  className="text-[#D4A017] text-2xl md:text-3xl"
                  style={{ 
                    fontFamily: 'VT323, monospace',
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase'
                  }}
                >
                  🚀 APP COMING SOON
                </span>
              </div>
              <p className="text-white/60 text-sm mt-4 font-sans">
                iOS & Android • Early 2026
              </p>
            </motion.div>

            
            <motion.div
              className="flex flex-wrap justify-center gap-8 mt-12 text-white/60 text-sm font-body"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.7 }}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Secure & Safe
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
                Growing Community
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-[#D4A017]" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                Premium Experience
              </div>
            </motion.div>
          </motion.div>
        </div>
      </Container>
    </Section>
  );
}
