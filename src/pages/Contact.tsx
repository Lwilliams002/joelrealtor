import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Contact() {
  return (
    <PublicLayout>
      {/* Header */}
      <section className="relative pt-32 pb-16 bg-primary">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-2xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-semibold text-primary-foreground mb-4">
              Contact Us
            </h1>
            <p className="text-primary-foreground/70 text-lg">
              Have questions about a property or need help finding your dream home? We're here to help.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-16">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-2 space-y-8"
            >
              <div>
                <h2 className="font-display text-2xl font-semibold mb-4">Get in Touch</h2>
                <p className="text-muted-foreground">
                  Reach out to us through any of these channels. We typically respond within 24 hours.
                </p>
              </div>

              <div className="space-y-4">
                {[
                  { icon: Phone, label: 'Phone', value: '(555) 123-4567' },
                  { icon: Mail, label: 'Email', value: 'info@prestige.com' },
                  { icon: MapPin, label: 'Office', value: '123 Main Street, Albuquerque, NM 87101' },
                  { icon: Clock, label: 'Hours', value: 'Mon-Fri 9AM-6PM, Sat 10AM-4PM' },
                ].map((item) => (
                  <div key={item.label} className="flex items-start gap-4 p-5 bg-secondary">
                    <div className="h-10 w-10 bg-primary flex items-center justify-center shrink-0">
                      <item.icon className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">{item.label}</p>
                      <p className="font-medium">{item.value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-3"
            >
              <Card className="border-0 shadow-elegant">
                <CardHeader>
                  <CardTitle className="font-display text-xl">Send Us a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContactForm />
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}