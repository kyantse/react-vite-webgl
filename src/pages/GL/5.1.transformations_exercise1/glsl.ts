export const VSHADER_SOURCE: string = /* glsl */ `#version 300 es
      layout(location = 0) in vec3 aPos;
      layout(location = 1) in vec3 aColor;
      layout(location = 2) in vec2 aTexCoord;
      out vec2 TexCoord;

      uniform mat4 transform;

      void main(){
          gl_Position = transform * vec4(aPos, 1.0);
          TexCoord = vec2(aTexCoord.x,aTexCoord.y);
      }
    `;
export const FSHADER_SOURCE: string = /* glsl */ `#version 300 es
      precision mediump float;
      out vec4 outColor;
      in vec2 TexCoord;

      uniform float mixValue;

      // texture sampler
      uniform sampler2D texture1;
      uniform sampler2D texture2;
      
      void main(){
        outColor =  mix(texture(texture1, TexCoord), texture(texture2, TexCoord), mixValue);
      }
    `;
