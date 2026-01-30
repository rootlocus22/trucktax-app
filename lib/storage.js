import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadFile(file, path) {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const downloadURL = await getDownloadURL(storageRef);
  return downloadURL;
}

export async function uploadSchedule1(file, filingId) {
  const path = `filings/${filingId}/schedule1-${Date.now()}.pdf`;
  return await uploadFile(file, path);
}

export async function uploadInputDocument(file, filingId, documentName) {
  const path = `filings/${filingId}/input-docs/${documentName}-${Date.now()}.pdf`;
  return await uploadFile(file, path);
}

