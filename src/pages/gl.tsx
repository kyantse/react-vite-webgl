import { useEffect, useRef } from "react";
// import Practice1 from "./GL/Practice1";
// import Practice2 from "./GL/Practice2";
// import P3 from "./GL/P3";
// import P4 from "./GL/P4";
// import Constructor from "./GL/2.5.hello_triangle_exercise3";
// import Constructor from "./GL/3.1.shaders_uniform";
// import Constructor from "./GL/3.2.shaders_interpolation";
// import Constructor from "./GL/3.4.shaders_exercise1";
// import Constructor from "./GL/4.1.textures";
// import Constructor from "./GL/4.2.textures_combined";
// import Constructor from "./GL/4.3.textures_exercise1";
// import Constructor from "./GL/4.4.textures_exercise2";
// import Constructor from "./GL/4.5.textures_exercise3";
// import Constructor from "./GL/4.6.textures_exercise4";
// import Constructor from "./GL/5.1.transformations";
// import Constructor from "./GL/5.1.transformations_exercise1";
// import Constructor from "./GL/5.1.transformations_exercise2";
// import Constructor from "./GL/6.1coordinate_systems";
// import Constructor from "./GL/6.2coordinate_systems_depth";
// import Constructor from "./GL/6.3.coordinate_systems_multiple";
// import Constructor from "./GL/7.1.camera_circle";
// import Constructor from "./GL/7.3.camera_mouse_zoom";
// import Constructor from "./GL/7.4.camera_class";
// import Constructor from "./GL/lighting/1.colors";
// import Constructor from "./GL/lighting/2.1.basic_lighting_diffuse";
// import Constructor from "./GL/lighting/2.2.basic_lighting_specular";
// import Constructor from "./GL/lighting/2.3.basic_lighting_exercise1";
// import Constructor from "./GL/lighting/2.4.basic_lighting_exercise2";
// import Constructor from "./GL/lighting/3.1.materials";
// import Constructor from "./GL/lighting/3.2.materials_exercise1";
// import Constructor from "./GL/lighting/4.2.lighting_maps_specular_map";
// import Constructor from "./GL/lighting/5.1.light_casters_directional";
// import Constructor from "./GL/lighting/5.2.light_casters_point";
// import Constructor from "./GL/lighting/5.3.light_casters_spot";
// import Constructor from "./GL/lighting/5.4.light_casters_spot_soft";
import Constructor from "./GL/lighting/6.multiple_lights";

const GL = () => {
  const contianer = useRef<HTMLCanvasElement | null>(null);
  const instanceRef = useRef<unknown>(null);

  useEffect(() => {
    if (contianer.current && !instanceRef.current) {
      instanceRef.current = new Constructor(contianer.current);
    }
  }, []);
  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      {/* 前置章节使用此canvas */}
      {/* <canvas height={600} width={800} ref={(v) => (contianer.current = v)} /> */}
      {/* light章节开始使用此canvas */}
      <canvas
        style={{ height: "100%", width: "100%" }}
        ref={(v) => (contianer.current = v)}
      />
    </div>
  );
};

export default GL;
