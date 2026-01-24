// Physics Engine Configuration

export interface PhysicsProfile {
  character: {
    radius: number;
    height: number;
    mass: number;
  };
  movement: {
    walkSpeed: number;
    runSpeed: number;
    acceleration: number;
    deceleration: number;
    rotationSpeed: number;
  };
  physics: {
    friction: number;
    gravity: number;
    jumpForce: number;
    airControl: number;
  };
  collision: {
    pushForce: number;
    maxSlope: number;
    stepHeight: number;
  };
}

export const PROFILES: Record<string, PhysicsProfile> = {
  default: {
    character: { radius: 0.5, height: 1.8, mass: 70 },
    movement: {
      walkSpeed: 4,   // Reduced from 6
      runSpeed: 8,    // Reduced from 12
      acceleration: 30,
      deceleration: 20,
      rotationSpeed: 10,
    },
    physics: {
      friction: 8,
      gravity: -20,
      jumpForce: 8,
      airControl: 0.3,
    },
    collision: {
      pushForce: 50,
      maxSlope: 45,
      stepHeight: 0.3,
    },
  },
  heavy: {
    character: { radius: 0.6, height: 2.0, mass: 100 },
    movement: {
      walkSpeed: 3,   // Reduced from 4
      runSpeed: 5,    // Reduced from 8
      acceleration: 20,
      deceleration: 15,
      rotationSpeed: 6,
    },
    physics: {
      friction: 10,
      gravity: -25,
      jumpForce: 6,
      airControl: 0.2,
    },
    collision: {
      pushForce: 100,
      maxSlope: 30,
      stepHeight: 0.2,
    },
  },
  light: {
    character: { radius: 0.4, height: 1.6, mass: 50 },
    movement: {
      walkSpeed: 5,   // Reduced from 8
      runSpeed: 10,   // Reduced from 16
      acceleration: 40,
      deceleration: 25,
      rotationSpeed: 14,
    },
    physics: {
      friction: 6,
      gravity: -18,
      jumpForce: 10,
      airControl: 0.5,
    },
    collision: {
      pushForce: 30,
      maxSlope: 50,
      stepHeight: 0.4,
    },
  },
};

/**
 * Get profile config as CharacterControllerConfig
 */
export function getControllerConfig(profileName: keyof typeof PROFILES) {
  const profile = PROFILES[profileName] || PROFILES.default;
  return {
    walkSpeed: profile.movement.walkSpeed,
    runSpeed: profile.movement.runSpeed,
    rotationSpeed: profile.movement.rotationSpeed,
    acceleration: profile.movement.acceleration,
    deceleration: profile.movement.deceleration,
    friction: profile.physics.friction,
    jumpForce: profile.physics.jumpForce,
    gravity: profile.physics.gravity,
    characterRadius: profile.character.radius,
    stepHeight: profile.collision.stepHeight,
  };
}
