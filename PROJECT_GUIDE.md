# 🌱 Ground - 프로젝트 가이드

## 📱 프로젝트 개요

**Ground**는 청소년들이 함께 기도하고, 도전하고, 성장하는 커뮤니티 앱입니다.
사용자는 기도 카드를 작성하고, 친구들의 기도에 참여하며, 다양한 챌린지를 통해 씨드를 모아 나무를 키울 수 있습니다.

### 🎯 핵심 컨셉
- **기도 나무**: 씨드를 모아 키우는 성장 시스템
- **커뮤니티**: 기도 카드로 함께 기도하고 응원하기
- **챌린지**: 감사 쓰기, 기도, 말씀 묵상 등 도전
- **모임 관리**: 오프라인 모임을 생성하고 사진으로 인증

---

## 📂 프로젝트 구조

```
52_high_ground/
├── index.html                # 메인 HTML 파일
├── vite.config.js            # Vite 설정
├── package.json              # 프로젝트 의존성
├── PROJECT_GUIDE.md          # 이 파일
└── src/
    ├── index.jsx             # 엔트리 포인트
    ├── App.jsx               # 메인 애플리케이션
    ├── components/
    │   ├── HomeTab.jsx       # 🏠 홈 탭 - 기도 카드
    │   ├── CrewTab.jsx       # 👥 크루 탭 - 커뮤니티 & 채팅
    │   ├── ChallengeTab.jsx  # 🎯 챌린지 탭 - 미션 & 상담
    │   ├── MeetingTab.jsx    # 📍 모임 탭 - 오프라인 모임 관리
    │   ├── MyTab.jsx         # 🌿 마이 탭 - 프로필 & 배지
    │   └── FloatAnim.jsx     # 애니메이션 컴포넌트
    ├── data/
    │   └── ground-data.js    # 정적 데이터 (카드, 챌린지, 모임 등)
    └── utils/
        └── ground-utils.js   # 유틸리티 함수
```

---

## 🎮 주요 기능

### 1️⃣ **홈 탭 (🏠 HomeTab)**

#### 기능
- **기도 카드 작성**: 기도 내용을 카드로 작성하고 공유
- **함께 기도하기**: 다른 사람의 기도에 참여 (🙏 버튼)
- **씨드 획득**: 
  - 기도 카드 작성 시 +10 씨드
  - 다른 기도에 참여 시 +2 씨드

#### 컴포넌트 파일
- `src/components/HomeTab.jsx`

#### 상태 관리
```javascript
const [cards, setCards] = useState(INITIAL_CARDS);     // 기도 카드 목록
const [showForm, setShowForm] = useState(false);       // 폼 표시 여부
const [newText, setNewText] = useState("");            // 새 카드 텍스트
const [newEmoji, setNewEmoji] = useState("🙏");        // 선택한 이모지
const [newBg, setNewBg] = useState("...");             // 선택한 배경색
const [sparkId, setSparkId] = useState(null);          // 스파클 애니메이션
const [floaters, setFloaters] = useState([]);          // 떠오르는 씨드 애니메이션
```

#### 데이터 구조 (INITIAL_CARDS)
```javascript
{
  id: 1,                              // 고유 ID
  user: "하늘이",                      // 작성자
  avatar: "🌸",                        // 아바타
  text: "오늘 수학 시험 잘 볼 수 있도록",  // 기도 내용
  emoji: "😤",                         // 감정 이모지
  bg: "from-rose-200 to-pink-300",   // Tailwind 그래디언트
  count: 12,                          // 함께 기도한 사람 수
  prayed: false,                      // 내가 기도했는지 여부
  time: "5분 전"                       // 시간
}
```

---

### 2️⃣ **크루 탭 (👥 CrewTab)**

#### 기능
- **크루 랭킹**: 주간 크루별 씨드 순위 확인
- **그룹 채팅**: 크루 멤버들과 메시지 교환
- **실시간 소통**: 모임 일정, 응원, 기도 공유

