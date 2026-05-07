"use client";

/**
 * 3D bracket-spark logo — the EngiNerd mark.
 *
 * Concept: an open `{` bracket whose two arms glow violet→cyan, with a small
 * "spark" hovering at the cursor position. Procedural geometry (Three.js
 * BoxGeometry + Sphere) — no external GLB asset, ships nothing extra.
 *
 * Lazy-mounted: the whole module is `next/dynamic({ ssr: false })`-friendly,
 * so the WebGL canvas + Three.js bundle only load when the hero is actually
 * visible. Falls back to a static SVG mark when JS is disabled or the
 * `prefers-reduced-motion` media query says no.
 */

import * as React from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Float } from "@react-three/drei";
import * as THREE from "three";

import { LogoSvg } from "@/components/shared/logo-svg";

const ACCENT_FROM = new THREE.Color("#8b5cf6"); // violet-500
const ACCENT_TO = new THREE.Color("#06b6d4"); // cyan-500

/** A single arm of the bracket — rounded box with emissive material. */
function BracketArm({
  position,
  rotation,
  color,
}: {
  position: [number, number, number];
  rotation: [number, number, number];
  color: THREE.Color;
}) {
  return (
    <mesh position={position} rotation={rotation} castShadow>
      <boxGeometry args={[0.42, 1.6, 0.42]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={0.55}
        metalness={0.4}
        roughness={0.2}
      />
    </mesh>
  );
}

/** The open `{` — top arm + bottom arm + a center "pivot" cube. */
function BracketGroup() {
  const group = React.useRef<THREE.Group>(null);
  const { mouse } = useThree();

  // Mouse parallax — arm tilts based on cursor x/y. Smoothed via lerp.
  useFrame((_, delta) => {
    if (!group.current) return;
    const targetRotY = mouse.x * 0.4;
    const targetRotX = -mouse.y * 0.25;
    group.current.rotation.y = THREE.MathUtils.lerp(
      group.current.rotation.y,
      targetRotY,
      Math.min(1, delta * 4),
    );
    group.current.rotation.x = THREE.MathUtils.lerp(
      group.current.rotation.x,
      targetRotX,
      Math.min(1, delta * 4),
    );
  });

  return (
    <group ref={group}>
      {/* Top arm — slanted toward center */}
      <BracketArm
        position={[0.55, 0.85, 0]}
        rotation={[0, 0, -0.35]}
        color={ACCENT_FROM}
      />
      {/* Center pivot */}
      <mesh position={[0.05, 0, 0]} castShadow>
        <boxGeometry args={[0.55, 0.55, 0.45]} />
        <meshStandardMaterial
          color={ACCENT_FROM.clone().lerp(ACCENT_TO, 0.5)}
          emissive={ACCENT_FROM.clone().lerp(ACCENT_TO, 0.5)}
          emissiveIntensity={0.45}
          metalness={0.6}
          roughness={0.15}
        />
      </mesh>
      {/* Bottom arm — slanted away from center */}
      <BracketArm
        position={[0.55, -0.85, 0]}
        rotation={[0, 0, 0.35]}
        color={ACCENT_TO}
      />
    </group>
  );
}

/** A small spark orb that floats — represents code in motion. */
function Spark() {
  const ref = React.useRef<THREE.Mesh>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const t = clock.getElapsedTime();
    ref.current.position.x = 1.6 + Math.sin(t * 1.4) * 0.15;
    ref.current.position.y = Math.cos(t * 0.9) * 0.6;
    const scale = 1 + Math.sin(t * 2.5) * 0.1;
    ref.current.scale.setScalar(scale);
  });
  return (
    <mesh ref={ref} position={[1.6, 0, 0.2]}>
      <sphereGeometry args={[0.18, 24, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive={ACCENT_TO}
        emissiveIntensity={2.2}
      />
    </mesh>
  );
}

function LogoScene() {
  return (
    <>
      <ambientLight intensity={0.35} />
      <directionalLight position={[3, 4, 5]} intensity={1.2} castShadow />
      <pointLight
        position={[-2, -2, -2]}
        intensity={0.6}
        color={ACCENT_FROM}
      />
      <pointLight position={[3, 0, 2]} intensity={0.8} color={ACCENT_TO} />
      <Float
        speed={1.4}
        rotationIntensity={0.25}
        floatIntensity={0.35}
        floatingRange={[-0.05, 0.05]}
      >
        <BracketGroup />
        <Spark />
      </Float>
      {/* No <Environment preset>. drei's presets fetch HDRIs from raw.githack.com
          which our CSP blocks. The four explicit lights above (ambient +
          directional + two coloured points) carry the metallic surfaces
          without an external IBL. Self-host an HDRI in /public if richer
          reflections are ever needed. */}
    </>
  );
}

type Logo3DProps = {
  className?: string;
};

export default function Logo3D({ className }: Logo3DProps) {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  if (reducedMotion) {
    // Honour user's reduced-motion preference — show static SVG instead.
    return <LogoSvg className={className} />;
  }

  return (
    <div
      className={
        className ??
        "aspect-square w-full max-w-[420px] mx-auto pointer-events-none select-none"
      }
      aria-hidden="true"
    >
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 5.5], fov: 38 }}
        gl={{ antialias: true, alpha: true }}
        style={{ pointerEvents: "none" }}
      >
        <LogoScene />
      </Canvas>
    </div>
  );
}

// LogoSvg now lives in components/shared/logo-svg.tsx so navbar/wordmark
// can import it without dragging Three.js + drei into their bundles.
