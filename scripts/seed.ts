// scripts/seed.ts
// One-time bootstrap. Run against the project (or emulator) to:
//   1. Create the first Super Admin user record (which triggers onUserWrite to set claims)
//   2. Seed the physical spaces into pricingConfig
//
// Usage (emulator): set FIRESTORE_EMULATOR_HOST then `npx tsx scripts/seed.ts <uid> <email>`
// The <uid> must already exist in Firebase Auth (create via console or emulator first).

import * as admin from "firebase-admin";

if (!admin.apps.length) admin.initializeApp();
const db = admin.firestore();

const SPACES = [
  { id: "main-floor", name: "Main Floor", capacity: 120 },
  { id: "second-floor", name: "Second Floor", capacity: 120 },
  { id: "second-floor-rec", name: "Second Floor Rec Room", capacity: 40 },
  { id: "main-south-patio", name: "Main Floor South Patio", capacity: 30 },
  { id: "main-north-patio", name: "Main Floor North Patio", capacity: 80 },
  { id: "second-south-patio", name: "Second Floor South Patio", capacity: 30 },
  { id: "second-east-patio", name: "Second Floor East Patio", capacity: 30 },
  { id: "social-hall", name: "Social Hall", capacity: 100, combinable: true, combinesWith: ["atrium"] },
  { id: "atrium", name: "Atrium", capacity: 80, combinable: true, combinesWith: ["social-hall"] },
];

async function main() {
  const [, , uid, email] = process.argv;
  if (!uid || !email) {
    console.error("Usage: tsx scripts/seed.ts <uid> <email>");
    process.exit(1);
  }

  // 1. Super Admin user doc — onUserWrite will resolve and set the claims.
  await db.doc(`users/${uid}`).set({
    uid,
    email,
    displayName: "Super Admin",
    role: "super_admin",
    active: true,
    createdBy: "seed",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  });
  console.log(`Seeded super_admin: ${email}`);

  // 2. Spaces.
  const batch = db.batch();
  for (const s of SPACES) {
    batch.set(db.doc(`pricingConfig/spaces/items/${s.id}`), {
      name: s.name,
      capacity: s.capacity,
      baseRate: 0, // set real rates in the dashboard
      rateUnit: "per_event",
      combinable: s.combinable ?? false,
      combinesWith: s.combinesWith ?? [],
    });
  }
  await batch.commit();
  console.log(`Seeded ${SPACES.length} spaces.`);
}

main().then(() => process.exit(0));
