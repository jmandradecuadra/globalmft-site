/* ======================================================
   GLOBAL MFT — Shared Header + Footer injector v2
   GMFTNav.inject(root, lang)
     root: '' for root pages, '../' for /pages/,
           '../../' for /pages/es/
     lang: 'en' (default) | 'es'
   ====================================================== */

window.GMFTNav = (function () {

  function inject(root, lang) {
    root = root || '';
    lang = lang || 'en';
    var isES = (lang === 'es');

    /* ── hreflang tags ─────────────────────────────── */
    (function () {
      var path = window.location.pathname;
      var enPath, esPath;
      if (path.indexOf('/pages/es/') !== -1) {
        esPath = path;
        enPath = path.replace('/pages/es/', '/pages/');
      } else if (path.indexOf('/es/index') !== -1 || path.indexOf('/es/') !== -1) {
        esPath = path;
        enPath = '/index.html';
      } else if (path.indexOf('/pages/') !== -1) {
        enPath = path;
        esPath = path.replace('/pages/', '/pages/es/');
      } else {
        enPath = '/index.html';
        esPath = '/es/index.html';
      }
      function addLink(rel, hl, href) {
        var l = document.createElement('link');
        l.rel = rel; l.hreflang = hl; l.href = href;
        document.head.appendChild(l);
      }
      addLink('alternate', 'en', enPath);
      addLink('alternate', 'es', esPath);
      addLink('alternate', 'x-default', enPath);
    })();

    /* ── Toggle href ───────────────────────────────── */
    function toggleHref() {
      var path = window.location.pathname;
      if (isES) {
        if (path.indexOf('/pages/es/') !== -1) return path.replace('/pages/es/', '/pages/');
        return '/index.html';
      } else {
        if (path.indexOf('/pages/') !== -1 && path.indexOf('/es/') === -1)
          return path.replace('/pages/', '/pages/es/');
        return root + 'es/index.html';
      }
    }

    /* ── Labels ────────────────────────────────────── */
    var L = isES ? {
      home: 'Inicio', services: 'Servicios', analytics: 'Analítica',
      products: 'Productos', about: 'Nosotros', contact: 'Contacto', cta: 'Comenzar',
      svc1:'Estrategia TI y Planificación', svc2:'Soluciones en la Nube',
      svc3:'Ciberseguridad y Cumplimiento', svc4:'Transformación Digital',
      svc5:'Telecom y Conectividad', svc6:'Eficiencia Operacional',
      ana1:'Estrategia de Datos', ana2:'Analítica Avanzada e IA',
      ana3:'Visualización de Datos', ana4:'Analítica Operacional',
      pro1:'Verificación Zelle', pro2:'Portal IXM', pro3:'Cumplimiento WhatsApp',
      mobSvc:'Servicios', mobAna:'Analítica', mobPro:'Productos',
      ftSvc:'Servicios', ftPro:'Productos', ftCo:'Empresa',
      ftDesc:'Consultoría tecnológica empresarial del ecosistema CobraNext. Alineamos inversiones tecnológicas con objetivos de negocio para impulsar crecimiento, eficiencia y seguridad.',
      ftSvc1:'Estrategia TI y Planificación', ftSvc2:'Soluciones en la Nube',
      ftSvc3:'Ciberseguridad y Cumplimiento', ftSvc4:'Transformación Digital',
      ftSvc5:'Telecom y Conectividad', ftSvc6:'Analítica Empresarial',
      ftPro1:'ISV Verificación Zelle', ftPro2:'Portal IXM (Beta)',
      ftPro3:'API WhatsApp Business', ftPro4:'Programa de Socios', ftPro5:'Licencias ISV',
      ftCo1:'Acerca de Global MFT', ftCo2:'Contáctenos',
      ftCo3:'Términos y Condiciones', ftCo4:'Política de Privacidad', ftCo5:'CobraNext ↗',
      ftLegal1:'Términos', ftLegal2:'Privacidad', ftLegal3:'Cumplimiento',
      announce:'Sitio de Referencia Institucional', announceSub:'Dominio principal pendiente:',
      tagline:'Marketing · Finanzas · Telecom', toggleOther:'EN'
    } : {
      home: 'Home', services: 'Services', analytics: 'Analytics',
      products: 'Products', about: 'About', contact: 'Contact', cta: 'Get Started',
      svc1:'IT Strategy &amp; Planning', svc2:'Cloud Solutions',
      svc3:'Cybersecurity &amp; Compliance', svc4:'Digital Transformation',
      svc5:'Telecom &amp; Connectivity', svc6:'Operational Efficiency',
      ana1:'Data Strategy', ana2:'Advanced Analytics &amp; AI',
      ana3:'Data Visualization', ana4:'Operational Analytics',
      pro1:'Zelle Verification', pro2:'IXM Portal', pro3:'WhatsApp Compliance',
      mobSvc:'Services', mobAna:'Analytics', mobPro:'Products',
      ftSvc:'Services', ftPro:'Products', ftCo:'Company',
      ftDesc:'Business technology consulting under the CobraNext umbrella. Aligning technology investments with business goals to drive growth, efficiency, and security.',
      ftSvc1:'IT Strategy &amp; Planning', ftSvc2:'Cloud Solutions',
      ftSvc3:'Cybersecurity &amp; Compliance', ftSvc4:'Digital Transformation',
      ftSvc5:'Telecom &amp; Connectivity', ftSvc6:'Business Analytics',
      ftPro1:'Zelle Verification ISV', ftPro2:'IXM Portal (Beta)',
      ftPro3:'WhatsApp Business API', ftPro4:'Partner Program', ftPro5:'ISV Licensing',
      ftCo1:'About Global MFT', ftCo2:'Contact Us',
      ftCo3:'Terms &amp; Conditions', ftCo4:'Privacy Policy', ftCo5:'CobraNext ↗',
      ftLegal1:'Terms', ftLegal2:'Privacy', ftLegal3:'Compliance',
      announce:'Official Reference Site', announceSub:'Primary domain pending:',
      tagline:'Marketing · Finance · Telecom', toggleOther:'ES'
    };

    /* ── Page paths ────────────────────────────────── */
    var p;
    if (isES) {
      p = {
        home:      root + 'es/index.html',
        services:  root + 'pages/es/services.html',
        analytics: root + 'pages/es/analytics.html',
        products:  root + 'pages/es/products.html',
        about:     root + 'pages/es/about.html',
        contact:   root + 'pages/es/contact.html',
        terms:     root + 'pages/es/terms.html',
      };
    } else {
      p = {
        home:      root + 'index.html',
        services:  root + 'pages/services.html',
        analytics: root + 'pages/analytics.html',
        products:  root + 'pages/products.html',
        about:     root + 'pages/about.html',
        contact:   root + 'pages/contact.html',
        terms:     root + 'pages/terms.html',
      };
    }

    /* ── Lang toggle pill HTML ─────────────────────── */
    var togglePill = '<a href="' + toggleHref() + '" class="lang-toggle" title="' + (isES ? 'Switch to English' : 'Cambiar a Español') + '">' +
      '<span>' + (isES ? '🇪🇸' : '🇺🇸') + '</span>' +
      '<span class="lang-toggle-label">' + L.toggleOther + '</span>' +
    '</a>';

    /* ── Announce ──────────────────────────────────── */
    var announce = '<div class="announce-bar">' +
      '<span>🌐</span><span><strong>' + L.announce + '</strong> — globalmft.cobranext.com &nbsp;|&nbsp; ' +
      L.announceSub + ' <strong>globalmft.us</strong></span>' +
      '<span class="announce-close">✕</span></div>';

    /* ── Header ────────────────────────────────────── */
    var chevron = '<svg width="11" height="11" viewBox="0 0 11 11" fill="none"><path d="M2 4l3.5 3.5L9 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var arrowR  = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';

    var header =
      '<header class="site-header" id="site-header">' +
        '<div class="header-inner">' +
          '<a href="' + p.home + '" class="logo">' +
            '<img src="' + root + 'assets/favicon.png" alt="Global MFT">' +
            '<div class="logo-text-wrap">' +
              '<span class="logo-name">Global <span>MFT</span></span>' +
              '<span class="logo-tagline">' + L.tagline + '</span>' +
            '</div>' +
          '</a>' +
          '<nav class="main-nav">' +
            '<div class="nav-item"><a href="' + p.home + '" class="nav-link">' + L.home + '</a></div>' +
            '<div class="nav-item">' +
              '<a class="nav-link" href="' + p.services + '">' + L.services + chevron + '</a>' +
              '<div class="dropdown">' +
                '<a href="' + p.services + '#strategy">' + L.svc1 + '</a>' +
                '<a href="' + p.services + '#cloud">'    + L.svc2 + '</a>' +
                '<a href="' + p.services + '#security">' + L.svc3 + '</a>' +
                '<a href="' + p.services + '#digital">'  + L.svc4 + '</a>' +
                '<a href="' + p.services + '#telecom">'  + L.svc5 + '</a>' +
                '<a href="' + p.services + '#ops">'      + L.svc6 + '</a>' +
              '</div>' +
            '</div>' +
            '<div class="nav-item">' +
              '<a class="nav-link" href="' + p.analytics + '">' + L.analytics + chevron + '</a>' +
              '<div class="dropdown">' +
                '<a href="' + p.analytics + '#strategy">'      + L.ana1 + '</a>' +
                '<a href="' + p.analytics + '#ai">'            + L.ana2 + '</a>' +
                '<a href="' + p.analytics + '#visualization">' + L.ana3 + '</a>' +
                '<a href="' + p.analytics + '#operational">'   + L.ana4 + '</a>' +
              '</div>' +
            '</div>' +
            '<div class="nav-item">' +
              '<a class="nav-link" href="' + p.products + '">' + L.products + chevron + '</a>' +
              '<div class="dropdown">' +
                '<a href="' + p.products + '#zelle">'    + L.pro1 + '</a>' +
                '<a href="' + p.products + '#ixm">'      + L.pro2 + '</a>' +
                '<a href="' + p.products + '#whatsapp">' + L.pro3 + '</a>' +
              '</div>' +
            '</div>' +
            '<div class="nav-item"><a href="' + p.about   + '" class="nav-link">' + L.about   + '</a></div>' +
          '</nav>' +
          '<div class="header-cta">' +
            togglePill +
            '<a href="' + p.contact + '" class="btn btn-primary" style="font-size:12px;padding:10px 22px;">' + L.cta + arrowR + '</a>' +
          '</div>' +
          '<div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>' +
        '</div>' +
      '</header>' +
      '<div class="mobile-menu" id="mobile-menu">' +
        '<a href="' + p.home + '">' + L.home + '</a>' +
        '<div class="mob-section">' + L.mobSvc + '</div>' +
        '<a href="' + p.services + '">→ ' + L.svc1 + '</a>' +
        '<a href="' + p.services + '">→ ' + L.svc2 + '</a>' +
        '<a href="' + p.services + '">→ ' + L.svc3 + '</a>' +
        '<a href="' + p.services + '">→ ' + L.svc4 + '</a>' +
        '<a href="' + p.services + '">→ ' + L.svc5 + '</a>' +
        '<div class="mob-section">' + L.mobAna + '</div>' +
        '<a href="' + p.analytics + '">→ ' + L.ana1 + '</a>' +
        '<a href="' + p.analytics + '">→ ' + L.ana2 + '</a>' +
        '<a href="' + p.analytics + '">→ ' + L.ana3 + '</a>' +
        '<div class="mob-section">' + L.mobPro + '</div>' +
        '<a href="' + p.products + '">→ ' + L.pro1 + '</a>' +
        '<a href="' + p.products + '">→ ' + L.pro2 + '</a>' +
        '<a href="' + p.about   + '">' + L.about + '</a>' +
        '<a href="' + p.contact + '">' + L.contact + '</a>' +
        '<a href="' + p.terms   + '">Terms / Términos</a>' +
        '<div style="padding:16px 0 4px;">' + togglePill + '</div>' +
      '</div>';

    /* ── Footer ────────────────────────────────────── */
    var footer =
      '<div class="divider"></div>' +
      '<footer class="site-footer">' +
        '<div class="container">' +
          '<div class="footer-grid">' +
            '<div class="footer-brand">' +
              '<a href="' + p.home + '" class="logo">' +
                '<img src="' + root + 'assets/favicon.png" alt="Global MFT" style="width:38px;height:38px;">' +
                '<div class="logo-text-wrap">' +
                  '<span class="logo-name">Global <span>MFT</span></span>' +
                  '<span class="logo-tagline">' + L.tagline + '</span>' +
                '</div>' +
              '</a>' +
              '<p>' + L.ftDesc + '</p>' +
            '</div>' +
            '<div class="footer-col"><h5>' + L.ftSvc + '</h5>' +
              '<a href="' + p.services  + '">' + L.ftSvc1 + '</a>' +
              '<a href="' + p.services  + '">' + L.ftSvc2 + '</a>' +
              '<a href="' + p.services  + '">' + L.ftSvc3 + '</a>' +
              '<a href="' + p.services  + '">' + L.ftSvc4 + '</a>' +
              '<a href="' + p.services  + '">' + L.ftSvc5 + '</a>' +
              '<a href="' + p.analytics + '">' + L.ftSvc6 + '</a>' +
            '</div>' +
            '<div class="footer-col"><h5>' + L.ftPro + '</h5>' +
              '<a href="' + p.products + '">' + L.ftPro1 + '</a>' +
              '<a href="' + p.products + '">' + L.ftPro2 + '</a>' +
              '<a href="' + p.products + '">' + L.ftPro3 + '</a>' +
              '<a href="' + p.contact  + '">' + L.ftPro4 + '</a>' +
              '<a href="' + p.contact  + '">' + L.ftPro5 + '</a>' +
            '</div>' +
            '<div class="footer-col"><h5>' + L.ftCo + '</h5>' +
              '<a href="' + p.about   + '">' + L.ftCo1 + '</a>' +
              '<a href="' + p.contact + '">' + L.ftCo2 + '</a>' +
              '<a href="' + p.terms   + '">' + L.ftCo3 + '</a>' +
              '<a href="' + p.terms   + '">' + L.ftCo4 + '</a>' +
              '<a href="https://cobranext.com" target="_blank" rel="noopener">' + L.ftCo5 + '</a>' +
            '</div>' +
          '</div>' +
          '<div class="footer-bottom">' +
            '<p>© ' + new Date().getFullYear() + ' Global MFT · A CobraNext Company · globalmft.cobranext.com</p>' +
            '<div class="footer-legal">' +
              '<a href="' + p.terms   + '">' + L.ftLegal1 + '</a>' +
              '<a href="' + p.terms   + '">' + L.ftLegal2 + '</a>' +
              '<a href="' + p.contact + '">' + L.ftLegal3 + '</a>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</footer>';

    /* ── DOM injection ─────────────────────────────── */
    var a = document.getElementById('announce-bar');
    if (a) a.outerHTML = announce;
    var h = document.getElementById('site-header-placeholder');
    if (h) h.outerHTML = header;
    var f = document.getElementById('site-footer-placeholder');
    if (f) f.outerHTML = footer;
  }

  return { inject: inject };
})();
