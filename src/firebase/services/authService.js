import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../config";

const googleProvider = new GoogleAuthProvider();

/**
 * 이메일/비밀번호 회원가입
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @param {string} nickname - 닉네임
 * @returns {Object} 사용자 객체
 */
export const registerWithEmail = async (email, password, nickname) => {
  try {
    // 로컬 저장소에 자동 로그인 설정
    await setPersistence(auth, browserLocalPersistence);

    const { user } = await createUserWithEmailAndPassword(auth, email, password);

    // 프로필 업데이트 (displayName)
    await updateProfile(user, {
      displayName: nickname,
    });

    // Firestore에 사용자 문서 생성
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email,
      nickname,
      avatar: "😊",
      seeds: 0,
      badges: [],
      createdAt: new Date(),
      stats: {
        prayCount: 0,
        repliesCount: 0,
        challengesCompleted: 0,
        crewJoined: [],
      },
    });

    return user;
  } catch (e) {
    console.error("회원가입 실패:", e);
    throw e;
  }
};

/**
 * 이메일/비밀번호 로그인
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Object} 사용자 객체
 */
export const loginWithEmail = async (email, password) => {
  try {
    // 로컬 저장소에 자동 로그인 설정
    await setPersistence(auth, browserLocalPersistence);

    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (e) {
    console.error("로그인 실패:", e);
    throw e;
  }
};

/**
 * Google OAuth 로그인/회원가입
 * @returns {Object} 사용자 객체
 */
export const loginWithGoogle = async () => {
  try {
    // 로컬 저장소에 자동 로그인 설정
    await setPersistence(auth, browserLocalPersistence);

    const { user } = await signInWithPopup(auth, googleProvider);

    // Firestore에서 사용자 확인
    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    // 신규 사용자인 경우 문서 생성
    if (!userSnap.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        nickname: user.displayName || "User",
        avatar: user.photoURL || "😊",
        seeds: 0,
        badges: [],
        createdAt: new Date(),
        stats: {
          prayCount: 0,
          repliesCount: 0,
          challengesCompleted: 0,
          crewJoined: [],
        },
      });
    }

    return user;
  } catch (e) {
    console.error("Google 로그인 실패:", e);
    throw e;
  }
};

/**
 * 로그아웃
 */
export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.error("로그아웃 실패:", e);
    throw e;
  }
};

/**
 * 사용자 프로필 정보 가져오기
 * @param {string} userId - 사용자 ID
 * @returns {Object} 사용자 프로필
 */
export const getUserProfile = async (userId) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data();
    } else {
      console.error("사용자를 찾을 수 없습니다");
      return null;
    }
  } catch (e) {
    console.error("프로필 조회 실패:", e);
    throw e;
  }
};

/**
 * 사용자 프로필 업데이트
 * @param {string} userId - 사용자 ID
 * @param {Object} updates - 업데이트 데이터
 */
export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = doc(db, "users", userId);
    await setDoc(userRef, updates, { merge: true });
  } catch (e) {
    console.error("프로필 업데이트 실패:", e);
    throw e;
  }
};

/**
 * 사용자 씨앗(포인트) 업데이트
 * @param {string} userId - 사용자 ID
 * @param {number} amount - 증감 값
 */
export const updateUserSeeds = async (userId, amount) => {
  try {
    const userRef = doc(db, "users", userId);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
      throw new Error("사용자를 찾을 수 없습니다");
    }

    const currentSeeds = userSnap.data().seeds || 0;
    const newSeeds = Math.max(0, currentSeeds + amount);

    await setDoc(
      userRef,
      {
        seeds: newSeeds,
        updatedAt: new Date(),
      },
      { merge: true }
    );

    return newSeeds;
  } catch (e) {
    console.error("씨앗 업데이트 실패:", e);
    throw e;
  }
};