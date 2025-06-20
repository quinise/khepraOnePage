import { Injectable } from '@angular/core';
import { Firestore } from '@angular/fire/firestore';
import { FirebaseAuthHelper } from './firebase-auth-helpers'; // adjust path as needed

@Injectable({ providedIn: 'root' })
export class UserService {
  constructor(private firestore: Firestore) {}

  async getUserRole(uid: string): Promise<string | null> {
    const docRef = FirebaseAuthHelper.doc(this.firestore, 'users', uid); // ✅ use wrapper
    const docSnap = await FirebaseAuthHelper.getDoc(docRef);             // ✅ use wrapper
    return docSnap.exists() ? docSnap.data()['role'] : null;
  }
}