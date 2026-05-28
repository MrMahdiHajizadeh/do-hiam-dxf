/**
 * DXFParserUtils.js
 * 
 * Mathematical module for exact bounding box and dimension calculations
 * of standard and complex DXF entities (LINE, POLYLINE, CIRCLE, ARC, SPLINE, HATCH).
 */

// --- 1. ARC MATHEMATICAL UTILITIES ---

/**
 * Normalizes an angle in radians to [0, 2*PI)
 */
export function normalizeAngle(angle) {
  const PI2 = Math.PI * 2;
  return (angle % PI2 + PI2) % PI2;
}

/**
 * Checks if a given angle (in radians) is within the sweep of an arc
 */
export function isAngleInArc(angleRad, startRad, endRad) {
  const a = normalizeAngle(angleRad);
  const s = normalizeAngle(startRad);
  const e = normalizeAngle(endRad);

  if (s <= e) {
    return a >= s && a <= e;
  } else {
    // Arc crosses the 0 / 2*PI boundary
    return a >= s || a <= e;
  }
}

/**
 * Computes exact bounding box for an ARC entity
 */
export function calculateArcBounds(center, radius, startAngleDeg, endAngleDeg) {
  const cx = center.x;
  const cy = center.y;
  const r = radius;

  // Convert angles from degrees to radians
  const startRad = (startAngleDeg * Math.PI) / 180;
  const endRad = (endAngleDeg * Math.PI) / 180;

  // Start and end points of the arc
  const x1 = cx + r * Math.cos(startRad);
  const y1 = cy + r * Math.sin(startRad);
  const x2 = cx + r * Math.cos(endRad);
  const y2 = cy + r * Math.sin(endRad);

  const pointsX = [x1, x2];
  const pointsY = [y1, y2];

  // Test the 4 quadrant extremes (0, 90, 180, 270 degrees)
  const quadrants = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  quadrants.forEach(qRad => {
    if (isAngleInArc(qRad, startRad, endRad)) {
      pointsX.push(cx + r * Math.cos(qRad));
      pointsY.push(cy + r * Math.sin(qRad));
    }
  });

  const minX = Math.min(...pointsX);
  const minY = Math.min(...pointsY);
  const maxX = Math.max(...pointsX);
  const maxY = Math.max(...pointsY);

  return { minX, minY, maxX, maxY };
}


// --- 2. B-SPLINE MATHEMATICAL UTILITIES (De Boor's Algorithm) ---

/**
 * Evaluates a point on a B-spline at parameter t using De Boor's recursive algorithm.
 * 
 * @param {number} t - Parameter to evaluate, knots[degree] <= t <= knots[controlPoints.length]
 * @param {number} degree - Degree of B-spline (k)
 * @param {Array<{x, y, z}>} controlPoints - Array of control points
 * @param {Array<number>} knots - Knot vector
 */
export function evaluateBSpline(t, degree, controlPoints, knots) {
  const k = degree;
  const n = controlPoints.length;

  // 1. Find knot span 'i' such that knots[i] <= t < knots[i+1]
  let i = k;
  while (i < n - 1 && knots[i + 1] <= t) {
    i++;
  }

  // 2. Initialize active control points for calculation
  const d = [];
  for (let j = 0; j <= k; j++) {
    const cp = controlPoints[i - k + j] || controlPoints[controlPoints.length - 1];
    d.push({ x: cp.x, y: cp.y, z: cp.z || 0 });
  }

  // 3. De Boor's recurrence
  for (let r = 1; r <= k; r++) {
    for (let j = k; j >= r; j--) {
      const denom = knots[i + j + 1 - r] - knots[i - k + j];
      const alpha = denom === 0 ? 0 : (t - knots[i - k + j]) / denom;
      d[j] = {
        x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
        y: (1 - alpha) * d[j - 1].y + alpha * d[j].y,
        z: (1 - alpha) * d[j - 1].z + alpha * d[j].z
      };
    }
  }

  return d[k];
}

/**
 * Interpolates B-spline into a list of points and calculates its bounding box
 */
