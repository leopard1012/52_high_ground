/**
 * Ground 샘플 데이터 시딩 스크립트
 *
 * firebase login 후 npm run seed 로 실행
 * - Identity Toolkit REST API (Auth)
 * - Firestore REST API
 * 두 API 모두 firebase-tools 에 저장된 access_token 을 Bearer 토큰으로 사용
 */
import { readFileSync, existsSync } from "fs";
import { homedir } from "os";
import { join } from "path";

// ─── 인증 토큰 로드 + 자동 갱신 ────────────────────────────────────────────
const configPaths = [
  join(homedir(), ".config", "configstore", "firebase-tools.json"),
  join(process.env.APPDATA || "", "Configstore", "firebase-tools.json"),
];
let ACCESS_TOKEN = null;
for (const p of configPaths) {
  if (!existsSync(p)) continue;
  const cfg = JSON.parse(readFileSync(p, "utf8"));
  const tokens = cfg?.tokens;
  if (!tokens) continue;

  const expiresAt = tokens.expires_at ?? 0;
  if (Date.now() < expiresAt - 60_000) {
    // 아직 유효한 토큰
    ACCESS_TOKEN = tokens.access_token;
    console.log("  ✓ firebase-tools 토큰 사용 (유효)");
  } else {
    // 만료 — refresh_token으로 갱신
    console.log("  ↻ access_token 만료, 갱신 중...");
    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com",
        client_secret: "j9iVZfS8kkCEFUPaAeJV0sAi",
        refresh_token: tokens.refresh_token,
      }),
    });
    if (!res.ok) { console.error("토큰 갱신 실패:", await res.text()); break; }
    const data = await res.json();
    ACCESS_TOKEN = data.access_token;
    console.log("  ✓ access_token 갱신 완료");
  }
  if (ACCESS_TOKEN) break;
}
if (!ACCESS_TOKEN) {
  console.error("firebase-tools 토큰을 찾을 수 없습니다.\n'firebase login' 을 먼저 실행하세요.");
  process.exit(1);
}

const PROJECT = "high-ground-4fbbf";
const API_KEY = "AIzaSyC8mocrsIglHuFS4E6aCWee-W-zuHyRnAA";
const FS_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const IT_BASE = `https://identitytoolkit.googleapis.com/v1/projects/${PROJECT}`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${ACCESS_TOKEN}`,
};

// ─── REST 헬퍼 ──────────────────────────────────────────────────────────────
function toFSValue(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === "boolean")  return { booleanValue: v };
  if (typeof v === "string")   return { stringValue: v };
  if (typeof v === "number")   return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (v instanceof Date)       return { timestampValue: v.toISOString() };
  if (Array.isArray(v))        return { arrayValue: { values: v.map(toFSValue) } };
  if (typeof v === "object")   return { mapValue: { fields: Object.fromEntries(Object.entries(v).map(([k, val]) => [k, toFSValue(val)])) } };
  return { stringValue: String(v) };
}
const toDoc = (obj) => ({ fields: Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, toFSValue(v)])) });

async function api(method, url, body) {
  const res = await fetch(url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${url}\n→ ${res.status}: ${text.slice(0, 300)}`);
  return text ? JSON.parse(text) : null;
}

// Firestore: 컬렉션 문서 목록 조회 (페이지 없음, 간단 버전)
async function listDocs(col) {
  const data = await api("GET", `${FS_BASE}/${col}?pageSize=300`);
  return data?.documents || [];
}

// Firestore: 문서 삭제
const deleteDoc = (name) => api("DELETE", `https://firestore.googleapis.com/v1/${name}`);

// Firestore: 문서 set (특정 ID)
const setDoc = (col, id, obj) =>
  api("PATCH", `${FS_BASE}/${col}/${id}`, toDoc(obj));

// Firestore: 문서 add (자동 ID)
const addDoc = (col, obj) =>
  api("POST", `${FS_BASE}/${col}`, toDoc(obj));

// Auth: 사용자 생성 or 갱신
async function upsertUser(email, password, displayName) {
  // 이메일로 사용자 조회
  try {
    const res = await api("POST", `${IT_BASE}/accounts:lookup`, { email: [email] });
    const existing = res?.users?.[0];
    if (existing) {
      // 비밀번호·닉네임 갱신
      await api("POST", `${IT_BASE}/accounts:update`, {
        localId: existing.localId,
        password,
        displayName,
      });
      console.log(`  ✓ 기존 계정 갱신: ${email} (${existing.localId})`);
      return existing.localId;
    }
  } catch (_) {}

  // 신규 생성
  const created = await api("POST", `${IT_BASE}/accounts`, {
    email,
    password,
    displayName,
    emailVerified: true,
  });
  console.log(`  + 계정 생성: ${email} (${created.localId})`);
  return created.localId;
}

