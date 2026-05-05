import { useState, useEffect } from "react";
import { collection, onSnapshot, orderBy, query, deleteDoc, doc, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const SECTION = { DASHBOARD: "dashboard", USERS: "users", CARDS: "cards", VERSES: "verses" };

export default function AdminTab() {
  const [section, setSection] = useState(SECTION.DASHBOARD);
  const [users, setUsers]   = useState([]);
  const [crews, setCrews]   = useState([]);
  const [cards, setCards]   = useState([]);
  const [verses, setVerses] = useState([]);
  const [newVerseText, setNewVerseText] = useState("");
  const [newVerseRef,  setNewVerseRef]  = useState("");
  const [addingVerse,  setAddingVerse]  = useState(false);

  useEffect(() => {
    const unsubs = [
      onSnapshot(collection(db, "users"),  (s) => setUsers(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "crews"), orderBy("seeds", "desc")), (s) => setCrews(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(query(collection(db, "cards"), orderBy("createdAt", "desc")), (s) => setCards(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
      onSnapshot(collection(db, "verses"), (s) => setVerses(s.docs.map((d) => ({ id: d.id, ...d.data() })))),
    ];
    return () => unsubs.forEach((u) => u());
  }, []);

  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weeklyCards = cards.filter((c) => {
    const t = c.createdAt?.toDate?.() ?? new Date(c.createdAt);
    return t >= weekAgo;
  });
  const totalSeeds = users.reduce((s, u) => s + (u.seeds || 0), 0);
  const crewMap = Object.fromEntries(crews.map((c) => [c.id, c.name]));

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm("이 기도 카드를 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "cards", cardId));
  };

  const handleDeleteVerse = async (verseId) => {
    if (!window.confirm("이 말씀을 삭제하시겠습니까?")) return;
    await deleteDoc(doc(db, "verses", verseId));
  };

  const handleAddVerse = async () => {
    if (!newVerseText.trim() || !newVerseRef.trim()) {
      alert("말씀 내용과 성경 구절을 모두 입력해주세요");
      return;
    }
    setAddingVerse(true);
    try {
      await addDoc(collection(db, "verses"), {
        text: newVerseText.trim(),
        ref: newVerseRef.trim(),
        createdAt: serverTimestamp(),
      });
      setNewVerseText("");
      setNewVerseRef("");
    } catch (err) {
      alert("말씀 추가 실패: " + err.message);
    } finally {
      setAddingVerse(false);
    }
  };

  const navItems = [
    { id: SECTION.DASHBOARD, label: "현황판",   icon: "📊" },
    { id: SECTION.USERS,     label: "사용자",   icon: "👤" },
    { id: SECTION.CARDS,     label: "기도카드", icon: "🙏" },
    { id: SECTION.VERSES,    label: "말씀",     icon: "📖" },
  ];

  return (
    <div style={{ padding: "0 16px 100px" }}>

      {/* 헤더 */}
      <div style={{
        background: "linear-gradient(135deg, #1e293b 0%, #334155 100%)",
        borderRadius: 16, padding: "14px 16px", marginBottom: 16,
        display: "flex", alignItems: "center", gap: 10, color: "white",
      }}>
        <span style={{ fontSize: 24 }}>⚙️</span>
        <div>
          <div style={{ fontWeight: 800, fontSize: 16 }}>관리자 페이지</div>
          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 1 }}>Ground Admin</div>
        </div>
      </div>

      {/* 섹션 네비게이션 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => setSection(n.id)}
            style={{
              flex: 1, border: "none", borderRadius: 10, padding: "9px 0",
              background: section === n.id ? "#1e293b" : "white",
              color: section === n.id ? "white" : "#64748b",
              fontWeight: 700, fontSize: 12, cursor: "pointer",
              fontFamily: "inherit", boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            }}
          >
            <span style={{ fontSize: 18 }}>{n.icon}</span>
            {n.label}
          </button>
        ))}
      </div>

      {/* ── 현황판 ─────────────────────────────────────── */}
      {section === SECTION.DASHBOARD && (
        <>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[
              { label: "전체 사용자",      value: users.filter(u => !u.isAdmin).length, icon: "👥", color: "#3b82f6" },
              { label: "전체 크루",        value: crews.length,          icon: "🏠", color: "#8b5cf6" },
              { label: "이번 주 기도카드", value: weeklyCards.length,    icon: "🙏", color: "#10b981" },
              { label: "누적 Seeds",       value: totalSeeds,            icon: "🌱", color: "#f59e0b" },
            ].map((stat) => (
              <div key={stat.label} style={{
                background: "white", borderRadius: 14, padding: "14px 16px",
                boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
              }}>
                <div style={{ fontSize: 22, marginBottom: 6 }}>{stat.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: stat.color }}>{stat.value.toLocaleString()}</div>
                <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* 크루 현황 */}
          <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 10 }}>🏆 크루 현황</div>
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {crews.map((crew, i) => (
              <div key={crew.id} style={{
                display: "flex", alignItems: "center", padding: "12px 16px", gap: 12,
                borderBottom: i < crews.length - 1 ? "1px solid #f1f5f9" : "none",
              }}>
                <div style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: i === 0 ? "#f59e0b" : i === 1 ? "#94a3b8" : "#e2e8f0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 11, fontWeight: 800, color: i < 2 ? "white" : "#94a3b8",
                }}>{i + 1}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{crew.name}</div>
                  <div style={{ fontSize: 11, color: "#94a3b8" }}>
                    👥 {crew.members?.length || 0}명 &nbsp;·&nbsp; 🌱 {crew.seeds} Seeds
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── 사용자 관리 ─────────────────────────────────── */}
      {section === SECTION.USERS && (
        <>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            전체 {users.filter(u => !u.isAdmin).length}명 (관리자 제외)
          </div>
          <div style={{ background: "white", borderRadius: 14, overflow: "hidden", boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            {users
              .filter((u) => !u.isAdmin)
              .sort((a, b) => (b.seeds || 0) - (a.seeds || 0))
              .map((u, i, arr) => (
                <div key={u.id} style={{
                  display: "flex", alignItems: "center", padding: "12px 16px", gap: 10,
                  borderBottom: i < arr.length - 1 ? "1px solid #f1f5f9" : "none",
                }}>
                  {/* 아바타 */}
                  <div style={{
                    width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
                    background: "linear-gradient(135deg, #e0f2fe, #bfdbfe)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20,
                  }}>{u.avatar}</div>
                  {/* 정보 */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{u.nickname}</span>
                      {u.isCaptain && (
                        <span style={{ fontSize: 10, background: "#fef3c7", color: "#92400e", borderRadius: 5, padding: "1px 5px", fontWeight: 700 }}>
                          👑 크루장
                        </span>
                      )}
                    </div>
                    <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {crewMap[u.crewId] || "크루 없음"} &nbsp;·&nbsp; {u.email}
                    </div>
                  </div>
                  {/* 씨드 */}
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#16a34a", flexShrink: 0 }}>
                    🌱 {u.seeds || 0}
                  </div>
                </div>
              ))}
          </div>
        </>
      )}

      {/* ── 기도 카드 관리 ───────────────────────────────── */}
      {section === SECTION.CARDS && (
        <>
          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            전체 {cards.length}개 (전체 크루 포함)
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {cards.map((card) => (
              <div key={card.id} style={{
                background: "white", borderRadius: 12, padding: "12px 14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{card.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: "#1e293b",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>"{card.text}"</div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 2 }}>
                    {card.avatar} {card.user} &nbsp;·&nbsp; {crewMap[card.crewId] || card.crewId} &nbsp;·&nbsp; 🙏 {card.count}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCard(card.id)}
                  style={{
                    background: "#fee2e2", border: "none", borderRadius: 8,
                    width: 30, height: 30, cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, color: "#ef4444",
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
            {cards.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>
                기도 카드가 없습니다
              </div>
            )}
          </div>
        </>
      )}

      {/* ── 말씀 관리 ────────────────────────────────────── */}
      {section === SECTION.VERSES && (
        <>
          {/* 추가 폼 */}
          <div style={{ background: "white", borderRadius: 14, padding: "14px 16px", marginBottom: 14, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b", marginBottom: 10 }}>+ 말씀 추가</div>
            <input
              value={newVerseText}
              onChange={(e) => setNewVerseText(e.target.value)}
              placeholder="말씀 내용"
              style={{
                width: "100%", border: "1.5px solid #e2e8f0", borderRadius: 8,
                padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
                outline: "none", boxSizing: "border-box", marginBottom: 8, color: "#1e293b",
              }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={newVerseRef}
                onChange={(e) => setNewVerseRef(e.target.value)}
                placeholder="성경 구절 (예: 시편 23:1)"
                style={{
                  flex: 1, border: "1.5px solid #e2e8f0", borderRadius: 8,
                  padding: "8px 10px", fontSize: 13, fontFamily: "inherit",
                  outline: "none", boxSizing: "border-box", color: "#1e293b",
                }}
              />
              <button
                onClick={handleAddVerse}
                disabled={addingVerse}
                style={{
                  background: "#1e293b", color: "white", border: "none",
                  borderRadius: 8, padding: "8px 16px", fontWeight: 700,
                  fontSize: 13, cursor: "pointer", fontFamily: "inherit", flexShrink: 0,
                }}
              >
                추가
              </button>
            </div>
          </div>

          <div style={{ fontSize: 12, color: "#94a3b8", marginBottom: 10 }}>
            전체 {verses.length}개
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {verses.map((v) => (
              <div key={v.id} style={{
                background: "white", borderRadius: 12, padding: "12px 14px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1e293b", lineHeight: 1.4 }}>
                    "{v.text}"
                  </div>
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 3 }}>— {v.ref}</div>
                </div>
                <button
                  onClick={() => handleDeleteVerse(v.id)}
                  style={{
                    background: "#fee2e2", border: "none", borderRadius: 8,
                    width: 30, height: 30, cursor: "pointer", fontSize: 14,
                    display: "flex", alignItems: "center", justifyContent: "center",
                    flexShrink: 0, color: "#ef4444",
                  }}
                >
                  🗑
                </button>
              </div>
            ))}
            {verses.length === 0 && (
              <div style={{ textAlign: "center", padding: 40, color: "#94a3b8", fontSize: 13 }}>
                등록된 말씀이 없습니다
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
