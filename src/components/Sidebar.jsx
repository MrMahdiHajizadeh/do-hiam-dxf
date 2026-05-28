import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useDXFStore } from '../store/DXFStore';
import { getLayerColor } from '../utils/ColorMap';
import { Search, Eye, EyeOff, Layers, Grid, RefreshCw } from 'lucide-react';

export default function Sidebar() {
  const {
    entities,
    layers,
    layerVisibility,
    selectedEntityId,
    globalBoundingBox,
    selectEntity,
    toggleLayer,
    setAllLayersVisibility,
    resetStore
  } = useDXFStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('id'); // 'id', 'type', 'width', 'height'
  const [sortAsc, setSortAsc] = useState(true);
  const [activeTab, setActiveTab] = useState('entities'); // 'entities' or 'layers'

  const activeRowRef = useRef(null);

  // Group stats by entity type
  const entityStats = useMemo(() => {
    const stats = {};
    entities.forEach(e => {
      stats[e.type] = (stats[e.type] || 0) + 1;
    });
    return Object.entries(stats).sort((a, b) => b[1] - a[1]);
  }, [entities]);

  // Find the currently selected entity data
  const selectedEntity = useMemo(() => {
    return entities.find(e => e.id === selectedEntityId) || null;
  }, [entities, selectedEntityId]);

  // Filtering and sorting entities
  const filteredEntities = useMemo(() => {
    return entities
      .filter(e => {
        // Filter by layer visibility
        if (!layerVisibility[e.layer]) return false;
        
        // Filter by search term
        const term = searchTerm.toLowerCase();
        return (
          e.id.toLowerCase().includes(term) ||
          e.type.toLowerCase().includes(term) ||
          e.layer.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        let valA = a[sortField];
        let valB = b[sortField];

        // Handle numeric sorting for width and height
        if (sortField === 'width' || sortField === 'height') {
          valA = Number(valA) || 0;
          valB = Number(valB) || 0;
        } else {
          valA = String(valA).toLowerCase();
          valB = String(valB).toLowerCase();
        }

        if (valA < valB) return sortAsc ? -1 : 1;
        if (valA > valB) return sortAsc ? 1 : -1;
        return 0;
      });
  }, [entities, layerVisibility, searchTerm, sortField, sortAsc]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  // Color badge helpers for entity types
  const getTypeBadgeClass = (type) => {
    const maps = {
      LINE: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
      LWPOLYLINE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      POLYLINE: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      CIRCLE: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      ARC: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      SPLINE: 'bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/20',
      HATCH: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    };
    return maps[type] || 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="w-[380px] h-full flex flex-col border-r border-zinc-800 bg-zinc-950 flex-shrink-0 z-20">
      {/* 1. Header with Stats & File Actions */}
      <div className="p-4 border-b border-zinc-800/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
            <h3 className="font-bold text-white text-sm tracking-wide">DXF ANALYZER</h3>
          </div>
          <button
            onClick={resetStore}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs transition-all"
          >
            <RefreshCw className="w-3 h-3" />
            Unload
          </button>
        </div>

        {/* Dynamic Details Panel: Global Bounding Box vs. Selected Entity Properties */}
        {!selectedEntity ? (
          /* Global Bounding Box Details */
          <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl border border-zinc-800/50 bg-zinc-900/30 text-xs">
            <div>
              <span className="text-zinc-500 uppercase font-semibold text-[10px] tracking-wider block">Width (X Size)</span>
              <span className="text-zinc-200 font-bold text-sm block">{globalBoundingBox.width.toFixed(2)} mm</span>
            </div>
            <div>
              <span className="text-zinc-500 uppercase font-semibold text-[10px] tracking-wider block">Height (Y Size)</span>
              <span className="text-zinc-200 font-bold text-sm block">{globalBoundingBox.height.toFixed(2)} mm</span>
            </div>
            <div className="col-span-2 pt-1.5 mt-1.5 border-t border-zinc-800/50 text-[10px] text-zinc-400 flex justify-between">
              <span>Center X: {globalBoundingBox.center.x.toFixed(2)}</span>
              <span>Center Y: {globalBoundingBox.center.y.toFixed(2)}</span>
            </div>
          </div>
        ) : (
          /* Selected Entity Properties (طول و عرض حداکثر، محیط و مساحت) */
          <div className="flex flex-col gap-2 p-3 rounded-xl border border-yellow-500/30 bg-yellow-500/5 text-xs animate-fadeIn relative">
            <div className="flex items-center justify-between pb-1.5 border-b border-zinc-800/60">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-400"></div>
                <span className="font-mono text-[10px] text-yellow-400 font-bold truncate max-w-[170px] uppercase">
                  {selectedEntity.id}
                </span>
              </div>
              <button 
                onClick={() => selectEntity(null)} 
                className="text-[9px] text-zinc-500 hover:text-zinc-300 font-bold uppercase transition-all"
              >
                Clear / لغو
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
              <div>
                <span className="text-zinc-500 text-[9px] font-bold block">طول حداکثر / Max Length</span>
                <span className="text-zinc-200 font-bold">{selectedEntity.width} mm</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[9px] font-bold block">عرض حداکثر / Max Width</span>
                <span className="text-zinc-200 font-bold">{selectedEntity.height} mm</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[9px] font-bold block">محیط / Perimeter</span>
                <span className="text-zinc-200 font-bold text-yellow-400/90">{selectedEntity.perimeter} mm</span>
              </div>
              <div>
                <span className="text-zinc-500 text-[9px] font-bold block">مساحت / Area</span>
                <span className="text-zinc-200 font-bold text-yellow-400/90">
                  {selectedEntity.area > 0 ? `${selectedEntity.area} mm²` : '0 (Linear / Open)'}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex border-b border-zinc-800">
        <button
          onClick={() => setActiveTab('entities')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'entities'
              ? 'text-cyan-400 border-cyan-500 bg-cyan-950/5'
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          <Grid className="w-3.5 h-3.5" />
          Entities ({filteredEntities.length})
        </button>
        <button
          onClick={() => setActiveTab('layers')}
          className={`flex-1 py-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 flex items-center justify-center gap-2 ${
            activeTab === 'layers'
              ? 'text-cyan-400 border-cyan-500 bg-cyan-950/5'
              : 'text-zinc-500 border-transparent hover:text-zinc-300'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Layers ({layers.length})
        </button>
      </div>

      {/* 3. Dynamic Sidebar Panels */}
      <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
        {activeTab === 'entities' && (
          <>
            {/* Search and sorting header */}
            <div className="p-3 border-b border-zinc-900 bg-zinc-950 sticky top-0 z-10 flex flex-col gap-2">
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by ID, type or layer..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/60 text-zinc-200 text-xs focus:outline-none focus:border-cyan-500/80 transition-all placeholder:text-zinc-600"
                />
              </div>

              {/* Sorting Bar */}
              <div className="flex items-center justify-between text-[10px] font-bold text-zinc-500 uppercase tracking-wider px-1 pt-1">
                <span>Sort by:</span>
                <div className="flex gap-2.5">
                  <button onClick={() => handleSort('id')} className={`flex items-center gap-0.5 hover:text-zinc-300 transition-all ${sortField === 'id' ? 'text-cyan-400' : ''}`}>
                    ID {sortField === 'id' && (sortAsc ? '▲' : '▼')}
                  </button>
                  <button onClick={() => handleSort('type')} className={`flex items-center gap-0.5 hover:text-zinc-300 transition-all ${sortField === 'type' ? 'text-cyan-400' : ''}`}>
                    Type {sortField === 'type' && (sortAsc ? '▲' : '▼')}
                  </button>
                  <button onClick={() => handleSort('width')} className={`flex items-center gap-0.5 hover:text-zinc-300 transition-all ${sortField === 'width' ? 'text-cyan-400' : ''}`}>
                    W {sortField === 'width' && (sortAsc ? '▲' : '▼')}
                  </button>
                  <button onClick={() => handleSort('height')} className={`flex items-center gap-0.5 hover:text-zinc-300 transition-all ${sortField === 'height' ? 'text-cyan-400' : ''}`}>
                    H {sortField === 'height' && (sortAsc ? '▲' : '▼')}
                  </button>
                </div>
              </div>
            </div>

            {/* Entity Scrollable Table List */}
            <div className="flex-1 overflow-y-auto divide-y divide-zinc-900/50">
              {filteredEntities.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <span className="text-zinc-600 text-xs font-medium">No visible matching entities found.</span>
                </div>
              ) : (
                filteredEntities.map((entity) => {
                  const isSelected = selectedEntityId === entity.id;
                  return (
                    <EntityRow
                      key={entity.id}
                      entity={entity}
                      isSelected={isSelected}
                      onClick={() => selectEntity(entity.id)}
                      getTypeBadgeClass={getTypeBadgeClass}
                    />
                  );
                })
              )}
            </div>
          </>
        )}

        {activeTab === 'layers' && (
          <div className="p-4 flex flex-col gap-4">
            {/* Multi-Select Toggles */}
            <div className="flex gap-2">
              <button
                onClick={() => setAllLayersVisibility(true)}
                className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                Show All
              </button>
              <button
                onClick={() => setAllLayersVisibility(false)}
                className="flex-1 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold transition-all"
              >
                Hide All
              </button>
            </div>

            {/* List of Layers */}
            <div className="flex flex-col gap-2">
              {layers.map(layer => {
                const isVisible = layerVisibility[layer];
                const layerColor = getLayerColor(layer);
                return (
                  <div
                    key={layer}
                    onClick={() => toggleLayer(layer)}
                    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                      isVisible 
                        ? 'border-zinc-800 bg-zinc-900/20 hover:bg-zinc-900/40' 
                        : 'border-zinc-900/40 bg-zinc-950/20 opacity-50 hover:opacity-75'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3.5 h-3.5 rounded-full border border-black/20"
                        style={{ backgroundColor: layerColor }}
                      ></div>
                      <span className="text-zinc-200 font-bold text-xs">{layer}</span>
                    </div>

                    <button className="text-zinc-500 hover:text-zinc-300 transition-all">
                      {isVisible ? (
                        <Eye className="w-4 h-4 text-cyan-400" />
                      ) : (
                        <EyeOff className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 4. Statistics Footer summary */}
      <div className="p-3 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between text-[10px] text-zinc-500 uppercase tracking-wider font-bold">
        <span>Total Count: {entities.length} items</span>
        <div className="flex gap-2">
          {entityStats.slice(0, 3).map(([type, count]) => (
            <span key={type} className="text-[9px] px-1 py-0.5 rounded border border-zinc-800/80 bg-zinc-900/30">
              {type}: {count}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

/**
 * EntityRow component with custom scroll-into-view hook
 */
function EntityRow({ entity, isSelected, onClick, getTypeBadgeClass }) {
  const rowRef = useRef(null);

  // Scroll active rows into view if they were clicked on the Canvas
  useEffect(() => {
    if (isSelected && rowRef.current) {
      rowRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    }
  }, [isSelected]);

  return (
    <div
      ref={rowRef}
      onClick={onClick}
      className={`p-3 transition-all cursor-pointer border-l-2 flex flex-col gap-2 text-xs relative ${
        isSelected
          ? 'border-yellow-500 bg-yellow-500/5 hover:bg-yellow-500/10'
          : 'border-transparent hover:bg-zinc-900/40 bg-zinc-950/20'
      }`}
    >
      <div className="flex items-center justify-between">
        <span className={`font-mono text-[10px] uppercase font-bold tracking-tight ${isSelected ? 'text-yellow-400' : 'text-zinc-400'}`}>
          {entity.id}
        </span>
        <span className={`px-1.5 py-0.5 rounded-full border text-[9px] font-bold ${getTypeBadgeClass(entity.type)}`}>
          {entity.type}
        </span>
      </div>

      <div className="flex items-center justify-between text-zinc-500 font-medium">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full border border-black/20" style={{ backgroundColor: getLayerColor(entity.layer) }}></div>
          <span className="text-[10px] text-zinc-400 font-bold truncate max-w-[120px]">{entity.layer}</span>
        </div>
        <div className="flex gap-2.5 text-[10px] font-mono font-bold">
          <span>W: <span className={isSelected ? 'text-yellow-400/80' : 'text-zinc-300'}>{entity.width}</span></span>
          <span>H: <span className={isSelected ? 'text-yellow-400/80' : 'text-zinc-300'}>{entity.height}</span></span>
        </div>
      </div>
    </div>
  );
}
