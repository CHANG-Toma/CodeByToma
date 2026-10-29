-- Remap catalog offer kinds: essentiel/serenite/premium → hosting / cleanup
DELETE FROM "CatalogOffer";

-- Recreate OfferKind enum (PostgreSQL)
ALTER TABLE "CatalogOffer" ALTER COLUMN "kind" TYPE TEXT;
DROP TYPE "OfferKind";
CREATE TYPE "OfferKind" AS ENUM ('setup', 'hosting', 'custom');
ALTER TABLE "CatalogOffer" ALTER COLUMN "kind" TYPE "OfferKind" USING ("kind"::"OfferKind");