#### 컴포넌트 파일
- `src/components/CrewTab.jsx`

#### 데이터 구조 (CREW)
```javascript
{
  name: "새벽빛 중학교",     // 크루명
  seed: 1240,              // 총 씨드
  rank: 1                  // 순위
}
```

---

### 3️⃣ **챌린지 탭 (🎯 ChallengeTab)**

#### 기능
- **미션 관리**: 주간 챌린지 진행 상황 추적
  - 7일 감사 세 줄 쓰기 (+50 씨드)
  - 친구를 위해 기도하기 (+30 씨드)
  - 말씀 묵상 챌린지 (+20 씨드)
- **상담글 관리**: 청소년들의 고민에 응원 메시지 작성
- **응답 시 보상**: 상담 응답 시 +5 씨드

#### 컴포넌트 파일
- `src/components/ChallengeTab.jsx`

#### 데이터 구조
```javascript
// CHALLENGES
{
  id: 1,
  title: "7일 감사 세 줄 쓰기",
  day: 4,                      // 현재 진행일
  total: 7,                    // 총 일수
  icon: "📝",
  reward: 50,                  // 보상 씨드
  done: [true,true,true,true,false,false,false]  // 각 날의 완료 여부
}

// CONCERNS
{
  id: 1,
  text: "요즘 학교가 너무 힘들어요...",
  time: "방금",
  replied: false               // 응답 여부
}
```

---

### 4️⃣ **모임 탭 (📍 MeetingTab) - NEW!**

#### 기능
- **모임 생성**: 오프라인 모임 정보 등록
  - 모임명, 날짜, 시간, 장소, 설명 입력
  - 최대 참석자 수 설정
  - 생성 시 +20 씨드
  
- **모임 조회**: 진행 중인 모임 목록 확인
  - 모임명, 일시, 장소, 주최자, 참석자 수
  - 참석 인증 현황
  
- **사진으로 참석 인증**: 
  - 모임 사진 업로드
  - 참석자 이름 입력
  - 인증 완료 시 +30 씨드

#### 컴포넌트 파일
- `src/components/MeetingTab.jsx`

#### 상태 관리
```javascript
const [meetings, setMeetings] = useState(MEETINGS);              // 모임 목록
const [showForm, setShowForm] = useState(false);                 // 폼 표시 여부
const [selectedMeetingId, setSelectedMeetingId] = useState(null); // 선택한 모임
const [showUploadModal, setShowUploadModal] = useState(false);   // 업로드 모달
const [uploadPhoto, setUploadPhoto] = useState(null);            // 업로드된 사진
```

#### 데이터 구조 (MEETINGS)
```javascript
{
  id: 1,
  name: "금요일 기도 모임",
  date: "2026-05-02",
  time: "19:00",
  location: "교회 기도실",
  organizer: "하늘이",                    // 주최자
  members: ["하늘이", "은혜", "다윗"],    // 참석 멤버
  maxMembers: 10,                         // 최대 참석자
  attendances: [                          // 사진 인증 기록
    {
      member: "하늘이",
      photo: "data:image/...",           // Base64 인코딩된 사진
      verified: false                     // 인증 여부
    }
  ],
  description: "주중 피로를 풀고 함께 기도하는 시간입니다"
}
```

---

### 5️⃣ **마이 탭 (🌿 MyTab)**

#### 기능
- **기도 나무**: 현재 씨드로 나무 성장 단계 표시
  - 🌱 씨앗 (0-100 씨드)
  - 🌿 새싹 (100-300 씨드)
  - 🌲 나무 (300-600 씨드)
  - 🌳 큰 나무 (600+ 씨드)
  
- **배지 시스템**: 달성한 성과 표시
  - 🌱 첫 기도
  - 🔥 7일 연속
  - 💌 위로자
  - 🌳 나무 완성
  - ✨ 전도사
  - 👑 크루 1등
  
