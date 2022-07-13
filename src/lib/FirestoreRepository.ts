import { FirestoreDocument } from "../types/FirestoreDocument";

import { getTortoiseApp } from "./getTortoiseApp";
import { TortoiseClauses } from "../types/TortoiseClauses";
import { buildQueries } from "./buildQueries";
import { sanitizeData } from "./sanitizeData";
import { app, firestore } from "firebase-admin";
import App = app.App;
import OrderByDirection = firestore.OrderByDirection;
import Query = firestore.Query;

export class FirestoreRepository<T> {
  readonly collection: string;
  readonly app: App;

  constructor(collection: string, appName: string = "admin",
  ) {
    this.collection = collection;
    this.app = getTortoiseApp(appName);
  }

  async create(data: Partial<T>,
               uid?: string): Promise<T & FirestoreDocument> {
    if (this.isValidDocFormat(data)) {
      throw new Error("Invalid data format for new document. Data must be an object");
    }

    const ref = uid ? this.getDocRefWithUid(uid) : this.getDocRef();

    await ref.set(sanitizeData(data));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as T & FirestoreDocument;
  }

  private isValidDocFormat(data: any): boolean {
    if (data === null || data === undefined) return false;

    if (Array.isArray(data)) return false;

    return typeof data === "object";
  }

  private getDocRefWithUid(uid: string) {
    return this.app.firestore().collection(this.collection).doc(uid);
  }

  private getDocRef() {
    return this.app.firestore().collection(this.collection).doc();
  }

  async delete(uid: string): Promise<boolean> {
    await this.app.firestore().collection(this.collection).doc(uid).delete();

    return true;
  }

  async update(updates: Partial<T>,
               uid: string): Promise<T & FirestoreDocument> {
    const ref = this.app.firestore().collection(this.collection).doc(uid);
    const data = await ref.get();

    if (!data.exists) {
      throw new Error("Invalid update. Document doesn't exist");
    }

    if (this.isValidDocFormat(updates)) {
      throw new Error("Invalid updates format. Updates must be an object");
    }

    await ref.update(sanitizeData(updates));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as T & FirestoreDocument;
  }

  async findByUid(uid: string): Promise<T & FirestoreDocument | null> {
    const res = await this.app.firestore().collection(this.collection).doc(uid).get();

    if (res.exists) {
      return null;
    }

    return { uid: res.id, ...res.data() } as T & FirestoreDocument;
  }

  async find(where: TortoiseClauses<T>,
             limit?: number,
             orderBy?: [string, OrderByDirection]): Promise<(T & FirestoreDocument)[]> {
    let collectionRes: Query = this.app.firestore().collection(this.collection);
    const queries = buildQueries<T>(where as any);

    for (const query of queries) {
      collectionRes = collectionRes.where(query.path, query.cond, query.value);
    }

    if (orderBy) collectionRes.orderBy(orderBy[0], orderBy[1]);

    if (limit) collectionRes = collectionRes.limit(limit);


    const snaps = await collectionRes.get();
    return snaps.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as (T & FirestoreDocument)[];
  }

  async findOne(where: TortoiseClauses<T>,
                orderBy?: [string, OrderByDirection]): Promise<T & FirestoreDocument | null> {

    const docs = await this.find(where, undefined, orderBy);

    if (!docs.length) return null;

    return docs[0];
  }
}