import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-white dark:bg-[#0a0a0a] transition-colors">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6" style={{ 
            background: 'linear-gradient(to right, #8b5cf6, #ec4899)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            About upSosh
          </h1>
          <p className="text-xl text-gray-600 dark:text-[#9ca3af]">
            Building India's most trusted social discovery platform
          </p>
        </div>

        {/* Main Story */}
        <div className="mb-16">
          <div 
            className="p-8 md:p-10 rounded-2xl mb-8 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]"
          >
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              upSosh was founded by <strong className="text-gray-900 dark:text-white">Parrv Luthra</strong> and <strong className="text-gray-900 dark:text-white">Aadit Vachher</strong> with a shared belief that real social experiences deserve better structure, safety, and visibility.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              While large platforms focus primarily on movies, concerts, and large-scale commercial events, we noticed that some of the most meaningful experiences happen in smaller, informal settings — house parties, terrace gatherings, community meetups, and creator‑led sessions. These events were happening everywhere, yet they were fragmented, unstructured, and difficult to trust.
            </p>
            <p className="text-lg leading-relaxed text-gray-700 dark:text-[#d1d5db]">
              <strong className="text-gray-900 dark:text-white">upSosh was created to change that.</strong>
            </p>
          </div>
        </div>

        {/* How It Started */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            How It Started
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]"
          >
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              Parrv comes from a business background and has been actively working on the development and application of technology-driven solutions. Through close involvement with social communities and informal events, he observed how hosts struggled with pricing, coordination, and credibility, while attendees lacked clarity, safety, and trust.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              Aadit also comes from a business background and is a natural entrepreneur with a strong understanding of people, operations, and delegation. Having worked closely with teams and communities, he recognized that informal events lacked leadership structure, accountability, and scalable systems.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              Together, we realized the core problem wasn't demand — people were already hosting and attending events. The real issue was the absence of a reliable platform that could bring structure, trust, and sustainability to both formal and informal events.
            </p>
            <p className="text-lg leading-relaxed font-bold text-gray-900 dark:text-white">
              That insight led to the creation of upSosh.
            </p>
          </div>
        </div>

        {/* What We're Building */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-gray-900 dark:text-white">
            What We're Building
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl mb-8 bg-gray-50 dark:bg-[#1a1a1a] border border-gray-200 dark:border-[#2a2a2a]"
          >
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              upSosh is a platform that allows users to seamlessly switch between formal and informal events — all in one place.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-gray-700 dark:text-[#d1d5db]">
              From workshops and curated experiences to house parties and community meetups, upSosh enables:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="mr-3 text-purple-600 dark:text-[#8b5cf6]">•</span>
                <span className="text-gray-700 dark:text-[#d1d5db]">Verified and accountable hosts</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600 dark:text-[#8b5cf6]">•</span>
                <span className="text-gray-700 dark:text-[#d1d5db]">Transparent pricing and clear refunds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600 dark:text-[#8b5cf6]">•</span>
                <span className="text-gray-700 dark:text-[#d1d5db]">Safety standards and basic compliance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-purple-600 dark:text-[#8b5cf6]">•</span>
                <span className="text-gray-700 dark:text-[#d1d5db]">Tools that help hosts run events sustainably</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#8b5cf6' }}>•</span>
                <span style={{ color: '#d1d5db' }}>Easier discovery of local, social experiences</span>
              </li>
            </ul>
            <p className="text-lg leading-relaxed" style={{ color: '#d1d5db' }}>
              We believe informal events deserve the same level of professionalism and trust as large-scale events — without losing their personal, social nature.
            </p>
          </div>
        </div>

        {/* Our Vision */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8" style={{ color: '#ffffff' }}>
            Our Vision
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.2), rgba(236, 72, 153, 0.2))',
              border: '1px solid rgba(139, 92, 246, 0.3)',
            }}
          >
            <p className="text-lg leading-relaxed mb-6" style={{ color: '#ffffff', fontWeight: 'bold' }}>
              Our long-term vision is to build India's most trusted social discovery platform — one that reflects how people actually socialize in real life.
            </p>
            <p className="text-lg leading-relaxed mb-4" style={{ color: '#d1d5db' }}>
              We aim to:
            </p>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#ec4899' }}>•</span>
                <span style={{ color: '#d1d5db' }}>Empower hosts and creators to build meaningful experiences</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#ec4899' }}>•</span>
                <span style={{ color: '#d1d5db' }}>Give users confidence to explore new social spaces</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3" style={{ color: '#ec4899' }}>•</span>
                <span style={{ color: '#d1d5db' }}>Bridge the gap between formal entertainment and informal social life</span>
              </li>
            </ul>
            <p className="text-xl leading-relaxed mt-6" style={{ color: '#ffffff', fontWeight: 'bold' }}>
              From concerts to house parties, and everything in between — upSosh is where people switch up how they experience social life.
            </p>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
            Meet the Founders
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Aadit Vachher */}
            <div className="p-8 rounded-2xl text-center bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              {/* Photo */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-purple-500 dark:border-purple-600">
                <img 
                  src="/assets/aadit-vachher.jpg" 
                  alt="Aadit Vachher - Co-Founder of upSosh"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Aadit Vachher
              </h3>
              <p className="text-lg mb-4 text-purple-600 dark:text-purple-400 font-semibold">
                Co-Founder
              </p>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                Aadit comes from a business background and is a driven entrepreneur with strong people skills. He excels at delegation, coordination, and execution, ensuring that ideas are translated into scalable systems and operations.
              </p>
            </div>

            {/* Parrv Luthra */}
            <div className="p-8 rounded-2xl text-center bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-800 hover:shadow-xl transition-shadow">
              {/* Photo */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-pink-500 dark:border-pink-600">
                <img 
                  src="/assets/parrv-luthra.jpg" 
                  alt="Parrv Luthra - Co-Founder of upSosh"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
                Parrv Luthra
              </h3>
              <p className="text-lg mb-4 text-pink-600 dark:text-pink-400 font-semibold">
                Co-Founder
              </p>
              <p className="text-base leading-relaxed text-gray-600 dark:text-gray-400">
                Parrv comes from a business background and focuses on strategy, product direction, and the development of technology-led solutions. He brings a deep understanding of how communities interact and how digital platforms can improve real‑world experiences.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
