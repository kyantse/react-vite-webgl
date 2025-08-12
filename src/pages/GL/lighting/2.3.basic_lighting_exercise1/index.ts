import ShaderClass from "./class/ShaderClass.ts";
import { mat4, vec3 } from "gl-matrix";
import Camera, { CameraMovement } from "./class/CameraClass.ts";
import shader_lightCube from "./shader/light_cube_glsl.ts";
import shader_lighting from "./shader/basic_lighting_glsl.ts";

export default class Constructor {
  gl!: WebGL2RenderingContext | null;
  lightingShader!: ShaderClass;
  lightCubeShader!: ShaderClass;
  camera!: Camera;

  deltaTime: number = 0.0;
  lastFrame: number = 0.0;

  keysPressed: Record<string, boolean> = {};

  firstMouse: boolean = true;

  lastX: number = 0;
  lastY: number = 0;

  lightPos: vec3 = vec3.fromValues(1.2, 1.0, 2.0);

  constructor(canvas: HTMLCanvasElement) {
    if (!canvas) return;
    this.gl = canvas.getContext("webgl2");
    this.lightingShader = new ShaderClass(this.gl, shader_lighting);
    this.lightCubeShader = new ShaderClass(this.gl, shader_lightCube);
    this.camera = new Camera(vec3.fromValues(0.0, 0.0, 6.0));

    this.lastX = canvas.width / 2.0;
    this.lastY = canvas.height / 2.0;
    // 画布大小
    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    this.gl?.viewport(0, 0, canvas.width, canvas.height);

    this.init(this.gl);
    // this.initInputEvent(canvas);
  }

  initInputEvent(canvas: HTMLCanvasElement) {
    document.onkeydown = (event) => {
      this.keysPressed[event.key] = true;
    };

    document.onkeyup = (event) => {
      this.keysPressed[event.key] = false;
    };

    canvas.onmousemove = (event) => {
      this.updateCameraPosByMouse(event);
    };

    canvas.onwheel = (event) => {
      this.updateCameraPosByWheel(event);
    };
  }

  updateCameraPosition() {
    if (this.keysPressed["w"]) {
      this.camera.processKeyboard(CameraMovement.FORWARD, this.deltaTime);
    }
    if (this.keysPressed["s"]) {
      this.camera.processKeyboard(CameraMovement.BACKWARD, this.deltaTime);
    }
    if (this.keysPressed["a"]) {
      this.camera.processKeyboard(CameraMovement.LEFT, this.deltaTime);
    }
    if (this.keysPressed["d"]) {
      this.camera.processKeyboard(CameraMovement.RIGHT, this.deltaTime);
    }
  }

  updateCameraPosByMouse(event: MouseEvent): void {
    const xpos: number = event.clientX;
    const ypos: number = event.clientY;

    if (this.firstMouse) {
      this.lastX = xpos;
      this.lastY = ypos;
      this.firstMouse = false;
    }

    const xoffset: number = xpos - this.lastX;
    // 注意这里是反向
    // 因为在屏幕坐标系里，Y 轴向下是正值；但在我们的相机 pitch 中，向上抬头应该是正值，所以需要反向。
    const yoffset: number = this.lastY - ypos;
    this.lastX = xpos;
    this.lastY = ypos;
    this.camera.processMouseMovement(xoffset, yoffset);
  }

  updateCameraPosByWheel(event: WheelEvent): void {
    event.preventDefault();
    this.camera.processMouseScroll(event.deltaY);
  }

