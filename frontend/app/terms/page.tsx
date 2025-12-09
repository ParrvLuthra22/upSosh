'use client';

import { motion } from 'framer-motion';
import Section from '@/components/ui/Section';
import Container from '@/components/ui/Container';
import Footer from '@/components/Footer';

export default function TermsPage() {
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
              <span className="gradient-text">Terms of Service</span>
            </h1>
            <p className="text-lg text-light-secondary dark:text-dark-slate mb-12">
              Last updated: December 3, 2025
            </p>

            <div className="space-y-8 text-light-secondary dark:text-dark-slate">
              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">1. Acceptance of Terms</h2>
                <p>
                  By accessing and using UpSosh, you accept and agree to be bound by the terms and provision of this agreement.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">2. Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials on UpSosh's app for personal,
                  non-commercial transitory viewing only.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">3. User Conduct</h2>
                <p>
                  Users must conduct themselves respectfully and in accordance with all applicable laws. Harassment,
                  spam, or any illegal activity is strictly prohibited.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">4. Event Hosting</h2>
                <p>
                  Hosts are responsible for the accuracy of their event listings and must comply with all local laws
                  and regulations when hosting events.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">5. Payment Terms</h2>
                <p>
                  All payments are processed securely. Refund policies are determined by individual event hosts and
                  clearly stated in event listings.
                </p>
              </section>

              <section className="glass-card">
                <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-4">6. Limitation of Liability</h2>
                <p>
                  UpSosh shall not be held liable for any damages arising from the use of the platform or attendance
                  at events listed on the platform.
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
