import "server-only";

import { MemoryClass } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

type ExtractedMemory = {
  key: string;
  value: string;
  memoryClass: MemoryClass;
  confidenceScore: number;
};

export function extractAllowedMemories(input: string): ExtractedMemory[] {
  const text = input.toLowerCase();
  const memories: ExtractedMemory[] = [];

  const colorMatch = text.match(/favorite color is ([a-z]+)/);
  if (colorMatch) {
    memories.push({
      key: "favorite_color",
      value: colorMatch[1],
      memoryClass: MemoryClass.PREFERENCE,
      confidenceScore: 0.92
    });
  }

  const hobbyMatch = text.match(/i (?:like|love) ([a-z ]+?)(?:\.|,|!|$)/);
  if (hobbyMatch) {
    memories.push({
      key: "liked_topic",
      value: hobbyMatch[1].trim(),
      memoryClass: MemoryClass.PREFERENCE,
      confidenceScore: 0.68
    });
  }

  const toneMatch = text.match(/prefer (?:a |the )?([a-z- ]+) tone/);
  if (toneMatch) {
    memories.push({
      key: "preferred_tone",
      value: toneMatch[1].trim(),
      memoryClass: MemoryClass.STYLE,
      confidenceScore: 0.82
    });
  }

  if (text.includes("gallery")) {
    memories.push({
      key: "favorite_content_category",
      value: "gallery",
      memoryClass: MemoryClass.CONTENT,
      confidenceScore: 0.6
    });
  }

  return memories;
}

export async function upsertMemories(
  userId: string,
  personaId: string,
  input: string
) {
  const extracted = extractAllowedMemories(input);

  await Promise.all(
    extracted.map((memory) =>
      prisma.userMemory.upsert({
        where: {
          userId_personaId_key: {
            userId,
            personaId,
            key: memory.key
          }
        },
        update: {
          value: memory.value,
          memoryClass: memory.memoryClass,
          confidenceScore: memory.confidenceScore
        },
        create: {
          userId,
          personaId,
          key: memory.key,
          value: memory.value,
          memoryClass: memory.memoryClass,
          confidenceScore: memory.confidenceScore
        }
      })
    )
  );
}

export async function getMemoriesForPersona(userId: string, personaId: string) {
  return prisma.userMemory.findMany({
    where: {
      userId,
      personaId
    },
    orderBy: [{ confidenceScore: "desc" }, { updatedAt: "desc" }]
  });
}

export function buildConversationSummary(
  latestUserMessage: string,
  memoryPairs: Array<{ key: string; value: string }>
) {
  const memorySummary = memoryPairs
    .slice(0, 3)
    .map((item) => `${item.key}: ${item.value}`)
    .join("; ");

  return `Recent topic: ${latestUserMessage.slice(0, 140)}${
    memorySummary ? `. Memory: ${memorySummary}` : ""
  }`;
}

