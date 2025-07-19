import { NextRequest, NextResponse } from 'next/server'
import { sendOrderConfirmationEmail, sendNewsletterEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { type, email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    if (type === 'order') {
      // Test order confirmation with sample data
      const sampleOrder = {
        id: 'test-order-123456789',
        email: email,
        createdAt: new Date().toISOString(),
        subtotal: 25.99,
        shippingCost: 5.99,
        total: 31.98,
        shippingAddress: JSON.stringify({
          firstName: 'John',
          lastName: 'Smith',
          address: '123 Art Street',
          city: 'Amsterdam',
          postalCode: '1012AB',
          country: 'Netherlands',
          phone: '+31 6 12345678'
        }),
        items: [
          {
            quantity: 1,
            price: 25.99,
            product: {
              title: 'Byzantine Lady Portrait'
            },
            productVariant: {
              size: 'A4'
            }
          }
        ]
      }

      const success = await sendOrderConfirmationEmail(sampleOrder)
      
      return NextResponse.json({
        success,
        message: success ? 'Order confirmation email sent!' : 'Failed to send email',
        templateId: 'd-74e1fd2cc7d7462f8723a9ed0bc87fa8'
      })
    
    } else if (type === 'newsletter') {
      // Test newsletter with sample data
      const newsletterData = {
        newsletter_title: 'New Byzantine Collection ✨',
        newsletter_subtitle: 'Fresh artwork inspired by ancient beauty',
        main_message: 'Hello art lovers! I\'m excited to share my latest collection inspired by Byzantine art and architecture. Each piece tells a story of timeless elegance and historical beauty.',
        featured_artwork: {
          title: 'Lady of Constantinople',
          description: 'A stunning portrait capturing the grace and mystery of Byzantine nobility',
          image: 'https://example.com/featured-art.jpg',
          link: 'https://burbarshop.com/shop/lady-of-constantinople'
        },
        new_arrivals: [
          {
            title: 'Golden Mosaic Dreams',
            price: '€29.99',
            image: 'https://example.com/art1.jpg',
            link: 'https://burbarshop.com/shop/golden-mosaic'
          },
          {
            title: 'Byzantine Garden',
            price: '€24.99',
            image: 'https://example.com/art2.jpg',
            link: 'https://burbarshop.com/shop/byzantine-garden'
          }
        ],
        special_offer: {
          description: 'Get 20% off your first Byzantine collection purchase this week only!',
          code: 'BYZANTINE20',
          link: 'https://burbarshop.com/shop?collection=byzantine'
        },
        behind_scenes: 'I spent weeks researching historical Byzantine art in museums across Europe. The intricate patterns and rich colors you see in this collection are directly inspired by 6th-century mosaics I studied in Ravenna.'
      }

      const success = await sendNewsletterEmail(email, newsletterData)
      
      return NextResponse.json({
        success,
        message: success ? 'Newsletter email sent!' : 'Failed to send email',
        templateId: 'd-11506f6b042f48b7b6674a5a95d73c50'
      })
    
    } else {
      return NextResponse.json({ error: 'Invalid type. Use "order" or "newsletter"' }, { status: 400 })
    }

  } catch (error) {
    console.error('Email test error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}