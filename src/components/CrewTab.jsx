import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

export default function CrewTab() {
  const { userProfile } = useAuth();
  const [crews, setCrews] = useState([]);
  const [crewMembers, setCrewMembers] = useState([]);
  const [weeklyCards, setWeeklyCards] = useState([]);

  // 전체 크루 랭킹 구독
  useEffect(() => {
    const q = query(collection(db, "crews"), orderBy("seeds", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setCrews(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    });
    return () => unsub();
  }, []);

  const myCrew = crews.find((c) => c.id === userProfile?.crewId);

  // 크루원 프로필 로드
  useEffect(() => {
    if (!myCrew?.members?.length) { setCrewMembers([]); return; }
    Promise.all(myCrew.members.map((uid) => getDoc(doc(db, "users", uid)))).then(
      (snaps) => setCrewMembers(snaps.filter((s) => s.exists()).map((s) => ({ id: s.id, ...s.data() })))
    );
  }, [myCrew?.id, JSON.stringify(myCrew?.members)]);

  // 이번 주 기도 카드 구독
  useEffect(() => {
    if (!userProfile?.crewId) return;
    const q = query(
      collection(db, "cards"),
      where("crewId", "==", userProfile.crewId),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const all = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setWeeklyCards(
        all.filter((c) => {
          const t = c.createdAt?.toDate?.() ?? new Date(c.createdAt);
          return t >= weekAgo;
        })
      );
    });
    return () => unsub();
  }, [userProfile?.crewId]);

  // 씨드 기준 크루원 정렬
  const sortedMembers = [...crewMembers].sort((a, b) => (b.seeds || 0) - (a.seeds || 0));

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* 내 크루 배너 */}
      {myCrew && (
        <div
          style={{
            background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)",
            borderRadius: 16,
            padding: "14px 16px",
            marginBottom: 20,
            color: "white",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: "0 4px 16px rgba(59,130,246,0.25)",
          }}
        >
          <div>
            <div style={{ fontSize: 12, opacity: 0.85, marginBottom: 2 }}>내 소속 크루</div>
            <div style={{ fontWeight: 800, fontSize: 17 }}>{myCrew.name}</div>
            <div style={{ fontSize: 12, opacity: 0.85, marginTop: 2 }}>
              👥 {myCrew.members?.length || 0}명 &nbsp;·&nbsp; 🌱 {myCrew.seeds} Seeds
            </div>
          </div>
          {userProfile?.isCaptain && (
            <div
              style={{
                background: "rgba(255,255,255,0.25)",
                borderRadius: 20,
                padding: "4px 12px",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              👑 크루장
            </div>
          )}
        </div>
      )}

      {/* 전체 크루 랭킹 */}
      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12 }}>🏆 크루 랭킹</div>
      {crews.length === 0 ? (
        <div style={{ textAlign: "center", padding: 30, color: "#94a3b8" }}>크루 정보 없음</div>
      ) : (
        crews.map((c, i) => {
          const isMy = c.id === userProfile?.crewId;
          return (
            <div
              key={c.id}
              style={{
                background: i === 0 ? "linear-gradient(135deg, #fde68a, #fbbf24)" : isMy ? "#eff6ff" : "white",
                borderRadius: 12,
                padding: "12px 14px",
                marginBottom: 8,
                display: "flex",
                alignItems: "center",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                gap: 12,
                border: isMy ? "1.5px solid #3b82f6" : "none",
              }}
            >
              <div
                style={{
                  width: 30, height: 30, borderRadius: "50%",
                  background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : i === 2 ? "#cd7c2f" : "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 800, fontSize: 13, color: "white", flexShrink: 0,
                }}
              >
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", display: "flex", alignItems: "center", gap: 6 }}>
                  {c.name}
                  {isMy && <span style={{ fontSize: 10, color: "#3b82f6", fontWeight: 700 }}>내 크루</span>}
                </div>
                <div style={{ fontSize: 11, color: "#64748b" }}>
                  🌱 {c.seeds} Seeds &nbsp;·&nbsp; 👥 {c.members?.length || 0}명
                </div>
              </div>
              {i === 0 && <span style={{ fontSize: 20 }}>👑</span>}
            </div>
          );
        })
      )}

      {/* 크루원 현황판 */}
      {myCrew && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12, marginTop: 24 }}>
            👥 크루원 현황
          </div>
          <div style={{ background: "white", borderRadius: 16, padding: "8px 0", boxShadow: "0 2px 12px rgba(0,0,0,0.06)", marginBottom: 20 }}>
            {sortedMembers.length === 0 ? (
              <div style={{ textAlign: "center", padding: 20, color: "#94a3b8", fontSize: 13 }}>로딩 중...</div>
            ) : (
              sortedMembers.map((member, idx) => {
                const isMe = member.id === userProfile?.uid || member.nickname === userProfile?.nickname;
                return (
                  <div
                    key={member.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      padding: "10px 16px",
                      borderBottom: idx < sortedMembers.length - 1 ? "1px solid #f1f5f9" : "none",
                      background: isMe ? "#f0fdf4" : "transparent",
                    }}
                  >
                    {/* 순위 */}
                    <div
                      style={{
                        width: 22, height: 22, borderRadius: "50%",
                        background: idx === 0 ? "#f59e0b" : "#e2e8f0",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, fontWeight: 800,
                        color: idx === 0 ? "white" : "#94a3b8",
                        marginRight: 10, flexShrink: 0,
                      }}
                    >
                      {idx + 1}
                    </div>
                    {/* 아바타 */}
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: "50%",
                        background: "linear-gradient(135deg, #e0f2fe, #bfdbfe)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 20, marginRight: 10, flexShrink: 0,
                      }}
                    >
                      {member.avatar}
                    </div>
                    {/* 이름 + 역할 */}
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>
                          {member.nickname}
                        </span>
                        {member.isCaptain && (
                          <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 6, padding: "1px 6px", fontWeight: 700 }}>
                            👑 크루장
                          </span>
                        )}
                        {isMe && (
                          <span style={{ fontSize: 10, background: "#eff6ff", color: "#3b82f6", borderRadius: 6, padding: "1px 6px", fontWeight: 700 }}>
                            나
                          </span>
                        )}
                      </div>
                    </div>
                    {/* 씨드 */}
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a" }}>
                      🌱 {member.seeds || 0}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </>
      )}

      {/* 이번 주 기도 카드 미리보기 */}
      {myCrew && (
        <>
          <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b", marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
            🗓 이번 주 기도 카드
            {weeklyCards.length > 0 && (
              <span
                style={{
                  background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
                  color: "white", borderRadius: 99,
                  fontSize: 11, fontWeight: 700,
                  padding: "2px 8px",
                }}
              >
                {weeklyCards.length}
              </span>
            )}
          </div>
          <div style={{ background: "white", borderRadius: 16, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {weeklyCards.length === 0 ? (
              <div style={{ textAlign: "center", padding: "28px 16px", color: "#94a3b8" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>🙏</div>
                <div style={{ fontSize: 13 }}>이번 주 작성된 기도 카드가 없어요</div>
              </div>
            ) : (
              weeklyCards.map((card, idx) => (
                <div
                  key={card.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 16px",
                    borderBottom: idx < weeklyCards.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  {/* 이모지 */}
                  <div
                    style={{
                      width: 38, height: 38, borderRadius: 10, flexShrink: 0,
                      background: "linear-gradient(135deg, #f0fdf4, #dcfce7)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {card.emoji}
                  </div>
                  {/* 내용 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 13, fontWeight: 600, color: "#1e293b",
                        whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                      }}
                    >
                      "{card.text}"
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                      {card.avatar} {card.user}
                    </div>
                  </div>
                  {/* 기도 수 */}
                  <div style={{ fontSize: 12, color: "#64748b", flexShrink: 0 }}>
                    🙏 {card.count}
                  </div>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
}
