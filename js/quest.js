const FOOD_PRIZES = [
  { id: "kinder", label: "Kinder Surprise", emoji: "🥚" },
  { id: "raffaello", label: "Raffaello", emoji: "🥥" },
  { id: "juice", label: "Сік", emoji: "🧃" },
  { id: "snickers", label: "Snickers", emoji: "🍫" },
];

const GIFT_PRIZE = { id: "gift", label: "Подарунок", emoji: "🎁" };

const STOPS = [
  {
    id: 1,
    image: "assets/1.jpg",
    prompt: "Знайди це місце",
    hint: "Подивись на кущ і дерево — фото зроблене з доріжки біля будинку.",
  },
  {
    id: 2,
    image: "assets/2.jpg",
    prompt: "Знайди цей ракурс",
    hint: "Підніми голову між будинками. Шукай саме цей кут неба.",
  },
  {
    id: 3,
    image: "assets/3.jpg",
    prompt: "Знайди це місце",
    hint: "Сіра стіна внизу кадру підкаже, звідки знято фото.",
  },
  {
    id: 4,
    image: "assets/4.jpg",
    prompt: "Знайди цю будівлю",
    hint: "Шукай скляний фасад зі сходами й відбитим небом.",
  },
  {
    id: 5,
    image: "assets/5.jpg",
    prompt: "Знайди цей вид",
    hint: "Вода на передньому плані. Озеро або ставок біля висоток.",
  },
  {
    id: 6,
    image: "assets/6.jpg",
    prompt: "Ти на фініші",
    hint: "SUNDAY cafe/bar — останнє місце квесту.",
    final: true,
    ending:
      "Ти пройшла весь маршрут. Подивись навколо — фінал чекає саме тут.",
  },
];

const STORAGE_PREFIX = "quest-stop-";

function getStopFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const raw = params.get("s");
  const id = Number.parseInt(raw || "", 10);
  return STOPS.find((stop) => stop.id === id) || null;
}

function getSlicesForStop(stop) {
  if (stop.final) {
    return Array.from({ length: 8 }, () => ({ ...GIFT_PRIZE }));
  }
  return FOOD_PRIZES.map((prize) => ({ ...prize }));
}

function storageKey(stopId) {
  return `${STORAGE_PREFIX}${stopId}`;
}

function readStopState(stopId) {
  try {
    const raw = localStorage.getItem(storageKey(stopId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeStopState(stopId, state) {
  localStorage.setItem(storageKey(stopId), JSON.stringify(state));
}

function pickRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

function resolvePrize(stop) {
  const slices = getSlicesForStop(stop);
  const saved = readStopState(stop.id);
  if (saved && saved.prizeId) {
    const savedIndex = slices.findIndex((slice) => slice.id === saved.prizeId);
    if (savedIndex !== -1) {
      return {
        prize: slices[savedIndex],
        index: savedIndex,
        seenPhoto: Boolean(saved.seenPhoto),
        alreadySpun: true,
      };
    }
  }

  const index = pickRandomIndex(slices.length);
  const prize = slices[index];
  return {
    prize,
    index,
    seenPhoto: false,
    alreadySpun: false,
  };
}

function savePrize(stopId, prizeId) {
  const current = readStopState(stopId) || {};
  writeStopState(stopId, { ...current, prizeId, seenPhoto: Boolean(current.seenPhoto) });
}

function markPhotoSeen(stopId) {
  const current = readStopState(stopId) || {};
  writeStopState(stopId, { ...current, seenPhoto: true });
}