export function interpolateSpline(spline, sampleDensity = 50) {
  const controlPoints = spline.controlPoints;
  if (!controlPoints || controlPoints.length === 0) return { points: [], bounds: null };

  const degree = spline.degree || 3;
  const n = controlPoints.length;

  // Fallback / generate knots vector if not provided or empty
  let knots = spline.knots;
  if (!knots || knots.length === 0) {
    knots = [];
    const m = n + degree + 1;
    // Generate standard clamped uniform knot vector
    for (let i = 0; i < m; i++) {
      if (i <= degree) {
        knots.push(0);
      } else if (i >= m - degree - 1) {
        knots.push(1);
      } else {
        knots.push((i - degree) / (n - degree));
      }
    }
  }

  // Define parameter sweep range
  const tMin = knots[degree];
  const tMax = knots[n];
  const points = [];

  const totalSamples = sampleDensity * Math.max(1, n - degree);

  for (let s = 0; s <= totalSamples; s++) {
    const t = tMin + (s / totalSamples) * (tMax - tMin);
    const p = evaluateBSpline(t, degree, controlPoints, knots);
    points.push(p);
  }

  // Compute exact bounding box of the curve
  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  const maxX = Math.max(...xs);
  const maxY = Math.max(...ys);

  return {
    points,
    bounds: { minX, minY, maxX, maxY }
  };
}


// --- 3. POLYLINE BULGE ARC INTERPOLATION ---

/**
 * Interpolates arc segment between two polyline vertices if a bulge is present
 * Bulge = tan(sweep_angle / 4). Positive for CW, Negative for CCW.
 */
export function interpolateBulgeSegment(p1, p2, bulge, segments = 16) {
  const points = [];
  const x1 = p1.x;
  const y1 = p1.y;
  const x2 = p2.x;
  const y2 = p2.y;

  if (Math.abs(bulge) < 0.0001) {
    return [p1, p2];
  }

  const dx = x2 - x1;
  const dy = y2 - y1;
  const d = Math.sqrt(dx * dx + dy * dy);

  if (d === 0) return [p1];

  // Sagitta (height of arc)
  const s = bulge * (d / 2);
  // Radius of arc
  const r = (d / 2) * (1 + bulge * bulge) / (2 * bulge);
  
  // Center of arc along the perpendicular bisector
  const mx = (x1 + x2) / 2;
  const my = (y1 + y2) / 2;
  
  // Perpendicular vector
  const px = -dy / d;
  const py = dx / d;

  // Dist from chord center to arc center
  // h = r - s
  const h = r - s;
  const cx = mx + px * h;
  const cy = my + py * h;

  // Angles to start and end points from center
  const startRad = Math.atan2(y1 - cy, x1 - cx);
  const endRad = Math.atan2(y2 - cy, x2 - cx);

  // Sweep angle
  let sweep = endRad - startRad;
  if (bulge < 0) { // Clockwise
    if (sweep > 0) sweep -= Math.PI * 2;
  } else { // Counter-clockwise
    if (sweep < 0) sweep += Math.PI * 2;
  }

  for (let i = 0; i <= segments; i++) {
    const ratio = i / segments;
    const theta = startRad + sweep * ratio;
    points.push({
      x: cx + Math.abs(r) * Math.cos(theta),
      y: cy + Math.abs(r) * Math.sin(theta),
      z: p1.z || 0
    });
  }

  return points;
}


// --- 4. HATCH BOUNDARY PATH EXTRACTION ---

/**
 * Extracts points and calculates bounding box for HATCH boundary paths
 */
export function processHatchBoundary(hatch) {
  const points = [];
  
  if (hatch.boundaryPaths && Array.isArray(hatch.boundaryPaths)) {
    hatch.boundaryPaths.forEach(path => {
      // 1. If path consists of raw edges
      if (path.edges && Array.isArray(path.edges)) {
        path.edges.forEach(edge => {
          if (edge.type === 'LINE' || edge.start) {
            const start = edge.start || edge.vertices?.[0];
            const end = edge.end || edge.vertices?.[1];
            if (start) points.push({ x: start.x, y: start.y });
            if (end) points.push({ x: end.x, y: end.y });
          } else if (edge.center && edge.radius) {
            // Arc / circle edge
            const cx = edge.center.x;
            const cy = edge.center.y;
            const r = edge.radius;
            if (edge.startAngle !== undefined && edge.endAngle !== undefined) {
              const startRad = (edge.startAngle * Math.PI) / 180;
              const endRad = (edge.endAngle * Math.PI) / 180;
              points.push({ x: cx + r * Math.cos(startRad), y: cy + r * Math.sin(startRad) });
              points.push({ x: cx + r * Math.cos(endRad), y: cy + r * Math.sin(endRad) });
              // Quadrants
              [0, Math.PI/2, Math.PI, 3*Math.PI/2].forEach(q => {
                if (isAngleInArc(q, startRad, endRad)) {
                  points.push({ x: cx + r * Math.cos(q), y: cy + r * Math.sin(q) });
                }
              });
            } else {
              // Complete circle
              points.push({ x: cx - r, y: cy - r });
              points.push({ x: cx + r, y: cy + r });
            }
          }
        });
      }
      
      // 2. If path is a polyline-based loop
      if (path.vertices && Array.isArray(path.vertices)) {
        path.vertices.forEach(v => {
          points.push({ x: v.x, y: v.y });
        });
      }
    });
  }

  if (points.length === 0) return null;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  return {
    points,
    bounds: {
      minX: Math.min(...xs),
      minY: Math.min(...ys),
      maxX: Math.max(...xs),
      maxY: Math.max(...ys)
    }
  };
}


