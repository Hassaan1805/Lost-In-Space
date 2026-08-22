import React, { useState, useEffect, useRef } from "react";
import { ArrowRight, Link, Zap, Rocket, ShieldAlert, Crosshair, Map, Activity } from "lucide-react";
import "../styles/radial-timeline.css";

interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: React.ComponentType<{ size?: number }>;
  relatedIds: number[];
  status: "completed" | "in-progress" | "pending";
  energy: number;
}

export const TIMELINE_DATA: TimelineItem[] = [
  {
    id: 1,
    title: "Deep Space Protocol",
    date: "T-MINUS 10:00",
    content: "Initiating long-range scanners. Preparing quantum drive for deep space transit.",
    category: "Navigation",
    icon: Map,
    relatedIds: [2],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Atmospheric Entry",
    date: "T-MINUS 05:00",
    content: "Shields at maximum capacity. Approaching exosphere entry vector.",
    category: "Shields",
    icon: ShieldAlert,
    relatedIds: [1, 3],
    status: "completed",
    energy: 85,
  },
  {
    id: 3,
    title: "Orbital Lock",
    date: "T-MINUS 01:00",
    content: "Establishing geostationary orbit. Thrusters stabilizing.",
    category: "Propulsion",
    icon: Rocket,
    relatedIds: [2, 4],
    status: "in-progress",
    energy: 60,
  },
  {
    id: 4,
    title: "Surface Scan",
    date: "T-PLUS 00:00",
    content: "Deploying high-resolution telemetry. Scanning for anomalies.",
    category: "Sensors",
    icon: Crosshair,
    relatedIds: [3, 5],
    status: "pending",
    energy: 45,
  },
  {
    id: 5,
    title: "Life Signs",
    date: "T-PLUS 02:00",
    content: "Analyzing atmospheric composition for biological markers.",
    category: "Science",
    icon: Activity,
    relatedIds: [4],
    status: "pending",
    energy: 20,
  },
];

interface RadialOrbitalTimelineProps {
  timelineData?: TimelineItem[];
}

