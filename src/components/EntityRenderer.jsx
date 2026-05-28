import React, { useMemo, useState } from 'react';
import * as THREE from 'three';
import { useDXFStore } from '../store/DXFStore';
import { getEntityColor } from '../utils/ColorMap';

export default function EntityRenderer({ entity }) {
  const selectedEntityId = useDXFStore(state => state.selectedEntityId);
  const hoveredEntityId = useDXFStore(state => state.hoveredEntityId);
  const selectEntity = useDXFStore(state => state.selectEntity);
  const setHoveredEntity = useDXFStore(state => state.setHoveredEntity);

  const [localHover, setLocalHover] = useState(false);

  const isSelected = selectedEntityId === entity.id;
  const isHovered = hoveredEntityId === entity.id || localHover;

  // 1. Resolve Display Color
  const displayColor = useMemo(() => {
    if (isSelected) return '#facc15'; // Neon yellow (yellow-400)
    if (isHovered) return '#22d3ee';  // Electric cyan (cyan-400)
    return getEntityColor(entity.raw, entity.layer);
  }, [entity, isSelected, isHovered]);

  // 2. Resolve Line Thickness / Render Weight
  const lineWidth = isSelected ? 3 : isHovered ? 2 : 1.2;

  // 3. Pointer Hover Event Handlers
  const handlePointerOver = (e) => {
    e.stopPropagation();
    setLocalHover(true);
    setHoveredEntity(entity.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = (e) => {
    e.stopPropagation();
    setLocalHover(false);
    setHoveredEntity(null);
    document.body.style.cursor = 'default';
  };

  const handleClick = (e) => {
    e.stopPropagation();
    selectEntity(entity.id);
  };

  // 4. Render Geometry based on DXF Entity Type
  switch (entity.type) {
    case 'LINE': {
      const geom = useMemo(() => {
        const x1 = entity.points?.[0]?.x ?? 0;
        const y1 = entity.points?.[0]?.y ?? 0;
        const z1 = entity.points?.[0]?.z ?? 0;
        const x2 = entity.points?.[1]?.x ?? 0;
        const y2 = entity.points?.[1]?.y ?? 0;
        const z2 = entity.points?.[1]?.z ?? 0;

        const points = [
          new THREE.Vector3(x1, y1, z1),
          new THREE.Vector3(x2, y2, z2)
        ];
        return new THREE.BufferGeometry().setFromPoints(points);
      }, [entity]);

      return (
        <line
          geometry={geom}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
        </line>
      );
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      const geom = useMemo(() => {
        if (!entity.points || entity.points.length === 0) return null;
        const points = entity.points.map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0));
        
        // If it's closed polyline, append start point to close the visual rendering
        if (entity.raw.shape && points.length > 1) {
          points.push(points[0].clone());
        }

        return new THREE.BufferGeometry().setFromPoints(points);
      }, [entity]);

      if (!geom) return null;

      return (
        <line
          geometry={geom}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
        </line>
      );
    }

    case 'CIRCLE': {
      const cz = entity.raw.center?.z ?? 0;
      
      const geom = useMemo(() => {
        const cx = entity.raw.center?.x ?? 0;
        const cy = entity.raw.center?.y ?? 0;
        const r = entity.raw.radius ?? 0;

        const curve = new THREE.EllipseCurve(
          cx, cy,
          r, r,
          0, 2 * Math.PI,
          false, 0
        );

        const points = curve.getPoints(64).map(p => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.BufferGeometry().setFromPoints(points);
      }, [entity]);

      return (
        <line
          geometry={geom}
          position={[0, 0, cz]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
        </line>
      );
    }

    case 'ARC': {
      const cz = entity.raw.center?.z ?? 0;

      const geom = useMemo(() => {
        const cx = entity.raw.center?.x ?? 0;
        const cy = entity.raw.center?.y ?? 0;
        const r = entity.raw.radius ?? 0;
        
        // Convert angles from degrees to radians
        const startRad = (entity.raw.startAngle * Math.PI) / 180;
        const endRad = (entity.raw.endAngle * Math.PI) / 180;

        const curve = new THREE.EllipseCurve(
          cx, cy,
          r, r,
          startRad, endRad,
          false, 0
        );

        const points = curve.getPoints(40).map(p => new THREE.Vector3(p.x, p.y, 0));
        return new THREE.BufferGeometry().setFromPoints(points);
      }, [entity]);

      return (
        <line
          geometry={geom}
          position={[0, 0, cz]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
        </line>
      );
    }

    case 'SPLINE': {
      const geom = useMemo(() => {
        if (!entity.points || entity.points.length === 0) return null;
        const points = entity.points.map(p => new THREE.Vector3(p.x, p.y, p.z ?? 0));
        return new THREE.BufferGeometry().setFromPoints(points);
      }, [entity]);

      if (!geom) return null;

      return (
        <line
          geometry={geom}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
        </line>
      );
    }

    case 'HATCH': {
      const ez = entity.raw.elevation ?? entity.raw.center?.z ?? 0;

      // 1. Render closed HATCH boundaries as clean outline borders
      const boundaryGeoms = useMemo(() => {
        if (!entity.points || entity.points.length === 0) return [];
        
        const loops = [];
        let currentLoop = [];

        entity.points.forEach((p, idx) => {
          currentLoop.push(new THREE.Vector3(p.x, p.y, 0));
          // Split loops if points are duplicated (start and end)
          if (idx > 0 && p.x === entity.points[0].x && p.y === entity.points[0].y) {
            loops.push(new THREE.BufferGeometry().setFromPoints(currentLoop));
            currentLoop = [];
          }
        });

        if (currentLoop.length > 1) {
          currentLoop.push(currentLoop[0].clone());
          loops.push(new THREE.BufferGeometry().setFromPoints(currentLoop));
        }

        if (loops.length === 0 && entity.points.length > 1) {
          const simplePoints = entity.points.map(p => new THREE.Vector3(p.x, p.y, 0));
          simplePoints.push(simplePoints[0].clone());
          loops.push(new THREE.BufferGeometry().setFromPoints(simplePoints));
        }

        return loops;
      }, [entity]);

      // 2. Attempt a filled polygon shape if HATCH is a solid fill
      const fillShape = useMemo(() => {
        if (!entity.points || entity.points.length < 3) return null;
        try {
          const pts = entity.points.map(p => new THREE.Vector2(p.x, p.y));
          const shape = new THREE.Shape(pts);
          return shape;
        } catch (err) {
          return null;
        }
      }, [entity]);

      return (
        <group
          position={[0, 0, ez]}
          onClick={handleClick}
          onPointerOver={handlePointerOver}
          onPointerOut={handlePointerOut}
        >
          {/* Transparent solid fill */}
          {fillShape && (
            <mesh>
              <shapeGeometry args={[fillShape]} />
              <meshBasicMaterial
                color={displayColor}
                transparent={true}
                opacity={isSelected ? 0.35 : isHovered ? 0.25 : 0.15}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          )}

          {/* Wireframe boundary outlines */}
          {boundaryGeoms.map((geom, idx) => (
            <line key={idx} geometry={geom}>
              <lineBasicMaterial color={displayColor} linewidth={lineWidth} />
            </line>
          ))}
        </group>
      );
    }

    default:
      // Generic fallback marker for unsupported entities (points)
      if (entity.raw.position) {
        const fz = entity.raw.position.z ?? 0;
        return (
          <mesh
            position={[entity.raw.position.x, entity.raw.position.y, fz]}
            onClick={handleClick}
            onPointerOver={handlePointerOver}
            onPointerOut={handlePointerOut}
          >
            <boxGeometry args={[0.5, 0.5, 0.5]} />
            <meshBasicMaterial color={displayColor} />
          </mesh>
        );
      }
      return null;
  }
}
