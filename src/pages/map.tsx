import React, { useEffect, useRef } from "react";
import SceneView from "@arcgis/core/views/SceneView.js";
import Map from "@arcgis/core/Map.js";
import esriConfig from "@arcgis/core/config.js";
import "@arcgis/core/assets/esri/themes/light/main.css";

import TriangleRender from "./TriangleRenderNode";

esriConfig.assetsPath = "./assets";

const MapComponent: React.FC = () => {
  const viewDivRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!viewDivRef.current) return;

    const map = new Map({
      basemap: "topo-3d",
      ground: "world-elevation",
    });

    const view = new SceneView({
      viewingMode: "global",
      container: viewDivRef.current,
      map: map,
      // spatialReference: { wkid: 4326 },
      // center: [116.22792493013921, 39.926236653038366],
      zoom: 10,
      camera: {
        position: {
          x: 116.22792493013921,
          y: 39.926236653038366,
          z: 30000,
          spatialReference: { wkid: 4326 },
        },
        heading: 0,
        tilt: 0,
      },
    });

    view.qualityProfile = "low";
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    view.qualitySettings.memoryLimit = 1024;

    window.view = view;

    view.when(() => {
      const projectionCoordinates = [
        115.95209149044159, 39.92047245351777, 0.1, 
        115.88452587627347, 39.8649244916831, 0.1, 
        116.01805457777195, 39.86213639871335, 0.1,
      ];
      new TriangleRender({ view, coordinates: projectionCoordinates });
    });

    return () => {};
  }, []);

  return <div ref={viewDivRef} style={{ height: "100vh" }} />;
};

export default MapComponent;
