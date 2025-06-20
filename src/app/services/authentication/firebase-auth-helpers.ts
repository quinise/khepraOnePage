import {
  Auth,
  AuthCredential,
  AuthProvider,
  EmailAuthProvider,
  User,
  UserCredential,
  createUserWithEmailAndPassword,
  deleteUser as fbDeleteUser,
  reauthenticateWithCredential as fbReauthWithCredential,
  reauthenticateWithPopup as fbReauthWithPopup,
  sendPasswordResetEmail as fbSendPasswordResetEmail,
  signInWithPopup as fbSignInWithPopup,
  signOut as fbSignOut,
  updatePassword as fbUpdatePassword,
  verifyBeforeUpdateEmail as fbVerifyBeforeUpdateEmail,
  signInWithEmailAndPassword
} from 'firebase/auth';

import {
  DocumentData,
  DocumentReference,
  DocumentSnapshot,
  Firestore,
  QueryDocumentSnapshot,
  doc as fbDoc,
  getDoc as fbGetDoc,
  setDoc as fbSetDoc
} from 'firebase/firestore';

export const FirebaseAuthHelper = {
  createUserWithEmailAndPassword: (auth: Auth, email: string, password: string): Promise<UserCredential> =>
    createUserWithEmailAndPassword(auth, email, password),

  signInWithEmailAndPassword: (auth: Auth, email: string, password: string): Promise<UserCredential> =>
    signInWithEmailAndPassword(auth, email, password),

  signInWithPopup: (auth: Auth, provider: AuthProvider): Promise<UserCredential> =>
    fbSignInWithPopup(auth, provider),

  signOut: (auth: Auth): Promise<void> =>
    fbSignOut(auth),

  sendPasswordResetEmail: (auth: Auth, email: string): Promise<void> =>
    fbSendPasswordResetEmail(auth, email),

  reauthenticateWithPopup(user: User, provider: AuthProvider): Promise<UserCredential> {
    return fbReauthWithPopup(user, provider);
  },

  reauthenticateWithCredential(user: User, credential: AuthCredential): Promise<UserCredential> {
    return fbReauthWithCredential(user, credential);
  },

  reauthenticateWithPassword: (user: User, currentPassword: string): Promise<UserCredential> => {
    const credential = EmailAuthProvider.credential(user.email!, currentPassword);
    return fbReauthWithCredential(user, credential);
  },

  updatePassword: (user: User, newPassword: string): Promise<void> =>
    fbUpdatePassword(user, newPassword),

  verifyBeforeUpdateEmail: (user: User, newEmail: string): Promise<void> =>
    fbVerifyBeforeUpdateEmail(user, newEmail),

  deleteUser: (user: User): Promise<void> =>
    fbDeleteUser(user),

  doc: (firestore: Firestore, path: string, id: string): DocumentReference<DocumentData> =>
    fbDoc(firestore, path, id),

  getDoc: (ref: DocumentReference<DocumentData>) =>
    fbGetDoc(ref),

  setDoc: (ref: DocumentReference<DocumentData>, data: any, options?: any) =>
    fbSetDoc(ref, data, options),
};

// Exporting for test mocks
export {
  DocumentData, DocumentReference, DocumentSnapshot, QueryDocumentSnapshot
};