export default function RadialOrbitalTimeline({
  timelineData = TIMELINE_DATA,
}: RadialOrbitalTimelineProps) {
  const [expandedItems, setExpandedItems] = useState<Record<number, boolean>>({});
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [autoRotate, setAutoRotate] = useState<boolean>(true);
  const [pulseEffect, setPulseEffect] = useState<Record<number, boolean>>({});
  const [activeNodeId, setActiveNodeId] = useState<number | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);

  const handleContainerClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === containerRef.current || e.target === orbitRef.current) {
      setExpandedItems({});
      setActiveNodeId(null);
      setPulseEffect({});
      setAutoRotate(true);
    }
  };

  const toggleItem = (id: number) => {
    setExpandedItems((prev) => {
      const newState = { ...prev };
      Object.keys(newState).forEach((key) => {
        if (parseInt(key) !== id) {
          newState[parseInt(key)] = false;
        }
      });

      newState[id] = !prev[id];

      if (!prev[id]) {
        setActiveNodeId(id);
        setAutoRotate(false);

        const relatedItems = getRelatedItems(id);
        const newPulseEffect: Record<number, boolean> = {};
        relatedItems.forEach((relId) => {
          newPulseEffect[relId] = true;
        });
        setPulseEffect(newPulseEffect);
      } else {
        setActiveNodeId(null);
        setAutoRotate(true);
        setPulseEffect({});
      }

      return newState;
    });
  };

  useEffect(() => {
    let rotationTimer: ReturnType<typeof setInterval>;
    if (autoRotate) {
      rotationTimer = setInterval(() => {
        setRotationAngle((prev) => Number(((prev + 0.3) % 360).toFixed(3)));
      }, 50);
    }
    return () => clearInterval(rotationTimer);
  }, [autoRotate]);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    // Match the tilted orbital plane: the near arc is larger and brighter,
    // while the far arc compresses and recedes behind Earth.
    const x = 192 * Math.cos(radian);
    const y = 102 * Math.sin(radian);
    const depth = Math.sin(radian);
    const scale = 0.76 + ((depth + 1) / 2) * 0.32;
    const zIndex = Math.round(100 + 90 * ((depth + 1) / 2));
    const opacity = Math.max(0.45, Math.min(1, 0.45 + 0.55 * ((depth + 1) / 2)));
    return { x, y, depth, scale, zIndex, opacity };
  };

  const getRelatedItems = (itemId: number): number[] => {
    const currentItem = timelineData.find((item) => item.id === itemId);
    return currentItem ? currentItem.relatedIds : [];
  };

  const isRelatedToActive = (itemId: number): boolean => {
    if (!activeNodeId) return false;
    return getRelatedItems(activeNodeId).includes(itemId);
  };

  const getBadgeClass = (status: TimelineItem["status"]) => {
    if (status === "completed") return "rot-badge-completed";
    if (status === "in-progress") return "rot-badge-inprogress";
    return "rot-badge-pending";
  };

  return (
    <div className="rot-container" ref={containerRef} onClick={handleContainerClick}>
      <div className="rot-interactive-area">
        <div className="rot-orbit" ref={orbitRef}>
          
          {/* Core Visuals */}
          <div className="rot-core-glow">
            <div className="rot-core-ring-1" />
            <div className="rot-core-ring-2" />
            <div className="rot-core-inner" />
          </div>
          
          <div className="rot-orbital-path" />

          {/* Nodes */}
          {timelineData.map((item, index) => {
            const position = calculateNodePosition(index, timelineData.length);
            const isExpanded = expandedItems[item.id];
            const isRelated = isRelatedToActive(item.id);
            const isPulsing = pulseEffect[item.id];
            const Icon = item.icon;
            const cardOpensAbove = position.y > 24;

            const iconClass = isExpanded ? "state-expanded" : isRelated ? "state-related" : "state-default";
            const titleClass = isExpanded ? "state-expanded" : "state-default";

            return (
              <div
                key={item.id}
                className="rot-node-wrapper"
                style={{
                  // Keep node/card interaction in the same DOM plane. The ellipse,
                  // scale, opacity, and stacking still provide the orbit depth cue.
                  transform: `translate(${position.x}px, ${position.y}px) scale(${position.scale})`,
                  zIndex: isExpanded ? 200 : position.zIndex,
                  opacity: isExpanded ? 1 : position.opacity,
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleItem(item.id);
                }}
              >
                {/* Energy Pulse Background */}
                <div
                  className={`rot-node-energy ${isPulsing ? "is-pulsing" : ""}`}
                  style={{
                    width: `${item.energy * 0.5 + 40}px`,
                    height: `${item.energy * 0.5 + 40}px`,
                    left: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                    top: `-${(item.energy * 0.5 + 40 - 40) / 2}px`,
                  }}
                />

                <div className={`rot-node-icon ${iconClass}`}>
                  <Icon size={16} />
                </div>

                <div className={`rot-node-title ${titleClass}`}>
                  {item.title}
                </div>

                {isExpanded && (
                  <div className={`rot-card ${cardOpensAbove ? 'rot-card--above' : ''}`}>
                    <div className="rot-card-connector" />
                    
                    <div className="rot-card-header">
                      <div className={`rot-badge ${getBadgeClass(item.status)}`}>
                        {item.status.replace("-", " ")}
                      </div>
                      <span className="rot-card-date">{item.date}</span>
                    </div>
                    
                    <div className="rot-card-title">{item.title}</div>
                    
                    <div className="rot-card-content">
                      <p>{item.content}</p>

                      <div className="rot-energy-bar-container">
                        <div className="rot-energy-header">
                          <span style={{ display: 'flex', alignItems: 'center' }}>
                            <Zap size={10} style={{ marginRight: '4px' }} /> Energy Level
                          </span>
                          <span>{item.energy}%</span>
                        </div>
                        <div className="rot-energy-track">
                          <div className="rot-energy-fill" style={{ width: `${item.energy}%` }} />
                        </div>
                      </div>

                      {item.relatedIds.length > 0 && (
                        <div className="rot-connections-container">
                          <div className="rot-connections-header">
                            <Link size={10} style={{ marginRight: '4px' }} />
                            Connected Nodes
                          </div>
                          <div className="rot-connections-list">
                            {item.relatedIds.map((relatedId) => {
                              const relatedItem = timelineData.find((i) => i.id === relatedId);
                              return (
                                <button
                                  key={relatedId}
                                  className="rot-button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleItem(relatedId);
                                  }}
                                >
                                  {relatedItem?.title}
                                  <ArrowRight size={8} style={{ marginLeft: '4px' }} />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
