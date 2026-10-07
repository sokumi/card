import { GIFEncoder, quantize, applyPalette } from "https://cdn.jsdelivr.net/npm/gifenc@1.0.3/+esm";

const canvas = document.querySelector("#canvas");
const ctx = canvas.getContext("2d", { willReadFrequently: true });

const W = canvas.width;
const H = canvas.height;

const el = (id) => document.querySelector(id);

const state = {
  images: { bg: null, left: null, right: null },
  speech: el("#speechInput").value,
  name: el("#nameInput").value,
  status: el("#statusInput").value,
  chat: el("#chatInput").value,
  song: el("#songInput").value,
  artist: el("#artistInput").value,
  sparkles: true,
  float: true,
  motion: 0.55,
  playing: true,
};

const sparkles = Array.from({ length: 60 }, (_, i) => ({
  x: (Math.sin(i * 97.11) * 0.5 + 0.5) * W,
  y: (Math.sin(i * 31.77 + 2.1) * 0.5 + 0.5) * H,
  r: 0.8 + ((i * 17) % 5) * 0.35,
  phase: (i * 0.77) % (Math.PI * 2),
}));

function roundRect(ctx, x, y, w, h, r, fillStyle, strokeStyle=null) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
  if (fillStyle) { ctx.fillStyle = fillStyle; ctx.fill(); }
  if (strokeStyle) { ctx.strokeStyle = strokeStyle; ctx.stroke(); }
}

function drawCover(img, x, y, w, h, radius=0) {
  if (!img) return;
  const ir = img.width / img.height;
  const rr = w / h;
  let sx=0, sy=0, sw=img.width, sh=img.height;
  if (ir > rr) {
    sw = img.height * rr;
    sx = (img.width - sw) / 2;
  } else {
    sh = img.width / rr;
    sy = (img.height - sh) / 2;
  }
  ctx.save();
  if (radius) { ctx.beginPath(); ctx.roundRect(x,y,w,h,radius); ctx.clip(); }
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
  ctx.restore();
}

function drawContain(img, x, y, w, h, radius=0) {
  if (!img) return;
  const s = Math.min(w / img.width, h / img.height);
  const dw = img.width * s;
  const dh = img.height * s;
  ctx.save();
  if (radius) { ctx.beginPath(); ctx.roundRect(x,y,w,h,radius); ctx.clip(); }
  ctx.drawImage(img, x + (w-dw)/2, y + (h-dh)/2, dw, dh);
  ctx.restore();
}

