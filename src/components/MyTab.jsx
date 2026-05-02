import { BADGES } from "../data/ground-data.js";
import { getTreeLevel, TREE_EMOJIS, TREE_NAMES, TREE_GOALS, getTreeProgress } from "../utils/ground-utils.js";

export default function MyTab({ seeds }) {
  const treeLevel = getTreeLevel(seeds);
  const progress = getTreeProgress(seeds);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div
        style={{
          background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)",
          borderRadius: 20,
          padding: "24px 20px",
          marginBottom: 20,
          textAlign: "center",
          color: "white",
          boxShadow: "0 8px 24px rgba(59,130,246,0.25)",
        }}
      >
        <div style={{ fontSize: 50, marginBottom: 8 }}>{TREE_EMOJIS[treeLevel]}</div>
        <div style={{ fontWeight: 800, fontSize: 18, marginBottom: 2 }}>나의 기도 나무</div>
        <div style={{ opacity: 0.85, fontSize: 14 }}>{TREE_NAMES[treeLevel]} 단계</div>
        <div style={{ marginTop: 16, background: "rgba(255,255,255,0.25)", borderRadius: 99, height: 8, overflow: "hidden" }}>
          <div style={{ width: `${progress}%`, height: "100%", background: "white", borderRadius: 99, transition: "width 0.8s" }} />
        </div>
        <div style={{ marginTop: 6, fontSize: 12, opacity: 0.85 }}>
          🌱 {seeds} Seeds {treeLevel < 3 && `/ ${TREE_GOALS[treeLevel]} Seeds`}
        </div>
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 12 }}>🌱 Seed 획득 방법</div>
        {[
          { label: "기도 카드 작성", pt: "+10", icon: "✏️" },
          { label: "친구 기도에 참여", pt: "+2", icon: "🙏" },
          { label: "전도용 응원 카드 발송", pt: "+20", icon: "💌" },
          { label: "7일 연속 접속", pt: "+50", icon: "🔥" },
        ].map((item) => (
          <div
            key={item.label}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "8px 0",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <span style={{ fontSize: 13, color: "#334155" }}>{item.icon} {item.label}</span>
            <span style={{ fontWeight: 700, fontSize: 13, color: "#16a34a" }}>{item.pt} 🌱</span>
          </div>
        ))}
      </div>

      <div style={{ background: "white", borderRadius: 16, padding: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
        <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 12 }}>🏅 나의 배지</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
          {BADGES.map((b) => (
            <div
              key={b.label}
              style={{
                textAlign: "center",
                padding: "12px 8px",
                background: b.earned ? "#f0fdf4" : "#f8fafc",
                borderRadius: 12,
                border: b.earned ? "1.5px solid #86efac" : "1.5px solid #e2e8f0",
                opacity: b.earned ? 1 : 0.5,
              }}
            >
              <div style={{ fontSize: 28, marginBottom: 4 }}>{b.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 600, color: b.earned ? "#15803d" : "#94a3b8" }}>{b.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
