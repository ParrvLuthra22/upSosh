'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  const footerLinks = {
    product: {
      title: 'Product',
      links: [
        { name: 'Features', href: '#features' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Pricing', href: '#' },
        { name: 'Download', href: '/download' },
      ],
    },
    company: {
      title: 'Company',
      links: [
        { name: 'About', href: '/about' },
        { name: 'Careers', href: '#' },
        { name: 'Blog', href: '/blog' },
        { name: 'Press Kit', href: '#' },
      ],
    },
    support: {
      title: 'Support',
      links: [
        { name: 'Contact Us', href: '/contact' },
        { name: 'Safety', href: '/safety' },
        { name: 'Help Center', href: '#' },
      ],
    },
    legal: {
      title: 'Legal',
      links: [
        { name: 'Terms of Service', href: '/terms' },
        { name: 'Privacy Policy', href: '/privacy' },
        { name: 'Cookie Policy', href: '#' },
        { name: 'Guidelines', href: '#' },
      ],
    },
  };

  const socialLinks = [
    { name: 'Twitter', icon: 'M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z', href: '#' },
    { name: 'Instagram', icon: 'M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37zm1.5-4.87h.01', href: 'https://www.instagram.com/upsosh.app/' },
    { name: 'LinkedIn', icon: 'M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z', href: '#' },
    { name: 'Facebook', icon: 'M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z', href: '#' },
  ];

  return (
    <footer className="relative bg-white dark:bg-dark-black border-t border-light-blue/20 dark:border-dark-navy/50">
      {/* Top Section */}
      <div className="container-custom py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold gradient-text mb-4">UpSosh</h3>
              <p className="text-light-secondary dark:text-dark-slate mb-6 max-w-sm">
                Your all-in-one platform for discovering and hosting incredible experiences.
                Official + Unofficial events, all in one place.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <motion.a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full glass-effect flex items-center justify-center hover:glow-effect transition-all duration-300"
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                    </svg>
                  </motion.a>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-light-text dark:text-dark-text mb-4">
                {section.title}
              </h4>
              <ul className="space-y-3">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-light-secondary dark:text-dark-slate hover:text-light-primary dark:hover:text-dark-neon transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Newsletter */}
        <motion.div
          className="glass-effect rounded-3xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-2 text-light-text dark:text-dark-text">
              Stay in the Loop
            </h4>
            <p className="text-light-secondary dark:text-dark-slate mb-6">
              Get the latest updates on events, features, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-full glass-effect border border-light-primary/20 dark:border-dark-neon/20 focus:outline-none focus:border-light-primary dark:focus:border-dark-neon transition-colors"
              />
              <motion.button
                className="px-8 py-4 rounded-full bg-gradient-blue-indigo text-white font-semibold hover:scale-105 transform transition-all duration-300 shadow-lg"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Subscribe
              </motion.button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section */}
      <div className="border-t border-light-blue/20 dark:border-dark-navy/50">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              className="text-sm text-light-secondary dark:text-dark-slate"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              © {new Date().getFullYear()} UpSosh. All rights reserved.
            </motion.p>
            <motion.div
              className="flex items-center space-x-6 text-sm text-light-secondary dark:text-dark-slate"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <a href="/terms" className="hover:text-light-primary dark:hover:text-dark-neon transition-colors">
                Terms
              </a>
              <a href="/privacy" className="hover:text-light-primary dark:hover:text-dark-neon transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-light-primary dark:hover:text-dark-neon transition-colors">
                Cookies
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-light-primary/5 dark:bg-dark-neon/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-light-indigo/5 dark:bg-dark-purple/5 rounded-full blur-3xl -z-10" />
    </footer>
  );
}
