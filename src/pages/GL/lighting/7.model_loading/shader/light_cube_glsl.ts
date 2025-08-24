export const VSHADER_SOURCE: string = /* glsl */ `#version 300 es
        layout (location = 0) in vec3 aPos;

        uniform mat4 model;
        uniform mat4 view;
        uniform mat4 projection;

        void main(){
            gl_Position = projection * view * model * vec4(aPos, 1.0);
        }
    `;
export const FSHADER_SOURCE: string = /* glsl */ `#version 300 es
        precision mediump float;
        out vec4 outColor;

        uniform vec3 cubeColor;
      
        void main(){
            outColor =  vec4(cubeColor,1.0);
        }
    `;

export default { vs: VSHADER_SOURCE, fs: FSHADER_SOURCE };
