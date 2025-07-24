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
import Constructor from "./GL/7.4.camera_class";

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
      <canvas height={600} width={800} ref={(v) => (contianer.current = v)} />
    </div>
  );
};

export default GL;
