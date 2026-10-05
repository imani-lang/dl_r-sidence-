/* ==========================================================================
   DL RESID OX — script.js
   - Menu mobile
   - Modale logo (infos + carte)
   - Authentification (localStorage) : inscription / connexion / déconnexion
   - Formulaire de commande
   Remarque : aucune photo n'est gérée ici, elles sont toutes en dur dans le HTML.
   ========================================================================== */

/* ---------- Menu mobile ---------- */
function initNavToggle() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', () => nav.classList.toggle('open'));
}

/* ---------- Modale logo (nom, tel, localisation) + Modale carte ---------- */
function initLogoModal() {
  const brandBtn = document.querySelector('.brand');
  const infoModal = document.getElementById('logoModal');
  const mapModal = document.getElementById('mapModal');
  if (brandBtn && infoModal) {
    brandBtn.addEventListener('click', () => infoModal.classList.add('open'));
  }
  document.querySelectorAll('[data-close-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay').classList.remove('open');
    });
  });
  const showMapBtn = document.getElementById('showMapBtn');
  if (showMapBtn && mapModal) {
    showMapBtn.addEventListener('click', () => {
      infoModal.classList.remove('open');
      mapModal.classList.add('open');
    });
  }
  // fermer en cliquant hors de la boite
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });
}

/* ---------- Stockage utilisateurs ---------- */
const USERS_KEY = 'dlresidox_users';
const SESSION_KEY = 'dlresidox_session';
const ORDERS_KEY = 'dlresidox_orders';

function getUsers() {
  return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
}
function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}
function getSession() {
  return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
}
function setSession(user) {
  localStorage.setItem(SESSION_KEY, JSON.stringify({ nom: user.nom, email: user.email }));
}
function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

/* ---------- Validation ---------- */
function isValidEmail(email) {
  return email.includes('@') && email.length > 3 && email.indexOf('@') < email.length - 1;
}
function isValidPassword(pwd) {
  return pwd.length > 6;
}

/* ---------- Page compte.html : onglets + inscription + connexion ---------- */
function initAuthPage() {
  const tabLogin = document.getElementById('tabLogin');
  const tabSignup = document.getElementById('tabSignup');
  const panelLogin = document.getElementById('panelLogin');
  const panelSignup = document.getElementById('panelSignup');

  if (tabLogin && tabSignup) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabSignup.classList.remove('active');
      panelLogin.classList.add('active');
      panelSignup.classList.remove('active');
    });
    tabSignup.addEventListener('click', () => {
      tabSignup.classList.add('active');
      tabLogin.classList.remove('active');
      panelSignup.classList.add('active');
      panelLogin.classList.remove('active');
    });
  }

  // ----- Inscription -----
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const nom = document.getElementById('signupNom').value.trim();
      const email = document.getElementById('signupEmail').value.trim().toLowerCase();
      const pwd = document.getElementById('signupPwd').value;
      const pwd2 = document.getElementById('signupPwd2').value;
      const msg = document.getElementById('signupMsg');

      resetFieldErrors(signupForm);
      let valid = true;

      if (nom.length < 2) {
        showFieldError('signupNom', 'Veuillez entrer votre nom complet.');
        valid = false;
      }
      if (!isValidEmail(email)) {
        showFieldError('signupEmail', 'L\'adresse email doit contenir "@".');
        valid = false;
      }
      if (!isValidPassword(pwd)) {
        showFieldError('signupPwd', 'Le mot de passe doit contenir plus de 6 caractères.');
        valid = false;
      }
      if (pwd !== pwd2) {
        showFieldError('signupPwd2', 'Les mots de passe ne correspondent pas.');
        valid = false;
      }
      if (!valid) return;

      const users = getUsers();
      if (users.some(u => u.email === email)) {
        showMsg(msg, 'Un compte existe déjà avec cet email.', 'error');
        return;
      }
      const newUser = { nom, email, pwd };
      users.push(newUser);
      saveUsers(users);
      setSession(newUser);
      showMsg(msg, 'Compte créé avec succès ! Redirection...', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 900);
    });
  }

  // ----- Connexion -----
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('loginEmail').value.trim().toLowerCase();
      const pwd = document.getElementById('loginPwd').value;
      const msg = document.getElementById('loginMsg');

      resetFieldErrors(loginForm);
      let valid = true;
      if (!isValidEmail(email)) {
        showFieldError('loginEmail', 'L\'adresse email doit contenir "@".');
        valid = false;
      }
      if (!isValidPassword(pwd)) {
        showFieldError('loginPwd', 'Le mot de passe doit contenir plus de 6 caractères.');
        valid = false;
      }
      if (!valid) return;

      const users = getUsers();
      const found = users.find(u => u.email === email && u.pwd === pwd);
      if (!found) {
        showMsg(msg, 'Email ou mot de passe incorrect.', 'error');
        return;
      }
      setSession(found);
      showMsg(msg, 'Connexion réussie ! Redirection...', 'success');
      setTimeout(() => window.location.href = 'dashboard.html', 700);
    });
  }
}

