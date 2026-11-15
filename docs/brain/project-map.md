# Project map

Inspected 2026-11-15 at repository baseline `b7b1c2a70be7c9df7b560018cf86070e6a865803`.

| Area | Start here | Notes |
| --- | --- | --- |
| Product setup and scope | [Root README](../../README.md) | Player platform launch slice and working assumptions |
| Application routes | [src/app](../../src/app) | Marketing, member, admin, and API surfaces |
| Inveniam UI | [Components](../../src/components/inveniam) | Profile, outreach, opportunities, billing, and related UI |
| Product content and sample values | [Product data](../../src/lib/data/inveniam.ts) | Verify whether a value is seeded, configured, or measured before using it as a fact |
| Server behavior | [Server modules](../../src/lib/server) | Includes access, billing, email, moderation, and Inveniam domain logic |
| Data model | [Prisma schema](../../prisma/schema.prisma) | Migrations are environment-changing actions, not documentation checks |
| Launch operations | [Launch playbook](../launch-playbook.md) | Configuration and verification steps; not proof they have been completed |
| Railway configuration | [Railway setup](../railway-setup.md) | Deployment instructions; check actual environment before publishing |
| Commands | [package.json](../../package.json) | Lint/build and Prisma commands |
| Working context | [Company brain](README.md) | Public-safe reusable context and lessons |

## Separate artifacts

The public agency website at [inveniamsport.com](https://inveniamsport.com/) and earlier agency OS demos are separate artifacts. Their hosting, code, and release state should not be inferred from this repository.

Before editing a live surface, establish which source and deployment own that surface. An earlier local folder or screenshot is not enough to identify current production. Keep machine-specific paths and private editing links out of shared documentation.
