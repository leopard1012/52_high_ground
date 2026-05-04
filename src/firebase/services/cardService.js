import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  limit,
  startAfter,
  increment,
} from "firebase/firestore";
import { db } from "../config";

const CARD_COLLECTION = "cards";

/**
 * 새 카드 추가
 * @param {Object} cardData - 카드 데이터 (text, emoji, bg, userId, user, avatar 포함)
 * @returns {string} 생성된 카드 ID
 */
export const createCard = async (cardData) => {
  try {
    const docRef = await addDoc(collection(db, CARD_COLLECTION), {
      ...cardData,
      count: 0,
      prayedBy: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    return docRef.id;
  } catch (e) {
    console.error("카드 추가 실패: ", e);
    throw e;
  }
};

/**
 * 전체 카드 목록 가져오기 (최신순)
 * @returns {Array} 카드 배열
 */
export const getCards = async () => {
  try {
    const q = query(collection(db, CARD_COLLECTION), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("카드 조회 실패: ", e);
    throw e;
  }
};

/**
 * 페이지네이션이 적용된 카드 목록 가져오기
 * @param {number} pageSize - 한 페이지당 카드 수
 * @param {DocumentSnapshot} lastDoc - 마지막 카드 (다음 페이지용)
 * @returns {Object} {cards: Array, lastDoc: DocumentSnapshot}
 */
export const getCardsPaginated = async (pageSize = 10, lastDoc = null) => {
  try {
    let q;
    if (lastDoc) {
      q = query(
        collection(db, CARD_COLLECTION),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(pageSize)
      );
    } else {
      q = query(
        collection(db, CARD_COLLECTION),
        orderBy("createdAt", "desc"),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const cards = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    const newLastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];

    return { cards, lastDoc: newLastDoc };
  } catch (e) {
    console.error("페이지 카드 조회 실패: ", e);
    throw e;
  }
};

/**
 * 특정 카드 조회
 * @param {string} cardId - 카드 ID
 * @returns {Object} 카드 객체
 */
export const getCardById = async (cardId) => {
  try {
    const docRef = doc(db, CARD_COLLECTION, cardId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      console.error("카드를 찾을 수 없음");
      return null;
    }
  } catch (e) {
    console.error("카드 조회 실패: ", e);
    throw e;
  }
};

/**
 * 카드 업데이트
 * @param {string} cardId - 카드 ID
 * @param {Object} updates - 업데이트할 필드
 */
export const updateCard = async (cardId, updates) => {
  try {
    const docRef = doc(db, CARD_COLLECTION, cardId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: new Date(),
    });
  } catch (e) {
    console.error("카드 업데이트 실패: ", e);
    throw e;
  }
};

/**
 * 오늘 날짜 기준 기도 기록 — dailyPrays.{userId} 에 오늘 날짜를 저장
 * 하루가 지나면 저장된 날짜가 달라지므로 자동으로 초기화 효과
 * @param {string} cardId - 카드 ID
 * @param {string} userId - 사용자 ID
 */
export const prayCard = async (cardId, userId) => {
  const today = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
  try {
    const docRef = doc(db, CARD_COLLECTION, cardId);
    await updateDoc(docRef, {
      [`dailyPrays.${userId}`]: today,
      count: increment(1),
      updatedAt: new Date(),
    });
  } catch (e) {
    console.error("기도 저장 실패: ", e);
    throw e;
  }
};

/**
 * 카드 삭제
 * @param {string} cardId - 카드 ID
 */
export const deleteCard = async (cardId) => {
  try {
    const docRef = doc(db, CARD_COLLECTION, cardId);
    await deleteDoc(docRef);
  } catch (e) {
    console.error("카드 삭제 실패: ", e);
    throw e;
  }
};