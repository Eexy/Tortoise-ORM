import { TortoiseStorage } from "../types/TortoiseStorage";
import { CustomGlobal } from "../types/CustomGlobal";

function getStorage() {
  return global as CustomGlobal;
}

/**
 * Get tortoise storage from global object. If tortoise's storage doesn't exist it create a new one
 * @returns {TortoiseStorage}
 */
export function getTortoiseStorage(): TortoiseStorage {
  const storage = getStorage();

  if (!storage.tortoiseStorage) {
    storage.tortoiseStorage = {};
  }

  return storage.tortoiseStorage;
}