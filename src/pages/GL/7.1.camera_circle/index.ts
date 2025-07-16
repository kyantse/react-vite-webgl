import ShaderClass from "./ShaderClass.ts";
import { mat4, vec3 } from "gl-matrix";

export default class Constructor {
  gl: WebGL2RenderingContext | null = null;
  shaderClass: ShaderClass | null = null;
  mixValue: number = 0.2;

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.gl = canvas.getContext("webgl2");
    this.shaderClass = new ShaderClass(this.gl);
    this.init(this.gl);

    document.onkeyup = (event) => {
      if (event.key === "ArrowUp") {
        this.mixValue += 0.05;
        if (this.mixValue >= 1.0) this.mixValue = 1.0;
      }
      if (event.key === "ArrowDown") {
        this.mixValue -= 0.05;
        if (this.mixValue <= 0.0) this.mixValue = 0.0;
      }
    };
  }

  async init(gl: WebGL2RenderingContext | null) {
    if (!gl) return;

    // 设置顶点位置
    this.initVertexBuffers();
    gl.enable(gl.DEPTH_TEST);
    const texture1 = await this.loadTexture1();
    const texture2 = await this.loadTexture2();
    // 设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    // gl.clear(gl.DEPTH_BUFFER_BIT);
    this.shaderClass?.use();

    // either set it manually like so:
    gl.uniform1i(
      gl.getUniformLocation(this.shaderClass!.program!, "texture1"),
      0
    );
    // or set it via the texture class
    // ourShader.setInt("texture2", 1);
    gl.uniform1i(
      gl.getUniformLocation(this.shaderClass!.program!, "texture2"),
      1
    );

    // get mixValue position
    gl.uniform1f(
      gl.getUniformLocation(this.shaderClass!.program!, "mixValue"),
      this.mixValue
    );

    // bind textures on corresponding texture units
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture1);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, texture2);
    // 绘制
    const projection = mat4.create();
    // 设置透视投影矩阵
    // fovy: 45度，aspect: 画布宽高比，near: 0.1, far: 100
    mat4.perspective(
      projection,
      (45 * Math.PI) / 180,
      (this.gl!.canvas as HTMLCanvasElement).width /
        (this.gl!.canvas as HTMLCanvasElement).height,
      0.1,
      100.0
    );

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.shaderClass!.program!, "projection"),
      false,
      projection
    );

    const view = mat4.create();
    const radius = 10.0;
    const camX = Math.sin(performance.now() / 1000) * radius;
    const camY = Math.cos(performance.now() / 1000) * radius;

    mat4.lookAt(
      view,
      vec3.fromValues(camX, 0.0, camY),
      vec3.fromValues(0.0, 0.0, 0.0),
      vec3.fromValues(0.0, 1.0, 0.0)
    );

    // // 初始化 view 矩阵为单位矩阵
    // const view = mat4.create();
    // const radius = 10.0;
    // // 获取当前时间（秒）
    // const time = performance.now() / 1000; // 或者使用 Date.now()/1000
    // const camX = Math.sin(time) * radius;
    // const camZ = Math.cos(time) * radius;
    // // 设置相机位置
    // const eye = vec3.fromValues(camX, 0.0, camZ);
    // const center = vec3.fromValues(0.0, 0.0, 0.0);
    // const up = vec3.fromValues(0.0, 1.0, 0.0);
    // // 使用 lookAt 计算 view 矩阵
    // mat4.lookAt(view, eye, center, up);

    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.shaderClass!.program!, "view"),
      false,
      view
    );

    const cubePositions = [
      vec3.fromValues(0.0, 0.0, 0.0),
      vec3.fromValues(2.0, 5.0, -15.0),
      vec3.fromValues(-1.5, -2.2, -2.5),
      vec3.fromValues(-3.8, -2.0, -12.3),
      vec3.fromValues(2.4, -0.4, -3.5),
      vec3.fromValues(-1.7, 3.0, -7.5),
      vec3.fromValues(1.3, -2.0, -2.5),
      vec3.fromValues(1.5, 2.0, -2.5),
      vec3.fromValues(1.5, 0.2, -1.5),
      vec3.fromValues(-1.3, 1.0, -1.5),
    ];

    for (let index = 0; index < 10; index++) {
      const model = mat4.create();

      mat4.translate(model, model, cubePositions[index]);

      const angle = 20 * index;

      mat4.rotate(
        model, // 输出矩阵
        model, // 要基于的原矩阵
        angle, // 旋转角（弧度）
        [1.0, 0.3, 0.5] // 旋转轴
      );

      gl.uniformMatrix4fv(
        gl.getUniformLocation(this.shaderClass!.program!, "model"),
        false,
        model
      );

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    requestAnimationFrame(() => this.init(this.gl));
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    const vertices = new Float32Array([
      -0.5, -0.5, -0.5, 0.0, 0.0, 0.5, -0.5, -0.5, 1.0, 0.0, 0.5, 0.5, -0.5,
      1.0, 1.0, 0.5, 0.5, -0.5, 1.0, 1.0, -0.5, 0.5, -0.5, 0.0, 1.0, -0.5, -0.5,
      -0.5, 0.0, 0.0,

      -0.5, -0.5, 0.5, 0.0, 0.0, 0.5, -0.5, 0.5, 1.0, 0.0, 0.5, 0.5, 0.5, 1.0,
      1.0, 0.5, 0.5, 0.5, 1.0, 1.0, -0.5, 0.5, 0.5, 0.0, 1.0, -0.5, -0.5, 0.5,
      0.0, 0.0,

      -0.5, 0.5, 0.5, 1.0, 0.0, -0.5, 0.5, -0.5, 1.0, 1.0, -0.5, -0.5, -0.5,
      0.0, 1.0, -0.5, -0.5, -0.5, 0.0, 1.0, -0.5, -0.5, 0.5, 0.0, 0.0, -0.5,
      0.5, 0.5, 1.0, 0.0,

      0.5, 0.5, 0.5, 1.0, 0.0, 0.5, 0.5, -0.5, 1.0, 1.0, 0.5, -0.5, -0.5, 0.0,
      1.0, 0.5, -0.5, -0.5, 0.0, 1.0, 0.5, -0.5, 0.5, 0.0, 0.0, 0.5, 0.5, 0.5,
      1.0, 0.0,

      -0.5, -0.5, -0.5, 0.0, 1.0, 0.5, -0.5, -0.5, 1.0, 1.0, 0.5, -0.5, 0.5,
      1.0, 0.0, 0.5, -0.5, 0.5, 1.0, 0.0, -0.5, -0.5, 0.5, 0.0, 0.0, -0.5, -0.5,
      -0.5, 0.0, 1.0,

      -0.5, 0.5, -0.5, 0.0, 1.0, 0.5, 0.5, -0.5, 1.0, 1.0, 0.5, 0.5, 0.5, 1.0,
      0.0, 0.5, 0.5, 0.5, 1.0, 0.0, -0.5, 0.5, 0.5, 0.0, 0.0, -0.5, 0.5, -0.5,
      0.0, 1.0,
    ]);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 即 4 字节

    const vao = gl.createVertexArray();
    gl.bindVertexArray(vao);

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    // 顶点位置
    // 位置，长度，类型，归一化，每个顶点的步长，位置偏移
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 5 * FSIZE, 0);
    gl.enableVertexAttribArray(0);

    // 纹理坐标
    gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 5 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(1);
  }

  loadTexture1(): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const gl = this.gl;
      if (!gl) return reject("No WebGL context");
      // 加载图片纹理
      const texture = gl.createTexture();
      const image = new Image();
      image.src = new URL("./container.jpg", import.meta.url).href;
      image.onload = () => {
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
        resolve(texture as WebGLTexture);
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

  loadTexture2(): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const gl = this.gl;
      if (!gl) return reject("No WebGL context");
      // 加载图片纹理
      const texture = gl.createTexture();
      const image = new Image();
      image.src = new URL("./awesomeface.png", import.meta.url).href;
      image.onload = () => {
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
        resolve(texture as WebGLTexture);
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
