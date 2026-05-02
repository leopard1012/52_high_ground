export const INITIAL_CARDS = [
  { id: 1, user: "하늘이", avatar: "🌸", text: "오늘 수학 시험 잘 볼 수 있도록", emoji: "😤", bg: "from-rose-200 to-pink-300", count: 12, prayed: false, time: "5분 전" },
  { id: 2, user: "은혜", avatar: "🌿", text: "친구 관계가 회복되길 기도해요", emoji: "😢", bg: "from-sky-200 to-blue-300", count: 8, prayed: false, time: "23분 전" },
  { id: 3, user: "다윗", avatar: "⭐", text: "가족 모두 건강하게 지내도록", emoji: "🙏", bg: "from-amber-200 to-yellow-300", count: 21, prayed: false, time: "1시간 전" },
  { id: 4, user: "루디아", avatar: "💜", text: "꿈이 무엇인지 알게 해주세요", emoji: "🌟", bg: "from-violet-200 to-purple-300", count: 5, prayed: false, time: "2시간 전" },
];

export const CHALLENGES = [
  { id: 1, title: "7일 감사 세 줄 쓰기", day: 4, total: 7, icon: "📝", reward: 50, done: [true,true,true,true,false,false,false] },
  { id: 2, title: "친구를 위해 기도하기", day: 2, total: 5, icon: "🤝", reward: 30, done: [true,true,false,false,false] },
  { id: 3, title: "말씀 묵상 챌린지", day: 1, total: 3, icon: "📖", reward: 20, done: [true,false,false] },
];

export const CONCERNS = [
  { id: 1, text: "요즘 학교가 너무 힘들어요... 친구도 없고", time: "방금", replied: false },
  { id: 2, text: "시험 기간인데 잠을 못 자겠어요", time: "10분 전", replied: true },
  { id: 3, text: "부모님이 자꾸 싸우셔서 집에 있기 무서워요", time: "1시간 전", replied: false },
];

export const CREW = [
  { name: "새벽빛 중학교", seed: 1240, rank: 1 },
  { name: "소망 고등학교", seed: 980, rank: 2 },
  { name: "은혜 중학교", seed: 870, rank: 3 },
  { name: "빛나는 고등학교", seed: 650, rank: 4 },
];

export const BADGES = [
  { icon: "🌱", label: "첫 기도", earned: true },
  { icon: "🔥", label: "7일 연속", earned: true },
  { icon: "💌", label: "위로자", earned: false },
  { icon: "🌳", label: "나무 완성", earned: false },
  { icon: "✨", label: "전도사", earned: false },
  { icon: "👑", label: "크루 1등", earned: false },
];

export const EMOJIS = ["🙏", "😤", "😢", "🌟", "😊", "😰", "💪", "🌸"];

export const BGS = [
  "from-rose-200 to-pink-300",
  "from-sky-200 to-blue-300",
  "from-amber-200 to-yellow-300",
  "from-violet-200 to-purple-300",
  "from-green-200 to-teal-300",
  "from-orange-200 to-red-300",
];

export const MEETINGS = [
  { id: 1, name: "금요일 기도 모임", date: "2026-05-02", time: "19:00", location: "교회 기도실", organizer: "하늘이", members: ["하늘이", "은혜", "다윗"], maxMembers: 10, attendances: [{ member: "하늘이", photo: null, verified: false }], description: "주중 피로를 풀고 함께 기도하는 시간입니다" },
  { id: 2, name: "주일 예배 후 나눔", date: "2026-05-05", time: "11:30", location: "교회 카페", organizer: "은혜", members: ["은혜", "루디아"], maxMembers: 8, attendances: [{ member: "은혜", photo: null, verified: false }], description: "주일 예배 후 함께 말씀을 나누고 기도해요" },
];
