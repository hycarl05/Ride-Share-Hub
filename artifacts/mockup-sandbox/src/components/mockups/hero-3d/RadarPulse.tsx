import { useEffect, useRef } from "react";
import * as THREE from "three";

export function RadarPulse() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // --- Renderer ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x0a1628, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 8, 0);
    camera.lookAt(0, 0, 0);

    // --- Radar base rings ---
    const ringMat = new THREE.LineBasicMaterial({ color: 0x1a3a6b, transparent: true, opacity: 0.7 });
    [1.2, 2.4, 3.6, 4.8].forEach((r) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, 0, Math.sin(a) * r));
      }
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), ringMat.clone()));
    });

    // Crosshairs
    const crossMat = new THREE.LineBasicMaterial({ color: 0x1a3a6b, transparent: true, opacity: 0.5 });
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8)];
      scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), crossMat));
    }

    // --- Radar sweep (fan-shaped with fade) ---
    const sweepGroup = new THREE.Group();
    scene.add(sweepGroup);
    const fanCount = 60;
    const fanLines: THREE.Line[] = [];
    for (let i = 0; i < fanCount; i++) {
      const alpha = (1 - i / fanCount) * 0.85;
      const mat = new THREE.LineBasicMaterial({ color: 0x3bafda, transparent: true, opacity: alpha });
      const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(0) * 4.8, 0, Math.sin(0) * 4.8)];
      const line = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat);
      fanLines.push(line);
      sweepGroup.add(line);
    }

    // --- GPS pins ---
    const pins = [
      { r: 1.6, a: 0.8, color: 0x3bafda, label: "Za'ba" },
      { r: 2.9, a: 2.3, color: 0x5fd4f5, label: "FSM" },
      { r: 1.9, a: 4.1, color: 0xffffff, label: "Dewan" },
      { r: 3.5, a: 1.0, color: 0x3bafda, label: "Terminal" },
      { r: 2.1, a: 5.5, color: 0x5fd4f5, label: "Pasar" },
    ];

    const pinMeshes: { mesh: THREE.Mesh; ring: THREE.Line; pulse: number; baseY: number }[] = [];

    pins.forEach(({ r, a, color, label: _label }) => {
      const x = Math.cos(a) * r;
      const z = Math.sin(a) * r;

      // Pin body
      const geo = new THREE.SphereGeometry(0.1, 12, 12);
      const mat = new THREE.MeshBasicMaterial({ color });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(x, 0.12, z);
      scene.add(mesh);

      // Ping ring
      const ringPts: THREE.Vector3[] = [];
      for (let i = 0; i <= 64; i++) {
        const ra = (i / 64) * Math.PI * 2;
        ringPts.push(new THREE.Vector3(Math.cos(ra) * 0.25, 0, Math.sin(ra) * 0.25));
      }
      const ring = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(ringPts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity: 1 })
      );
      ring.position.set(x, 0.01, z);
      scene.add(ring);

      pinMeshes.push({ mesh, ring, pulse: Math.random() * Math.PI * 2, baseY: 0.12 });
    });

    // --- Animated car dot along a path ---
    const carGeo = new THREE.SphereGeometry(0.12, 8, 8);
    const carMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const car = new THREE.Mesh(carGeo, carMat);
    scene.add(car);

    // Car trail
    const trailCount = 20;
    const trailMeshes: THREE.Mesh[] = [];
    for (let i = 0; i < trailCount; i++) {
      const t = new THREE.Mesh(
        new THREE.SphereGeometry(0.06 * (1 - i / trailCount), 6, 6),
        new THREE.MeshBasicMaterial({ color: 0x3bafda, transparent: true, opacity: (1 - i / trailCount) * 0.6 })
      );
      trailMeshes.push(t);
      scene.add(t);
    }
    const trailHistory: THREE.Vector3[] = [];

    // Ambient glow circle at center
    const glowGeo = new THREE.CircleGeometry(0.35, 32);
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.15, side: THREE.DoubleSide });
    const glowMesh = new THREE.Mesh(glowGeo, glowMat);
    glowMesh.rotation.x = -Math.PI / 2;
    glowMesh.position.y = 0.01;
    scene.add(glowMesh);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", onMouseMove);

    // Resize
    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let sweepAngle = 0;
    let frameId = 0;
    let t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.016;
      sweepAngle += 0.025;

      // Update sweep fan
      fanLines.forEach((line, i) => {
        const a = sweepAngle - (i / fanCount) * 0.9;
        const pts = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(Math.cos(a) * 4.8, 0, Math.sin(a) * 4.8)];
        line.geometry.setFromPoints(pts);
        line.geometry.needsUpdate = true;
      });

      // Animate pins
      pinMeshes.forEach((p) => {
        p.pulse += 0.04;
        const s = 1 + Math.sin(p.pulse) * 0.3;
        p.ring.scale.set(s, s, s);
        (p.ring.material as THREE.LineBasicMaterial).opacity = (0.5 + Math.sin(p.pulse) * 0.5) * 0.8;
        p.mesh.position.y = p.baseY + Math.sin(p.pulse * 0.5) * 0.04;
      });

      // Flash pin when sweep passes over it
      pinMeshes.forEach((p, idx) => {
        const pinAngle = Math.atan2(p.mesh.position.z, p.mesh.position.x);
        const diff = ((sweepAngle - pinAngle) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        if (diff < 0.4) {
          const flash = 1 - diff / 0.4;
          (p.mesh.material as THREE.MeshBasicMaterial).color.setRGB(
            0.23 + flash * 0.77,
            0.69 + flash * 0.31,
            0.85 + flash * 0.15
          );
        }
      });

      // Animate car along circular path
      const carAngle = t * 0.4;
      const carR = 2.2;
      const carPos = new THREE.Vector3(Math.cos(carAngle) * carR, 0.12, Math.sin(carAngle) * carR);
      car.position.copy(carPos);

      trailHistory.unshift(carPos.clone());
      if (trailHistory.length > trailCount) trailHistory.pop();
      trailMeshes.forEach((tm, i) => {
        if (trailHistory[i]) tm.position.copy(trailHistory[i]);
      });

      // Glow pulse
      glowMesh.scale.setScalar(1 + Math.sin(t * 1.5) * 0.15);
      (glowMesh.material as THREE.MeshBasicMaterial).opacity = 0.1 + Math.sin(t * 1.5) * 0.08;

      // Camera tilt on mouse
      camera.position.x = mouseX * 1.5;
      camera.position.z = mouseY * 1.5;
      camera.position.y = 8 - Math.abs(mouseY) * 0.5;
      camera.lookAt(0, 0, 0);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#0a1628] flex flex-col font-sans overflow-hidden relative">
      {/* 3D canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Overlay gradient at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-[#0a1628] to-transparent z-10 pointer-events-none" />

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
          <button className="text-sm bg-[#3BAFDA] text-white font-semibold px-5 py-2 rounded-full hover:bg-[#2d9cc7] transition-colors">
            Sign up
          </button>
        </nav>
      </header>

      {/* Hero text */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-center text-center px-6 -mt-12">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#3BAFDA]/10 border border-[#3BAFDA]/30 text-[#3BAFDA] text-sm font-medium mb-6">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3BAFDA] animate-pulse inline-block" />
          Live campus tracking
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-5 leading-tight">
          Safe rides for<br />
          <span className="text-[#3BAFDA]">UPSI students</span>
        </h1>
        <p className="text-slate-400 text-lg mb-8 max-w-md">
          Verified drivers. Real-time tracking. Peace of mind, every trip.
        </p>
        <div className="flex gap-3">
          <button className="bg-[#3BAFDA] hover:bg-[#2d9cc7] text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm">
            Book a Ride
          </button>
          <button className="border border-white/20 hover:border-white/40 text-white font-semibold px-7 py-3 rounded-full transition-colors text-sm">
            Apply to Drive
          </button>
        </div>
      </div>

      {/* Bottom label */}
      <div className="relative z-20 text-center pb-6 text-slate-600 text-xs tracking-widest uppercase">
        Move mouse to interact
      </div>
    </div>
  );
}
