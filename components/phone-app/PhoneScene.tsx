"use client";

import { useLayoutEffect, useMemo, useRef, type RefObject } from "react";
import { Box3, Group, Mesh, Vector3, type Camera, type MeshPhysicalMaterial, type Object3D } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { Environment, Float, Lightformer, PresentationControls, useGLTF } from "@react-three/drei";
import { siteConfig } from "@/config/site";
import { GrassField } from "./GrassField";
import { introProgress, quadMatrix3d, SCREEN } from "@/lib/phone-stage";

// "iPhone 17 Pro" by Ranguel (Sketchfab), CC BY 4.0 — optimised with gltf-transform (see docs/3d-model.md).
const MODEL = "/models/phone.glb";
const SCALE = 10; // the model is in metres; 1.5 units tall reads well with the default helpers
const INTRO_S = 1.8;
const LABEL = `${siteConfig.name} uygulamasını çalıştıran 3B akıllı telefon modeli. Sürükleyerek çevirebilirsiniz.`;

type SceneProps = {
  /** Float + intro turn; off for reduced motion or when the visitor paused motion. */
  animate: boolean;
  intro: boolean;
  /** Dusk lighting to sit in the dark-mode sky. */
  dark: boolean;
  /** Animate only while the stage is on screen; off screen, frames render on demand only. */
  active: boolean;
  /** DOM app screen that is warped onto the phone's display every frame. */
  overlay: RefObject<HTMLDivElement | null>;
  onReady: () => void;
  /** The meadow under the phone; off for the bare-phone hero render. */
  scenery?: boolean;
  /** Resting rotation of the phone (x lean, y turn, z roll). */
  pose?: [number, number, number];
  view?: View;
};

/** Starts downloading the model ahead of time; PhoneStage calls it once the page is idle. */
export function preloadPhoneModel() {
  useGLTF.preload(MODEL, false, true);
}

type View = { fov: number; position: [number, number, number]; lookAt: [number, number, number] };

/** Demo stage: facing the viewer straight on, leaning slightly back. */
const DEMO_POSE: [number, number, number] = [-0.14, 0, 0];
const DEMO_VIEW: View = { fov: 45, position: [0, 0.3, 2.45], lookAt: [0, -0.06, 0] };

export default function PhoneScene({
  animate,
  intro,
  dark,
  active,
  overlay,
  onReady,
  scenery = true,
  pose = DEMO_POSE,
  view = DEMO_VIEW,
}: SceneProps) {
  return (
    <Canvas
      frameloop={active ? "always" : "demand"}
      dpr={[1, 1.75]}
      camera={{ fov: view.fov, position: view.position, near: 0.1, far: 20 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ gl, camera }) => {
        camera.lookAt(...view.lookAt);
        gl.domElement.setAttribute("role", "img");
        gl.domElement.setAttribute("aria-label", LABEL);
      }}
    >
      <hemisphereLight args={[dark ? "#9fb6d9" : "#fff4dc", "#2f5a24", dark ? 0.45 : 0.9]} />
      <directionalLight position={[3, 4, 4]} intensity={dark ? 0.75 : 1.6} color={dark ? "#ffe2b0" : "#fff1d0"} />
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={2.5} position={[0, 2.5, 4]} scale={[6, 1.6, 1]} />
        <Lightformer form="rect" intensity={1.6} position={[-4, 0.5, 1]} rotation-y={Math.PI / 2} scale={[4, 2.5, 1]} color="#dcfce7" />
        <Lightformer form="rect" intensity={1.2} position={[4, -0.5, 1]} rotation-y={-Math.PI / 2} scale={[4, 2.5, 1]} color="#fef3c7" />
        <Lightformer form="ring" intensity={1.5} position={[0, -3, 2]} scale={2} />
      </Environment>

      <PresentationControls global={false} cursor snap speed={1.3} polar={[-0.25, 0.25]} azimuth={[-0.7, 0.7]}>
        <Float enabled={animate} speed={1.4} rotationIntensity={0.1} floatIntensity={0.5} floatingRange={[-0.05, 0.05]}>
          <Phone intro={intro} active={active} pose={pose} overlay={overlay} onReady={onReady} />
        </Float>
      </PresentationControls>

      {scenery && <GrassField y={-1.12} animate={animate} />}
    </Canvas>
  );
}

