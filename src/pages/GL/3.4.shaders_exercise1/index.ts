import ShaderClass from "./ShaderClass.ts";

export default class Constructor {
  gl: WebGL2RenderingContext | null = null;
  shaderClass: ShaderClass | null = null;

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.gl = canvas.getContext("webgl2");
    this.shaderClass = new ShaderClass(this.gl);
    this.init(this.gl);
  }

  init(gl: WebGL2RenderingContext | null) {
    if (!gl) return;

    // 设置顶点位置
    this.initVertexBuffers();
    // 设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    this.shaderClass?.use();
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
      0.0,
      1.0,
      0.0, // bottom right
      -0.5,
      -0.5,
      0.0,
      0.0,
      0.0,
      1.0, // bottom let
      0.0,
      0.5,
      0.0,
      1.0,
      0.0,
      0.0, // top
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
  }
}
