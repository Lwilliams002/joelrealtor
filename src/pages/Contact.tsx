import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Card, CardContent } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import joelPhoto from '@/assets/joel-aguirre.png';

export default function Contact() {
  const contactInfo = [
    { icon: Phone, label: 'Phone', value: '(555) 123-4567', href: 'tel:+15551234567' },
    { icon: Mail, label: 'Email', value: 'joel@prestigerealestate.com', href: 'mailto:joel@prestigerealestate.com' },
    { icon: MapPin, label: 'Office', value: '123 Main Street, Albuquerque, NM 87101', href: null },
    { icon: Clock, label: 'Hours', value: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM', href: null },
  ];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-primary/90" />
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        <div className="container relative z-10 py-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <span className="inline-block text-primary-foreground/70 uppercase tracking-[0.2em] text-sm mb-4">
              Get In Touch
            </span>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-6">
              Let's Find Your Perfect Home
            </h1>
            <p className="text-primary-foreground/80 text-lg md:text-xl max-w-xl mx-auto">
              Whether you're buying, selling, or just exploring your options, I'm here to guide you every step of the way.
            </p>
          </motion.div>
        </div>

        {/* Decorative bottom curve */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(var(--background))"/>
          </svg>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 md:py-24">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            {/* Left Column - Agent Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="space-y-8"
            >
              {/* Agent Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-primary/10 to-transparent rounded-3xl" />
                <Card className="relative border-0 shadow-elegant overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col sm:flex-row">
                      <div className="sm:w-48 h-48 sm:h-auto shrink-0">
                        <img 
                          src={joelPhoto} 
                          alt="Joel Aguirre" 
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-6 flex flex-col justify-center">
                        <span className="text-xs uppercase tracking-wider text-muted-foreground mb-1">Your Agent</span>
                        <h2 className="font-display text-2xl font-semibold mb-2">Joel Aguirre</h2>
                        <p className="text-muted-foreground text-sm mb-4">
                          Licensed Realtor with 15+ years of experience helping families find their dream homes in the Albuquerque area.
                        </p>
                        <a 
                          href="tel:+15551234567" 
                          className="inline-flex items-center text-primary font-medium text-sm hover:underline"
                        >
                          Schedule a Call
                          <ArrowRight className="h-4 w-4 ml-1" />
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactInfo.map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    {item.href ? (
                      <a 
                        href={item.href}
                        className="group flex items-start gap-4 p-5 bg-secondary/50 hover:bg-secondary transition-colors rounded-xl"
                      >
                        <div className="h-11 w-11 bg-primary rounded-lg flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <item.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-medium text-sm group-hover:text-primary transition-colors">{item.value}</p>
                        </div>
                      </a>
                    ) : (
                      <div className="flex items-start gap-4 p-5 bg-secondary/50 rounded-xl">
                        <div className="h-11 w-11 bg-primary rounded-lg flex items-center justify-center shrink-0">
                          <item.icon className="h-5 w-5 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                          <p className="font-medium text-sm">{item.value}</p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>

              {/* Additional Info */}
              <div className="bg-gradient-to-br from-accent/30 to-accent/10 rounded-2xl p-6">
                <h3 className="font-display text-lg font-semibold mb-3">Why Work With Me?</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {[
                    'Deep knowledge of the Albuquerque and Rio Rancho markets',
                    'Personalized service tailored to your unique needs',
                    'Strong negotiation skills to get you the best deal',
                    'Available 7 days a week for showings and questions',
                  ].map((item, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <div className="h-1.5 w-1.5 bg-primary rounded-full mt-2 shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>

            {/* Right Column - Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="sticky top-24">
                <Card className="border-0 shadow-elegant rounded-2xl overflow-hidden">
                  <div className="bg-primary p-6">
                    <h2 className="font-display text-2xl font-semibold text-primary-foreground">
                      Send a Message
                    </h2>
                    <p className="text-primary-foreground/70 text-sm mt-1">
                      I typically respond within a few hours
                    </p>
                  </div>
                  <CardContent className="p-6 md:p-8">
                    <ContactForm />
                  </CardContent>
                </Card>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="border-t border-border">
        <div className="h-[400px] bg-muted relative overflow-hidden">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d209892.35324428893!2d-106.76267705!3d35.10673945!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x87220addd309837b%3A0xc0d3f8ceb8f9f6cd!2sAlbuquerque%2C%20NM!5e0!3m2!1sen!2sus!4v1699900000000!5m2!1sen!2sus"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Office Location"
            className="grayscale hover:grayscale-0 transition-all duration-500"
          />
          <div className="absolute bottom-6 left-6 bg-background/95 backdrop-blur-sm rounded-xl p-4 shadow-lg">
            <p className="font-display font-semibold text-sm">Prestige Real Estate</p>
            <p className="text-muted-foreground text-xs">123 Main Street, Albuquerque, NM</p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
