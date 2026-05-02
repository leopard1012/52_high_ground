import { useState, useEffect, useRef } from "react";
import { CREW } from "../data/ground-data.js";

export default function CrewTab() {
  const [messages, setMessages] = useState([
    { id: 1, user: "하늘이", text: "오늘 기도 모임 7시 맞죠?", time: "오전 9:12" },
    { id: 2, user: "은혜", text: "넵! 줌 링크 공유해드릴게요 🙏", time: "오전 9:13" },
    { id: 3, user: "다윗", text: "감사합니다 기다릴게요", time: "오전 9:15" },
  ]);
  const [input, setInput] = useState("");
  const chatRef = useRef(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages((m) => [...m, { id: Date.now(), user: "나", text: input, time: "방금" }]);
    setInput("");
  };

  useEffect(() => {
    if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
  }, [messages]);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>🏆 이번 주 크루 랭킹</div>
        {CREW.map((c, i) => (
          <div
            key={c.name}
            style={{
              background: i === 0 ? "linear-gradient(135deg, #fde68a, #fbbf24)" : "white",
              borderRadius: 12,
              padding: "12px 14px",
              marginBottom: 8,
              display: "flex",
              alignItems: "center",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              gap: 12,
            }}
          >
            <div
              style={{
                width: 30,
                height: 30,
                borderRadius: "50%",
                background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "#e2e8f0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: "white",
              }}
            >
              {c.rank}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{c.name}</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>🌱 {c.seed} Seeds</div>
            </div>
            {i === 0 && <span style={{ fontSize: 20 }}>👑</span>}
          </div>
        ))}
      </div>

      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>💬 기도 모임 채팅</div>
      <div
        ref={chatRef}
        style={{
          background: "#f8fafc",
          borderRadius: 16,
          padding: 12,
          height: 200,
          overflowY: "auto",
          marginBottom: 10,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        {messages.map((m) => (
          <div
            key={m.id}
            style={{
              display: "flex",
              flexDirection: m.user === "나" ? "row-reverse" : "row",
              alignItems: "flex-end",
              gap: 6,
            }}
          >
            {m.user !== "나" && (
              <div
                style={{
                  width: 26,
                  height: 26,
                  borderRadius: "50%",
                  background: "#e2e8f0",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "#64748b",
                }}
              >
                {m.user[0]}
              </div>
            )}
            <div
              style={{
                background: m.user === "나" ? "linear-gradient(135deg, #6ee7b7, #3b82f6)" : "white",
                color: m.user === "나" ? "white" : "#1e293b",
                borderRadius: m.user === "나" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                padding: "7px 12px",
                maxWidth: "75%",
                fontSize: 13,
                boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              }}
            >
              {m.user !== "나" && (
                <div style={{ fontSize: 10, fontWeight: 700, marginBottom: 2, opacity: 0.6 }}>{m.user}</div>
              )}
              {m.text}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="메시지 입력..."
          style={{
            flex: 1,
            border: "1.5px solid #e2e8f0",
            borderRadius: 10,
            padding: "10px 12px",
            fontSize: 13,
            fontFamily: "inherit",
            outline: "none",
            background: "white",
            color: "#1e293b",
          }}
        />
        <button
          onClick={send}
          style={{
            background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "10px 16px",
            cursor: "pointer",
            fontWeight: 700,
            fontSize: 13,
            fontFamily: "inherit",
          }}
        >
          전송
        </button>
      </div>
    </div>
  );
}
