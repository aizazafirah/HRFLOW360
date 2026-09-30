import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './error';
import { Employee, ActivityLog } from '../types/hr';

const EMPLOYEES_COLLECTION = 'employees';
const LOGS_COLLECTION = 'activity_logs';

/**
 * Real-time listener for employees collection in Firestore
 */
export function subscribeToEmployees(
  onData: (employees: Employee[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, EMPLOYEES_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      (snapshot) => {
        const records: Employee[] = [];
        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Employee;
          records.push({
            ...data,
            id: docSnap.id,
          });
        });
        onData(records);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, EMPLOYEES_COLLECTION);
        onError?.(error as Error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, EMPLOYEES_COLLECTION);
    return () => {};
  }
}

/**
 * Save single employee document to Firestore
 */
export async function saveEmployeeToFirestore(employee: Employee): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employee.id}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employee.id);
    // Remove undefined values to ensure clean Firestore serialization
    const cleanData = JSON.parse(JSON.stringify(employee));
    await setDoc(docRef, cleanData, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

/**
 * Bulk seed or sync employees to Firestore
 */
export async function bulkSyncEmployeesToFirestore(employees: Employee[]): Promise<void> {
  try {
    const batch = writeBatch(db);
    employees.forEach((emp) => {
      const docRef = doc(db, EMPLOYEES_COLLECTION, emp.id);
      const cleanData = JSON.parse(JSON.stringify(emp));
      batch.set(docRef, cleanData, { merge: true });
    });
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, EMPLOYEES_COLLECTION);
  }
}

/**
 * Delete employee from Firestore
 */
export async function deleteEmployeeFromFirestore(employeeId: string): Promise<void> {
  const path = `${EMPLOYEES_COLLECTION}/${employeeId}`;
  try {
    const docRef = doc(db, EMPLOYEES_COLLECTION, employeeId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

/**
 * Real-time listener for activity audit logs
 */
export function subscribeToActivityLogs(
  onData: (logs: ActivityLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const colRef = collection(db, LOGS_COLLECTION);
    const q = query(colRef, orderBy('timestamp', 'desc'), limit(100));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const records: ActivityLog[] = [];
        snapshot.forEach((docSnap) => {
          records.push(docSnap.data() as ActivityLog);
        });
        onData(records);
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, LOGS_COLLECTION);
        onError?.(error as Error);
      }
    );
    return unsubscribe;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, LOGS_COLLECTION);
    return () => {};
  }
}

/**
 * Add audit log entry to Firestore
 */
export async function addActivityLogToFirestore(log: ActivityLog): Promise<void> {
  const path = `${LOGS_COLLECTION}/${log.id}`;
  try {
    const docRef = doc(db, LOGS_COLLECTION, log.id);
    const cleanData = JSON.parse(JSON.stringify(log));
    await setDoc(docRef, cleanData);
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}
