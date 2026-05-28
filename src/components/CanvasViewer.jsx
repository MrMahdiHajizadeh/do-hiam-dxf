import React, { useRef, useEffect, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { useDXFStore } from '../store/DXFStore';
import EntityRenderer from './EntityRenderer';
import { Maximize, Eye, Grid3X3, Compass, Move } from 'lucide-react';

/**
 * CameraSync handles smooth auto-centering and fit-to-screen adjustments.
 */
function CameraSync({ controlsRef }) {
  const { camera, scene } = useThree();
  const globalBoundingBox = useDXFStore(state => state.globalBoundingBox);
  const cameraFitTrigger = useDXFStore(state => state.cameraFitTrigger);
  const selectedEntityId = useDXFStore(state => state.selectedEntityId);
  const entities = useDXFStore(state => state.entities);
  const viewMode = useDXFStore(state => state.viewMode);

  // Keep track of last fits to prevent infinity loops
  const lastFitTrigger = useRef(-1);
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const targetCamPos = useRef(new THREE.Vector3(0, 0, 100));
  const isTransitioning = useRef(false);

  // 1. Fit Camera to Screen on DXF load or Trigger
  useEffect(() => {
    if (cameraFitTrigger > lastFitTrigger.current && globalBoundingBox.width > 0) {
      lastFitTrigger.current = cameraFitTrigger;
      
      const { center, width, height } = globalBoundingBox;
      const maxDim = Math.max(width, height);
      
      // Calculate fit distance based on FOV
      const fovRad = (camera.fov * Math.PI) / 180;
      let dist = maxDim / (2 * Math.tan(fovRad / 2));
      
      // Prevent division by zero and set comfortable padding
      dist = Math.max(20, dist * 1.15); 

      // Set smooth targets
      targetLookAt.current.set(center.x, center.y, 0);
      targetCamPos.current.set(center.x, center.y, dist);
      
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
      }
      camera.position.copy(targetCamPos.current);
      camera.lookAt(targetLookAt.current);
      camera.updateProjectionMatrix();
    }
  }, [cameraFitTrigger, globalBoundingBox, camera, controlsRef]);

  // 2. Center camera target smoothly on Entity selection
  useEffect(() => {
    if (selectedEntityId) {
      const selected = entities.find(e => e.id === selectedEntityId);
      if (selected && selected.bounds) {
        const bounds = selected.bounds;
        const cx = (bounds.minX + bounds.maxX) / 2;
        const cy = (bounds.minY + bounds.maxY) / 2;
        
        targetLookAt.current.set(cx, cy, 0);
        
        // Slightly move camera in X/Y closer, keeping Z position
        targetCamPos.current.set(cx, cy, camera.position.z);
        isTransitioning.current = true;
      }
    }
  }, [selectedEntityId, entities, camera]);

  // 3. Smoothly animate the camera back to looking straight down when viewMode changes to '2D'
  useEffect(() => {
    if (viewMode === '2D') {
      if (controlsRef.current) {
        // Capture current center lookAt
        const curTarget = controlsRef.current.target;
        targetLookAt.current.set(curTarget.x, curTarget.y, 0);

        // Keep the current Z height distance from the target coordinates
        const dist = camera.position.distanceTo(curTarget);
        targetCamPos.current.set(curTarget.x, curTarget.y, Math.max(20, dist));
        isTransitioning.current = true;
      }
    }
  }, [viewMode, camera, controlsRef]);

  // Lerp camera target and position on every frame for buttery transitions
  useFrame((state, delta) => {
    if (controlsRef.current && isTransitioning.current) {
      const controls = controlsRef.current;
      
      // Interpolate Controls Target
      controls.target.lerp(targetLookAt.current, 0.08);
      
      // Interpolate Camera X & Y position to slide viewport over
      camera.position.x = THREE.MathUtils.lerp(camera.position.x, targetCamPos.current.x, 0.08);
      camera.position.y = THREE.MathUtils.lerp(camera.position.y, targetCamPos.current.y, 0.08);
      
      // Interpolate Z position to align straight on flat mode
      camera.position.z = THREE.MathUtils.lerp(camera.position.z, targetCamPos.current.z, 0.08);

      // If we are extremely close, stop the transition trigger
      const dist = controls.target.distanceTo(targetLookAt.current);
      const camDist = camera.position.distanceTo(targetCamPos.current);
      if (dist < 0.01 && camDist < 0.05) {
        isTransitioning.current = false;
      }
      
      controls.update();
    }
  });

  return null;
}