// --- 5. MAIN ENRICHMENT & PARSING ENTRY POINT ---

/**
 * Enriches and calculates exact dimensions for an individual entity.
 * Adds 'id', 'width', 'height', 'bounds', and visual coordinates to the object.
 * 
 * @param {object} entity - Raw DXF entity from dxf-parser
 * @param {number} idx - Index to create a unique ID
 */
export function processEntity(entity, idx) {
  const type = entity.type;
  const layer = entity.layer || '0';
  const id = `${type}_${idx}_${Date.now().toString().slice(-4)}`;
  
  let bounds = null;
  let points = []; // Interpolated points for rendering if needed

  switch (type) {
    case 'LINE': {
      const x1 = entity.vertices?.[0]?.x ?? entity.start?.x ?? 0;
      const y1 = entity.vertices?.[0]?.y ?? entity.start?.y ?? 0;
      const z1 = entity.vertices?.[0]?.z ?? entity.start?.z ?? 0;
      const x2 = entity.vertices?.[1]?.x ?? entity.end?.x ?? 0;
      const y2 = entity.vertices?.[1]?.y ?? entity.end?.y ?? 0;
      const z2 = entity.vertices?.[1]?.z ?? entity.end?.z ?? 0;

      bounds = {
        minX: Math.min(x1, x2),
        minY: Math.min(y1, y2),
        maxX: Math.max(x1, x2),
        maxY: Math.max(y1, y2)
      };
      points = [{ x: x1, y: y1, z: z1 }, { x: x2, y: y2, z: z2 }];
      break;
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      if (entity.vertices && entity.vertices.length > 0) {
        const interpolated = [];
        const elevation = entity.elevation ?? 0;

        for (let i = 0; i < entity.vertices.length; i++) {
          const v1 = entity.vertices[i];
          const v2 = entity.vertices[i + 1] || (entity.shape ? entity.vertices[0] : null);

          if (v1 && v2 && v1.bulge) {
            const p1 = { x: v1.x, y: v1.y, z: v1.z ?? elevation };
            const p2 = { x: v2.x, y: v2.y, z: v2.z ?? elevation };
            const arcPoints = interpolateBulgeSegment(p1, p2, v1.bulge);
            // Append all but last point to avoid duplicates
            interpolated.push(...arcPoints.slice(0, -1));
          } else {
            interpolated.push({ x: v1.x, y: v1.y, z: v1.z ?? elevation });
          }
        }
        
        // Add final vertex for open polyline
        if (!entity.shape && entity.vertices.length > 0) {
          const lastV = entity.vertices[entity.vertices.length - 1];
          interpolated.push({ x: lastV.x, y: lastV.y, z: lastV.z ?? elevation });
        }

        const xs = interpolated.map(v => v.x);
        const ys = interpolated.map(v => v.y);

        bounds = {
          minX: Math.min(...xs),
          minY: Math.min(...ys),
          maxX: Math.max(...xs),
          maxY: Math.max(...ys)
        };
        points = interpolated;
      }
      break;
    }

    case 'CIRCLE': {
      const cx = entity.center?.x ?? 0;
      const cy = entity.center?.y ?? 0;
      const r = entity.radius ?? 0;

      bounds = {
        minX: cx - r,
        minY: cy - r,
        maxX: cx + r,
        maxY: cy + r
      };
      break;
    }

    case 'ARC': {
      const cx = entity.center?.x ?? 0;
      const cy = entity.center?.y ?? 0;
      const r = entity.radius ?? 0;
      const startAngle = entity.startAngle ?? 0;
      const endAngle = entity.endAngle ?? 0;

      bounds = calculateArcBounds({ x: cx, y: cy }, r, startAngle, endAngle);
      break;
    }

    case 'SPLINE': {
      const splineEval = interpolateSpline(entity);
      bounds = splineEval.bounds;
      points = splineEval.points;
      break;
    }

    case 'HATCH': {
      const hatchEval = processHatchBoundary(entity);
      if (hatchEval) {
        bounds = hatchEval.bounds;
        points = hatchEval.points;
      }
      break;
    }

    default:
      // Fallback bounding box calculation for other/generic entities
      if (entity.position) {
        const x = entity.position.x ?? 0;
        const y = entity.position.y ?? 0;
        bounds = { minX: x - 0.5, minY: y - 0.5, maxX: x + 0.5, maxY: y + 0.5 };
      }
      break;
  }

  // Calculate clean width (W) and height (H)
  let width = 0;
  let height = 0;
  if (bounds) {
    width = parseFloat((bounds.maxX - bounds.minX).toFixed(4));
    height = parseFloat((bounds.maxY - bounds.minY).toFixed(4));
  }

  const enriched = {
    id,
    type,
    layer,
    color: entity.color,
    width,
    height,
    bounds,
    points, // Preserved interpolated points for optimized R3F rendering
    raw: entity
  };

  const props = calculateEntityProperties(enriched);
  enriched.perimeter = props.perimeter;
  enriched.area = props.area;

  return enriched;
}

