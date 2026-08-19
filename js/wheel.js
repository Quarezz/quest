const WHEEL_COLORS = ["#f0c14b", "#f7ead8", "#e85d4c", "#3d2a1f"];
const GIFT_COLORS = ["#f0c14b", "#8b1e3f", "#f7ead8", "#c9a227"];

function sliceColors(slices, isGift) {
  const palette = isGift ? GIFT_COLORS : WHEEL_COLORS;
  return slices.map((_, i) => palette[i % palette.length]);
}

function createWheel(canvas, slices, options = {}) {
  const ctx = canvas.getContext("2d");
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  let rotation = 0;
  let spinning = false;

  function cssSize() {
    return canvas.clientWidth;
  }

  function size() {
    const wrap = canvas.parentElement;
    const max = Math.min(wrap.clientWidth, window.innerWidth - 40);
    const side = Math.max(240, Math.floor(max));
    canvas.style.width = `${side}px`;
    canvas.style.height = `${side}px`;
    canvas.width = Math.floor(side * dpr);
    canvas.height = Math.floor(side * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    const sizePx = cssSize();
    const cx = sizePx / 2;
    const cy = sizePx / 2;
    const radius = sizePx / 2 - 4;
    const n = slices.length;
    const arc = (2 * Math.PI) / n;
    const colors = sliceColors(slices, options.gift);

    ctx.clearRect(0, 0, sizePx, sizePx);

    for (let i = 0; i < n; i += 1) {
      const start = rotation - Math.PI / 2 - arc / 2 + i * arc;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + arc);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#140e0a";
      ctx.stroke();

      const mid = start + arc / 2;
      const emojiSize = Math.max(32, sizePx * 0.12);
      ctx.font = `${emojiSize}px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        slices[i].emoji,
        cx + Math.cos(mid) * radius * 0.62,
        cy + Math.sin(mid) * radius * 0.62,
      );
    }

    ctx.beginPath();
    ctx.arc(cx, cy, radius * 0.14, 0, Math.PI * 2);
    ctx.fillStyle = "#140e0a";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f0c14b";
    ctx.stroke();
  }

  function easeOutCubic(t) {
    return 1 - (1 - t) ** 3;
  }

  function spinTo(index) {
    if (spinning) return Promise.resolve();
    spinning = true;

    const n = slices.length;
    const sliceAngle = (2 * Math.PI) / n;
    const twoPi = Math.PI * 2;
    const current = ((rotation % twoPi) + twoPi) % twoPi;
    const targetMod = ((-index * sliceAngle) % twoPi + twoPi) % twoPi;
    const extraTurns = 5 + Math.random() * 2;
    let delta = extraTurns * twoPi + targetMod - current;
    if (delta < 4 * twoPi) delta += twoPi;

    const start = rotation;
    const duration = 4200;
    const startedAt = performance.now();

    return new Promise((resolve) => {
      function frame(now) {
        const t = Math.min(1, (now - startedAt) / duration);
        rotation = start + delta * easeOutCubic(t);
        draw();
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          rotation = start + delta;
          draw();
          spinning = false;
          resolve();
        }
      }
      requestAnimationFrame(frame);
    });
  }

  size();
  window.addEventListener("resize", size);

  return {
    spinTo,
    get spinning() {
      return spinning;
    },
    resize: size,
  };
}