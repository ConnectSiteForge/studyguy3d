/* sg-app.js — SPA router + view controllers for StudyGuy
   Depends on: sg-scene.js, config.js (window.SF), supabase CDN */

/* ── Supabase init ───────────────────────────────────────────── */
var sf = null;
try {
  if (window.SF && window.SF.SUPABASE_URL) {
    sf = window.supabase.createClient(window.SF.SUPABASE_URL, window.SF.SUPABASE_KEY);
  }
} catch (e) { console.warn('[SG] Supabase unavailable:', e.message); }

/* ── Shared helpers ──────────────────────────────────────────── */
function escHtml(s) {
  return String(s)
    .replace(/&/g,'&amp;').replace(/</g,'&lt;')
    .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}
function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(1) + ' MB';
}
function withTimeout(p, ms) {
  return Promise.race([p, new Promise(function(_, rej) {
    setTimeout(function() { rej(new Error('Request timed out — check your connection.')); }, ms);
  })]);
}

/* ── fadeUp observer ─────────────────────────────────────────── */
function initFadeUp(root) {
  var els = (root || document).querySelectorAll('.fadeUp');
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(en) {
      if (en.isIntersecting) {
        en.target.style.animationPlayState = 'running';
        obs.unobserve(en.target);
      }
    });
  }, { threshold: 0.1 });
  els.forEach(function(el) {
    if (!el.closest('.hero')) {
      el.style.animationPlayState = 'paused';
      obs.observe(el);
    }
  });
}

