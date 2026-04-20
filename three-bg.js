/* three-bg.js — shared Three.js scene for all StudyGuy 3D pages
   Requires: Three.js r134 already loaded, <canvas id="three-canvas"> in the DOM */
(function () {
  var canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050d1a, 1);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.z = 50;

  /* ── Particle field ─────────────────────────────────── */
  var particleCount = 1400;
  var positions = new Float32Array(particleCount * 3);
  for (var i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 130;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
  }
  var pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var pmat = new THREE.PointsMaterial({ color: 0x00c896, size: 0.15, transparent: true, opacity: 0.5, sizeAttenuation: true });
  scene.add(new THREE.Points(pgeo, pmat));

  /* ── Connection lines ───────────────────────────────── */
  var lineMat = new THREE.LineBasicMaterial({ color: 0x00c896, transparent: true, opacity: 0.05 });
  var lineGeo = new THREE.BufferGeometry();
  var linePos = [];
  var maxDist = 12, checkCount = Math.min(particleCount, 350);
  for (var a = 0; a < checkCount; a++) {
    for (var b = a + 1; b < checkCount; b++) {
      var dx = positions[a*3] - positions[b*3];
      var dy = positions[a*3+1] - positions[b*3+1];
      var dz = positions[a*3+2] - positions[b*3+2];
      if (Math.sqrt(dx*dx + dy*dy + dz*dz) < maxDist) {
        linePos.push(positions[a*3], positions[a*3+1], positions[a*3+2]);
        linePos.push(positions[b*3], positions[b*3+1], positions[b*3+2]);
      }
    }
  }
  lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePos, 3));
  scene.add(new THREE.LineSegments(lineGeo, lineMat));

  /* ── Floating wireframe geometry ────────────────────── */
  var objects = [];
  function addObj(geo, x, y, z) {
    var wmat = new THREE.MeshBasicMaterial({ color: 0x00c896, wireframe: true, transparent: true, opacity: 0.18 });
    var fmat = new THREE.MeshPhongMaterial({ color: 0x00c896, transparent: true, opacity: 0.05, emissive: 0x00c896, emissiveIntensity: 0.08 });
    var grp = new THREE.Group();
    grp.add(new THREE.Mesh(geo, fmat));
    grp.add(new THREE.Mesh(geo, wmat));
    grp.position.set(x, y, z);
    grp.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    scene.add(grp);
    objects.push(grp);
  }
  addObj(new THREE.IcosahedronGeometry(4.5, 0),  -26, 11, -18);
  addObj(new THREE.OctahedronGeometry(3.5, 0),    24, -7, -16);
  addObj(new THREE.TetrahedronGeometry(3, 0),     -16, -13, -9);
  addObj(new THREE.IcosahedronGeometry(2.8, 0),   18, 15, -14);
  addObj(new THREE.OctahedronGeometry(2.2, 0),    -7, -17, -11);

  /* ── Lights ─────────────────────────────────────────── */
  scene.add(new THREE.AmbientLight(0x00c896, 0.25));
  var dlight = new THREE.DirectionalLight(0x00ffc8, 0.7);
  dlight.position.set(10, 20, 15);
  scene.add(dlight);

  /* ── Resize ─────────────────────────────────────────── */
  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize);
  onResize();

  /* ── Mouse + scroll parallax ────────────────────────── */
  var mx = 0, my = 0, scrollY = 0;
  window.addEventListener('mousemove', function(e) {
    mx = (e.clientX / window.innerWidth  - 0.5) * 2;
    my = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('scroll', function() { scrollY = window.scrollY; });

  /* ── Animate ────────────────────────────────────────── */
  var clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    var t = clock.getElapsedTime();

    /* slow particle drift upward — wrap when off screen */
    var pa = pgeo.attributes.position.array;
    for (var k = 1; k < pa.length; k += 3) {
      pa[k] += 0.003;
      if (pa[k] > 65) pa[k] = -65;
    }
    pgeo.attributes.position.needsUpdate = true;

    /* camera parallax */
    camera.position.x += (mx * 3.5 - camera.position.x) * 0.03;
    camera.position.y += (-my * 2.5 - camera.position.y + scrollY * 0.012) * 0.03;
    camera.lookAt(0, 0, 0);

    /* rotate objects */
    for (var j = 0; j < objects.length; j++) {
      var spd = 0.12 + j * 0.04;
      objects[j].rotation.x += 0.003 * spd;
      objects[j].rotation.y += 0.005 * spd;
      objects[j].position.y += Math.sin(t * 0.4 + j) * 0.005;
    }

    renderer.render(scene, camera);
  }
  animate();
})();
