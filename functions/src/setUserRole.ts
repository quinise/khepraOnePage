import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

admin.initializeApp();

export const setUserRole = functions.auth.user().onCreate(async (user) => {
  try {
    const role = user.email === "devin.ercolano@gmail.com" ? "admin" : "user";

    await admin.firestore().collection("users").doc(user.uid).set({
      email: user.email,
      role: role,
    });

    console.log(`User role set to '${role}' for user: ${user.uid}`);
  } catch (error) {
    console.error("Error setting user role:", error);
  }
});
