import { Document } from "../types/Document";
import { getTortoiseApp } from "./getTortoiseApp";
import { TortoiseClauses } from "../types/TortoiseClauses";
import { buildQueries } from "./buildQueries";
import { sanitizeData } from "./sanitizeData";
import { app, firestore } from "firebase-admin";
import { OrderClause } from "../types/OrderClause";
import App = app.App;
import Query = firestore.Query;
import DocumentReference = firestore.DocumentReference;

/**
 * @template T
 */
export class FirestoreRepository<T> {
  /**
   * @readonly
   */
  readonly collection: string;

  /**
   * @readonly
   */
  readonly app: App;

  /**
   * Create a new firestore repository
   * @param {string} collection - collection's name in firestore
   * @param {string} [appName=admin] - firestore app to use
   */
  constructor(collection: string, appName: string = "admin",
  ) {
    this.collection = collection;
    this.app = getTortoiseApp(appName);
  }

  /**
   * Create new firestore document
   * @param {T} data - data for new document
   * @param {string} [uid] - uid to use for new document
   * @throws Throw error when invalid data format
   * @returns {Promise<Document<T>>} return the newly created document
   */
  async create(data: T,
               uid?: string): Promise<Document<T>> {
    if (!this.isValidDocFormat(data)) {
      throw new Error("Invalid data format for new document. Data must be an object");
    }

    const ref = uid ? this.getDocRefWithUid(uid) : this.getDocRef();

    await ref.set(sanitizeData(data));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as Document<T>;
  }

  /**
   * Check that data is an object
   * @private
   * @param {*} data
   * @returns {boolean}
   */
  private isValidDocFormat(data: any): boolean {
    if (data === null || data === undefined) return false;

    if (Array.isArray(data)) return false;

    return typeof data === "object";
  }

  /**
   * Get document ref by uid
   * @private
   * @param {string} uid
   * @returns {DocumentReference}
   */
  private getDocRefWithUid(uid: string): DocumentReference {
    return this.app.firestore().collection(this.collection).doc(uid);
  }

  /**
   * Get a doc ref
   * @private
   * @returns {DocumentReference}
   */
  private getDocRef(): DocumentReference {
    return this.app.firestore().collection(this.collection).doc();
  }

  /**
   * Delete document
   * @param {string} uid - document's uid to delete
   * @returns {Promise<true>}
   */
  async delete(uid: string): Promise<true> {
    await this.app.firestore().collection(this.collection).doc(uid).delete();

    return true;
  }

  /**
   * Update document
   * @param {Partial<T>} updates - updates to apply
   * @param {string} uid - document's uid to update
   * @throws Throw error when invalid updates format
   * @returns {Promise<Document<T> | null>} return null when document doesn't exist else return updated document
   */
  async update(updates: Partial<T>,
               uid: string): Promise<Document<T> | null> {
    if (!this.isValidDocFormat(updates)) {
      throw new Error("Invalid updates format. Updates must be an object");
    }

    const ref = this.app.firestore().collection(this.collection).doc(uid);
    const data = await ref.get();

    if (!data.exists) {
      return null;
    }

    await ref.update(sanitizeData(updates));
    const res = await ref.get();
    return { uid: ref.id, ...res.data() } as Document<T>;
  }

  /**
   * Find document by uid
   * @param {string} uid
   * @returns {Promise<Document<T> | null>} return null when document doesn't exist else return document
   */
  async findByUid(uid: string): Promise<Document<T> | null> {
    const res = await this.app.firestore().collection(this.collection).doc(uid).get();

    if (!res.exists) {
      return null;
    }

    return { uid: res.id, ...res.data() } as Document<T>;
  }

  /**
   * Find document by uid or fail
   * @param {string} uid
   * @throws Throw error when document doesn't exist
   * @returns {Promise<Document<T>>} return document
   */
  async findByUidOrFail(uid: string): Promise<Document<T>> {
    const doc = await this.findByUid(uid);

    if (!doc) throw new Error(`Document ${uid} doesn't exist`);

    return doc;
  }

  /**
   * Find documents matching where clauses
   * @template T
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for documents
   * @param {number} [limit] - max documents to find
   * @param {OrderClause} [orderBy] - order clause
   * @returns {Promise<Document<T>>} return documents matching conditions
   */
  async find(where: TortoiseClauses<T>,
             limit?: number,
             orderBy?: OrderClause): Promise<Document<T>[]> {
    const refs = await this.findRefs(where, limit, orderBy);
    const docs = await Promise.all(refs.map(async (ref) => await ref.get()));

    return docs.map(doc => ({ uid: doc.id, ...doc.data() })) as Document<T>[];
  }

  /**
   * Find documents matching where clauses and update them
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for documents
   * @param {Partial<T>} updates - updates to apply
   * @param {number} [limit] - max document to find and update
   * @param {OrderClause} [orderBy] - order clause
   * @returns {Promise<Document<T>>} return updated documents
   */
  async findAndUpdate(where: TortoiseClauses<T>,
                      updates: Partial<T>,
                      limit?: number,
                      orderBy?: OrderClause): Promise<Document<T>[]> {
    const refs = await this.findRefs(where, limit, orderBy);
    const updatedDocs: Document<T>[] = [];

    for (const ref of refs) {
      const updatedDoc = await this.update(updates, ref.id);

      if (updatedDoc) updatedDocs.push(updatedDoc);
    }

    return updatedDocs;
  }

  /**
   * Find first document matching where clauses
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for document
   * @param {OrderClause} [orderBy] - order clause
   * @returns {Promise<Document<T> | null>} return null when no existing document match conditions else return document
   */
  async findOne(where: TortoiseClauses<T>,
                orderBy?: OrderClause): Promise<Document<T> | null> {

    const docs = await this.find(where, undefined, orderBy);

    if (!docs.length) return null;

    return docs[0];
  }

  /**
   * Find first document matching where clauses or fail
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for document
   * @param {OrderClause} [orderBy] - order clause
   * @throws Throw error when no document match conditions
   * @returns {Promise<Document<T> | null>} return null when no existing document match conditions else return document
   */
  async findOneOrFail(where: TortoiseClauses<T>,
                      orderBy?: OrderClause): Promise<Document<T>> {
    const doc = await this.findOne(where, orderBy);

    if (!doc) throw new Error(`No document matching conditions`);

    return doc;
  }

  /**
   * Find first document matching where clauses and update it
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for document
   * @param {Partial<T>} updates - updates to apply
   * @param {OrderClause} [orderBy] - order clause
   * @return {Promise<Document<T> | null>} return null when no existing document matching conditions else return updated document
   * */
  async findOneAndUpdate(where: TortoiseClauses<T>,
                         updates: Partial<T>,
                         orderBy?: OrderClause): Promise<Document<T> | null> {
    const refs = await this.findRefs(where, undefined, orderBy);

    if (!refs.length) return null;

    return this.update(updates, refs[0].id);
  }

  /**
   * Find document's references matching where clauses
   * @private
   * @param {TortoiseClauses<T>} where - conditions to apply when searching for document's reference
   * @param {number} [limit] - max document's references to find and update
   * @param {OrderClause} [orderBy] - order clause
   * @return {Promise<Document<DocumentReference[]>} return document's references that match conditions
   * */
  private async findRefs(where: TortoiseClauses<T>, limit?: number,
                         orderBy?: OrderClause): Promise<DocumentReference[]> {
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