function showFieldError(fieldId, text) {
  const err = document.getElementById(fieldId + 'Err');
  if (err) { err.textContent = text; err.classList.add('show'); }
  const input = document.getElementById(fieldId);
  if (input) input.style.borderColor = '#c0392b';
}
function resetFieldErrors(form) {
  form.querySelectorAll('.field-error').forEach(el => { el.classList.remove('show'); el.textContent = ''; });
  form.querySelectorAll('input').forEach(el => { el.style.borderColor = ''; });
}
function showMsg(el, text, type) {
  if (!el) return;
  el.textContent = text;
  el.className = 'form-msg show ' + type;
}

/* ---------- Page dashboard.html : protection + bienvenue + commande ---------- */
function initDashboardPage() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return; // cette page n'est pas le tableau de bord

  const session = getSession();
  if (!session) {
    window.location.href = 'compte.html';
    return;
  }
  const nameSlot = document.getElementById('userFirstName');
  if (nameSlot) nameSlot.textContent = session.nom;
  const chip = document.getElementById('userChip');
  if (chip) chip.textContent = session.nom;

  logoutBtn.addEventListener('click', () => {
    clearSession();
    window.location.href = 'index.html';
  });

  initOrderForm(session);
}

/* ---------- Formulaire de commande ---------- */
function populateSelect(id, count, prefix) {
  const sel = document.getElementById(id);
  if (!sel) return;
  for (let i = 1; i <= count; i++) {
    const opt = document.createElement('option');
    opt.value = i;
    opt.textContent = prefix ? `${prefix} ${i}` : i;
    sel.appendChild(opt);
  }
}

function initOrderForm(session) {
  const orderForm = document.getElementById('orderForm');
  if (!orderForm) return;

  populateSelect('orderEtage', 10, 'Étage');
  populateSelect('orderAppart', 3, 'Appartement n°');

  const etatOptions = document.querySelectorAll('.etat-option');
  const etatInput = document.getElementById('orderEtat');
  const semiBlock = document.getElementById('semiFiniBlock');

  etatOptions.forEach(opt => {
    opt.addEventListener('click', () => {
      etatOptions.forEach(o => o.classList.remove('selected'));
      opt.classList.add('selected');
      etatInput.value = opt.dataset.value;
      if (opt.dataset.value === 'semi') {
        semiBlock.style.display = 'block';
      } else {
        semiBlock.style.display = 'none';
      }
    });
  });

  orderForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const msg = document.getElementById('orderMsg');
    const typeF = document.getElementById('orderType').value;
    const etage = document.getElementById('orderEtage').value;
    const appart = document.getElementById('orderAppart').value;
    const etat = etatInput.value;
    const prefs = document.getElementById('orderPrefs') ? document.getElementById('orderPrefs').value.trim() : '';

    if (!typeF || !etage || !appart || !etat) {
      showMsg(msg, 'Veuillez remplir tous les champs avant de valider.', 'error');
      return;
    }
    if (etat === 'semi' && prefs.length < 5) {
      showMsg(msg, 'Merci de décrire brièvement vos préférences de finition.', 'error');
      return;
    }

    const orders = JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]');
    orders.push({
      client: session.email,
      typeF, etage, appart, etat, prefs,
      date: new Date().toISOString()
    });
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

    showMsg(msg, `Votre demande pour un ${typeF} (étage ${etage}, appartement n°${appart}) a bien été enregistrée. Notre équipe vous contactera très vite.`, 'success');
    orderForm.reset();
    etatOptions.forEach(o => o.classList.remove('selected'));
    semiBlock.style.display = 'none';
    etatInput.value = '';
  });
}

/* ---------- Init global ---------- */
document.addEventListener('DOMContentLoaded', () => {
  initNavToggle();
  initLogoModal();
  initAuthPage();
  initDashboardPage();
});