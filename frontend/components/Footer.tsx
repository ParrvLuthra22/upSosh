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
    <footer className="relative bg-black border-t border-white/10">
      
      <div className="container-custom py-16 md:py-20">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-3xl font-bold text-[#D4A017] mb-4" style={{ fontFamily: 'var(--font-heading)' }}>UpSosh</h3>
              <p className="text-white/60 mb-6 max-w-sm font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
                Your all-in-one platform for discovering and hosting incredible experiences.
                Official + Unofficial events, all in one place.
              </p>
              
              <div className="flex space-x-4">
                {socialLinks.map((social) => (
                  <a
                    key={social.name}
                    href={social.href}
                    className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/60 transition-all duration-300 ease-in-out hover:border-[#D4A017] hover:text-[#D4A017] hover:-translate-y-1"
                    aria-label={social.name}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={social.icon} />
                    </svg>
                  </a>
                ))}
              </div>
            </motion.div>
          </div>

          
          {Object.entries(footerLinks).map(([key, section], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <h4 className="font-semibold text-white mb-4" style={{ fontFamily: 'var(--font-heading)' }}>
                {section.title}
              </h4>
              <ul className="space-y-3 font-body" style={{ fontFamily: 'var(--font-body)' }}>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-white/60 transition-colors duration-300 ease-in-out hover:text-[#D4A017]"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        
        <motion.div
          className="bg-black border border-white/20 rounded-2xl p-8 md:p-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
        >
          <div className="max-w-2xl mx-auto text-center">
            <h4 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
              Stay in the Loop
            </h4>
            <p className="text-white/60 mb-6 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              Get the latest updates on events, features, and exclusive offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="input-minimal flex-1 px-6 py-4 rounded-full"
                style={{ fontFamily: 'var(--font-body)' }}
              />
              <button
                className="px-8 py-4 rounded-full bg-[#D4A017] text-black font-semibold transition-all duration-300 ease-in-out hover:bg-[#E5B020] hover:shadow-[0_4px_20px_rgba(212,160,23,0.25)] hover:-translate-y-0.5"
                style={{ fontFamily: 'var(--font-heading)' }}
              >
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      
      <div className="border-t border-white/10">
        <div className="container-custom py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <motion.p
              className="text-sm text-white/60 font-body"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              © {new Date().getFullYear()} UpSosh. All rights reserved.
            </motion.p>
            <motion.div
              className="flex items-center space-x-6 text-sm text-white/60 font-body"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ fontFamily: 'var(--font-body)' }}
            >
              <a href="/terms" className="hover:text-[#D4A017] transition-colors">
                Terms
              </a>
              <a href="/privacy" className="hover:text-[#D4A017] transition-colors">
                Privacy
              </a>
              <a href="#" className="hover:text-[#D4A017] transition-colors">
                Cookies
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      
      <div className="absolute top-0 left-0 w-64 h-64 bg-[#D4A017]/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#D4A017]/5 rounded-full blur-3xl -z-10" />
    </footer>
  );
}
