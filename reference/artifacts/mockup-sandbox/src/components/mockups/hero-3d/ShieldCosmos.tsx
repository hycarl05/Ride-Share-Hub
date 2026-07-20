import { useEffect, useRef } from "react";
import * as THREE from "three";

export function ShieldCosmos() {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x07090f, 1);
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    // --- Ambient particle field ---
    const fieldCount = 1200;
    const fieldGeo = new THREE.BufferGeometry();
    const fieldPos = new Float32Array(fieldCount * 3);
    const fieldSizes = new Float32Array(fieldCount);
    for (let i = 0; i < fieldCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 10;
      fieldPos[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      fieldPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      fieldPos[i * 3 + 2] = r * Math.cos(phi);
      fieldSizes[i] = Math.random() * 2 + 0.5;
    }
    fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPos, 3));
    fieldGeo.setAttribute("size", new THREE.BufferAttribute(fieldSizes, 1));
    const fieldMat = new THREE.PointsMaterial({
      color: 0x3bafda,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    scene.add(new THREE.Points(fieldGeo, fieldMat));

    // --- Shield outline (extruded from path points) ---
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    function shieldPath(scale = 1): THREE.Vector3[] {
      // Shield shape: top-left → top-right → lower-right → bottom-point → lower-left → back
      const pts: THREE.Vector3[] = [];
      const raw = [
        [-0.6, 0.9], [-0.85, 0.6], [-0.85, 0.1], [-0.6, -0.35],
        [0, -0.95],
        [0.6, -0.35], [0.85, 0.1], [0.85, 0.6], [0.6, 0.9], [0, 1.0],
      ];
      raw.forEach(([x, y]) => pts.push(new THREE.Vector3(x * scale, y * scale, 0)));
      pts.push(pts[0]); // close
      return pts;
    }

    // Outer ring
    const outerLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shieldPath(1.3)),
      new THREE.LineBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.25 })
    );
    shieldGroup.add(outerLine);

    // Main shield
    const mainLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shieldPath(1)),
      new THREE.LineBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.9 })
    );
    shieldGroup.add(mainLine);

    // Inner shield fill (very subtle)
    const shapeObj = new THREE.Shape();
    shieldPath(1).forEach((v, i) => {
      if (i === 0) shapeObj.moveTo(v.x, v.y);
      else shapeObj.lineTo(v.x, v.y);
    });
    const fillGeo = new THREE.ShapeGeometry(shapeObj);
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x0f4c81,
      transparent: true,
      opacity: 0.08,
      side: THREE.DoubleSide,
    });
    shieldGroup.add(new THREE.Mesh(fillGeo, fillMat));

    // Checkmark inside shield
    const checkPts = [
      new THREE.Vector3(-0.3, -0.05, 0.01),
      new THREE.Vector3(-0.05, -0.32, 0.01),
      new THREE.Vector3(0.38, 0.3, 0.01),
    ];
    const checkLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(checkPts),
      new THREE.LineBasicMaterial({ color: 0xffffff, linewidth: 2, transparent: true, opacity: 0.9 })
    );
    shieldGroup.add(checkLine);

    // Shield particles orbiting
    const orbitCount = 80;
    const orbitGeo = new THREE.BufferGeometry();
    const orbitPos = new Float32Array(orbitCount * 3);
    for (let i = 0; i < orbitCount; i++) {
      const a = (i / orbitCount) * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.4;
      orbitPos[i * 3] = Math.cos(a) * r;
      orbitPos[i * 3 + 1] = Math.sin(a) * r;
      orbitPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(orbitPos, 3));
    const orbitMat = new THREE.PointsMaterial({
      color: 0x3bafda,
      size: 0.05,
      transparent: true,
      opacity: 0.7,
    });
    const orbitPoints = new THREE.Points(orbitGeo, orbitMat);
    shieldGroup.add(orbitPoints);

    // Floating badge rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    [[1.8, 0x3bafda, 0.15], [2.3, 0x0f4c81, 0.1]].forEach(([r, color, opacity]) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * (r as number), Math.sin(a) * (r as number), 0));
      }
      ringGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color: color as number, transparent: true, opacity: opacity as number })
      ));
    });

    // Floating dots on ring
    const dotCount = 8;
    const dots: { mesh: THREE.Mesh; angle: number; r: number; speed: number }[] = [];
    for (let i = 0; i < dotCount; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x3bafda : 0xffffff })
      );
      scene.add(mesh);
      dots.push({ mesh, angle: (i / dotCount) * Math.PI * 2, r: i % 2 === 0 ? 1.8 : 2.3, speed: i % 2 === 0 ? 0.008 : -0.006 });
    }

    // Glow behind shield
    const glowGeo = new THREE.CircleGeometry(1.6, 32);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x3bafda,
      transparent: true,
      opacity: 0.04,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.position.z = -0.2;
    shieldGroup.add(glow);

    // Mouse parallax
    let mouseX = 0;
    let mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = (e.clientX / el.clientWidth - 0.5) * 2;
      mouseY = (e.clientY / el.clientHeight - 0.5) * 2;
    };
    el.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let frameId = 0;
    let t = 0;
    let targetTiltX = 0;
    let targetTiltY = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.012;

      // Smooth parallax tilt
      targetTiltX = mouseY * 0.3;
      targetTiltY = mouseX * 0.3;
      shieldGroup.rotation.x += (targetTiltX - shieldGroup.rotation.x) * 0.06;
      shieldGroup.rotation.y += (targetTiltY - shieldGroup.rotation.y) * 0.06;

      // Gentle float
      shieldGroup.position.y = Math.sin(t * 0.6) * 0.08;

      // Orbit points spin
      orbitPoints.rotation.z += 0.006;

      // Floating dots
      dots.forEach((d) => {
        d.angle += d.speed;
        d.mesh.position.set(Math.cos(d.angle) * d.r, Math.sin(d.angle) * d.r, 0);
        d.mesh.position.x += shieldGroup.position.x;
        d.mesh.position.y += shieldGroup.position.y;
      });
      ringGroup.rotation.z += 0.002;
      ringGroup.position.y = shieldGroup.position.y;

      // Pulse glow
      const pulse = 0.035 + Math.sin(t * 1.2) * 0.02;
      glowMat.opacity = pulse;

      // Outer ring pulse
      (outerLine.material as THREE.LineBasicMaterial).opacity = 0.15 + Math.sin(t * 0.8) * 0.1;

      // Field slow drift
      fieldMat.opacity = 0.35 + Math.sin(t * 0.3) * 0.08;
      scene.children[0].rotation.y += 0.0005;

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      el.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("resize", onResize);
      renderer.dispose();
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col font-sans overflow-hidden relative" style={{ background: "linear-gradient(135deg, #07090f 0%, #0c1422 50%, #07090f 100%)" }}>
      <div ref={mountRef} className="absolute inset-0 z-0" />

      {/* Subtle gradient overlay top */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#07090f] to-transparent z-10 pointer-events-none" />

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
          <span className="text-sm text-slate-500 hover:text-white cursor-pointer transition-colors">Log in</span>
          <button className="text-sm border border-[#3bafda]/40 text-[#3bafda] font-semibold px-5 py-2 rounded-full hover:bg-[#3bafda] hover:text-white transition-all">
            Sign up
          </button>
        </nav>
      </header>

      {/* Hero — centered, text below the 3D shield */}
      <div className="relative z-20 flex-1 flex flex-col items-center justify-end text-center px-6 pb-16">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-white/60 text-xs font-medium mb-4 tracking-widest uppercase">
          Verified · Secure · On-campus
        </div>
        <h1 className="text-5xl sm:text-6xl font-extrabold text-white mb-4 leading-tight">
          Your safety,<br />
          <span className="bg-gradient-to-r from-[#3bafda] to-[#5fd4f5] bg-clip-text text-transparent">guaranteed.</span>
        </h1>
        <p className="text-slate-500 text-base mb-8 max-w-sm leading-relaxed">
          Every driver verified. Every ride tracked. UPSI students travel with confidence.
        </p>
        <div className="flex gap-3 justify-center">
          <button className="bg-white text-[#07090f] font-bold px-7 py-3 rounded-full text-sm hover:bg-slate-100 transition-colors">
            Get Started
          </button>
          <button className="border border-white/15 text-white/70 hover:text-white hover:border-white/30 font-semibold px-7 py-3 rounded-full text-sm transition-colors">
            Apply to Drive
          </button>
        </div>
      </div>

      <div className="relative z-20 text-center pb-5 text-slate-800 text-xs tracking-widest uppercase">
        Move mouse to tilt shield
      </div>
    </div>
  );
}
