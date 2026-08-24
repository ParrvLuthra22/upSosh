export default function ContactPage() {
    return (
        <div className="min-h-screen pt-24 pb-12">
            <section className="container mx-auto px-4 mb-16 text-center">
                <h1 className="text-5xl font-heading font-bold mb-6">Get in Touch</h1>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto">
                    Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
                </p>
            </section>

            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row gap-12 max-w-6xl mx-auto">
                    
                    <div className="lg:w-1/3 space-y-8">
                        <div className="bg-surface p-8 rounded-3xl border border-white/10">
                            <h3 className="text-xl font-bold mb-4">Contact Information</h3>
                            <div className="space-y-4 text-text-secondary">
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>support@upsosh.app</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>+91 8076524225</span>
                                </p>
                                <p className="flex items-start gap-3">
                                    <span className="text-primary text-xl"></span> 
                                    <span>B-17, GK Enclave-2<br />New Delhi 110048<br />India</span>
                                </p>
                            </div>
                        </div>

                    </div>


                    <div className="lg:w-2/3">
                        <div className="bg-surface p-8 md:p-10 rounded-3xl border border-white/10 space-y-4">
                            <h3 className="text-xl font-bold">Send us an email</h3>
                            <p className="text-text-secondary">
                                Tap the button below to open your email app with our address filled in.
                            </p>
                            <a
                                href="mailto:support@upsosh.app"
                                className="inline-block w-full text-center py-4 rounded-xl font-bold text-lg bg-primary text-white hover:opacity-90 shadow-lg shadow-primary/20 transition-all"
                            >
                                Email support@upsosh.app
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
