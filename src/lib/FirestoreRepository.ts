import { FirestoreDocument } from "../types/FirestoreDocument";

import { getTortoiseApp } from "./getTortoiseApp";
import {
  FirestoreDocResponse,
  FirestoreDocsResponse,
} from "../types/FirestoreResponse";
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
               uid?: string): Promise<FirestoreDocResponse<T>> {
    if (this.isValidDocFormat(data)) {
      return [null, "Invalid data format. Data must be an object"];
    }

    const ref = uid ? this.getDocRefWithUid(uid) : this.getDocRef();

    try {
      await ref.set(sanitizeData(data));
      const res = await ref.get();
      const doc = { uid: ref.id, ...res.data() } as T & FirestoreDocument;
      return [doc, null];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e.message];
      }

      return [null, "An error has occurred. Unable to create document"];
    }
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
               uid: string): Promise<FirestoreDocResponse<T>> {
    const ref = this.app.firestore().collection(this.collection).doc(uid);
    const data = await ref.get();

    if (!data.exists) {
      return [null, "Invalid update. Document doesn't exist"];
    }

    if (this.isValidDocFormat(updates)) {
      return [null, "Invalid updates format. Updates must be an object"];
    }

    try {
      await ref.update(sanitizeData(updates));
      const res = await ref.get();
      const doc = { uid: ref.id, ...res.data() } as T & FirestoreDocument;
      return [doc, null];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e.message];
      }

      return [null, "An error has occurred. Unable to update document"];
    }
  }

  async findByUid(uid: string): Promise<FirestoreDocResponse<T>> {
    const res = await this.app.firestore().collection(this.collection).doc(uid).get();

    if (res.exists) {
      return [null, `Document ${uid} doesn't exist`];
    }

    const doc = { uid: res.id, ...res.data() } as T & FirestoreDocument;
    return [doc, null];
  }

  async find(where: TortoiseClauses<T>,
             limit?: number,
             orderBy?: [string, OrderByDirection]): Promise<FirestoreDocsResponse<T>> {
    let collectionRes: Query = this.app.firestore().collection(this.collection);
    const queries = buildQueries<T>(where as any);

    for (const query of queries) {
      collectionRes = collectionRes.where(query.path, query.cond, query.value);
    }

    if (orderBy) collectionRes.orderBy(orderBy[0], orderBy[1]);

    if (limit) collectionRes = collectionRes.limit(limit);


    try {
      const snaps = await collectionRes.get();
      const docs = snaps.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as (T & FirestoreDocument)[];
      return [docs, null];
    } catch (e) {
      if (e instanceof Error) {
        return [null, e.message];
      }

      return [null, "An error has occurred. Unable to fetch documents"];
    }
  }

  async findOne(where: TortoiseClauses<T>,
                orderBy?: [string, OrderByDirection]): Promise<FirestoreDocResponse<T>> {
    const [docs, err] = await this.find(where, undefined, orderBy);

    if (err && !docs) {
      return [null, err];
    }

    if (!docs) {
      return [{} as (T & FirestoreDocument), null];
    }

    if (!docs.length) {
      return [{} as (T & FirestoreDocument), null];
    }

    return [docs[0], null];
  }
}