/**
 * Calculates perimeter and area for standard and complex shapes.
 */
export function calculateEntityProperties(entity) {
  const { type, raw, points } = entity;
  let perimeter = 0;
  let area = 0;

  switch (type) {
    case 'LINE': {
      const p1 = points?.[0] || { x: 0, y: 0, z: 0 };
      const p2 = points?.[1] || { x: 0, y: 0, z: 0 };
      perimeter = Math.sqrt(
        Math.pow(p2.x - p1.x, 2) +
        Math.pow(p2.y - p1.y, 2) +
        Math.pow(p2.z - p1.z, 2)
      );
      area = 0;
      break;
    }

    case 'LWPOLYLINE':
    case 'POLYLINE': {
      if (points && points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          perimeter += Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
          );
        }
        const isClosed = raw.shape || (points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y);
        if (isClosed) {
          if (raw.shape) {
            const p1 = points[points.length - 1];
            const p2 = points[0];
            perimeter += Math.sqrt(
              Math.pow(p2.x - p1.x, 2) +
              Math.pow(p2.y - p1.y, 2) +
              Math.pow(p2.z - p1.z, 2)
            );
          }
          area = calculateShoelaceArea(points);
        }
      }
      break;
    }

    case 'CIRCLE': {
      const r = raw.radius || 0;
      perimeter = 2 * Math.PI * r;
      area = Math.PI * r * r;
      break;
    }

    case 'ARC': {
      const r = raw.radius || 0;
      const startAngle = raw.startAngle || 0;
      const endAngle = raw.endAngle || 0;
      
      let sweep = endAngle - startAngle;
      if (sweep < 0) sweep += 360;
      const sweepRad = (sweep * Math.PI) / 180;

      perimeter = r * sweepRad;
      area = 0.5 * r * r * sweepRad; // Sector Area
      break;
    }

    case 'SPLINE': {
      if (points && points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          perimeter += Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2) +
            Math.pow(p2.z - p1.z, 2)
          );
        }
        const isClosed = raw.closed || (points[0].x === points[points.length - 1].x && points[0].y === points[points.length - 1].y);
        if (isClosed) {
          area = calculateShoelaceArea(points);
        }
      }
      break;
    }

    case 'HATCH': {
      if (points && points.length > 1) {
        for (let i = 0; i < points.length - 1; i++) {
          const p1 = points[i];
          const p2 = points[i + 1];
          perimeter += Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2)
          );
        }
        area = calculateShoelaceArea(points);
      }
      break;
    }

    default:
      break;
  }

  return {
    perimeter: parseFloat(perimeter.toFixed(4)),
    area: parseFloat(area.toFixed(4))
  };
}

function calculateShoelaceArea(points) {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p1 = points[i];
    const p2 = points[(i + 1) % n];
    sum += p1.x * p2.y - p2.x * p1.y;
  }
  return Math.abs(sum) / 2;
}
