'use client'

import { Header, Footer } from '@/components/ui/header'
import { ArtistHero } from '@/components/ui/hero-section'
import { ArtworkCarousel } from '@/components/ui/artwork-carousel'
import { NewsletterSignup } from '@/components/ui/newsletter-signup'
import { ScrollAnimation, StaggeredAnimation } from '@/components/ui/scroll-animations'
import { Section, Container } from '@/components/ui/layout'

// Sample featured artwork data
const featuredArtworks = [
  {
    id: '1',
    title: 'Botanical Dreams',
    type: 'Fine Print',
    price: 35.00,
    image: '/uploads/1752460263172-yix1ot.png',
    slug: 'botanical-dreams',
    description: 'Nature-inspired artwork featuring delicate botanical illustrations',
    isNew: true,
    isFeatured: true
  },
  {
    id: '2',
    title: 'Abstract Expressions',
    type: 'Riso Print',
    price: 28.00,
    image: '/uploads/1752496904123-b57whi.png',
    slug: 'abstract-expressions',
    description: 'Bold abstract compositions in vibrant colors',
    isNew: false,
    isFeatured: true
  },
  {
    id: '3',
    title: 'Vintage Postcards',
    type: 'Postcard',
    price: 15.00,
    image: '/uploads/1752460263172-yix1ot.png',
    slug: 'vintage-postcards',
    description: 'Nostalgic postcard designs with classic charm',
    isNew: false,
    isFeatured: true
  },
  {
    id: '4',
    title: 'Urban Landscapes',
    type: 'Fine Print',
    price: 42.00,
    image: '/uploads/1752496904123-b57whi.png',
    slug: 'urban-landscapes',
    description: 'Contemporary cityscapes and architectural studies',
    isNew: true,
    isFeatured: false
  },
  {
    id: '5',
    title: 'Minimalist Geometry',
    type: 'Riso Print',
    price: 32.00,
    image: '/uploads/1752460263172-yix1ot.png',
    slug: 'minimalist-geometry',
    description: 'Clean geometric patterns with subtle color palettes',
    isNew: false,
    isFeatured: true
  },
  {
    id: '6',
    title: 'Watercolor Studies',
    type: 'Fine Print',
    price: 38.00,
    image: '/uploads/1752496904123-b57whi.png',
    slug: 'watercolor-studies',
    description: 'Soft watercolor paintings capturing light and movement',
    isNew: false,
    isFeatured: false
  }
]

export default function Home() {
  return (
    <main className="public-layout">
      <Header />
      
      {/* Hero Section */}
      <ArtistHero
        artistName="Burcinbar"
        tagline="Contemporary Artist"
        description="Creating unique prints and postcards that bring beauty and creativity to your space. Each piece tells a story of artistic expression and craftsmanship."
      />

      {/* Featured Artwork Carousel */}
      <ScrollAnimation animation="fadeIn">
        <ArtworkCarousel
          artworks={featuredArtworks}
          title="Featured Artwork"
          subtitle="Discover our latest collection of handcrafted prints and postcards"
          autoPlay={true}
          autoPlayInterval={6000}
          itemsPerView={3}
        />
      </ScrollAnimation>

      {/* About Section */}
      <Section className="bg-white">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <ScrollAnimation animation="slideLeft">
              <div className="space-y-6">
                <h2 className="heading-elegant text-3xl md:text-4xl font-bold">
                  Handcrafted with Love
                </h2>
                <p className="body-elegant text-lg text-neutral-gray leading-relaxed">
                  Every piece in our collection is carefully created using traditional techniques 
                  combined with contemporary aesthetics. From botanical studies to abstract 
                  compositions, each artwork tells a unique story.
                </p>
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-accent-coral mb-2">150+</div>
                    <div className="text-sm text-neutral-gray">Unique Designs</div>
                  </div>
                  <div className="text-center p-4">
                    <div className="text-2xl font-bold text-accent-coral mb-2">500+</div>
                    <div className="text-sm text-neutral-gray">Happy Customers</div>
                  </div>
                </div>
              </div>
            </ScrollAnimation>
            
            <ScrollAnimation animation="slideRight">
              <div className="relative">
                <div className="aspect-square bg-primary-sage rounded-2xl flex items-center justify-center overflow-hidden">
                  <div className="text-center text-white">
                    <div className="text-8xl mb-4">🎨</div>
                    <p className="text-xl font-medium">Artist at Work</p>
                  </div>
                </div>
                <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-accent-coral rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl">✨</span>
                </div>
              </div>
            </ScrollAnimation>
          </div>
        </Container>
      </Section>

      {/* Process Section */}
      <Section className="bg-primary-cream">
        <Container>
          <div className="text-center mb-12">
            <ScrollAnimation animation="fadeIn">
              <h2 className="heading-elegant text-3xl md:text-4xl font-bold mb-4">
                Our Creative Process
              </h2>
              <p className="body-elegant text-lg text-neutral-gray max-w-2xl mx-auto">
                From initial concept to finished piece, every step is carefully crafted
              </p>
            </ScrollAnimation>
          </div>
          
          <StaggeredAnimation staggerDelay={200}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">💭</span>
                </div>
                <h3 className="heading-elegant text-xl font-semibold mb-2">Concept</h3>
                <p className="body-elegant text-neutral-gray">
                  Every piece begins with inspiration drawn from nature, emotions, and experiences
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-accent-coral rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">🎨</span>
                </div>
                <h3 className="heading-elegant text-xl font-semibold mb-2">Creation</h3>
                <p className="body-elegant text-neutral-gray">
                  Using traditional techniques and quality materials to bring the vision to life
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-sage rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl text-white">📦</span>
                </div>
                <h3 className="heading-elegant text-xl font-semibold mb-2">Delivery</h3>
                <p className="body-elegant text-neutral-gray">
                  Carefully packaged and delivered to bring joy to your space
                </p>
              </div>
            </div>
          </StaggeredAnimation>
        </Container>
      </Section>

      {/* Newsletter Signup */}
      <ScrollAnimation animation="fadeIn">
        <NewsletterSignup
          title="Stay Connected"
          subtitle="Join our creative community"
          description="Get exclusive access to new artwork, behind-the-scenes content, and special offers delivered to your inbox."
          benefits={[
            "Early access to new collections",
            "Exclusive subscriber discounts",
            "Artist insights and stories",
            "Monthly creative inspiration"
          ]}
        />
      </ScrollAnimation>

      <Footer />
    </main>
  )
}