function textFit(text, maxWidth, startSize, weight=700) {
  let size = startSize;
  while (size > 10) {
    ctx.font = `${weight} ${size}px Inter, Pretendard, sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) break;
    size -= 1;
  }
  return size;
}

function render(timeSec = 0) {
  ctx.clearRect(0,0,W,H);

  // background
  if (state.images.bg) {
    drawCover(state.images.bg,0,0,W,H);
    const g = ctx.createLinearGradient(0,0,0,H);
    g.addColorStop(0,"rgba(0,0,0,.22)");
    g.addColorStop(1,"rgba(30,18,45,.58)");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  } else {
    const g = ctx.createLinearGradient(0,0,W,H);
    g.addColorStop(0,"#070b11");
    g.addColorStop(.55,"#17101e");
    g.addColorStop(1,"#1c1127");
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }

  // starfield
  if (state.sparkles) {
    ctx.save();
    for (const s of sparkles) {
      const pulse = 0.45 + 0.55 * Math.sin(timeSec * 2.2 + s.phase) ** 2;
      ctx.globalAlpha = 0.2 + pulse * 0.75;
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(s.x, s.y, s.r * (0.7 + pulse), 0, Math.PI*2); ctx.fill();
    }
    ctx.restore();
  }

  const motion = state.float ? state.motion : 0;
  const bobL = Math.sin(timeSec * 1.6) * 10 * motion;
  const bobR = Math.sin(timeSec * 1.8 + 1.1) * 8 * motion;
  const bobUI = Math.sin(timeSec * 1.25 + .4) * 5 * motion;

  // soft floor
  const floor = ctx.createLinearGradient(0,H-180,0,H);
  floor.addColorStop(0,"rgba(210,180,255,0)");
  floor.addColorStop(1,"rgba(196,166,255,.35)");
  ctx.fillStyle=floor; ctx.fillRect(0,H-180,W,180);

  // left poster
  roundRect(ctx, 60, 90+bobL, 440, 500, 26, "rgba(255,255,255,.95)");
  if (state.images.left) drawCover(state.images.left,60,90+bobL,440,500,26);
  else {
    const lg = ctx.createLinearGradient(60,90,500,590);
    lg.addColorStop(0,"#e7d4ea"); lg.addColorStop(1,"#94cfd0");
    roundRect(ctx,60,90+bobL,440,500,26,lg);
    ctx.fillStyle="rgba(30,30,45,.68)"; ctx.font="800 36px Inter"; ctx.fillText("LEFT IMAGE",120,350+bobL);
  }

  // phone
  roundRect(ctx, 760, 86+bobR, 330, 520, 56, "#08090d", "rgba(255,255,255,.7)");
  roundRect(ctx, 775, 103+bobR, 300, 486, 42, "#c8a7d8");
  if (state.images.right) drawCover(state.images.right,775,103+bobR,300,486,42);
  else {
    const rg = ctx.createLinearGradient(775,103,1075,589);
    rg.addColorStop(0,"#f6b7d9"); rg.addColorStop(.6,"#c6a5ee"); rg.addColorStop(1,"#8cbad9");
    roundRect(ctx,775,103+bobR,300,486,42,rg);
    ctx.fillStyle="rgba(25,22,35,.7)"; ctx.font="800 28px Inter"; ctx.fillText("RIGHT IMAGE",815,350+bobR);
  }
  roundRect(ctx,855,110+bobR,120,24,14,"#08090d");

  // speech bubble
  roundRect(ctx, 490, 68+bobUI, 350, 90, 24, "rgba(106,231,216,.93)");
  ctx.fillStyle="#fff";
  ctx.font="700 18px Inter, Pretendard, sans-serif";
  const words = state.speech.split(" ");
  let line="", y=105+bobUI;
  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > 305 && line) { ctx.fillText(line,515,y); line=word+" "; y+=24; }
    else line=test;
  }
  ctx.fillText(line,515,y);

  // music card
  roundRect(ctx, 610, 155+bobUI, 310, 170, 24, "rgba(20,18,27,.92)");
  roundRect(ctx,630,180+bobUI,78,78,14,"rgba(255,255,255,.11)");
  ctx.fillStyle="#fff"; ctx.font="800 21px Inter"; ctx.fillText(state.song,730,195+bobUI);
  ctx.fillStyle="#b9b7c4"; ctx.font="600 13px Inter"; ctx.fillText(state.artist,730,219+bobUI);
  ctx.fillStyle="#e7e6ed"; ctx.fillRect(630,277+bobUI,250,4);
  ctx.font="900 34px Inter"; ctx.fillText("◀  ❚❚  ▶",690,306+bobUI);

  // profile pill
  roundRect(ctx, 485, 300+bobUI, 260, 80, 26, "rgba(224,236,235,.9)");
  ctx.beginPath(); ctx.arc(530,340+bobUI,27,0,Math.PI*2); ctx.fillStyle="#fff"; ctx.fill();
  ctx.fillStyle="#24242e"; ctx.font="800 17px Inter"; ctx.fillText(state.name,575,334+bobUI);
  ctx.fillStyle="#686875"; ctx.font="600 11px Inter"; ctx.fillText(state.status,575,352+bobUI);

  // chat panel
  roundRect(ctx, 520, 390+bobUI, 250, 225, 22, "rgba(236,236,242,.9)");
  ctx.fillStyle="#80808e";
  for(let i=0;i<5;i++){
    ctx.beginPath();ctx.arc(548,425+bobUI+i*38,13,0,Math.PI*2);ctx.fill();
  }
  roundRect(ctx,575,410+bobUI,155,44,18,"rgba(255,255,255,.92)");
  ctx.fillStyle="#565663"; 
  const chatSize = textFit(state.chat,135,13,650);
  ctx.font=`650 ${chatSize}px Inter, Pretendard, sans-serif`;
  ctx.fillText(state.chat,588,437+bobUI);

  // bottom phone player
  roundRect(ctx, 788, 515+bobR, 270, 62, 20, "rgba(18,17,26,.78)");
  ctx.fillStyle="#fff"; ctx.font="700 14px Inter"; ctx.fillText(state.song,840,542+bobR);
  ctx.fillStyle="#bcb8c5"; ctx.font="600 10px Inter"; ctx.fillText(state.artist,840,558+bobR);
  ctx.fillStyle="#f1b4dd"; ctx.font="800 18px Inter"; ctx.fillText("▮▮▮",1015,552+bobR);

  // foreground sparkles
  if (state.sparkles) {
    const pts = [[305,240],[450,180],[930,250],[1045,435],[485,520],[675,365],[175,510]];
    ctx.save();
    for (let i=0;i<pts.length;i++){
      const [x,y]=pts[i];
      const p=.65+.35*Math.sin(timeSec*3+i);
      ctx.globalAlpha=p;
      ctx.fillStyle="#fff";
      ctx.font=`${18+8*p}px serif`;
      ctx.fillText("✦",x,y);
    }
    ctx.restore();
  }
}

function updateTextState() {
  state.speech = el("#speechInput").value;
  state.name = el("#nameInput").value;
  state.status = el("#statusInput").value;
  state.chat = el("#chatInput").value;
  state.song = el("#songInput").value;
  state.artist = el("#artistInput").value;
  state.sparkles = el("#sparklesInput").checked;
  state.float = el("#floatInput").checked;
  state.motion = Number(el("#motionInput").value) / 100;
}
document.querySelectorAll("input, textarea").forEach(node => {
  node.addEventListener("input", updateTextState);
  node.addEventListener("change", updateTextState);
});

async function fileToImage(file) {
  if (!file) return null;
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

el("#bgInput").addEventListener("change", async e => state.images.bg = await fileToImage(e.target.files[0]));
el("#leftInput").addEventListener("change", async e => state.images.left = await fileToImage(e.target.files[0]));
el("#rightInput").addEventListener("change", async e => state.images.right = await fileToImage(e.target.files[0]));

let start = performance.now();
function loop(now){
  const t = state.playing ? (now-start)/1000 : 0;
  render(t);
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

el("#playBtn").addEventListener("click", () => {
  state.playing = !state.playing;
  start = performance.now();
  el("#playBtn").textContent = state.playing ? "일시정지" : "재생";
});

el("#fitBtn").addEventListener("click", () => {
  canvas.scrollIntoView({ behavior: "smooth", block: "center" });
});

el("#resetBtn").addEventListener("click", () => {
  location.reload();
});

function downloadBlob(blob, filename) {
  const a = document.createElement("a");
  const url = URL.createObjectURL(blob);
  a.href = url; a.download = filename; a.click();
  setTimeout(()=>URL.revokeObjectURL(url), 1500);
}

el("#jpgBtn").addEventListener("click", () => {
  render((performance.now()-start)/1000);
  canvas.toBlob(blob => downloadBlob(blob, "layout.jpg"), "image/jpeg", 0.95);
});

const progressWrap = el("#progressWrap");
const progressBar = el("#progressBar");
const progressText = el("#progressText");

el("#gifBtn").addEventListener("click", async () => {
  const btn = el("#gifBtn");
  btn.disabled = true;
  btn.textContent = "GIF 생성 중...";
  progressWrap.classList.remove("hidden");

  try {
    const fps = 12;
    const duration = 3;
    const frames = fps * duration;
    const gif = GIFEncoder();

    for (let i=0; i<frames; i++) {
      const t = i / fps;
      render(t);
      const rgba = ctx.getImageData(0,0,W,H).data;
      const palette = quantize(rgba, 256);
      const index = applyPalette(rgba, palette);
      gif.writeFrame(index, W, H, { palette, delay: Math.round(1000/fps) });

      const pct = Math.round(((i+1)/frames)*100);
      progressBar.style.width = pct + "%";
      progressText.textContent = pct + "%";
      await new Promise(r => setTimeout(r, 0));
    }

    gif.finish();
    const blob = new Blob([gif.bytes()], { type: "image/gif" });
    downloadBlob(blob, "layout.gif");
  } catch (err) {
    console.error(err);
    alert("GIF 생성 중 오류가 발생했습니다. 브라우저 콘솔을 확인해주세요.");
  } finally {
    btn.disabled = false;
    btn.textContent = "GIF 저장";
    setTimeout(() => {
      progressWrap.classList.add("hidden");
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
    }, 800);
  }
});
