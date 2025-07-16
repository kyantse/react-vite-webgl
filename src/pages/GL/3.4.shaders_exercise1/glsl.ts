export const VSHADER_SOURCE = `#version 300 es
      layout(location = 0) in vec3 aPos;
      layout(location = 1) in vec3 aColor;
      out vec3 inColor;
      void main(){
          gl_Position = vec4(aPos, 1.0);
          inColor = aColor;
      }
    `;
export const FSHADER_SOURCE = `#version 300 es
      precision mediump float;
      out vec4 outColor;
      in vec3 inColor;
      void main(){
        outColor = vec4(inColor,1.0);
      }
    `;