  async init(gl: WebGL2RenderingContext | null) {
    if (!gl) return;

    // 设置顶点位置
    const { cubeVao, lightVao } = this.initVertexBuffers() || {};
    gl.enable(gl.DEPTH_TEST);
    // 设置背景色
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    //
    // 清除颜色缓冲区，将画布上的颜色重置为之前通过 gl.clearColor 设置的背景色（这里设置为黑色）。
    // 这一步操作会擦除之前绘制在屏幕上的颜色信息，为新的一帧绘制做准备。
    gl.clear(gl.COLOR_BUFFER_BIT);

    // 清除深度缓冲区，将深度缓冲区中的所有深度值重置为初始值（通常是最大值 1.0）。
    // 深度缓冲区用于记录每个像素距离相机的深度信息，在进行深度测试时会依据这些信息决定像素是否可见。
    // 每帧开始前清除深度缓冲区，能确保新的一帧绘制时深度测试是基于当前场景的正确深度信息，避免上一帧的深度数据影响当前帧的渲染结果。
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // 每一帧的时间
    const currentFrame = performance.now() / 1000; // 毫秒 → 秒
    this.deltaTime = currentFrame - this.lastFrame;
    this.lastFrame = currentFrame;

    // 物体
    this.lightingShader.use();
    this.lightingShader.setVec3("objectColor", vec3.fromValues(1.0, 0.5, 0.31));
    this.lightingShader.setVec3("lightColor", vec3.fromValues(1.0, 1.0, 1.0));
    this.lightingShader.setVec3("lightPos", this.lightPos);
    this.lightingShader.setVec3("viewPos", this.camera.Position);

    // view/projection transformations
    this.lightingShader.setMat4("projection", this.getProjection());
    this.lightingShader.setMat4("view", this.camera.getViewMatrix());
    // world transformation
    const model_cube = mat4.create();
    const angle = (performance.now() / 1000 / 100) * 25;
    mat4.rotate(
      model_cube, // 输出矩阵
      model_cube, // 要基于的原矩阵
      angle, // 旋转角（弧度）
      [1.0, 0.3, 0.5] // 旋转轴
    );
    this.lightingShader.setMat4("model", model_cube);
    // this.lightingShader.setMat4("model", mat4.create());
    // draw
    // ！多个vao存在时，在绘制前需再次绑定vao
    gl.bindVertexArray(cubeVao!);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // 光源
    this.lightCubeShader.use();
    // view/projection transformations
    this.lightCubeShader.setMat4("projection", this.getProjection());
    this.lightCubeShader.setMat4("view", this.camera.getViewMatrix());

    this.lightPos[0] = 1.0 + Math.sin(currentFrame) * 2.0;
    this.lightPos[1] = Math.sin(currentFrame / 2.0) * 1.0;
    // world transformation
    const model = mat4.create();
    mat4.translate(model, model, this.lightPos);
    mat4.scale(model, model, vec3.fromValues(0.2, 0.2, 0.2)); // a smaller cube
    this.lightCubeShader.setMat4("model", model);
    // draw
    // ！多个vao存在时，在绘制前需再次绑定vao
    gl.bindVertexArray(lightVao!);
    gl.drawArrays(gl.TRIANGLES, 0, 36);

    // 每帧更新相机
    this.updateCameraPosition();

    requestAnimationFrame(() => this.init(this.gl));
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    const vertices = new Float32Array([
      -0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.5, -0.5, -0.5, 0.0, 0.0, -1.0, 0.5,
      0.5, -0.5, 0.0, 0.0, -1.0, 0.5, 0.5, -0.5, 0.0, 0.0, -1.0, -0.5, 0.5,
      -0.5, 0.0, 0.0, -1.0, -0.5, -0.5, -0.5, 0.0, 0.0, -1.0,

      -0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.5, -0.5, 0.5, 0.0, 0.0, 1.0, 0.5, 0.5,
      0.5, 0.0, 0.0, 1.0, 0.5, 0.5, 0.5, 0.0, 0.0, 1.0, -0.5, 0.5, 0.5, 0.0,
      0.0, 1.0, -0.5, -0.5, 0.5, 0.0, 0.0, 1.0,

      -0.5, 0.5, 0.5, -1.0, 0.0, 0.0, -0.5, 0.5, -0.5, -1.0, 0.0, 0.0, -0.5,
      -0.5, -0.5, -1.0, 0.0, 0.0, -0.5, -0.5, -0.5, -1.0, 0.0, 0.0, -0.5, -0.5,
      0.5, -1.0, 0.0, 0.0, -0.5, 0.5, 0.5, -1.0, 0.0, 0.0,

      0.5, 0.5, 0.5, 1.0, 0.0, 0.0, 0.5, 0.5, -0.5, 1.0, 0.0, 0.0, 0.5, -0.5,
      -0.5, 1.0, 0.0, 0.0, 0.5, -0.5, -0.5, 1.0, 0.0, 0.0, 0.5, -0.5, 0.5, 1.0,
      0.0, 0.0, 0.5, 0.5, 0.5, 1.0, 0.0, 0.0,

      -0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.5, -0.5, -0.5, 0.0, -1.0, 0.0, 0.5,
      -0.5, 0.5, 0.0, -1.0, 0.0, 0.5, -0.5, 0.5, 0.0, -1.0, 0.0, -0.5, -0.5,
      0.5, 0.0, -1.0, 0.0, -0.5, -0.5, -0.5, 0.0, -1.0, 0.0,

      -0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5, -0.5, 0.0, 1.0, 0.0, 0.5, 0.5,
      0.5, 0.0, 1.0, 0.0, 0.5, 0.5, 0.5, 0.0, 1.0, 0.0, -0.5, 0.5, 0.5, 0.0,
      1.0, 0.0, -0.5, 0.5, -0.5, 0.0, 1.0, 0.0,
    ]);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 即 4 字节

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const cubeVao = gl.createVertexArray();
    gl.bindVertexArray(cubeVao);
    // position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * FSIZE, 0);
    gl.enableVertexAttribArray(0);
    // normal
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 6 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(1);

    const lightVao = gl.createVertexArray();
    gl.bindVertexArray(lightVao);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 6 * FSIZE, 0);
    gl.enableVertexAttribArray(0);

    return { cubeVao, lightVao };
  }

  getProjection() {
    const projection = mat4.create();
    return mat4.perspective(
      projection,
      (this.camera.Zoom * Math.PI) / 180,
      (this.gl!.canvas as HTMLCanvasElement).width /
        (this.gl!.canvas as HTMLCanvasElement).height,
      0.1,
      100.0
    );
  }
}
