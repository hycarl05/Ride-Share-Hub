import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

/** Static CSS fallback when WebGL is unavailable (server / old hardware). */
function ShieldFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
      {/* Animated rings via CSS */}
      {[1, 2, 3].map((i) => (
        <div
          key={i}
          className="absolute rounded-full border border-[#3bafda]/20 animate-ping"
          style={{
            width: `${i * 160}px`,
            height: `${i * 160}px`,
            animationDuration: `${i * 1.4 + 1}s`,
            animationDelay: `${i * 0.4}s`,
          }}
        />
      ))}
      {/* Static shield SVG */}
      <svg width="180" height="210" viewBox="0 0 180 210" fill="none" className="relative z-10">
        <path
          d="M90 8L16 38v60c0 52 32 100 74 120 42-20 74-68 74-120V38L90 8z"
          stroke="#3BAFDA" strokeWidth="2" fill="#0f4c81" fillOpacity="0.08"
        />
        <path
          d="M90 8L16 38v60c0 52 32 100 74 120 42-20 74-68 74-120V38L90 8z"
          stroke="#3BAFDA" strokeWidth="1" strokeDasharray="4 4" fill="none"
          transform="scale(1.18) translate(-13, -10)"
          opacity="0.3"
        />
        <path d="M62 105l18 18 38-38" stroke="white" strokeWidth="5"
          strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

