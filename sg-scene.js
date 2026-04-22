/* sg-scene.js — School-themed 3D scenes: desk, ID card, classroom */
(function () {
  var canvas = document.getElementById('three-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x050d1a, 1);

  var scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x050d1a, 30, 120);
  var camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 500);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x8899aa, 0.45));
  var warm = new THREE.DirectionalLight(0xffd9a0, 0.9); warm.position.set(10, 20, 12); scene.add(warm);
  var accent = new THREE.PointLight(0x00c896, 1.3, 40); accent.position.set(-8, 6, 5); scene.add(accent);
  var cool = new THREE.PointLight(0x4a9cff, 0.6, 30); cool.position.set(10, 8, -5); scene.add(cool);

  /* Helper — tag base opacity on every mesh so fades compose cleanly */
  function tag(g, op) { g.traverse(function (o) { if (o.material) { o.material.transparent = true; o.material.userData.baseOp = op == null ? 1 : op; } }); }

  /* ══════════ DESK SCENE (landing + signin) ══════════ */
  var deskGroup = new THREE.Group(); scene.add(deskGroup);

  /* Desk surface */
  var desk = new THREE.Mesh(new THREE.BoxGeometry(34, 0.6, 20), new THREE.MeshPhongMaterial({ color: 0x6b4a2f, shininess: 25 }));
  desk.position.y = -2.3; deskGroup.add(desk);
  deskGroup.add(new THREE.LineSegments(new THREE.EdgesGeometry(desk.geometry), new THREE.LineBasicMaterial({ color: 0x00c896, transparent: true, opacity: 0.15 })).translateY(-2.3));

  /* Open book */
  var pageMat = new THREE.MeshPhongMaterial({ color: 0xf4f0e4 });
  var coverMat = new THREE.MeshPhongMaterial({ color: 0x8b2d2d });
  var book = new THREE.Group();
  var cover = new THREE.Mesh(new THREE.BoxGeometry(8.5, 0.3, 5.5), coverMat); cover.position.y = -1.85; book.add(cover);
  var pL = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), pageMat); pL.rotation.x = -Math.PI / 2; pL.rotation.z = 0.08; pL.position.set(-2, -1.69, 0); book.add(pL);
  var pR = new THREE.Mesh(new THREE.PlaneGeometry(4, 5), pageMat); pR.rotation.x = -Math.PI / 2; pR.rotation.z = -0.08; pR.position.set(2, -1.69, 0); book.add(pR);
  for (var i = 0; i < 6; i++) {
    var lMat = new THREE.MeshBasicMaterial({ color: 0x2a2a3a, transparent: true, opacity: 0.5 });
    var ll = new THREE.Mesh(new THREE.PlaneGeometry(3, 0.06), lMat); ll.rotation.x = -Math.PI / 2; ll.position.set(-2, -1.68, -1.6 + i * 0.55); book.add(ll);
    var lr = ll.clone(); lr.position.x = 2; book.add(lr);
  }
  book.position.set(0, 0, 3); deskGroup.add(book);

  /* Globe */
  var globe = new THREE.Group();
  var globeCore = new THREE.Mesh(new THREE.SphereGeometry(2, 28, 20), new THREE.MeshPhongMaterial({ color: 0x1a4fa0, shininess: 60 }));
  globe.add(globeCore);
  var globeWire = new THREE.Mesh(new THREE.SphereGeometry(2.03, 20, 14), new THREE.MeshBasicMaterial({ color: 0x00c896, wireframe: true, transparent: true, opacity: 0.35 }));
  globe.add(globeWire);
  /* Continents — blotches */
  for (var c = 0; c < 14; c++) {
    var cont = new THREE.Mesh(new THREE.SphereGeometry(0.3 + Math.random() * 0.5, 8, 6), new THREE.MeshPhongMaterial({ color: 0x2d7a4f }));
    var phi = Math.random() * Math.PI, th = Math.random() * Math.PI * 2;
    cont.position.setFromSphericalCoords(2.01, phi, th); cont.scale.set(1, 0.4, 1); globe.add(cont);
  }
  var stand = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1, 0.4, 16), new THREE.MeshPhongMaterial({ color: 0x3a2515 }));
  stand.position.y = -2.4; globe.add(stand);
  var axis = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5, 8), new THREE.MeshPhongMaterial({ color: 0xaaaaaa }));
  axis.rotation.z = 0.4; globe.add(axis);
  globe.position.set(-10, -0.2, -3); deskGroup.add(globe);

  /* Chemistry bottles */
  function bottle(x, z, color, h) {
    var b = new THREE.Group();
    var glass = new THREE.MeshPhongMaterial({ color: 0xaaccff, transparent: true, opacity: 0.35, shininess: 90 });
    var body = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.75, h, 14), glass); b.add(body);
    var liq = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.7, h * 0.7, 14),
      new THREE.MeshPhongMaterial({ color: color, emissive: color, emissiveIntensity: 0.4, transparent: true, opacity: 0.85 }));
    liq.position.y = -h * 0.15; b.add(liq);
    var neck = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.3, 0.45, 10), glass);
    neck.position.y = h / 2 + 0.22; b.add(neck);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.18, 10), new THREE.MeshPhongMaterial({ color: 0x333 }));
    cap.position.y = h / 2 + 0.55; b.add(cap);
    b.position.set(x, -2 + h / 2, z);
    return b;
  }
  deskGroup.add(bottle(8, 1.5, 0xe74c3c, 2));
  deskGroup.add(bottle(9.6, 2.8, 0x00c896, 2.5));
  deskGroup.add(bottle(10.8, 0.8, 0xe09b2e, 1.7));
  deskGroup.add(bottle(7.3, -0.4, 0x9b59b6, 1.9));

  /* Calculator */
  var calc = new THREE.Group();
  calc.add(new THREE.Mesh(new THREE.BoxGeometry(2.8, 0.35, 4), new THREE.MeshPhongMaterial({ color: 0x12162a })));
  var scr = new THREE.Mesh(new THREE.PlaneGeometry(2.2, 0.85), new THREE.MeshBasicMaterial({ color: 0x2ecc71 }));
  scr.rotation.x = -Math.PI / 2; scr.position.set(0, 0.19, -1.35); calc.add(scr);
  /* buttons */
  var btnMat = new THREE.MeshPhongMaterial({ color: 0xcdd6e8 });
  var opMat = new THREE.MeshPhongMaterial({ color: 0xe09b2e });
  for (var r = 0; r < 4; r++) for (var cc = 0; cc < 4; cc++) {
    var mat = cc === 3 ? opMat : btnMat;
    var btn = new THREE.Mesh(new THREE.BoxGeometry(0.46, 0.12, 0.46), mat);
    btn.position.set(-1 + cc * 0.66, 0.235, -0.55 + r * 0.62); calc.add(btn);
  }
  calc.position.set(6, -1.98, 4); calc.rotation.y = -0.35; deskGroup.add(calc);

  /* Pencil */
  var pencil = new THREE.Group();
  pencil.add(new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.11, 4.2, 6), new THREE.MeshPhongMaterial({ color: 0xe09b2e })));
  var tip = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.5, 6), new THREE.MeshPhongMaterial({ color: 0x3a2515 }));
  tip.position.y = 2.35; pencil.add(tip);
  var eraser = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 0.3, 6), new THREE.MeshPhongMaterial({ color: 0xe74c3c }));
  eraser.position.y = -2.25; pencil.add(eraser);
  pencil.rotation.z = Math.PI / 2 - 0.15; pencil.rotation.y = 0.2;
  pencil.position.set(-3, -1.92, 5); deskGroup.add(pencil);

  /* Stacked textbooks */
  var stack = new THREE.Group();
  var cols = [0xe74c3c, 0x00c896, 0x1a4fa0, 0x9b59b6];
  for (var b2 = 0; b2 < 4; b2++) {
    var bk = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.55, 4.4), new THREE.MeshPhongMaterial({ color: cols[b2] }));
    bk.position.y = b2 * 0.55; bk.rotation.y = (Math.random() - 0.5) * 0.15; stack.add(bk);
  }
  stack.position.set(11, -1.75, -4); deskGroup.add(stack);

  /* Desk lamp */
  var lamp = new THREE.Group();
  var lampBase = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.5, 0.15, 12), new THREE.MeshPhongMaterial({ color: 0x1a1a2e }));
  lamp.add(lampBase);
  var arm1 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2, 8), new THREE.MeshPhongMaterial({ color: 0x1a1a2e }));
  arm1.position.y = 1; lamp.add(arm1);
  var arm2 = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.5, 8), new THREE.MeshPhongMaterial({ color: 0x1a1a2e }));
  arm2.position.set(0.6, 1.9, 0); arm2.rotation.z = -0.9; lamp.add(arm2);
  var shade = new THREE.Mesh(new THREE.ConeGeometry(0.7, 0.9, 14, 1, true), new THREE.MeshPhongMaterial({ color: 0xe09b2e, side: THREE.DoubleSide, emissive: 0xff9d3a, emissiveIntensity: 0.3 }));
  shade.position.set(1.1, 2.5, 0); shade.rotation.z = -0.5; lamp.add(shade);
  lamp.position.set(-13, -2, -2); deskGroup.add(lamp);

  /* Floating notes (paper) */
  var papers = new THREE.Group(); scene.add(papers);
  for (var p = 0; p < 28; p++) {
    var paper = new THREE.Mesh(new THREE.PlaneGeometry(0.9, 1.2),
      new THREE.MeshPhongMaterial({ color: 0xf4f7ff, transparent: true, opacity: 0.65, side: THREE.DoubleSide }));
    paper.position.set((Math.random() - 0.5) * 70, Math.random() * 22 + 6, (Math.random() - 0.5) * 50 - 10);
    paper.rotation.set(Math.random(), Math.random(), Math.random());
    paper.userData = { baseOp: 0.65, sp: 0.4 + Math.random() * 0.6, off: Math.random() * 6.28, drift: (Math.random() - 0.5) * 0.02 };
    papers.add(paper);
  }

  tag(deskGroup);

  /* ══════════ ID CARD SCENE (signup) ══════════ */
  var idGroup = new THREE.Group(); idGroup.visible = false; scene.add(idGroup);
  /* Lanyard strips */
  var lanMat = new THREE.MeshPhongMaterial({ color: 0x00c896 });
  var lanL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 14, 0.08), lanMat); lanL.position.set(-2.2, 13, 0); lanL.rotation.z = -0.12; idGroup.add(lanL);
  var lanR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 14, 0.08), lanMat); lanR.position.set(2.2, 13, 0); lanR.rotation.z = 0.12; idGroup.add(lanR);
  /* Clip */
  var clip = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.4, 0.3), new THREE.MeshPhongMaterial({ color: 0xaaaaaa, shininess: 90 }));
  clip.position.set(0, 6.5, 0); idGroup.add(clip);
  /* Card body */
  var card = new THREE.Mesh(new THREE.BoxGeometry(9, 13, 0.25), new THREE.MeshPhongMaterial({ color: 0xf8f9fc }));
  idGroup.add(card);
  /* Green top band */
  var band = new THREE.Mesh(new THREE.PlaneGeometry(9, 2.6), new THREE.MeshPhongMaterial({ color: 0x00c896, emissive: 0x00c896, emissiveIntensity: 0.25 }));
  band.position.set(0, 5.2, 0.14); idGroup.add(band);
  /* "STUDYGUY" logo stripe */
  var logoStripe = new THREE.Mesh(new THREE.PlaneGeometry(5, 0.4), new THREE.MeshBasicMaterial({ color: 0xffffff }));
  logoStripe.position.set(0, 5.2, 0.15); idGroup.add(logoStripe);
  /* Photo */
  var photo = new THREE.Mesh(new THREE.PlaneGeometry(3.8, 4.4), new THREE.MeshPhongMaterial({ color: 0x1a4fa0 }));
  photo.position.set(-2, 1, 0.14); idGroup.add(photo);
  var photoFrame = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(3.8, 4.4)), new THREE.LineBasicMaterial({ color: 0x00c896 }));
  photoFrame.position.set(-2, 1, 0.16); idGroup.add(photoFrame);
  /* Silhouette */
  var head = new THREE.Mesh(new THREE.SphereGeometry(0.8, 16, 16), new THREE.MeshPhongMaterial({ color: 0xb8c0d0 }));
  head.position.set(-2, 1.8, 0.18); idGroup.add(head);
  var body = new THREE.Mesh(new THREE.ConeGeometry(1.6, 2.5, 16), new THREE.MeshPhongMaterial({ color: 0xb8c0d0 }));
  body.position.set(-2, -0.2, 0.17); idGroup.add(body);
  /* Text lines (right side) */
  var labelCols = [0x00c896, 0x1a1a2e, 0x1a1a2e, 0x1a1a2e, 0x00c896];
  var widths = [1.8, 3.2, 2.8, 3.5, 2.2];
  for (var tl = 0; tl < 5; tl++) {
    var tmat = new THREE.MeshBasicMaterial({ color: labelCols[tl], transparent: true, opacity: tl % 2 === 0 ? 0.9 : 0.6 });
    var tline = new THREE.Mesh(new THREE.PlaneGeometry(widths[tl], 0.22), tmat);
    tline.position.set(2.5 - (3.5 - widths[tl]) / 2, 2.5 - tl * 0.9, 0.14); idGroup.add(tline);
  }
  /* Barcode */
  for (var bc = 0; bc < 18; bc++) {
    var w = 0.05 + Math.random() * 0.1;
    var bar = new THREE.Mesh(new THREE.PlaneGeometry(w, 1.2), new THREE.MeshBasicMaterial({ color: 0x1a1a2e }));
    bar.position.set(-2.5 + bc * 0.28, -3.8, 0.14); idGroup.add(bar);
  }
  /* Star (honors?) */
  var star = new THREE.Mesh(new THREE.TetrahedronGeometry(0.5, 0), new THREE.MeshPhongMaterial({ color: 0xe09b2e, emissive: 0xe09b2e, emissiveIntensity: 0.4 }));
  star.position.set(3, -4.5, 0.4); idGroup.add(star);
  idGroup.position.set(0, -1, -4); idGroup.rotation.x = -0.05;
  tag(idGroup);

  /* ══════════ CLASSROOM SCENE (upload / viewer / account) ══════════ */
  var classGroup = new THREE.Group(); classGroup.visible = false; scene.add(classGroup);
  /* Floor */
  var floor = new THREE.Mesh(new THREE.PlaneGeometry(60, 40), new THREE.MeshPhongMaterial({ color: 0x2a1f15 }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -4; classGroup.add(floor);
  /* Floor grid lines */
  var gridHelper = new THREE.GridHelper(40, 20, 0x00c896, 0x1a3040);
  gridHelper.position.y = -3.99; gridHelper.material.transparent = true; gridHelper.material.opacity = 0.25; classGroup.add(gridHelper);
  /* Back wall */
  var wall = new THREE.Mesh(new THREE.PlaneGeometry(60, 30), new THREE.MeshPhongMaterial({ color: 0x1a2438 }));
  wall.position.set(0, 10, -12); classGroup.add(wall);
  /* Chalkboard */
  var chalk = new THREE.Mesh(new THREE.BoxGeometry(22, 11, 0.3), new THREE.MeshPhongMaterial({ color: 0x1e3a2a }));
  chalk.position.set(0, 6, -11.7); classGroup.add(chalk);
  /* Chalkboard frame */
  var frameGeo = new THREE.BoxGeometry(23, 12, 0.5);
  var chalkFrame = new THREE.LineSegments(new THREE.EdgesGeometry(frameGeo), new THREE.LineBasicMaterial({ color: 0x8b6b3f }));
  chalkFrame.position.set(0, 6, -11.6); classGroup.add(chalkFrame);
  /* Chalk equations (white lines) */
  var eqGroup = new THREE.Group();
  function addChalkLine(x, y, w, h) {
    var m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: 0xf4f7ff, transparent: true, opacity: 0.85 }));
    m.position.set(x, y, -11.5); eqGroup.add(m);
  }
  /* E */
  addChalkLine(-8, 8, 0.12, 1.4); addChalkLine(-7.6, 8.6, 0.9, 0.12); addChalkLine(-7.6, 8, 0.7, 0.12); addChalkLine(-7.6, 7.4, 0.9, 0.12);
  /* = */
  addChalkLine(-6, 8.2, 0.8, 0.12); addChalkLine(-6, 7.8, 0.8, 0.12);
  /* mc² */
  addChalkLine(-4.5, 8, 1.4, 0.12); addChalkLine(-4.8, 8.3, 0.12, 0.6); addChalkLine(-4.5, 8.3, 0.12, 0.6); addChalkLine(-4.2, 8.3, 0.12, 0.6);
  addChalkLine(-2.7, 8, 0.12, 1.2); addChalkLine(-2.5, 7.5, 0.7, 0.12); addChalkLine(-1.9, 8.2, 0.4, 0.12);
  /* Random equation snippets & graphs */
  for (var eq = 0; eq < 14; eq++) {
    var ew = 0.4 + Math.random() * 1.8;
    addChalkLine(1 + Math.random() * 8, 3 + Math.random() * 5, ew, 0.09);
  }
  /* Graph axes */
  addChalkLine(6, 4.5, 4, 0.08); addChalkLine(4.2, 6, 0.08, 4);
  /* Graph curve (approximate parabola via segments) */
  for (var gr = 0; gr < 12; gr++) {
    var gx = 4.3 + gr * 0.35;
    var gy = 4.6 + Math.pow((gr - 6) * 0.25, 2);
    var seg = new THREE.Mesh(new THREE.PlaneGeometry(0.3, 0.08), new THREE.MeshBasicMaterial({ color: 0x00c896, transparent: true, opacity: 0.9 }));
    seg.position.set(gx, gy, -11.5); eqGroup.add(seg);
  }
  classGroup.add(eqGroup);

  /* Desks (rows) */
  function mkDesk(x, z, chair) {
    var g = new THREE.Group();
    var top = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 1.6), new THREE.MeshPhongMaterial({ color: 0x8b6b3f }));
    top.position.y = 0.1; g.add(top);
    for (var lg = 0; lg < 4; lg++) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2, 0.15), new THREE.MeshPhongMaterial({ color: 0x1a1a2e }));
      leg.position.set(lg < 2 ? -1.15 : 1.15, -0.9, lg % 2 === 0 ? -0.65 : 0.65); g.add(leg);
    }
    if (chair) {
      var ch = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.12, 1.2), new THREE.MeshPhongMaterial({ color: 0xe09b2e }));
      ch.position.set(0, -0.8, 1.4); g.add(ch);
      var back = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 0.15), new THREE.MeshPhongMaterial({ color: 0xe09b2e }));
      back.position.set(0, -0.1, 2); g.add(back);
    }
    g.position.set(x, -3, z);
    return g;
  }
  for (var row = 0; row < 3; row++) for (var col = 0; col < 4; col++) {
    classGroup.add(mkDesk(-9 + col * 6, -2 + row * 4, true));
  }

  /* Teacher's desk */
  var tdesk = new THREE.Mesh(new THREE.BoxGeometry(9, 0.4, 3.2), new THREE.MeshPhongMaterial({ color: 0x8b6b3f }));
  tdesk.position.set(-7, -1.6, -8); classGroup.add(tdesk);
  /* Apple on teacher's desk */
  var apple = new THREE.Mesh(new THREE.SphereGeometry(0.45, 16, 16), new THREE.MeshPhongMaterial({ color: 0xe74c3c, shininess: 80 }));
  apple.position.set(-9, -1.2, -8); classGroup.add(apple);
  var stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.25, 6), new THREE.MeshPhongMaterial({ color: 0x3a2515 }));
  stem.position.set(-9, -0.8, -8); classGroup.add(stem);
  var leaf = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.2), new THREE.MeshPhongMaterial({ color: 0x2d7a4f, side: THREE.DoubleSide }));
  leaf.position.set(-8.8, -0.75, -8); leaf.rotation.z = 0.5; classGroup.add(leaf);

  /* Stack of papers on teacher's desk */
  for (var pp = 0; pp < 6; pp++) {
    var sheet = new THREE.Mesh(new THREE.BoxGeometry(1.6, 0.03, 2), new THREE.MeshPhongMaterial({ color: 0xf4f7ff }));
    sheet.position.set(-5, -1.35 + pp * 0.035, -8); sheet.rotation.y = (Math.random() - 0.5) * 0.1; classGroup.add(sheet);
  }

  /* Wall clock */
  var clockG = new THREE.Group();
  var cface = new THREE.Mesh(new THREE.CircleGeometry(1.3, 32), new THREE.MeshPhongMaterial({ color: 0xf4f7ff })); clockG.add(cface);
  var crim = new THREE.Mesh(new THREE.TorusGeometry(1.3, 0.13, 8, 32), new THREE.MeshPhongMaterial({ color: 0x1a1a2e })); clockG.add(crim);
  /* tick marks */
  for (var tk = 0; tk < 12; tk++) {
    var tick = new THREE.Mesh(new THREE.PlaneGeometry(0.08, 0.25), new THREE.MeshBasicMaterial({ color: 0x1a1a2e }));
    var ang = (tk / 12) * Math.PI * 2;
    tick.position.set(Math.sin(ang) * 1.05, Math.cos(ang) * 1.05, 0.02);
    tick.rotation.z = -ang; clockG.add(tick);
  }
  var hh = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.7, 0.03), new THREE.MeshBasicMaterial({ color: 0x1a1a2e }));
  hh.position.set(0, 0.3, 0.05); clockG.add(hh);
  var mh = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.05, 0.03), new THREE.MeshBasicMaterial({ color: 0x1a1a2e }));
  mh.position.set(0, 0.45, 0.05); clockG.add(mh);
  var sh = new THREE.Mesh(new THREE.BoxGeometry(0.04, 1.15, 0.02), new THREE.MeshBasicMaterial({ color: 0xe74c3c }));
  sh.position.set(0, 0.5, 0.07); clockG.add(sh);
  clockG.position.set(13, 10, -11.3);
  clockG.userData = { hh: hh, mh: mh, sh: sh };
  classGroup.add(clockG);

  /* Bookshelf on side */
  var shelf = new THREE.Group();
  var shelfBack = new THREE.Mesh(new THREE.BoxGeometry(6, 10, 0.3), new THREE.MeshPhongMaterial({ color: 0x3a2515 }));
  shelf.add(shelfBack);
  for (var sh2 = 0; sh2 < 4; sh2++) {
    var plank = new THREE.Mesh(new THREE.BoxGeometry(6, 0.15, 1.5), new THREE.MeshPhongMaterial({ color: 0x6b4a2f }));
    plank.position.set(0, -4.5 + sh2 * 3, 0.7); shelf.add(plank);
    for (var ib = 0; ib < 5; ib++) {
      var sb = new THREE.Mesh(new THREE.BoxGeometry(0.5, 2.2, 1.2),
        new THREE.MeshPhongMaterial({ color: [0xe74c3c, 0x00c896, 0x1a4fa0, 0x9b59b6, 0xe09b2e][(sh2 + ib) % 5] }));
      sb.position.set(-2.3 + ib * 0.55, -3.3 + sh2 * 3, 0.7); shelf.add(sb);
    }
  }
  shelf.position.set(-18, 2, -10); shelf.rotation.y = 0.3; classGroup.add(shelf);

  /* Ceiling lights */
  for (var cl = 0; cl < 3; cl++) {
    var light = new THREE.Mesh(new THREE.BoxGeometry(3, 0.2, 1), new THREE.MeshBasicMaterial({ color: 0xffffcc }));
    light.position.set(-8 + cl * 8, 12, -2); classGroup.add(light);
  }

  tag(classGroup);

  /* ══════════ Modes ══════════ */
  var MODES = {
    landing: { cam: new THREE.Vector3(0, 5, 26), look: new THREE.Vector3(0, 0, 0), show: 'desk', parallax: 1.0, spd: 1.0 },
    auth:    { cam: new THREE.Vector3(2, 3, 18), look: new THREE.Vector3(-2, 0, 0), show: 'desk', parallax: 0.5, spd: 0.6 },
    signup:  { cam: new THREE.Vector3(0, 2, 24), look: new THREE.Vector3(0, 0, -4), show: 'id',   parallax: 0.6, spd: 0.7 },
    app:     { cam: new THREE.Vector3(0, 3, 16), look: new THREE.Vector3(0, 3, -11), show: 'class', parallax: 0.35, spd: 0.5 }
  };
  var modeCur = MODES.landing;
  var vis = { desk: 1, id: 0, class: 0 };
  var visT = { desk: 1, id: 0, class: 0 };

  var camPos = MODES.landing.cam.clone();
  var camLook = MODES.landing.look.clone();
  var camPosT = camPos.clone();
  var camLookT = camLook.clone();
  var currentX = 0, currentY = 0, targetX = 0, targetY = 0;
  var scrollCur = 0, scrollT = 0;
  var transitionT = 0;
  var smoothMult = 1.0;

  window.addEventListener('mousemove', function (e) {
    targetX = (e.clientX / window.innerWidth - 0.5) * 2;
    targetY = (e.clientY / window.innerHeight - 0.5) * -1.5;
  });
  window.addEventListener('scroll', function () { scrollT = window.scrollY * 0.0005; });

  function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener('resize', onResize); onResize();

  function applyVisibility(group, key) {
    var v = vis[key];
    group.visible = v > 0.005;
    group.traverse(function (o) {
      if (o.material && o.material.userData && o.material.userData.baseOp != null) {
        o.material.opacity = o.material.userData.baseOp * v;
      }
    });
  }

  var elapsed = 0, lastTime = performance.now();
  function animate() {
    requestAnimationFrame(animate);
    var now = performance.now();
    var delta = Math.min((now - lastTime) / 1000, 0.05);
    lastTime = now; elapsed += delta;
    transitionT = Math.max(0, transitionT - delta * 2.2);

    var lr = 1 - Math.pow(0.01, delta * 2);
    vis.desk += (visT.desk - vis.desk) * lr;
    vis.id += (visT.id - vis.id) * lr;
    vis.class += (visT.class - vis.class) * lr;
    applyVisibility(deskGroup, 'desk');
    applyVisibility(idGroup, 'id');
    applyVisibility(classGroup, 'class');

    /* Camera */
    camPos.lerp(camPosT, lr);
    camLook.lerp(camLookT, lr);
    var px = modeCur.parallax;
    currentX += (targetX * px - currentX) * (0.04 * smoothMult);
    currentY += (targetY * px - currentY) * (0.04 * smoothMult);
    scrollCur += (scrollT - scrollCur) * (0.05 * smoothMult);
    camera.position.set(camPos.x + currentX, camPos.y + currentY, camPos.z + transitionT * 6);
    camera.lookAt(camLook);

    /* Object animation */
    globeCore.rotation.y += delta * 0.35 * modeCur.spd;
    globeWire.rotation.y += delta * 0.35 * modeCur.spd;

    /* Papers float */
    papers.children.forEach(function (p) {
      p.rotation.x += delta * 0.2 * p.userData.sp;
      p.rotation.y += delta * 0.28 * p.userData.sp;
      p.position.y += Math.sin(elapsed * 0.8 + p.userData.off) * 0.008;
      p.position.x += p.userData.drift * delta * 20;
      if (p.position.x > 35) p.position.x = -35;
      if (p.position.x < -35) p.position.x = 35;
    });

    /* ID card: gentle sway */
    if (vis.id > 0.1) {
      idGroup.rotation.y = Math.sin(elapsed * 0.4) * 0.15;
      idGroup.rotation.z = Math.sin(elapsed * 0.5) * 0.04;
      idGroup.position.y = -1 + Math.sin(elapsed * 0.6) * 0.25;
      star.rotation.y += delta * 1.2; star.rotation.x += delta * 0.8;
    }

    /* Classroom: clock hands */
    if (vis.class > 0.1) {
      clockG.userData.sh.rotation.z -= delta * 0.6;
      clockG.userData.mh.rotation.z -= delta * 0.04;
    }

    /* Desk scene scroll rotation */
    deskGroup.rotation.y = scrollCur * 0.15;
    book.rotation.y = Math.sin(elapsed * 0.3) * 0.03;

    renderer.render(scene, camera);
  }
  animate();

  /* Public API */
  window.SGScene = {
    setMode: function (name) {
      if (!MODES[name]) return;
      modeCur = MODES[name];
      camPosT.copy(modeCur.cam);
      camLookT.copy(modeCur.look);
      visT = { desk: 0, id: 0, class: 0 };
      visT[modeCur.show] = 1;
    },
    triggerTransition: function () { transitionT = 1.0; },
    setSmoothness: function (val) {
      val = Math.max(0, Math.min(100, val));
      smoothMult = Math.pow(2, (50 - val) / 25);
    }
  };
})();
