import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl font-heading font-bold text-foreground mb-8 text-center">
              Our Story
            </h1>

            <div className="prose prose-lg dark:prose-invert mx-auto">
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                [This is where you can tell your story. How SwitchUp started, the mission behind it, and where you're going next.]
              </p>

              <div className="bg-surface/50 rounded-xl p-8 border border-border/50 mb-12">
                <h2 className="text-2xl font-bold mb-4">Why we started</h2>
                <p className="text-text-secondary mb-4">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
                <p className="text-text-secondary">
                  Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 mb-12">
                <div className="bg-surface/50 rounded-xl p-6 border border-border/50">
                  <h3 className="text-xl font-bold mb-3">Our Mission</h3>
                  <p className="text-text-secondary">To revolutionize how people experience events.</p>
                </div>
                <div className="bg-surface/50 rounded-xl p-6 border border-border/50">
                  <h3 className="text-xl font-bold mb-3">Our Vision</h3>
                  <p className="text-text-secondary">A world where every event is memorable and seamless.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
