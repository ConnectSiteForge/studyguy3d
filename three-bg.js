/* three-bg.js — shared Three.js scene, all StudyGuy 3D pages
   Requires: Three.js r134 already loaded, <canvas id="three-canvas"> in DOM */
(function () {
  var canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050d1a, 1);

  var scene  = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 200);
  camera.position.set(0, 0, 50);

  /* ── Particle field ─────────────────────────────────── */
  var particleCount = 1400;
  var positions  = new Float32Array(particleCount * 3);
  var velocities = new Float32Array(particleCount); // per-particle y drift speed
  for (var i = 0; i < particleCount; i++) {
    positions[i * 3]     = (Math.random() - 0.5) * 130;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 130;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    velocities[i] = 0.002 + Math.random() * 0.004; // varied drift speeds
  }
  var pgeo = new THREE.BufferGeometry();
  pgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  var pmat = new THREE.PointsMaterial({ color: 0x00c896, size: 0.15, transparent: true, opacity: 0.5, sizeAttenuation: true });
  var particles = new THREE.Points(pgeo, pmat);
  scene.add(particles);

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
  addObj(new THREE.TetrahedronGeometry(3, 0),    -16, -13, -9);
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

  /* ── Input tracking — mouse and scroll separated ────── */
  var targetX = 0, targetY = 0;   // mouse parallax targets
  var currentX = 0, currentY = 0; // smoothed camera offset
  var scrollTarget = 0;           // scene rotation from scroll (not camera Y)
  var scrollCurrent = 0;

  window.addEventListener('mousemove', function(e) {
    targetX = (e.clientX / window.innerWidth  - 0.5) * 6;
    targetY = (e.clientY / window.innerHeight - 0.5) * -4;
  });

  window.addEventListener('scroll', function() {
    // Rotate the whole scene group slightly on scroll instead of moving camera
    scrollTarget = window.scrollY * 0.0008;
  });

  /* ── Tab visibility — prevent clock jump and play wake animation ─ */
  var wakeBoost = 0;      // extra rotation speed burst on tab return
  var wakePulse = 0;      // particle opacity pulse on tab return

  document.addEventListener('visibilitychange', function() {
    if (!document.hidden) {
      // Tab just became visible — reset elapsed to avoid huge delta
      lastTime = performance.now();
      // Trigger wake animation
      wakeBoost = 1.0;
      wakePulse = 1.0;
    }
  });

  /* ── Animate ────────────────────────────────────────── */
  var lastTime = performance.now();
  var elapsed  = 0;
  var MAX_DELTA = 0.05; // cap frame delta to 50ms to prevent jump after tab switch

  function animate() {
    requestAnimationFrame(animate);

    var now   = performance.now();
    var delta = Math.min((now - lastTime) / 1000, MAX_DELTA); // seconds, capped
    lastTime  = now;
    elapsed  += delta;

    /* Decay wake boost */
    wakeBoost = Math.max(0, wakeBoost - delta * 1.2);
    wakePulse = Math.max(0, wakePulse - delta * 0.8);

    /* Particle opacity: normal 0.5, pulses to 0.85 on tab return */
    pmat.opacity = 0.5 + wakePulse * 0.35;

    /* Particle drift — per-particle speed, smooth wrapping */
    var pa = pgeo.attributes.position.array;
    for (var k = 0; k < particleCount; k++) {
      pa[k*3 + 1] += velocities[k];
      if (pa[k*3 + 1] > 65) {
        pa[k*3 + 1] = -65;
        // randomise x/z on wrap so it doesn't look like a teleport
        pa[k*3]     = (Math.random() - 0.5) * 130;
        pa[k*3 + 2] = (Math.random() - 0.5) * 70;
      }
    }
    pgeo.attributes.position.needsUpdate = true;

    /* Smooth camera mouse parallax — independent of scroll */
    currentX += (targetX - currentX) * 0.04;
    currentY += (targetY - currentY) * 0.04;
    camera.position.x = currentX;
    camera.position.y = currentY;
    camera.position.z = 50;
    camera.lookAt(0, 0, 0);

    /* Smooth scene rotation from scroll */
    scrollCurrent += (scrollTarget - scrollCurrent) * 0.05;
    scene.rotation.x = scrollCurrent * 0.3;
    scene.rotation.y = scrollCurrent * 0.15;

    /* Rotate geometric objects — faster on wake boost */
    var boostMult = 1 + wakeBoost * 4;
    for (var j = 0; j < objects.length; j++) {
      var spd = (0.12 + j * 0.04) * boostMult;
      objects[j].rotation.x += delta * 0.3 * spd;
      objects[j].rotation.y += delta * 0.5 * spd;
      objects[j].position.y += Math.sin(elapsed * 0.4 + j) * 0.005;
    }

    renderer.render(scene, camera);
  }
  animate();
})();
