import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const projectId = process.env.FIREBASE_PROJECT_ID ?? "caverno-app";
const defaultCollections = ["songs", "categories"];

function parseArgs(argv) {
  const result = {
    uid: process.env.FIREBASE_USER_ID ?? null,
    projectId,
    dryRun: false,
    force: false,
    collections: defaultCollections,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === "--dry-run" || arg === "-n") {
      result.dryRun = true;
      continue;
    }

    if (arg === "--force" || arg === "-f") {
      result.force = true;
      continue;
    }

    if (arg === "--uid" || arg === "--user-id") {
      result.uid = argv[index + 1] ?? null;
      index += 1;
      continue;
    }

    if (arg === "--project-id") {
      result.projectId = argv[index + 1] ?? result.projectId;
      index += 1;
      continue;
    }

    if (arg === "--collection") {
      const values = argv[index + 1];
      if (values) {
        result.collections = values.split(",").map((value) => value.trim()).filter(Boolean);
      }
      index += 1;
      continue;
    }

    if (arg === "--help" || arg === "-h") {
      console.log(`Usage: node scripts/migrate-user-firestore.mjs --uid <firebase-user-id> [--dry-run] [--force] [--project-id <id>] [--collection songs,categories]\n\nExamples:\n  node scripts/migrate-user-firestore.mjs --uid abc123 --dry-run\n  node scripts/migrate-user-firestore.mjs --uid abc123 --force`);
      process.exit(0);
    }
  }

  return result;
}

function getAccessToken() {
  const result = spawnSync("gcloud", ["auth", "print-access-token"], {
    encoding: "utf8",
  });

  if (result.error) {
    throw new Error(`Could not run gcloud: ${result.error.message}`);
  }

  if (result.status !== 0) {
    throw new Error(result.stderr.trim() || "Could not get a gcloud access token.");
  }

  return result.stdout.trim();
}

async function fetchCollection(projectId, collectionId, accessToken) {
  const documents = [];
  let pageToken;

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionId)}`,
    );

    url.searchParams.set("pageSize", "300");
    if (pageToken) {
      url.searchParams.set("pageToken", pageToken);
    }

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const payload = await response.json();

    if (!response.ok) {
      throw new Error(
        `Firestore read failed for ${collectionId}: ${payload.error?.message ?? response.statusText}`,
      );
    }

    documents.push(...(payload.documents ?? []));
    pageToken = payload.nextPageToken;
  } while (pageToken);

  return documents;
}

async function writeUserScopedDocument({
  projectId,
  uid,
  collectionId,
  doc,
  accessToken,
}) {
  const documentName = doc.name.split("/").slice(-1)[0];
  const targetPath = `users/${uid}/${collectionId}/${documentName}`;
  const encodedTargetPath = targetPath
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
  const url = new URL(
    `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodedTargetPath}`,
  );

  const fields = { ...(doc.fields ?? {}) };
  fields.userId = { stringValue: uid };

  const response = await fetch(url, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fields }),
  });

  const payload = await response.json();
  if (!response.ok) {
    throw new Error(
      `Firestore write failed for ${collectionId}/${documentName}: ${payload.error?.message ?? response.statusText}`,
    );
  }

  return payload;
}

async function main() {
  const options = parseArgs(process.argv.slice(2));

  if (!options.uid) {
    throw new Error("Missing Firebase user id. Pass --uid <uid> or set FIREBASE_USER_ID.");
  }

  if (!options.collections.length) {
    throw new Error("No collections were selected for migration.");
  }

  const accessToken = getAccessToken();

  console.log(`Migrating Firestore docs for user ${options.uid} to project ${options.projectId}`);
  console.log(`Collections: ${options.collections.join(", ")}`);
  console.log(options.dryRun ? "Dry run only; nothing will be written." : "Write mode enabled.");

  for (const collectionId of options.collections) {
    const documents = await fetchCollection(options.projectId, collectionId, accessToken);
    const destinationPath = `users/${options.uid}/${collectionId}`;
    console.log(`${collectionId}: ${documents.length} legacy documents found`);

    if (options.dryRun) {
      console.log(`Would migrate ${documents.length} docs to ${destinationPath}`);
      continue;
    }

    if (!options.force) {
      console.log(`Migration is not executed until --force is provided for ${collectionId}.`);
      continue;
    }

    for (const document of documents) {
      await writeUserScopedDocument({
        projectId: options.projectId,
        uid: options.uid,
        collectionId,
        doc: document,
        accessToken,
      });
    }

    console.log(`Migrated ${documents.length} docs to ${destinationPath}`);
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