/* ══════════════════════════════════════════════════════════════
   ROUTER
══════════════════════════════════════════════════════════════ */
var Router = (function () {

  var VIEW_MODES = {
    landing: 'landing',
    login:   'auth',
    upload:  'app',
    account: 'app',
    viewer:  'app',
  };

  var NAV_CONFIGS = {
    landing: function() {
      return '<a href="#/" class="nav-logo">StudyGuy</a>' +
        '<div class="nav-links" id="navLinks">' +
          '<a href="#features" class="nav-scroll">Features</a>' +
          '<a href="#modes" class="nav-scroll">Modes</a>' +
          '<a href="#pricing" class="nav-scroll">Pricing</a>' +
          '<a href="#/login?tab=signup" class="btn-primary nav-cta">Get started</a>' +
        '</div>' +
        '<button class="nav-hamburger" id="navHamburger" aria-label="Toggle navigation">' +
          '<span></span><span></span><span></span>' +
        '</button>';
    },
    login: function() {
      return '<a href="#/" class="nav-logo">StudyGuy</a>' +
        '<a href="#/" class="nav-back">← Back to home</a>';
    },
    upload: function() {
      return '<a href="#/" class="nav-logo">StudyGuy</a>' +
        '<a href="#/account" class="nav-back">← Back to dashboard</a>';
    },
    account: function() {
      return '<a href="#/" class="nav-logo">StudyGuy</a>' +
        '<div class="nav-right">' +
          '<span class="nav-email" id="navEmail"></span>' +
          '<button class="btn-signout" id="btnSignOut">Sign out</button>' +
        '</div>';
    },
    viewer: function() {
      return '<a href="#/" class="nav-logo">StudyGuy</a>' +
        '<div class="nav-right">' +
          '<button class="btn-print" onclick="window.print()">🖨 Print</button>' +
          '<a href="#/account" class="nav-back">← Dashboard</a>' +
        '</div>';
    },
  };

  var currentView = null;
  var transitioning = false;

  function parseHash() {
    var h = window.location.hash || '#/';
    var body = h.slice(1) || '/';
    var qi   = body.indexOf('?');
    var path = (qi >= 0 ? body.slice(0, qi) : body).replace(/^\//, '') || 'landing';
    var params = {};
    if (qi >= 0) {
      body.slice(qi + 1).split('&').forEach(function(p) {
        var kv = p.split('=');
        if (kv[0]) params[kv[0]] = decodeURIComponent(kv[1] || '');
      });
    }
    return { view: path, params: params };
  }

  function navigate(hash) {
    history.pushState ? history.pushState(null, '', hash) : (window.location.hash = hash);
    handleRoute();
  }

  function handleRoute() {
    var r = parseHash();
    showView(r.view, r.params);
  }

  function setNav(viewName) {
    var inner = document.getElementById('nav-inner');
    if (!inner) return;
    inner.innerHTML = (NAV_CONFIGS[viewName] || NAV_CONFIGS.landing)();

    /* Wire mobile hamburger if on landing */
    var ham = document.getElementById('navHamburger');
    var links = document.getElementById('navLinks');
    if (ham && links) {
      ham.addEventListener('click', function() { links.classList.toggle('open'); });
      links.querySelectorAll('a').forEach(function(a) {
        a.addEventListener('click', function() { links.classList.remove('open'); });
      });
    }

    /* Wire scroll-anchor links on landing */
    if (links) {
      links.querySelectorAll('.nav-scroll').forEach(function(a) {
        a.addEventListener('click', function(e) {
          var target = document.querySelector(a.getAttribute('href'));
          if (target) {
            e.preventDefault();
            var top = target.getBoundingClientRect().top + window.scrollY - 80;
            window.scrollTo({ top: top, behavior: 'smooth' });
          }
        });
      });
    }

    /* Wire sign-out if on account */
    var btnOut = document.getElementById('btnSignOut');
    if (btnOut) {
      btnOut.addEventListener('click', function() {
        if (sf) sf.auth.signOut();
        navigate('#/');
      });
    }
  }

  function showView(viewName, params) {
    params = params || {};
    if (!document.getElementById('view-' + viewName)) viewName = 'landing';
    if (transitioning || viewName === currentView) {
      if (viewName === currentView) {
        var ctrl = ViewControllers[viewName];
        if (ctrl && ctrl.onShow) ctrl.onShow(params);
      }
      return;
    }

    transitioning = true;
    if (window.SGScene) {
      window.SGScene.triggerTransition();
      window.SGScene.setMode(VIEW_MODES[viewName] || 'landing');
    }
    setNav(viewName);

    var oldEl = currentView ? document.getElementById('view-' + currentView) : null;
    var newEl = document.getElementById('view-' + viewName);

    /* Exit old view */
    if (oldEl) {
      oldEl.classList.add('view-exiting');
      setTimeout(function() {
        oldEl.classList.remove('view-exiting', 'view-active');
      }, 250);
    }

    /* Enter new view */
    var delay = oldEl ? 180 : 0;
    setTimeout(function() {
      window.scrollTo(0, 0);
      newEl.classList.add('view-active', 'view-entering');
      currentView = viewName;

      setTimeout(function() {
        newEl.classList.remove('view-entering');
        transitioning = false;
      }, 420);

      var ctrl = ViewControllers[viewName];
      if (ctrl && ctrl.onShow) ctrl.onShow(params);
      initFadeUp(newEl);
    }, delay);
  }

  /* Intercept ALL internal link clicks — map .html hrefs → hash routes */
  var HREF_MAP = {
    'index.html':           '#/',
    'login.html':           '#/login',
    'upload.html':          '#/upload',
    'account.html':         '#/account',
    'payment-success.html': '#/account',
  };

  document.addEventListener('click', function(e) {
    var a = e.target.closest('a[href]');
    if (!a || a.target === '_blank') return;
    var href = a.getAttribute('href');
    if (!href) return;

    /* Skip external, mailto, tel, pure anchor */
    if (/^(https?:|\/\/|mailto:|tel:)/.test(href)) return;

    /* Already a hash route */
    if (href.startsWith('#/')) { e.preventDefault(); navigate(href); return; }

    /* Map .html filenames */
    var qi   = href.indexOf('?');
    var base = qi >= 0 ? href.slice(0, qi) : href;
    var qs   = qi >= 0 ? href.slice(qi) : '';
    if (HREF_MAP[base]) {
      e.preventDefault();
      var mapped = HREF_MAP[base];
      if (qs) mapped += qs.replace('?', '?');
      navigate(mapped);
    }
  });

  window.addEventListener('popstate', handleRoute);

  return {
    navigate: navigate,
    current:  function() { return currentView; },
    init:     handleRoute,
  };
})();

/* ══════════════════════════════════════════════════════════════
   VIEW CONTROLLERS
══════════════════════════════════════════════════════════════ */
var ViewControllers = {};

/* ── LANDING ─────────────────────────────────────────────────── */
ViewControllers.landing = {
  onShow: function() {},
};

/* ── LOGIN ───────────────────────────────────────────────────── */
ViewControllers.login = {
  onShow: function(params) {
    if (params.tab === 'signup') switchAuthTab('signup');
    else switchAuthTab('signin');

    if (params.blocked) {
      if (sf) sf.auth.signOut();
      var msg = params.blocked === 'age'
        ? 'This account has been restricted — the registered date of birth does not meet the minimum age requirement (13 years). Contact support@studyguy.net if this is an error.'
        : 'Your account has not completed terms acceptance. Please create a new account or contact support@studyguy.net.';
      showLoginMsg('errorSignIn', msg);
    }

    if (sf && !params.blocked) {
      sf.auth.getSession().then(function(res) {
        if (res.data && res.data.session) {
          sf.from('profiles').select('role').eq('id', res.data.session.user.id).maybeSingle().then(function(pr) {
            Router.navigate((pr.data && pr.data.role === 'admin') ? '#/admin' : '#/account');
          });
        }
      });
    }

    var dobEl = document.getElementById('signupDob');
    if (dobEl && !dobEl._sgWired) {
      dobEl._sgWired = true;
      dobEl.max = new Date().toISOString().split('T')[0];
      dobEl.min = (new Date().getFullYear() - 120) + '-01-01';
      dobEl.addEventListener('change', function() {
        if (!this.value) return;
        var d = new Date(this.value), now = new Date();
        var age = now.getFullYear() - d.getFullYear();
        var mo  = now.getMonth() - d.getMonth();
        if (mo < 0 || (mo === 0 && now.getDate() < d.getDate())) age--;
        var grp = document.getElementById('parentalConsentGroup');
        if (age >= 13 && age < 18) { grp.style.display = ''; }
        else { grp.style.display = 'none'; document.getElementById('signupParentalConsent').checked = false; }
      });
    }
  },
};

function switchAuthTab(tab) {
  var isSignIn = tab === 'signin';
  var tIn  = document.getElementById('tabSignIn');
  var tUp  = document.getElementById('tabSignUp');
  var fIn  = document.getElementById('formSignIn');
  var fUp  = document.getElementById('formSignUp');
  if (!tIn) return;
  tIn.classList.toggle('active', isSignIn);
  tUp.classList.toggle('active', !isSignIn);
  fIn.classList.toggle('hidden', !isSignIn);
  fUp.classList.toggle('hidden', isSignIn);
}
window.switchAuthTab = switchAuthTab;

function showLoginMsg(id, msg, isSuccess) {
  var el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.className = 'msg show ' + (isSuccess ? 'msg-success' : 'msg-error');
}
function hideLoginMsg(id) {
  var el = document.getElementById(id);
  if (el) el.classList.remove('show');
}
function setLoading(btnId, spinnerId, textId, loading) {
  var btn = document.getElementById(btnId);
  var sp  = document.getElementById(spinnerId);
  var tx  = document.getElementById(textId);
  if (btn) btn.disabled = loading;
  if (sp)  sp.classList.toggle('show', loading);
  if (tx)  tx.style.opacity = loading ? '0' : '1';
}

function doSignIn() {
  hideLoginMsg('errorSignIn');
  if (!sf) { showLoginMsg('errorSignIn', 'Could not connect. Please refresh.'); return; }
  var email    = document.getElementById('signinEmail').value.trim();
  var password = document.getElementById('signinPassword').value;
  if (!email || !password) { showLoginMsg('errorSignIn', 'Please enter your email and password.'); return; }
  setLoading('btnSignIn', 'spinnerSignIn', 'btnSignInText', true);
  withTimeout(sf.auth.signInWithPassword({ email: email, password: password }), 10000)
    .then(function(res) {
      if (res.error) { showLoginMsg('errorSignIn', res.error.message); return; }
      sf.from('profiles').select('role').eq('id', res.data.user.id).maybeSingle().then(function(pr) {
        Router.navigate((pr.data && pr.data.role === 'admin') ? '#/admin' : '#/account');
      });
    })
    .catch(function(err) { showLoginMsg('errorSignIn', err.message || 'Something went wrong.'); })
    .finally(function() { setLoading('btnSignIn', 'spinnerSignIn', 'btnSignInText', false); });
}

function doSignUp() {
  hideLoginMsg('errorSignUp');
  hideLoginMsg('successSignUp');
  if (!sf) { showLoginMsg('errorSignUp', 'Could not connect. Please refresh.'); return; }
  var fullName = document.getElementById('signupName').value.trim();
  var email    = document.getElementById('signupEmail').value.trim();
  var password = document.getElementById('signupPassword').value;
  var dob      = document.getElementById('signupDob').value;
  if (!fullName)  { showLoginMsg('errorSignUp', 'Please enter your full name.'); return; }
  if (!email)     { showLoginMsg('errorSignUp', 'Please enter your email address.'); return; }
  if (!password || password.length < 8) { showLoginMsg('errorSignUp', 'Password must be at least 8 characters.'); return; }
  if (!dob)       { showLoginMsg('errorSignUp', 'Please enter your date of birth.'); return; }
  var d = new Date(dob), now = new Date();
  var age = now.getFullYear() - d.getFullYear();
  var mo  = now.getMonth() - d.getMonth();
  if (mo < 0 || (mo === 0 && now.getDate() < d.getDate())) age--;
  if (age < 13)  { showLoginMsg('errorSignUp', 'You must be at least 13 years old to create an account.'); return; }
  if (age > 120) { showLoginMsg('errorSignUp', 'Please enter a valid date of birth.'); return; }
  var isUnderage = age < 18;
  if (isUnderage && !document.getElementById('signupParentalConsent').checked) {
    showLoginMsg('errorSignUp', 'Please confirm parental permission to create an account.'); return;
  }
  if (!document.getElementById('signupTerms').checked) {
    showLoginMsg('errorSignUp', 'You must accept the Terms of service and Privacy policy.'); return;
  }
  setLoading('btnSignUp', 'spinnerSignUp', 'btnSignUpText', true);
  withTimeout(sf.auth.signUp({
    email: email, password: password,
    options: {
      data: {
        full_name: fullName, date_of_birth: dob,
        terms_accepted: true, terms_accepted_at: new Date().toISOString(),
        parental_consent: isUnderage,
      },
      emailRedirectTo: window.location.origin + '/confirm.html',
    },
  }), 10000)
    .then(function(res) {
      if (res.error) { showLoginMsg('errorSignUp', res.error.message); return; }
      showLoginMsg('successSignUp', 'Check your email to verify your account.', true);
      document.getElementById('formSignUp').querySelectorAll('input').forEach(function(i) { i.value = ''; });
    })
    .catch(function(err) { showLoginMsg('errorSignUp', err.message || 'Something went wrong.'); })
    .finally(function() { setLoading('btnSignUp', 'spinnerSignUp', 'btnSignUpText', false); });
}

function doForgotPassword() {
  hideLoginMsg('errorResetRequest');
  hideLoginMsg('successResetRequest');
  var email = document.getElementById('signinEmail').value.trim();
  if (!email) { showLoginMsg('errorResetRequest', 'Enter your email above first.'); return; }
  if (!sf)    { showLoginMsg('errorResetRequest', 'Could not connect. Please refresh.'); return; }
  sf.auth.resetPasswordForEmail(email, {
    redirectTo: window.location.origin + '/confirm.html?type=recovery',
  }).then(function(res) {
    if (res.error) { showLoginMsg('errorResetRequest', res.error.message); return; }
    showLoginMsg('successResetRequest', 'Password reset email sent — check your inbox.', true);
  });
}

window.handleSignIn = doSignIn;
window.handleSignUp = doSignUp;
window.doForgotPassword = doForgotPassword;

/* ── UPLOAD ──────────────────────────────────────────────────── */
ViewControllers.upload = {
  _session: null,
  _file:    null,
  _pollInterval: null,

  onShow: function() {
    var self = this;
    self._file = null;
    self._resetUI();

    if (!sf) {
      document.getElementById('uploadFormError').textContent = 'Could not connect. Please refresh.';
      document.getElementById('uploadFormError').classList.add('show');
      return;
    }

    sf.auth.getSession().then(function(res) {
      var s = res.data.session;
      if (!s) { Router.navigate('#/login'); return; }
      self._session = s;
      self._checkLimits(s);
    });
  },

  _resetUI: function() {
    document.getElementById('uploadFormSection').style.display = '';
    document.getElementById('uploadUpgradePrompt').style.display = 'none';
    document.getElementById('processingOverlay').classList.remove('show');
    document.getElementById('uploadFormError').classList.remove('show');
    this._clearFilePreview();
  },

  _clearFilePreview: function() {
    this._file = null;
    var inp = document.getElementById('fileInput');
    if (inp) inp.value = '';
    document.getElementById('filePreview').classList.remove('show');
    document.getElementById('dropZone').style.display = '';
    document.getElementById('docName').value = '';
  },

  _checkLimits: function(session) {
    var MAX_FREE = 3;
    Promise.all([
      sf.from('subscriptions').select('plan, status').eq('user_id', session.user.id).maybeSingle(),
      sf.from('study_guides').select('id', { count: 'exact', head: true }).eq('user_id', session.user.id),
    ]).then(function(results) {
      var plan     = (results[0].data && results[0].data.plan) || 'free';
      var isActive = (plan === 'pro' || plan === 'ultra') && results[0].data && results[0].data.status === 'active';
      var used     = results[1].count || 0;
      if (plan === 'ultra' && isActive) {
        var sub = document.querySelector('#view-upload .drop-sub');
        if (sub) sub.innerHTML = 'or <span>click to browse</span> — PDF, DOCX, TXT, PNG, JPG · max 20MB';
        window._uploadMaxSize = 20 * 1024 * 1024;
      } else {
        window._uploadMaxSize = 10 * 1024 * 1024;
      }
      if (!isActive && used >= MAX_FREE) {
        document.getElementById('uploadFormSection').style.display = 'none';
        document.getElementById('uploadUpgradePrompt').style.display = 'block';
      }
    }).catch(function() {});
  },

  selectFile: function(file) {
    var ALLOWED = ['.pdf','.png','.jpg','.jpeg','.txt','.md','.docx'];
    var ext = '.' + file.name.split('.').pop().toLowerCase();
    var maxSize = window._uploadMaxSize || 10 * 1024 * 1024;
    var errEl = document.getElementById('uploadFormError');

    if (!ALLOWED.includes(ext)) {
      errEl.textContent = 'File type not supported. Please upload: ' + ALLOWED.join(', ');
      errEl.classList.add('show'); return;
    }
    if (file.size > maxSize) {
      errEl.textContent = 'File too large (' + formatBytes(file.size) + '). Max ' + formatBytes(maxSize) + '.';
      errEl.classList.add('show'); return;
    }
    errEl.classList.remove('show');
    this._file = file;

    document.getElementById('dropZone').style.display = 'none';
    var preview = document.getElementById('filePreview');
    preview.classList.add('show');

    var icons = { '.pdf':'📕','.docx':'📝','.png':'🖼️','.jpg':'🖼️','.jpeg':'🖼️' };
    document.getElementById('filePreviewIcon').textContent = icons[ext] || '📄';
    document.getElementById('filePreviewName').textContent = file.name;
    document.getElementById('filePreviewSize').textContent = formatBytes(file.size);

    var nameField = document.getElementById('docName');
    if (!nameField.value) {
      nameField.value = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
    }
  },

  submit: async function() {
    var self = this;
    var errEl = document.getElementById('uploadFormError');
    errEl.classList.remove('show');

    if (!sf || !self._session) { errEl.textContent = 'Not signed in. Please sign in again.'; errEl.classList.add('show'); return; }
    if (!self._file)            { errEl.textContent = 'Please select a file to upload.'; errEl.classList.add('show'); return; }
    var docName = document.getElementById('docName').value.trim();
    if (!docName) { errEl.textContent = 'Please enter a name for your document.'; errEl.classList.add('show'); return; }

    var btn = document.getElementById('btnSubmitUpload');
    btn.disabled = true;
    document.getElementById('uploadSpinner').classList.add('show');
    document.getElementById('uploadBtnText').style.opacity = '0';
    document.getElementById('processingOverlay').classList.add('show');
    document.getElementById('processingStage').textContent = 'Preparing upload…';

    try {
      var userId  = self._session.user.id;
      var uuid    = crypto.randomUUID();
      var safeName = self._sanitizeFilename(self._file.name);
      var path    = userId + '/' + uuid + '/' + safeName;
      var hash    = await self._hashFile(self._file);

      document.getElementById('processingStage').textContent = 'Uploading file…';
      var up = await sf.storage.from('documents').upload(path, self._file, { cacheControl: '3600', upsert: false });
      if (up.error) throw new Error('Upload failed: ' + up.error.message);

      document.getElementById('processingStage').textContent = 'Starting AI pipeline…';
      var sess2 = (await sf.auth.getSession()).data.session;
      var resp  = await fetch(window.SF.SUPABASE_URL + '/functions/v1/upload-handler', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + sess2.access_token },
        body: JSON.stringify({
          file_path: path, name: docName,
          file_type: self._fileType(self._file), mode: document.querySelector('input[name="mode"]:checked').value,
          grade_level: document.getElementById('gradeLevel').value,
          size_bytes: self._file.size, file_hash: hash,
        }),
      });
      if (!resp.ok) {
        var er = await resp.json().catch(function() { return {}; });
        throw new Error(er.error || 'Server error: ' + resp.status);
      }
      var result = await resp.json();
      document.getElementById('processingStage').textContent = result.duplicate ? 'Guide already exists — loading…' : 'Processing…';
      self._pollForCompletion(result.document_id);
    } catch (err) {
      document.getElementById('processingOverlay').classList.remove('show');
      btn.disabled = false;
      document.getElementById('uploadSpinner').classList.remove('show');
      document.getElementById('uploadBtnText').style.opacity = '1';
      errEl.textContent = err.message || 'Something went wrong. Please try again.';
      errEl.classList.add('show');
    }
  },

  _pollForCompletion: function(docId) {
    var self   = this;
    var stages = ['Extracting text…','Analysing content…','Generating guide with AI…','Quality check…','Finalising…'];
    var si = 0, count = 0, MAX = 200;
    clearInterval(self._pollInterval);
    self._pollInterval = setInterval(async function() {
      if (++count >= MAX) {
        clearInterval(self._pollInterval);
        document.getElementById('processingOverlay').classList.remove('show');
        var errEl2 = document.getElementById('uploadFormError');
        errEl2.textContent = 'Processing is taking longer than expected. Check your dashboard in a few minutes.';
        errEl2.classList.add('show');
        return;
      }
      var res = await sf.from('documents').select('status, error_message, created_at').eq('id', docId).single();
      if (res.error || !res.data) return;

      if (res.data.status === 'pending') {
        var pos = await sf.from('documents').select('*', { count: 'exact', head: true })
          .in('status',['pending','processing']).lte('created_at', res.data.created_at);
        if (!pos.error && pos.count != null) {
          var mins = Math.ceil(pos.count * 90 / 60);
          document.getElementById('processingTitle').textContent = 'Position ' + pos.count + ' in queue';
          document.getElementById('processingSub').textContent   = 'Estimated wait: ~' + mins + ' minute' + (mins === 1 ? '' : 's');
          document.getElementById('processingStage').textContent = 'Waiting for a free slot…';
        }
      } else if (res.data.status === 'processing') {
        document.getElementById('processingTitle').textContent = 'Processing your document';
        document.getElementById('processingSub').textContent   = 'Reading, analysing, and generating your study guide.';
        si = (si + 1) % stages.length;
        document.getElementById('processingStage').textContent = stages[si];
      } else if (res.data.status === 'done') {
        clearInterval(self._pollInterval);
        var gr = await sf.from('study_guides').select('id').eq('document_id', docId)
          .order('created_at', { ascending: false }).limit(1).single();
        Router.navigate(gr.data ? '#/viewer?id=' + gr.data.id : '#/account');
      } else if (res.data.status === 'error') {
        clearInterval(self._pollInterval);
        document.getElementById('processingOverlay').classList.remove('show');
        var errEl3 = document.getElementById('uploadFormError');
        errEl3.textContent = res.data.error_message || 'Processing failed. Please try again.';
        errEl3.classList.add('show');
      }
    }, 3000);
  },

  _fileType: function(f) {
    if (f.type === 'application/pdf') return 'pdf';
    if (f.type.startsWith('image/')) return 'image';
    return 'text';
  },
  _sanitizeFilename: function(name) {
    var dot = name.lastIndexOf('.');
    var base = dot > 0 ? name.slice(0, dot) : name;
    var ext  = dot > 0 ? name.slice(dot).toLowerCase() : '';
    return base.normalize('NFD').replace(/[̀-ͯ]/g,'')
      .replace(/[^a-zA-Z0-9._-]/g,'_').replace(/_+/g,'_').slice(0,80)
      .replace(/^_+|_+$/g,'') + ext;
  },
  _hashFile: async function(file) {
    var buf  = await file.arrayBuffer();
    var hash = await crypto.subtle.digest('SHA-256', buf);
    return Array.from(new Uint8Array(hash)).map(function(b){ return b.toString(16).padStart(2,'0'); }).join('');
  },
};

