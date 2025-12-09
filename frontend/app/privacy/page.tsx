'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <main className="pt-24">
      <Section className="bg-gradient-to-br from-light-blue to-white dark:from-dark-navy to-dark-black">
        <Container>
          <motion.div
            className="max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-5xl md:text-6xl font-bold mb-8">
              <span className="gradient-text">Privacy Policy</span>
            </h1>
            <p className="text-lg text-light-secondary dark:text-dark-slate mb-12">
              Last updated: December 3, 2025
            </p>

            <div className="space-y-8 text-light-secondary dark:text-dark-slate">
              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">1. Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, including name, email address, profile information,
                  and payment details when you create an account or book events.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">2. How We Use Your Information</h2>
                <p>
                  We use the information we collect to provide, maintain, and improve our services, process transactions,
                  send you technical notices and support messages, and communicate with you about events.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">3. Information Sharing</h2>
                <p>
                  We do not share your personal information with third parties except as described in this policy.
                  We may share information with event hosts when you book their events.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">4. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information
                  against unauthorized access, alteration, disclosure, or destruction.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">5. Your Rights</h2>
                <p>
                  You have the right to access, update, or delete your personal information. You can do this through
                  your account settings or by contacting us directly.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">6. Contact Us</h2>
                <p>
                  If you have any questions about this Privacy Policy, please contact us at privacy@upsosh.com
                </p>
              </section>
            </div>
          </motion.div>
        </Container>
      </Section>

      <Footer />
    </main>
  );
}
