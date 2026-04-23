import { useState, useEffect, useRef, useCallback } from "react";

// ─── Butterfly Designs (12 unique species) ───────────────────────────────────
const BUTTERFLIES = [
  { id: 0, name: "Monarch",    top: "#FF6B35", mid: "#FF8C42", bot: "#FFB347", body: "#4A1F00", antenna: "#FF6B35", spot: "#FFF3E0" },
  { id: 1, name: "Morpho",     top: "#0066FF", mid: "#0099FF", bot: "#66CCFF", body: "#001A4D", antenna: "#0066FF", spot: "#E0F0FF" },
  { id: 2, name: "Swallowtail",top: "#FFD700", mid: "#FFA500", bot: "#FF8C00", body: "#3D2B00", antenna: "#B8860B", spot: "#FFFCE0" },
  { id: 3, name: "Glasswing",  top: "#88FFD1", mid: "#00E5AA", bot: "#00C896", body: "#004D3A", antenna: "#00E5AA", spot: "#E0FFF6" },
  { id: 4, name: "Peacock",    top: "#8B00FF", mid: "#6A00CC", bot: "#9900FF", body: "#2D0052", antenna: "#8B00FF", spot: "#F0E0FF" },
  { id: 5, name: "Painted",    top: "#FF1493", mid: "#FF69B4", bot: "#FFB6C1", body: "#5C0025", antenna: "#FF1493", spot: "#FFE0EE" },
  { id: 6, name: "Skipper",    top: "#FF4500", mid: "#FF6347", bot: "#FF7F50", body: "#5C1000", antenna: "#FF4500", spot: "#FFF0EC" },
  { id: 7, name: "Cabbage",    top: "#E8FFD0", mid: "#B5E853", bot: "#8BC34A", body: "#2E4A00", antenna: "#8BC34A", spot: "#F0FFE0" },
  { id: 8, name: "Birdwing",   top: "#00CED1", mid: "#20B2AA", bot: "#008B8B", body: "#003333", antenna: "#00CED1", spot: "#E0FFFF" },
  { id: 9, name: "RedAdmiral", top: "#CC0000", mid: "#FF2222", bot: "#FF6666", body: "#3D0000", antenna: "#CC0000", spot: "#FFE0E0" },
  { id: 10,name: "Sulphur",    top: "#CCFF00", mid: "#AAEE00", bot: "#88CC00", body: "#2D3D00", antenna: "#AAEE00", spot: "#F5FFE0" },
  { id: 11,name: "Zebra",      top: "#1A1A2E", mid: "#16213E", bot: "#0F3460", body: "#000010", antenna: "#E0E0FF", spot: "#F0F0FF" },
];

// ─── SVG Butterfly Component ─────────────────────────────────────────────────
function ButterflyIcon({ bf, size = 52, flap = false, selected = false }) {
  const s = size;
  const cx = s / 2, cy = s / 2;
  const flapOffset = flap ? Math.sin(Date.now() / 200) * 4 : 0;

  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      {/* Upper wings */}
      <path
        d={`M${cx} ${cy} Q${cx - 18} ${cy - 16 + flapOffset} ${cx - 22} ${cy - 5 + flapOffset} Q${cx - 24} ${cy + 2} ${cx} ${cy}`}
        fill={bf.top} opacity="0.95"
      />
      <path
        d={`M${cx} ${cy} Q${cx + 18} ${cy - 16 + flapOffset} ${cx + 22} ${cy - 5 + flapOffset} Q${cx + 24} ${cy + 2} ${cx} ${cy}`}
        fill={bf.top} opacity="0.95"
      />
      {/* Lower wings */}
      <path
        d={`M${cx} ${cy} Q${cx - 14} ${cy + 10 - flapOffset * 0.5} ${cx - 16} ${cy + 20 - flapOffset * 0.5} Q${cx - 10} ${cy + 26} ${cx} ${cy}`}
        fill={bf.mid} opacity="0.9"
      />
      <path
        d={`M${cx} ${cy} Q${cx + 14} ${cy + 10 - flapOffset * 0.5} ${cx + 16} ${cy + 20 - flapOffset * 0.5} Q${cx + 10} ${cy + 26} ${cx} ${cy}`}
        fill={bf.mid} opacity="0.9"
      />
      {/* Wing patterns */}
      <circle cx={cx - 15} cy={cy - 7 + flapOffset} r="3.5" fill={bf.bot} opacity="0.75" />
      <circle cx={cx + 15} cy={cy - 7 + flapOffset} r="3.5" fill={bf.bot} opacity="0.75" />
      <circle cx={cx - 12} cy={cy - 1 + flapOffset} r="2" fill="white" opacity="0.35" />
      <circle cx={cx + 12} cy={cy - 1 + flapOffset} r="2" fill="white" opacity="0.35" />
      {/* Body */}
      <ellipse cx={cx} cy={cy + 1} rx="2.2" ry="9" fill={bf.body} />
      <circle cx={cx} cy={cy - 9} r="3" fill={bf.body} />
      {/* Antennae */}
      <line x1={cx - 1} y1={cy - 10} x2={cx - 7} y2={cy - 18} stroke={bf.antenna} strokeWidth="1.2" />
      <line x1={cx + 1} y1={cy - 10} x2={cx + 7} y2={cy - 18} stroke={bf.antenna} strokeWidth="1.2" />
      <circle cx={cx - 7} cy={cy - 19} r="1.5" fill={bf.antenna} />
      <circle cx={cx + 7} cy={cy - 19} r="1.5" fill={bf.antenna} />
      {/* Selected glow */}
      {selected && (
        <circle cx={cx} cy={cy} r={s / 2 - 2} fill="none" stroke="white" strokeWidth="2.5" opacity="0.8" />
      )}
    </svg>
  );
}

