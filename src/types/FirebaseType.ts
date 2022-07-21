export type FirebaseBaseType = number | string | null | boolean;

export interface FirebaseObjectType {
  [k: string]: FirebaseBaseType | FirebaseObjectType;
}