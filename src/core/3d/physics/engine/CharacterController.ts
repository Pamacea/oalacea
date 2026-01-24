// Character Controller - Physics-based movement with continuous collision detection
import { Vector3 } from 'three';
import type { CollisionDetector } from './CollisionDetector';

export interface CharacterInput {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  sprint: boolean;
  jump: boolean;
}

export interface KinematicState {
  position: Vector3;
  velocity: Vector3;
  rotation: number;
  isGrounded: boolean;
}

export interface CharacterControllerConfig {
  // Movement speeds
  walkSpeed?: number;
  runSpeed?: number;
  rotationSpeed?: number;

  // Physics
  acceleration?: number;
  deceleration?: number;
  friction?: number;

  // Jump
  jumpForce?: number;
  gravity?: number;

  // Collision
  characterRadius?: number;
  stepHeight?: number;
}

/**
 * Physics-based character controller with CCD to prevent tunneling
 */
export class CharacterController {
  private readonly collisionDetector: CollisionDetector;
  public readonly state: KinematicState;

  // Physics configuration
  private readonly config = {
    // Movement speeds - REDUCED for better control
    walkSpeed: 4.0,      // Was 6.0
    runSpeed: 8.0,       // Was 12.0
    rotationSpeed: 10.0,

    // Physics
    acceleration: 30.0,
    deceleration: 20.0,
    friction: 8.0,

    // Jump
    jumpForce: 8.0,
    gravity: -20.0,

    // Collision
    characterRadius: 0.5,
    stepHeight: 0.3,

    // CCD settings
    maxSteps: 10,        // Max sub-steps per frame
    minStepSize: 0.05,    // 5cm minimum step
  };

  constructor(
    collisionDetector: CollisionDetector,
    startPosition: Vector3 = new Vector3(0, 0.5, 0),
    config?: CharacterControllerConfig
  ) {
    this.collisionDetector = collisionDetector;

    // Apply custom config
    if (config) {
      Object.assign(this.config, config);
    }

    this.state = {
      position: startPosition.clone(),
      velocity: new Vector3(),
      rotation: 0,
      isGrounded: true,
    };
  }

  /**
   * Update character physics with continuous collision detection
   * Uses raycasting and sub-stepping to prevent tunneling
   */
  update(input: CharacterInput, deltaTime: number): void {
    // 1. Calculate target velocity from input
    const targetVelocity = this.calculateTargetVelocity(input);

    // 2. Apply acceleration/deceleration
    this.applyAcceleration(targetVelocity, deltaTime);

    // 3. Apply friction
    this.applyFriction(deltaTime);

    // 4. Move with continuous collision detection (raycast-based)
    const finalPos = this.moveWithCCD(deltaTime);

    // 5. Update position
    this.state.position.copy(finalPos);

    // 6. Update rotation
    this.updateRotation(input, deltaTime);

    // 7. Handle vertical movement (gravity, jump)
    this.updateVertical(input, deltaTime);
  }

  private calculateTargetVelocity(input: CharacterInput): Vector3 {
    const speed = input.sprint ? this.config.runSpeed : this.config.walkSpeed;
    const target = new Vector3();

    if (input.forward) target.z -= 1;
    if (input.backward) target.z += 1;
    if (input.left) target.x -= 1;
    if (input.right) target.x += 1;

    if (target.length() > 0) {
      target.normalize().multiplyScalar(speed);
    }

    return target;
  }

  private applyAcceleration(targetVelocity: Vector3, deltaTime: number): void {
    const accel = this.config.acceleration;
    const decel = this.config.deceleration;

    if (targetVelocity.length() > 0) {
      this.state.velocity.x += (targetVelocity.x - this.state.velocity.x) * accel * deltaTime;
      this.state.velocity.z += (targetVelocity.z - this.state.velocity.z) * accel * deltaTime;
    } else {
      const decelFactor = Math.pow(decel * deltaTime, 0.5);
      this.state.velocity.x *= Math.max(0, 1 - decelFactor);
      this.state.velocity.z *= Math.max(0, 1 - decelFactor);
    }

    // Snap to zero when very slow
    if (Math.abs(this.state.velocity.x) < 0.01) this.state.velocity.x = 0;
    if (Math.abs(this.state.velocity.z) < 0.01) this.state.velocity.z = 0;
  }

  private applyFriction(deltaTime: number): void {
    const friction = this.config.friction;

    if (this.state.velocity.length() > 0.1) {
      const frictionFactor = Math.pow(1 - friction * deltaTime, 1);
      this.state.velocity.x *= Math.max(0, frictionFactor);
      this.state.velocity.z *= Math.max(0, frictionFactor);
    }
  }

