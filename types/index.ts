export interface RoastPoint {
  emoji: string;
  title: string;
  critique: string;
}

export interface RoastResponse {
  roast: RoastPoint[];
  overallScore: number;
}

export interface RewriteResponse {
  rewrittenResume: string;
}
