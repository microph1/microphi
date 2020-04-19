export interface GoogleTagManagerOptions {
  enable?: boolean;
  trackId: string;
  commands?: {k: string, v: any}[];
  trackPageViews?: boolean;
}
