// admin.guard.ts
import { Injectable } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@angular/fire/auth';
import { Firestore, doc, getDoc } from '@angular/fire/firestore';
import { Router } from '@angular/router';

export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(Auth);
  const firestore = inject(Firestore);
  const router = inject(Router);

  const user = auth.currentUser;
  if (!user) {
    router.navigate(['/']);
    return false;
  }

  const userRef = doc(firestore, 'users', user.uid);
  const userSnap = await getDoc(userRef);
  const role = userSnap.exists() ? userSnap.data()['role'] : null;

  if (role === 'user' || role === 'admin') {
    return true;
  } else {
    // TODO: Create an "Unauthorized" component
    router.navigate(['/unauthorized']);
    return false;
  }
};
