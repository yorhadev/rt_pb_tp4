import { createUserWithEmailAndPassword } from "firebase/auth";
import { createOrUpdateDoc } from "src/api/db";
import { firebaseService } from "src/services/firebase";

export async function createUser(name, email, password, role = "collaborator") {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      firebaseService.auth,
      email,
      password
    );
    const user = userCredential.user;
    const userDocumentData = { name, email, role };
    const resp = await createOrUpdateDoc("users", [user.uid], userDocumentData);
    if (resp.code !== 200) throw resp.message;
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
