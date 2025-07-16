export const VS = /* glsl */ `#version 300 es
layout (location = 0) in vec3 a_Position;
layout (location = 1) in vec4 a_color;

out vec4 v_color;

uniform mat4 u_projectionMatrix;
uniform mat4 u_viewMatrix;

void main() {
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_Position, 1.0);
    v_color = a_color;
}`;

export const FS = /* glsl */ `#version 300 es
precision mediump float;

in vec4 v_color;
out vec4 fragColor;

uniform float u_time;

void main() {
    // 使用时间创建随时间变化的颜色 (可以是 RGB)
    float r = 0.5 + 0.5 * sin(u_time);  // R 分量随时间变化
    float g = 0.5 + 0.5 * cos(u_time);  // G 分量随时间变化
    float b = 0.5 + 0.5 * sin(u_time * 0.5);  // B 分量变化频率不同

    // 创建随时间变化的颜色 vec3
    vec3 dynamicColor = vec3(r, g, b);
    
    // 输出最终的颜色
    fragColor = vec4(v_color.rgb * 2.0 * dynamicColor, 0.5);
}`;
