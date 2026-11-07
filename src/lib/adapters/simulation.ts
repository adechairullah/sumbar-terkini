import type { PlatformMetrics, PlatformId } from '@/types';

export interface OrganicJitterRange {
  followerDeltaMin: number;
  followerDeltaMax: number;
  viewVariancePercent: number;
  likeToViewRatioMin: number;
  likeToViewRatioMax: number;
  commentToLikeRatioMin: number;
  commentToLikeRatioMax: number;
}

export const PLATFORM_ORGANIC_PROFILES: Record<PlatformId, OrganicJitterRange> = {
  instagram: {
    followerDeltaMin: 20,
    followerDeltaMax: 150,
    viewVariancePercent: 0.02,
    likeToViewRatioMin: 0.075,
    likeToViewRatioMax: 0.095,
    commentToLikeRatioMin: 0.07,
    commentToLikeRatioMax: 0.1,
  },
  tiktok: {
    followerDeltaMin: 50,
    followerDeltaMax: 300,
    viewVariancePercent: 0.035,
    likeToViewRatioMin: 0.085,
    likeToViewRatioMax: 0.11,
    commentToLikeRatioMin: 0.08,
    commentToLikeRatioMax: 0.13,
  },
  youtube: {
    followerDeltaMin: 10,
    followerDeltaMax: 80,
    viewVariancePercent: 0.015,
    likeToViewRatioMin: 0.08,
    likeToViewRatioMax: 0.1,
    commentToLikeRatioMin: 0.1,
    commentToLikeRatioMax: 0.14,
  },
  facebook: {
    followerDeltaMin: 15,
    followerDeltaMax: 100,
    viewVariancePercent: 0.02,
    likeToViewRatioMin: 0.045,
    likeToViewRatioMax: 0.065,
    commentToLikeRatioMin: 0.15,
    commentToLikeRatioMax: 0.22,
  },
  x: {
    followerDeltaMin: 5,
    followerDeltaMax: 40,
    viewVariancePercent: 0.025,
    likeToViewRatioMin: 0.035,
    likeToViewRatioMax: 0.055,
    commentToLikeRatioMin: 0.16,
    commentToLikeRatioMax: 0.24,
  },
};

export function simulateOrganicMetrics(
  platformId: PlatformId,
  currentMetrics: PlatformMetrics
): PlatformMetrics {
  const profile = PLATFORM_ORGANIC_PROFILES[platformId] ?? PLATFORM_ORGANIC_PROFILES.instagram;

  const followerDelta =
    Math.floor(Math.random() * (profile.followerDeltaMax - profile.followerDeltaMin + 1)) +
    profile.followerDeltaMin;
  const followers_count = Math.max(1000, currentMetrics.followers_count + followerDelta);

  const viewShiftFactor = 1 + (Math.random() * 2 - 1) * profile.viewVariancePercent;
  const avg_views = Math.max(500, Math.round(currentMetrics.avg_views * viewShiftFactor));

  const likeRatio =
    profile.likeToViewRatioMin +
    Math.random() * (profile.likeToViewRatioMax - profile.likeToViewRatioMin);
  const avg_likes = Math.max(20, Math.round(avg_views * likeRatio));

  const commentRatio =
    profile.commentToLikeRatioMin +
    Math.random() * (profile.commentToLikeRatioMax - profile.commentToLikeRatioMin);
  const avg_comments = Math.max(5, Math.round(avg_likes * commentRatio));

  const rawEr = followers_count > 0 ? ((avg_likes + avg_comments) / followers_count) * 100 : 0;
  const engagement_rate = Math.round(rawEr * 100) / 100;

  return {
    followers_count,
    engagement_rate,
    avg_views,
    avg_likes,
    avg_comments,
  };
}
