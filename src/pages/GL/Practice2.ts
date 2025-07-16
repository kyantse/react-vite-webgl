import { initShaders } from "./utils";

export default class Practice1 {
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

    const FSHADER_SOURCE = `#version 300 es
      precision mediump float;
      out vec4 outColor;
      void main(){
        outColor = vec4(1.0, 0.5, 0.2, 1.0);
      }
    `;

    const program = initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE);
    if (!program) return;

    // 设置顶点位置
    this.initVertexBuffers();
    // 设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(program);
    // 绘制三个点
    // gl.drawArrays(gl.TRIANGLES, 0, 3);
    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    const vertices = new Float32Array([
      -0.5,
      -0.5,
      0.0, // left
      0.5,
      -0.5,
      0.0, // right
      0.0,
      0.5,
      0.0, // top
    ]);

    const indexs = new Int32Array([0, 1, 2, 1, 2, 3]);

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indexs, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(0);

    // 解绑 webgl并不会记住绑定的vbo和vao
    // gl.bindBuffer(gl.ARRAY_BUFFER, 0);
    // gl.bindVertexArray(0);
  }
}
