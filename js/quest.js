var FOOD_PRIZES = [
  { id: "kinder", label: "Kinder Surprise", emoji: "🥚" },
  { id: "raffaello", label: "Raffaello", emoji: "🥥" },
  { id: "juice", label: "Сік", emoji: "🧃" },
  { id: "snickers", label: "Snickers", emoji: "🍫" },
];

var GIFT_PRIZE = { id: "gift", label: "Подарунок", emoji: "🎁" };

var STOPS = [
  {
    id: 1,
    image: "assets/1.jpg",
    prompt: "Знайди це місце",
    hint: "Зворотній вхід в заклад куди ми ніколи не ходимо",
  },
  {
    id: 2,
    image: "assets/2.jpg",
    prompt: "Знайди цей ракурс",
    hint: "Десь тут бігають маленькі люди",
  },
  {
    id: 3,
    image: "assets/3.jpg",
    prompt: "Знайди це місце",
    hint: "Перше що бачиш на виході з метро",
  },
  {
    id: 4,
    image: "assets/4.jpg",
    prompt: "Знайди цю будівлю",
    hint: "БЦ який ніколи не добудують",
  },
  {
    id: 5,
    image: "assets/5.jpg",
    prompt: "Знайди цей вид",
    hint: "Лягай біля озера",
  },
  {
    id: 6,
    image: "assets/6.jpg",
    prompt: "Ти на фініші",
    hint: "SUNDAY cafe/bar — останнє місце квесту.",
    final: true,
    ending:
      "Тут побачимось о 19:00 :P",
  },
];

var STORAGE_PREFIX = "quest-stop-";

function getStopFromUrl() {
  var params = new URLSearchParams(window.location.search);
  var raw = params.get("s");
  var id = parseInt(raw || "", 10);
  var i;
  for (i = 0; i < STOPS.length; i += 1) {
    if (STOPS[i].id === id) {
      return STOPS[i];
    }
  }
  return null;
}

function clonePrize(prize) {
  return { id: prize.id, label: prize.label, emoji: prize.emoji };
}

function getSlicesForStop(stop) {
  var slices;
  var i;
  if (stop.final) {
    slices = [];
    for (i = 0; i < 8; i += 1) {
      slices.push(clonePrize(GIFT_PRIZE));
    }
    return slices;
  }
  slices = [];
  for (i = 0; i < FOOD_PRIZES.length; i += 1) {
    slices.push(clonePrize(FOOD_PRIZES[i]));
  }
  return slices;
}

function storageKey(stopId) {
  return STORAGE_PREFIX + stopId;
}

function readStopState(stopId) {
  try {
    var raw = localStorage.getItem(storageKey(stopId));
    if (!raw) {
      return null;
    }
    var parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") {
      return null;
    }
    return parsed;
  } catch (err) {
    return null;
  }
}

function writeStopState(stopId, state) {
  try {
    localStorage.setItem(storageKey(stopId), JSON.stringify(state));
  } catch (err) {
    // Private mode on iOS can block storage.
  }
}

function pickRandomIndex(length) {
  return Math.floor(Math.random() * length);
}

function resolvePrize(stop) {
  var slices = getSlicesForStop(stop);
  var saved = readStopState(stop.id);
  var savedIndex;
  var i;
  var index;
  var prize;

  if (saved && saved.prizeId) {
    savedIndex = -1;
    for (i = 0; i < slices.length; i += 1) {
      if (slices[i].id === saved.prizeId) {
        savedIndex = i;
        break;
      }
    }
    if (savedIndex !== -1) {
      return {
        prize: slices[savedIndex],
        index: savedIndex,
        seenPhoto: Boolean(saved.seenPhoto),
        alreadySpun: true,
      };
    }
  }

  index = pickRandomIndex(slices.length);
  prize = slices[index];
  return {
    prize: prize,
    index: index,
    seenPhoto: false,
    alreadySpun: false,
  };
}

function savePrize(stopId, prizeId) {
  var current = readStopState(stopId) || {};
  writeStopState(stopId, {
    prizeId: prizeId,
    seenPhoto: Boolean(current.seenPhoto),
  });
}

function markPhotoSeen(stopId) {
  var current = readStopState(stopId) || {};
  writeStopState(stopId, {
    prizeId: current.prizeId,
    seenPhoto: true,
  });
}