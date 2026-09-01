import { Firestore, DocumentReference } from 'firebase-admin/firestore';
import { UserRecord } from 'firebase-admin/auth';
import { getAdminFirestore, getAdminAuth, setUserRoleClaim } from '../server/firebaseAdmin';
import { initialAdminCategories } from '../data/categoryAdminDummyData';
import { initialAdminTags } from '../data/tagAdminDummyData';
import { initialAdminAuthors } from '../data/authorAdminDummyData';
import { initialAdminMedia } from '../data/mediaAdminDummyData';
import { initialAdminPagesData } from '../data/pagesAdminDummyData';
import { INITIAL_NAVIGATION_DATA, INITIAL_SUB_NAVIGATION_DATA, INITIAL_SUB_NAV_SETTINGS } from '../data/navigationStore';
import { INITIAL_FOOTER_CONFIG } from '../data/footerAdminStore';
import { INITIAL_SITE_SETTINGS } from '../data/siteSettingsStore';
import { DEFAULT_SYSTEM_INFO, DEFAULT_MAINTENANCE_CONFIG, DEFAULT_SECURITY_CONFIG } from '../data/systemSettingsStore';
import { INITIAL_CMS_USERS } from '../data/userAdminStore';
import { initialAdminArticles } from '../data/newsAdminDummyData';
import { initialAdminVideos } from '../data/videoAdminDummyData';

interface SeedOptions {
  dryRun?: boolean;
  force?: boolean;
}

/**
 * Batched write utility for Firestore (max 400 ops per batch for safety)
 */
async function commitBatches(
  db: Firestore,
  operations: Array<{ ref: DocumentReference; data: any; merge?: boolean }>,
  dryRun: boolean = false
): Promise<number> {
  if (dryRun) {
    console.log(`[DRY RUN] Would write ${operations.length} documents.`);
    return operations.length;
  }

  const BATCH_SIZE = 400;
  let totalCommitted = 0;

  for (let i = 0; i < operations.length; i += BATCH_SIZE) {
    const batch = db.batch();
    const chunk = operations.slice(i, i + BATCH_SIZE);

    for (const op of chunk) {
      batch.set(op.ref, op.data, { merge: op.merge ?? true });
    }

    await batch.commit();
    totalCommitted += chunk.length;
    console.log(`Committed batch ${Math.floor(i / BATCH_SIZE) + 1} (${chunk.length} items)...`);
  }

  return totalCommitted;
}

