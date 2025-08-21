import ShaderClass from "./class/ShaderClass.ts";
import { mat4, vec3, mat3 } from "gl-matrix";
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

  // positions all containers
  cubePositions: Array<vec3> = [
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

  // positions of the point lights
  pointLightPositions: Array<vec3> = [
    vec3.fromValues(0.7, 0.2, 2.0),
    vec3.fromValues(2.3, -3.3, -4.0),
    vec3.fromValues(-4.0, 2.0, -12.0),
    vec3.fromValues(0.0, 0.0, -3.0),
  ];

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
    this.initInputEvent(canvas);
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
    const diffuseMap = await this.loadTexture("./images/container2.png");
    const specularMap = await this.loadTexture(
      "./images/container2_specular.png"
    );
    const { cubeVao, lightVao } = this.initVertexBuffers() || {};
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.1, 0.1, 0.1, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.clear(gl.DEPTH_BUFFER_BIT);

    // 每一帧的时间
    const currentFrame = performance.now() / 1000; // 毫秒 → 秒
    this.deltaTime = currentFrame - this.lastFrame;
    this.lastFrame = currentFrame;

    // 物体
    this.lightingShader.use();
    this.lightingShader.setVec3("light.position", this.camera.Position);
    this.lightingShader.setVec3("light.direction", this.camera.Front);
    this.lightingShader.setFloat(
      "light.cutOff",
      Math.cos((12.5 * Math.PI) / 180)
    );
    this.lightingShader.setFloat(
      "light.outerCutOff",
      Math.cos((17.5 * Math.PI) / 180)
    );
    this.lightingShader.setVec3("viewPos", this.camera.Position);

    this.lightingShader.setVec3("light.ambient", [0.1, 0.1, 0.1]);
    this.lightingShader.setVec3("light.diffuse", [0.8, 0.8, 0.8]);
    this.lightingShader.setVec3("light.specular", [1.0, 1.0, 1.0]);

    this.lightingShader.setFloat("light.constant", 1.0);
    this.lightingShader.setFloat("light.linear", 0.09);
    this.lightingShader.setFloat("light.quadratic", 0.032);

    // material properties
    // 材质属性设置（对应material properties）
    const materialShininess = 32.0; // material.shininess
    this.lightingShader.setInt("material.diffuse", 0);
    this.lightingShader.setInt("material.specular", 1);
    this.lightingShader.setFloat("material.shininess", materialShininess);

    /*
      Here we set all the uniforms for the 5/6 types of lights we have. We have to set them manually and index 
      the proper PointLight struct in the array to set each uniform variable. This can be done more code-friendly
      by defining light types as classes and set their values in there, or by using a more efficient uniform approach
      by using 'Uniform buffer objects', but that is something we'll discuss in the 'Advanced GLSL' tutorial.
    */
    // directional light
    this.lightingShader.setVec3("dirLight.direction", [-0.2, -1.0, -0.3]);
    this.lightingShader.setVec3("dirLight.ambient", [0.05, 0.05, 0.05]);
    this.lightingShader.setVec3("dirLight.diffuse", [0.4, 0.4, 0.4]);
    this.lightingShader.setVec3("dirLight.specular", [0.5, 0.5, 0.5]);
    // point light
    for (let index = 0; index < this.pointLightPositions.length; index++) {
      const pointLightPosition = this.pointLightPositions[index];
      this.lightingShader.setVec3(
        `pointLights[${index}].position`,
        pointLightPosition
      );
      this.lightingShader.setVec3(
        `pointLights[${index}].ambient`,
        [0.05, 0.05, 0.05]
      );
      this.lightingShader.setVec3(
        `pointLights[${index}].diffuse`,
        [0.8, 0.8, 0.8]
      );
      this.lightingShader.setVec3(
        `pointLights[${index}].specular`,
        [1.0, 1.0, 1.0]
      );
      this.lightingShader.setFloat(`pointLights[${index}].constant`, 1.0);
      this.lightingShader.setFloat(`pointLights[${index}].linear`, 0.09);
      this.lightingShader.setFloat(`pointLights[${index}].quadratic`, 0.032);
    }

    // spotLight
    this.lightingShader.setVec3("spotLight.position", this.camera.Position);
    this.lightingShader.setVec3("spotLight.direction", this.camera.Front);
    this.lightingShader.setVec3("spotLight.ambient", [0.0, 0.0, 0.0]);
    this.lightingShader.setVec3("spotLight.diffuse", [1.0, 1.0, 1.0]);
    this.lightingShader.setVec3("spotLight.specular", [1.0, 1.0, 1.0]);
    this.lightingShader.setFloat("spotLight.constant", 1.0);
    this.lightingShader.setFloat("spotLight.linear", 0.09);
    this.lightingShader.setFloat("spotLight.quadratic", 0.032);
    this.lightingShader.setFloat(
      "spotLight.cutOff",
      Math.cos((12.5 * Math.PI) / 180)
    );
    this.lightingShader.setFloat(
      "spotLight.outerCutOff",
      Math.cos((15 * Math.PI) / 180)
    );

    // view/projection transformations
    this.lightingShader.setMat4("projection", this.getProjection());
    this.lightingShader.setMat4("view", this.camera.getViewMatrix());
    // bind diffuse map
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, diffuseMap);
    // bind specular map
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, specularMap);
    // draw
    // ！多个vao存在时，在绘制前需再次绑定vao
    gl.bindVertexArray(cubeVao!);
    // gl.drawArrays(gl.TRIANGLES, 0, 36);
    for (let index = 0; index < 10; index++) {
      const model = mat4.create();

      mat4.translate(model, model, this.cubePositions[index]);

      let angle = 20 * index;

      if (index % 3 === 0) angle = (performance.now() / 1000 / 100) * 25;

      mat4.rotate(
        model, // 输出矩阵
        model, // 要基于的原矩阵
        angle, // 旋转角（弧度）
        [1.0, 0.3, 0.5] // 旋转轴
      );
      // world transformation
      this.lightingShader.setMat4("model", model);
      // 法线矩阵(Normal Matrix)的计算
      const normalMatrix = model;
      mat4.invert(normalMatrix, normalMatrix);
      mat4.transpose(normalMatrix, normalMatrix);
      this.lightingShader.setMat3(
        "normalMatrix",
        mat3.fromMat4(mat3.create(), normalMatrix)
      );

      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // 光源
    this.lightCubeShader.use();
    this.lightCubeShader.setMat4("projection", this.getProjection());
    this.lightCubeShader.setMat4("view", this.camera.getViewMatrix());

    // we now draw as many light bulbs as we have point lights.
    gl.bindVertexArray(lightVao!);
    for (let index = 0; index < 4; index++) {
      const model = mat4.create();
      mat4.translate(model, model, this.pointLightPositions[index]);
      mat4.scale(model, model, vec3.fromValues(0.2, 0.2, 0.2));
      this.lightCubeShader.setMat4("model", model);
      gl.drawArrays(gl.TRIANGLES, 0, 36);
    }

    // 每帧更新相机
    this.updateCameraPosition();

    requestAnimationFrame(() => this.init(this.gl));
  }

  initVertexBuffers() {
    const gl = this.gl;
    if (!gl) return;
    // prettier-ignore
    const vertices = new Float32Array([
        // positions          // normals           // texture coords
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,
         0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
         0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  1.0,  1.0,
        -0.5,  0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  1.0,
        -0.5, -0.5, -0.5,  0.0,  0.0, -1.0,  0.0,  0.0,

        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,
         0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  1.0,  1.0,
        -0.5,  0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  1.0,
        -0.5, -0.5,  0.5,  0.0,  0.0,  1.0,  0.0,  0.0,

        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,
        -0.5,  0.5, -0.5, -1.0,  0.0,  0.0,  1.0,  1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
        -0.5, -0.5, -0.5, -1.0,  0.0,  0.0,  0.0,  1.0,
        -0.5, -0.5,  0.5, -1.0,  0.0,  0.0,  0.0,  0.0,
        -0.5,  0.5,  0.5, -1.0,  0.0,  0.0,  1.0,  0.0,

         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,
         0.5,  0.5, -0.5,  1.0,  0.0,  0.0,  1.0,  1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
         0.5, -0.5, -0.5,  1.0,  0.0,  0.0,  0.0,  1.0,
         0.5, -0.5,  0.5,  1.0,  0.0,  0.0,  0.0,  0.0,
         0.5,  0.5,  0.5,  1.0,  0.0,  0.0,  1.0,  0.0,

        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,
         0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  1.0,  1.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
         0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  1.0,  0.0,
        -0.5, -0.5,  0.5,  0.0, -1.0,  0.0,  0.0,  0.0,
        -0.5, -0.5, -0.5,  0.0, -1.0,  0.0,  0.0,  1.0,

        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0,
         0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  1.0,  1.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
         0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  1.0,  0.0,
        -0.5,  0.5,  0.5,  0.0,  1.0,  0.0,  0.0,  0.0,
        -0.5,  0.5, -0.5,  0.0,  1.0,  0.0,  0.0,  1.0
    ]);

    const FSIZE = Float32Array.BYTES_PER_ELEMENT; // 即 4 字节

    const vbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const cubeVao = gl.createVertexArray();
    gl.bindVertexArray(cubeVao);
    // position
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
    gl.enableVertexAttribArray(0);
    // normal
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 8 * FSIZE, 3 * FSIZE);
    gl.enableVertexAttribArray(1);
    // textures
    gl.vertexAttribPointer(2, 2, gl.FLOAT, false, 8 * FSIZE, 6 * FSIZE);
    gl.enableVertexAttribArray(2);

    const lightVao = gl.createVertexArray();
    gl.bindVertexArray(lightVao);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 8 * FSIZE, 0);
    gl.enableVertexAttribArray(0);

    return { cubeVao, lightVao };
  }

  getProjection() {
    // Vertical field of view in radians(垂直视场的弧度)
    const fovy = (this.camera.Zoom * Math.PI) / 180;
    // Aspect ratio. typically viewport width/height
    const aspect = this.gl!.canvas.width / this.gl!.canvas.height;
    // Near bound of the frustum(截头锥体)
    const near = 0.1;
    // Far bound of the frustum, can be null or Infinity
    const far = 100.0;
    return mat4.perspective(mat4.create(), fovy, aspect, near, far);
  }

  /**
   * 异步加载图片纹理并返回 WebGLTexture 对象。
   * @param path - 纹理图片的路径，可以是字符串或 URL 对象。
   * @returns 一个 Promise，成功时返回 WebGLTexture 对象，失败时返回错误信息。
   */
  loadTexture(path: string | URL): Promise<WebGLTexture> {
    return new Promise((resolve, reject) => {
      const gl = this.gl;
      if (!gl) return reject("No WebGL context");
      // 加载图片纹理
      const texture = gl.createTexture();
      const image = new Image();
      image.src = new URL(path, import.meta.url).href;
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
