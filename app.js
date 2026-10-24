/* =========================================================
   Cheikh Amy Immo & Services — Interactions
   Vanilla JS, sans dépendance.
   ========================================================= */
(() => {
  'use strict';

  const WA_MAIN = '221755534624';
  const EMAIL = 'cheikhamyimmo2@gmail.com';
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const waLink = (text, num = WA_MAIN) => `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
  const icon = (id) => `<svg class="i" aria-hidden="true"><use href="#i-${id}"/></svg>`;
  const escapeHTML = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  const smooth = reduceMotion ? 'auto' : 'smooth';

  const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window);
  // Souris/trackpad : seuls ces appareils reçoivent un focus automatique (sur mobile, il ouvrirait le clavier).
  const finePointer = () => window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  // iOS Safari n'applique les styles :active (retour tactile) qu'en présence d'un écouteur touchstart.
  document.addEventListener('touchstart', () => {}, { passive: true });

  /* ---------- Liens WhatsApp pré-remplis ---------- */
  const hydrateWa = (root = document) => {
    $$('[data-wa]', root).forEach((a) => {
      a.href = waLink(a.dataset.wa, a.dataset.waNum || WA_MAIN);
      if (isMobileDevice) {
        a.removeAttribute('target');
        a.removeAttribute('rel');
      }
    });
  };
  hydrateWa();

  /* ---------- Toast ---------- */
  const toastEl = $('#toast');
  let toastTimer;
  const toast = (msg) => {
    toastEl.textContent = msg;
    toastEl.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 4000);
  };

  /* ---------- Header (verre dépoli au scroll) + retour en haut ---------- */
  const header = $('#header');
  const toTop = $('#toTop');
  const onScroll = () => {
    const y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 24);
    toTop.classList.toggle('is-visible', y > 900);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: smooth }));

  /* ---------- Menu mobile (drawer) ---------- */
  const drawer = $('#drawer');
  const burger = $('#burger');
  const panel = $('.drawer__panel', drawer);
  let lastFocus = null;

  const setDrawer = (open) => {
    drawer.classList.toggle('is-open', open);
    drawer.setAttribute('aria-hidden', String(!open));
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    document.body.classList.toggle('is-locked', open);
    if (open) {
      lastFocus = document.activeElement;
      setTimeout(() => $('.drawer__close', drawer).focus(), 60);
    } else if (lastFocus) {
      lastFocus.focus({ preventScroll: true });
    }
  };

  burger.addEventListener('click', () => setDrawer(!drawer.classList.contains('is-open')));
  $$('[data-close]', drawer).forEach((el) => {
    el.addEventListener('click', (e) => {
      const hash = el.getAttribute('href');
      setDrawer(false);
      if (hash && hash.startsWith('#')) {
        const target = $(hash);
        if (target) {
          e.preventDefault();
          setTimeout(() => {
            target.scrollIntoView({ behavior: smooth, block: 'start' });
          }, 100);
        }
      }
    });
  });
  drawer.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const focusables = $$('a[href], button', panel);
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  });
  window.matchMedia('(min-width: 1024px)').addEventListener('change', (e) => {
    if (e.matches && drawer.classList.contains('is-open')) setDrawer(false);
  });

  /* ---------- Widget WhatsApp flottant ---------- */
  const waWidget = $('#waWidget');
  const waFab = $('#waFab');
  const waPanel = $('#waPanel');
  const setWa = (open) => {
    waWidget.classList.toggle('is-open', open);
    waFab.setAttribute('aria-expanded', String(open));
    waFab.setAttribute('aria-label', open ? 'Fermer la fenêtre WhatsApp' : 'Discuter avec nous sur WhatsApp');
    waPanel.setAttribute('aria-hidden', String(!open));
  };
  waFab.addEventListener('click', () => setWa(!waWidget.classList.contains('is-open')));
  $('#waClose').addEventListener('click', () => { setWa(false); waFab.focus(); });
  
  // Fermeture automatique lors de la sélection d'une ligne pour une expérience fluide
  $$('.wa-line', waPanel).forEach((a) => {
    a.addEventListener('click', () => { setTimeout(() => setWa(false), 300); });
  });

  const handleOutsideWa = (e) => {
    if (waWidget.classList.contains('is-open') && !waWidget.contains(e.target)) setWa(false);
  };
  document.addEventListener('click', handleOutsideWa);
  document.addEventListener('touchend', handleOutsideWa, { passive: true });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drawer.classList.contains('is-open')) setDrawer(false);
    if (waWidget.classList.contains('is-open')) { setWa(false); waFab.focus(); }
  });

  /* ---------- Lien actif dans la navigation ---------- */
  const navLinks = $$('.nav__link');
  if ('IntersectionObserver' in window) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        navLinks.forEach((link) => {
          const active = link.getAttribute('href') === `#${entry.target.id}`;
          link.classList.toggle('is-active', active);
          if (active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
        });
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    navLinks.forEach((link) => { const s = $(link.getAttribute('href')); if (s) spy.observe(s); });
  }

  /* ---------- Apparition au scroll ---------- */
  const revealObs = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;
  const observeReveal = (root = document) => {
    $$('.reveal:not(.is-visible)', root).forEach((el) => (revealObs ? revealObs.observe(el) : el.classList.add('is-visible')));
  };

  /* ---------- Compteurs animés ---------- */
  const counters = $$('[data-count]');
  const alpha = $('[data-alpha]');
  const runCount = (el) => {
    const target = Number(el.dataset.count);
    const t0 = performance.now();
    const dur = 1600;
    const step = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  const runAlpha = (el) => {
    let code = 65;
    const id = setInterval(() => {
      el.textContent = String.fromCharCode(code);
      if (code++ >= 90) clearInterval(id);
    }, 55);
  };
  if (!reduceMotion && 'IntersectionObserver' in window) {
    counters.forEach((el) => { el.textContent = '0'; });
    if (alpha) alpha.textContent = 'A';
    const statObs = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (el.hasAttribute('data-alpha')) runAlpha(el); else runCount(el);
        obs.unobserve(el);
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => statObs.observe(el));
    if (alpha) statObs.observe(alpha);
  }

  /* =========================================================
     Catalogue interactif
     Sélection indicative : modifiez librement ce tableau pour
     publier vos biens réels (image dans assets/web/).
     ========================================================= */
  /* =========================================================
     Catalogue interactif & Recherche intelligente multi-pôles
     ========================================================= */
  const CATS = {
    vente: { label: 'Vente', icon: 'home' },
    location: { label: 'Location', icon: 'key' },
    terrain: { label: 'Terrain', icon: 'map' },
    architecture: { label: 'Architecture', icon: 'compass' },
    tourisme: { label: 'Tourisme', icon: 'palm' },
    serigraphie: { label: 'Sérigraphie', icon: 'printer' },
  };
  const CAT_FILTER_LABELS = {
    vente: 'Vente',
    location: 'Location',
    terrain: 'Terrains',
    architecture: 'Architecture',
    tourisme: 'Tourisme',
    serigraphie: 'Sérigraphie',
  };
  const STATUS = {
    dispo: 'Disponible',
    exclu: 'Exclusivité',
    vente: 'Vente',
    location: 'Location',
    plan: 'Sur plan',
    devis: 'Sur devis',
  };

  /* ---------- Pôles et sections du site pour la recherche directe ---------- */
  const SITE_SECTIONS = [
    {
      id: 'pole-serigraphie',
      title: 'Pôle Impression & Sérigraphie',
      badge: 'Atelier',
      icon: 'printer',
      desc: 'Textile (t-shirts, polos, casquettes), flyers, bannières & goodies publicitaires.',
      keywords: 'serigraphie impression imprimerie atelier flocage textile tshirts tshirt t-shirts t-shirt polos polo casquettes casquette goodies bache flyer flyers banniere bannières cartes visite cadeaux objets publicite communication',
    },
    {
      id: 'pole-architecture',
      title: 'Pôle Architecture & Ingénierie',
      badge: 'Expertise',
      icon: 'compass',
      desc: 'Plans 2D & 3D, maquettes, permis de construire et suivi de chantiers.',
      keywords: 'architecture architecte plan plans 3d 2d permis construire etude ingenierie batiment chantier suivi gros oeuvre conception',
    },
    {
      id: 'pole-design',
      title: 'Pôle Design intérieur & Aménagement',
      badge: 'Design',
      icon: 'sofa',
      desc: 'Agencement, matières, couleurs, mobilier sur mesure et décoration haut de gamme.',
      keywords: 'design interieur amenagement agencement decoration deco salon meubles mobilier cuisine couleurs luminaires style',
    },
    {
      id: 'pole-immobilier',
      title: 'Pôle Transactions immobilières',
      badge: 'Immobilier',
      icon: 'key',
      desc: 'Villas d’exception, parcelles sécurisées, baux locatifs et gestion de patrimoine.',
      keywords: 'immobilier vente achat acheter louer location bail terrain terrains parcelle parcelles foncier villa villas maison maisons gestion notaire juridique',
    },
    {
      id: 'pole-tourisme',
      title: 'Pôle Tourisme & Hôtellerie',
      badge: 'Tourisme',
      icon: 'palm',
      desc: 'Séjours de charme dans le Saloum, hébergements partenaires et balades en pirogue.',
      keywords: 'tourisme sejour sejours hotel lodge voyage pirogue balade ile iles saloum delta mangrove vacances excursion guide',
    },
    {
      id: 'destination',
      title: 'Destination Saloum — Foundiougne',
      badge: 'Destination',
      icon: 'map',
      desc: 'Le charme préservé du Sine-Saloum, le pont Nelson Mandela et son potentiel d’investissement.',
      keywords: 'destination foundiougne saloum pont delta histoire peche sine saloum fleuve investissement mangrove',
    },
    {
      id: 'contact',
      title: 'Contact, Agence & Devis rapide',
      badge: 'Contact',
      icon: 'phone',
      desc: 'En face de la mairie de Foundiougne · Tél : +221 75 553 46 24 · Devis WhatsApp immédiat.',
      keywords: 'contact telephone phone appel numero adresse mairie devis email mail whatsapp conseiller agence foundiougne rendez vous',
    },
  ];

  /* ---------- Dictionnaire de synonymes & déclinaisons ---------- */
  const SYNONYMS = {
    'villas': ['villa', 'maison', 'logement', 'vente'],
    'villa': ['maison', 'logement', 'vente'],
    'maisons': ['maison', 'villa', 'vente', 'location'],
    'maison': ['villa', 'vente', 'location'],
    'terrains': ['terrain', 'parcelle', 'foncier', 'vente', 'batir'],
    'terrain': ['parcelle', 'foncier', 'vente', 'batir'],
    'parcelle': ['terrain', 'foncier', 'vente'],
    'parcelles': ['terrain', 'foncier', 'vente'],
    'foncier': ['terrain', 'parcelle', 'vente'],
    'achats': ['vente', 'acheter', 'achat'],
    'achat': ['vente', 'acheter'],
    'acheter': ['vente', 'achat'],
    'locations': ['location', 'louer', 'loyer', 'locatif'],
    'location': ['louer', 'loyer', 'locatif'],
    'louer': ['location', 'loyer', 'locatif'],
    'loyer': ['location', 'louer', 'locatif'],
    'plans': ['plan', 'architecture', '3d', 'maquette'],
    'plan': ['plans', 'architecture', '3d', 'maquette'],
    'architecte': ['architecture', 'plan', 'conception'],
    'sejours': ['sejour', 'tourisme', 'lodge', 'hotel'],
    'sejour': ['tourisme', 'lodge', 'hotel'],
    'vacances': ['tourisme', 'sejour', 'lodge', 'pirogue'],
    'hotel': ['tourisme', 'sejour', 'lodge', 'residence'],
    'hotels': ['tourisme', 'sejour', 'lodge', 'residence'],
    'pirogues': ['pirogue', 'tourisme', 'saloum', 'balade'],
    'pirogue': ['tourisme', 'saloum', 'balade'],
    'tshirt': ['serigraphie', 'impression', 'textile', 'polo'],
    'tshirts': ['serigraphie', 'impression', 'textile', 'polo'],
    't-shirt': ['serigraphie', 'impression', 'textile', 'polo'],
    't-shirts': ['serigraphie', 'impression', 'textile', 'polo'],
    'polos': ['serigraphie', 'impression', 'textile', 'polo'],
    'polo': ['serigraphie', 'impression', 'textile', 'polo'],
    'casquettes': ['serigraphie', 'textile', 'impression', 'casquette'],
    'casquette': ['serigraphie', 'textile', 'impression'],
    'flocage': ['serigraphie', 'impression', 'textile'],
    'goodies': ['serigraphie', 'impression', 'objets', 'cadeaux'],
    'flyers': ['serigraphie', 'impression', 'communication'],
    'flyer': ['serigraphie', 'impression', 'communication'],
    'bache': ['serigraphie', 'impression', 'banniere'],
    'baches': ['serigraphie', 'impression', 'banniere'],
    'design': ['amenagement', 'decoration', 'deco', 'interieur', 'mobilier', 'meuble'],
    'deco': ['design', 'amenagement', 'interieur', 'decoration'],
    'decoration': ['design', 'amenagement', 'interieur', 'deco'],
    'meubles': ['design', 'mobilier', 'amenagement'],
    'meuble': ['design', 'mobilier', 'amenagement'],
    'salon': ['design', 'amenagement', 'interieur'],
    'appartement': ['logement', 'maison', 'villa', 'location'],
    'appartements': ['logement', 'maison', 'villa', 'location'],
    'devis': ['contact', 'prix', 'tarif', 'etude'],
    'prix': ['tarif', 'devis', 'cout'],
    'tarifs': ['tarif', 'devis', 'prix'],
    'telephone': ['contact', 'numero', 'phone', 'appel'],
    'telephones': ['contact', 'numero', 'phone', 'appel'],
    'numero': ['contact', 'telephone', 'phone'],
    'numeros': ['contact', 'telephone', 'phone'],
    'mail': ['contact', 'email'],
    'adresse': ['contact', 'mairie', 'foundiougne', 'localisation'],
  };

  const getLemmas = (w) => {
    const list = [w];
    if (w.length > 3 && w.endsWith('s')) list.push(w.slice(0, -1));
    if (w.length > 4 && w.endsWith('es')) list.push(w.slice(0, -2));
    if (w.length > 3 && w.endsWith('x')) list.push(w.slice(0, -1));
    return list;
  };

  const expandQueryTokens = (queryStr) => {
    const rawTokens = norm(queryStr).split(/[\s,'"-]+/).filter((t) => t.length > 1);
    return rawTokens.map((tok) => {
      const lemmas = getLemmas(tok);
      const syns = [];
      lemmas.forEach((l) => { if (SYNONYMS[l]) syns.push(...SYNONYMS[l]); });
      if (SYNONYMS[tok]) syns.push(...SYNONYMS[tok]);
      return [...new Set([...lemmas, ...syns])];
    });
  };

  let LISTINGS = [
    {
      ref: 'CA-V01', title: 'Villa contemporaine R+1 avec terrasses', cat: ['vente'], status: 'exclu',
      img: 'villa-moderne', w: 640, h: 807, pos: '50% 35%', alt: 'Villa contemporaine blanche à deux niveaux avec grandes baies vitrées',
      area: 'Foundiougne', loc: 'Foundiougne',
      desc: 'Lignes épurées, larges baies vitrées et terrasses ouvertes sur un jardin paysager.',
      feats: [['maximize', '280 m² bâtis'], ['bed', '4 chambres'], ['sun', 'Terrasses']],
      priceLabel: 'Prix de vente', price: 'Sur demande',
    },
    {
      ref: 'CA-T02', title: 'Terrain résidentiel à bâtir', cat: ['terrain', 'vente'], status: 'dispo',
      img: 'terrain', w: 640, h: 776, pos: '50% 60%', alt: 'Parcelle de terrain délimitée entourée d’arbres',
      area: 'Département de Foundiougne', loc: 'Foundiougne & environs',
      desc: 'Parcelles en zone résidentielle, avec accompagnement juridique jusqu’à la signature.',
      feats: [['maximize', '150 à 500 m²'], ['shield', 'Vérif. juridique'], ['map', 'Zone résidentielle']],
      priceLabel: 'Prix de vente', price: 'Sur demande',
    },
    {
      ref: 'CA-A03', title: 'Villa R+1 conçue sur plan 3D', cat: ['architecture'], status: 'plan',
      img: 'maquette-3d', w: 664, h: 500, pos: '50% 45%', alt: 'Maquette 3D d’une villa posée sur des plans d’architecte',
      area: 'Partout au Sénégal', loc: 'Sur votre terrain, partout au Sénégal',
      desc: 'Conception personnalisée, plans 2D/3D et dossier d’autorisation de construire.',
      feats: [['layers', 'Plans 2D & 3D'], ['file', 'Autorisation'], ['hardhat', 'Suivi chantier']],
      priceLabel: 'Étude', price: 'Sur devis',
    },
    {
      ref: 'CA-S04', title: 'Résidence de charme au bord du Saloum', cat: ['tourisme'], status: 'dispo',
      img: 'lodge-saloum', w: 640, h: 537, pos: '50% 50%', alt: 'Résidence fleurie avec transats sous les palmiers',
      area: 'Foundiougne', loc: 'Foundiougne · bord du fleuve',
      desc: 'Hébergement partenaire au calme, jardin fleuri et transats à l’ombre des palmiers.',
      feats: [['bed', 'Hébergement'], ['sun', 'Jardin & transats'], ['waves', 'Bord du fleuve']],
      priceLabel: 'Séjour', price: 'Sur consultation',
    },
    {
      ref: 'CA-L05', title: 'Maison familiale avec cour', cat: ['location'], status: 'location',
      img: 'maison', w: 640, h: 784, pos: '50% 55%', alt: 'Maison moderne blanche entourée de palmiers',
      area: 'Foundiougne', loc: 'Foundiougne',
      desc: 'Maison lumineuse dans un quartier calme, idéale pour une famille.',
      feats: [['bed', '3 chambres'], ['home', 'Salon + cuisine'], ['sun', 'Cour privée']],
      priceLabel: 'Loyer mensuel', price: 'Sur demande',
    },
    {
      ref: 'CA-T06', title: 'Foncier en bord de Saloum pour projet touristique', cat: ['terrain', 'vente'], status: 'vente',
      img: 'pirogue-pont', w: 944, h: 393, pos: '60% 50%', alt: 'Rive du Saloum avec pirogue colorée et pont de Foundiougne',
      area: 'Département de Foundiougne', loc: 'Département de Foundiougne',
      desc: 'Opportunité pour campement, lodge ou résidence, avec étude de faisabilité possible.',
      feats: [['maximize', 'Grande surface'], ['waves', 'Bord du Saloum'], ['shield', 'Vérif. juridique']],
      priceLabel: 'Prix de vente', price: 'Sur consultation',
    },
    {
      ref: 'CA-A07', title: 'Aménagement intérieur clé en main', cat: ['architecture'], status: 'devis',
      img: 'salon-design', w: 1460, h: 545, pos: '45% 50%', alt: 'Salon contemporain aménagé avec canapé d’angle et éclairage chaleureux',
      area: 'Partout au Sénégal', loc: 'Maisons, appartements, hôtels',
      desc: 'Design d’espace, plan d’aménagement, choix des couleurs et matières, mobilier sur mesure.',
      feats: [['sofa', 'Aménagement'], ['palette', 'Couleurs & matières'], ['sparkles', 'Déco sur mesure']],
      priceLabel: 'Projet', price: 'Sur devis',
    },
    {
      ref: 'CA-S08', title: 'Balade en pirogue au coucher du soleil', cat: ['tourisme'], status: 'dispo',
      img: 'coucher-saloum', w: 640, h: 568, pos: '50% 60%', alt: 'Pirogue sur le Saloum au coucher du soleil',
      area: 'Îles du Saloum', loc: 'Delta du Saloum',
      desc: 'Mangroves, bolongs et îles du Saloum avec un guide local partenaire.',
      feats: [['sailboat', 'Pirogue'], ['clock', 'Fin de journée'], ['users', 'Guide local']],
      priceLabel: 'Excursion', price: 'Sur consultation',
    },
    {
      ref: 'CA-L09', title: 'Gestion locative de votre bien', cat: ['location'], status: 'location',
      img: 'juridique', w: 640, h: 552, pos: '50% 45%', alt: 'Balance de la justice et ouvrages de droit immobilier, notariat et contrats',
      area: 'Département de Foundiougne', loc: 'Département de Foundiougne',
      desc: 'Mise en location, rédaction et suivi des contrats, encaissements et état des lieux.',
      feats: [['key', 'Mise en location'], ['file', 'Contrats'], ['check', 'Suivi complet']],
      priceLabel: 'Mandat', price: 'Sur consultation',
    },
    {
      ref: 'CA-P10', title: 'Impression textile & sérigraphie (t-shirts, polos, casquettes)', cat: ['serigraphie'], status: 'devis',
      img: 'impression', w: 640, h: 243, pos: '50% 50%', alt: 'T-shirts, polos et casquettes personnalisés en sérigraphie dans l’atelier',
      area: 'Département de Foundiougne', loc: 'Atelier Foundiougne · expédition partout',
      desc: 'Personnalisation textile pour entreprises, clubs sportifs, associations et événements familiaux.',
      feats: [['shirt', 'T-shirts & polos'], ['sparkles', 'Haute tenue'], ['printer', 'Sérigraphie & flocage']],
      priceLabel: 'Tarif', price: 'Sur devis',
    },
    {
      ref: 'CA-P11', title: 'Supports de communication & goodies publicitaires', cat: ['serigraphie'], status: 'devis',
      img: 'impression', w: 640, h: 243, pos: '50% 50%', alt: 'Bannières, flyers, cartes et objets promotionnels imprimés',
      area: 'Partout au Sénégal', loc: 'Atelier Foundiougne & tout le Sénégal',
      desc: 'Flyers, bâches, enseignes, stylos et goodies pour valoriser votre marque avec élégance.',
      feats: [['printer', 'Numérique'], ['gift', 'Goodies & objets'], ['file', 'Bannières & flyers']],
      priceLabel: 'Tarif', price: 'Sur devis',
    },
  ];

  const grid = $('#catalogGrid');
  const emptyEl = $('#catalogEmpty');
  const statusEl = $('#catalogStatus');
  const heroQ = $('#searchQuery');
  const catQ = $('#catalogQuery');
  const areaSel = $('#searchArea');
  const searchCount = $('#searchCount');
  const searchDropdown = $('#searchDropdown');
  const heroSearchForm = $('#heroSearch');
  const state = { cat: 'all', q: '', area: '' };

  const cardHTML = (it, i) => {
    const cat = CATS[it.cat[0]] || { label: 'Offre', icon: 'sparkles' };
    const msg = `Bonjour Cheikh Amy Immo, je suis intéressé par le bien « ${it.title} » (réf. ${it.ref}). Pouvez-vous me donner plus d’informations ?`;
    const imgSrc = it.img && it.img.startsWith('http') ? it.img : `assets/web/${it.img}.webp`;
    return `
      <article class="card reveal" style="--delay:${(i % 3) * 0.08}s" data-ref="${it.ref}">
        <div class="card__media">
          <img src="${imgSrc}" alt="${it.alt || it.title}" width="${it.w || 640}" height="${it.h || 640}" loading="lazy" decoding="async" style="object-position:${it.pos || '50% 50%'}">
          <span class="badge badge--${it.status}">${STATUS[it.status] || it.status}</span>
          <span class="card__tag">${icon(cat.icon)}${cat.label}</span>
          <span class="card__ref">Réf. ${it.ref}</span>
        </div>
        <div class="card__body">
          <p class="card__loc">${icon('pin')}${it.loc}</p>
          <h3 class="card__title">${it.title}</h3>
          <p class="card__desc">${it.desc}</p>
          <ul class="card__features">${it.feats.map(([ic, label]) => `<li>${icon(ic)}${label}</li>`).join('')}</ul>
          <div class="card__foot">
            <p class="card__price"><small>${it.priceLabel}</small><strong>${it.price}</strong></p>
            <a class="btn btn--wa btn--sm" href="${waLink(msg)}" ${isMobileDevice ? '' : 'target="_blank" rel="noopener"'} aria-label="Je suis intéressé par « ${it.title} » : écrire sur WhatsApp">${icon('wa')}<span>Je suis intéressé</span></a>
          </div>
        </div>
      </article>`;
  };

  let cards = [];
  let haystacks = [];

  const updateListingsUI = () => {
    if (!grid) return;
    grid.innerHTML = LISTINGS.map(cardHTML).join('');
    cards = $$('.card', grid);
    haystacks = LISTINGS.map((it) => norm([
      it.title, it.loc, it.area, it.desc, it.ref, STATUS[it.status] || '',
      it.cat.map((c) => `${CATS[c]?.label || ''} ${CAT_FILTER_LABELS[c] || ''}`).join(' '),
      it.feats.map((f) => f[1]).join(' '),
    ].join(' ')));

    if (areaSel) {
      const currentArea = areaSel.value;
      areaSel.innerHTML = '<option value="">Toutes les zones</option>';
      [...new Set(LISTINGS.map((it) => it.area))].filter(Boolean).forEach((area) => {
        areaSel.add(new Option(area, area));
      });
      areaSel.value = currentArea;
    }

    $$('[data-count-for]').forEach((el) => {
      const c = el.dataset.countFor;
      el.textContent = c === 'all' ? LISTINGS.length : LISTINGS.filter((it) => it.cat.includes(c)).length;
    });

    observeReveal(grid);
    hydrateWa(grid);
    render();
  };

  // Affichage initial instantané
  updateListingsUI();

  // Synchronisation dynamique avec Airtable via l'API Netlify
  const syncWithAirtable = async () => {
    try {
      const res = await fetch('/api/listings');
      if (!res.ok) return;
      const data = await res.json();
      if (data && Array.isArray(data.listings) && data.listings.length > 0) {
        // Filtre de sécurité : ignore les lignes vides ou sans titre réel
        const realListings = data.listings.filter((it) => it && it.title && it.title !== 'Bien immobilier');
        if (realListings.length > 0) {
          // Fusionne avec les annonces par défaut pour conserver tous les pôles (Architecture, Tourisme, etc.)
          const airtableRefs = new Set(realListings.map(it => it.ref));
          const remainingDefaults = LISTINGS.filter(it => !airtableRefs.has(it.ref));
          LISTINGS = [...realListings, ...remainingDefaults];
          updateListingsUI();
        }
      }
    } catch (e) {
      // Mode hors-ligne ou fallback local transparent
    }
  };
  syncWithAirtable();

  const sectionHaystacks = SITE_SECTIONS.map((s) => norm([
    s.title, s.badge, s.desc, s.keywords,
  ].join(' ')));

  const matches = (it, i) => {
    if (state.cat !== 'all' && !it.cat.includes(state.cat)) return false;
    if (state.area && it.area !== state.area) return false;
    const tokenSets = expandQueryTokens(state.q);
    if (!tokenSets.length) return true;
    return tokenSets.every((set) => set.some((variant) => (haystacks[i] || '').includes(variant)));
  };

  const matchesSection = (sec, idx, query) => {
    const tokenSets = expandQueryTokens(query);
    if (!tokenSets.length) return false;
    return tokenSets.every((set) => set.some((variant) => sectionHaystacks[idx].includes(variant)));
  };

  const highlightCard = (ref) => {
    const card = $(`.card[data-ref="${ref}"]`, grid);
    if (!card) return;
    // 'start' + scroll-margin : une carte plus haute que l'écran reste visible sous le header sticky.
    card.scrollIntoView({ behavior: smooth, block: 'start' });
    card.classList.remove('is-highlighted');
    void card.offsetWidth;
    card.classList.add('is-highlighted');
    setTimeout(() => card.classList.remove('is-highlighted'), 2400);
  };

  /* ---------- Dropdown de recherche intelligente en direct ---------- */
  // La liste s'ouvre juste sous le champ (sur mobile elle est dans le flux, cf. styles.css) et sa
  // hauteur s'adapte à la zone visible au-dessus du clavier virtuel.
  const positionDropdown = () => {
    if (!searchDropdown || searchDropdown.hidden) return;
    const q = heroQ.getBoundingClientRect();
    searchDropdown.style.top = `${Math.round(q.bottom - heroSearchForm.getBoundingClientRect().top + 8)}px`;
    const vv = window.visualViewport;
    const visibleBottom = vv ? vv.offsetTop + vv.height : window.innerHeight;
    searchDropdown.style.maxHeight = `${Math.round(Math.min(440, Math.max(200, visibleBottom - q.bottom - 16)))}px`;
  };
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', positionDropdown);
    window.visualViewport.addEventListener('scroll', positionDropdown);
  }
  window.addEventListener('resize', positionDropdown);

  // Laisse le clavier virtuel se refermer avant de défiler, sinon la position cible est faussée.
  const afterKeyboard = (fn) => setTimeout(fn, isMobileDevice ? 350 : 0);

  const renderDropdown = (rawQuery) => {
    if (!searchDropdown) return;
    const query = rawQuery.trim();
    if (!query) {
      searchDropdown.hidden = true;
      searchDropdown.innerHTML = '';
      return;
    }

    const tokenSets = expandQueryTokens(query);
    const matchedListings = LISTINGS.map((it, i) => ({ it, i }))
      .filter(({ it, i }) => {
        if (!tokenSets.length) return true;
        return tokenSets.every((set) => set.some((variant) => haystacks[i].includes(variant)));
      })
      .map(({ it }) => it);

    const matchedSections = SITE_SECTIONS.filter((sec, idx) => matchesSection(sec, idx, query));

    if (matchedListings.length === 0 && matchedSections.length === 0) {
      searchDropdown.innerHTML = `
        <div class="search-empty-hint">
          <p>Aucun résultat direct pour <strong>« ${escapeHTML(query)} »</strong>.</p>
          <p style="font-size: .8rem; margin-top: 4px; color: var(--muted);">Suggestions de recherche rapide :</p>
          <div class="search-empty-links">
            <button type="button" class="search-pill-link" data-search-pill="villas">Villas</button>
            <button type="button" class="search-pill-link" data-search-pill="terrains">Terrains</button>
            <button type="button" class="search-pill-link" data-search-pill="plans 3D">Plans 3D</button>
            <button type="button" class="search-pill-link" data-search-pill="serigraphie">Sérigraphie</button>
            <button type="button" class="search-pill-link" data-search-pill="contact">Contact &amp; Devis</button>
          </div>
        </div>`;
      searchDropdown.hidden = false;
      positionDropdown();
      return;
    }

    const htmlParts = [];

    // Groupe 1 : Offres du catalogue
    if (matchedListings.length > 0) {
      htmlParts.push(`
        <div class="search-group-title">
          <span>Offres &amp; Biens disponibles</span>
          <span>${matchedListings.length} trouvé${matchedListings.length > 1 ? 's' : ''}</span>
        </div>`);
      matchedListings.slice(0, 5).forEach((it) => {
        const cat = CATS[it.cat[0]] || { label: 'Offre' };
        htmlParts.push(`
          <div class="search-item" role="option" data-ref="${it.ref}" tabindex="0">
            <img class="search-item__thumb" src="assets/web/${it.img}.webp" alt="" width="44" height="44" loading="lazy">
            <div class="search-item__content">
              <strong class="search-item__title">${escapeHTML(it.title)}</strong>
              <div class="search-item__meta">
                <span class="search-item__badge">${escapeHTML(cat.label)}</span>
                <span>${icon('pin')}${escapeHTML(it.loc)}</span>
              </div>
            </div>
            <span class="search-item__price">${escapeHTML(it.price)}</span>
            <svg class="i search-item__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
          </div>`);
      });
      // Sur mobile, la liste repousse le bouton « Voir les offres » (souvent sous le clavier) : elle en propose l'équivalent.
      if (matchedListings.length > 1) {
        htmlParts.push(`
          <button type="button" class="search-item search-item--more" data-action="view-catalog" style="justify-content:center;font-weight:700;color:var(--royal-700);background:var(--sky-50);">
            Voir les ${matchedListings.length} offres dans le catalogue &rarr;
          </button>`);
      }
    }

    // Groupe 2 : Pôles d'expertise et sections du site
    if (matchedSections.length > 0) {
      htmlParts.push(`
        <div class="search-group-title">
          <span>Pôles d’expertise &amp; Services</span>
          <span>${matchedSections.length} service${matchedSections.length > 1 ? 's' : ''}</span>
        </div>`);
      matchedSections.slice(0, 4).forEach((sec) => {
        htmlParts.push(`
          <div class="search-item" role="option" data-section="${sec.id}" tabindex="0">
            <div class="search-item__icon"><svg class="i" aria-hidden="true"><use href="#i-${sec.icon}"/></svg></div>
            <div class="search-item__content">
              <strong class="search-item__title">${escapeHTML(sec.title)}</strong>
              <div class="search-item__meta">
                <span class="search-item__badge">${escapeHTML(sec.badge)}</span>
                <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:240px;">${escapeHTML(sec.desc)}</span>
              </div>
            </div>
            <svg class="i search-item__arrow" aria-hidden="true"><use href="#i-arrow"/></svg>
          </div>`);
      });
    }

    searchDropdown.innerHTML = htmlParts.join('');
    searchDropdown.hidden = false;
    positionDropdown();
  };

  const closeDropdown = () => {
    if (searchDropdown) {
      searchDropdown.hidden = true;
    }
  };

  // Interactions sur le dropdown
  if (searchDropdown) {
    searchDropdown.addEventListener('click', (e) => {
      const itemRef = e.target.closest('[data-ref]');
      if (itemRef) {
        const ref = itemRef.dataset.ref;
        const targetListing = LISTINGS.find((it) => it.ref === ref);
        if (targetListing) {
          if (state.cat !== 'all' && !targetListing.cat.includes(state.cat)) {
            state.cat = 'all';
          }
          state.area = '';
          state.q = targetListing.title;
          render();
          closeDropdown();
          heroQ.blur();
          afterKeyboard(() => highlightCard(ref));
        }
        return;
      }

      const itemSec = e.target.closest('[data-section]');
      if (itemSec) {
        const secId = itemSec.dataset.section;
        const targetEl = $(`#${secId}`);
        closeDropdown();
        heroQ.blur();
        if (targetEl) {
          afterKeyboard(() => targetEl.scrollIntoView({ behavior: smooth, block: 'start' }));
        }
        return;
      }

      const pill = e.target.closest('[data-search-pill]');
      if (pill) {
        const val = pill.dataset.searchPill;
        heroQ.value = val;
        state.q = val;
        render();
        renderDropdown(val);
        heroQ.focus();
        return;
      }

      const moreBtn = e.target.closest('[data-action="view-catalog"]');
      if (moreBtn) {
        closeDropdown();
        heroQ.blur();
        afterKeyboard(() => $('#proprietes').scrollIntoView({ behavior: smooth, block: 'start' }));
      }
    });

    // Navigation clavier dans les résultats du dropdown
    searchDropdown.addEventListener('keydown', (e) => {
      const items = $$('.search-item[tabindex="0"]', searchDropdown);
      const idx = items.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const next = items[idx + 1] || items[0];
        if (next) next.focus();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        const prev = items[idx - 1] || heroQ;
        if (prev) prev.focus();
      } else if (e.key === 'Enter') {
        if (document.activeElement && document.activeElement.classList.contains('search-item')) {
          e.preventDefault();
          document.activeElement.click();
        }
      } else if (e.key === 'Escape') {
        closeDropdown();
        heroQ.focus();
      }
    });
  }

  // Fermer le dropdown en cliquant à l’extérieur
  document.addEventListener('click', (e) => {
    if (heroSearchForm && !heroSearchForm.contains(e.target)) {
      closeDropdown();
    }
  });

  const render = () => {
    let n = 0;
    LISTINGS.forEach((it, i) => {
      const show = matches(it, i);
      cards[i].hidden = !show;
      if (show) n += 1;
    });
    emptyEl.hidden = n > 0;
    searchCount.textContent = n;

    const filters = [];
    if (state.cat !== 'all') filters.push(CAT_FILTER_LABELS[state.cat] || state.cat);
    if (state.area) filters.push(escapeHTML(state.area));
    if (state.q.trim()) filters.push(`« ${escapeHTML(state.q.trim())} »`);
    const label = n === 0 ? 'Aucune offre' : `<strong>${n}</strong> ${n > 1 ? 'offres' : 'offre'}`;
    statusEl.innerHTML = `<span>${label}${filters.length ? ` · ${filters.join(' · ')}` : ' · toutes catégories'}</span>${filters.length ? '<button type="button" class="linklike" data-reset>Réinitialiser les filtres</button>' : ''}`;

    $$('[data-cat]').forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.cat === state.cat)));
    [heroQ, catQ].forEach((input) => { if (input.value !== state.q) input.value = state.q; });
    if (areaSel.value !== state.area) areaSel.value = state.area;
  };

  // Onglet / filtre touché à moitié masqué : on le recentre dans sa barre défilante.
  const centerInBar = (btn) => {
    const bar = btn.parentElement;
    if (bar.scrollWidth <= bar.clientWidth) return;
    const b = bar.getBoundingClientRect();
    const r = btn.getBoundingClientRect();
    bar.scrollBy({ left: r.left - b.left - (b.width - r.width) / 2, behavior: smooth });
  };

  $$('[data-cat]').forEach((btn) => btn.addEventListener('click', () => {
    state.cat = btn.dataset.cat;
    render();
    centerInBar(btn);
    if (heroQ.value.trim()) renderDropdown(heroQ.value);
  }));

  heroQ.addEventListener('input', () => {
    state.q = heroQ.value;
    render();
    renderDropdown(heroQ.value);
  });
  heroQ.addEventListener('focus', () => {
    if (heroQ.value.trim()) renderDropdown(heroQ.value);
  });
  heroQ.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown' && searchDropdown && !searchDropdown.hidden) {
      const first = $('.search-item[tabindex="0"]', searchDropdown);
      if (first) {
        e.preventDefault();
        first.focus();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
    }
  });

  catQ.addEventListener('input', () => {
    state.q = catQ.value;
    render();
  });
  // Champ hors formulaire : la touche « Rechercher » du clavier mobile le referme pour dévoiler les résultats.
  catQ.addEventListener('keydown', (e) => { if (e.key === 'Enter') catQ.blur(); });

  areaSel.addEventListener('change', () => {
    state.area = areaSel.value;
    render();
    if (heroQ.value.trim()) renderDropdown(heroQ.value);
  });

  heroSearchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    closeDropdown();
    heroQ.blur(); // referme le clavier (touche « Rechercher » d'iOS / Android)
    const query = heroQ.value.trim();

    if (query) {
      const matchedSections = SITE_SECTIONS.filter((sec, idx) => matchesSection(sec, idx, query));
      const tokenSets = expandQueryTokens(query);
      const matchedCount = LISTINGS.filter((it, i) => tokenSets.every((set) => set.some((v) => haystacks[i].includes(v)))).length;

      if (matchedCount === 0 && matchedSections.length > 0) {
        const topSec = $(`#${matchedSections[0].id}`);
        if (topSec) {
          topSec.scrollIntoView({ behavior: smooth, block: 'start' });
          return;
        }
      }
    }

    const propSection = $('#proprietes');
    if (propSection) {
      propSection.scrollIntoView({ behavior: smooth, block: 'start' });
    }
  });

  document.addEventListener('click', (e) => {
    if (!e.target.closest('[data-reset]')) return;
    Object.assign(state, { cat: 'all', q: '', area: '' });
    render();
    closeDropdown();
    if (finePointer()) catQ.focus({ preventScroll: true });
  });

  render();
  observeReveal();

  /* =========================================================
     Formulaire de devis → WhatsApp ou e-mail
     ========================================================= */
  const form = $('#quoteForm');
  const fName = $('#f-name');
  const fPhone = $('#f-phone');
  const fEmail = $('#f-email');
  const fMessage = $('#f-message');
  const serviceErr = $('#f-service-error');

  // Boutons "Demander un devis" : présélectionne le service et amène le formulaire lui-même à l'écran
  // (sur mobile il se trouve sous les coordonnées, loin du haut de #contact).
  $$('[data-quote]').forEach((btn) => btn.addEventListener('click', (e) => {
    const value = btn.dataset.quote;
    if (value) {
      const radio = $$('input[name="service"]', form).find((r) => r.value === value);
      if (radio) { radio.checked = true; serviceErr.classList.remove('is-visible'); }
    }
    e.preventDefault();
    form.scrollIntoView({ behavior: smooth, block: 'start' });
    if (finePointer()) setTimeout(() => fName.focus({ preventScroll: true }), reduceMotion ? 0 : 750);
  }));

  const setError = (input, msg = '') => {
    const err = $(`#${input.id}-error`);
    input.setAttribute('aria-invalid', msg ? 'true' : 'false');
    err.textContent = msg;
    err.classList.toggle('is-visible', Boolean(msg));
  };

  const validate = () => {
    const service = $('input[name="service"]:checked', form);
    const name = fName.value.trim();
    const phone = fPhone.value.trim();
    const email = fEmail.value.trim();
    let firstInvalid = null;

    serviceErr.textContent = service ? '' : 'Choisissez le service qui vous intéresse.';
    serviceErr.classList.toggle('is-visible', !service);
    if (!service) firstInvalid = $('input[name="service"]', form);

    if (name.length < 2) { setError(fName, 'Indiquez votre nom (2 caractères minimum).'); firstInvalid = firstInvalid || fName; } else setError(fName);
    if (phone.replace(/\D/g, '').length < 9) { setError(fPhone, 'Numéro invalide (ex. 77 123 45 67).'); firstInvalid = firstInvalid || fPhone; } else setError(fPhone);
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { setError(fEmail, 'Adresse e-mail invalide.'); firstInvalid = firstInvalid || fEmail; } else setError(fEmail);

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true }); // évite un saut brusque avant le défilement fluide
      if ('scrollIntoView' in firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: smooth, block: 'center' });
      }
      return null;
    }
    return { service: service.value, name, phone, email, message: fMessage.value.trim() };
  };

  const compose = (d) => [
    'Bonjour Cheikh Amy Immo & Services,',
    '',
    `Je souhaite un devis pour : ${d.service}.`,
    '',
    `Nom : ${d.name}`,
    `Téléphone : ${d.phone}`,
    ...(d.email ? [`E-mail : ${d.email}`] : []),
    ...(d.message ? ['', `Mon projet : ${d.message}`] : []),
    '',
    'Merci de me recontacter.',
  ].join('\n');

  // Suivi robuste du canal cliqué (compatibilité totale avec tous les navigateurs mobiles et anciens iOS)
  let activeChannel = 'whatsapp';
  $$('button[type="submit"]', form).forEach((btn) => {
    const setChan = () => { activeChannel = btn.value || 'whatsapp'; };
    btn.addEventListener('click', setChan);
    btn.addEventListener('pointerdown', setChan);
  });

  const openExternal = (url) => {
    const isMobileDevice = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent) || ('ontouchstart' in window);
    if (isMobileDevice) {
      // Sur smartphone : redirection directe pour ouvrir l'application WhatsApp sans blocage
      window.location.href = url;
    } else {
      const win = window.open(url, '_blank', 'noopener,noreferrer');
      if (!win) window.location.href = url;
    }
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = validate();
    if (!data) { toast('Merci de compléter les champs indiqués.'); return; }
    const text = compose(data);
    const channel = (e.submitter && e.submitter.value) || activeChannel;

    if (channel === 'email') {
      window.location.href = `mailto:${EMAIL}?subject=${encodeURIComponent(`Demande de devis — ${data.service}`)}&body=${encodeURIComponent(text)}`;
      toast('Votre messagerie s’ouvre avec la demande pré-remplie.');
    } else {
      openExternal(waLink(text));
      toast('WhatsApp s’ouvre avec votre demande pré-remplie.');
    }
  });

  form.addEventListener('input', (e) => {
    if (e.target.getAttribute('aria-invalid') === 'true') setError(e.target);
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'service') serviceErr.classList.remove('is-visible');
  });

  /* ---------- Année du copyright ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
