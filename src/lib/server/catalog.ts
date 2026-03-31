import "server-only";

import { contentCatalog, offerCatalog, personaCatalog, planCatalog } from "@/lib/data/catalog";
import { prisma } from "@/lib/prisma";

export function getPersonaCatalog() {
  return personaCatalog;
}

export function getPersonaCatalogBySlug(slug: string) {
  return personaCatalog.find((persona) => persona.slug === slug) ?? null;
}

export function getPlanCatalog() {
  return planCatalog;
}

export function getPlansForPersona(slug: string) {
  return planCatalog.filter((plan) => plan.isBundle || plan.personaSlug === slug);
}

export function getContentCatalogForPersona(slug: string) {
  return contentCatalog.filter((item) => item.personaSlug === slug);
}

export function getOfferCatalogForPersona(slug: string) {
  return offerCatalog.filter((offer) => offer.personaSlug === slug && offer.isActive);
}

export async function getActivePersonasFromDb() {
  return prisma.persona.findMany({
    where: { isActive: true },
    orderBy: { displayName: "asc" }
  });
}