function Phone({
  intro,
  active,
  pose,
  overlay,
  onReady,
}: {
  intro: boolean;
  active: boolean;
  pose: [number, number, number];
  overlay: RefObject<HTMLDivElement | null>;
  onReady: () => void;
}) {
  const { scene } = useGLTF(MODEL, false, true);
  const turn = useRef<Group>(null);
  const screenAnchor = useRef<Group>(null);
  const started = useRef<number | null>(null);

  const { model, display, screen } = useMemo(() => {
    const model = scene.clone(true);
    let oled: Mesh | undefined;
    model.traverse((o) => {
      const mesh = o as Mesh;
      if (!mesh.isMesh) return;
      for (const m of [mesh.material].flat() as MeshPhysicalMaterial[]) {
        // Transmission needs an extra render pass per frame; the glass reads fine as plain transparency.
        if (m.transmission) m.transmission = 0;
        if (m.name === "OLED") {
          oled = mesh;
          m.map = null;
          m.emissiveMap = null;
          m.color.set("#050505");
          m.emissive.set("#000000");
          m.needsUpdate = true;
        }
      }
    });
    model.updateMatrixWorld(true);
    const all = new Box3().setFromObject(model);
    const box = new Box3().setFromObject(oled ?? model);
    const center = box.getCenter(new Vector3());
    const size = box.getSize(new Vector3());
    // The display faces -Z in model space; anchor the app screen just in front of the cover glass.
    return { model, display: oled ?? null, screen: { x: center.x, y: center.y, z: all.min.z - 0.0002, w: size.x, h: size.y } };
  }, [scene]);

  // Screen corners in the anchor's frame (it faces +Z): top-left, top-right, bottom-right, bottom-left.
  const corners = useMemo(
    () => [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(([sx, sy]) => new Vector3((sx * screen.w) / 2, (sy * screen.h) / 2, 0)),
    [screen],
  );

  useLayoutEffect(onReady, [onReady]);

  useFrame(({ clock }) => {
    if (turn.current) {
      // An intro nobody would see (stage off screen when the model loads) is skipped.
      started.current ??= active ? clock.elapsedTime : -Infinity;
      const p = intro ? introProgress(clock.elapsedTime - started.current, INTRO_S) : 1;
      turn.current.rotation.y = (1 - p) * -Math.PI * 1.15;
    }
  });

  // Place the DOM screen inside the render itself (after Float, controls and the intro have
  // moved the phone this frame), so it never lags a frame behind the model.
  useLayoutEffect(() => {
    if (!display) return;
    return syncOverlay(display, (camera, width, height) => {
      if (screenAnchor.current && overlay.current) placeOverlay(overlay.current, screenAnchor.current, corners, camera, { width, height });
    });
  }, [display, overlay, corners]);

  return (
    <group ref={turn}>
      <group rotation={pose} scale={SCALE}>
        <group rotation={[0, Math.PI, 0]}>
          <primitive object={model} />
          <group ref={screenAnchor} position={[screen.x, screen.y, screen.z]} rotation={[0, Math.PI, 0]} />
        </group>
      </group>
    </group>
  );
}

/** Warp the DOM app screen onto the display's projected corners; hide it when the display faces away. */
function placeOverlay(el: HTMLDivElement, anchor: Object3D, corners: Vector3[], camera: Camera, size: { width: number; height: number }) {
  anchor.updateWorldMatrix(true, false);
  // The DOM screen is drawn above the canvas, so it must not show through the back of the phone.
  const toCamera = camera.position.clone().sub(anchor.getWorldPosition(new Vector3()));
  if (anchor.getWorldDirection(new Vector3()).dot(toCamera) <= 0) {
    el.style.visibility = "hidden";
    return;
  }
  const quad = corners.map((c) => {
    const v = anchor.localToWorld(c.clone()).project(camera);
    return [((v.x + 1) / 2) * size.width, ((1 - v.y) / 2) * size.height];
  }) as Parameters<typeof quadMatrix3d>[2];
  el.style.transform = `matrix3d(${quadMatrix3d(SCREEN.width, SCREEN.height, quad).join(",")})`;
  el.style.visibility = "visible";
}

/** Run `place` whenever the display mesh is drawn; returns the cleanup. */
function syncOverlay(display: Mesh, place: (camera: Camera, width: number, height: number) => void) {
  display.onBeforeRender = (renderer, _scene, camera) => place(camera, renderer.domElement.clientWidth, renderer.domElement.clientHeight);
  return () => {
    display.onBeforeRender = () => {};
  };
}