export async function runFirestoreSeeder(options: SeedOptions = {}) {
  const { dryRun = false, force = false } = options;

  console.log('====================================================');
  console.log('🚀 BATUTV FIRESTORE CLOUD DATA SEEDER (P0-5)');
  console.log(`Mode: ${dryRun ? 'DRY-RUN (Simulated)' : 'LIVE EXECUTION'}`);
  console.log(`Force Overwrite: ${force ? 'YES' : 'NO'}`);
  console.log('====================================================\n');

  const db = getAdminFirestore();
  const auth = getAdminAuth();

  const results: Record<string, { total: number; status: string }> = {};

  // 1. Categories
  console.log('📁 Seeding /categories...');
  const catOps = initialAdminCategories.map((cat) => ({
    ref: db.collection('categories').doc(cat.id),
    data: cat,
  }));
  const catCount = await commitBatches(db, catOps, dryRun);
  results['categories'] = { total: catCount, status: 'SUCCESS' };

  // 2. Tags
  console.log('🏷️  Seeding /tags...');
  const tagOps = initialAdminTags.map((tag) => ({
    ref: db.collection('tags').doc(tag.id),
    data: tag,
  }));
  const tagCount = await commitBatches(db, tagOps, dryRun);
  results['tags'] = { total: tagCount, status: 'SUCCESS' };

  // 3. Authors
  console.log('✍️  Seeding /authors...');
  const authorOps = initialAdminAuthors.map((author) => ({
    ref: db.collection('authors').doc(author.id),
    data: author,
  }));
  const authorCount = await commitBatches(db, authorOps, dryRun);
  results['authors'] = { total: authorCount, status: 'SUCCESS' };

  // 4. Media Library
  console.log('🖼️  Seeding /media...');
  const mediaOps = initialAdminMedia.map((med) => ({
    ref: db.collection('media').doc(med.id),
    data: med,
  }));
  const mediaCount = await commitBatches(db, mediaOps, dryRun);
  results['media'] = { total: mediaCount, status: 'SUCCESS' };

  // 5. Pages
  console.log('📄 Seeding /pages...');
  const pageOps = initialAdminPagesData.map((page) => ({
    ref: db.collection('pages').doc(page.id),
    data: page,
  }));
  const pageCount = await commitBatches(db, pageOps, dryRun);
  results['pages'] = { total: pageCount, status: 'SUCCESS' };

  // 6. Navigation
  console.log('🧭 Seeding /navigation...');
  const navOps = [
    ...INITIAL_NAVIGATION_DATA.map((nav) => ({
      ref: db.collection('navigation').doc(nav.id),
      data: { ...nav, section: 'primary' },
    })),
    ...INITIAL_SUB_NAVIGATION_DATA.map((subnav) => ({
      ref: db.collection('navigation').doc(subnav.id),
      data: { ...subnav, section: 'subnav' },
    })),
    {
      ref: db.collection('navigation').doc('subnav_settings'),
      data: { ...INITIAL_SUB_NAV_SETTINGS, section: 'settings' },
    },
  ];
  const navCount = await commitBatches(db, navOps, dryRun);
  results['navigation'] = { total: navCount, status: 'SUCCESS' };

  // 7. Footer (Singleton)
  console.log('🦶 Seeding /footer/config...');
  const footerOps = [
    {
      ref: db.collection('footer').doc('config'),
      data: INITIAL_FOOTER_CONFIG,
    },
    {
      ref: db.collection('footer').doc('default'),
      data: INITIAL_FOOTER_CONFIG,
    },
  ];
  const footerCount = await commitBatches(db, footerOps, dryRun);
  results['footer'] = { total: footerCount, status: 'SUCCESS' };

  // 8. Site Settings (Singleton)
  console.log('⚙️  Seeding /site_settings/default...');
  const siteOps = [
    {
      ref: db.collection('site_settings').doc('default'),
      data: INITIAL_SITE_SETTINGS,
    },
  ];
  const siteCount = await commitBatches(db, siteOps, dryRun);
  results['site_settings'] = { total: siteCount, status: 'SUCCESS' };

  // 9. System Settings
  console.log('🛡️  Seeding /system_settings...');
  const sysOps = [
    {
      ref: db.collection('system_settings').doc('info'),
      data: DEFAULT_SYSTEM_INFO,
    },
    {
      ref: db.collection('system_settings').doc('maintenance'),
      data: DEFAULT_MAINTENANCE_CONFIG,
    },
    {
      ref: db.collection('system_settings').doc('security'),
      data: DEFAULT_SECURITY_CONFIG,
    },
  ];
  const sysCount = await commitBatches(db, sysOps, dryRun);
  results['system_settings'] = { total: sysCount, status: 'SUCCESS' };

  // 10. Articles
  console.log('📰 Seeding /articles...');
  const artOps = initialAdminArticles.map((art) => ({
    ref: db.collection('articles').doc(art.id),
    data: art,
  }));
  const artCount = await commitBatches(db, artOps, dryRun);
  results['articles'] = { total: artCount, status: 'SUCCESS' };

  // 11. Videos
  console.log('🎬 Seeding /videos...');
  const vidOps = initialAdminVideos.map((vid) => ({
    ref: db.collection('videos').doc(vid.id),
    data: vid,
  }));
  const vidCount = await commitBatches(db, vidOps, dryRun);
  results['videos'] = { total: vidCount, status: 'SUCCESS' };

  // 12. Users, Admins, & Firebase Auth Sync
  console.log('👤 Seeding /users and /admins with Firebase Auth synchronization...');
  let userCount = 0;
  let adminCount = 0;

  for (const cmsUser of INITIAL_CMS_USERS) {
    if (!dryRun) {
      let uid = cmsUser.id;
      try {
        // Check if user exists in Firebase Auth
        let authRecord: UserRecord | null = null;
        try {
          authRecord = await auth.getUserByEmail(cmsUser.email);
        } catch {
          // User not found in auth
        }

        if (!authRecord) {
          // Create Firebase Auth user
          const created = await auth.createUser({
            email: cmsUser.email,
            password: cmsUser.password || 'Password@123',
            displayName: cmsUser.fullName,
            disabled: cmsUser.status === 'ditangguhkan' || cmsUser.status === 'nonaktif',
          });
          uid = created.uid;
          console.log(`Created Firebase Auth user: ${cmsUser.email} (UID: ${uid})`);
        } else {
          uid = authRecord.uid;
          console.log(`Existing Firebase Auth user: ${cmsUser.email} (UID: ${uid})`);
        }

        // Set Custom Role Claim
        await setUserRoleClaim(uid, cmsUser.role);

        // Prepare Firestore profile document (WITHOUT plaintext password)
        const { password, ...safeUserDoc } = cmsUser;
        const userProfile = {
          ...safeUserDoc,
          uid,
          updatedAt: new Date().toISOString(),
        };

        // Write to /users/{uid} and /users/{id}
        await db.collection('users').doc(uid).set(userProfile, { merge: true });
        if (cmsUser.id !== uid) {
          await db.collection('users').doc(cmsUser.id).set(userProfile, { merge: true });
        }
        userCount++;

        // If user is admin or redaksi, write to /admins/{uid}
        if (cmsUser.role === 'admin' || cmsUser.role === 'redaksi') {
          await db.collection('admins').doc(uid).set(userProfile, { merge: true });
          if (cmsUser.id !== uid) {
            await db.collection('admins').doc(cmsUser.id).set(userProfile, { merge: true });
          }
          adminCount++;
        }
      } catch (userErr) {
        console.error(`Error processing user ${cmsUser.email}:`, userErr);
      }
    } else {
      userCount++;
      if (cmsUser.role === 'admin' || cmsUser.role === 'redaksi') {
        adminCount++;
      }
    }
  }

  results['users'] = { total: userCount, status: 'SUCCESS' };
  results['admins'] = { total: adminCount, status: 'SUCCESS' };

  console.log('\n====================================================');
  console.log('✅ SEEDING COMPLETE SUMMARY:');
  console.table(results);
  console.log('====================================================\n');

  return results;
}

// Auto-run if invoked directly via CLI
if (process.argv[1] && process.argv[1].includes('seedFirestore')) {
  const isDryRun = process.argv.includes('--dry-run');
  const isForce = process.argv.includes('--force');

  runFirestoreSeeder({ dryRun: isDryRun, force: isForce })
    .then(() => {
      console.log('Seeder finished successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seeder failed with error:', err);
      process.exit(1);
    });
}
