import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { firebaseService } from "src/services/firebase";
import { createDocById } from "../db";

export async function createUser(name, email, password, role = "collaborator") {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseService.auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDocumentData = { name, email, role };
    const response = await createDocById("users", user.uid, userDocumentData);
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

export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      firebaseService.auth,
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

export async function signOut() {
  try {
    await firebaseService.auth.signOut();
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