- **씨드 획득 방법**: 각 활동별 씨드 안내

#### 컴포넌트 파일
- `src/components/MyTab.jsx`

---

## 💰 씨드(Seed) 시스템

### 씨드 획득 방법

| 활동 | 씨드 | 조건 |
|------|------|------|
| 기도 카드 작성 | +10 | 매회 작성 시 |
| 친구 기도 참여 | +2 | 기도 카드에 참여 |
| 전도용 응원 카드 | +20 | 작성 시 |
| 7일 연속 접속 | +50 | 연속 달성 시 |
| 모임 생성 | +20 | 모임 생성 시 |
| 모임 인증 | +30 | 사진으로 참석 인증 |
| 챌린지 완료 | +5~50 | 챌린지별 상이 |
| 상담 응답 | +5 | 고민글 응답 시 |

### 나무 성장 단계

```
🌱 씨앗    → 0-100 씨드
  ↓
🌿 새싹    → 100-300 씨드
  ↓
🌲 나무    → 300-600 씨드
  ↓
🌳 큰 나무 → 600+ 씨드
```

---

## 📊 데이터 관리

### 정적 데이터 (ground-data.js)

현재 앱은 모든 데이터를 `ground-data.js`에 정적으로 저장하고 있습니다:

```javascript
export const INITIAL_CARDS = [...]   // 기도 카드
export const CHALLENGES = [...]      // 챌린지
export const CONCERNS = [...]        // 상담글
export const CREW = [...]            // 크루 정보
export const BADGES = [...]          // 배지
export const MEETINGS = [...]        // 모임 정보
export const EMOJIS = [...]          // 이모지 선택지
export const BGS = [...]             // 배경색 선택지
```

### 상태 관리 (useState)

각 탭에서 `useState`로 데이터를 관리:
- 로컬 상태 업데이트 (메모리에만 저장)
- 페이지 새로고침 시 초기 데이터로 리셋

---

## 🛠️ 유틸리티 함수 (ground-utils.js)

### 트리 레벨 계산
```javascript
export function getTreeLevel(seeds)      // 현재 나무 단계 반환
export function getTreeProgress(seeds)   // 다음 단계까지의 진행률 (%)
```

### 그래디언트 처리
```javascript
export function getGradientFromBg(bg)    // Tailwind 클래스를 그래디언트 색상으로 변환
```

### 상수
```javascript
export const TREE_EMOJIS = ["🌱", "🌿", "🌲", "🌳"]
export const TREE_NAMES = ["씨앗", "새싹", "나무", "큰 나무"]
export const TREE_GOALS = [100, 300, 600, 999]
```

---

## 🎨 디자인 시스템

### 색상 팔레트
- **주 색상**: #6ee7b7 (민트 그린) - 시드, 버튼
- **강조 색상**: #3b82f6 (파랑) - 그래디언트
- **배경**: #f8fafc (연한 회색) - 페이지 배경
- **텍스트**: #1e293b (다크 슬레이트) - 제목, #475569 - 본문

### 컴포넌트 스타일
- **카드**: 흰색 배경, 12px 보더라디우스, 박스 섀도우
- **버튼**: 그래디언트 배경, 둥근 모서리, 고자중 폰트
- **아이콘**: 이모지 사용으로 직관적 표현

### 폰트
```css
'Noto Sans KR' - 한글 지원, 모든 컴포넌트에서 사용
```

---

## 🚀 개발 실행 가이드

### 설치
```bash
cd c:\Users\minku\52_high_ground
cmd /c "npm install"
```

### 개발 서버 실행
```bash
cmd /c "npm run dev"
```

브라우저에서 **http://localhost:5173/** 접속

### 빌드
```bash
cmd /c "npm build"
```

---

## 🔄 향후 개선 계획

