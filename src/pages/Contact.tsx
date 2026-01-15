import { PublicLayout } from '@/components/layout/PublicLayout';
import { ContactForm } from '@/components/forms/ContactForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Phone, Mail, MapPin } from 'lucide-react';

export default function Contact() {
  return (
    <PublicLayout>
      <section className="bg-primary text-primary-foreground py-16">
        <div className="container">
          <h1 className="font-serif text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-primary-foreground/80 text-lg">We'd love to hear from you.</p>
        </div>
      </section>

      <section className="py-12">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="font-serif text-2xl font-bold mb-6">Get in Touch</h2>
              <div className="space-y-4 mb-8">
                <div className="flex items-center gap-3"><Phone className="h-5 w-5 text-accent" /><span>(555) 123-4567</span></div>
                <div className="flex items-center gap-3"><Mail className="h-5 w-5 text-accent" /><span>hello@prestigerealty.com</span></div>
                <div className="flex items-center gap-3"><MapPin className="h-5 w-5 text-accent" /><span>123 Main Street, Suite 100</span></div>
              </div>
            </div>
            <Card className="shadow-elegant">
              <CardHeader><CardTitle>Send a Message</CardTitle></CardHeader>
              <CardContent><ContactForm /></CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
