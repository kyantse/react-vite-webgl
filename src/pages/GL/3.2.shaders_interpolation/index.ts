import { initShaders } from "../utils";

export default class Constructor {
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
      layout(location = 1) in vec3 aColor;
      out vec3 inColor;
      void main(){
          gl_Position = vec4(aPos, 1.0);
          inColor = aColor;
      }
    `;

    const FSHADER_SOURCE = `#version 300 es
      precision mediump float;
      out vec4 outColor;
      in vec3 inColor;
      void main(){
        outColor = vec4(inColor,1.0);
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
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // requestAnimationFrame(() => this.init(this.gl));
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    const vertices = new Float32Array([
      // positions         // colors
      0.5,
      -0.5,
      0.0,
      1.0,
      0.0,
      0.0, // bottom right
      -0.5,
      -0.5,
      0.0,
      0.0,
      1.0,
      0.0, // bottom let
      0.0,
      0.5,
      0.0,
      0.0,
      0.0,
      1.0, // top
    ]);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 即 4 字节

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * FSIZE, 0);
    gl.enableVertexAttribArray(0);

    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(1);

    // 解绑 webgl并不会记住绑定的vbo和vao
    // gl.bindBuffer(gl.ARRAY_BUFFER, 0);
    // gl.bindVertexArray(0);
  }
}