/* ── ACCOUNT ─────────────────────────────────────────────────── */
ViewControllers.account = {
  onShow: function() {
    var self = this;
    if (!sf) { Router.navigate('#/login'); return; }
    sf.auth.getSession().then(function(res) {
      var s = res.data.session;
      if (!s) { Router.navigate('#/login'); return; }
      document.getElementById('navEmail') && (document.getElementById('navEmail').textContent = s.user.email);
      self._load(s);
    });
  },

  _load: async function(session) {
    var userId = session.user.id;
    var FREE_LIMIT = 3;

    var fullName = session.user.email.split('@')[0];
    var plan = 'free', subStatus = null;
    try {
      var [profileRes, subRes] = await Promise.all([
        sf.from('profiles').select('full_name').eq('id', userId).single(),
        sf.from('subscriptions').select('plan,status').eq('user_id', userId).maybeSingle(),
      ]);
      fullName  = profileRes.data?.full_name || fullName;
      plan      = (subRes.data?.status === 'active' && subRes.data?.plan) ? subRes.data.plan : 'free';
      subStatus = subRes.data?.status || null;
    } catch(e) {}

    document.getElementById('accUserName').textContent = fullName;
    var badge = document.getElementById('accPlanBadge');
    badge.textContent = plan === 'ultra' ? 'Ultra plan' : plan === 'pro' ? 'Pro plan' : 'Free plan';
    badge.className = 'plan-badge ' + plan;

    var isPaid = plan === 'pro' || plan === 'ultra';
    var isUltra = plan === 'ultra';
    document.getElementById('accBtnManageSub').textContent = isPaid ? 'Manage subscription' : 'Upgrade to Pro';

    var totalGuides = 0, monthGuides = 0;
    try {
      var startMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
      var [totRes, moRes] = await Promise.all([
        sf.from('study_guides').select('id',{ count:'exact',head:true }).eq('user_id', userId),
        sf.from('study_guides').select('id',{ count:'exact',head:true }).eq('user_id', userId).gte('created_at', startMonth),
      ]);
      totalGuides = totRes.count ?? 0;
      monthGuides = moRes.count ?? 0;
    } catch(e) {}

    document.getElementById('accStatGuides').textContent     = totalGuides;
    document.getElementById('accStatMonth').textContent      = monthGuides;
    document.getElementById('accStatRemaining').textContent  = isPaid ? '∞' : Math.max(0, FREE_LIMIT - totalGuides);
    document.getElementById('accStatFilelimit').textContent  = isUltra ? '20 MB' : '10 MB';

    var pct  = isPaid ? 100 : Math.min((totalGuides / FREE_LIMIT) * 100, 100);
    var fill = document.getElementById('accUsageFill');
    fill.style.width = pct + '%';
    fill.className = 'usage-fill' + (!isPaid && pct >= 100 ? ' danger' : !isPaid && pct > 66 ? ' warning' : '');
    if (isPaid) fill.style.background = isUltra
      ? 'linear-gradient(90deg,#8b2be2,#c084fc)'
      : 'linear-gradient(90deg,var(--electric),#7fffda)';
    document.getElementById('accUsageNumbers').textContent = isPaid ? 'Unlimited guides' : totalGuides + ' / ' + FREE_LIMIT + ' guides used';
    document.getElementById('accUsageSub').innerHTML = isPaid
      ? (isUltra ? 'Ultra plan: unlimited guides · 20 MB max.' : 'Pro plan: unlimited guides · 10 MB max.')
      : (pct >= 100
        ? 'You\'ve used all ' + FREE_LIMIT + ' free guides. <a href="#pricing" class="upgrade-link">Upgrade to Pro</a> for unlimited.'
        : 'Free plan: ' + FREE_LIMIT + ' guides total · 10 MB max. <a href="#pricing" class="upgrade-link">Upgrade to Pro</a>.');

    var skel = document.getElementById('accSkeletonList');
    var cont = document.getElementById('accGuidesContent');
    try {
      var guidesRes = await sf.from('study_guides').select('id,title,mode,created_at')
        .eq('user_id', userId).order('created_at', { ascending: false }).limit(10);
      skel.style.display = 'none';
      cont.style.display = 'block';
      var modeLabel = { study_guide: 'Study guide', problem_solver: 'Problem solver', hybrid: 'Hybrid' };
      if (!guidesRes.data || !guidesRes.data.length) {
        cont.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-title">No study guides yet</div><p class="empty-sub">Upload your first document to get started.</p><a href="#/upload" class="btn-primary" style="display:inline-flex;margin-top:1rem;">Upload a document</a></div>';
      } else {
        cont.innerHTML = '<div class="guides-list">' + guidesRes.data.map(function(g) {
          return '<div class="guide-item"><div class="guide-meta"><div class="guide-title">' + escHtml(g.title||'Untitled guide') + '</div><div class="guide-info"><span class="guide-date">' + formatDate(g.created_at) + '</span><span class="mode-badge ' + escHtml(g.mode) + '">' + escHtml(modeLabel[g.mode]||g.mode) + '</span></div></div><a href="#/viewer?id=' + g.id + '" class="guide-view">View →</a></div>';
        }).join('') + '</div>';
      }
    } catch(e) {
      skel.style.display = 'none';
      cont.style.display = 'block';
      cont.innerHTML = '<div class="empty-state"><div class="empty-icon">📚</div><div class="empty-title">Could not load guides</div><p class="empty-sub">Refresh to try again.</p></div>';
    }

    document.getElementById('accBtnManageSub').onclick = function() {
      if (!isPaid) { Router.navigate('#pricing'); } else {
        alert(plan + ' plan is active.\n\nTo cancel or change, contact support@studyguy.net.\n(Stripe self-service portal coming soon.)');
      }
    };

    document.getElementById('accBtnDelete').addEventListener('click', async function() {
      if (!confirm('Permanently delete your account, all documents, and study guides? This cannot be undone.')) return;
      var btn2 = document.getElementById('accBtnDelete');
      btn2.disabled = true; btn2.textContent = 'Deleting…';
      try {
        var s2 = (await sf.auth.getSession()).data.session;
        if (!s2) { Router.navigate('#/login'); return; }
        var r = await fetch(window.SF.SUPABASE_URL + '/functions/v1/delete-account', {
          method: 'POST',
          headers: { 'Content-Type':'application/json', 'Authorization':'Bearer ' + s2.access_token },
        });
        if (!r.ok) { var e2 = await r.json().catch(function(){return {};}); throw new Error(e2.error||'Server error'); }
        await sf.auth.signOut();
        Router.navigate('#/');
      } catch(err) {
        btn2.disabled = false; btn2.textContent = 'Delete account';
        alert('Failed to delete: ' + (err.message||'Unknown error'));
      }
    }, { once: true });
  },
};

