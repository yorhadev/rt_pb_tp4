import { deleteApp, initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { cacheService } from "../cache";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

class FirebaseService {
  constructor() {
    this.app = initializeApp(firebaseConfig);
    this.auth = getAuth(this.app);
    this.db = getFirestore(this.app);
  }

  async signIn(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const response = await this.findOneDoc("users", user.uid);
      if (response.code !== 200) {
        await this.auth.signOut();
        throw new Error("cannot find user in users collection");
      }
      const status = response.data?.status || "inactive";
      if (status !== "active") {
        await this.auth.signOut();
        throw new Error("user is inactive, please contact administration");
      }
      return {
        code: 200,
        message: "user signed in successfully!",
        data: user,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async signOut() {
    try {
      await this.auth.signOut();
      return {
        code: 200,
        message: "user signed out successfully!",
        data: null,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async createUser(
    name,
    email,
    password,
    role = "collaborator",
    status = "active"
  ) {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = { name, email, password, role, status };
      const response = await this.createDocById("users", user.uid, userData);
      if (response.code !== 200) throw response.message;
      return {
        code: 200,
        message: "user created successfully!",
        data: user,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async createUserByAdmin(
    name,
    email,
    password,
    role = "collaborator",
    status = "active"
  ) {
    const tempApp = initializeApp(firebaseConfig, "tempApp");
    const tempAuth = getAuth(tempApp);
    try {
      cacheService.clearCache("users");
      const userCredential = await createUserWithEmailAndPassword(
        tempAuth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = { name, email, password, role, status };
      const response = await this.createDocById("users", user.uid, userData);
      if (response.code !== 200) throw response.message;
      return {
        code: 200,
        message: "user created successfully!",
        data: user,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    } finally {
      await deleteApp(tempApp);
    }
  }

  async deleteUserByAdmin(documentId, email, password) {
    const tempApp = initializeApp(firebaseConfig, "tempApp");
    const tempAuth = getAuth(tempApp);
    try {
      cacheService.clearCache("users");
      const documentReference = doc(this.db, "users", documentId);
      await deleteDoc(documentReference);
      const userCredential = await signInWithEmailAndPassword(
        tempAuth,
        email,
        password
      );
      const user = userCredential.user;
      await user.delete();
      return {
        code: 200,
        message: `[${email}] deleted successfully!`,
        data: null,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    } finally {
      await deleteApp(tempApp);
    }
  }

  async createDoc(path, documentData) {
    try {
      cacheService.clearCache(path);
      const collectionReference = collection(this.db, path);
      const data = {
        ...documentData,
        submittedDate: Timestamp.fromDate(new Date()),
      };
      const documentReference = await addDoc(collectionReference, data);
      const document = {
        id: documentReference.id,
        ...data,
        submittedDate: data.submittedDate.toDate(),
      };
      return {
        code: 200,
        message: `[${path}] submitted successfully!`,
        data: document,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async createDocById(path, documentId, documentData) {
    try {
      cacheService.clearCache(path);
      const documentReference = doc(this.db, path, documentId);
      const data = {
        ...documentData,
        submittedDate: Timestamp.fromDate(new Date()),
      };
      await setDoc(documentReference, data);
      const document = {
        ...data,
        submittedDate: data.submittedDate.toDate(),
      };
      return {
        code: 200,
        message: `[${path}] submitted successfully!`,
        data: document,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async findOneDoc(path, documentId) {
    try {
      const documentReference = doc(this.db, path, documentId);
      const documentSnapshot = await getDoc(documentReference);
      if (!documentSnapshot.exists()) throw new Error("No such document!");
      const document = documentSnapshot.data();
      return {
        code: 200,
        message: `[${path}] retrieved successfully!`,
        data: document,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async findAllDocs(path) {
    try {
      const cacheData = cacheService.getCache(path);
      if (cacheData) return cacheData;
      const documents = [];
      const collectionReference = collection(this.db, path);
      const q = query(collectionReference, orderBy("submittedDate"));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        const documentData = {
          id: document.id,
          ...document.data(),
          submittedDate: document.data().submittedDate.toDate(),
        };
        documents.push(documentData);
      });
      const response = {
        code: 200,
        message: `[${path}] retrieved successfully!`,
        data: documents,
      };
      cacheService.setCache(path, response);
      return response;
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async findAllDocsRestricted(path, bypass = []) {
    try {
      const user = this.auth.currentUser;
      const usersResponse = await this.findOneDoc("users", user.uid);
      if (usersResponse.code !== 200) {
        await this.auth.signOut();
        throw new Error("cannot find user in users collection");
      }
      const role = usersResponse.data?.role || "collaborator";
      const documents = [];
      const collectionReference = collection(this.db, path);
      const filter =
        role === "admin" || bypass.includes(path)
          ? orderBy("submittedDate")
          : where("userId", "==", String(user.uid));
      const q = query(collectionReference, filter);
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        const documentData = {
          id: document.id,
          ...document.data(),
          submittedDate: document.data().submittedDate.toDate(),
        };
        documents.push(documentData);
      });
      const response = {
        code: 200,
        message: `[${path}] retrieved successfully!`,
        data: documents,
      };
      return response;
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async findAllDocsByFilter(path, whereFilter = []) {
    try {
      const documents = [];
      const [param, operator, value] = whereFilter;
      const collectionReference = collection(firebaseService.db, path);
      const q = query(collectionReference, where(param, operator, value));
      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((document) => {
        const documentData = {
          id: document.id,
          ...document.data(),
          submittedDate: document.data().submittedDate.toDate(),
        };
        documents.push(documentData);
      });
      return {
        code: 200,
        message: `[${path}] retrieved successfully!`,
        data: documents,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async updateDocById(path, documentId, documentData) {
    try {
      cacheService.clearCache(path);
      const documentReference = doc(this.db, path, documentId);
      const data = {
        ...documentData,
        submittedDate: Timestamp.fromDate(new Date()),
      };
      await updateDoc(documentReference, data);
      const document = {
        ...data,
        submittedDate: data.submittedDate.toDate(),
      };
      return {
        code: 200,
        message: `[${path}] updated successfully!`,
        data: document,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }

  async deleteDocById(path, documentId) {
    try {
      cacheService.clearCache(path);
      const documentReference = doc(this.db, path, documentId);
      await deleteDoc(documentReference);
      return {
        code: 200,
        message: `[${path}] deleted successfully!`,
        data: null,
      };
    } catch (error) {
      return {
        code: error.code || 400,
        message: error.message,
        data: null,
      };
    }
  }
}

export const firebaseService = new FirebaseService();
