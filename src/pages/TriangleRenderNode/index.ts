import * as webgl from "@arcgis/core/views/3d/webgl.js";
import SpatialReference from "@arcgis/core/geometry/SpatialReference.js";
import RenderNode from "@arcgis/core/views/3d/webgl/RenderNode.js";
import { VS, FS } from "./glsl";

const colors = new Float32Array([1.0, 0.0, 0.5, 1.0, 0.5, 0.0, 0.0, 1.0, 0.5]);

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const TriangleRender = RenderNode.createSubclass({
  program: undefined,
  a_Position: undefined,
  a_color: undefined,
  posVbo: undefined,
  colorVbo: undefined,
  view: undefined,
  constructor: function ({
    view,
    coordinates,
  }: {
    view: __esri.SceneView;
    coordinates: [];
  }) {
    this.view = view;
    this.projectionCoordinates = coordinates;
  },
  initialize: function () {
    this.initProgram();
    this.initBuffer();
  },
  render: function () {
    // 初始化状态
    this.resetWebGLState();
    // 绑定渲染输出节点
    const output = this.bindRenderTarget();
    const gl: WebGL2RenderingContext = this.gl;
    // 开启混合
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    //
    gl.useProgram(this.program);
    //
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
    gl.vertexAttribPointer(this.a_Position, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_Position);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVbo);
    gl.vertexAttribPointer(this.a_color, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(this.a_color);

    // 设置投影矩阵
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "u_projectionMatrix"),
      false,
      this.camera["projectionMatrix"]
    );

    // 通过将视图矩阵平移到局部原点来应用局部原点，这将把视图原点(0,0,0)放到局部原点
    gl.uniformMatrix4fv(
      gl.getUniformLocation(this.program, "u_viewMatrix"),
      false,
      this.camera["viewMatrix"]
    );

    const time = performance.now() / 1000; // 获取秒数
    gl.uniform1f(gl.getUniformLocation(this.program, "u_time"), time); // 将时间传递给着色器

    gl.drawArrays(gl.TRIANGLES, 0, 3); // 绘制图形

    this.requestRender();
    return output;
  },

  initProgram: function () {
    const gl: WebGL2RenderingContext = this.gl;
    const program = (this.program = gl.createProgram());
    // 顶点着色器
    const vsShader = gl.createShader(gl.VERTEX_SHADER)!;
    gl.shaderSource(vsShader, VS);
    gl.compileShader(vsShader);
    // 片元着色器
    const fsShader = gl.createShader(gl.FRAGMENT_SHADER)!;
    gl.shaderSource(fsShader, FS);
    gl.compileShader(fsShader);
    // 附着
    gl.attachShader(program, vsShader);
    gl.attachShader(program, fsShader);
    // 链接
    gl.linkProgram(program);
    // 使用
    gl.useProgram(program);
  },

  initBuffer: function () {
    const gl: WebGL2RenderingContext = this.gl;
    const view = this.view;
    // 获取顶点位置
    this.a_Position = gl.getAttribLocation(this.program, "a_Position");
    // 获取顶点颜色
    this.a_color = gl.getAttribLocation(this.program, "a_color");
    this.posVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.posVbo);
    // 转换坐标为渲染坐标
    const renderCoordinates = new Float32Array(
      this.projectionCoordinates.length
    );
    webgl.toRenderCoordinates(
      view,
      // 经纬度坐标
      this.projectionCoordinates,
      // 开始索引
      0,
      // 坐标系
      SpatialReference.WGS84,
      // 顶点容器
      renderCoordinates,
      // 目标开始索引
      0,
      // 顶点数量
      this.projectionCoordinates.length / 3
    );
    this.calcCenter();
    gl.bufferData(gl.ARRAY_BUFFER, renderCoordinates, gl.STATIC_DRAW);
    //
    this.colorVbo = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.colorVbo);
    gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  },
  calcCenter() {
    // const v = renderCoordinates;
    // const v1 = [v[0], v[1], v[2]];
    // const v2 = [v[3], v[4], v[5]];
    // const v3 = [v[6], v[7], v[8]];
    // const x = (v1[0] + v2[0] + v3[0]) / 3;
    // const y = (v1[1] + v2[1] + v3[1]) / 3;
    // const z = (v1[2] + v2[2] + v3[2]) / 3;
    // const result = new Array(3);
    // webgl.fromRenderCoordinates(
    //   view,
    //   [x, y, z],
    //   0,
    //   result,
    //   0,
    //   SpatialReference.WGS84,
    //   1
    // );
    // view.goTo([result[0], result[1]]);
  },
});

export default TriangleRender;
