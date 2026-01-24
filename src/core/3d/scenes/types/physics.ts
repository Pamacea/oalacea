// Physics type definitions

export interface PhysicsConfig {
  gravity: [number, number, number];
  timestep: number;
  iterations: number;
}

export interface PhysicsMaterial {
  name: string;
  friction: number;
  restitution: number;
}
