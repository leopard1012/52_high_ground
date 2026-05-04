import { useState, useEffect } from "react";
import { collection, query, doc, updateDoc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Firestore challenges 컬렉션을 실시간 구독 + 진행 업데이트 제공
 * @returns {Object} {challenges, loading, error, updateChallengeDay}
 */
export function useChallenges() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "challenges"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setChallenges(data);
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error("챌린지 데이터 매핑 오류:", err);
          setError(err);
        }
      },
      (err) => {
        console.error("챌린지 구독 오류:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * 챌린지 특정 일 체크 — done 배열과 day 카운트를 Firestore에 반영
   * @param {string} challengeId - 챌린지 문서 ID
   * @param {number} dayIndex - 체크할 날 인덱스 (0-based)
   */
  const updateChallengeDay = async (challengeId, dayIndex) => {
    const challenge = challenges.find((c) => c.id === challengeId);
    if (!challenge) throw new Error("챌린지를 찾을 수 없습니다");

    const newDone = [...(challenge.done || [])];
    newDone[dayIndex] = true;

    const challengeRef = doc(db, "challenges", challengeId);
    await updateDoc(challengeRef, {
      done: newDone,
      day: newDone.filter(Boolean).length,
    });
  };

  return { challenges, loading, error, updateChallengeDay };
}
