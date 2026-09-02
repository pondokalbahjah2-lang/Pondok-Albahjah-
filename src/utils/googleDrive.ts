import { auth } from './firebase';
import { GoogleAuthProvider, linkWithPopup, signInWithPopup } from 'firebase/auth';

let cachedAccessToken: string | null = null;

export const connectToGoogleDrive = async (): Promise<string> => {
  const provider = new GoogleAuthProvider();
  provider.addScope('https://www.googleapis.com/auth/drive.file');

  try {
    if (auth.currentUser) {
      // Try to link the current user
      try {
        const result = await linkWithPopup(auth.currentUser, provider);
        const credential = GoogleAuthProvider.credentialFromResult(result);
        if (credential?.accessToken) {
          cachedAccessToken = credential.accessToken;
          return cachedAccessToken;
        }
      } catch (err: any) {
        // If already linked or credential already in use, just sign in with popup to get token
        if (err.code === 'auth/credential-already-in-use' || err.code === 'auth/provider-already-linked') {
          const result = await signInWithPopup(auth, provider);
          const credential = GoogleAuthProvider.credentialFromResult(result);
          if (credential?.accessToken) {
            cachedAccessToken = credential.accessToken;
            return cachedAccessToken;
          }
        }
        throw err;
      }
    } else {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        return cachedAccessToken;
      }
    }
  } catch (error) {
    console.error('Error connecting to Google Drive:', error);
    throw error;
  }
  
  throw new Error('Could not obtain access token');
};

export const uploadPDFToDrive = async (pdfBlob: Blob, filename: string): Promise<string> => {
  if (!cachedAccessToken) {
    cachedAccessToken = await connectToGoogleDrive();
  }

  const metadata = {
    name: filename,
    mimeType: 'application/pdf',
  };

  const form = new FormData();
  form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  form.append('file', pdfBlob);

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
    },
    body: form,
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.error?.message || 'Failed to upload to Google Drive');
  }

  const data = await res.json();
  return data.id; // The Google Drive file ID
};
