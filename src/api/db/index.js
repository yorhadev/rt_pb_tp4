import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  setDoc,
  Timestamp,
  updateDoc,
  where,
} from "firebase/firestore";
import { firebaseService } from "src/services/firebase";

export async function createDoc(path, documentData) {
  try {
    const collectionReference = collection(firebaseService.db, path);
    const data = {
      ...documentData,
      submittedDate: Timestamp.fromDate(new Date()),
    };
    await addDoc(collectionReference, data);
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
      data: {},
    };
  }
}

export async function createDocById(path, documentId, documentData) {
  try {
    const documentReference = doc(firebaseService.db, path, documentId);
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
      data: {},
    };
  }
}

export async function findAllDocs(path) {
  try {
    const documents = [];
    const collectionReference = collection(firebaseService.db, path);
    const q = query(collectionReference.get(), orderBy("submittedDate"));
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
      data: [],
    };
  }
}

export async function findAllDocsByFilter(path, whereFilter = []) {
  try {
    const documents = [];
    const [param, operator, value] = whereFilter;
    const collectionReference = collection(firebaseService.db, path);
    const q = value
      ? query(collectionReference, where(param, operator, value))
      : query(collectionReference, orderBy("submittedDate"));
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
      data: [],
    };
  }
}

export async function updateDocById(path, documentId, documentData) {
  try {
    const documentReference = doc(firebaseService.db, path, documentId);
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
      data: {},
    };
  }
}

export async function deleteDocById(path, documentId) {
  try {
    const documentReference = doc(firebaseService.db, path, documentId);
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