// ─── Animated Butterfly (for flying particles) ───────────────────────────────
function FlyingButterfly({ bf, x, y, onDone }) {
  const [pos, setPos] = useState({ x, y, opacity: 1, scale: 1, rot: 0 });
  const frame = useRef(0);
  const dx = (Math.random() - 0.5) * 180;
  const dy = -60 - Math.random() * 100;

  useEffect(() => {
    let start = null;
    const duration = 900;
    function animate(ts) {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      setPos({
        x: x + dx * p,
        y: y + dy * p,
        opacity: 1 - p,
        scale: 1 - p * 0.7,
        rot: p * 360 * (Math.random() > 0.5 ? 1 : -1),
      });
      if (p < 1) frame.current = requestAnimationFrame(animate);
      else onDone();
    }
    frame.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame.current);
  }, []);

  return (
    <div
      style={{
        position: "fixed", left: pos.x - 16, top: pos.y - 16,
        opacity: pos.opacity, transform: `scale(${pos.scale}) rotate(${pos.rot}deg)`,
        pointerEvents: "none", zIndex: 9999,
      }}
    >
      <ButterflyIcon bf={bf} size={32} />
    </div>
  );
}

// ─── Game Grid Logic ──────────────────────────────────────────────────────────
const COLS = 10, ROWS = 8;

function buildGrid(bfCount = 12) {
  const inner = [];
  for (let r = 1; r < ROWS - 1; r++)
    for (let c = 1; c < COLS - 1; c++)
      inner.push([r, c]);
  const pairs = Math.floor(inner.length / 2);
  const types = [];
  for (let i = 0; i < pairs; i++) types.push(i % bfCount);
  const all = [...types, ...types].slice(0, inner.length);
  // Fisher-Yates shuffle
  for (let i = all.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [all[i], all[j]] = [all[j], all[i]];
  }
  const grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
  inner.forEach(([r, c], i) => {
    if (i < all.length) grid[r][c] = { t: all[i], gone: false };
  });
  return { grid, totalPairs: pairs };
}

function isFree(grid, r, c, er1, ec1, er2, ec2) {
  if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return true;
  if ((r === er1 && c === ec1) || (r === er2 && c === ec2)) return true;
  return !grid[r][c] || grid[r][c].gone;
}

function lineClear(grid, r1, c1, r2, c2, er1, ec1, er2, ec2) {
  if (r1 === r2) {
    const mn = Math.min(c1, c2), mx = Math.max(c1, c2);
    for (let c = mn; c <= mx; c++) if (!isFree(grid, r1, c, er1, ec1, er2, ec2)) return false;
    return true;
  }
  if (c1 === c2) {
    const mn = Math.min(r1, r2), mx = Math.max(r1, r2);
    for (let r = mn; r <= mx; r++) if (!isFree(grid, r, c1, er1, ec1, er2, ec2)) return false;
    return true;
  }
  return false;
}

function canConnect(grid, r1, c1, r2, c2) {
  if (r1 === r2 && c1 === c2) return null;
  if (!grid[r1]?.[c1] || !grid[r2]?.[c2]) return null;
  if (grid[r1][c1].gone || grid[r2][c2].gone) return null;
  if (grid[r1][c1].t !== grid[r2][c2].t) return null;
  // Direct line
  if (lineClear(grid, r1, c1, r2, c2, r1, c1, r2, c2)) return [[r1, c1], [r2, c2]];
  // One bend
  for (const [cr, cc] of [[r1, c2], [r2, c1]]) {
    if (isFree(grid, cr, cc, r1, c1, r2, c2) &&
      lineClear(grid, r1, c1, cr, cc, r1, c1, r2, c2) &&
      lineClear(grid, cr, cc, r2, c2, r1, c1, r2, c2))
      return [[r1, c1], [cr, cc], [r2, c2]];
  }
  // Two bends (horizontal corridor)
  for (let c = 0; c < COLS; c++) {
    if (isFree(grid, r1, c, r1, c1, r2, c2) && isFree(grid, r2, c, r1, c1, r2, c2) &&
      lineClear(grid, r1, c1, r1, c, r1, c1, r2, c2) &&
      lineClear(grid, r1, c, r2, c, r1, c1, r2, c2) &&
      lineClear(grid, r2, c, r2, c2, r1, c1, r2, c2))
      return [[r1, c1], [r1, c], [r2, c], [r2, c2]];
  }
  // Two bends (vertical corridor)
  for (let r = 0; r < ROWS; r++) {
    if (isFree(grid, r, c1, r1, c1, r2, c2) && isFree(grid, r, c2, r1, c1, r2, c2) &&
      lineClear(grid, r1, c1, r, c1, r1, c1, r2, c2) &&
      lineClear(grid, r, c1, r, c2, r1, c1, r2, c2) &&
      lineClear(grid, r, c2, r2, c2, r1, c1, r2, c2))
      return [[r1, c1], [r, c1], [r, c2], [r2, c2]];
  }
  return null;
}

