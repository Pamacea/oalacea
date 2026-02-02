import type { Material } from 'three';

/**
 * Type guard for materials with emissive intensity
 */
export interface EmissiveMaterial {
  emissiveIntensity: number;
}

/**
 * Type guard for materials with intensity property
 */
export interface IntensityMaterial {
  intensity: number;
}

/**
 * Type guard for materials with opacity property
 */
export interface OpacityMaterial {
  opacity: number;
  transparent: boolean;
}

/**
 * Check if a material has emissive intensity property
 */
export function hasEmissiveIntensity(material: Material): material is Material & EmissiveMaterial {
  return 'emissiveIntensity' in material;
}

/**
 * Set emissive intensity on a material if it supports it
 * @returns true if the material supports emissive intensity, false otherwise
 */
export function setEmissiveIntensity(material: Material, value: number): boolean {
  if (hasEmissiveIntensity(material)) {
    material.emissiveIntensity = value;
    return true;
  }
  return false;
}

/**
 * Check if a material has intensity property
 */
export function hasIntensity(material: Material): material is Material & IntensityMaterial {
  return 'intensity' in material;
}

/**
 * Set intensity on a material if it supports it
 * @returns true if the material supports intensity, false otherwise
 */
export function setMaterialIntensity(material: Material, value: number): boolean {
  if (hasIntensity(material)) {
    (material as IntensityMaterial).intensity = value;
    return true;
  }
  return false;
}

/**
 * Set opacity on a material
 */
export function setMaterialOpacity(material: Material, opacity: number, transparent = true): boolean {
  if ('opacity' in material) {
    (material as OpacityMaterial).opacity = opacity;
    (material as OpacityMaterial).transparent = transparent;
    material.needsUpdate = true;
    return true;
  }
  return false;
}

/**
 * Get material properties safely
 */
export function getMaterialProperties(material: Material) {
  return {
    hasEmissiveIntensity: hasEmissiveIntensity(material),
    hasIntensity: hasIntensity(material),
    hasOpacity: 'opacity' in material,
    emissiveIntensity: hasEmissiveIntensity(material) ? material.emissiveIntensity : undefined,
    intensity: hasIntensity(material) ? (material as IntensityMaterial).intensity : undefined,
    opacity: 'opacity' in material ? (material as OpacityMaterial).opacity : undefined,
  };
}