async function clearCollection(col) {
  const docs = await listDocs(col);
  if (!docs.length) { console.log(`  (${col}: 비어있음, 스킵)`); return; }
  await Promise.all(docs.map((d) => deleteDoc(d.name)));
  console.log(`  🗑  ${col} (${docs.length}건 삭제)`);
}

// ─── 샘플 데이터 ─────────────────────────────────────────────────────────────
const CREWS = [
  { id: "crew_1", name: "1번크루", seeds: 120 },
  { id: "crew_2", name: "2번크루", seeds: 85 },
];

const USERS = [
  { nickname: "1번크루장",  email: "crewcap_1@abc.com",  password: "123456", crewId: "crew_1", isCaptain: true,  avatar: "👑", seeds: 50 },
  { nickname: "2번크루장",  email: "crewcap_2@abc.com",  password: "123456", crewId: "crew_2", isCaptain: true,  avatar: "👑", seeds: 40 },
  { nickname: "1번크루원_1", email: "crew_1-1@abc.com",  password: "123456", crewId: "crew_1", isCaptain: false, avatar: "🙏", seeds: 35 },
  { nickname: "2번크루원_1", email: "crew_2-1@abc.com",  password: "123456", crewId: "crew_2", isCaptain: false, avatar: "🌟", seeds: 45 },
  { nickname: "1번크루원_2", email: "crew_1-2@abc.com",  password: "123456", crewId: "crew_1", isCaptain: false, avatar: "🌸", seeds: 35 },
];

const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return d; };

const SAMPLE_CARDS = [
  { crewId: "crew_1", userEmail: "crewcap_1@abc.com", text: "오늘도 하루를 주심에 감사합니다",          emoji: "🙏", bg: "from-green-200 to-teal-300",   daysAgo: 0 },
  { crewId: "crew_1", userEmail: "crew_1-1@abc.com",  text: "가족의 건강을 위해 기도합니다",           emoji: "❤️", bg: "from-pink-200 to-rose-300",    daysAgo: 0 },
  { crewId: "crew_1", userEmail: "crew_1-2@abc.com",  text: "시험이 있는데 하나님의 지혜를 구합니다",  emoji: "📚", bg: "from-blue-200 to-sky-300",     daysAgo: 1 },
  { crewId: "crew_1", userEmail: "crewcap_1@abc.com", text: "크루 모임이 은혜롭게 되길 기도합니다",    emoji: "✨", bg: "from-yellow-200 to-orange-200", daysAgo: 2 },
  { crewId: "crew_2", userEmail: "crewcap_2@abc.com", text: "2번크루 모두가 건강하길 기도합니다",      emoji: "🌿", bg: "from-green-200 to-emerald-300", daysAgo: 0 },
  { crewId: "crew_2", userEmail: "crew_2-1@abc.com",  text: "이번 주 기도 모임에 은혜가 넘치길",      emoji: "🌟", bg: "from-purple-200 to-violet-300", daysAgo: 0 },
  { crewId: "crew_2", userEmail: "crewcap_2@abc.com", text: "취업 준비 중인 크루원들을 위해 기도해요", emoji: "💪", bg: "from-orange-200 to-amber-300",  daysAgo: 1 },
];

const SAMPLE_CHALLENGES = [
  { title: "30일 기도 챌린지", icon: "🔥", totalDays: 30, reward: 50, done: [true, true, true, false], day: 3, crewId: "crew_1", userEmail: "crewcap_1@abc.com" },
  { title: "감사 일기 쓰기",   icon: "📝", totalDays: 21, reward: 30, done: [true, true, false],        day: 2, crewId: "crew_1", userEmail: "crew_1-1@abc.com"  },
  { title: "말씀 암송 챌린지", icon: "📖", totalDays: 14, reward: 40, done: [true, false],              day: 1, crewId: "crew_2", userEmail: "crewcap_2@abc.com" },
];

const SAMPLE_CONCERNS = [
  { text: "진로에 대한 고민이 많아요. 하나님의 뜻을 알고 싶습니다.", userEmail: "crew_1-1@abc.com", crewId: "crew_1",
    replies: [{ user: "1번크루장", avatar: "👑", text: "함께 기도할게요. 하나님이 반드시 길을 열어주실 거예요!" }] },
  { text: "친구와 다투었는데 화해할 방법을 모르겠어요.",              userEmail: "crew_1-2@abc.com", crewId: "crew_1", replies: [] },
  { text: "새 직장을 구하고 있는데 불안한 마음이 있어요.",            userEmail: "crew_2-1@abc.com", crewId: "crew_2",
    replies: [{ user: "2번크루장", avatar: "👑", text: "하나님이 준비하신 자리가 있을 거예요. 기도로 응원할게요!" }] },
];

