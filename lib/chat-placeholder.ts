// AI 채팅 입력창에서 타자기처럼 돌아가는 예시 질문 — 아이 월령에 맞춰 3개씩.
// 배열은 모듈 상수라 참조가 바뀌지 않는다 (useRotatingPlaceholder가 불필요하게 재시작하지 않음).

type Bucket = { maxMonths: number; questions: readonly string[] };

const BUCKETS: readonly Bucket[] = [
  {
    maxMonths: 3,
    questions: [
      "밤중 수유는 몇 시간 간격이 적당할까요?",
      "저녁마다 이유 없이 우는데 어떻게 달래죠?",
      "하루에 몇 시간 자는 게 보통인가요?",
    ],
  },
  {
    maxMonths: 6,
    questions: [
      "이유식은 언제부터, 어떻게 시작하면 될까요?",
      "아직 뒤집기를 안 하는데 괜찮을까요?",
      "낮잠 패턴은 어떻게 잡아주면 좋을까요?",
    ],
  },
  {
    maxMonths: 12,
    questions: [
      "밤에 자꾸 깨서 우는데 어떻게 재우면 좋을까요?",
      "낯가림이 갑자기 심해졌는데 괜찮을까요?",
      "손으로 집어 먹기는 언제부터 해도 되나요?",
    ],
  },
  {
    maxMonths: 24,
    questions: [
      "아직 말하는 단어가 적은데 괜찮을까요?",
      "떼쓰고 드러누울 때 어떻게 해야 하나요?",
      "밥을 안 먹고 돌아다니는데 어떻게 하죠?",
    ],
  },
  {
    maxMonths: 48,
    questions: [
      "기저귀는 언제, 어떻게 떼면 좋을까요?",
      "친구를 때리는 행동, 어떻게 알려줘야 할까요?",
      "어린이집 가기 싫다고 울 때 어떻게 하죠?",
    ],
  },
  {
    maxMonths: Number.POSITIVE_INFINITY,
    questions: [
      "한글 공부는 언제 시작하면 좋을까요?",
      "거짓말을 하기 시작했는데 어떻게 대하죠?",
      "스마트폰 사용 시간은 어떻게 정하면 될까요?",
    ],
  },
];

// 아이 정보가 없거나 생일을 읽을 수 없을 때
export const DEFAULT_CHAT_EXAMPLES: readonly string[] = [
  "밤에 자꾸 깨서 우는데 어떻게 재우면 좋을까요?",
  "떼쓰는 아이, 어떻게 다뤄야 하나요?",
  "말이 늦은 것 같은데 괜찮을까요?",
];

/** "YYYY-MM-DD" 생일 기준 만 개월 수. 읽을 수 없으면 null. */
export function ageInMonths(birthDate: string, now: Date = new Date()): number | null {
  const [y, m, d] = birthDate.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return null;
  let months = (now.getFullYear() - y) * 12 + (now.getMonth() + 1 - m);
  if (now.getDate() < d) months -= 1;
  return months < 0 ? 0 : months;
}

export function chatExamplesForBirthDate(
  birthDate: string | null | undefined,
  now: Date = new Date(),
): readonly string[] {
  if (!birthDate) return DEFAULT_CHAT_EXAMPLES;
  const months = ageInMonths(birthDate, now);
  if (months === null) return DEFAULT_CHAT_EXAMPLES;
  return BUCKETS.find((b) => months <= b.maxMonths)?.questions ?? DEFAULT_CHAT_EXAMPLES;
}
