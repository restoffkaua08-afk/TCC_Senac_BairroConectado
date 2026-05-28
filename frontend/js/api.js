(function () {
  const API = "/api";
  const TOKEN_KEY = "bairro_token";
  const USER_KEY = "bairro_user";

  let token = localStorage.getItem(TOKEN_KEY) || "";
  let currentUser = readUser();
  let expandedOccurrenceId = null;

  function readUser() {
    try {
      return JSON.parse(localStorage.getItem(USER_KEY) || "null");
    } catch {
      return null;
    }
  }

  function saveSession(data) {
    token = data.token;
    currentUser = data.user;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
  }

  function logout() {
    token = "";
    currentUser = null;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    location.reload();
  }

  async function api(path, options = {}) {
    const headers = {
      "Content-Type": "application/json",
      ...(options.headers || {})
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(API + path, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "Erro ao comunicar com a API.");
    }

    return data;
  }

  function injectStyle() {
    if (document.querySelector("#bc-style")) return;

    const css = document.createElement("style");
    css.id = "bc-style";
    css.textContent = `
      :root{
        --bc-bg:#f4f7fb;
        --bc-surface:#ffffff;
        --bc-text:#0f172a;
        --bc-muted:#64748b;
        --bc-line:#e2e8f0;
        --bc-dark:#0f172a;
        --bc-blue:#2563eb;
        --bc-green:#16a34a;
        --bc-red:#dc2626;
        --bc-yellow:#ca8a04;
        --bc-shadow:0 18px 55px rgba(15,23,42,.10);
      }

      body{
        background:var(--bc-bg);
      }

      .bc-topbar{
        position:sticky;
        top:0;
        z-index:9000;
        min-height:72px;
        display:flex;
        align-items:center;
        gap:18px;
        padding:12px clamp(16px,4vw,56px);
        background:rgba(255,255,255,.88);
        border-bottom:1px solid var(--bc-line);
        backdrop-filter:blur(14px);
        font-family:Inter,Arial,sans-serif;
      }

      .bc-menu-trigger{
        width:44px;
        height:44px;
        border:0;
        border-radius:14px;
        background:var(--bc-dark);
        color:#fff;
        font-size:22px;
        font-weight:900;
        cursor:pointer;
        box-shadow:0 12px 32px rgba(15,23,42,.22);
      }

      .bc-brand{
        display:flex;
        flex-direction:column;
        line-height:1.1;
        color:var(--bc-text);
        text-decoration:none;
      }

      .bc-brand strong{
        font-size:18px;
      }

      .bc-brand span{
        color:var(--bc-muted);
        font-size:12px;
        font-weight:700;
      }

      .bc-topnav{
        margin-left:auto;
        display:flex;
        gap:10px;
        align-items:center;
      }

      .bc-topnav a,
      .bc-topnav button{
        border:0;
        border-radius:999px;
        padding:10px 14px;
        background:#eef2ff;
        color:#1e293b;
        font-weight:800;
        text-decoration:none;
        cursor:pointer;
      }

      .bc-sidebar-bg{
        position:fixed;
        inset:0;
        z-index:99970;
        background:rgba(15,23,42,.48);
        opacity:0;
        pointer-events:none;
        transition:.22s ease;
      }

      .bc-sidebar-bg.open{
        opacity:1;
        pointer-events:auto;
      }

      .bc-sidebar{
        position:fixed;
        top:0;
        left:0;
        width:min(360px,92vw);
        height:100vh;
        z-index:99980;
        transform:translateX(-110%);
        transition:.25s ease;
        background:#fff;
        color:var(--bc-text);
        box-shadow:18px 0 60px rgba(15,23,42,.22);
        padding:24px;
        font-family:Inter,Arial,sans-serif;
        box-sizing:border-box;
      }

      .bc-sidebar.open{
        transform:translateX(0);
      }

      .bc-sidebar-head{
        display:flex;
        gap:14px;
        align-items:center;
        padding-bottom:18px;
        border-bottom:1px solid var(--bc-line);
      }

      .bc-avatar{
        width:56px;
        height:56px;
        border-radius:18px;
        object-fit:cover;
        background:#e2e8f0;
        display:grid;
        place-items:center;
        font-weight:900;
        color:#334155;
      }

      .bc-sidebar-head h3{
        margin:0;
        font-size:18px;
      }

      .bc-sidebar-head p{
        margin:4px 0 0;
        color:var(--bc-muted);
        font-size:13px;
      }

      .bc-sidebar nav{
        display:grid;
        gap:10px;
        margin-top:22px;
      }

      .bc-sidebar nav a,
      .bc-sidebar nav button{
        width:100%;
        border:0;
        border-radius:16px;
        padding:14px 15px;
        background:#f8fafc;
        color:var(--bc-text);
        font-weight:900;
        text-align:left;
        text-decoration:none;
        cursor:pointer;
        box-sizing:border-box;
      }

      .bc-sidebar nav a:hover,
      .bc-sidebar nav button:hover{
        background:#e0f2fe;
      }

      .bc-close-menu{
        position:absolute;
        top:16px;
        right:16px;
        border:0;
        background:#f1f5f9;
        color:var(--bc-text);
        width:36px;
        height:36px;
        border-radius:12px;
        cursor:pointer;
        font-size:18px;
      }

      .bc-shell{
        width:min(1180px,calc(100% - 32px));
        margin:34px auto 70px;
        font-family:Inter,Arial,sans-serif;
        color:var(--bc-text);
      }

      .bc-page-hero{
        display:grid;
        gap:10px;
        padding:30px;
        border-radius:30px;
        background:linear-gradient(135deg,#0f172a,#1d4ed8);
        color:#fff;
        box-shadow:var(--bc-shadow);
        margin-bottom:22px;
      }

      .bc-page-hero h1{
        margin:0;
        font-size:clamp(30px,5vw,54px);
        line-height:1;
      }

      .bc-page-hero p{
        color:#dbeafe;
        max-width:760px;
        margin:0;
        font-size:17px;
      }

      .bc-section{
        background:var(--bc-surface);
        border:1px solid var(--bc-line);
        border-radius:26px;
        padding:22px;
        box-shadow:var(--bc-shadow);
        margin-bottom:22px;
      }

      .bc-section-title{
        display:flex;
        align-items:flex-end;
        justify-content:space-between;
        gap:14px;
        margin-bottom:16px;
      }

      .bc-section-title h2{
        margin:0;
        font-size:24px;
      }

      .bc-section-title p{
        margin:5px 0 0;
        color:var(--bc-muted);
      }

      .bc-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
        gap:18px;
      }

      .bc-card{
        background:#fff;
        border:1px solid var(--bc-line);
        border-radius:22px;
        overflow:hidden;
        box-shadow:0 10px 35px rgba(15,23,42,.07);
      }

      .bc-card-img{
        width:100%;
        height:190px;
        object-fit:cover;
        display:block;
        background:#e2e8f0;
      }

      .bc-card-body{
        padding:18px;
      }

      .bc-card h3{
        margin:0 0 8px;
        font-size:20px;
      }

      .bc-card p{
        color:var(--bc-muted);
        margin:8px 0;
      }

      .bc-card.expanded{
        outline:3px solid rgba(37,99,235,.25);
        box-shadow:0 18px 60px rgba(37,99,235,.18);
      }

      .bc-details{
        display:none;
        border-top:1px solid var(--bc-line);
        margin-top:14px;
        padding-top:14px;
      }

      .bc-card.expanded .bc-details{
        display:block;
      }

      .bc-rank-list{
        display:grid;
        gap:10px;
      }

      .bc-rank-item{
        width:100%;
        border:1px solid var(--bc-line);
        background:#f8fafc;
        border-radius:18px;
        padding:14px;
        cursor:pointer;
        display:grid;
        grid-template-columns:auto 1fr auto;
        gap:12px;
        align-items:center;
        text-align:left;
      }

      .bc-rank-index{
        width:38px;
        height:38px;
        border-radius:14px;
        background:#0f172a;
        color:#fff;
        display:grid;
        place-items:center;
        font-weight:900;
      }

      .bc-rank-item strong{
        display:block;
        margin-bottom:4px;
      }

      .bc-rank-item small{
        color:var(--bc-muted);
      }

      .bc-badge{
        display:inline-flex;
        align-items:center;
        width:max-content;
        border-radius:999px;
        padding:6px 10px;
        font-size:12px;
        font-weight:900;
        text-transform:uppercase;
        background:#f1f5f9;
        color:#334155;
        margin:3px 4px 3px 0;
      }

      .bc-badge.urgente{background:#fee2e2;color:#991b1b}
      .bc-badge.alta{background:#ffedd5;color:#9a3412}
      .bc-badge.media{background:#fef3c7;color:#92400e}
      .bc-badge.baixa{background:#dcfce7;color:#166534}

      .bc-actions{
        display:flex;
        flex-wrap:wrap;
        gap:8px;
        margin-top:13px;
      }

      .bc-btn{
        border:0;
        border-radius:14px;
        padding:12px 15px;
        background:#0f172a;
        color:#fff;
        font-weight:900;
        cursor:pointer;
        text-decoration:none;
        display:inline-flex;
        align-items:center;
        justify-content:center;
        gap:8px;
      }

      .bc-btn:hover{
        filter:brightness(1.05);
      }

      .bc-btn-light{
        background:#f1f5f9;
        color:#0f172a;
      }

      .bc-btn-blue{
        background:#2563eb;
      }

      .bc-btn-green{
        background:#16a34a;
      }

      .bc-btn-red{
        background:#dc2626;
      }

      .bc-full{
        width:100%;
      }

      .bc-form-grid{
        display:grid;
        grid-template-columns:repeat(auto-fit,minmax(240px,1fr));
        gap:14px;
      }

      .bc-field{
        display:grid;
        gap:7px;
        margin-bottom:14px;
      }

      .bc-field label{
        font-size:14px;
        font-weight:900;
      }

      .bc-field input,
      .bc-field textarea,
      .bc-field select{
        width:100%;
        box-sizing:border-box;
        border:1px solid var(--bc-line);
        border-radius:16px;
        padding:13px 14px;
        font:inherit;
        background:#fff;
        color:var(--bc-text);
        outline:none;
      }

      .bc-field textarea{
        min-height:120px;
        resize:vertical;
      }

      .bc-field input:focus,
      .bc-field textarea:focus,
      .bc-field select:focus{
        border-color:#2563eb;
        box-shadow:0 0 0 4px rgba(37,99,235,.12);
      }

      .bc-preview{
        width:100%;
        max-height:260px;
        object-fit:cover;
        border-radius:20px;
        border:1px solid var(--bc-line);
        background:#f8fafc;
        display:none;
      }

      .bc-profile-layout{
        display:grid;
        grid-template-columns:minmax(240px,330px) 1fr;
        gap:22px;
      }

      .bc-profile-card{
        text-align:center;
      }

      .bc-profile-photo{
        width:160px;
        height:160px;
        border-radius:36px;
        object-fit:cover;
        background:#e2e8f0;
        margin:0 auto 14px;
        display:grid;
        place-items:center;
        font-size:48px;
        font-weight:900;
        color:#334155;
      }

      .bc-toast-area{
        position:fixed;
        right:18px;
        bottom:18px;
        z-index:100000;
        display:grid;
        gap:10px;
      }

      .bc-toast{
        max-width:360px;
        padding:13px 15px;
        border-radius:16px;
        background:#0f172a;
        color:#fff;
        box-shadow:0 18px 45px rgba(15,23,42,.25);
        font:800 14px Inter,Arial,sans-serif;
      }

      .bc-toast.error{
        background:#991b1b;
      }

      .bc-modal-bg{
        position:fixed;
        inset:0;
        z-index:99990;
        background:rgba(15,23,42,.65);
        backdrop-filter:blur(10px);
        display:flex;
        align-items:center;
        justify-content:center;
        padding:20px;
      }

      .bc-modal{
        width:min(460px,100%);
        border-radius:28px;
        background:#fff;
        color:var(--bc-text);
        box-shadow:0 24px 80px rgba(15,23,42,.32);
        padding:24px;
        font-family:Inter,Arial,sans-serif;
      }

      .bc-modal h2{
        margin:0 0 16px;
      }

      @media(max-width:760px){
        .bc-topnav{
          display:none;
        }

        .bc-profile-layout{
          grid-template-columns:1fr;
        }

        .bc-rank-item{
          grid-template-columns:auto 1fr;
        }

        .bc-rank-item > .bc-badge{
          grid-column:1 / -1;
        }
      }
    `;
    document.head.appendChild(css);
  }

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#039;"
    }[char]));
  }

  function firstLetter(name) {
    return String(name || "U").trim().charAt(0).toUpperCase() || "U";
  }

  function toast(message, type = "success") {
    injectStyle();

    let area = document.querySelector(".bc-toast-area");

    if (!area) {
      area = document.createElement("div");
      area.className = "bc-toast-area";
      document.body.appendChild(area);
    }

    const item = document.createElement("div");
    item.className = `bc-toast ${type}`;
    item.textContent = message;
    area.appendChild(item);

    setTimeout(() => item.remove(), 3600);
  }

  async function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      if (!file) {
        resolve("");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(new Error("Erro ao ler a imagem."));
      reader.readAsDataURL(file);
    });
  }

  function badge(priority) {
    const value = priority || "media";
    const label = value === "media" ? "média" : value;
    return `<span class="bc-badge ${value}">${label}</span>`;
  }

  function ensureTopbar() {
    injectStyle();

    if (document.querySelector(".bc-topbar")) {
      const oldButton = document.querySelector(".bc-menu-trigger");
      if (oldButton) oldButton.onclick = openSidebar;
      return;
    }

    const topbar = document.createElement("header");
    topbar.className = "bc-topbar";
    topbar.innerHTML = `
      <button class="bc-menu-trigger" type="button" aria-label="Abrir menu">☰</button>
      <a class="bc-brand" href="/">
        <strong>Bairro Conectado</strong>
        <span>Portal comunitário inteligente</span>
      </a>
      <nav class="bc-topnav">
        <a href="/">Início</a>
        <a href="/ocorrencias.html">Ocorrências</a>
        <a href="/perfil.html">Perfil</a>
        <button type="button" data-auth-trigger>${currentUser ? "Minha conta" : "Acessar comunidade"}</button>
      </nav>
    `;

    document.body.prepend(topbar);

    topbar.querySelector(".bc-menu-trigger").onclick = openSidebar;
    topbar.querySelector("[data-auth-trigger]").onclick = (event) => {
      event.preventDefault();
      currentUser ? openSidebar() : openAuth("login");
    };
  }

  function syncAuthTriggers() {
    const triggers = Array.from(document.querySelectorAll("[data-auth-trigger]"));

    for (const trigger of triggers) {
      trigger.textContent = currentUser ? "Minha conta" : "Acessar comunidade";
      trigger.onclick = (event) => {
        event.preventDefault();
        currentUser ? openSidebar() : openAuth("login");
      };
    }

    const links = Array.from(document.querySelectorAll("a,button"));

    for (const item of links) {
      const text = String(item.textContent || "").trim().toLowerCase();

      if (text.includes("ocorrência") || text.includes("ocorrencias")) {
        if (item.tagName.toLowerCase() === "a") item.setAttribute("href", "/ocorrencias.html");
      }

      if (text.includes("perfil")) {
        if (item.tagName.toLowerCase() === "a") item.setAttribute("href", "/perfil.html");
      }
    }
  }

  function ensureSidebar() {
    injectStyle();

    if (document.querySelector(".bc-sidebar")) return;

    const bg = document.createElement("div");
    bg.className = "bc-sidebar-bg";

    const sidebar = document.createElement("aside");
    sidebar.className = "bc-sidebar";

    document.body.appendChild(bg);
    document.body.appendChild(sidebar);

    bg.onclick = closeSidebar;
  }

  function openSidebar() {
    ensureSidebar();

    const bg = document.querySelector(".bc-sidebar-bg");
    const sidebar = document.querySelector(".bc-sidebar");

    const avatar = currentUser && currentUser.foto
      ? `<img class="bc-avatar" src="${escapeHtml(currentUser.foto)}" alt="Foto do usuário">`
      : `<div class="bc-avatar">${firstLetter(currentUser && currentUser.nome)}</div>`;

    sidebar.innerHTML = `
      <button class="bc-close-menu" type="button">×</button>

      <div class="bc-sidebar-head">
        ${avatar}
        <div>
          <h3>${currentUser ? escapeHtml(currentUser.nome) : "Visitante"}</h3>
          <p>${currentUser ? escapeHtml(currentUser.email) : "Entre para acessar tudo"}</p>
        </div>
      </div>

      <nav>
        <a href="/">Início</a>
        <a href="/ocorrencias.html">Ocorrências e votação</a>
        <a href="/perfil.html">Perfil do cidadão</a>
        ${currentUser ? `<button type="button" id="bc-logout">Sair da conta</button>` : `<button type="button" id="bc-login-sidebar">Entrar / cadastrar</button>`}
      </nav>
    `;

    sidebar.querySelector(".bc-close-menu").onclick = closeSidebar;

    const logoutBtn = sidebar.querySelector("#bc-logout");
    if (logoutBtn) logoutBtn.onclick = logout;

    const loginBtn = sidebar.querySelector("#bc-login-sidebar");
    if (loginBtn) loginBtn.onclick = () => {
      closeSidebar();
      openAuth("login");
    };

    bg.classList.add("open");
    sidebar.classList.add("open");
  }

  function closeSidebar() {
    const bg = document.querySelector(".bc-sidebar-bg");
    const sidebar = document.querySelector(".bc-sidebar");

    if (bg) bg.classList.remove("open");
    if (sidebar) sidebar.classList.remove("open");
  }

  function openAuth(mode = "login") {
    injectStyle();

    const existing = document.querySelector(".bc-modal-bg");
    if (existing) existing.remove();

    const register = mode === "register";
    const bg = document.createElement("div");
    bg.className = "bc-modal-bg";

    bg.innerHTML = `
      <div class="bc-modal">
        <h2>${register ? "Criar conta" : "Entrar na comunidade"}</h2>

        <form id="bc-auth-form">
          ${register ? `<div class="bc-field"><label>Nome</label><input name="nome" required></div>` : ""}
          <div class="bc-field"><label>Email</label><input name="email" type="email" required></div>
          <div class="bc-field"><label>Senha</label><input name="senha" type="password" minlength="6" required></div>
          <button class="bc-btn bc-full" type="submit">${register ? "Cadastrar" : "Entrar"}</button>
        </form>

        <div class="bc-actions">
          <button class="bc-btn bc-btn-light" id="bc-switch" type="button">${register ? "Já tenho conta" : "Criar conta"}</button>
          <button class="bc-btn bc-btn-light" id="bc-close" type="button">Fechar</button>
        </div>
      </div>
    `;

    document.body.appendChild(bg);

    bg.querySelector("#bc-close").onclick = () => bg.remove();

    bg.querySelector("#bc-switch").onclick = () => {
      bg.remove();
      openAuth(register ? "login" : "register");
    };

    bg.querySelector("#bc-auth-form").onsubmit = async (event) => {
      event.preventDefault();

      try {
        const body = Object.fromEntries(new FormData(event.target).entries());
        const data = await api(register ? "/auth/register" : "/auth/login", {
          method: "POST",
          body: JSON.stringify(body)
        });

        saveSession(data);
        bg.remove();
        syncAuthTriggers();
        toast(register ? "Cadastro realizado." : "Login realizado.");

        if (location.pathname.includes("ocorrencias")) renderOccurrencesPage();
        if (location.pathname.includes("perfil")) renderProfilePage();
      } catch (err) {
        toast(err.message, "error");
      }
    };
  }

  function pageRoot(type) {
    let root = document.querySelector(type === "perfil" ? "[data-profile-root]" : "[data-ocorrencias-root]");

    if (!root) {
      root = document.createElement("main");
      document.body.appendChild(root);
    }

    root.classList.add("bc-shell");
    return root;
  }

  async function renderProfilePage() {
    if (!location.pathname.includes("perfil")) return;

    const root = pageRoot("perfil");

    if (!token) {
      root.innerHTML = `
        <section class="bc-page-hero">
          <h1>Perfil do cidadão</h1>
          <p>Entre na sua conta para editar nome, telefone, endereço e foto de perfil.</p>
        </section>

        <section class="bc-section">
          <button class="bc-btn bc-btn-blue" id="login-profile">Entrar na comunidade</button>
        </section>
      `;

      root.querySelector("#login-profile").onclick = () => openAuth("login");
      return;
    }

    try {
      const data = await api("/auth/profile");
      currentUser = data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

      const avatar = currentUser.foto
        ? `<img class="bc-profile-photo" src="${escapeHtml(currentUser.foto)}" alt="Foto do perfil">`
        : `<div class="bc-profile-photo">${firstLetter(currentUser.nome)}</div>`;

      root.innerHTML = `
        <section class="bc-page-hero">
          <h1>Perfil do cidadão</h1>
          <p>Gerencie seus dados para identificação dentro da comunidade.</p>
        </section>

        <section class="bc-profile-layout">
          <div class="bc-section bc-profile-card">
            ${avatar}
            <h2>${escapeHtml(currentUser.nome)}</h2>
            <p>${escapeHtml(currentUser.email)}</p>
            <span class="bc-badge">Morador cadastrado</span>
          </div>

          <div class="bc-section">
            <div class="bc-section-title">
              <div>
                <h2>Dados pessoais</h2>
                <p>Atualize suas informações e sua foto de perfil.</p>
              </div>
            </div>

            <form id="profile-form">
              <div class="bc-form-grid">
                <div class="bc-field">
                  <label>Nome</label>
                  <input name="nome" value="${escapeHtml(currentUser.nome)}" required>
                </div>

                <div class="bc-field">
                  <label>Email</label>
                  <input value="${escapeHtml(currentUser.email)}" disabled>
                </div>

                <div class="bc-field">
                  <label>Telefone</label>
                  <input name="telefone" value="${escapeHtml(currentUser.telefone)}" placeholder="(00) 00000-0000">
                </div>

                <div class="bc-field">
                  <label>Endereço</label>
                  <input name="endereco" value="${escapeHtml(currentUser.endereco)}" placeholder="Rua, número, bairro">
                </div>
              </div>

              <div class="bc-field">
                <label>Foto de perfil</label>
                <input id="profile-photo-file" type="file" accept="image/*">
                <input id="profile-photo-value" name="foto" type="hidden" value="${escapeHtml(currentUser.foto)}">
              </div>

              <img id="profile-preview" class="bc-preview" src="${escapeHtml(currentUser.foto)}" alt="Prévia da foto" style="${currentUser.foto ? "display:block" : ""}">

              <div class="bc-actions">
                <button class="bc-btn bc-btn-blue" type="submit">Salvar perfil</button>
                <button class="bc-btn bc-btn-light" type="button" id="remove-profile-photo">Remover foto</button>
              </div>
            </form>
          </div>
        </section>
      `;

      const fileInput = root.querySelector("#profile-photo-file");
      const photoValue = root.querySelector("#profile-photo-value");
      const preview = root.querySelector("#profile-preview");

      fileInput.onchange = async () => {
        const file = fileInput.files && fileInput.files[0];

        if (!file) return;

        const base64 = await fileToBase64(file);
        photoValue.value = base64;
        preview.src = base64;
        preview.style.display = "block";
      };

      root.querySelector("#remove-profile-photo").onclick = () => {
        photoValue.value = "";
        preview.removeAttribute("src");
        preview.style.display = "none";
      };

      root.querySelector("#profile-form").onsubmit = async (event) => {
        event.preventDefault();

        try {
          const body = Object.fromEntries(new FormData(event.target).entries());
          const updated = await api("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(body)
          });

          currentUser = updated.user;
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          toast("Perfil atualizado.");
          renderProfilePage();
        } catch (err) {
          toast(err.message, "error");
        }
      };
    } catch (err) {
      toast(err.message, "error");
    }
  }

  async function renderOccurrencesPage() {
    if (!location.pathname.includes("ocorrencias")) return;

    const root = pageRoot("ocorrencias");

    root.innerHTML = `
      <section class="bc-page-hero">
        <h1>Ocorrências do bairro</h1>
        <p>Veja o ranking das demandas mais críticas, vote na prioridade e cadastre novas ocorrências com foto obrigatória.</p>
      </section>

      <section class="bc-section">
        <div class="bc-section-title">
          <div>
            <h2>Ranking de prioridade</h2>
            <p>Clique em uma ocorrência da lista para descer até o card completo.</p>
          </div>
        </div>
        <div id="ranking-list" class="bc-rank-list"></div>
      </section>

      <section class="bc-section">
        <div class="bc-section-title">
          <div>
            <h2>Ocorrências cadastradas</h2>
            <p>Clique no card para abrir foto, informações e botões de votação.</p>
          </div>
        </div>
        <div id="occurrence-list" class="bc-grid"></div>
      </section>

      <section class="bc-section">
        <div class="bc-section-title">
          <div>
            <h2>Cadastrar nova ocorrência</h2>
            <p>O cadastro fica abaixo do ranking e da área de votação. Toda ocorrência precisa de pelo menos uma foto.</p>
          </div>
        </div>

        ${
          token
            ? `
              <form id="occurrence-form">
                <div class="bc-form-grid">
                  <div class="bc-field">
                    <label>Título</label>
                    <input name="titulo" required placeholder="Ex: Buraco na rua">
                  </div>

                  <div class="bc-field">
                    <label>Categoria</label>
                    <input name="categoria" placeholder="Infraestrutura, iluminação, limpeza...">
                  </div>

                  <div class="bc-field">
                    <label>Bairro</label>
                    <input name="bairro" placeholder="Nome do bairro">
                  </div>

                  <div class="bc-field">
                    <label>Endereço</label>
                    <input name="endereco" placeholder="Rua, número ou referência">
                  </div>

                  <div class="bc-field">
                    <label>Prioridade inicial</label>
                    <select name="prioridade">
                      <option value="baixa">Baixa</option>
                      <option value="media" selected>Média</option>
                      <option value="alta">Alta</option>
                      <option value="urgente">Urgente</option>
                    </select>
                  </div>

                  <div class="bc-field">
                    <label>Foto da ocorrência</label>
                    <input id="occurrence-photo-file" type="file" accept="image/*" required>
                    <input id="occurrence-photo-value" name="foto" type="hidden" required>
                  </div>
                </div>

                <div class="bc-field">
                  <label>Descrição</label>
                  <textarea name="descricao" required placeholder="Explique o problema, impacto e localização."></textarea>
                </div>

                <img id="occurrence-preview" class="bc-preview" alt="Prévia da foto">

                <div class="bc-actions">
                  <button class="bc-btn bc-btn-green" type="submit">Cadastrar ocorrência</button>
                </div>
              </form>
            `
            : `
              <p>Faça login para cadastrar uma ocorrência.</p>
              <button class="bc-btn bc-btn-blue" id="login-occurrence" type="button">Entrar na comunidade</button>
            `
        }
      </section>
    `;

    const loginBtn = root.querySelector("#login-occurrence");
    if (loginBtn) loginBtn.onclick = () => openAuth("login");

    const fileInput = root.querySelector("#occurrence-photo-file");
    const photoValue = root.querySelector("#occurrence-photo-value");
    const preview = root.querySelector("#occurrence-preview");

    if (fileInput && photoValue && preview) {
      fileInput.onchange = async () => {
        const file = fileInput.files && fileInput.files[0];

        if (!file) return;

        const base64 = await fileToBase64(file);
        photoValue.value = base64;
        preview.src = base64;
        preview.style.display = "block";
      };
    }

    const form = root.querySelector("#occurrence-form");

    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();

        try {
          const body = Object.fromEntries(new FormData(event.target).entries());

          if (!body.foto) {
            toast("Adicione uma foto para cadastrar a ocorrência.", "error");
            return;
          }

          await api("/ocorrencias", {
            method: "POST",
            body: JSON.stringify(body)
          });

          toast("Ocorrência enviada para análise do administrador.");
          expandedOccurrenceId = null;
          renderOccurrencesPage();
        } catch (err) {
          toast(err.message, "error");
        }
      };
    }

    await loadOccurrences();
  }

  function renderRanking(ranking) {
    const box = document.querySelector("#ranking-list");

    if (!box) return;

    if (!ranking.length) {
      box.innerHTML = "<p>Nenhuma ocorrência no ranking ainda.</p>";
      return;
    }

    box.innerHTML = ranking.map((item, index) => `
      <button class="bc-rank-item" data-rank-id="${escapeHtml(item.id)}" type="button">
        <span class="bc-rank-index">${index + 1}</span>
        <span>
          <strong>${escapeHtml(item.titulo)}</strong>
          <small>${escapeHtml(item.bairro || "Bairro não informado")} • ${item.totalVotos} voto(s)</small>
        </span>
        ${badge(item.prioridade)}
      </button>
    `).join("");

    document.querySelectorAll("[data-rank-id]").forEach((button) => {
      button.onclick = () => focusOccurrence(button.dataset.rankId);
    });
  }

  function renderOccurrenceCards(items) {
    const list = document.querySelector("#occurrence-list");

    if (!list) return;

    if (!items.length) {
      list.innerHTML = "<p>Nenhuma ocorrência cadastrada.</p>";
      return;
    }

    list.innerHTML = items.map((item) => {
      const isOpen = expandedOccurrenceId === item.id;

      return `
        <article id="occ-${escapeHtml(item.id)}" class="bc-card ${isOpen ? "expanded" : ""}" data-occ-card="${escapeHtml(item.id)}">
          <img class="bc-card-img" src="${escapeHtml(item.foto || item.imagem)}" alt="Foto da ocorrência ${escapeHtml(item.titulo)}">

          <div class="bc-card-body">
            <h3>${escapeHtml(item.titulo)}</h3>

            <div>
              ${badge(item.prioridade)}
              <span class="bc-badge">${escapeHtml(item.status || "aberta")}</span>
              <span class="bc-badge">${item.totalVotos} voto(s)</span>
            </div>

            <p>${escapeHtml(item.descricao)}</p>

            <div class="bc-actions">
              <button class="bc-btn bc-btn-light" data-toggle="${escapeHtml(item.id)}" type="button">${isOpen ? "Fechar detalhes" : "Ver detalhes"}</button>
            </div>

            <div class="bc-details">
              <p><strong>Categoria:</strong> ${escapeHtml(item.categoria || "Geral")}</p>
              <p><strong>Bairro:</strong> ${escapeHtml(item.bairro || "Não informado")}</p>
              <p><strong>Endereço:</strong> ${escapeHtml(item.endereco || "Não informado")}</p>
              <p><strong>Cadastrado por:</strong> ${escapeHtml(item.createdByName || "Sistema")}</p>

              <h4>Votar na prioridade</h4>
              <div class="bc-actions">
                <button class="bc-btn bc-btn-light" data-vote-id="${escapeHtml(item.id)}" data-vote="baixa" type="button">Baixa</button>
                <button class="bc-btn bc-btn-light" data-vote-id="${escapeHtml(item.id)}" data-vote="media" type="button">Média</button>
                <button class="bc-btn bc-btn-light" data-vote-id="${escapeHtml(item.id)}" data-vote="alta" type="button">Alta</button>
                <button class="bc-btn bc-btn-red" data-vote-id="${escapeHtml(item.id)}" data-vote="urgente" type="button">Urgente</button>
              </div>
            </div>
          </div>
        </article>
      `;
    }).join("");

    document.querySelectorAll("[data-toggle]").forEach((button) => {
      button.onclick = (event) => {
        event.stopPropagation();
        const id = button.dataset.toggle;
        expandedOccurrenceId = expandedOccurrenceId === id ? null : id;
        loadOccurrences(true);
      };
    });

    document.querySelectorAll("[data-occ-card]").forEach((card) => {
      card.onclick = () => {
        expandedOccurrenceId = card.dataset.occCard;
        loadOccurrences(true);
      };
    });

    document.querySelectorAll("[data-vote-id]").forEach((button) => {
      button.onclick = async (event) => {
        event.stopPropagation();

        if (!token) {
          openAuth("login");
          return;
        }

        try {
          await api(`/ocorrencias/${button.dataset.voteId}/vote`, {
            method: "POST",
            body: JSON.stringify({ prioridade: button.dataset.vote })
          });

          expandedOccurrenceId = button.dataset.voteId;
          toast("Voto registrado.");
          await loadOccurrences(true);
        } catch (err) {
          toast(err.message, "error");
        }
      };
    });
  }

  async function loadOccurrences(keepScroll = false) {
    try {
      const [data, rank] = await Promise.all([
        api("/ocorrencias"),
        api("/ocorrencias/ranking")
      ]);

      renderRanking(rank.ranking || []);
      renderOccurrenceCards(data.ocorrencias || []);

      if (keepScroll && expandedOccurrenceId) {
        const card = document.querySelector(`#occ-${CSS.escape(expandedOccurrenceId)}`);
        if (card) {
          card.scrollIntoView({ behavior: "smooth", block: "center" });
        }
      }
    } catch (err) {
      const list = document.querySelector("#occurrence-list");
      const ranking = document.querySelector("#ranking-list");

      if (list) list.innerHTML = `<p>Erro ao carregar ocorrências: ${escapeHtml(err.message)}</p>`;
      if (ranking) ranking.innerHTML = `<p>Erro ao carregar ranking: ${escapeHtml(err.message)}</p>`;
    }
  }

  function focusOccurrence(id) {
    expandedOccurrenceId = id;
    loadOccurrences(true);
  }

  function boot() {
    injectStyle();
    ensureTopbar();
    ensureSidebar();
    syncAuthTriggers();
    renderProfilePage();
    renderOccurrencesPage();
  }

  window.BairroConectado = {
    api,
    openAuth,
    openSidebar,
    renderOccurrencesPage,
    renderProfilePage
  };

  document.addEventListener("DOMContentLoaded", boot);
})();

