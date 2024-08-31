import { doc, setDoc, Timestamp } from "firebase/firestore";
import { firebaseService } from "src/services/firebase";

export async function createOrUpdateDoc(path, pathSegments = [], documentData) {
  try {
    if (!path) throw "Cannot get path";
    if (!Array.isArray(pathSegments)) throw "Cannot get pathSegments";
    if (Object.keys(documentData)?.length < 1) throw "Cannot get data";
    const reference = doc(firebaseService.db, path, ...pathSegments);
    const data = {
      ...documentData,
      submittedDate: Timestamp.fromDate(new Date()),
    };
    await setDoc(reference, data);
    return {
      code: 200,
      message: `[${path}] submitted successfully!`,
      data: data,
    };
  } catch (error) {
    return {
      code: error.code || 400,
      message: error.message,
      data: null,
    };
  }
}
