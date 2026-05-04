import { useState, useEffect } from "react";
import { collection, query, orderBy, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import { createCard, updateCard, deleteCard, prayCard } from "../firebase/services/cardService";

/**
 * 같은 크루의 카드만 실시간 구독
 * @param {string|null} crewId - 현재 사용자의 크루 ID
 */
export function useCards(crewId) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!crewId) {
      setCards([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "cards"),
      where("crewId", "==", crewId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          setCards(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
          setError(null);
          setLoading(false);
        } catch (err) {
          setError(err);
        }
      },
      (err) => {
        console.error("카드 구독 오류:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [crewId]);

  const addCard = async (cardData) => {
    try {
      return await createCard(cardData);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updateCardData = async (cardId, updates) => {
    try {
      await updateCard(cardId, updates);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const removeCard = async (cardId) => {
    try {
      await deleteCard(cardId);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const pray = async (cardId, userId) => {
    const today = new Date().toISOString().slice(0, 10);
    const card = cards.find((c) => c.id === cardId);
    if (!card) throw new Error("카드를 찾을 수 없습니다");
    if (card.dailyPrays?.[userId] === today) throw new Error("오늘은 이미 기도했습니다");

    try {
      await prayCard(cardId, userId);
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return { cards, loading, error, addCard, updateCardData, removeCard, pray };
}
