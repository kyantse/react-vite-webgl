import { initShaders } from "../utils";

export default class P3 {
  gl: WebGL2RenderingContext | null = null;

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.gl = canvas.getContext("webgl2");
    this.init(this.gl);
  }

  init(gl: WebGL2RenderingContext | null) {
    if (!gl) return;

    const VSHADER_SOURCE = `#version 300 es
      layout(location = 0) in vec3 aPos;
      void main(){
          gl_Position = vec4(aPos, 1.0);
      }
    `;

    const FSHADER_SOURCE_1 = `#version 300 es
      precision mediump float;
      out vec4 outColor;
      void main(){
        outColor = vec4(1.0, 0.5, 0.2, 1.0);
      }
    `;

    const FSHADER_SOURCE_2 = `#version 300 es
    precision mediump float;
    out vec4 outColor;
    void main(){
      outColor = vec4(1.0, 1.0, 0.0, 1.0);
    }
  `;

    const program_orange = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE_1);
    const program_yellow = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE_2);

    if (!program_orange || !program_yellow) return;

    const vaos = [gl.createVertexArray(), gl.createVertexArray()];
    // 设置顶点位置
    this.initVertexBuffers(
      new Float32Array([
        // first triangle
        -0.9,
        -0.5,
        0.0, // left
        -0.0,
        -0.5,
        0.0, // right
        -0.45,
        0.5,
        0.0, // top
      ]),
      vaos[0]
    );
    this.initVertexBuffers(
      new Float32Array([
        0.0,
        -0.5,
        0.0, // left
        0.9,
        -0.5,
        0.0, // right
        0.45,
        0.5,
        0.0, // top
      ]),
      vaos[1]
    );
    // 设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // 橘色三角形
    gl.useProgram(program_orange);
    gl.bindVertexArray(vaos[0]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    // 黄色三角形
    gl.useProgram(program_yellow);
    gl.bindVertexArray(vaos[1]);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  initVertexBuffers(vertices: Float32Array, vao: WebGLVertexArrayObject) {
    const gl = this.gl;
    if (!gl) return;

    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // 解绑 webgl并不会记住绑定的vbo和vao
    // gl.bindBuffer(gl.ARRAY_BUFFER, 0);
    // gl.bindVertexArray(0);
  }
}
