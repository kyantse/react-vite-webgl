export const VSHADER_SOURCE: string = /* glsl */ `#version 300 es
    layout (location = 0) in vec3 aPos;
    layout (location = 1) in vec3 aNormal;

    out vec3 FragPos;
    out vec3 Normal;
    out vec3 LightPos;

    uniform vec3 lightPos; // we now define the uniform in the vertex shader and pass the 'view space' lightpos to the fragment shader. lightPos is currently in world space.

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main(){
      gl_Position = projection * view * model * vec4(aPos, 1.0);
      FragPos = vec3(view * model * vec4(aPos, 1.0));
      Normal = mat3(transpose(inverse(view * model))) * aNormal;
      LightPos = vec3(view * vec4(lightPos, 1.0)); // Transform world-space light position to view-space light position
    }
    `;
export const FSHADER_SOURCE: string = /* glsl */ `#version 300 es
    precision mediump float;
    out vec4 outColor;
        
    in vec3 Normal;  
    in vec3 FragPos;  
    in vec3 LightPos;   // extra in variable, since we need the light position in view space we calculate this in the vertex shader
      
    uniform vec3 viewPos; 
    uniform vec3 lightColor;
    uniform vec3 objectColor;
      
    void main(){
      // ambient
      float ambientStrength = 0.1;
      vec3 ambient = ambientStrength * lightColor;
      // diffuse
      vec3 normal = normalize(Normal);
      vec3 lightDir = normalize(LightPos - FragPos);
      float diff = max(dot(normal,lightDir), 0.0 );
      vec3 diffuse = diff * lightColor;

      // specular
      float specularStrength = 0.5;
      vec3 viewDir = normalize(-FragPos);
      vec3 reflectDir = reflect(-lightDir, normal);  
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = specularStrength * spec * lightColor;  

      vec3 result = (ambient + diffuse + specular) * objectColor;
      outColor = vec4(result,1.0);
    }
    `;

export default { vs: VSHADER_SOURCE, fs: FSHADER_SOURCE };
