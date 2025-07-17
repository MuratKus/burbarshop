import { put, del } from '@vercel/blob';

export class ImageService {
  /**
   * Upload image to Vercel Blob Storage
   */
  static async uploadImage(file: File | Buffer, filename: string): Promise<string> {
    try {
      const blob = await put(filename, file, {
        access: 'public',
        addRandomSuffix: true, // Prevents filename conflicts
      });
      
      return blob.url;
    } catch (error) {
      console.error('Failed to upload image:', error);
      throw new Error('Image upload failed');
    }
  }

  /**
   * Delete image from Vercel Blob Storage
   */
  static async deleteImage(url: string): Promise<void> {
    try {
      await del(url);
    } catch (error) {
      console.error('Failed to delete image:', error);
      throw new Error('Image deletion failed');
    }
  }

  /**
   * Generate optimized image URLs for different sizes
   */
  static getOptimizedUrl(originalUrl: string, options: {
    width?: number;
    height?: number;
    quality?: number;
  } = {}): string {
    const url = new URL(originalUrl);
    
    if (options.width) url.searchParams.set('w', options.width.toString());
    if (options.height) url.searchParams.set('h', options.height.toString());
    if (options.quality) url.searchParams.set('q', options.quality.toString());
    
    return url.toString();
  }

  /**
   * Create responsive image variants
   */
  static getResponsiveUrls(originalUrl: string) {
    return {
      thumbnail: this.getOptimizedUrl(originalUrl, { width: 300, height: 300, quality: 80 }),
      medium: this.getOptimizedUrl(originalUrl, { width: 600, height: 600, quality: 85 }),
      large: this.getOptimizedUrl(originalUrl, { width: 1200, height: 1200, quality: 90 }),
      original: originalUrl
    };
  }
}
