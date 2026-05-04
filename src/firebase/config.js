import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { connectAuthEmulator } from "firebase/auth";

// 환경변수 또는 기본값 사용 (.env.local에서 로드됨)
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyC8mocrsIglHuFS4E6aCWee-W-zuHyRnAA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "high-ground-4fbbf.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "high-ground-4fbbf",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "high-ground-4fbbf.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "451739802421",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:451739802421:web:892bdf3e4a63c007068a7c"
};

// Firebase 초기화
const app = initializeApp(firebaseConfig);

// 인증(Auth) 및 데이터베이스(Firestore) 객체 초기화
export const auth = getAuth(app);
export const db = getFirestore(app);

// 개발 환경에서 에뮬레이터 사용 (선택사항)
if (import.meta.env.MODE === "development" && import.meta.env.VITE_USE_EMULATOR === "true") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099");
    connectFirestoreEmulator(db, "localhost", 8080);
    console.log("Firebase 에뮬레이터 연결됨");
  } catch (e) {
    console.log("에뮬레이터 연결 실패:", e);
  }
}