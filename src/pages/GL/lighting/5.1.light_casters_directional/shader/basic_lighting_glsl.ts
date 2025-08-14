export const VSHADER_SOURCE: string = /* glsl */ `#version 300 es
    layout (location = 0) in vec3 aPos;
    layout (location = 1) in vec3 aNormal;
    layout (location = 2) in vec2 aTexCoords;

    out vec3 FragPos;
    out vec3 Normal;
    out vec2 TexCoords;

    uniform mat4 model;
    uniform mat4 view;
    uniform mat4 projection;

    void main()
    {
      FragPos = vec3(model * vec4(aPos, 1.0));
      // 消除不等比缩放带来的影响 法线矩阵(Normal Matrix)*法线，法线矩阵证明见图片
      Normal = mat3(transpose(inverse(model))) * aNormal;  
      TexCoords = aTexCoords;
      
      gl_Position = projection * view * vec4(FragPos, 1.0);
    }
    `;
export const FSHADER_SOURCE: string = /* glsl */ `#version 300 es
    precision mediump float;

    out vec4 FragColor;

    struct Material {
        sampler2D diffuse;
        sampler2D specular;    
        float shininess;
    }; 

    struct Light {
        // vec3 position;
        vec3 direction;

        vec3 ambient;
        vec3 diffuse;
        vec3 specular;
    };

    in vec3 FragPos;  
    in vec3 Normal;  
    in vec2 TexCoords;
      
    uniform vec3 viewPos;
    uniform Material material;
    uniform Light light;

    void main() {
        // ambient
        // vec4 texture(sampler2D sampler, vec2 coord);
        // sampler2D sampler：表示要采样的纹理
        // vec2 coord：纹理坐标，范围通常是 [0.0, 1.0]
        vec3 ambient = light.ambient * texture(material.diffuse,TexCoords).rgb;

        // diffuse 
        vec3 norm = normalize(Normal);
        // 计算从片段位置指向光源的方向向量并标准化
        // vec3 lightDir = normalize(light.position - FragPos);
         vec3 lightDir = normalize(-light.direction);  
        // 计算法向量与光照方向的点积，取最大值确保不为负
        //点积结果代表光线与表面的夹角关系
        float diff = max(dot(norm, lightDir), 0.0);
        vec3 diffuse = light.diffuse * diff * texture(material.diffuse,TexCoords).rgb;
        
        // specular
        vec3 viewDir = normalize(viewPos - FragPos);
        // 计算光线在表面的反射方向
        //使用-lightDir是因为reflect函数期望入射方向
        vec3 reflectDir = reflect(-lightDir, norm);  
        float spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
        vec3 specular = light.specular * spec * texture(material.specular,TexCoords).rgb;  

        vec3 result = ambient + diffuse + specular;
        FragColor = vec4(result, 1.0);
    }
    `;

export default { vs: VSHADER_SOURCE, fs: FSHADER_SOURCE };
