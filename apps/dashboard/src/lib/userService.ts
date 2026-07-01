import {
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  orderBy,
  query,
} from "firebase/firestore";
import { initializeApp, deleteApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { db, app } from "@maxs/services";
import type { UserRecord, Role, ManagerType, PermissionOverrides } from "@maxs/types";

export async function listUsers(): Promise<UserRecord[]> {
  const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as UserRecord);
}

export async function getUserById(uid: string): Promise<UserRecord | null> {
  const snap = await getDoc(doc(db, "users", uid));
  return snap.exists() ? (snap.data() as UserRecord) : null;
}

export async function createUser({
  email,
  firstName,
  middleInitial,
  lastName,
  role,
  managerType,
  createdBy,
}: {
  email: string;
  firstName: string;
  middleInitial?: string;
  lastName: string;
  role: Role;
  managerType?: ManagerType;
  createdBy: string;
}): Promise<string> {
  // Secondary app instance so we don't sign out the current admin.
  const tempApp = initializeApp(app.options, `user-create-${Date.now()}`);
  const tempAuth = getAuth(tempApp);
  const tempPassword = `${Math.random().toString(36).slice(-8)}Aa1!`;

  try {
    const { user } = await createUserWithEmailAndPassword(tempAuth, email, tempPassword);

    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: email.toLowerCase(),
      firstName,
      middleInitial: middleInitial ?? null,
      lastName,
      displayName: `${firstName} ${lastName}`,
      role,
      managerType: managerType ?? null,
      active: true,
      createdBy,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });

    // Let the new user set their own password — admin never sees the temp one.
    await sendPasswordResetEmail(tempAuth, email);

    return user.uid;
  } finally {
    await deleteApp(tempApp);
  }
}

export async function updateUser(
  uid: string,
  data: {
    firstName?: string;
    middleInitial?: string | null;
    lastName?: string;
    role?: Role;
    managerType?: ManagerType | null;
    active?: boolean;
    permissionOverrides?: PermissionOverrides | null;
  }
): Promise<void> {
  const { firstName, lastName } = data;
  const displayName =
    firstName !== undefined && lastName !== undefined
      ? `${firstName} ${lastName}`
      : undefined;

  await updateDoc(doc(db, "users", uid), {
    ...data,
    ...(displayName !== undefined && { displayName }),
    updatedAt: Date.now(),
  });
}
