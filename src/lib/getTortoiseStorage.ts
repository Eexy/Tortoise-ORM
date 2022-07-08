import { TortoiseStorage } from "../types/TortoiseStorage";
import { CustomGlobal } from "../types/CustomGlobal";

function getStorage() {
  return global as CustomGlobal;
}

export function getTortoiseStorage(): TortoiseStorage {
  const storage = getStorage();

  if (!storage.tortoiseStorage) {
    storage.tortoiseStorage = {};
  }

  return storage.tortoiseStorage;
}