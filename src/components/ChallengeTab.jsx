import { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useChallenges } from "../hooks/useChallenges";
import { useConcerns } from "../hooks/useConcerns";
import { updateUserSeeds } from "../firebase/services/authService";

function formatTime(createdAt) {
  if (!createdAt) return "";
  const date = createdAt.toDate ? createdAt.toDate() : new Date(createdAt);
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 60) return "방금";
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
  return `${Math.floor(diff / 86400)}일 전`;
}

export default function ChallengeTab({ seeds }) {
  const { user, userProfile } = useAuth();
  const { challenges, loading: chalLoading, error: chalError, updateChallengeDay } = useChallenges();
  const { concerns, loading: concLoading, error: concError, addReply } = useConcerns();
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheck = async (challengeId, dayIdx) => {
    if (!user) {
      alert("로그인이 필요합니다");
      return;
    }

    try {
      // Firestore done 배열 + day 카운트 업데이트
      await updateChallengeDay(challengeId, dayIdx);
      // 씨앗 증가
      await updateUserSeeds(user.uid, 5);
      alert("완료! 🌱 +5 획득");
    } catch (err) {
      alert("업데이트 실패: " + err.message);
    }
  };

  const handleReply = async (concernId) => {
    if (!replyText.trim()) {
      alert("답변을 입력해주세요");
      return;
    }

    if (!user || !userProfile) {
      alert("로그인이 필요합니다");
      return;
    }

    setIsSubmitting(true);

    try {
      await addReply(concernId, {
        userId: user.uid,
        user: userProfile.nickname,
        text: replyText,
      });

      await updateUserSeeds(user.uid, 5);

      setReplyId(null);
      setReplyText("");
      alert("답변 등록! 🌱 +5 획득");
    } catch (err) {
      alert("답변 등록 실패: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>🎯 이번 시즌 미션</div>

      {chalLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>🔄 로딩 중...</div>
      ) : chalError ? (
        <div style={{ padding: 16, background: "#fee2e2", borderRadius: 12, color: "#c2410c", fontSize: 14 }}>
          ❌ 챌린지 로드 실패: {chalError.message}
        </div>
      ) : challenges.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>진행 중인 챌린지가 없습니다</div>
      ) : (
        challenges.map((ch) => (
          <div
            key={ch.id}
            style={{
              background: "white",
              borderRadius: 16,
              padding: 16,
              marginBottom: 12,
              boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 22 }}>{ch.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{ch.title}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>완료 시 +{ch.reward} 🌱</div>
                </div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#3b82f6" }}>{ch.day}/{ch.total}일</div>
            </div>
            <div style={{ background: "#f1f5f9", borderRadius: 99, height: 6, marginBottom: 10, overflow: "hidden" }}>
              <div
                style={{
                  background: "linear-gradient(90deg, #6ee7b7, #3b82f6)",
                  width: `${(ch.day / ch.total) * 100}%`,
                  height: "100%",
                  borderRadius: 99,
                  transition: "width 0.5s",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {(ch.done || []).map((d, i) => (
                <div
                  key={i}
                  onClick={() => !d && handleCheck(ch.id, i)}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: d ? "linear-gradient(135deg, #6ee7b7, #3b82f6)" : "#f1f5f9",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: d ? 16 : 12,
                    color: d ? "white" : "#94a3b8",
                    cursor: d ? "default" : "pointer",
                    transition: "all 0.2s",
                    fontWeight: 700,
                  }}
                >
                  {d ? "✓" : i + 1}
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12, marginTop: 8 }}>
        🌉 브릿지 — 익명 고민 상담소
      </div>
      <div
        style={{
          background: "linear-gradient(135deg, #ede9fe, #ddd6fe)",
          borderRadius: 14,
          padding: "12px 14px",
          marginBottom: 12,
          fontSize: 12,
          color: "#5b21b6",
          lineHeight: 1.6,
        }}
      >
        💜 비신자 친구들이 가입 없이 고민을 올릴 수 있어요.
        <br />
        따뜻한 답변을 전달해주세요!
      </div>

      {concLoading ? (
        <div style={{ textAlign: "center", padding: 40, color: "#94a3b8" }}>🔄 로딩 중...</div>
      ) : concError ? (
        <div style={{ padding: 16, background: "#fee2e2", borderRadius: 12, color: "#c2410c", fontSize: 14 }}>
          ❌ 고민 로드 실패: {concError.message}
        </div>
      ) : (
        concerns.map((c) => {
          const replied = (c.replies?.length ?? 0) > 0;
          return (
            <div
              key={c.id}
              style={{
                background: "white",
                borderRadius: 14,
                padding: 14,
                marginBottom: 10,
                boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>익명 · {formatTime(c.createdAt)}</span>
                {replied && (
                  <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                    ✓ 답변완료
                  </span>
                )}
              </div>
              <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{c.text}</div>
              {!replied &&
                (replyId === c.id ? (
                  <div style={{ marginTop: 10 }}>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="따뜻한 위로 메시지를 적어주세요..."
                      style={{
                        width: "100%",
                        minHeight: 60,
                        border: "1.5px solid #e2e8f0",
                        borderRadius: 10,
                        padding: 10,
                        fontSize: 13,
                        fontFamily: "inherit",
                        resize: "none",
                        outline: "none",
                        color: "#1e293b",
                        boxSizing: "border-box",
                      }}
                    />
                    <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                      <button
                        onClick={() => setReplyId(null)}
                        style={{
                          flex: 1,
                          padding: "8px",
                          border: "1.5px solid #e2e8f0",
                          borderRadius: 8,
                          background: "white",
                          cursor: "pointer",
                          fontSize: 12,
                          fontFamily: "inherit",
                          color: "#64748b",
                        }}
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleReply(c.id)}
                        disabled={isSubmitting}
                        style={{
                          flex: 2,
                          padding: "8px",
                          background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                          border: "none",
                          borderRadius: 8,
                          color: "white",
                          cursor: isSubmitting ? "not-allowed" : "pointer",
                          fontSize: 12,
                          fontWeight: 700,
                          fontFamily: "inherit",
                          opacity: isSubmitting ? 0.7 : 1,
                        }}
                      >
                        💌 전달하기 (+5 🌱)
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setReplyId(c.id)}
                    style={{
                      marginTop: 10,
                      background: "#f5f3ff",
                      border: "1.5px solid #ddd6fe",
                      borderRadius: 8,
                      padding: "7px 14px",
                      cursor: "pointer",
                      fontSize: 12,
                      color: "#7c3aed",
                      fontWeight: 700,
                      fontFamily: "inherit",
                    }}
                  >
                    💜 위로 전하기
                  </button>
                ))}
            </div>
          );
        })
      )}
    </div>
  );
}
