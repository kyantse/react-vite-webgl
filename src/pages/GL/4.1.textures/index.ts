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
    this.loadTexture().then(() => {
      // 设置背景色
      gl.clearColor(0.0, 0.0, 0.0, 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      this.shaderClass?.use();
      // 绘制两个三角形构成矩形
      gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_INT, 0);
    });
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    const vertices = new Float32Array([
      // positions          // colors           // texture coords
      0.5,
      0.5,
      0.0,
      1.0,
      0.0,
      0.0,
      1.0,
      1.0, // top right
      0.5,
      -0.5,
      0.0,
      0.0,
      1.0,
      0.0,
      1.0,
      0.0, // bottom right
      -0.5,
      -0.5,
      0.0,
      0.0,
      0.0,
      1.0,
      0.0,
      0.0, // bottom let
      -0.5,
      0.5,
      0.0,
      1.0,
      1.0,
      0.0,
      0.0,
      1.0, // top let
    ]);

    const indices = new Uint32Array([
      0,
      1,
      3, // first triangle
      1,
      2,
      3, // second triangle
    ]);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 即 4 字节

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const ebo = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ebo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

    // 顶点位置
    // 位置，长度，类型，归一化，每个顶点的步长，位置偏移
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
    gl.enableVertexAttribArray(0);

    // 颜色
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(1);

    // 纹理坐标
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
    gl.enableVertexAttribArray(2);
  }

  loadTexture() {
    return new Promise((resolve) => {
      const gl = this.gl;
      if (!gl) return resolve(false);
      // 加载图片纹理
      const texture = gl.createTexture();
      const image = new Image();
      image.src = new URL("./container.jpg", import.meta.url).href;
      image.onload = () => {
        console.log(image);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true); // 纹理上下翻转
        gl.texImage2D(
          gl.TEXTURE_2D,
          0,
          gl.RGB,
          gl.RGB,
          gl.UNSIGNED_BYTE,
          image
        );
        gl.generateMipmap(gl.TEXTURE_2D);
        resolve(true);
      };

      // 设置纹理参数
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.LINEAR_MIPMAP_LINEAR
      );
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    });
  }
}
