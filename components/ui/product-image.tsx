import Image from 'next/image';
import { ImageService } from '@/lib/image-service';

interface ProductImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  variant?: 'thumbnail' | 'medium' | 'large' | 'original';
}

export function ProductImage({ 
  src, 
  alt, 
  width = 500, 
  height = 500, 
  className = '',
  priority = false,
  variant = 'medium'
}: ProductImageProps) {
  // Get optimized URL based on variant
  const responsiveUrls = ImageService.getResponsiveUrls(src);
  const optimizedSrc = responsiveUrls[variant];

  return (
    <Image
      src={optimizedSrc}
      alt={alt}
      width={width}
      height={height}
      className={`object-cover ${className}`}
      priority={priority}
      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
    />
  );
}

// Usage examples:
// <ProductImage src={product.images[0]} alt={product.title} variant="thumbnail" />
// <ProductImage src={product.images[0]} alt={product.title} variant="large" priority />
