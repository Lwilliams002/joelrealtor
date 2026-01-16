import { useState } from 'react';
import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listings/ListingCard';
import { usePublicListings } from '@/hooks/useListings';
import { ArrowRight, Home, ChevronDown, Search, DollarSign, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import joelAguirreImg from '@/assets/joel-aguirre.png';
import { HomeValuationModal } from '@/components/forms/HomeValuationModal';

export default function Index() {
  const [homeValuationOpen, setHomeValuationOpen] = useState(false);
  const { data: listings, isLoading } = usePublicListings({ sortBy: 'newest' });
  const featuredListings = listings?.slice(0, 6) || [];

  const scrollToListings = () => {
    document.getElementById('featured-listings')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <PublicLayout>
      {/* Hero Section with Video Background */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Video Background */}
        <div className="absolute inset-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            poster="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=80"
          >
            <source
              src="https://player.vimeo.com/external/370331493.sd.mp4?s=e90dcaba73c19e0e36f03406b47bbd6992dd6c1c&profile_id=139&oauth2_token_id=57447761"
              type="video/mp4"
            />
          </video>
          {/* Dark Overlay */}
          <div className="absolute inset-0 hero-overlay" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl text-white mb-6 tracking-tight">
              Let's Find Home
            </h1>
            <p className="text-lg sm:text-xl text-white/80 mb-12 font-light max-w-2xl mx-auto">
              Buy and sell real estate, search neighborhoods, and get home estimates.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Button
                asChild
                size="lg"
                className="btn-outline rounded-none px-10 py-6 text-base"
              >
                <Link to="/listings">
                  <Search className="mr-2 h-5 w-5" />
                  Buy
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                className="btn-outline rounded-none px-10 py-6 text-base"
              >
                <Link to="/contact">
                  <DollarSign className="mr-2 h-5 w-5" />
                  Sell
                </Link>
              </Button>
              <Button
                size="lg"
                className="btn-outline rounded-none px-10 py-6 text-base"
                onClick={() => setHomeValuationOpen(true)}
              >
                <Home className="mr-2 h-5 w-5" />
                Home Value
              </Button>
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.5 }}
            onClick={scrollToListings}
            className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white/60 hover:text-white transition-colors"
          >
            <ChevronDown className="h-8 w-8 animate-bounce" />
          </motion.button>
        </div>
      </section>

      {/* Featured Listings */}
      <section id="featured-listings" className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              Featured Properties
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Discover our handpicked selection of exceptional homes
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[4/3]" />
                  <div className="mt-4 h-6 bg-muted w-3/4" />
                  <div className="mt-2 h-4 bg-muted w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {featuredListings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold mb-2">No listings yet</h3>
              <p className="text-muted-foreground">Check back soon for new properties.</p>
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
            <Button asChild size="lg" className="btn-primary rounded-none">
              <Link to="/listings">
                Explore All Properties
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* About Agent Section */}
      <section className="py-24 bg-secondary">
        <div className="container">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Agent Image */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7 }}
              viewport={{ once: true }}
              className="relative"
            >
              <div className="aspect-[3/4] overflow-hidden shadow-elegant">
                <img
                  src={joelAguirreImg}
                  alt="Joel Aguirre - Real Estate Agent"
                  className="w-full h-full object-cover object-top"
                />
              </div>
              {/* Decorative Element */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary -z-10" />
            </motion.div>

            {/* Agent Info */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <p className="text-sm uppercase tracking-luxury text-muted-foreground mb-4">About</p>
              <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
                Joel Aguirre
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>
                  My name is Joel Aguirre, I was born in Vail Colorado and moved here to Albuquerque, New Mexico at the young age of 10 years old. I graduated from West Mesa High School and then went on to pursue my BBA at the University of New Mexico.
                </p>
                <p>
                  In my time at UNM I realized that helping others was something that I enjoyed and came easy to me. Once I graduated from UNM, I knew that I wanted to help people in my community. That is why as one of EXP Albuquerque's Top Producers, I am proud to represent home buyers & sellers in the Albuquerque, Rio Rancho, Santa Fe and surrounding areas.
                </p>
                <p>
                  I have an in-depth knowledge of the market and the skills to help you achieve your real estate needs. My dedication to excellence and commitment to service sets me apart in the competitive real estate market. I would love the opportunity to be your trusted partner in achieving your real estate goals.
                </p>
              </div>
              <Button asChild size="lg" className="btn-primary rounded-none mt-8">
                <Link to="/contact">
                  Learn More
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-24 bg-background">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-4">
              How Can We Help?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Whether you're buying, selling, or just exploring, we're here to guide you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: Search,
                title: 'Buy a Home',
                description: 'Search our extensive collection of properties to find your perfect match.',
                link: '/listings',
                linkText: 'Start Searching',
              },
              {
                icon: DollarSign,
                title: 'Sell Your Home',
                description: 'Get expert guidance and maximum value for your property.',
                link: '/contact',
                linkText: 'Get Started',
              },
              {
                icon: Home,
                title: 'Home Valuation',
                description: "Discover what your home is worth in today's market.",
                link: null,
                linkText: 'Get Estimate',
                onClick: () => setHomeValuationOpen(true),
              },
            ].map((service, index) => (
              <motion.div
                key={service.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-card p-8 shadow-card hover-lift group"
              >
                <div className="w-14 h-14 bg-primary flex items-center justify-center mb-6 group-hover:bg-accent transition-colors duration-300">
                  <service.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{service.title}</h3>
                <p className="text-muted-foreground mb-6">{service.description}</p>
                {service.link ? (
                  <Link 
                    to={service.link}
                    className="text-sm font-medium uppercase tracking-luxury text-primary hover:text-accent transition-colors link-underline"
                  >
                    {service.linkText}
                  </Link>
                ) : (
                  <button 
                    onClick={service.onClick}
                    className="text-sm font-medium uppercase tracking-luxury text-primary hover:text-accent transition-colors link-underline"
                  >
                    {service.linkText}
                  </button>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl font-semibold mb-6">
              Ready to Find Your Dream Home?
            </h2>
            <p className="text-primary-foreground/80 mb-10 text-lg">
              Let our experienced team guide you through every step of your real estate journey.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button 
                asChild 
                size="lg"
                className="bg-white text-primary hover:bg-white/90 rounded-none px-10 py-6 text-sm font-medium uppercase tracking-luxury"
              >
                <Link to="/contact">
                  Contact Us Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button 
                asChild 
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white hover:text-primary rounded-none px-10 py-6 text-sm font-medium uppercase tracking-luxury bg-transparent"
              >
                <Link to="/listings">
                  Browse Properties
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Home Valuation Modal */}
      <HomeValuationModal open={homeValuationOpen} onOpenChange={setHomeValuationOpen} />
    </PublicLayout>
  );
}