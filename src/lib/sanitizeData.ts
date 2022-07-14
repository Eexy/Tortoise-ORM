/**
 * Delete all undefined key from an object
 * @returns {Record<string, *>}
 * */
export function sanitizeData(data: Record<string, any>): Record<string, any> {
  if (Array.isArray(data) || data === undefined) throw Error("Data must be an object");

  const sanitizedData: Record<string, any> = {};

  for (const [key, entry] of Object.entries(data)) {
    if (typeof entry === "object" && !Array.isArray(entry)) {
      sanitizedData[key] = sanitizeData(entry);
    } else if (entry !== undefined) {
      sanitizedData[key] = entry;
    }
  }

  return sanitizedData;
}