/**
 * ARC STRIKE // TESLA OVERLOAD: Image Asset Preloader & Cache
 * Zero-latency 60 FPS sprite rendering.
 */

class AssetLoader {
  private images: Map<string, HTMLImageElement> = new Map();
  private loadedCount: number = 0;
  private totalCount: number = 0;
  private isAllLoaded: boolean = false;

  public preloadAssets(
    assetPaths: Record<string, string>,
    onComplete?: () => void
  ) {
    const entries = Object.entries(assetPaths);
    this.totalCount = entries.length;
    this.loadedCount = 0;

    entries.forEach(([key, src]) => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        this.images.set(key, img);
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
          this.isAllLoaded = true;
          onComplete?.();
        }
      };
      img.onerror = () => {
        console.warn(`Failed to load asset: ${src}`);
        this.loadedCount++;
        if (this.loadedCount >= this.totalCount) {
          this.isAllLoaded = true;
          onComplete?.();
        }
      };
    });
  }

  public getImage(key: string): HTMLImageElement | null {
    return this.images.get(key) || null;
  }

  public isReady(): boolean {
    return this.isAllLoaded;
  }
}

export const assetLoader = new AssetLoader();
