import { initializeApp } from "firebase/app";
import {
  createUserWithEmailAndPassword,
  getAuth,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, getFirestore, setDoc, Timestamp } from "firebase/firestore";

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

  async createUser(name, email, password, role = "collaborator") {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        email,
        password
      );
      const user = userCredential.user;
      const userData = { name, email, role };
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

  async createDocById(path, documentId, documentData) {
    try {
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
}

export const firebaseService = new FirebaseService();
