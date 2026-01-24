// Interaction type definitions

export interface InteractionTarget {
  objectId: string;
  name: string;
  route: string;
  distance: number;
}

export interface InteractionZone {
  position: [number, number, number];
  radius: number;
  data: {
    name: string;
    route: string;
  };
}
