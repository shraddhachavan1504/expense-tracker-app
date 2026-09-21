"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Text } from "@react-three/drei";
import * as THREE from "three";

export type CategorySpend = {
  category: string;
  total: number;
  count: number;
};

type BarProps = {
  category: string;
  total: number;
  maxTotal: number;
  index: number;
  barCount: number;
  revealed: boolean;
};

const COBALT = "#1E3AF2";
const YELLOW = "#FFD400";
const NEAR_BLACK = "#121212";

function Bar({ category, total, maxTotal, index, barCount, revealed }: BarProps) {
  const MAX_HEIGHT = 4;
  const height = maxTotal > 0 ? (total / maxTotal) * MAX_HEIGHT : 0.01;

  const spacing = 1.7;
  const x = (index - (barCount - 1) / 2) * spacing;

  const isHighest = total === maxTotal;

  const meshRef = useRef<THREE.Mesh>(null);
  // Tracks the current 0→1 growth progress across frames. A plain number
  // in a ref (not useState) because we're mutating it every frame — using
  // state here would trigger a re-render 60 times a second for no reason.
  const progress = useRef(0);

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    // Animate toward 1 when revealed, back toward 0 when not (e.g. if you
    // later add logic to reset on scroll-out). delta makes this speed
    // consistent regardless of frame rate rather than tying it to frame count.
    const target = revealed ? 1 : 0;
    progress.current = THREE.MathUtils.lerp(progress.current, target, delta * 4);

    const scaleY = progress.current;
    meshRef.current.scale.y = scaleY;
    // Recompute position every frame so the bar's base stays glued to y=0
    // while only the top grows — boxGeometry scales from its center, so
    // without this the bar would grow downward through the floor too.
    meshRef.current.position.y = (height * scaleY) / 2;
  });

  return (
    <group position={[x, 0, 0]}>
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.8, height, 0.8]} />
        <meshStandardMaterial color={isHighest ? YELLOW : COBALT} />
      </mesh>

      <Text
        position={[0, -0.4, 0]}
        fontSize={0.22}
        color={NEAR_BLACK}
        anchorX="center"
        anchorY="middle"
      >
        {category}
      </Text>

      <Text
        position={[0, height + 0.3, 0]}
        fontSize={0.2}
        color={NEAR_BLACK}
        anchorX="center"
        anchorY="middle"
      >
        {`₹${total.toLocaleString("en-IN")}`}
      </Text>
    </group>
  );
}

function Scene({ data, revealed }: { data: CategorySpend[]; revealed: boolean }) {
  const maxTotal = Math.max(...data.map((d) => d.total), 0);

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1} />

      {data.map((d, i) => (
        <Bar
          key={d.category}
          category={d.category}
          total={d.total}
          maxTotal={maxTotal}
          index={i}
          barCount={data.length}
          revealed={revealed}
        />
      ))}
    </>
  );
}

export default function SpendingBarsCanvas({
  data,
  revealed,
}: {
  data: CategorySpend[];
  revealed: boolean;
}) {
  if (!data || data.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center text-sm text-neutral-500">
        No spending data yet.
      </div>
    );
  }

  return (
    <Canvas
      orthographic
      camera={{ position: [0, 3, 10], zoom: 70 }}
      style={{ width: "100%", height: "100%" }}
    >
      <Suspense fallback={null}>
        <Scene data={data} revealed={revealed} />
      </Suspense>
    </Canvas>
  );
}