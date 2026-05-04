import { useState, useEffect } from "react";
import { collection, query, onSnapshot, addDoc, updateDoc, doc, arrayUnion } from "firebase/firestore";
import { db } from "../firebase/config";

/**
 * Firestore concerns 컬렉션을 실시간 구독
 * @returns {Object} {concerns, loading, error, addConcern, addReply}
 */
export function useConcerns() {
  const [concerns, setConcerns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const q = query(collection(db, "concerns"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setConcerns(
            data.sort((a, b) => {
              const tA = a.createdAt?.toMillis?.() ?? 0;
              const tB = b.createdAt?.toMillis?.() ?? 0;
              return tB - tA;
            })
          );
          setError(null);
          setLoading(false);
        } catch (err) {
          console.error("고민 데이터 매핑 오류:", err);
          setError(err);
        }
      },
      (err) => {
        console.error("고민 구독 오류:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  /**
   * 새 고민 추가
   * @param {Object} concernData - 고민 데이터
   */
  const addConcern = async (concernData) => {
    try {
      await addDoc(collection(db, "concerns"), {
        ...concernData,
        replies: [],
        createdAt: new Date(),
      });
    } catch (err) {
      console.error("고민 추가 실패:", err);
      throw err;
    }
  };

  /**
   * 고민에 답변 추가
   * @param {string} concernId - 고민 ID
   * @param {Object} reply - 답변 데이터
   */
  const addReply = async (concernId, reply) => {
    try {
      const concernRef = doc(db, "concerns", concernId);
      await updateDoc(concernRef, {
        replies: arrayUnion({
          ...reply,
          createdAt: new Date(),
        }),
      });
    } catch (err) {
      console.error("답변 추가 실패:", err);
      throw err;
    }
  };

  return { concerns, loading, error, addConcern, addReply };
}
