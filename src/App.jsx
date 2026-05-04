import { useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { logout } from "./firebase/services/authService";
import LoginPage from "./components/LoginPage.jsx";
import HomeTab from "./components/HomeTab.jsx";
import CrewTab from "./components/CrewTab.jsx";
import ChallengeTab from "./components/ChallengeTab.jsx";
import MeetingTab from "./components/MeetingTab.jsx";
import MyTab from "./components/MyTab.jsx";

export default function GroundApp() {
  const { user, userProfile, loading } = useAuth();
  const [tab, setTab] = useState("home");

  const handleLogout = async () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      try {
        await logout();
      } catch (err) {
        alert("로그아웃 실패: " + err.message);
      }
    }
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)",
          color: "white",
          fontSize: 18,
          fontFamily: "'Noto Sans KR', sans-serif",
        }}
      >
        🔄 로딩 중...
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  const seeds = userProfile?.seeds || 0;

  // 크루, 모임 탭은 숨김 처리 (나중에 구현)
  const tabs = [
    { id: "home",    label: "홈",   icon: "🏠" },
    { id: "crew",    label: "크루", icon: "👥" },
    { id: "meeting", label: "모임", icon: "📍" },
    { id: "my",      label: "마이", icon: "🌿" },
  ];

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#f8fafc",
        fontFamily: "'Noto Sans KR', sans-serif",
        position: "relative",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700;800;900&display=swap');
        @keyframes floatUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes floatSeed { 0%{opacity:1;transform:translateY(0)} 100%{opacity:0;transform:translateY(-40px)} }
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 0; }
      `}</style>

      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "rgba(248,250,252,0.92)",
          backdropFilter: "blur(12px)",
          borderBottom: "1px solid #e2e8f0",
          padding: "14px 16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div style={{ fontWeight: 900, fontSize: 22, color: "#1e293b", letterSpacing: -1 }}>
          Ground
          <span style={{ fontSize: 12, color: "#94a3b8", fontWeight: 500, marginLeft: 6, letterSpacing: 0 }}>
            그라운드
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div
            style={{
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              borderRadius: 99,
              padding: "5px 12px",
              color: "white",
              fontWeight: 700,
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            🌱 {seeds}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "1px solid #cbd5e1",
              borderRadius: 8,
              padding: "6px 10px",
              color: "#64748b",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "#f1f5f9";
              e.target.style.color = "#1e293b";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.color = "#64748b";
            }}
          >
            로그아웃
          </button>
        </div>
      </div>

      <div style={{ paddingTop: 16 }}>
        {tab === "home" && <HomeTab seeds={seeds} />}
        {tab === "crew" && <CrewTab />}
        {tab === "challenge" && <ChallengeTab seeds={seeds} />}
        {tab === "meeting" && <MeetingTab seeds={seeds} />}
        {tab === "my" && <MyTab seeds={seeds} />}
      </div>

      <div
        style={{
          position: "fixed",
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "100%",
          maxWidth: 400,
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(16px)",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          padding: "8px 0 16px",
        }}
      >
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              cursor: "pointer",
              gap: 3,
              padding: "6px 0",
              transition: "all 0.15s",
              fontFamily: "inherit",
            }}
          >
            <span
              style={{
                fontSize: 22,
                filter: tab === t.id ? "none" : "grayscale(1) opacity(0.5)",
                transition: "all 0.15s",
                transform: tab === t.id ? "scale(1.15)" : "scale(1)",
              }}
            >
              {t.icon}
            </span>
            <span style={{ fontSize: 10, fontWeight: 700, color: tab === t.id ? "#3b82f6" : "#94a3b8" }}>
              {t.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