export default function CanvasViewer() {
  const { entities, layerVisibility, viewMode, setViewMode, triggerCameraFit } = useDXFStore();
  
  const controlsRef = useRef(null);
  const [showGrid, setShowGrid] = useState(true);
  const [showAxes, setShowAxes] = useState(true);

  // Filter visible entities to pass down to renderer
  const visibleEntities = entities.filter(e => layerVisibility[e.layer]);

  return (
    <div className="relative flex-1 h-full w-full bg-zinc-950 overflow-hidden select-none">
      {/* 1. R3F WebGL Canvas */}
      <Canvas
        camera={{ position: [0, 0, 100], fov: 45, near: 0.1, far: 5000 }}
        gl={{ antialias: true, logarithmicDepthBuffer: true }}
      >
        <color attach="background" args={['#09090b']} />
        
        {/* Lights */}
        <ambientLight intensity={1.5} />
        <directionalLight position={[0, 0, 100]} intensity={1.2} />
        <directionalLight position={[0, 0, -100]} intensity={0.5} />

        {/* CAD Geometries Layer */}
        <group>
          {visibleEntities.map(entity => (
            <EntityRenderer key={entity.id} entity={entity} />
          ))}
        </group>

        {/* Helpers */}
        {showGrid && (
          <Grid
            position={[0, 0, -0.1]}
            args={[1000, 1000]}
            cellSize={10}
            cellThickness={0.5}
            cellColor="#18181b"
            sectionSize={100}
            sectionThickness={1.0}
            sectionColor="#27272a"
            fadeDistance={2000}
            infiniteGrid
          />
        )}
        
        {showAxes && (
          <primitive object={new THREE.AxesHelper(100)} position={[0, 0, 0]} />
        )}

        {/* Viewport Interaction Controls */}
        <OrbitControls
          ref={controlsRef}
          enableRotate={viewMode === '3D'}
          enableZoom={true}
          enablePan={true}
          mouseButtons={{
            LEFT: viewMode === '3D' ? THREE.MOUSE.ROTATE : THREE.MOUSE.PAN,
            MIDDLE: THREE.MOUSE.DOLLY,
            RIGHT: THREE.MOUSE.PAN
          }}
          maxPolarAngle={viewMode === '2D' ? 0 : Math.PI}
          minPolarAngle={viewMode === '2D' ? 0 : 0}
        />

        {/* Smooth Camera Synchronization Manager */}
        <CameraSync controlsRef={controlsRef} />
      </Canvas>

      {/* 2. Glassmorphism HUD Overlays */}
      {/* Top Left: Navigation Mode indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-2 p-2.5 rounded-xl glass-panel text-xs text-zinc-300 pointer-events-auto">
        <div className="flex items-center gap-1.5 font-bold">
          <Move className="w-3.5 h-3.5 text-cyan-400" />
          <span>Pan: Drag (Left Click / Right Click)</span>
        </div>
        <div className="h-3 w-[1px] bg-zinc-800"></div>
        <div className="flex items-center gap-1.5 font-bold">
          <Compass className="w-3.5 h-3.5 text-cyan-400" />
          <span>Zoom: Scroll wheel</span>
        </div>
      </div>

      {/* Top Right: Viewport Mode Controllers */}
      <div className="absolute top-4 right-4 flex gap-2 pointer-events-auto">
        {/* Toggle 2D / 3D Navigation mode */}
        <div className="flex rounded-xl p-1 bg-zinc-900/90 border border-zinc-800 text-xs">
          <button
            onClick={() => setViewMode('2D')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '2D'
                ? 'bg-cyan-600 text-white shadow shadow-cyan-900/35'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            2D View
          </button>
          <button
            onClick={() => setViewMode('3D')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
              viewMode === '3D'
                ? 'bg-cyan-600 text-white shadow shadow-cyan-900/35'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            3D Orbit
          </button>
        </div>

        {/* Fit-to-screen */}
        <button
          onClick={triggerCameraFit}
          title="Fit Drawing to Screen"
          className="p-2.5 rounded-xl border border-zinc-800 bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-all shadow-lg shadow-black/20"
        >
          <Maximize className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Right: Helper Toggles (Grid, Axes) */}
      <div className="absolute bottom-4 right-4 flex gap-2 pointer-events-auto">
        <button
          onClick={() => setShowGrid(!showGrid)}
          title="Toggle Grid Helpers"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-lg ${
            showGrid
              ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
              : 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white'
          }`}
        >
          <Grid3X3 className="w-4 h-4" />
          Grid
        </button>

        <button
          onClick={() => setShowAxes(!showAxes)}
          title="Toggle Axes Helpers"
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all shadow-lg ${
            showAxes
              ? 'border-cyan-500/30 bg-cyan-950/20 text-cyan-400'
              : 'border-zinc-800 bg-zinc-900/90 text-zinc-400 hover:text-white'
          }`}
        >
          <Compass className="w-4 h-4" />
          Axes
        </button>
      </div>

      {/* Empty State Overlay */}
      {visibleEntities.length === 0 && (
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center bg-black/45 backdrop-blur-[1px]">
          <div className="text-center p-6 max-w-sm glass-panel rounded-2xl">
            <Eye className="w-8 h-8 text-zinc-500 mx-auto mb-3" />
            <h4 className="text-sm font-bold text-white mb-1">No Geometries Rendered</h4>
            <p className="text-xs text-zinc-500 leading-relaxed">
              All CAD layers are currently disabled or invisible. Toggle layer checkboxes in the sidebar to display vectors.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
