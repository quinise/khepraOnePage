import { TestBed } from '@angular/core/testing';
import { UserService } from './user.service';
import { Firestore } from '@angular/fire/firestore';
import {
  FirebaseAuthHelper,
  QueryDocumentSnapshot,
  DocumentReference,
  DocumentData,
  DocumentSnapshot
} from '../../services/authentication/firebase-auth-helpers';

function createMockDocumentSnapshot(
  data: DocumentData | null,
  exists: boolean
): DocumentSnapshot<DocumentData> {
  return {
    exists: () => exists,
    data: () => data,
    metadata: {} as any,
    get: (field: string) => (data ? data[field] : undefined),
    id: 'mock-id',
    ref: {} as any
  } as unknown as DocumentSnapshot<DocumentData>;
}

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        UserService,
        { provide: Firestore, useValue: {} }
      ]
    });

    service = TestBed.inject(UserService);
  });

  it('should return the user role if document exists', async () => {
    const uid = 'user123';

    const mockDocRef = {} as DocumentReference;

    spyOn(FirebaseAuthHelper, 'doc').and.callFake(() => mockDocRef);

    const mockDocSnap: Partial<QueryDocumentSnapshot> = {
      exists: function (): this is QueryDocumentSnapshot {
        return true;
      },
      data: () => ({ role: 'admin' }),
      metadata: {} as any,
      get: () => undefined,
      id: 'abc123',
      ref: {} as any,
    };

    spyOn(FirebaseAuthHelper, 'getDoc').and.returnValue(Promise.resolve(mockDocSnap as QueryDocumentSnapshot));

    const role = await service.getUserRole(uid);

    expect(role).toBe('admin');
  });

  it('should return null if document does not exist', async () => {
    const uid = 'nonexistent';

    const mockDocRef = {} as DocumentReference;

    spyOn(FirebaseAuthHelper, 'doc').and.callFake(() => mockDocRef);

    const mockDocSnap = createMockDocumentSnapshot(null, false);

    spyOn(FirebaseAuthHelper, 'getDoc').and.returnValue(Promise.resolve(mockDocSnap));

    const result = await service.getUserRole(uid);
    expect(result).toBeNull();
  });
});