### 필수 개선사항
1. **데이터 지속성**: 정적 데이터 → 동적 데이터 (Firebase/Supabase)
2. **사용자 인증**: 회원가입, 로그인 시스템
3. **알림 시스템**: 기도 참여, 댓글 알림
4. **실시간 채팅**: WebSocket 기반 크루 채팅

### 선택적 기능
1. **기도 카테고리**: 학교, 가족, 꿈 등 분류
2. **친구 추가 기능**: 친구 목록, 차단 기능
3. **배지 달성 알림**: 새 배지 획득 시 공지
4. **통계 대시보드**: 주간 기도 수, 씨드 획득 그래프
5. **공유 기능**: SNS 공유 (카톡, 인스타)
6. **다국어 지원**: 영어, 중국어 등

### 기술 개선
1. **TypeScript 마이그레이션**: 타입 안정성 강화
2. **상태 관리 라이브러리**: Redux/Zustand 도입
3. **REST API 구축**: 백엔드 서버 개발
4. **테스트 코드**: Jest, React Testing Library
5. **성능 최적화**: 번들 사이즈 감소, 이미지 최적화

---

## 📝 주요 파일 설명

### App.jsx
- 메인 애플리케이션 레이아웃
- 탭 네비게이션 관리
- 전역 상태 (seeds) 관리
- 헤더 및 하단 네비게이션 렌더링

### MeetingTab.jsx
- 모임 목록 표시
- 모임 생성 폼
- 모임 상세 정보
- 사진 업로드 및 참석 인증
- 모달 UI

### ground-data.js
- 모든 정적 데이터 중앙 관리
- 초기 카드, 챌린지, 모임 데이터
- 선택지 옵션 (이모지, 배경색)

---

## ✅ 현재 구현 상태

| 기능 | 상태 | 비고 |
|------|------|------|
| 기도 카드 작성/참여 | ✅ 완료 | HomeTab |
| 크루 채팅 | ✅ 완료 | CrewTab |
| 챌린지 & 상담 | ✅ 완료 | ChallengeTab |
| 모임 관리 | ✅ 완료 | MeetingTab (NEW) |
| 사진 인증 | ✅ 완료 | 로컬 저장 |
| 프로필 & 배지 | ✅ 완료 | MyTab |
| **동적 데이터** | ❌ 미지원 | Firebase/Supabase 필요 |
| **사용자 인증** | ❌ 미지원 | 로그인 시스템 필요 |
| **알림** | ❌ 미지원 | 푸시/실시간 알림 필요 |
| **이미지 저장소** | ❌ 미지원 | 클라우드 스토리지 필요 |

---

## 🎓 학습 자료

### React 개념 적용
- **useState**: 탭, 카드, 모임 상태 관리
- **조건부 렌더링**: 탭별 컴포넌트 표시
- **이벤트 핸들링**: 클릭, 입력 이벤트
- **리스트 렌더링**: map()으로 동적 컨텐츠
- **이미지 처리**: FileReader로 사진 업로드

### 스타일링
- **Inline CSS**: 스타일 객체로 컴포넌트 스타일링
- **그래디언트**: CSS 그래디언트 활용
- **반응형 디자인**: maxWidth 400px 모바일 최적화
- **애니메이션**: @keyframes으로 동적 효과

---

## 💡 팁

### 기능 추가 시
1. `ground-data.js`에 데이터 정의
2. 새 컴포넌트 생성 또는 기존 탭 수정
3. `App.jsx`에서 상태 관리 추가
4. 탭에 props로 상태 전달

### 디버깅
- 브라우저 DevTools 콘솔 확인
- React DevTools로 상태 추적
- 페이지 새로고침으로 초기화 (데이터 리셋)

### 성능
- `useState` 대신 여러 상태로 분리하여 불필요한 리렌더링 방지
- 이미지는 필요한 경우에만 로드
- 긴 리스트는 페이지네이션 고려

---

**문서 최종 수정**: 2026년 5월 2일
**버전**: 1.0 (모임 탭 추가)
