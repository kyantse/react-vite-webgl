export const VSHADER_SOURCE: string = /* glsl */ `#version 300 es
    layout (location = 0) in vec3 aPos;
    layout (location = 1) in vec3 aNormal;

    out vec3 FragPos;
    out vec3 Normal;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main(){
      FragPos = vec3(model * vec4(aPos, 1.0));
      Normal = mat3(transpose(inverse(model))) * aNormal;  
      
      gl_Position = projection * view * vec4(FragPos, 1.0);
    }
    `;
export const FSHADER_SOURCE: string = /* glsl */ `#version 300 es
    precision mediump float;
    out vec4 outColor;
        
    in vec3 Normal;  
    in vec3 FragPos;  
      
    uniform vec3 lightPos; 
    uniform vec3 viewPos; 
    uniform vec3 lightColor;
    uniform vec3 objectColor;
      
    void main(){
      // ambient
      float ambientStrength = 0.1;
      vec3 ambient = ambientStrength * lightColor;
      // diffuse
      vec3 normal = normalize(Normal);
      vec3 lightDir = normalize(lightPos - FragPos);
      float diff = max(dot(normal,lightDir), 0.0 );
      vec3 diffuse = diff * lightColor;

      // specular
      float specularStrength = 0.5;
      vec3 viewDir = normalize(viewPos - FragPos);
      vec3 reflectDir = reflect(-lightDir, normal);  
      float spec = pow(max(dot(viewDir, reflectDir), 0.0), 32.0);
      vec3 specular = specularStrength * spec * lightColor;  

      vec3 result = (ambient + diffuse + specular) * objectColor;
      outColor = vec4(result,1.0);
    }
    `;

export default { vs: VSHADER_SOURCE, fs: FSHADER_SOURCE };
