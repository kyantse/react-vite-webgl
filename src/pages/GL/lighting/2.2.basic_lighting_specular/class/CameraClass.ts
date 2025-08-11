import { vec3, mat4 } from "gl-matrix";

export enum CameraMovement {
  FORWARD,
  BACKWARD,
  LEFT,
  RIGHT,
}

// Default camera values
const YAW: number = -90.0;
const PITCH: number = 0.0;
const SPEED: number = 2.5;
const SENSITIVITY: number = 0.1;
const ZOOM: number = 45.0;

export default class Camera {
  // camera Attributes
  Position: vec3;
  Front: vec3;
  Up: vec3;
  Right: vec3;
  WorldUp: vec3;

  // euler Angles
  Yaw: number;
  Pitch: number;

  // camera options
  MovementSpeed: number;
  MouseSensitivity: number;
  Zoom: number;

  constructor(
    position: vec3 = vec3.fromValues(0.0, 0.0, 0.0),
    up: vec3 = vec3.fromValues(0.0, 1.0, 0.0),
    yaw: number = YAW,
    pitch: number = PITCH
  ) {
    this.Position = vec3.clone(position);
    this.WorldUp = vec3.clone(up);
    this.Yaw = yaw;
    this.Pitch = pitch;
    this.Front = vec3.fromValues(0.0, 0.0, -1.0);
    this.MovementSpeed = SPEED;
    this.MouseSensitivity = SENSITIVITY;
    this.Zoom = ZOOM;

    this.Right = vec3.create();
    this.Up = vec3.create();

    this.updateCameraVectors();
  }

  getViewMatrix(): mat4 {
    const center = vec3.create();
    vec3.add(center, this.Position, this.Front);
    return mat4.lookAt(mat4.create(), this.Position, center, this.Up);
  }

  processKeyboard(direction: CameraMovement, deltaTime: number): void {
    const velocity = this.MovementSpeed * deltaTime;
    const temp = vec3.create();

    if (direction === CameraMovement.FORWARD) {
      vec3.scale(temp, this.Front, velocity);
      vec3.add(this.Position, this.Position, temp);
    }
    if (direction === CameraMovement.BACKWARD) {
      vec3.scale(temp, this.Front, velocity);
      vec3.sub(this.Position, this.Position, temp);
    }
    if (direction === CameraMovement.LEFT) {
      vec3.scale(temp, this.Right, velocity);
      vec3.sub(this.Position, this.Position, temp);
    }
    if (direction === CameraMovement.RIGHT) {
      vec3.scale(temp, this.Right, velocity);
      vec3.add(this.Position, this.Position, temp);
    }

    // 将镜头限制在地面
    // this.Position[1] = 0;
  }

  processMouseMovement(
    xoffset: number,
    yoffset: number,
    constrainPitch = true
  ): void {
    xoffset *= this.MouseSensitivity;
    yoffset *= this.MouseSensitivity;

    this.Yaw += xoffset;
    this.Pitch += yoffset;

    if (constrainPitch) {
      this.Pitch = Math.max(-89.0, Math.min(89.0, this.Pitch));
    }

    this.updateCameraVectors();
  }

  processMouseScroll(yoffset: number): void {
    if (yoffset < 0) {
      this.Zoom -= 1.0;
    } else {
      this.Zoom += 1.0;
    }
    this.Zoom = Math.max(1.0, Math.min(45.0, this.Zoom));
  }

  private updateCameraVectors(): void {
    const front = vec3.create();
    front[0] =
      Math.cos(this.radians(this.Yaw)) * Math.cos(this.radians(this.Pitch));
    front[1] = Math.sin(this.radians(this.Pitch));
    front[2] =
      Math.sin(this.radians(this.Yaw)) * Math.cos(this.radians(this.Pitch));
    vec3.normalize(this.Front, front);

    vec3.cross(this.Right, this.Front, this.WorldUp);
    vec3.normalize(this.Right, this.Right);

    vec3.cross(this.Up, this.Right, this.Front);
    vec3.normalize(this.Up, this.Up);
  }

  private radians(degrees: number): number {
    return (degrees * Math.PI) / 180.0;
  }
}
