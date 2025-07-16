// @ts-nocheck
export function initShaders(
  gl: WebGL2RenderingContext | null,
  vs: string,
  fs: string
) {
  if (!gl) return;
  let vertexShader, fragmentShader, program;

  try {
    vertexShader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vertexShader, vs);
    gl.compileShader(vertexShader);
    const message = gl.getShaderInfoLog(vertexShader);
    if (message.length > 0) {
      throw message;
    }
  } catch (error) {
    console.log("Vertex Shader Compilation Failed：", error);
  }

  try {
    fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fragmentShader, fs);
    gl.compileShader(fragmentShader);
    const message = gl.getShaderInfoLog(fragmentShader);
    if (message.length > 0) {
      throw message;
    }
  } catch (error) {
    console.log("Frament Shader Compilation Failed：", error);
  }

  try {
    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      const info = gl.getProgramInfoLog(program);
      throw info;
    }

    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);
  } catch (error) {
    console.log("Program Linking Failed：", error);
  }

  return program;
}
