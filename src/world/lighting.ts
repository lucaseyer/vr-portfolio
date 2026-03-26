import * as THREE from "three";

export function createLighting(): THREE.Group {
  const group = new THREE.Group();

  const ambient = new THREE.AmbientLight("#ffffff", 1.2);
  group.add(ambient);

  const overhead = new THREE.PointLight("#ffffff", 7, 18, 2);
  overhead.position.set(0, 4.2, 0);
  overhead.castShadow = true;
  group.add(overhead);

  const accentA = new THREE.SpotLight("#d8f3ff", 4, 24, Math.PI / 6, 0.35, 1);
  accentA.position.set(-6, 4.5, 6);
  accentA.target.position.set(0, 1.4, 0);
  group.add(accentA, accentA.target);

  const accentB = new THREE.SpotLight("#dbeeff", 4, 24, Math.PI / 6, 0.35, 1);
  accentB.position.set(6, 4.5, -6);
  accentB.target.position.set(0, 1.4, 0);
  group.add(accentB, accentB.target);

  return group;
}
