function showScreen(id) {
  var screens = document.querySelectorAll(".screen");
  var i;
  for (i = 0; i < screens.length; i += 1) {
    if (screens[i].id === id) {
      screens[i].classList.add("is-on");
      screens[i].hidden = false;
    } else {
      screens[i].classList.remove("is-on");
      screens[i].hidden = true;
    }
  }
}

function afterLayout(fn) {
  requestAnimationFrame(function () {
    requestAnimationFrame(fn);
  });
}

function boot() {
  try {
    startQuest();
  } catch (err) {
    showScreen("screen-home");
  }
}

function startQuest() {
  var stop = getStopFromUrl();
  if (!stop) {
    showScreen("screen-home");
    return;
  }

  var slices = getSlicesForStop(stop);
  var picked = pickPrize(stop);
  var canvas = document.querySelector("#wheel");
  var spinBtn = document.querySelector("#spin-btn");
  var prizeEmoji = document.querySelector("#prize-emoji");
  var prizeLabel = document.querySelector("#prize-label");
  var prizeContinue = document.querySelector("#prize-continue");
  var clueImg = document.querySelector("#clue-image");
  var cluePrompt = document.querySelector("#clue-prompt");
  var clueHintBtn = document.querySelector("#hint-btn");
  var clueHint = document.querySelector("#clue-hint");
  var clueEnding = document.querySelector("#clue-ending");
  var wheelTitle = document.querySelector("#wheel-title");

  wheelTitle.textContent = stop.final ? "Фінальний спінь" : "Колесо фортуни";

  clueImg.src = stop.image;
  clueImg.alt = stop.prompt;
  cluePrompt.textContent = stop.prompt;
  clueHint.textContent = stop.hint;
  if (stop.final) {
    clueEnding.hidden = false;
    clueEnding.textContent = stop.ending;
  }

  function fillPrize(prize) {
    prizeEmoji.textContent = prize.emoji;
    prizeLabel.textContent = prize.label;
  }

  function goToPrize(prize) {
    fillPrize(prize);
    showScreen("screen-prize");
  }

  function goToClue() {
    showScreen("screen-clue");
  }

  clueHintBtn.addEventListener("click", function () {
    var open = clueHint.hidden;
    clueHint.hidden = !open;
    clueHintBtn.setAttribute("aria-expanded", String(open));
    clueHintBtn.textContent = open ? "Сховати підказку" : "Підказка";
  });

  prizeContinue.addEventListener("click", goToClue);

  showScreen("screen-wheel");
  afterLayout(function () {
    var wheel = createWheel(canvas, slices, { gift: Boolean(stop.final) });
    spinBtn.addEventListener("click", function () {
      if (wheel.isSpinning()) {
        return;
      }
      spinBtn.disabled = true;
      spinBtn.textContent = "Крутиться…";
      wheel.spinTo(picked.index).then(function (landedIndex) {
        var prize = slices[landedIndex] || picked.prize;
        window.setTimeout(function () {
          goToPrize(prize);
        }, 550);
      });
    });
  });
}

boot();