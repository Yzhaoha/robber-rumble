export function previewSnatch({ THREE, scene, renderer, cam, carMesh, placeCamera, box, road, sun }) {
  const [x, z] = road;
  const cars = [carMesh(0, 0), carMesh(3, 2)];
  for (const car of cars) {
    const u = car.userData;
    for (const part of [u.crown, u.spot, u.shield, u.stars, u.flame, u.flame2, u.boostRing, ...u.magRings]) part.visible = false;
    u.body.scale.setScalar(1.15);
    u.car.setLook(0);
    u.up.position.y = u.car.lift;
  }
  scene.add(...cars);
  const bundles = Array.from({length: 3}, () => {
    const group = new THREE.Group();
    group.add(box(1.65, .55, 1, '#ffc53e'), box(.48, .60, 1.05, '#fff3cc'));
    scene.add(group);
    return group;
  });
  const menu = document.getElementById('menu');
  menu.classList.add('hidden');
  const replay = document.createElement('button');
  replay.textContent = '重播 · 飞车夺金';
  replay.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:50;background:#183342;color:white;border-radius:12px;padding:10px 18px';
  document.body.append(replay);
  let start = performance.now();
  replay.onclick = () => { start = performance.now(); };
  const from = new THREE.Vector3(), to = new THREE.Vector3();
  function animate(now) {
    const t = ((now - start) / 1000) % 4.5;
    const offset = 5 * Math.sin((t - 1.65) * Math.PI * 2 / 4.5);
    cars[0].position.set(x + offset, 0, z + 2.9);
    cars[1].position.set(x - offset, 0, z - 2.9);
    cars[1].rotation.y = Math.PI;
    const elapsed = t - 1.65;
    const arrived = bundles.filter((_, i) => elapsed >= .29 + i * .045).length;
    const sent = bundles.filter((_, i) => elapsed >= i * .045).length;
    const counts = [1 + arrived, 9 - sent];
    cars.forEach((car, i) => car.userData.bags.forEach((bag, j) => { bag.visible = j < counts[i]; }));
    const bounce = Math.max(0, elapsed - .29);
    cars[0].userData.stack.scale.y = 1 + .23 * Math.sin(bounce * 27) * Math.exp(-bounce * 7);
    bundles.forEach((bundle, i) => {
      const p = (elapsed - i * .045) / .29;
      bundle.visible = p >= 0 && p < 1;
      if (!bundle.visible) return;
      cars[1].userData.stack.localToWorld(from.set(0, (9-i)*.95, 0));
      cars[0].userData.stack.localToWorld(to.set(0, (2+i)*.95, 0));
      bundle.position.lerpVectors(from, to, p);
      bundle.position.y += 3 * Math.sin(Math.PI * p);
      bundle.rotation.y = i + p * Math.PI;
    });
    sun.target.position.set(x, 0, z);
    sun.position.set(x-18, 38, z+26);
    placeCamera(cars[0].position.x, cars[0].position.z);
    renderer.render(scene, cam);
    requestAnimationFrame(animate);
  }
  requestAnimationFrame(animate);
}
