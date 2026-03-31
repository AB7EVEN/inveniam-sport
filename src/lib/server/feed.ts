import "server-only";

import { ContentStatus } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import {
  getViewerAccessSnapshot,
  type PublicContentWithState
} from "@/lib/server/access";

export async function getUserFeed(userId: string): Promise<PublicContentWithState[]> {
  const access = await getViewerAccessSnapshot(userId);
  const accessiblePersonaIds = Array.from(access.accessiblePersonaIds);

  if (!accessiblePersonaIds.length) {
    return [];
  }

  const items = await prisma.contentItem.findMany({
    where: {
      personaId: { in: accessiblePersonaIds },
      status: ContentStatus.PUBLISHED
    },
    include: {
      persona: true,
      favorites: {
        where: { userId }
      }
    },
    orderBy: {
      publishedAt: "desc"
    }
  });

  return items.map((item) => ({
    ...item,
    isUnlocked: !item.isPremium || access.unlockedContentIds.has(item.id),
    isFavorited: item.favorites.length > 0
  }));
}

export async function toggleFavorite(userId: string, contentItemId: string) {
  const existing = await prisma.contentFavorite.findUnique({
    where: {
      userId_contentItemId: {
        userId,
        contentItemId
      }
    }
  });

  if (existing) {
    await prisma.contentFavorite.delete({
      where: {
        userId_contentItemId: {
          userId,
          contentItemId
        }
      }
    });

    return false;
  }

  await prisma.contentFavorite.create({
    data: {
      userId,
      contentItemId
    }
  });

  return true;
}

export async function getFavoriteFeed(userId: string) {
  const favorites = await prisma.contentFavorite.findMany({
    where: { userId },
    include: {
      contentItem: {
        include: {
          persona: true,
          favorites: {
            where: { userId }
          }
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return favorites.map((favorite) => ({
    ...favorite.contentItem,
    isUnlocked: true,
    isFavorited: true
  }));
}

