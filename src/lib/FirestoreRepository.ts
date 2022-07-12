import { FirestoreDocument } from "../types/FirestoreDocument";
import firebase from "firebase/compat";
import { getTortoiseApp } from "./getTortoiseApp";
import {
  FirestoreDocResponse,
  FirestoreDocsResponse,
} from "../types/FirestoreResponse";
import {
  Condition,
  TortoiseClauses,
  TortoiseQuery,
} from "../types/TortoiseClauses";
import App = firebase.app.App;
import CollectionReference = firebase.firestore.CollectionReference;
import Query = firebase.firestore.Query;
import OrderByDirection = firebase.firestore.OrderByDirection;

export class FirestoreRepository<T> {
  readonly collection: string;
  readonly app: App;

  constructor(collection: string, appName: string,
  ) {
    this.collection = collection;
    this.app = getTortoiseApp(appName);
  }

  async create(data: Partial<T>,
               uid?: string): Promise<FirestoreDocResponse<T>> {
    const ref = this.app.firestore().collection(this.collection).doc(uid);

    try {
      await ref.set(data);
      const res = await ref.get();
      const doc = { uid: ref.id, ...res.data() } as T & FirestoreDocument;
      return { doc, err: null };
    } catch (e) {
      if (e instanceof Error) {
        return { doc: null, err: e.message };
      }

      return {
        doc: null,
        err: "An error has occurred. Unable to create document",
      };
    }
  }

  async delete(uid: string): Promise<boolean> {
    await this.app.firestore().collection(this.collection).doc(uid).delete();

    return true;
  }

  async update(updates: Partial<T>,
               uid: string): Promise<FirestoreDocResponse<T>> {
    const ref = this.app.firestore().collection(this.collection).doc(uid);

    try {
      await ref.update(updates);
      const res = await ref.get();
      const doc = { uid: ref.id, ...res.data() } as T & FirestoreDocument;
      return { doc, err: null };
    } catch (e) {
      if (e instanceof Error) {
        return { doc: null, err: e.message };
      }

      return {
        doc: null,
        err: "An error has occurred. Unable to update document",
      };
    }
  }

  static isNestedWhereClauses(obj: Object): boolean {
    for (const key of Object.keys(obj)) {
      if (key !== "cond" && key !== "value") {
        return true;
      }
    }

    return false;
  }

  static BuildQueries<T>(where: Record<string, TortoiseClauses<T>>): TortoiseQuery[] {
    const queries: TortoiseQuery[] = [];

    for (const [key, entry] of Object.entries(where)) {
      if (entry !== undefined) {
        if (typeof entry !== "object" || entry === null) {
          queries.push({ path: key, cond: "==", value: entry });
        } else {
          if (this.isNestedWhereClauses(entry)) {
            const subQueries: TortoiseQuery[] = this.BuildQueries(where[key] as any);
            for (const query of subQueries) {
              query.path = `${key}.${query.path}`;
            }
            queries.push(...subQueries);
          }
          const cond = entry as unknown as Condition;
          if (cond.value !== undefined) {
            queries.push({ path: key, cond: cond.cond, value: cond.value });
          }
        }
      }
    }

    return queries;
  }


  async findByUid(uid: string): Promise<FirestoreDocResponse<T>> {
    const res = await this.app.firestore().collection(this.collection).doc(uid).get();

    if (res.exists) {
      return { doc: null, err: `Document ${uid} doesn't exist` };
    }

    const doc = { uid: res.id, ...res.data() } as T & FirestoreDocument;
    return { doc, err: null };
  }

  async find(where: TortoiseClauses<T>,
             limit?: number,
             orderBy?: [string, OrderByDirection]): Promise<FirestoreDocsResponse<T>> {
    let collectionRes: CollectionReference | Query = this.app.firestore().collection(this.collection);
    const queries = FirestoreRepository.BuildQueries(where as any);

    for (const query of queries) {
      collectionRes = collectionRes.where(query.path, query.cond, query.value);
    }

    if (orderBy) collectionRes.orderBy(orderBy[0], orderBy[1]);

    if (limit) collectionRes = collectionRes.limit(limit);


    try {
      const snaps = await collectionRes.get();
      const docs = snaps.docs.map(doc => ({ uid: doc.id, ...doc.data() })) as (T & FirestoreDocument)[];
      return { docs, err: null };
    } catch (e) {
      if (e instanceof Error) {
        return { docs: null, err: e.message };
      }

      return {
        docs: null,
        err: "An error has occurred. Unable to fetch documents",
      };
    }
  }

  async findOne(where: TortoiseClauses<T>,
                orderBy?: [string, OrderByDirection]): Promise<FirestoreDocResponse<T>> {
    const { docs, err } = await this.find(where, undefined, orderBy);

    if (err && docs) {
      return { doc: null, err };
    }

    if (!docs) {
      return { doc: {} as (T & FirestoreDocument), err: null };
    }

    if (!docs.length) {
      return { doc: {} as (T & FirestoreDocument), err: null };
    }

    return { doc: docs[0], err: null };
  }
}