function hasAnyMove(grid) {
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] && !grid[r][c].gone) cells.push([r, c]);
  for (let i = 0; i < cells.length; i++)
    for (let j = i + 1; j < cells.length; j++) {
      const [r1, c1] = cells[i], [r2, c2] = cells[j];
      if (grid[r1][c1].t === grid[r2][c2].t && canConnect(grid, r1, c1, r2, c2)) return true;
    }
  return false;
}

function findHint(grid) {
  const cells = [];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      if (grid[r][c] && !grid[r][c].gone) cells.push([r, c]);
  for (let i = 0; i < cells.length; i++)
    for (let j = i + 1; j < cells.length; j++) {
      const [r1, c1] = cells[i], [r2, c2] = cells[j];
      if (grid[r1][c1].t === grid[r2][c2].t && canConnect(grid, r1, c1, r2, c2))
        return [[r1, c1], [r2, c2]];
    }
  return null;
}

// ─── Path Drawing Canvas ──────────────────────────────────────────────────────
function PathCanvas({ path, gridRef }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!path || !gridRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const grid = gridRef.current;
    const rect = grid.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cells = grid.querySelectorAll("[data-cell]");
    if (!cells.length) return;
    const firstCell = cells[0];
    const cRect = firstCell.getBoundingClientRect();
    const cellW = cRect.width;
    const cellH = cRect.height;
    const gap = 3;

    function center(r, c) {
      return [
        6 + c * (cellW + gap) + cellW / 2,
        6 + r * (cellH + gap) + cellH / 2,
      ];
    }

    ctx.strokeStyle = "rgba(255, 230, 50, 0.9)";
    ctx.lineWidth = 3.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.setLineDash([8, 5]);
    ctx.shadowColor = "rgba(255, 200, 0, 0.6)";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    path.forEach(([r, c], i) => {
      const [x, y] = center(r, c);
      i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    });
    ctx.stroke();

    const timer = setTimeout(() => ctx.clearRect(0, 0, canvas.width, canvas.height), 600);
    return () => clearTimeout(timer);
  }, [path]);

  return (
    <canvas
      ref={canvasRef}
      style={{ position: "absolute", inset: 0, pointerEvents: "none", zIndex: 50 }}
    />
  );
}