export function ShieldScene() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  useEffect(() => {
    const el = mountRef.current;
    if (!el) return;

    // Check WebGL support before creating renderer
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
    if (!gl) {
      setWebglFailed(true);
      return;
    }

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch {
      setWebglFailed(true);
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(el.clientWidth, el.clientHeight);
    renderer.setClearColor(0x07090f, 0); // transparent so gradient shows through
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, el.clientWidth / el.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6);

    // --- Ambient particle field ---
    const fieldCount = 1200;
    const fieldGeo = new THREE.BufferGeometry();
    const fieldPos = new Float32Array(fieldCount * 3);
    for (let i = 0; i < fieldCount; i++) {
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 4 + Math.random() * 10;
      fieldPos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      fieldPos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      fieldPos[i * 3 + 2] = r * Math.cos(phi);
    }
    fieldGeo.setAttribute("position", new THREE.BufferAttribute(fieldPos, 3));
    const fieldMat = new THREE.PointsMaterial({
      color: 0x3bafda,
      size: 0.04,
      transparent: true,
      opacity: 0.4,
      sizeAttenuation: true,
    });
    const fieldPoints = new THREE.Points(fieldGeo, fieldMat);
    scene.add(fieldPoints);

    // --- Shield geometry helpers ---
    const shieldGroup = new THREE.Group();
    scene.add(shieldGroup);

    function shieldPath(scale = 1): THREE.Vector3[] {
      const raw = [
        [-0.6, 0.9], [-0.85, 0.6], [-0.85, 0.1], [-0.6, -0.35],
        [0, -0.95],
        [0.6, -0.35], [0.85, 0.1], [0.85, 0.6], [0.6, 0.9], [0, 1.0],
      ];
      const pts = raw.map(([x, y]) => new THREE.Vector3(x * scale, y * scale, 0));
      pts.push(pts[0]); // close
      return pts;
    }

    // Outer ghost ring
    const outerLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shieldPath(1.3)),
      new THREE.LineBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.25 })
    );
    shieldGroup.add(outerLine);

    // Main shield outline
    const mainLine = new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(shieldPath(1)),
      new THREE.LineBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.9 })
    );
    shieldGroup.add(mainLine);

    // Inner fill
    const shapeObj = new THREE.Shape();
    shieldPath(1).forEach((v, i) => {
      if (i === 0) shapeObj.moveTo(v.x, v.y);
      else shapeObj.lineTo(v.x, v.y);
    });
    shieldGroup.add(new THREE.Mesh(
      new THREE.ShapeGeometry(shapeObj),
      new THREE.MeshBasicMaterial({ color: 0x0f4c81, transparent: true, opacity: 0.08, side: THREE.DoubleSide })
    ));

    // Checkmark
    shieldGroup.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(-0.3, -0.05, 0.01),
        new THREE.Vector3(-0.05, -0.32, 0.01),
        new THREE.Vector3(0.38, 0.3, 0.01),
      ]),
      new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.9 })
    ));

    // Orbiting particle ring
    const orbitCount = 80;
    const orbitPos = new Float32Array(orbitCount * 3);
    for (let i = 0; i < orbitCount; i++) {
      const a = (i / orbitCount) * Math.PI * 2;
      const r = 1.5 + Math.random() * 0.4;
      orbitPos[i * 3]     = Math.cos(a) * r;
      orbitPos[i * 3 + 1] = Math.sin(a) * r;
      orbitPos[i * 3 + 2] = (Math.random() - 0.5) * 0.3;
    }
    const orbitGeo = new THREE.BufferGeometry();
    orbitGeo.setAttribute("position", new THREE.BufferAttribute(orbitPos, 3));
    const orbitPoints = new THREE.Points(orbitGeo, new THREE.PointsMaterial({ color: 0x3bafda, size: 0.05, transparent: true, opacity: 0.7 }));
    shieldGroup.add(orbitPoints);

    // Badge rings
    const ringGroup = new THREE.Group();
    scene.add(ringGroup);
    ([
      [1.8, 0x3bafda, 0.15],
      [2.3, 0x0f4c81, 0.1],
    ] as [number, number, number][]).forEach(([r, color, opacity]) => {
      const pts: THREE.Vector3[] = [];
      for (let i = 0; i <= 128; i++) {
        const a = (i / 128) * Math.PI * 2;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      }
      ringGroup.add(new THREE.Line(
        new THREE.BufferGeometry().setFromPoints(pts),
        new THREE.LineBasicMaterial({ color, transparent: true, opacity })
      ));
    });

    // Floating dots on rings
    const dots: { mesh: THREE.Mesh; angle: number; r: number; speed: number }[] = [];
    for (let i = 0; i < 8; i++) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.04, 6, 6),
        new THREE.MeshBasicMaterial({ color: i % 2 === 0 ? 0x3bafda : 0xffffff })
      );
      scene.add(mesh);
      dots.push({ mesh, angle: (i / 8) * Math.PI * 2, r: i % 2 === 0 ? 1.8 : 2.3, speed: i % 2 === 0 ? 0.008 : -0.006 });
    }

    // Glow disc
    const glowMat = new THREE.MeshBasicMaterial({ color: 0x3bafda, transparent: true, opacity: 0.04, side: THREE.DoubleSide });
    const glow = new THREE.Mesh(new THREE.CircleGeometry(1.6, 32), glowMat);
    glow.position.z = -0.2;
    shieldGroup.add(glow);

    // Mouse parallax
    let mouseX = 0, mouseY = 0;
    const onMouseMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      mouseX = ((e.clientX - rect.left) / rect.width  - 0.5) * 2;
      mouseY = ((e.clientY - rect.top)  / rect.height - 0.5) * 2;
    };
    el.addEventListener("mousemove", onMouseMove);

    const onResize = () => {
      camera.aspect = el.clientWidth / el.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(el.clientWidth, el.clientHeight);
    };
    window.addEventListener("resize", onResize);

    let frameId = 0, t = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      t += 0.012;

      // Parallax tilt
      shieldGroup.rotation.x += (mouseY * 0.3 - shieldGroup.rotation.x) * 0.06;
      shieldGroup.rotation.y += (mouseX * 0.3 - shieldGroup.rotation.y) * 0.06;

      // Float
      shieldGroup.position.y = Math.sin(t * 0.6) * 0.08;

      // Orbit spin
      orbitPoints.rotation.z += 0.006;

      // Dots
      dots.forEach((d) => {
        d.angle += d.speed;
        d.mesh.position.set(
          Math.cos(d.angle) * d.r + shieldGroup.position.x,
          Math.sin(d.angle) * d.r + shieldGroup.position.y,
          0
        );
      });
      ringGroup.rotation.z  += 0.002;
      ringGroup.position.y   = shieldGroup.position.y;

      // Pulses
      glowMat.opacity = 0.035 + Math.sin(t * 1.2) * 0.02;
      (outerLine.material as THREE.LineBasicMaterial).opacity = 0.15 + Math.sin(t * 0.8) * 0.1;
      fieldMat.opacity = 0.35 + Math.sin(t * 0.3) * 0.08;
      fieldPoints.rotation.y += 0.0005;

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

  if (webglFailed) return <ShieldFallback />;
  return <div ref={mountRef} className="w-full h-full" />;
}