  /**
   * Move with Continuous Collision Detection using raycasting
   * Prevents tunneling through obstacles at high speeds
   */
  private moveWithCCD(deltaTime: number): Vector3 {
    const velocityMag = this.getCurrentSpeed();
    const moveDistance = velocityMag * deltaTime;

    // Calculate number of sub-steps needed
    const numSteps = Math.min(
      this.config.maxSteps,
      Math.ceil(moveDistance / this.config.minStepSize)
    );

    const stepDelta = deltaTime / numSteps;
    const stepDistance = moveDistance / numSteps;

    let currentPos = this.state.position.clone();

    // Move in small steps with collision check each step
    for (let i = 0; i < numSteps; i++) {
      // Calculate next position for this step
      const stepVel = this.state.velocity.clone().normalize().multiplyScalar(stepDistance);
      const nextPos = currentPos.clone().add(stepVel);

      // Check collision at next position
      const collision = this.collisionDetector.checkCollision(
        nextPos,
        this.config.characterRadius
      );

      if (collision.collided) {
        // Collision detected - slide along surface
        const normal = collision.normal;
        const penetration = collision.penetration;

        // Push out of collision
        currentPos.add(normal.clone().multiplyScalar(penetration));

        // Project velocity onto collision plane
        const dot = this.state.velocity.dot(normal);
        this.state.velocity.sub(normal.multiplyScalar(dot));

        // Stop if velocity is very low
        if (this.state.velocity.length() < 0.1) {
          this.state.velocity.set(0, 0, 0);
        }

        break; // Stop moving on collision
      }

      currentPos = nextPos;
    }

    return currentPos;
  }

  private resolveMovement(tentativePos: Vector3): Vector3 {
    // Fallback method for backward compatibility
    const collision = this.collisionDetector.checkCollision(
      tentativePos,
      this.config.characterRadius
    );

    if (collision.collided) {
      const normal = collision.normal;
      const penetration = collision.penetration;

      // Push out of collision
      tentativePos.add(normal.clone().multiplyScalar(penetration));

      // Project velocity onto collision plane
      const dot = this.state.velocity.x * normal.x + this.state.velocity.z * normal.z;
      this.state.velocity.x -= normal.x * dot;
      this.state.velocity.z -= normal.z * dot;

      this.state.velocity.multiplyScalar(0.8);
    }

    return tentativePos;
  }

  private updateRotation(input: CharacterInput, deltaTime: number): void {
    if (input.forward || input.backward || input.left || input.right) {
      const targetRotation = Math.atan2(
        this.state.velocity.x,
        this.state.velocity.z
      );

      // Smooth rotation (shortest path)
      let rotDiff = targetRotation - this.state.rotation;
      while (rotDiff > Math.PI) rotDiff -= Math.PI * 2;
      while (rotDiff < -Math.PI) rotDiff += Math.PI * 2;

      this.state.rotation += rotDiff * this.config.rotationSpeed * deltaTime;

      // Normalize rotation
      while (this.state.rotation > Math.PI) this.state.rotation -= Math.PI * 2;
      while (this.state.rotation < -Math.PI) this.state.rotation += Math.PI * 2;
    }
  }

  private updateVertical(input: CharacterInput, deltaTime: number): void {
    // Apply gravity
    this.state.velocity.y += this.config.gravity * deltaTime;

    // Jump
    if (input.jump && this.state.isGrounded) {
      this.state.velocity.y = this.config.jumpForce;
      this.state.isGrounded = false;
    }

    // Ground check
    if (this.state.position.y <= 0.5) {
      this.state.position.y = 0.5;
      this.state.velocity.y = 0;
      this.state.isGrounded = true;
    }

    this.state.position.y += this.state.velocity.y * deltaTime;
  }

  /**
   * Set character position (for teleportation)
   */
  setPosition(pos: Vector3): void {
    this.state.position.copy(pos);
    this.state.velocity.set(0, 0, 0);
  }

  /**
   * Get current state
   */
  getState(): Readonly<KinematicState> {
    return this.state;
  }

  /**
   * Get current speed
   */
  getCurrentSpeed(): number {
    return Math.sqrt(
      this.state.velocity.x ** 2 +
      this.state.velocity.z ** 2
    );
  }

  /**
   * Check if character is moving
   */
  isMoving(): boolean {
    return this.getCurrentSpeed() > 0.1;
  }
}
