import React from 'react';

export default function AboutPage() {
  return (
    <div className="min-h-screen pt-24 pb-16 bg-black">
      <div className="max-w-5xl mx-auto px-4">
        
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-[#D4A017]" style={{ fontFamily: 'var(--font-heading)' }}>
            About upSosh
          </h1>
          <p className="text-xl text-white/60 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
            Building India's most trusted social discovery platform
          </p>
        </div>

        {/* Main Story */}
        <div className="mb-16">
          <div 
            className="p-8 md:p-10 rounded-2xl mb-8 bg-black border border-white/10"
          >
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              upSosh was founded by <strong className="text-white">Parrv Luthra</strong> and <strong className="text-white">Aadit Vachher</strong> with a shared belief that real social experiences deserve better structure, safety, and visibility.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              While large platforms focus primarily on movies, concerts, and large-scale commercial events, we noticed that some of the most meaningful experiences happen in smaller, informal settings — house parties, terrace gatherings, community meetups, and creator‑led sessions. These events were happening everywhere, yet they were fragmented, unstructured, and difficult to trust.
            </p>
            <p className="text-lg leading-relaxed text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              <strong className="text-white">upSosh was created to change that.</strong>
            </p>
          </div>
        </div>

        {/* How It Started */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            How It Started
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl bg-black border border-white/10"
          >
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              Parrv comes from a business background and has been actively working on the development and application of technology-driven solutions. Through close involvement with social communities and informal events, he observed how hosts struggled with pricing, coordination, and credibility, while attendees lacked clarity, safety, and trust.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              Aadit also comes from a business background and is a natural entrepreneur with a strong understanding of people, operations, and delegation. Having worked closely with teams and communities, he recognized that informal events lacked leadership structure, accountability, and scalable systems.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              Together, we realized the core problem wasn't demand — people were already hosting and attending events. The real issue was the absence of a reliable platform that could bring structure, trust, and sustainability to both formal and informal events.
            </p>
            <p className="text-lg leading-relaxed font-bold text-white" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              That insight led to the creation of upSosh.
            </p>
          </div>
        </div>

        {/* What We're Building */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            What We're Building
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl mb-8 bg-black border border-white/10"
          >
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              upSosh is a platform that allows users to seamlessly switch between formal and informal events — all in one place.
            </p>
            <p className="text-lg leading-relaxed mb-6 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              From workshops and curated experiences to house parties and community meetups, upSosh enables:
            </p>
            <ul className="space-y-3 mb-6 font-body" style={{ fontFamily: 'var(--font-body)' }}>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Verified and accountable hosts</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Transparent pricing and clear refunds</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Safety standards and basic compliance</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Tools that help hosts run events sustainably</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Easier discovery of local, social experiences</span>
              </li>
            </ul>
            <p className="text-lg leading-relaxed text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              We believe informal events deserve the same level of professionalism and trust as large-scale events — without losing their personal, social nature.
            </p>
          </div>
        </div>

        {/* Our Vision */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Our Vision
          </h2>
          <div 
            className="p-8 md:p-10 rounded-2xl bg-black border border-[#D4A017]/30"
          >
            <p className="text-lg leading-relaxed mb-6 text-white font-bold font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              Our long-term vision is to build India's most trusted social discovery platform — one that reflects how people actually socialize in real life.
            </p>
            <p className="text-lg leading-relaxed mb-4 text-white/70 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              We aim to:
            </p>
            <ul className="space-y-3 mb-6 font-body" style={{ fontFamily: 'var(--font-body)' }}>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Empower hosts and creators to build meaningful experiences</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Give users confidence to explore new social spaces</span>
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-[#D4A017]">•</span>
                <span className="text-white/70">Bridge the gap between formal entertainment and informal social life</span>
              </li>
            </ul>
            <p className="text-xl leading-relaxed mt-6 text-white font-bold font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
              From concerts to house parties, and everything in between — upSosh is where people switch up how they experience social life.
            </p>
          </div>
        </div>

        {/* Founders Section */}
        <div className="mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-white" style={{ fontFamily: 'var(--font-heading)' }}>
            Meet the Founders
          </h2>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Aadit Vachher */}
            <div className="p-8 rounded-2xl text-center bg-black border border-white/10 hover:border-[#D4A017]/30 transition-colors">
              {/* Photo */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#D4A017]">
                <img 
                  src="/assets/aadit-vachher.jpg" 
                  alt="Aadit Vachher - Co-Founder of upSosh"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Aadit Vachher
              </h3>
              <p className="text-lg mb-4 text-[#D4A017] font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                Co-Founder
              </p>
              <p className="text-base leading-relaxed text-white/60 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
                Aadit comes from a business background and is a driven entrepreneur with strong people skills. He excels at delegation, coordination, and execution, ensuring that ideas are translated into scalable systems and operations.
              </p>
            </div>

            {/* Parrv Luthra */}
            <div className="p-8 rounded-2xl text-center bg-black border border-white/10 hover:border-[#D4A017]/30 transition-colors">
              {/* Photo */}
              <div className="w-48 h-48 mx-auto mb-6 rounded-full overflow-hidden border-4 border-[#D4A017]">
                <img 
                  src="/assets/parrv-luthra.jpg" 
                  alt="Parrv Luthra - Co-Founder of upSosh"
                  className="w-full h-full object-cover"
                />
              </div>
              
              <h3 className="text-2xl font-bold mb-2 text-white" style={{ fontFamily: 'var(--font-heading)' }}>
                Parrv Luthra
              </h3>
              <p className="text-lg mb-4 text-[#D4A017] font-semibold" style={{ fontFamily: 'var(--font-heading)' }}>
                Co-Founder
              </p>
              <p className="text-base leading-relaxed text-white/60 font-body" style={{ fontFamily: 'var(--font-body)', lineHeight: '1.7' }}>
                Parrv comes from a business background and focuses on strategy, product direction, and the development of technology-led solutions. He brings a deep understanding of how communities interact and how digital platforms can improve real‑world experiences.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
