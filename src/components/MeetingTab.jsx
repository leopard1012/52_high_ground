import { useState } from "react";
import { MEETINGS } from "../data/ground-data.js";

export default function MeetingTab({ seeds, setSeeds }) {
  const [meetings, setMeetings] = useState(MEETINGS);
  const [showForm, setShowForm] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadMeetingId, setUploadMeetingId] = useState(null);
  const [uploadMember, setUploadMember] = useState("");
  const [uploadPhoto, setUploadPhoto] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    location: "",
    description: "",
    maxMembers: 10,
  });

  const handleCreateMeeting = () => {
    if (!formData.name || !formData.date || !formData.time || !formData.location) {
      alert("모든 필드를 입력해주세요");
      return;
    }
    const newMeeting = {
      id: Date.now(),
      ...formData,
      organizer: "나",
      members: ["나"],
      attendances: [],
    };
    setMeetings((prev) => [newMeeting, ...prev]);
    setSeeds((s) => s + 20);
    setFormData({ name: "", date: "", time: "", location: "", description: "", maxMembers: 10 });
    setShowForm(false);
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadPhoto(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVerifyAttendance = () => {
    if (!uploadPhoto || !uploadMember) {
      alert("사진과 이름을 선택해주세요");
      return;
    }
    setMeetings((prev) =>
      prev.map((m) => {
        if (m.id === uploadMeetingId) {
          const updated = { ...m };
          const existingIdx = updated.attendances.findIndex((a) => a.member === uploadMember);
          if (existingIdx >= 0) {
            updated.attendances[existingIdx] = { member: uploadMember, photo: uploadPhoto, verified: true };
          } else {
            updated.attendances.push({ member: uploadMember, photo: uploadPhoto, verified: true });
          }
          return updated;
        }
        return m;
      })
    );
    setSeeds((s) => s + 30);
    setUploadPhoto(null);
    setUploadMember("");
    setShowUploadModal(false);
  };

  const currentMeeting = meetings.find((m) => m.id === selectedMeetingId);

  return (
    <div style={{ padding: "0 16px 100px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e293b" }}>📍 오프라인 모임</div>
        <button
          onClick={() => setShowForm(!showForm)}
          style={{
            background: "#6ee7b7",
            color: "white",
            border: "none",
            borderRadius: 20,
            padding: "6px 12px",
            fontSize: 12,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          + 모임 만들기
        </button>
      </div>

      {showForm && (
        <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
          <input
            type="text"
            placeholder="모임 이름"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10, fontFamily: "'Noto Sans KR'" }}
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10, fontFamily: "'Noto Sans KR'" }}
          />
          <input
            type="time"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10, fontFamily: "'Noto Sans KR'" }}
          />
          <input
            type="text"
            placeholder="장소"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10, fontFamily: "'Noto Sans KR'" }}
          />
          <textarea
            placeholder="모임 설명"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", marginBottom: 10, fontFamily: "'Noto Sans KR'", minHeight: 60 }}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={handleCreateMeeting}
              style={{
                flex: 1,
                background: "#6ee7b7",
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              모임 생성
            </button>
            <button
              onClick={() => setShowForm(false)}
              style={{
                flex: 1,
                background: "#f1f5f9",
                color: "#64748b",
                border: "none",
                borderRadius: 8,
                padding: "10px",
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              취소
            </button>
          </div>
        </div>
      )}

      {!selectedMeetingId ? (
        <>
          {meetings.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px 20px", color: "#94a3b8" }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>📍</div>
              <div>아직 모임이 없습니다</div>
              <div style={{ fontSize: 12, marginTop: 8 }}>모임을 만들어 함께 기도해보세요!</div>
            </div>
          ) : (
            meetings.map((m) => (
              <div
                key={m.id}
                onClick={() => setSelectedMeetingId(m.id)}
                style={{
                  background: "white",
                  borderRadius: 16,
                  padding: 16,
                  marginBottom: 12,
                  boxShadow: "0 2px 12px rgba(0,0,0,0.06)",
                  cursor: "pointer",
                  border: "1px solid #e2e8f0",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 15, color: "#1e293b", marginBottom: 4 }}>{m.name}</div>
                    <div style={{ fontSize: 12, color: "#64748b" }}>
                      📅 {m.date} {m.time} | 📍 {m.location}
                    </div>
                  </div>
                  <div
                    style={{
                      background: "#ecfdf5",
                      color: "#059669",
                      padding: "4px 8px",
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                    }}
                  >
                    {m.members.length}/{m.maxMembers}
                  </div>
                </div>
                {m.description && <div style={{ fontSize: 12, color: "#475569", marginBottom: 10 }}>{m.description}</div>}
                <div style={{ fontSize: 12, color: "#94a3b8" }}>👤 {m.organizer} 주최 | ✅ 인증 {m.attendances.length}건</div>
              </div>
            ))
          )}
        </>
      ) : currentMeeting ? (
        <div>
          <button
            onClick={() => setSelectedMeetingId(null)}
            style={{
              background: "#f1f5f9",
              color: "#64748b",
              border: "none",
              borderRadius: 8,
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              marginBottom: 16,
            }}
          >
            ← 돌아가기
          </button>

          <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 800, fontSize: 18, color: "#1e293b", marginBottom: 12 }}>{currentMeeting.name}</div>
            <div style={{ fontSize: 13, color: "#475569", lineHeight: 1.6 }}>
              <div style={{ marginBottom: 8 }}>📅 {currentMeeting.date} {currentMeeting.time}</div>
              <div style={{ marginBottom: 8 }}>📍 {currentMeeting.location}</div>
              <div style={{ marginBottom: 8 }}>👤 주최자: {currentMeeting.organizer}</div>
              <div style={{ marginBottom: 8 }}>참석자: {currentMeeting.members.join(", ")}</div>
              {currentMeeting.description && <div style={{ marginTop: 12, padding: "12px", background: "#f8fafc", borderRadius: 8 }}>{currentMeeting.description}</div>}
            </div>
          </div>

          <div style={{ background: "white", borderRadius: 16, padding: 16, marginBottom: 16, boxShadow: "0 2px 12px rgba(0,0,0,0.06)" }}>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#1e293b", marginBottom: 12 }}>✅ 참석 인증 ({currentMeeting.attendances.length})</div>
            {currentMeeting.attendances.length === 0 ? (
              <div style={{ textAlign: "center", padding: "20px", color: "#94a3b8", fontSize: 12 }}>아직 인증이 없습니다</div>
            ) : (
              currentMeeting.attendances.map((att, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: "12px 0",
                    borderBottom: idx < currentMeeting.attendances.length - 1 ? "1px solid #f1f5f9" : "none",
                  }}
                >
                  <div
                    style={{
                      width: 50,
                      height: 50,
                      borderRadius: 8,
                      background: "#f1f5f9",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      overflow: "hidden",
                    }}
                  >
                    {att.photo ? <img src={att.photo} style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <div style={{ fontSize: 24 }}>📸</div>}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#1e293b" }}>{att.member}</div>
                    <div style={{ fontSize: 11, color: "#94a3b8" }}>{att.verified ? "✅ 인증됨" : "⏳ 검토 중"}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          <button
            onClick={() => {
              setUploadMeetingId(currentMeeting.id);
              setShowUploadModal(true);
            }}
            style={{
              width: "100%",
              background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
              color: "white",
              border: "none",
              borderRadius: 12,
              padding: "14px",
              fontWeight: 800,
              fontSize: 14,
              cursor: "pointer",
              marginBottom: 20,
            }}
          >
            📸 참석 인증하기 (+30 씨드)
          </button>
        </div>
      ) : null}

      {showUploadModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setShowUploadModal(false)}
        >
          <div
            style={{
              background: "white",
              borderRadius: 20,
              padding: 20,
              maxWidth: 350,
              width: "90%",
              maxHeight: "90vh",
              overflow: "auto",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontWeight: 800, fontSize: 16, color: "#1e293b", marginBottom: 16 }}>📸 참석 인증하기</div>

            <label style={{ display: "block", marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>사진 선택</div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                style={{ width: "100%" }}
              />
            </label>

            {uploadPhoto && (
              <div style={{ marginBottom: 12, borderRadius: 12, overflow: "hidden", background: "#f1f5f9" }}>
                <img src={uploadPhoto} style={{ width: "100%", maxHeight: 200, objectFit: "cover" }} />
              </div>
            )}

            <label style={{ display: "block", marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "#475569", marginBottom: 8 }}>참석자 이름</div>
              <input
                type="text"
                placeholder="이름 입력"
                value={uploadMember}
                onChange={(e) => setUploadMember(e.target.value)}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid #e2e8f0", fontFamily: "'Noto Sans KR'" }}
              />
            </label>

            <div style={{ display: "flex", gap: 8 }}>
              <button
                onClick={handleVerifyAttendance}
                style={{
                  flex: 1,
                  background: "#6ee7b7",
                  color: "white",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                인증하기
              </button>
              <button
                onClick={() => setShowUploadModal(false)}
                style={{
                  flex: 1,
                  background: "#f1f5f9",
                  color: "#64748b",
                  border: "none",
                  borderRadius: 8,
                  padding: "10px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
