import { create } from 'zustand';

export const useDXFStore = create((set, get) => ({
  // Core DXF Data State
  dxfData: null,
  entities: [],
  layers: [],
  layerVisibility: {},
  
  // Interaction State
  selectedEntityId: null,
  hoveredEntityId: null,
  viewMode: '2D', // '2D' or '3D'
  cameraFitTrigger: 0,
  
  // Bounding box for the entire model
  globalBoundingBox: {
    minX: 0,
    minY: 0,
    maxX: 0,
    maxY: 0,
    width: 0,
    height: 0,
    center: { x: 0, y: 0 }
  },

  // Actions
  setDxfData: (parsedDxf, enrichedEntities) => {
    // 1. Extract unique layer names
    const layers = Array.from(new Set(enrichedEntities.map(e => e.layer || '0')));
    
    // 2. Initialize visibility map (all true by default)
    const layerVisibility = {};
    layers.forEach(layer => {
      layerVisibility[layer] = true;
    });

    // 3. Compute initial global bounding box based on visible entities
    const visibleEntities = enrichedEntities.filter(e => layerVisibility[e.layer]);
    const globalBoundingBox = computeGlobalBoundingBox(visibleEntities);

    set({
      dxfData: parsedDxf,
      entities: enrichedEntities,
      layers: layers.sort(),
      layerVisibility,
      globalBoundingBox,
      selectedEntityId: null,
      hoveredEntityId: null,
      cameraFitTrigger: get().cameraFitTrigger + 1
    });
  },

  selectEntity: (entityId) => {
    set({ selectedEntityId: entityId });
  },

  setHoveredEntity: (entityId) => {
    set({ hoveredEntityId: entityId });
  },

  toggleLayer: (layerName) => {
    const { layerVisibility, entities } = get();
    const newVisibility = {
      ...layerVisibility,
      [layerName]: !layerVisibility[layerName]
    };

    // Recompute global bounding box based on newly visible entities
    const visibleEntities = entities.filter(e => newVisibility[e.layer]);
    const globalBoundingBox = computeGlobalBoundingBox(visibleEntities);

    set({
      layerVisibility: newVisibility,
      globalBoundingBox,
      // Clear selection if selected entity's layer is hidden
      selectedEntityId: get().selectedEntityId && entities.find(e => e.id === get().selectedEntityId)?.layer === layerName && !newVisibility[layerName]
        ? null
        : get().selectedEntityId
    });
  },

  setAllLayersVisibility: (visible) => {
    const { layers, layerVisibility, entities } = get();
    const newVisibility = {};
    layers.forEach(layer => {
      newVisibility[layer] = visible;
    });

    const visibleEntities = entities.filter(e => newVisibility[e.layer]);
    const globalBoundingBox = computeGlobalBoundingBox(visibleEntities);

    set({
      layerVisibility: newVisibility,
      globalBoundingBox,
      selectedEntityId: visible ? get().selectedEntityId : null
    });
  },

  setViewMode: (mode) => {
    set({ viewMode: mode });
  },

  triggerCameraFit: () => {
    set(state => ({ cameraFitTrigger: state.cameraFitTrigger + 1 }));
  },

  resetStore: () => {
    set({
      dxfData: null,
      entities: [],
      layers: [],
      layerVisibility: {},
      selectedEntityId: null,
      hoveredEntityId: null,
      viewMode: '2D',
      cameraFitTrigger: 0,
      globalBoundingBox: {
        minX: 0,
        minY: 0,
        maxX: 0,
        maxY: 0,
        width: 0,
        height: 0,
        center: { x: 0, y: 0 }
      }
    });
  }
}));

// Helper to compute a bounding box enclosing a list of entities
function computeGlobalBoundingBox(entities) {
  if (entities.length === 0) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
  }

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  entities.forEach(entity => {
    const bounds = entity.bounds;
    if (bounds) {
      if (bounds.minX < minX) minX = bounds.minX;
      if (bounds.minY < minY) minY = bounds.minY;
      if (bounds.maxX > maxX) maxX = bounds.maxX;
      if (bounds.maxY > maxY) maxY = bounds.maxY;
    }
  });

  // Handle case where no entities have valid bounds
  if (minX === Infinity || minY === Infinity || maxX === -Infinity || maxY === -Infinity) {
    return { minX: 0, minY: 0, maxX: 0, maxY: 0, width: 0, height: 0, center: { x: 0, y: 0 } };
  }

  const width = maxX - minX;
  const height = maxY - minY;
  const center = {
    x: minX + width / 2,
    y: minY + height / 2
  };

  return { minX, minY, maxX, maxY, width, height, center };
}
