import { useState } from "react";
import { registerWithEmail, loginWithEmail, loginWithGoogle } from "../firebase/services/authService";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async () => {
    setLoading(true);
    setError(null);

    try {
      if (isSignup) {
        await registerWithEmail(email, password, nickname);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);

    try {
      await loginWithGoogle();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "0 auto",
        minHeight: "100vh",
        background: "linear-gradient(135deg, #6ee7b7 0%, #3b82f6 100%)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        fontFamily: "'Noto Sans KR', sans-serif",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 40 }}>
        <div style={{ fontSize: 60, marginBottom: 10 }}>🌿</div>
        <h1 style={{ color: "white", fontSize: 32, margin: "0 0 10px 0" }}>Ground</h1>
        <p style={{ color: "rgba(255,255,255,0.9)", margin: 0 }}>함께 기도하는 공간</p>
      </div>

      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: 24,
          width: "100%",
          boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
        }}
      >
        <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 20, textAlign: "center" }}>
          {isSignup ? "회원가입" : "로그인"}
        </h2>

        {isSignup && (
          <input
            type="text"
            placeholder="닉네임"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              borderRadius: 10,
              border: "1px solid #e2e8f0",
              marginBottom: 12,
              fontSize: 14,
              fontFamily: "inherit",
            }}
          />
        )}

        <input
          type="email"
          placeholder="이메일"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            marginBottom: 12,
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />

        <input
          type="password"
          placeholder="비밀번호"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{
            width: "100%",
            padding: "12px 14px",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            marginBottom: 20,
            fontSize: 14,
            fontFamily: "inherit",
          }}
        />

        <button
          onClick={handleEmailAuth}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #6ee7b7, #3b82f6)",
            color: "white",
            border: "none",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            marginBottom: 12,
          }}
        >
          {loading ? "처리 중..." : isSignup ? "회원가입" : "로그인"}
        </button>

        <button
          onClick={handleGoogleLogin}
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: 10,
            background: "white",
            color: "#1e293b",
            border: "1px solid #e2e8f0",
            fontWeight: 700,
            fontSize: 14,
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
          }}
        >
          Google로 {isSignup ? "가입" : "로그인"}
        </button>

        {error && (
          <div
            style={{
              marginTop: 12,
              padding: 12,
              background: "#fee2e2",
              color: "#c2410c",
              borderRadius: 10,
              fontSize: 13,
              textAlign: "center",
            }}
          >
            ❌ {error}
          </div>
        )}

        <button
          onClick={() => {
            setIsSignup(!isSignup);
            setError(null);
          }}
          style={{
            width: "100%",
            marginTop: 16,
            padding: "12px",
            borderRadius: 10,
            background: "#f1f5f9",
            color: "#64748b",
            border: "none",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          {isSignup ? "로그인으로 이동" : "회원가입으로 이동"}
        </button>
      </div>

      <div style={{ marginTop: 30, textAlign: "center", color: "rgba(255,255,255,0.8)", fontSize: 12 }}>
        <p>💡 테스트 계정</p>
        <p>이메일: test@example.com</p>
        <p>비밀번호: 123456</p>
      </div>
    </div>
  );
}
