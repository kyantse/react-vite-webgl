export const VSHADER_SOURCE = `#version 300 es
      layout(location = 0) in vec3 aPos;
      layout(location = 1) in vec3 aColor;
      layout(location = 2) in vec2 aTexCoord;
      out vec3 inColor;
      out vec2 TexCoord;
      void main(){
          gl_Position = vec4(aPos, 1.0);
          inColor = aColor;
          TexCoord = vec2(aTexCoord.x,aTexCoord.y);
      }
    `;
export const FSHADER_SOURCE = `#version 300 es
      precision mediump float;
      out vec4 outColor;
      in vec3 inColor;
      in vec2 TexCoord;

      // texture sampler
      uniform sampler2D texture1;
      
      void main(){
        outColor = texture(texture1, TexCoord);
      }
    `;
