import { useState } from "react";
import { CHALLENGES, CONCERNS } from "../data/ground-data.js";

export default function ChallengeTab({ seeds, setSeeds }) {
  const [challenges, setChallenges] = useState(CHALLENGES);
  const [concerns, setConcerns] = useState(CONCERNS);
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const handleCheck = (cid, dayIdx) => {
    setChallenges((prev) =>
      prev.map((c) => {
        if (c.id === cid) {
          const done = [...c.done];
          if (!done[dayIdx]) {
            done[dayIdx] = true;
            setSeeds((s) => s + 5);
          }
          return { ...c, done };
        }
        return c;
      })
    );
  };

  const handleReply = (id) => {
    if (!replyText.trim()) return;
    setConcerns((prev) => prev.map((c) => (c.id === id ? { ...c, replied: true } : c)));
    setSeeds((s) => s + 5);
    setReplyId(null);
    setReplyText("");
  };

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>🎯 이번 시즌 미션</div>
      {challenges.map((ch) => (
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
            {ch.done.map((d, i) => (
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
      ))}

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
      {concerns.map((c) => (
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
            <span style={{ fontSize: 12, color: "#94a3b8" }}>익명 · {c.time}</span>
            {c.replied && (
              <span style={{ fontSize: 11, background: "#dcfce7", color: "#16a34a", borderRadius: 99, padding: "2px 8px", fontWeight: 700 }}>
                ✓ 답변완료
              </span>
            )}
          </div>
          <div style={{ fontSize: 14, color: "#334155", lineHeight: 1.5 }}>{c.text}</div>
          {!c.replied &&
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
                    style={{
                      flex: 2,
                      padding: "8px",
                      background: "linear-gradient(135deg, #a78bfa, #7c3aed)",
                      border: "none",
                      borderRadius: 8,
                      color: "white",
                      cursor: "pointer",
                      fontSize: 12,
                      fontWeight: 700,
                      fontFamily: "inherit",
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
      ))}
    </div>
  );
}
