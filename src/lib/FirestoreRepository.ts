import { Document } from "../types/Document";

import { getTortoiseApp } from "./getTortoiseApp";
import { TortoiseClauses } from "../types/TortoiseClauses";
import { buildQueries } from "./buildQueries";
import { sanitizeData } from "./sanitizeData";
import { app, firestore } from "firebase-admin";
import App = app.App;
import OrderByDirection = firestore.OrderByDirection;
import Query = firestore.Query;
import DocumentReference = firestore.DocumentReference;

export class FirestoreRepository<T> {
  readonly collection: string;
  readonly app: App;

  constructor(collection: string, appName: string = "admin",
  ) {
    this.collection = collection;
    this.app = getTortoiseApp(appName);
  }

  async create(data: Partial<T>,
               uid?: string): Promise<Document<T>> {
    if (!this.isValidDocFormat(data)) {
      throw new Error("Invalid data format for new document. Data must be an object");
    }

    const ref = uid ? this.getDocRefWithUid(uid) : this.getDocRef();

    await ref.set(sanitizeData(data));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as Document<T>;
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
               uid: string): Promise<Document<T> | null> {
    const ref = this.app.firestore().collection(this.collection).doc(uid);
    const data = await ref.get();

    if (!data.exists) {
      return null;
    }

    if (!this.isValidDocFormat(updates)) {
      throw new Error("Invalid updates format. Updates must be an object");
    }

    await ref.update(sanitizeData(updates));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as Document<T>;
  }

  async findByUid(uid: string): Promise<Document<T> | null> {
    const res = await this.app.firestore().collection(this.collection).doc(uid).get();

    if (!res.exists) {
      return null;
    }

    return { uid: res.id, ...res.data() } as Document<T>;
  }

  async findByUidOrFail(uid: string): Promise<Document<T>> {
    const doc = await this.findByUid(uid);

    if (!doc) throw new Error(`Document ${uid} doesn't exist`);

    return doc;
  }

  async find(where: TortoiseClauses<T>,
             limit?: number,
             orderBy?: [string, OrderByDirection]): Promise<Document<T>[]> {
    const refs = await this.findRefs(where, limit, orderBy);
    const docs = await Promise.all(refs.map(async (ref) => await ref.get()));

    return docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Document<T>[];
  }

  async findAndUpdate(where: TortoiseClauses<T>,
                      updates: Partial<T>,
                      limit?: number,
                      orderBy?: [string, OrderByDirection]): Promise<Document<T>[]> {
    const refs = await this.findRefs(where, limit, orderBy);
    const updatedDocs: Document<T>[] = [];

    for (const ref of refs) {
      const updatedDoc = await this.update(updates, ref.id);

      if (updatedDoc) updatedDocs.push(updatedDoc);
    }

    return updatedDocs;
  }

  async findOne(where: TortoiseClauses<T>,
                orderBy?: [string, OrderByDirection]): Promise<Document<T> | null> {

    const docs = await this.find(where, undefined, orderBy);

    if (!docs.length) return null;

    return docs[0];
  }

  async findOneOrFail(where: TortoiseClauses<T>,
                      orderBy?: [string, OrderByDirection]): Promise<Document<T>> {
    const doc = await this.findOne(where, orderBy);

    if (!doc) throw new Error(`No document matching conditions`);

    return doc;
  }

  async findOneAndUpdate(where: TortoiseClauses<T>,
                         updates: Partial<T>,
                         orderBy?: [string, OrderByDirection]): Promise<Document<T> | null> {
    const refs = await this.findRefs(where, undefined, orderBy);

    if (!refs.length) return null;

    return this.update(updates, refs[0].id);
  }

  private async findRefs(where: TortoiseClauses<T>, limit?: number,
                         orderBy?: [string, OrderByDirection]): Promise<DocumentReference[]> {
    let collectionRes: Query = this.app.firestore().collection(this.collection);
    const queries = buildQueries<T>(where as any);

    for (const query of queries) {
      collectionRes = collectionRes.where(query.path, query.cond, query.value);
    }

    if (orderBy) collectionRes.orderBy(orderBy[0], orderBy[1]);

    if (limit) collectionRes = collectionRes.limit(limit);

    const snaps = await collectionRes.get();
    return snaps.docs.filter(snap => snap.exists).map(snap => snap.ref);
  }
}