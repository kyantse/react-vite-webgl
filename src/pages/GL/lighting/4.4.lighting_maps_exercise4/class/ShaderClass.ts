import { mat4, vec3 } from "gl-matrix";
import { initShaders } from "../../../utils/index.ts";

export default class ShaderClass {
  gl: WebGL2RenderingContext | null;
  program: WebGLProgram | null;
  constructor(
    gl: WebGL2RenderingContext | null,
    shader: { vs: string; fs: string }
  ) {
    this.program = initShaders(gl, shader.vs, shader.fs) || null;
    this.gl = gl;
  }

  use() {
    if (!this.gl) return;
    this.gl.useProgram(this.program);
  }

  setVec3(name: string, value: vec3 | Array<number>) {
    const position = this.gl?.getUniformLocation(this.program!, name);
    if (value instanceof Array) {
      this.gl?.uniform3fv(position!, value);
    } else {
      this.gl?.uniform3f(position!, value[0], value[1], value[2]);
    }
  }

  setMat4(name: string, value: mat4) {
    const position = this.gl?.getUniformLocation(this.program!, name);
    this.gl?.uniformMatrix4fv(position!, false, value);
  }

  setFloat(name: string, value: GLfloat) {
    const position = this.gl?.getUniformLocation(this.program!, name);
    this.gl?.uniform1f(position!, value);
  }

  setInt(name: string, value: GLint) {
    const position = this.gl?.getUniformLocation(this.program!, name);
    this.gl?.uniform1i(position!, value);
  }
}
