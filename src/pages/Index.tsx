import { Link } from 'react-router-dom';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { Button } from '@/components/ui/button';
import { ListingCard } from '@/components/listings/ListingCard';
import { usePublicListings } from '@/hooks/useListings';
import { ArrowRight, Home, Shield, Star, TrendingUp, Sparkles, Play, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Index() {
  const { data: listings, isLoading } = usePublicListings({ sortBy: 'newest' });
  const featuredListings = listings?.slice(0, 6) || [];

  return (
    <PublicLayout>
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-20">
        {/* Background Decorations */}
        <div className="absolute inset-0 bg-gradient-mesh" />
        <div className="blob blob-1 -top-20 -right-20" />
        <div className="blob blob-2 -bottom-40 -left-40" />

        <div className="container relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Text Content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="text-center lg:text-left"
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-secondary rounded-full mb-6"
              >
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-secondary-foreground">Welcome to Prestige Realty</span>
              </motion.div>

              <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold leading-[1.1] mb-6">
                Find Your 
                <span className="text-gradient"> Perfect </span>
                Home Today
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto lg:mx-0">
                Discover exceptional properties with our curated collection. We make finding your dream home a delightful journey.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button 
                  asChild 
                  size="lg" 
                  className="bg-gradient-primary text-white rounded-full px-8 h-14 text-base shadow-glow hover:shadow-lg hover:scale-105 transition-all duration-300"
                >
                  <Link to="/listings">
                    Explore Properties
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button 
                  asChild 
                  size="lg" 
                  variant="outline" 
                  className="rounded-full px-8 h-14 text-base border-2 hover:bg-secondary transition-all duration-300"
                >
                  <Link to="/contact" className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Play className="h-3 w-3 text-primary fill-primary" />
                    </div>
                    Watch Video
                  </Link>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-8 mt-12 justify-center lg:justify-start">
                {[
                  { value: '500+', label: 'Properties' },
                  { value: '200+', label: 'Happy Clients' },
                  { value: '15+', label: 'Years Exp.' },
                ].map((stat, i) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + i * 0.1, duration: 0.5 }}
                    className="text-center"
                  >
                    <p className="font-display text-2xl font-bold">{stat.value}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Hero Image */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, x: 50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative hidden lg:block"
            >
              <div className="relative">
                {/* Main Image */}
                <div className="relative rounded-[2.5rem] overflow-hidden shadow-float">
                  <img 
                    src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80" 
                    alt="Luxury Home"
                    className="w-full aspect-[4/5] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                </div>

                {/* Floating Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6, duration: 0.5 }}
                  className="absolute -left-8 bottom-24 bg-white rounded-2xl p-4 shadow-float"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-xl bg-gradient-primary flex items-center justify-center">
                      <Home className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <p className="font-display font-bold">2,500+</p>
                      <p className="text-sm text-muted-foreground">Listed Properties</p>
                    </div>
                  </div>
                </motion.div>

                {/* Rating Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                  className="absolute -right-4 top-20 bg-white rounded-2xl p-4 shadow-float"
                >
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star key={star} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                      ))}
                    </div>
                    <span className="font-bold">4.9</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">500+ Reviews</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Featured Listings */}
      <section className="py-24 relative">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row md:items-end justify-between mb-12"
          >
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary/10 rounded-full mb-4">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">Featured Properties</span>
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                Discover Our Latest <span className="text-gradient">Listings</span>
              </h2>
              <p className="text-muted-foreground mt-3 max-w-lg">
                Hand-picked properties that match your lifestyle and aspirations.
              </p>
            </div>
            <Button 
              asChild 
              variant="ghost" 
              className="mt-4 md:mt-0 group"
            >
              <Link to="/listings" className="flex items-center gap-2">
                View All Properties
                <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-muted aspect-[4/3] rounded-3xl" />
                  <div className="mt-4 h-6 bg-muted rounded-xl w-3/4" />
                  <div className="mt-2 h-4 bg-muted rounded-lg w-1/2" />
                </div>
              ))}
            </div>
          ) : featuredListings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredListings.map((listing, index) => (
                <ListingCard key={listing.id} listing={listing} index={index} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-secondary/30 rounded-3xl">
              <Home className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-xl font-bold mb-2">No listings yet</h3>
              <p className="text-muted-foreground">Check back soon for new properties.</p>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-24 bg-gradient-soft relative overflow-hidden">
        <div className="container relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 rounded-full mb-4">
              <Star className="h-4 w-4 text-accent" />
              <span className="text-sm font-medium text-accent">Why Choose Us</span>
            </div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">
              We Make Home Buying <span className="text-gradient">Simple</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Shield,
                title: 'Trusted Experts',
                description: 'Our experienced agents guide you through every step with confidence.',
                color: 'bg-primary',
              },
              {
                icon: Star,
                title: 'Premium Service',
                description: 'Personalized, white-glove service tailored to your unique needs.',
                color: 'bg-accent',
              },
              {
                icon: TrendingUp,
                title: 'Market Insights',
                description: 'Access exclusive data to make informed investment decisions.',
                color: 'bg-secondary-foreground',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="group bg-card p-8 rounded-3xl shadow-card hover-lift text-center"
              >
                <div className={`w-16 h-16 ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-display text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="relative bg-gradient-primary rounded-[2.5rem] p-12 md:p-16 text-center overflow-hidden"
          >
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
                Ready to Find Your Dream Home?
              </h2>
              <p className="text-white/80 mb-8 max-w-lg mx-auto text-lg">
                Let us help you navigate the real estate market and discover properties you'll love.
              </p>
              <Button 
                asChild 
                size="lg" 
                className="bg-white text-primary rounded-full px-8 h-14 text-base hover:bg-white/90 hover:scale-105 transition-all duration-300"
              >
                <Link to="/contact">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </PublicLayout>
  );
}