/* ── VIEWER ──────────────────────────────────────────────────── */
ViewControllers.viewer = {
  onShow: function(params) {
    var id = params.id;
    document.getElementById('viewerStateLoading').style.display = 'block';
    document.getElementById('viewerStateError').style.display   = 'none';
    document.getElementById('viewerStateContent').style.display = 'none';

    if (!sf) { this._showError('Could not connect — missing config. Try a hard refresh.'); return; }
    if (!id)  { this._showError('No guide ID in URL.'); return; }
    this._load(id);
  },

  _showError: function(msg) {
    document.getElementById('viewerStateLoading').style.display = 'none';
    document.getElementById('viewerErrorMsg').textContent = msg;
    document.getElementById('viewerStateError').style.display = 'block';
  },

  _load: async function(id) {
    var self = this;
    try {
      var sess = (await sf.auth.getSession()).data.session;
      if (!sess) { Router.navigate('#/login'); return; }

      var CACHE_KEY = 'sg_v1_' + id;
      var data = null;
      try { var cached = localStorage.getItem(CACHE_KEY); if (cached) data = JSON.parse(cached); } catch(_) {}

      if (!data) {
        var res = await sf.from('study_guides').select('id,title,mode,content_html,created_at')
          .eq('id', id).eq('user_id', sess.user.id).maybeSingle();
        if (res.error) { self._showError('Database error: ' + res.error.message); return; }
        if (!res.data)  { self._showError('Guide not found or no permission. ID: ' + id); return; }
        data = res.data;
        try { if ((data.content_html||'').length < 500000) localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch(_) {}
      }

      document.title = (data.title||'Study guide') + ' — StudyGuy';
      document.getElementById('viewerGuideTitle').textContent = data.title || 'Untitled guide';
      var badge = document.getElementById('viewerModeBadge');
      var modeLabels = { study_guide:'Study guide', problem_solver:'Problem solver', hybrid:'Hybrid' };
      badge.textContent = modeLabels[data.mode] || data.mode;
      badge.className   = 'mode-badge ' + data.mode;
      document.getElementById('viewerGuideDate').textContent = formatDate(data.created_at);

      var html = data.content_html || '<p>This guide has no content yet.</p>';
      if (/^<!DOCTYPE|^<html/i.test(html.trim())) {
        var bm = html.match(/<body[^>]*>([\s\S]*?)(<\/body>|$)/i);
        if (bm) html = bm[1].trim();
      }
      var contentEl = document.getElementById('viewerGuideContent');
      contentEl.innerHTML = (typeof DOMPurify !== 'undefined')
        ? DOMPurify.sanitize(html, { FORCE_BODY:true, ADD_TAGS:['style'], ADD_ATTR:['onclick','style'] })
        : html;

      if (window.renderMathInElement) {
        renderMathInElement(contentEl, {
          delimiters: [{ left:'$$',right:'$$',display:true },{ left:'$',right:'$',display:false }],
          throwOnError: false,
        });
      }

      contentEl.querySelectorAll('.flashcard-box').forEach(function(box) {
        var answer = box.querySelector('p');
        if (!answer) return;
        answer.style.display = 'none';
        var btn = document.createElement('button');
        btn.className = 'reveal-btn'; btn.textContent = 'Show answer';
        btn.onclick = function() {
          var h = answer.style.display === 'none';
          answer.style.display = h ? 'block' : 'none';
          btn.textContent = h ? 'Hide answer' : 'Show answer';
        };
        answer.parentNode.insertBefore(btn, answer);
      });
      contentEl.querySelectorAll('.worked-solution-box,.answer-box').forEach(function(box) {
        box.style.display = 'none';
        var btn = document.createElement('button');
        btn.className = 'reveal-btn'; btn.textContent = 'Show solution';
        btn.onclick = function() {
          var h = box.style.display === 'none';
          box.style.display = h ? 'block' : 'none';
          btn.textContent = h ? 'Hide solution' : 'Show solution';
        };
        box.parentNode.insertBefore(btn, box);
      });

      document.getElementById('viewerStateLoading').style.display = 'none';
      document.getElementById('viewerStateContent').style.display = 'block';
    } catch (err) {
      self._showError('Failed to load: ' + (err.message || String(err)));
    }
  },
};

/* ── Wire up upload dropzone + form (called once on DOM ready) ── */
(function wireUpload() {
  var dropZone  = document.getElementById('dropZone');
  var fileInput = document.getElementById('fileInput');
  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('dragover', function(e) { e.preventDefault(); dropZone.classList.add('dragging'); });
  dropZone.addEventListener('dragleave', function() { dropZone.classList.remove('dragging'); });
  dropZone.addEventListener('drop', function(e) {
    e.preventDefault(); dropZone.classList.remove('dragging');
    var f = e.dataTransfer.files[0]; if (f) ViewControllers.upload.selectFile(f);
  });
  fileInput.addEventListener('change', function(e) {
    var f = e.target.files[0]; if (f) ViewControllers.upload.selectFile(f);
  });
  document.getElementById('fileRemoveBtn').addEventListener('click', function() {
    ViewControllers.upload._clearFilePreview();
  });
  document.getElementById('btnSubmitUpload').addEventListener('click', function() {
    ViewControllers.upload.submit();
  });
})();

/* ── Boot ────────────────────────────────────────────────────── */
Router.init();