// ─── 메인 ────────────────────────────────────────────────────────────────────
async function seed() {
  console.log("\n🌱 Ground 샘플 데이터 시딩 시작\n");

  // 1. 기존 데이터 삭제
  console.log("── 컬렉션 초기화 ──");
  for (const col of ["cards", "crews", "challenges", "concerns"]) {
    await clearCollection(col);
  }

  // 2. Auth 계정 생성
  console.log("\n── 계정 생성 ──");
  const uids = {};
  for (const u of USERS) {
    uids[u.email] = await upsertUser(u.email, u.password, u.nickname);
  }

  // 크루별 멤버·캡틴 집계
  const crewMembers = {}, crewCaptain = {};
  for (const u of USERS) {
    if (!crewMembers[u.crewId]) crewMembers[u.crewId] = [];
    crewMembers[u.crewId].push(uids[u.email]);
    if (u.isCaptain) crewCaptain[u.crewId] = uids[u.email];
  }

  // 3. crews 문서
  console.log("\n── 크루 생성 ──");
  for (const crew of CREWS) {
    await setDoc("crews", crew.id, {
      name: crew.name,
      seeds: crew.seeds,
      captainId: crewCaptain[crew.id],
      members: crewMembers[crew.id],
      createdAt: new Date(),
    });
    console.log(`  + ${crew.name} (${crewMembers[crew.id].length}명)`);
  }

  // 4. users 문서
  console.log("\n── 사용자 프로필 생성 ──");
  for (const u of USERS) {
    await setDoc("users", uids[u.email], {
      email: u.email,
      nickname: u.nickname,
      avatar: u.avatar,
      seeds: u.seeds,
      crewId: u.crewId,
      isCaptain: u.isCaptain,
      createdAt: new Date(),
      stats: { prayCount: 0, repliesCount: 0, challengesCompleted: 0 },
    });
    console.log(`  + ${u.nickname} [${u.isCaptain ? "크루장" : "크루원"}] → ${u.crewId} / ${u.seeds} Seeds`);
  }

  // 5. 기도 카드
  console.log("\n── 기도 카드 생성 ──");
  for (const card of SAMPLE_CARDS) {
    const u = USERS.find((x) => x.email === card.userEmail);
    await addDoc("cards", {
      crewId: card.crewId,
      userId: uids[card.userEmail],
      user: u.nickname,
      avatar: u.avatar,
      text: card.text,
      emoji: card.emoji,
      bg: card.bg,
      count: 0,
      dailyPrays: {},
      createdAt: daysAgo(card.daysAgo),
      updatedAt: daysAgo(card.daysAgo),
    });
    console.log(`  + [${card.crewId}] "${card.text.slice(0, 22)}"`);
  }

  // 6. 챌린지
  console.log("\n── 챌린지 생성 ──");
  for (const c of SAMPLE_CHALLENGES) {
    const u = USERS.find((x) => x.email === c.userEmail);
    await addDoc("challenges", {
      userId: uids[c.userEmail], user: u.nickname, avatar: u.avatar,
      title: c.title, icon: c.icon, totalDays: c.totalDays, reward: c.reward,
      done: c.done, day: c.day, crewId: c.crewId, createdAt: new Date(),
    });
    console.log(`  + ${c.title}`);
  }

  // 7. 고민 상담
  console.log("\n── 고민 상담 생성 ──");
  for (const concern of SAMPLE_CONCERNS) {
    const u = USERS.find((x) => x.email === concern.userEmail);
    await addDoc("concerns", {
      userId: uids[concern.userEmail], user: u.nickname, avatar: u.avatar,
      text: concern.text, crewId: concern.crewId,
      replies: concern.replies.map((r) => ({ ...r, createdAt: new Date() })),
      createdAt: new Date(),
    });
    console.log(`  + "${concern.text.slice(0, 25)}"`);
  }

  console.log("\n✅ 시딩 완료!\n");
  console.log("─── 테스트 계정 ───────────────────────────────────────────");
  for (const u of USERS) {
    console.log(`${u.isCaptain ? "👑 크루장" : "   크루원"} | ${u.nickname.padEnd(12)} | ${u.email} / ${u.password}`);
  }
  console.log("───────────────────────────────────────────────────────────\n");
}

seed().catch((err) => { console.error("시딩 실패:", err.message || err); process.exit(1); });
