export default function FloatAnim({ children, delay = 0 }) {
  return (
    <div style={{ animation: `floatUp 0.5s ease ${delay}s both` }}>
      {children}
    </div>
  );
}
