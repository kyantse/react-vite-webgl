import { initShaders } from "../utils";
import { VSHADER_SOURCE, FSHADER_SOURCE } from "./glsl.ts";

export default class ShaderClass {
  gl: WebGL2RenderingContext | null;
  program: WebGLProgram | null;
  constructor(gl: WebGL2RenderingContext | null) {
    this.program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE) || null;
    this.gl = gl;
  }

  use() {
    if (!this.gl) return;
    this.gl.useProgram(this.program);
  }
}
