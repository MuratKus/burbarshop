import Link from 'next/link'
import { Header, Footer } from '@/components/ui/header'
import { Container, Section } from '@/components/ui/layout'
import { ScrollAnimation, StaggeredAnimation, Counter } from '@/components/ui/scroll-animations'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Mail, Clock, CheckCircle, Package, Truck, Award, Heart } from 'lucide-react'

export default function AboutPage() {
  return (
    <main className="public-layout">
      <Header />
      
      {/* Hero Section */}
      <Section className="bg-primary-sage text-white py-20">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center max-w-4xl mx-auto">
              <h1 className="heading-elegant text-4xl md:text-6xl font-bold mb-6">
                About Burcinbar
              </h1>
              <p className="body-elegant text-white/90 text-xl md:text-2xl leading-relaxed">
                Discover unique artistic prints that transform your space. 
                From postcards to fine art prints, we bring creativity to your walls.
              </p>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      {/* Story Section */}
      <Section className="bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimation animation="slideLeft">
              <div>
                <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-8">
                  Our Story
                </h2>
                <div className="space-y-6 body-elegant text-lg text-neutral-gray leading-relaxed">
                  <p>
                    Burcinbar started as a passion project to make art accessible to everyone. 
                    We believe that beautiful, thought-provoking art shouldn&apos;t be limited to galleries 
                    and expensive originals.
                  </p>
                  <p>
                    Our carefully curated collection features original designs, vintage-inspired 
                    prints, and contemporary artwork that speaks to diverse tastes and styles. 
                    Each piece is printed with premium quality materials to ensure your art 
                    looks stunning for years to come.
                  </p>
                  <p>
                    Whether you&apos;re decorating your first apartment, updating your office space, 
                    or looking for the perfect gift, we have something special waiting for you.
                  </p>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animation="slideRight">
              <div className="relative">
                <div className="aspect-square bg-primary-cream rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center">
                    <div className="text-8xl mb-4 animate-float">🎨</div>
                    <p className="body-elegant text-neutral-gray text-lg font-medium">Art Studio</p>
                  </div>
                </div>
                <div className="absolute -top-4 -right-4 w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center animate-pulse-soft">
                  <Heart className="w-8 h-8 text-white" />
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>

      {/* Stats Section */}
      <Section className="bg-primary-cream">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <Counter value={150} className="heading-elegant text-3xl md:text-4xl font-bold text-accent-coral mb-2" suffix="+" />
                <p className="body-elegant text-neutral-gray">Unique Designs</p>
              </div>
              <div>
                <Counter value={500} className="heading-elegant text-3xl md:text-4xl font-bold text-accent-coral mb-2" suffix="+" />
                <p className="body-elegant text-neutral-gray">Happy Customers</p>
              </div>
              <div>
                <Counter value={12} className="heading-elegant text-3xl md:text-4xl font-bold text-accent-coral mb-2" suffix="+" />
                <p className="body-elegant text-neutral-gray">Countries Shipped</p>
              </div>
              <div>
                <Counter value={99} className="heading-elegant text-3xl md:text-4xl font-bold text-accent-coral mb-2" suffix="%" />
                <p className="body-elegant text-neutral-gray">Satisfaction Rate</p>
              </div>
            </div>
          </ScrollAnimation>
        </Container>
      </Section>

      {/* Product Types */}
      <Section className="bg-white">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center mb-16">
              <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
                What We Offer
              </h2>
              <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
                Three distinct categories of artwork, each crafted with care and attention to detail
              </p>
            </div>
          </ScrollAnimation>
          
          <StaggeredAnimation staggerDelay={200}>
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="hover-lift">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl text-white">📮</span>
                  </div>
                  <h3 className="heading-elegant text-xl font-semibold mb-4">Postcards</h3>
                  <p className="body-elegant text-neutral-gray">
                    Perfect for sending to friends or collecting. Premium cardstock 
                    with beautiful designs that make every message special.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl text-white">🖼️</span>
                  </div>
                  <h3 className="heading-elegant text-xl font-semibold mb-4">Fine Prints</h3>
                  <p className="body-elegant text-neutral-gray">
                    Museum-quality prints on archival paper. Available in multiple 
                    sizes to fit any space, from intimate corners to statement walls.
                  </p>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-8 text-center">
                  <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-2xl text-white">🎭</span>
                  </div>
                  <h3 className="heading-elegant text-xl font-semibold mb-4">Riso Prints</h3>
                  <p className="body-elegant text-neutral-gray">
                    Unique risograph prints with vibrant colors and distinctive textures. 
                    Each print has character and charm that digital printing can&apos;t match.
                  </p>
                </CardContent>
              </Card>
            </div>
          </StaggeredAnimation>
        </Container>
      </Section>

      {/* Quality Promise */}
      <Section className="bg-primary-cream">
        <Container>
          <ScrollAnimation animation="fadeIn">
            <div className="text-center mb-16">
              <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
                Our Quality Promise
              </h2>
              <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
                Every aspect of our process is designed to deliver exceptional quality and service
              </p>
            </div>
          </ScrollAnimation>
          
          <StaggeredAnimation staggerDelay={150}>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent-coral rounded-full flex items-center justify-center flex-shrink-0">
                      <Award className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="heading-elegant text-lg font-semibold mb-3">Premium Materials</h3>
                      <p className="body-elegant text-neutral-gray">
                        We use only the finest papers and inks to ensure your prints look 
                        amazing and last for generations.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-sage rounded-full flex items-center justify-center flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="heading-elegant text-lg font-semibold mb-3">Careful Packaging</h3>
                      <p className="body-elegant text-neutral-gray">
                        Every order is carefully packaged to arrive in perfect condition, 
                        ready to hang or gift.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-accent-coral rounded-full flex items-center justify-center flex-shrink-0">
                      <Truck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="heading-elegant text-lg font-semibold mb-3">Fast Shipping</h3>
                      <p className="body-elegant text-neutral-gray">
                        Most orders ship within 1-2 business days, and we offer free 
                        shipping on orders over €50.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-primary-sage rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="heading-elegant text-lg font-semibold mb-3">Satisfaction Guarantee</h3>
                      <p className="body-elegant text-neutral-gray">
                        Not happy with your purchase? We offer easy returns and exchanges 
                        within 30 days.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </StaggeredAnimation>
        </Container>
      </Section>

      {/* Contact Section */}
      <Section className="bg-white">
        <Container>
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <ScrollAnimation animation="slideLeft">
              <div>
                <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-6">
                  Get in Touch
                </h2>
                <p className="body-elegant text-lg text-neutral-gray mb-8 leading-relaxed">
                  Have questions about our products? Want to suggest a new design? 
                  We&apos;d love to hear from you!
                </p>
                <div className="space-y-6">
                  <div className="flex items-center space-x-4">
                    <Mail className="w-6 h-6 text-accent-coral" />
                    <div>
                      <p className="body-elegant font-medium">Email</p>
                      <p className="body-elegant text-neutral-gray">support@burbarshop.com</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <Clock className="w-6 h-6 text-accent-coral" />
                    <div>
                      <p className="body-elegant font-medium">Business Hours</p>
                      <p className="body-elegant text-neutral-gray">Monday - Friday, 9 AM - 6 PM CET</p>
                    </div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animation="slideRight">
              <Card className="hover-lift">
                <CardContent className="p-8 text-center">
                  <div className="w-20 h-20 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-6">
                    <span className="text-3xl text-white">💌</span>
                  </div>
                  <h3 className="heading-elegant text-xl font-semibold mb-4">
                    Ready to Browse Our Collection?
                  </h3>
                  <p className="body-elegant text-neutral-gray mb-6">
                    Discover hundreds of unique prints waiting to transform your space.
                  </p>
                  <Button size="lg" asChild>
                    <Link href="/shop">
                      Shop Now
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>

      <Footer />
    </main>
  )
}