// ─── Nature Background (Sky + Clouds + Flowers + Fireflies) ──────────────────
function NatureBackground({ scene }) {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 60);
    return () => clearInterval(id);
  }, []);

  // Sky gradient based on scene
  const skyGrad = scene === "win"
    ? "linear-gradient(180deg, #0a2a0a 0%, #1a4a20 30%, #2d6e35 55%, #4a8c4a 75%, #6aaf6a 100%)"
    : scene === "lose"
    ? "linear-gradient(180deg, #1a0505 0%, #3a1010 35%, #5c1c1c 60%, #7a2828 80%, #8a3535 100%)"
    : "linear-gradient(180deg, #0b0e2e 0%, #1a1060 20%, #3d1878 45%, #7b2d8b 65%, #c2527e 80%, #f4926a 92%, #ffc07a 100%)";

  // Clouds
  const clouds = useRef(Array.from({ length: 6 }, (_, i) => ({
    id: i,
    y: 5 + i * 9,
    x: Math.random() * 120 - 10,
    w: 100 + Math.random() * 140,
    h: 28 + Math.random() * 22,
    speed: 0.008 + Math.random() * 0.012,
    opacity: 0.08 + Math.random() * 0.13,
  }))).current;

  // Fireflies
  const flies = useRef(Array.from({ length: 22 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: 40 + Math.random() * 55,
    speed: 0.012 + Math.random() * 0.018,
    phase: Math.random() * Math.PI * 2,
    phaseY: Math.random() * Math.PI * 2,
    blinkPhase: Math.random() * Math.PI * 2,
    color: ["#ffe87a","#b8ffb8","#aad4ff","#ffb8f0","#fff"][i % 5],
    size: 2 + Math.random() * 3,
  }))).current;

  // Flowers along the bottom (static SVG silhouette)
  const flowers = useRef(Array.from({ length: 28 }, (_, i) => ({
    id: i,
    x: (i / 27) * 100 + (Math.random() - 0.5) * 3,
    h: 60 + Math.random() * 90,
    color: ["#ff7eb3","#ffb347","#ff6b6b","#a78bfa","#f472b6","#34d399","#fbbf24"][i % 7],
    stemColor: ["#22c55e","#16a34a","#15803d"][i % 3],
    petalSize: 6 + Math.random() * 7,
  }))).current;

  // Stars (only for non-win dark scenes)
  const stars = useRef(Array.from({ length: 55 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 60,
    r: 0.6 + Math.random() * 1.4,
    blinkPhase: Math.random() * Math.PI * 2,
  }))).current;

  const t = tick * 0.016;

  return (
    <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
      {/* Sky */}
      <div style={{ position: "absolute", inset: 0, background: skyGrad }} />

      {/* Moon / Sun glow */}
      {scene !== "win" && (
        <div style={{
          position: "absolute", left: "72%", top: "12%",
          width: 70, height: 70, borderRadius: "50%",
          background: scene === "lose"
            ? "radial-gradient(circle, #ff4444 0%, #cc0000 60%, transparent 100%)"
            : "radial-gradient(circle, #fff5c0 0%, #ffd97a 40%, transparent 75%)",
          boxShadow: scene === "lose"
            ? "0 0 60px 20px rgba(200,0,0,0.25)"
            : "0 0 80px 30px rgba(255,220,100,0.18)",
          opacity: 0.85,
        }} />
      )}

      {/* Stars */}
      {scene !== "win" && stars.map(s => {
        const blink = 0.5 + 0.5 * Math.sin(t * 1.3 + s.blinkPhase);
        return (
          <div key={s.id} style={{
            position: "absolute",
            left: `${s.x}%`, top: `${s.y}%`,
            width: s.r * 2, height: s.r * 2,
            borderRadius: "50%",
            background: "white",
            opacity: 0.25 + blink * 0.6,
            boxShadow: blink > 0.7 ? `0 0 ${s.r * 4}px white` : "none",
          }} />
        );
      })}

      {/* Clouds */}
      {clouds.map(cl => {
        const cx = ((cl.x + t * cl.speed * 30) % 130) - 10;
        return (
          <div key={cl.id} style={{
            position: "absolute",
            left: `${cx}%`, top: `${cl.y}%`,
            width: cl.w, height: cl.h,
            borderRadius: 999,
            background: scene === "lose"
              ? `rgba(180,60,60,${cl.opacity})`
              : scene === "win"
              ? `rgba(120,220,120,${cl.opacity})`
              : `rgba(220,180,255,${cl.opacity})`,
            filter: "blur(14px)",
          }} />
        );
      })}

      {/* Aurora / Light beams (menu/game only) */}
      {scene !== "win" && scene !== "lose" && [0,1,2].map(i => (
        <div key={i} style={{
          position: "absolute",
          left: `${15 + i * 30}%`, top: 0,
          width: 120, height: "65%",
          background: [
            "linear-gradient(180deg, rgba(120,80,255,0.10) 0%, transparent 100%)",
            "linear-gradient(180deg, rgba(200,80,180,0.09) 0%, transparent 100%)",
            "linear-gradient(180deg, rgba(80,160,255,0.09) 0%, transparent 100%)",
          ][i],
          transform: `rotate(${[-8,0,8][i]}deg) translateX(-50%)`,
          filter: "blur(18px)",
        }} />
      ))}

      {/* Flower silhouette (bottom) */}
      <svg
        viewBox="0 0 1000 220"
        preserveAspectRatio="xMidYMax slice"
        style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: 200, opacity: 0.72 }}
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Ground */}
        <ellipse cx={500} cy={215} rx={560} ry={28}
          fill={scene === "win" ? "#1a5c1a" : scene === "lose" ? "#3a1010" : "#1a0a3a"} />

        {flowers.map(fl => {
          const bx = fl.x * 10;
          const by = 220;
          const sway = Math.sin(t * 0.7 + fl.id * 0.8) * 3;
          return (
            <g key={fl.id} transform={`translate(${bx},${by})`}>
              {/* Stem */}
              <line x1={0} y1={0} x2={sway} y2={-fl.h}
                stroke={fl.stemColor} strokeWidth={2.5} strokeLinecap="round" />
              {/* Petals */}
              {[0,1,2,3,4,5].map(p => {
                const angle = (p / 6) * Math.PI * 2;
                const pr = fl.petalSize;
                return (
                  <ellipse key={p}
                    cx={bx === 0 ? sway + Math.cos(angle) * pr * 1.4 : sway + Math.cos(angle) * pr * 1.4}
                    cy={-fl.h + Math.sin(angle) * pr * 1.4}
                    rx={pr} ry={pr * 0.6}
                    transform={`translate(${sway - bx},0) rotate(${(angle * 180) / Math.PI}, ${sway + Math.cos(angle) * pr * 1.4}, ${-fl.h + Math.sin(angle) * pr * 1.4})`}
                    fill={fl.color} opacity={0.82}
                  />
                );
              })}
              {/* Center */}
              <circle cx={sway} cy={-fl.h} r={fl.petalSize * 0.55}
                fill={scene === "win" ? "#fff59d" : scene === "lose" ? "#ff8a80" : "#fff9c4"}
                opacity={0.9} />
            </g>
          );
        })}
      </svg>

      {/* Fireflies */}
      {flies.map(f => {
        const fx = f.x + Math.sin(t * f.speed * 40 + f.phase) * 7;
        const fy = f.y + Math.cos(t * f.speed * 30 + f.phaseY) * 5;
        const blink = 0.5 + 0.5 * Math.sin(t * 2.5 + f.blinkPhase);
        return (
          <div key={f.id} style={{
            position: "absolute",
            left: `${fx}%`, top: `${fy}%`,
            width: f.size, height: f.size,
            borderRadius: "50%",
            background: f.color,
            opacity: 0.2 + blink * 0.7,
            boxShadow: `0 0 ${f.size * 3}px ${f.size}px ${f.color}`,
          }} />
        );
      })}
    </div>
  );
}

// ─── Floating Butterfly Backgrounds ──────────────────────────────────────────
function FloatingBg({ scene }) {
  const items = useRef(
    Array.from({ length: 14 }, (_, i) => ({
      id: i,
      bf: BUTTERFLIES[i % BUTTERFLIES.length],
      x: Math.random() * 100,
      y: Math.random() * 85,
      size: 28 + Math.random() * 36,
      speed: 0.010 + Math.random() * 0.018,
      phase: Math.random() * Math.PI * 2,
    }))
  );
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 80);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      <NatureBackground scene={scene} />
      <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 1 }}>
        {items.current.map(item => {
          const t = tick * item.speed + item.phase;
          const x = item.x + Math.sin(t) * 9;
          const y = item.y + Math.cos(t * 0.7) * 6;
          return (
            <div
              key={item.id}
              style={{
                position: "absolute",
                left: `${x}%`,
                top: `${y}%`,
                opacity: 0.18,
                transform: `rotate(${Math.sin(t * 2) * 18}deg)`,
                transition: "transform 0.08s",
                filter: "drop-shadow(0 0 6px rgba(255,200,255,0.4))",
              }}
            >
              <ButterflyIcon bf={item.bf} size={item.size} />
            </div>
          );
        })}
      </div>
    </>
  );
}

