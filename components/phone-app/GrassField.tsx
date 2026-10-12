"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  CircleGeometry,
  Color,
  DoubleSide,
  InstancedMesh,
  MeshLambertMaterial,
  Object3D,
  PlaneGeometry,
  type IUniform,
} from "three";
import { useFrame } from "@react-three/fiber";

/** Small deterministic PRNG so the meadow looks the same on every visit (and in tests). */
function rng(seed: number) {
  return () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
}

/** Wind clock; a plain function so per-frame uniform updates stay outside React's render rules. */
function advance(u: IUniform<number>, delta: number) {
  u.value += delta;
}

/** A tapered blade (base at y = 0, height 1) that the instances scale and the shader bends. */
function bladeGeometry(width: number) {
  const g = new PlaneGeometry(width, 1, 1, 4);
  g.translate(0, 0.5, 0);
  const p = g.attributes.position;
  for (let i = 0; i < p.count; i++) p.setX(i, p.getX(i) * (1 - p.getY(i) * 0.92));
  return g;
}

/** Wind sway: bend each vertex by its height squared, phased by the instance's position. */
function windMaterial(time: IUniform<number>, strength: number) {
  const m = new MeshLambertMaterial({ side: DoubleSide, vertexColors: false });
  m.onBeforeCompile = (shader) => {
    shader.uniforms.uTime = time;
    shader.vertexShader = shader.vertexShader
      .replace("#include <common>", "#include <common>\nuniform float uTime;")
      .replace(
        "#include <begin_vertex>",
        `#include <begin_vertex>
        float h = position.y * position.y;
        vec2 base = instanceMatrix[3].xz;
        float sway = sin(uTime * 1.6 + base.x * 2.3 + base.y * 1.7) + 0.4 * sin(uTime * 3.1 + base.x * 5.0);
        transformed.x += sway * ${strength.toFixed(3)} * h;
        transformed.z += cos(uTime * 1.2 + base.y * 2.0) * ${(strength * 0.5).toFixed(3)} * h;`,
      );
  };
  return m;
}

function radialTexture(stops: [number, string][]) {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  for (const [o, col] of stops) g.addColorStop(o, col);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new CanvasTexture(c);
}

const COUNTS = { blades: 7000, wheat: 300, flowers: 80 };

type Props = { y: number; radius?: number; animate: boolean };

/**
 * A round patch of meadow the phone floats above: instanced grass blades with a little
 * wheat and a few flowers, swaying in the wind, on a soil disc that fades into the page.
 */
export function GrassField({ y, radius = 1.35, animate }: Props) {
  const blades = useRef<InstancedMesh>(null);
  const wheat = useRef<InstancedMesh>(null);
  const flowers = useRef<InstancedMesh>(null);

  const res = useMemo(() => {
    const time: IUniform<number> = { value: 0 };
    return {
      time,
      blade: bladeGeometry(0.02),
      stalk: bladeGeometry(0.018),
      bladeMat: windMaterial(time, 0.09),
      wheatMat: windMaterial(time, 0.06),
      flowerGeo: new CircleGeometry(0.02, 6),
      flowerMat: new MeshLambertMaterial({ side: DoubleSide }),
      ground: radialTexture([
        [0, "rgba(46,90,38,1)"],
        [0.62, "rgba(52,96,40,0.95)"],
        [0.85, "rgba(60,104,44,0.45)"],
        [1, "rgba(60,104,44,0)"],
      ]),
      shadow: radialTexture([
        [0, "rgba(10,30,12,0.55)"],
        [0.5, "rgba(10,30,12,0.25)"],
        [1, "rgba(10,30,12,0)"],
      ]),
    };
  }, []);

  useLayoutEffect(() => {
    const rand = rng(7);
    const o = new Object3D();
    const c = new Color();
    // Denser in the middle, thinning out towards the soft edge.
    const place = (edge = 1) => {
      const r = radius * Math.sqrt(rand()) * edge;
      const a = rand() * Math.PI * 2;
      return { x: Math.cos(a) * r, z: Math.sin(a) * r * 0.8, t: r / radius };
    };
    const fill = (mesh: InstancedMesh | null, count: number, set: (i: number) => void) => {
      if (!mesh) return;
      for (let i = 0; i < count; i++) set(i);
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    };

    fill(blades.current, COUNTS.blades, (i) => {
      const { x, z, t } = place();
      const h = (0.13 + rand() * 0.15) * (1 - t * t * 0.7);
      o.position.set(x, 0, z);
      o.rotation.set((rand() - 0.5) * 0.35, rand() * Math.PI, (rand() - 0.5) * 0.35);
      o.scale.set(1, h, 1);
      o.updateMatrix();
      blades.current!.setMatrixAt(i, o.matrix);
      c.setHSL(0.24 + rand() * 0.07, 0.45 + rand() * 0.25, 0.22 + rand() * 0.2);
      blades.current!.setColorAt(i, c);
    });
    fill(wheat.current, COUNTS.wheat, (i) => {
      const { x, z, t } = place(0.95);
      o.position.set(x, 0, z);
      o.rotation.set((rand() - 0.5) * 0.2, rand() * Math.PI, (rand() - 0.5) * 0.2);
      o.scale.set(1, (0.24 + rand() * 0.1) * (1 - t * 0.5), 1);
      o.updateMatrix();
      wheat.current!.setMatrixAt(i, o.matrix);
      c.setHSL(0.11 + rand() * 0.03, 0.6, 0.5 + rand() * 0.12);
      wheat.current!.setColorAt(i, c);
    });
    fill(flowers.current, COUNTS.flowers, (i) => {
      const { x, z } = place(0.9);
      o.position.set(x, 0.08 + rand() * 0.1, z);
      o.rotation.set(-Math.PI / 2 + (rand() - 0.5) * 0.6, 0, rand() * Math.PI);
      o.scale.setScalar(0.7 + rand() * 0.6);
      o.updateMatrix();
      flowers.current!.setMatrixAt(i, o.matrix);
      c.set(rand() < 0.6 ? "#fde047" : rand() < 0.5 ? "#ffffff" : "#f9a8d4");
      flowers.current!.setColorAt(i, c);
    });
  }, [radius]);

  useFrame((_, delta) => {
    if (animate) advance(res.time, delta);
  });

  return (
    <group position={[0, y, 0]}>
      <mesh rotation-x={-Math.PI / 2} scale={[radius * 2.5, radius * 2.1, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={res.ground} transparent depthWrite={false} />
      </mesh>
      {/* Soft shadow of the floating phone. */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.004} scale={[1.1, 0.5, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={res.shadow} transparent depthWrite={false} />
      </mesh>
      <instancedMesh ref={blades} args={[res.blade, res.bladeMat, COUNTS.blades]} />
      <instancedMesh ref={wheat} args={[res.stalk, res.wheatMat, COUNTS.wheat]} />
      <instancedMesh ref={flowers} args={[res.flowerGeo, res.flowerMat, COUNTS.flowers]} />
    </group>
  );
}
