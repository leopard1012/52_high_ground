import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { auth } from "../firebase/config";
import { db } from "../firebase/config";

/**
 * Firebase 인증 상태 + userProfile 실시간 구독 Hook
 * @returns {Object} {user, userProfile, loading, error}
 */
export function useAuth() {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let profileUnsubscribe = null;

    const authUnsubscribe = onAuthStateChanged(auth, (currentUser) => {
      // 이전 프로필 구독 해제
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (currentUser) {
        setUser(currentUser);

        // users/{uid} 실시간 구독 — seeds 등 모든 필드 변경이 즉시 반영됨
        const userRef = doc(db, "users", currentUser.uid);
        profileUnsubscribe = onSnapshot(
          userRef,
          (snap) => {
            setUserProfile(snap.exists() ? snap.data() : null);
            setLoading(false);
          },
          (err) => {
            console.error("프로필 구독 오류:", err);
            setError(err);
            setLoading(false);
          }
        );
      } else {
        setUser(null);
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      authUnsubscribe();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  return {
    user,
    userProfile,
    loading,
    error,
    isAuthenticated: !!user,
  };
}
