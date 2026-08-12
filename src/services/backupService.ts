import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";

import type { Db } from "@/db/database";
import { BackupError, buildBackup } from "@/services/backupDataService";

export {
  BACKUP_VERSION,
  BackupError,
  buildBackup,
  importBackupData,
  validateBackup,
  type BackupData,
} from "@/services/backupDataService";

/** Serializes the full app data to a JSON file for sharing. */
export async function exportBackupToFile(db: Db): Promise<{ uri: string; fileName: string }> {
  const data = await buildBackup(db);
  const fileName = backupFileName();
  const file = new File(Paths.cache, fileName);
  if (file.exists) file.delete();
  file.create();
  file.write(JSON.stringify(data, null, 2));
  return { uri: file.uri, fileName };
}

export async function shareBackup(db: Db): Promise<void> {
  if (process.env.EXPO_OS === "web") {
    const data = await buildBackup(db);
    const fileName = backupFileName();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
    return;
  }

  const { uri } = await exportBackupToFile(db);
  if (!(await Sharing.isAvailableAsync())) {
    throw new BackupError("Sharing is not available on this device.");
  }
  await Sharing.shareAsync(uri, {
    mimeType: "application/json",
    dialogTitle: "Export SubTrack data",
    UTI: "public.json",
  });
}

/** Opens the system file picker and imports the selected JSON backup. */
export async function pickBackupFile(): Promise<{ uri: string } | null> {
  if (process.env.EXPO_OS === "web") {
    return new Promise((resolve) => {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "application/json,.json";
      input.onchange = async () => {
        const selected = input.files?.[0];
        resolve(selected ? { uri: await selected.text() } : null);
      };
      input.click();
    });
  }

  const picked = await File.pickFileAsync({
    multipleFiles: false,
    mimeTypes: ["application/json"],
  });
  if (picked.canceled || !picked.result) return null;
  return { uri: picked.result.uri };
}

export function readBackupJson(uri: string): unknown {
  if (process.env.EXPO_OS === "web") {
    if (!uri.trim()) throw new BackupError("The file is empty.");
    return parseJson(uri);
  }

  const file = new File(uri);
  if (!file.exists) throw new BackupError("The selected file could not be read.");
  const content = file.textSync();
  if (!content.trim()) throw new BackupError("The file is empty.");
  return parseJson(content);
}

function parseJson(content: string): unknown {
  try {
    return JSON.parse(content);
  } catch {
    throw new BackupError("The selected file is not valid JSON.");
  }
}

function backupFileName(): string {
  return `subtrack-backup-${new Date().toISOString().slice(0, 10)}.json`;
}
