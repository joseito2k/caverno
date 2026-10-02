import { spawnSync } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectId = process.env.FIREBASE_PROJECT_ID ?? "caverno-app";
const collectionIds = ["songs", "categories"];
const projectRoot = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const outputDirectory = path.join(projectRoot, "backups");

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

async function fetchCollection(collectionId, accessToken) {
  const documents = [];
  let pageToken;

  do {
    const url = new URL(
      `https://firestore.googleapis.com/v1/projects/${encodeURIComponent(projectId)}/databases/(default)/documents/${encodeURIComponent(collectionId)}`,
    );
    url.searchParams.set("pageSize", "300");
    if (pageToken) url.searchParams.set("pageToken", pageToken);

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

async function main() {
  const accessToken = getAccessToken();
  const collections = {};

  for (const collectionId of collectionIds) {
    collections[collectionId] = await fetchCollection(collectionId, accessToken);
  }

  const backup = {
    projectId,
    databaseId: "(default)",
    exportedAt: new Date().toISOString(),
    collections,
  };
  const timestamp = backup.exportedAt.replaceAll(/[:.]/g, "-");
  const outputPath = path.join(outputDirectory, `${projectId}-${timestamp}.json`);

  await mkdir(outputDirectory, { recursive: true });
  await writeFile(outputPath, `${JSON.stringify(backup, null, 2)}\n`, {
    flag: "wx",
  });

  for (const collectionId of collectionIds) {
    console.log(`${collectionId}: ${collections[collectionId].length} documents`);
  }
  console.log(`Backup written to ${path.relative(projectRoot, outputPath)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});