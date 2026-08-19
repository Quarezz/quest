var WHEEL_COLORS = ["#f0c14b", "#f7ead8", "#e85d4c", "#3d2a1f"];
var GIFT_COLORS = ["#f0c14b", "#8b1e3f", "#f7ead8", "#c9a227"];

function sliceColors(slices, isGift) {
  var palette = isGift ? GIFT_COLORS : WHEEL_COLORS;
  return slices.map(function (_, i) {
    return palette[i % palette.length];
  });
}

function createWheel(canvas, slices, options) {
  options = options || {};
  var ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("canvas");
  }
  var dpr = Math.max(1, window.devicePixelRatio || 1);
  var rotation = 0;
  var spinning = false;
  var drawSize = 240;

  function measureSide() {
    var wrap = canvas.parentElement;
    var fallback = Math.max(240, Math.floor((window.innerWidth || 320) - 40));
    var width = wrap && wrap.clientWidth ? wrap.clientWidth : fallback;
    if (!width) {
      width = fallback;
    }
    return Math.max(240, Math.floor(Math.min(width, fallback)));
  }

  function size() {
    drawSize = measureSide();
    canvas.style.width = drawSize + "px";
    canvas.style.height = drawSize + "px";
    canvas.width = Math.floor(drawSize * dpr);
    canvas.height = Math.floor(drawSize * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() {
    var sizePx = drawSize;
    if (sizePx < 32) {
      return;
    }
    var cx = sizePx / 2;
    var cy = sizePx / 2;
    var radius = Math.max(8, sizePx / 2 - 4);
    var n = slices.length;
    var arc = (2 * Math.PI) / n;
    var colors = sliceColors(slices, options.gift);
    var i;
    var start;
    var mid;
    var emojiSize;

    ctx.clearRect(0, 0, sizePx, sizePx);

    for (i = 0; i < n; i += 1) {
      start = rotation - Math.PI / 2 - arc / 2 + i * arc;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, radius, start, start + arc);
      ctx.closePath();
      ctx.fillStyle = colors[i];
      ctx.fill();
      ctx.lineWidth = 3;
      ctx.strokeStyle = "#140e0a";
      ctx.stroke();

      mid = start + arc / 2;
      emojiSize = Math.max(32, sizePx * 0.12);
      ctx.font =
        emojiSize +
        'px "Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif';
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        slices[i].emoji,
        cx + Math.cos(mid) * radius * 0.62,
        cy + Math.sin(mid) * radius * 0.62
      );
    }

    ctx.beginPath();
    ctx.arc(cx, cy, Math.max(6, radius * 0.14), 0, Math.PI * 2);
    ctx.fillStyle = "#140e0a";
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = "#f0c14b";
    ctx.stroke();
  }

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function twoPi() {
    return Math.PI * 2;
  }

  function wrapAngle(angle) {
    var tau = twoPi();
    return ((angle % tau) + tau) % tau;
  }

  function indexUnderPointer() {
    var n = slices.length;
    var sliceAngle = twoPi() / n;
    var idx = Math.round(wrapAngle(-rotation) / sliceAngle);
    return ((idx % n) + n) % n;
  }

  function spinTo(index) {
    if (spinning) {
      return Promise.resolve(indexUnderPointer());
    }
    spinning = true;

    var n = slices.length;
    var sliceAngle = twoPi() / n;
    var tau = twoPi();
    var current = wrapAngle(rotation);
    var targetMod = wrapAngle(-index * sliceAngle);
    var extraTurns = 6 + Math.floor(Math.random() * 3);
    var delta = extraTurns * tau + targetMod - current;
    if (delta <= extraTurns * tau) {
      delta += tau;
    }

    var start = rotation;
    var duration = 4200;
    var startedAt = performance.now();

    return new Promise(function (resolve) {
      function frame(now) {
        var t = Math.min(1, (now - startedAt) / duration);
        rotation = start + delta * easeOutCubic(t);
        draw();
        if (t < 1) {
          requestAnimationFrame(frame);
        } else {
          rotation = start + delta;
          draw();
          spinning = false;
          resolve(indexUnderPointer());
        }
      }
      requestAnimationFrame(frame);
    });
  }

  size();
  window.addEventListener("resize", size);

  return {
    spinTo: spinTo,
    isSpinning: function () {
      return spinning;
    },
    resize: size,
  };
}