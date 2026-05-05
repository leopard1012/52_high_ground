import { useState, useEffect } from "react";
import { collection, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/config";
import FloatAnim from "./FloatAnim.jsx";
import { useCards } from "../hooks/useCards";
import { useAuth } from "../hooks/useAuth";
import { EMOJIS, BGS } from "../data/ground-data.js";
import { getGradientFromBg } from "../utils/ground-utils.js";
import { updateUserSeeds } from "../firebase/services/authService";

function getDailyVerse(verses) {
  if (!verses.length) return { text: "기도를 계속하고 감사함으로 깨어 있으라", ref: "골로새서 4:2" };
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((now - start) / 86400000);
  return verses[dayOfYear % verses.length];
}

export default function HomeTab({ seeds }) {
  const { user, userProfile } = useAuth();
  const today = new Date().toISOString().slice(0, 10);
  const { cards, loading, error, addCard, removeCard, pray } = useCards(userProfile?.crewId);
  const [verses, setVerses] = useState([]);
  const dailyVerse = getDailyVerse(verses);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "verses"), (s) =>
      setVerses(s.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);
  const [newText, setNewText] = useState("");
  const [newEmoji, setNewEmoji] = useState("🙏");
  const [newBg, setNewBg] = useState("from-green-200 to-teal-300");
  const [sparkId, setSparkId] = useState(null);
  const [floaters, setFloaters] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handlePray = async (cardId) => {
    if (!user) {
      alert("로그인이 필요합니다");
      return;
    }

    try {
      await pray(cardId, user.uid);

      // 애니메이션
      setSparkId(cardId);
      setTimeout(() => setSparkId(null), 700);

      // 씨앗 증가 — useAuth onSnapshot이 자동으로 UI 갱신
      await updateUserSeeds(user.uid, 2);

      // 플로터 애니메이션
      const fid = Date.now();
      setFloaters((f) => [...f, { id: fid, cardId }]);
      setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 1000);
    } catch (err) {
      alert("기도 저장 실패: " + err.message);
    }
  };

  const handleDelete = async (cardId) => {
    if (!window.confirm("이 기도 카드를 삭제하시겠습니까?")) return;
    try {
      await removeCard(cardId);
    } catch (err) {
      alert("삭제 실패: " + err.message);
    }
  };

  const handleAdd = async () => {
    if (!newText.trim()) {
      alert("내용을 입력해주세요");
      return;
    }

    if (!user || !userProfile) {
      alert("로그인이 필요합니다");
      return;
    }

    setIsSubmitting(true);

    try {
      // Firebase에 카드 추가
      await addCard({
        crewId: userProfile.crewId,
        userId: user.uid,
        user: userProfile.nickname,
        avatar: userProfile.avatar,
        text: newText,
        emoji: newEmoji,
        bg: newBg,
      });

      // 씨앗 증가 — useAuth onSnapshot이 자동으로 UI 갱신
      await updateUserSeeds(user.uid, 10);

      // 폼 초기화
      setNewText("");
      setShowForm(false);
    } catch (err) {
      alert("카드 추가 실패: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)",
          borderRadius: 20,
          padding: "18px 20px",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 8px 24px rgba(59,130,246,0.25)",
        }}
      >
        <div>
          <div style={{ color: "white", fontSize: 13, opacity: 0.85, fontFamily: "inherit" }}>
            오늘의 말씀
          </div>
          <div style={{ color: "white", fontSize: 15, fontWeight: 700, marginTop: 4, lineHeight: 1.4 }}>
            "{dailyVerse.text}"
            <br />
            <span style={{ fontSize: 12, opacity: 0.8 }}>— {dailyVerse.ref}</span>
          </div>
        </div>
        <div style={{ fontSize: 40 }}>🌿</div>
      </div>

      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          width: "100%",
          padding: "14px",
          borderRadius: 14,
          background: showForm ? "#f1f5f9" : "white",
          border: "2px dashed #93c5fd",
          cursor: "pointer",
          color: "#3b82f6",
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 16,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          fontFamily: "inherit",
          transition: "all 0.2s",
        }}
      >
        {showForm ? "✕ 닫기" : "✏️ 오늘의 기도 카드 작성하기"}
      </button>

      {showForm && (
        <div
          style={{
            background: "white",
            borderRadius: 16,
            padding: 16,
            marginBottom: 16,
            boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
          }}
        >
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              배경 색상
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {BGS.map((bg) => (
                <div
                  key={bg}
                  onClick={() => setNewBg(bg)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    backgroundImage: `linear-gradient(135deg, ${getGradientFromBg(bg)})`,
                    border: newBg === bg ? "3px solid #3b82f6" : "2px solid transparent",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, color: "#64748b", marginBottom: 6, fontWeight: 600 }}>
              감정 스티커
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {EMOJIS.map((e) => (
                <span
                  key={e}
                  onClick={() => setNewEmoji(e)}
                  style={{
                    fontSize: 24,
                    cursor: "pointer",
                    background: newEmoji === e ? "#eff6ff" : "transparent",
                    borderRadius: 8,
                    padding: 4,
                    border: newEmoji === e ? "2px solid #3b82f6" : "2px solid transparent",
                  }}
                >
                  {e}
                </span>
              ))}
            </div>
          </div>

          <textarea
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            maxLength={50}
            placeholder="오늘의 기도 제목을 적어주세요 (최대 50자)"
            style={{
              width: "100%",
              minHeight: 70,
              border: "1.5px solid #e2e8f0",
              borderRadius: 10,
              padding: 10,
              fontSize: 14,
              fontFamily: "inherit",
              resize: "none",
              outline: "none",
              boxSizing: "border-box",
              color: "#1e293b",
            }}
          />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
            <span style={{ fontSize: 12, color: "#94a3b8" }}>{newText.length}/50</span>
            <button
              onClick={handleAdd}
              style={{
                background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
                color: "white",
                border: "none",
                borderRadius: 10,
                padding: "8px 20px",
                fontWeight: 700,
                cursor: "pointer",
                fontSize: 13,
                fontFamily: "inherit",
              }}
            >
              작성하기 (+10 🌱)
            </button>
          </div>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            🔄 카드 로딩 중...
          </div>
        ) : error ? (
          <div
            style={{
              padding: 16,
              background: "#fee2e2",
              borderRadius: 12,
              color: "#c2410c",
              fontSize: 14,
            }}
          >
            ❌ 카드 로드 실패: {error.message}
          </div>
        ) : cards.length === 0 ? (
          <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>
            <div style={{ fontSize: 32, marginBottom: 10 }}>📝</div>
            <div>첫 번째 기도 카드를 작성해보세요!</div>
          </div>
        ) : (
          cards.map((card, i) => (
            <FloatAnim key={card.id} delay={i * 0.05}>
              <div
                style={{
                  background: `linear-gradient(135deg, ${getGradientFromBg(card.bg)})`,
                  borderRadius: 18,
                  padding: "16px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        background: "rgba(255,255,255,0.7)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                      }}
                    >
                      {card.avatar}
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{card.user}</div>
                      <div style={{ fontSize: 11, color: "#64748b" }}>방금 전</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 26 }}>{card.emoji}</span>
                    {card.userId === user?.uid && (
                      <button
                        onClick={() => handleDelete(card.id)}
                        style={{
                          background: "rgba(255,255,255,0.55)",
                          border: "none",
                          borderRadius: 8,
                          width: 28,
                          height: 28,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          fontSize: 14,
                          color: "#ef4444",
                          flexShrink: 0,
                        }}
                        title="기도 카드 삭제"
                      >
                        🗑
                      </button>
                    )}
                  </div>
                </div>
                <div
                  style={{
                    marginTop: 10,
                    fontSize: 15,
                    fontWeight: 600,
                    color: "#1e293b",
                    lineHeight: 1.5,
                  }}
                >
                  "{card.text}"
                </div>
                <div style={{ marginTop: 12, display: "flex", justifyContent: "flex-end", position: "relative" }}>
                  {floaters
                    .filter((f) => f.cardId === card.id)
                    .map((f) => (
                      <div
                        key={f.id}
                        style={{
                          position: "absolute",
                          right: 60,
                          bottom: 30,
                          color: "#16a34a",
                          fontWeight: 800,
                          fontSize: 14,
                          animation: "floatSeed 1s ease forwards",
                          pointerEvents: "none",
                        }}
                      >
                        +2 🌱
                      </div>
                    ))}
                  {(() => {
                    const hasPrayedToday = card.dailyPrays?.[user?.uid] === today;
                    return (
                      <button
                        onClick={() => !hasPrayedToday && handlePray(card.id)}
                        style={{
                          background: hasPrayedToday ? "rgba(255,255,255,0.9)" : "white",
                          border: "none",
                          borderRadius: 20,
                          padding: "7px 14px",
                          cursor: hasPrayedToday ? "default" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                          fontWeight: 700,
                          fontSize: 13,
                          fontFamily: "inherit",
                          color: hasPrayedToday ? "#16a34a" : "#3b82f6",
                          boxShadow: sparkId === card.id ? "0 0 0 4px rgba(99,102,241,0.3)" : "none",
                          transition: "all 0.2s",
                          transform: sparkId === card.id ? "scale(1.1)" : "scale(1)",
                        }}
                      >
                        {hasPrayedToday ? "✓ 기도했어요" : "🙏 함께 기도하기"} · {card.count}
                      </button>
                    );
                  })()}
                </div>
              </div>
            </FloatAnim>
          ))
        )}
      </div>
    </div>
  );
}
