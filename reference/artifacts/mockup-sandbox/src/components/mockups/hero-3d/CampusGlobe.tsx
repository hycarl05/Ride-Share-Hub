import { useEffect, useRef } from "react";
import * as THREE from "three";

export function CampusGlobe() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x060d1a, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 5.5);

    // --- Starfield ---
    const starGeo = new THREE.BufferGeometry();
    const starCount = 1800;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 120;
    starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
    scene.add(new THREE.Points(starGeo, starMat));

    // --- Globe wireframe ---
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);

    // Latitude lines
    for (let lat = -80; lat <= 80; lat += 20) {
      const r = Math.cos((lat * Math.PI) / 180);
      const y = Math.sin((lat * Math.PI) / 180);
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, y, Math.sin(a) * r));
      }
      globeGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x0f4c81, transparent: true, opacity: 0.6 })
      ));
    }

    // Longitude lines
    for (let lng = 0; lng < 360; lng += 20) {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const lat = ((i / 64) * 180 - 90) * (Math.PI / 180);
        const lngRad = (lng * Math.PI) / 180;
        pts.push(new THREE.Vector3(
          Math.cos(lat) * Math.cos(lngRad),
          Math.sin(lat),
          Math.cos(lat) * Math.sin(lngRad)
        ));
      }
      globeGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: 0x0f4c81, transparent: true, opacity: 0.6 })
      ));
    }

    // Outer glow shell
    const glowGeo = new THREE.SphereGeometry(1.06, 32, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x3bafda,
      transparent: true,
      opacity: 0.04,
      side: THREE.FrontSide,
    });
    globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

    // Inner solid (very dark)
    const innerGeo = new THREE.SphereGeometry(0.98, 32, 32);
    const innerMat = new THREE.MeshBasicMaterial({ color: 0x060d1a, side: THREE.FrontSide });
    globeGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // --- Location pins on globe ---
    const locations = [
      { lat: 15, lng: 30, color: 0x3bafda },
      { lat: -20, lng: 110, color: 0x5fd4f5 },
      { lat: 40, lng: -60, color: 0xffffff },
      { lat: -40, lng: 170, color: 0x3bafda },
      { lat: 60, lng: 80, color: 0x5fd4f5 },
      { lat: -10, lng: -30, color: 0xffffff },
    ];

    const pinMeshes: { mesh: THREE.Mesh; phase: number }[] = [];
    locations.forEach(({ lat, lng, color }) => {
      const latRad = (lat * Math.PI) / 180;
      const lngRad = (lng * Math.PI) / 180;
      const x = Math.cos(latRad) * Math.cos(lngRad);
      const y = Math.sin(latRad);
      const z = Math.cos(latRad) * Math.sin(lngRad);
      const pos = new THREE.Vector3(x, y, z).normalize().multiplyScalar(1.03);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.028, 8, 8),
        new THREE.MeshBasicMaterial({ color })
      );
      mesh.position.copy(pos);
      globeGroup.add(mesh);
      pinMeshes.push({ mesh, phase: Math.random() * Math.PI * 2 });
    });

    // --- Arcing route lines between locations ---
    function makeArc(from: THREE.Vector3, to: THREE.Vector3, color: number, height = 0.35): THREE.Line {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 80; i++) {
        const t = i / 80;
        const mid = from.clone().lerp(to, t).normalize();
        const bend = Math.sin(t * Math.PI) * height;
        pts.push(mid.clone().multiplyScalar(1 + bend));
      }
      return new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 0.55 })
      );
    }

    const posArr = locations.map(({ lat, lng }) => {
      const latRad = (lat * Math.PI) / 180;
      const lngRad = (lng * Math.PI) / 180;
      return new THREE.Vector3(
        Math.cos(latRad) * Math.cos(lngRad),
        Math.sin(latRad),
        Math.cos(latRad) * Math.sin(lngRad)
      ).normalize();
    });

    const arcs = [
      makeArc(posArr[0], posArr[1], 0x3bafda),
      makeArc(posArr[1], posArr[2], 0x3bafda, 0.4),
      makeArc(posArr[2], posArr[3], 0x5fd4f5, 0.3),
      makeArc(posArr[4], posArr[0], 0x5fd4f5, 0.45),
      makeArc(posArr[3], posArr[5], 0x3bafda, 0.35),
    ];
    arcs.forEach((a) => globeGroup.add(a));

    // --- Particles traveling along arcs ---
    interface Traveler {
      mesh: THREE.Mesh;
      from: THREE.Vector3;
      to: THREE.Vector3;
      progress: number;
      speed: number;
      height: number;
    }

    const travelers: Traveler[] = [];
    const arcDefs = [
      { from: posArr[0], to: posArr[1], height: 0.35 },
      { from: posArr[1], to: posArr[2], height: 0.4 },
      { from: posArr[2], to: posArr[3], height: 0.3 },
      { from: posArr[4], to: posArr[0], height: 0.45 },
    ];

    arcDefs.forEach(({ from, to, height }) => {
      [0, 0.33, 0.66].forEach((offset) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.016, 6, 6),
          new THREE.MeshBasicMaterial({ color: 0x3bafda })
        );
        globeGroup.add(mesh);
        travelers.push({ mesh, from, to, progress: offset, speed: 0.003 + Math.random() * 0.002, height });
      });
    });

    // Mouse
    let targetRotX = 0;
    let targetRotY = 0;
    let currentRotY = 0;
    let isDragging = false;
    let lastX = 0;
    let autoSpin = true;

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging) {
        targetRotY += (e.clientX - lastX) * 0.005;
        lastX = e.clientX;
        autoSpin = false;
      }
      targetRotX = ((e.clientY / window.innerHeight) - 0.5) * 0.4;
    };
    const onMouseDown = (e: MouseEvent) => { isDragging = true; lastX = e.clientX; };
    const onMouseUp = () => { isDragging = false; autoSpin = true; };

    el.addEventListener("mousemove", onMouseMove);
    el.addEventListener("mousedown", onMouseDown);
    el.addEventListener("mouseup", onMouseUp);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let frameId = 0;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.01;

      if (autoSpin) targetRotY += 0.003;
      currentRotY += (targetRotY - currentRotY) * 0.05;
      globeGroup.rotation.y = currentRotY;
      globeGroup.rotation.x += (targetRotX - globeGroup.rotation.x) * 0.05;

      // Pulse pins
      pinMeshes.forEach((p) => {
        p.phase += 0.04;
        const s = 1 + Math.sin(p.phase) * 0.4;
        p.mesh.scale.setScalar(s);
      });

      // Move travelers
      travelers.forEach((tr) => {
        tr.progress = (tr.progress + tr.speed) % 1;
        const tt = tr.progress;
        const mid = tr.from.clone().lerp(tr.to, tt).normalize();
        const bend = Math.sin(tt * Math.PI) * tr.height;
        tr.mesh.position.copy(mid.multiplyScalar(1 + bend));
      });

      // Twinkle stars
      (starMat as THREE.PointsMaterial).opacity = 0.55 + Math.sin(t * 0.7) * 0.05;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("mousemove", onMouseMove);
      el.removeEventListener("mousedown", onMouseDown);
      el.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden relative" style={{ background: "radial-gradient(ellipse at 50% 40%, #0f1e3a 0%, #060d1a 70%)" }}>
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Navbar */}
      <header className="relative z-20 px-8 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-white">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <path d="M12 2L4 6v6c0 5.5 3.5 10.7 8 12 4.5-1.3 8-6.5 8-12V6l-8-4z" fill="#3BAFDA" opacity="0.2" stroke="#3BAFDA" strokeWidth="1.5"/>
            <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <span className="text-lg font-bold tracking-tight">Prebet UPSI</span>
        </div>
        <nav className="flex items-center gap-6">
          <span className="text-sm text-slate-400 hover:text-white cursor-pointer transition-colors">Log in</span>
          <button className="text-sm bg-[#0f4c81] border border-[#3bafda]/40 text-white font-semibold px-5 py-2 rounded-full hover:bg-[#3bafda] transition-colors">
            Sign up
          </button>
        </nav>
      </header>

      {/* Hero — left-aligned this time */}
      <div className="relative z-20 flex-1 flex flex-col justify-center px-12 sm:px-20 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3bafda]/10 border border-[#3bafda]/25 text-[#3bafda] text-xs font-semibold mb-5 w-fit tracking-wide uppercase">
          Verified Campus Transport
        </div>
        <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
          Campus rides,<br />
          <span className="text-[#3bafda]">trusted &amp; safe.</span>
        </h1>
        <p className="text-slate-400 text-base mb-8 leading-relaxed">
          The verified alternative to Telegram bookings. Connect with UPSI-verified drivers instantly.
        </p>
        <div className="flex gap-3">
          <button className="bg-[#3bafda] hover:bg-[#2d9cc7] text-white font-bold px-7 py-3 rounded-full text-sm transition-colors shadow-lg shadow-[#3bafda]/25">
            Get Started
          </button>
          <button className="text-slate-300 hover:text-white font-semibold px-5 py-3 text-sm transition-colors flex items-center gap-1">
            Apply to Drive →
          </button>
        </div>
      </div>

      <div className="relative z-20 text-center pb-5 text-slate-700 text-xs tracking-widest uppercase">
        Drag to rotate globe
      </div>
    </div>
  );
}