// ─── Main Game ────────────────────────────────────────────────────────────────
const TOTAL_TIME = 120;

export default function App() {
  const [scene, setScene] = useState("menu"); // menu | game | win | lose
  const [grid, setGrid] = useState([]);
  const [totalPairs, setTotalPairs] = useState(0);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [hints, setHints] = useState(3);
  const [shuffles, setShuffles] = useState(2);
  const [hintCells, setHintCells] = useState(null);
  const [activePath, setActivePath] = useState(null);
  const [particles, setParticles] = useState([]);
  const [comboText, setComboText] = useState(null);
  const [level, setLevel] = useState(1);
  const [flapTick, setFlapTick] = useState(0);

  const gridRef = useRef(null);
  const timerRef = useRef(null);

  // Wing flap animation tick
  useEffect(() => {
    const id = setInterval(() => setFlapTick(t => t + 1), 120);
    return () => clearInterval(id);
  }, []);

  // Timer
  useEffect(() => {
    if (scene !== "game") { clearInterval(timerRef.current); return; }
    timerRef.current = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) { clearInterval(timerRef.current); setScene("lose"); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(timerRef.current);
  }, [scene]);

  const startGame = useCallback(() => {
    const { grid: g, totalPairs: tp } = buildGrid(12);
    setGrid(g);
    setTotalPairs(tp);
    setMatchedPairs(0);
    setSelected(null);
    setScore(0);
    setCombo(0);
    setTimeLeft(TOTAL_TIME);
    setHints(3);
    setShuffles(2);
    setHintCells(null);
    setActivePath(null);
    setParticles([]);
    setLevel(1);
    setScene("game");
  }, []);

  const doShuffle = useCallback(() => {
    if (shuffles <= 0) return;
    setShuffles(s => s - 1);
    setGrid(g => {
      const newGrid = g.map(r => r.map(c => c ? { ...c } : null));
      const cells = [];
      for (let r = 0; r < ROWS; r++)
        for (let c = 0; c < COLS; c++)
          if (newGrid[r][c] && !newGrid[r][c].gone) cells.push([r, c]);
      const types = cells.map(([r, c]) => newGrid[r][c].t);
      for (let i = types.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [types[i], types[j]] = [types[j], types[i]];
      }
      cells.forEach(([r, c], i) => { newGrid[r][c].t = types[i]; });
      return newGrid;
    });
    setSelected(null);
    setCombo(0);
  }, [shuffles]);

  const useHint = useCallback(() => {
    if (hints <= 0) return;
    const hint = findHint(grid);
    if (!hint) return;
    setHints(h => h - 1);
    setHintCells(hint);
    setTimeout(() => setHintCells(null), 1800);
  }, [grid, hints]);

  const spawnParticles = useCallback((r1, c1, r2, c2, type) => {
    const cells = gridRef.current?.querySelectorAll("[data-cell]");
    const getPos = (r, c) => {
      const el = gridRef.current?.querySelector(`[data-cell="${r}-${c}"]`);
      if (!el) return { x: 0, y: 0 };
      const rect = el.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    };
    const p1 = getPos(r1, c1);
    const p2 = getPos(r2, c2);
    const id1 = Date.now();
    const id2 = id1 + 1;
    setParticles(ps => [
      ...ps,
      { id: id1, x: p1.x, y: p1.y, bf: BUTTERFLIES[type] },
      { id: id2, x: p2.x, y: p2.y, bf: BUTTERFLIES[type] },
    ]);
  }, []);

  const handleCellClick = useCallback((r, c) => {
    if (scene !== "game") return;
    const cell = grid[r]?.[c];
    if (!cell || cell.gone) return;

    if (!selected) {
      setSelected([r, c]);
      return;
    }

    const [sr, sc] = selected;
    if (sr === r && sc === c) { setSelected(null); return; }

    const path = canConnect(grid, sr, sc, r, c);
    if (path) {
      const type = grid[sr][sc].t;
      const newCombo = combo + 1;
      const pts = 10 + (newCombo > 1 ? newCombo * 5 : 0);

      setSelected(null);
      setActivePath(path);
      setCombo(newCombo);
      setScore(s => s + pts);

      if (newCombo >= 2) {
        setComboText(newCombo === 2 ? "Nice! ×2" : newCombo === 3 ? "Great! ×3" : newCombo >= 4 ? `WOW! ×${newCombo}` : null);
        setTimeout(() => setComboText(null), 1000);
      }

      spawnParticles(sr, sc, r, c, type);

      setTimeout(() => {
        setActivePath(null);
        setGrid(g => {
          const ng = g.map(row => row.map(c => c ? { ...c } : null));
          ng[sr][sc] = { ...ng[sr][sc], gone: true };
          ng[r][c] = { ...ng[r][c], gone: true };
          return ng;
        });
        setMatchedPairs(mp => {
          const next = mp + 1;
          if (next >= totalPairs) {
            clearInterval(timerRef.current);
            setTimeout(() => setScene("win"), 400);
          }
          return next;
        });
      }, 420);
    } else {
      setSelected([r, c]);
      setCombo(0);
    }
  }, [scene, grid, selected, combo, totalPairs, spawnParticles]);

  // Check for no moves after grid changes
  useEffect(() => {
    if (scene !== "game" || !grid.length) return;
    const cells = [];
    for (let r = 0; r < ROWS; r++)
      for (let c = 0; c < COLS; c++)
        if (grid[r][c] && !grid[r][c].gone) cells.push([r, c]);
    if (cells.length > 0 && !hasAnyMove(grid)) {
      // Auto shuffle if available, else show notice
      if (shuffles > 0) {
        setTimeout(() => doShuffle(), 600);
      }
    }
  }, [grid, scene]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const timePct = (timeLeft / TOTAL_TIME) * 100;
  const urgent = timeLeft <= 15;

  // ── Menu Screen ──
  if (scene === "menu") return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "transparent",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", position: "relative",
    }}>
      <FloatingBg scene="menu" />
      {/* Stars */}
      {Array.from({ length: 0 }, (_, i) => (
        <div key={i} style={{
          position: "fixed",
          left: `${Math.random() * 100}%`, top: `${Math.random() * 80}%`,
          width: `${1 + Math.random() * 2}px`, height: `${1 + Math.random() * 2}px`,
          borderRadius: "50%", background: "white",
          opacity: 0.3 + Math.random() * 0.5,
          animation: `pulse ${2 + Math.random() * 3}s infinite`,
          pointerEvents: "none",
        }} />
      ))}

      <style>{`
        @keyframes pulse { 0%,100%{opacity:0.3} 50%{opacity:1} }
        @keyframes floatUp { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes shimmer { 0%{filter:hue-rotate(0deg)} 100%{filter:hue-rotate(360deg)} }
        @keyframes fadeSlide { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
      `}</style>

      <div style={{ position: "relative", zIndex: 10, textAlign: "center", animation: "fadeSlide 0.8s ease" }}>
        {/* Logo butterflies row */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", marginBottom: 16, animation: "floatUp 3s ease-in-out infinite" }}>
          {[0, 3, 5, 8, 11].map(i => (
            <div key={i} style={{ animation: `floatUp ${2.5 + i * 0.3}s ease-in-out infinite`, animationDelay: `${i * 0.2}s` }}>
              <ButterflyIcon bf={BUTTERFLIES[i]} size={48} />
            </div>
          ))}
        </div>

        <h1 style={{
          fontSize: "clamp(32px, 6vw, 64px)", fontWeight: 900,
          letterSpacing: "4px", color: "white", margin: "0 0 6px",
          textShadow: "0 0 30px rgba(150, 120, 255, 0.8), 0 4px 8px rgba(0,0,0,0.5)",
          fontFamily: "'Georgia', serif",
        }}>🦋 BUTTERFLY MATCH</h1>

        <p style={{ color: "#88AAFF", letterSpacing: "4px", fontSize: 13, textTransform: "uppercase", marginBottom: 32 }}>
          Connect the Pairs
        </p>

        <div style={{ display: "flex", gap: 16, flexDirection: "column", alignItems: "center" }}>
          <button
            onClick={startGame}
            style={{
              background: "linear-gradient(135deg, #6D28D9, #4F46E5, #2563EB)",
              color: "white", border: "none", borderRadius: 60,
              padding: "18px 60px", fontSize: 22, fontWeight: 800,
              cursor: "pointer", letterSpacing: 2,
              boxShadow: "0 6px 30px rgba(109,40,217,0.6)",
              transition: "transform 0.15s, box-shadow 0.15s",
            }}
            onMouseEnter={e => { e.target.style.transform = "scale(1.07)"; e.target.style.boxShadow = "0 10px 40px rgba(109,40,217,0.8)"; }}
            onMouseLeave={e => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 6px 30px rgba(109,40,217,0.6)"; }}
          >▶ Play Now</button>

          <div style={{ display: "flex", gap: 24, color: "#6699AA", fontSize: 13, marginTop: 12 }}>
            <span>⏱ 2 min timer</span>
            <span>💡 3 hints</span>
            <span>🔀 2 shuffles</span>
          </div>
        </div>

        <div style={{ marginTop: 48, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center", opacity: 0.5 }}>
          {BUTTERFLIES.slice(0, 8).map((bf, i) => (
            <div key={i} style={{ opacity: 0.6 + (i % 3) * 0.15 }}>
              <ButterflyIcon bf={bf} size={32} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Win/Lose Screen ──
  if (scene === "win" || scene === "lose") return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "transparent",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      fontFamily: "'Georgia', serif", position: "relative",
    }}>
      <FloatingBg scene={scene} />
      <div style={{ position: "relative", zIndex: 10, textAlign: "center", animation: "fadeSlide 0.6s ease" }}>
        <style>{`@keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
        <div style={{ fontSize: 72, lineHeight: 1, marginBottom: 16 }}>{scene === "win" ? "🎉" : "⏰"}</div>
        <h2 style={{ color: scene === "win" ? "#FFD700" : "#FF6B6B", fontSize: 48, fontWeight: 900, margin: "0 0 12px", letterSpacing: 2 }}>
          {scene === "win" ? "You Won!" : "Time's Up!"}
        </h2>
        <p style={{ color: "#88AAFF", fontSize: 20, marginBottom: 8 }}>Score: <b style={{ color: "white" }}>{score}</b></p>
        <p style={{ color: "#668899", fontSize: 15, marginBottom: 32 }}>Pairs matched: {matchedPairs} / {totalPairs}</p>
        <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
          <button onClick={startGame} style={{
            background: "linear-gradient(135deg, #6D28D9, #2563EB)", color: "white",
            border: "none", borderRadius: 40, padding: "14px 40px", fontSize: 18, fontWeight: 700,
            cursor: "pointer", boxShadow: "0 4px 20px rgba(109,40,217,0.5)",
          }}>▶ Play Again</button>
          <button onClick={() => setScene("menu")} style={{
            background: "rgba(255,255,255,0.1)", color: "#AAC",
            border: "1px solid rgba(255,255,255,0.2)", borderRadius: 40, padding: "14px 32px",
            fontSize: 18, fontWeight: 600, cursor: "pointer",
          }}>🏠 Menu</button>
        </div>
      </div>
    </div>
  );

  // ── Game Screen ──
  return (
    <div style={{
      width: "100vw", height: "100vh", overflow: "hidden",
      background: "transparent",
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Georgia', serif", userSelect: "none", position: "relative",
    }}>
      <style>{`
        @keyframes hintPulse{0%,100%{box-shadow:none;transform:scale(1)}50%{box-shadow:0 0 0 4px #FFD700,0 0 20px #FFD70080;transform:scale(1.15)}}
        @keyframes matchPop{0%{transform:scale(1.2)}60%{transform:scale(1.4);opacity:0.5}100%{transform:scale(0);opacity:0}}
        @keyframes fadeSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
        @keyframes comboIn{0%{opacity:0;transform:translate(-50%,-50%) scale(0.5)}20%{opacity:1;transform:translate(-50%,-70%) scale(1.3)}80%{opacity:1;transform:translate(-50%,-90%) scale(1)}100%{opacity:0;transform:translate(-50%,-120%) scale(0.9)}}
        @keyframes urgentPulse{0%,100%{opacity:1}50%{opacity:0.4}}
      `}</style>
      <FloatingBg scene="game" />

      {/* Particles */}
      {particles.map(p => (
        <FlyingButterfly key={p.id} bf={p.bf} x={p.x} y={p.y} onDone={() => setParticles(ps => ps.filter(x => x.id !== p.id))} />
      ))}

      {/* Combo text */}
      {comboText && (
        <div style={{
          position: "fixed", top: "40%", left: "50%",
          fontSize: 32, fontWeight: 900, color: "#FFD700",
          textShadow: "0 2px 10px rgba(0,0,0,0.6)",
          animation: "comboIn 1s ease-out forwards",
          pointerEvents: "none", zIndex: 9000, whiteSpace: "nowrap",
        }}>{comboText}</div>
      )}

      {/* ── HUD ── */}
      <div style={{
        position: "relative", zIndex: 100,
        width: "min(98vw, 780px)", display: "flex", alignItems: "center",
        justifyContent: "space-between", padding: "8px 12px",
        background: "rgba(0,0,0,0.45)", borderRadius: 14,
        border: "1px solid rgba(100,100,200,0.3)",
        margin: "8px 0 6px", gap: 8, backdropFilter: "blur(8px)",
      }}>
        {/* Level */}
        <div style={{
          width: 44, height: 44, borderRadius: "50%",
          background: "linear-gradient(135deg, #D4A017, #F5C842)",
          border: "3px solid white", display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 18, fontWeight: 900, color: "#5a3a00",
          boxShadow: "0 2px 10px rgba(0,0,0,0.3)", flexShrink: 0,
        }}>{level}</div>

        {/* Score */}
        <div style={{ textAlign: "center", minWidth: 60 }}>
          <div style={{ fontSize: 10, color: "#88AACC", letterSpacing: 1, textTransform: "uppercase" }}>Score</div>
          <div style={{ fontSize: 22, fontWeight: 900, color: "#FFD700" }}>{score}</div>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, maxWidth: 180 }}>
          <div style={{ fontSize: 10, color: "#88AACC", textAlign: "center", marginBottom: 4 }}>
            {matchedPairs} / {totalPairs} pairs
          </div>
          <div style={{ height: 6, background: "rgba(255,255,255,0.15)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 4, transition: "width 0.4s",
              background: "linear-gradient(90deg, #4ADE80, #22C55E)",
              width: `${(matchedPairs / totalPairs) * 100}%`,
            }} />
          </div>
        </div>

        {/* Timer */}
        <div style={{
          display: "flex", flexDirection: "column", alignItems: "center",
          background: "rgba(0,0,0,0.4)", border: `2px solid ${urgent ? "#FF4444" : "#4FA8DD"}`,
          borderRadius: 10, padding: "4px 14px", minWidth: 80,
        }}>
          <div style={{ fontSize: 10, color: "#9FD8FF", letterSpacing: 1 }}>TIME</div>
          <div style={{
            fontSize: 24, fontWeight: 900, color: urgent ? "#FF4444" : "white",
            fontVariantNumeric: "tabular-nums",
            animation: urgent ? "urgentPulse 0.5s infinite" : "none",
          }}>{fmt(timeLeft)}</div>
          <div style={{ width: 60, height: 5, background: "rgba(255,255,255,0.2)", borderRadius: 3, overflow: "hidden" }}>
            <div style={{
              height: "100%", borderRadius: 3,
              background: urgent ? "linear-gradient(90deg,#FF6B35,#FF4444)" : "linear-gradient(90deg,#4FA8DD,#00E5FF)",
              width: `${timePct}%`, transition: "width 0.9s linear",
            }} />
          </div>
        </div>

        {/* Hint button */}
        <button onClick={useHint} disabled={hints <= 0} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          background: hints > 0 ? "linear-gradient(135deg,#1E6FB5,#1A5A96)" : "rgba(50,50,80,0.5)",
          border: `2px solid ${hints > 0 ? "#4FA8DD" : "#335"}`,
          borderRadius: "50%", width: 52, height: 52, cursor: hints > 0 ? "pointer" : "not-allowed",
          color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
          justifyContent: "center", transition: "transform 0.12s", flexShrink: 0,
          position: "relative",
        }}>
          💡<span style={{ fontSize: 8 }}>HINT</span>
          <div style={{
            position: "absolute", top: -5, right: -5, background: "#FF6B35", color: "white",
            borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid white",
          }}>{hints}</div>
        </button>

        {/* Shuffle button */}
        <button onClick={doShuffle} disabled={shuffles <= 0} style={{
          display: "flex", flexDirection: "column", alignItems: "center", gap: 1,
          background: shuffles > 0 ? "linear-gradient(135deg,#1E6FB5,#1A5A96)" : "rgba(50,50,80,0.5)",
          border: `2px solid ${shuffles > 0 ? "#4FA8DD" : "#335"}`,
          borderRadius: "50%", width: 52, height: 52, cursor: shuffles > 0 ? "pointer" : "not-allowed",
          color: "white", fontSize: 9, fontWeight: 700, letterSpacing: 0.5,
          justifyContent: "center", transition: "transform 0.12s", flexShrink: 0,
          position: "relative",
        }}>
          🔀<span style={{ fontSize: 8 }}>MIX</span>
          <div style={{
            position: "absolute", top: -5, right: -5, background: "#FF6B35", color: "white",
            borderRadius: "50%", width: 18, height: 18, fontSize: 11, fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center", border: "1.5px solid white",
          }}>{shuffles}</div>
        </button>
      </div>

      {/* ── Board ── */}
      <div style={{
        position: "relative", zIndex: 10,
        background: "rgba(80,60,150,0.45)",
        border: "2px solid rgba(150,120,255,0.35)",
        borderRadius: 14, padding: 6,
        boxShadow: "0 8px 40px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
        overflow: "hidden",
        maxWidth: "min(98vw, 780px)", width: "100%",
      }}>
        <PathCanvas path={activePath} gridRef={gridRef} />

        <div
          ref={gridRef}
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${COLS}, 1fr)`,
            gap: 3,
          }}
        >
          {grid.map((row, r) =>
            row.map((cell, c) => {
              if (!cell) {
                return <div key={`${r}-${c}`} style={{ aspectRatio: "1", borderRadius: 10 }} />;
              }

              const isSelected = selected?.[0] === r && selected?.[1] === c;
              const isHint = hintCells?.some(([hr, hc]) => hr === r && hc === c);
              const bf = BUTTERFLIES[cell.t];
              const flap = flapTick % 3 === (r + c) % 3;

              return (
                <div
                  key={`${r}-${c}`}
                  data-cell={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 10,
                    cursor: cell.gone ? "default" : "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                    background: cell.gone
                      ? "transparent"
                      : isSelected
                        ? `rgba(255,255,255,0.2)`
                        : `rgba(${parseInt(bf.spot.slice(1, 3), 16)},${parseInt(bf.spot.slice(3, 5), 16)},${parseInt(bf.spot.slice(5, 7), 16)},0.25)`,
                    border: cell.gone
                      ? "1.5px solid transparent"
                      : isSelected
                        ? "2px solid rgba(255,255,255,0.9)"
                        : "1.5px solid rgba(150,120,255,0.3)",
                    opacity: cell.gone ? 0 : 1,
                    transform: isSelected ? "scale(1.1)" : "scale(1)",
                    boxShadow: isSelected
                      ? "0 0 0 3px rgba(255,255,255,0.5), 0 0 16px rgba(200,180,255,0.7)"
                      : isHint
                        ? "0 0 0 3px #FFD700, 0 0 16px rgba(255,215,0,0.6)"
                        : "none",
                    transition: "transform 0.12s, opacity 0.25s, box-shadow 0.12s",
                    animation: isHint ? "hintPulse 0.6s ease-in-out 3" : "none",
                    pointerEvents: cell.gone ? "none" : "auto",
                    overflow: "hidden",
                  }}
                >
                  {!cell.gone && (
                    <ButterflyIcon
                      bf={bf}
                      size={Math.min(52, Math.floor(window.innerWidth / COLS - 8))}
                      flap={flap && !isSelected}
                      selected={isSelected}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Bottom nav */}
      <div style={{
        position: "relative", zIndex: 100, marginTop: 8,
        display: "flex", gap: 12, alignItems: "center",
      }}>
        <button onClick={() => { clearInterval(timerRef.current); setScene("menu"); }} style={{
          background: "rgba(255,255,255,0.08)", color: "#88AACC",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: 24,
          padding: "6px 20px", fontSize: 13, cursor: "pointer",
        }}>🏠 Menu</button>
        <span style={{ color: "#445566", fontSize: 12 }}>Combo: <b style={{ color: combo >= 2 ? "#FFD700" : "#668899" }}>×{combo}</b></span>
      </div>
    </div>
  );
}
