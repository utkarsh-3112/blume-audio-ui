import { initializeApp, getApps } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: process.env.FIREBASE_APIKEY,
    authDomain: "blume-audio-notes.firebaseapp.com",
    projectId: "blume-audio-notes",
    storageBucket: "blume-audio-notes.appspot.com",
    messagingSenderId: "393279748414",
    appId: process.env.FIREBASE_APPID
  };

if (!getApps.length) {
  initializeApp(firebaseConfig);
}

const storage = getStorage();

export { storage };
