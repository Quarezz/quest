function showScreen(id) {
  document.querySelectorAll(".screen").forEach((screen) => {
    screen.hidden = screen.id !== id;
  });
}

function boot() {
  const stop = getStopFromUrl();
  if (!stop) {
    showScreen("screen-home");
    return;
  }

  const slices = getSlicesForStop(stop);
  const resolved = resolvePrize(stop);
  const canvas = document.querySelector("#wheel");
  const spinBtn = document.querySelector("#spin-btn");
  const prizeEmoji = document.querySelector("#prize-emoji");
  const prizeLabel = document.querySelector("#prize-label");
  const prizeContinue = document.querySelector("#prize-continue");
  const clueImg = document.querySelector("#clue-image");
  const cluePrompt = document.querySelector("#clue-prompt");
  const clueHintBtn = document.querySelector("#hint-btn");
  const clueHint = document.querySelector("#clue-hint");
  const clueEnding = document.querySelector("#clue-ending");
  const wheelTitle = document.querySelector("#wheel-title");

  wheelTitle.textContent = stop.final ? "Фінальний спінь" : "Колесо фортуни";
  document.querySelector("#stop-badge").textContent = stop.final
    ? "Фінал"
    : `Точка ${stop.id} з ${STOPS.length}`;

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
    markPhotoSeen(stop.id);
    showScreen("screen-clue");
  }

  clueHintBtn.addEventListener("click", () => {
    const open = clueHint.hidden;
    clueHint.hidden = !open;
    clueHintBtn.setAttribute("aria-expanded", String(open));
    clueHintBtn.textContent = open ? "Сховати підказку" : "Підказка";
  });

  prizeContinue.addEventListener("click", goToClue);

  if (resolved.alreadySpun && resolved.seenPhoto) {
    fillPrize(resolved.prize);
    goToClue();
    return;
  }

  if (resolved.alreadySpun) {
    goToPrize(resolved.prize);
    return;
  }

  const wheel = createWheel(canvas, slices, { gift: Boolean(stop.final) });
  showScreen("screen-wheel");

  spinBtn.addEventListener("click", async () => {
    if (wheel.spinning) return;
    spinBtn.disabled = true;
    spinBtn.textContent = "Крутиться…";
    await wheel.spinTo(resolved.index);
    savePrize(stop.id, resolved.prize.id);
    window.setTimeout(() => goToPrize(resolved.prize), 550);
  });
}

document.addEventListener("DOMContentLoaded", boot);