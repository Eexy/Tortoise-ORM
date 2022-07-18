import "dotenv/config";
import * as admin from "firebase-admin";
import { app } from "firebase-admin";
import { FirestoreRepository, initializeTortoiseApp } from "../src";
import { clearFirestoreEmulator } from "../src/helpers/clearFirestoreEmulator";
import App = app.App;

interface User {
  email: string;
  firstName?: string;
}

describe("FirestoreRepository", () => {
  let app: App;
  let repository: FirestoreRepository<User>;

  beforeAll(async () => {
    app = admin.initializeApp({
      projectId: "demo-tortoise",
    });
    await app.firestore().collection("users").add({ test: "test" });
    initializeTortoiseApp(app);
    repository = new FirestoreRepository<User>("users");
  });

  describe("create", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should create new document", async () => {
      const doc = await repository.create({ email: "test" });

      expect(doc).not.toBe(null);
      expect(doc).toHaveProperty("email", "test");
    });

    test("should create new document with custom uid", async () => {
      const doc = await repository.create({ email: "test" }, "user");

      expect(doc).not.toBe(null);
      expect(doc).toHaveProperty("uid", "user");
    });
  });

  describe("createBatch", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should throw error when array of uids is not the same length as array of data", async () => {
      await expect(repository.createBatch([{ email: "test" }], [])).rejects.toThrow();
    });

    test("should throw error when more than 500 element", async () => {
      const data: User[] = [];
      for (let i = 0; i < 501; i++) {
        data.push({ email: "i" });
      }
      await expect(repository.createBatch(data)).rejects.toThrow();
    });

    test("should create documents", async () => {
      const data: User[] = [];
      for (let i = 0; i < 200; i++) {
        data.push({ email: `${i}` });
      }

      const docs = await repository.createBatch(data);

      expect(docs.length).toBe(200);
    });
  });

  describe("update", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should throw error when doc doesn't exist", async () => {
      const updatedDoc = await repository.update({ email: "test2" }, "user");
      expect(updatedDoc).toBe(null);
    });

    test("should update document", async () => {
      await repository.create({ email: "test" }, "user");
      const updatedDoc = await repository.update({ email: "test2" }, "user");

      const docRef = await app.firestore().collection("users").doc("user").get();
      const docData = docRef.data();
      expect(updatedDoc).toHaveProperty("email", "test2");
      expect(docData).toHaveProperty("email", "test2");
    });
  });

  describe("delete", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should delete document", async () => {
      await repository.create({ email: "test" }, "user");
      const res = await repository.delete("user");


      const docRef = await app.firestore().collection("users").doc("user").get();
      expect(res).toBe(true);
      expect(docRef.exists).toBe(false);
    });
  });

  describe("findByUid", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should return doc by uid", async () => {
      await repository.create({ email: "test" }, "user");
      const res = await repository.findByUid("user");

      expect(res).toHaveProperty("uid", "user");
    });
  });

  describe("find", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should return empty array when no docs exist", async () => {
      const docs = await repository.find({ firstName: "john" });
      expect(docs).toHaveLength(0);
    });

    test("should return docs matching condition", async () => {
      await repository.create({ email: "test", firstName: "John" });
      await repository.create({ email: "test2", firstName: "John" });
      await repository.create({ email: "test3", firstName: "David" });

      const docs = await repository.find({ firstName: "John" });
      expect(docs).toHaveLength(2);
    });

    test("should return 1 docs", async () => {
      await repository.create({ email: "test", firstName: "John" });
      await repository.create({ email: "test2", firstName: "John" });

      const docs = await repository.find({ firstName: "John" }, 1);
      expect(docs).toHaveLength(1);
    });
  });

  describe("findAndUpdate", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });


    test("should update multiple docs at same times", async () => {
      await repository.create({ email: "test", firstName: "John" });
      await repository.create({ email: "test2", firstName: "John" });
      await repository.create({ email: "test3", firstName: "David" });

      const docs = await repository.findAndUpdate({ firstName: "John" }, { email: "testX" });
      docs.forEach(doc => expect(doc).toHaveProperty("email", "testX"));
    });
  });

  describe("findOneAndUpdate", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should update doc ", async () => {
      await repository.create({ email: "test", firstName: "John" });
      await repository.create({ email: "test2", firstName: "John" });
      await repository.create({ email: "test3", firstName: "David" });

      const doc = await repository.findOneAndUpdate({ firstName: "John" }, { email: "testX" });
      expect(doc).toHaveProperty("email", "testX");
    });

    test("should return null if no document where found", async () => {
      const doc = await repository.findOneAndUpdate({ firstName: "John" }, { email: "testX" });
      expect(doc).toBe(null);
    });
  });

  describe("findOne", () => {
    afterEach(async () => {
      await clearFirestoreEmulator();
    });

    test("should return null when document doesn't exist", async () => {
      const doc = await repository.findOne({ firstName: "John" });
      expect(doc).toBe(null);
    });

    test("should return document", async () => {
      await repository.create({ email: "test", firstName: "John" });
      const doc = await repository.findOne({ firstName: "John" });
      expect(doc).toHaveProperty("firstName", "John");
    });
  });
});