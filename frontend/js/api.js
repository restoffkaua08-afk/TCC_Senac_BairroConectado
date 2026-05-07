(function () {
  const API = "/api";
  const TOKEN_KEY = "bairro_token";
  const USER_KEY = "bairro_user";

  let token = localStorage.getItem(TOKEN_KEY) || "";
  let currentUser = JSON.parse(localStorage.getItem(USER_KEY) || "null");

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

  function style() {
    if (document.querySelector("#bc-style")) return;

    const css = document.createElement("style");
    css.id = "bc-style";
    css.textContent = `
      .bc-float{position:fixed;top:18px;right:18px;z-index:9999;border:0;border-radius:999px;padding:12px 18px;background:#111827;color:#fff;font-weight:800;cursor:pointer;box-shadow:0 10px 30px rgba(0,0,0,.22)}
      .bc-modal-bg{position:fixed;inset:0;z-index:99999;background:rgba(15,23,42,.72);display:flex;align-items:center;justify-content:center;padding:20px}
      .bc-modal{width:min(430px,100%);background:#fff;border-radius:22px;padding:24px;color:#111827;font-family:Arial,sans-serif;box-shadow:0 20px 70px rgba(0,0,0,.35)}
      .bc-field{display:grid;gap:6px;margin-bottom:13px}
      .bc-field input,.bc-field textarea,.bc-field select{padding:12px;border:1px solid #d1d5db;border-radius:12px;font:inherit}
      .bc-field textarea{min-height:100px;resize:vertical}
      .bc-btn{border:0;border-radius:12px;padding:12px 15px;background:#111827;color:white;font-weight:800;cursor:pointer;text-decoration:none}
      .bc-btn-light{background:#f3f4f6;color:#111827}
      .bc-full{width:100%}
      .bc-shell{width:min(1120px,calc(100% - 32px));margin:40px auto;font-family:Arial,sans-serif}
      .bc-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px}
      .bc-card{background:#fff;border:1px solid #e5e7eb;border-radius:18px;padding:18px;box-shadow:0 10px 30px rgba(15,23,42,.08)}
      .bc-card p{color:#4b5563}
      .bc-actions{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}
      .bc-badge{display:inline-block;padding:5px 9px;border-radius:999px;background:#f3f4f6;font-size:12px;font-weight:800;text-transform:uppercase;margin:2px}
      .urgente{background:#fee2e2;color:#991b1b}
      .alta{background:#ffedd5;color:#9a3412}
      .media{background:#fef3c7;color:#92400e}
      .baixa{background:#dcfce7;color:#166534}
      .bc-menu{position:fixed;top:0;right:0;width:min(330px,90vw);height:100vh;background:#fff;z-index:99998;box-shadow:-12px 0 40px rgba(0,0,0,.2);padding:24px;transform:translateX(110%);transition:.2s;font-family:Arial,sans-serif}
      .bc-menu.open{transform:translateX(0)}
      .bc-menu a,.bc-menu button{display:block;width:100%;box-sizing:border-box;margin:8px 0;padding:13px;border:0;border-radius:12px;background:#f3f4f6;color:#111827;text-decoration:none;font-weight:800;text-align:left;cursor:pointer}
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

  function toast(message) {
    alert(message);
  }

  function openAuth(mode = "login") {
    style();

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
          <button class="bc-btn bc-full">${register ? "Cadastrar" : "Entrar"}</button>
        </form>
        <p>
          <button class="bc-btn bc-btn-light" id="bc-switch" type="button">${register ? "Já tenho conta" : "Criar conta"}</button>
          <button class="bc-btn bc-btn-light" id="bc-close" type="button">Fechar</button>
        </p>
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
        setupAccessButton();
        toast(register ? "Cadastro realizado." : "Login realizado.");

        if (location.pathname.includes("ocorrencias")) renderOccurrences();
        if (location.pathname.includes("perfil")) renderProfile();
      } catch (err) {
        toast(err.message);
      }
    };
  }

  function findAccessButton() {
    const explicit = document.querySelector("[data-auth-trigger]");
    if (explicit) return explicit;

    const elements = Array.from(document.querySelectorAll("button,a"));
    return elements.find((el) => {
      const text = String(el.textContent || "").toLowerCase();
      return text.includes("acessar comunidade") || text.includes("entrar") || text.includes("login");
    });
  }

  function setupAccessButton() {
    style();

    let button = findAccessButton();

    if (!button) {
      button = document.createElement("button");
      button.className = "bc-float";
      document.body.appendChild(button);
    }

    button.setAttribute("data-auth-trigger", "true");
    button.textContent = currentUser ? "☰" : "Acessar comunidade";
    button.onclick = (event) => {
      event.preventDefault();
      currentUser ? openMenu() : openAuth("login");
    };
  }

  function openMenu() {
    style();

    let menu = document.querySelector(".bc-menu");

    if (!menu) {
      menu = document.createElement("aside");
      menu.className = "bc-menu";
      document.body.appendChild(menu);
    }

    menu.innerHTML = `
      <h2>Bairro Conectado</h2>
      <p>${currentUser ? escapeHtml(currentUser.nome) : "Visitante"}</p>
      <a href="/">Início</a>
      <a href="/ocorrencias.html">Ocorrências</a>
      <a href="/perfil.html">Perfil do cidadão</a>
      <button id="bc-logout">Sair</button>
      <button id="bc-close-menu">Fechar</button>
    `;

    menu.classList.add("open");
    menu.querySelector("#bc-logout").onclick = logout;
    menu.querySelector("#bc-close-menu").onclick = () => menu.classList.remove("open");
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

  async function renderProfile() {
    if (!location.pathname.includes("perfil")) return;

    const root = pageRoot("perfil");

    if (!token) {
      root.innerHTML = `
        <h1>Perfil do cidadão</h1>
        <p>Faça login para editar seus dados.</p>
        <button class="bc-btn" id="login-profile">Entrar</button>
      `;

      root.querySelector("#login-profile").onclick = () => openAuth("login");
      return;
    }

    try {
      const data = await api("/auth/profile");
      currentUser = data.user;
      localStorage.setItem(USER_KEY, JSON.stringify(currentUser));

      root.innerHTML = `
        <h1>Perfil do cidadão</h1>
        <p>Edite seus dados de cadastro.</p>

        <div class="bc-card">
          <form id="profile-form">
            <div class="bc-field"><label>Nome</label><input name="nome" value="${escapeHtml(currentUser.nome)}" required></div>
            <div class="bc-field"><label>Email</label><input value="${escapeHtml(currentUser.email)}" disabled></div>
            <div class="bc-field"><label>Telefone</label><input name="telefone" value="${escapeHtml(currentUser.telefone)}"></div>
            <div class="bc-field"><label>Endereço</label><input name="endereco" value="${escapeHtml(currentUser.endereco)}"></div>
            <div class="bc-field"><label>Foto</label><input name="foto" value="${escapeHtml(currentUser.foto)}"></div>
            <button class="bc-btn">Salvar perfil</button>
          </form>
        </div>
      `;

      root.querySelector("#profile-form").onsubmit = async (event) => {
        event.preventDefault();

        try {
          const body = Object.fromEntries(new FormData(event.target).entries());
          const data = await api("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(body)
          });

          currentUser = data.user;
          localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
          toast("Perfil atualizado.");
        } catch (err) {
          toast(err.message);
        }
      };
    } catch (err) {
      toast(err.message);
    }
  }

  function badge(priority) {
    const value = priority || "media";
    return `<span class="bc-badge ${value}">${value}</span>`;
  }

  async function renderOccurrences() {
    if (!location.pathname.includes("ocorrencias")) return;

    const root = pageRoot("ocorrencias");

    root.innerHTML = `
      <h1>Ocorrências do bairro</h1>
      <p>Cadastre problemas, vote na prioridade e acompanhe o ranking.</p>

      <div class="bc-card">
        <h2>Nova ocorrência</h2>
        ${
          token
            ? `
              <form id="occ-form">
                <div class="bc-field"><label>Título</label><input name="titulo" required></div>
                <div class="bc-field"><label>Descrição</label><textarea name="descricao" required></textarea></div>
                <div class="bc-field"><label>Categoria</label><input name="categoria" placeholder="Infraestrutura, iluminação, limpeza..."></div>
                <div class="bc-field"><label>Bairro</label><input name="bairro"></div>
                <div class="bc-field"><label>Endereço</label><input name="endereco"></div>
                <div class="bc-field">
                  <label>Prioridade</label>
                  <select name="prioridade">
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                    <option value="urgente">Urgente</option>
                  </select>
                </div>
                <button class="bc-btn">Cadastrar ocorrência</button>
              </form>
            `
            : `
              <p>Faça login para cadastrar uma ocorrência.</p>
              <button class="bc-btn" id="login-occ">Entrar</button>
            `
        }
      </div>

      <h2>Ranking das mais críticas</h2>
      <div id="ranking" class="bc-grid"></div>

      <h2>Lista de ocorrências</h2>
      <div id="occ-list" class="bc-grid"></div>
    `;

    const login = root.querySelector("#login-occ");
    if (login) login.onclick = () => openAuth("login");

    const form = root.querySelector("#occ-form");
    if (form) {
      form.onsubmit = async (event) => {
        event.preventDefault();

        try {
          const body = Object.fromEntries(new FormData(event.target).entries());
          await api("/ocorrencias", {
            method: "POST",
            body: JSON.stringify(body)
          });

          toast("Ocorrência criada.");
          renderOccurrences();
        } catch (err) {
          toast(err.message);
        }
      };
    }

    await loadOccurrences();
  }

  async function loadOccurrences() {
    const list = document.querySelector("#occ-list");
    const ranking = document.querySelector("#ranking");

    if (!list || !ranking) return;

    try {
      const data = await api("/ocorrencias");
      const rank = await api("/ocorrencias/ranking");

      ranking.innerHTML = rank.ranking.length
        ? rank.ranking.map((item, index) => `
          <div class="bc-card">
            <strong>${index + 1}. ${escapeHtml(item.titulo)}</strong>
            <p>${badge(item.prioridade)} <span class="bc-badge">${item.totalVotos} voto(s)</span></p>
          </div>
        `).join("")
        : "<p>Nenhuma ocorrência no ranking ainda.</p>";

      list.innerHTML = data.ocorrencias.length
        ? data.ocorrencias.map((item) => `
          <div class="bc-card">
            <h3>${escapeHtml(item.titulo)}</h3>
            <p>${badge(item.prioridade)} <span class="bc-badge">${escapeHtml(item.status)}</span> <span class="bc-badge">${item.totalVotos} voto(s)</span></p>
            <p>${escapeHtml(item.descricao)}</p>
            <p><strong>Categoria:</strong> ${escapeHtml(item.categoria || "Geral")}</p>
            <p><strong>Bairro:</strong> ${escapeHtml(item.bairro || "Não informado")}</p>
            <p><strong>Endereço:</strong> ${escapeHtml(item.endereco || "Não informado")}</p>

            <div class="bc-actions">
              <button class="bc-btn bc-btn-light" data-id="${escapeHtml(item.id)}" data-vote="baixa">Baixa</button>
              <button class="bc-btn bc-btn-light" data-id="${escapeHtml(item.id)}" data-vote="media">Média</button>
              <button class="bc-btn bc-btn-light" data-id="${escapeHtml(item.id)}" data-vote="alta">Alta</button>
              <button class="bc-btn bc-btn-light" data-id="${escapeHtml(item.id)}" data-vote="urgente">Urgente</button>
            </div>
          </div>
        `).join("")
        : "<p>Nenhuma ocorrência cadastrada.</p>";

      document.querySelectorAll("[data-id]").forEach((button) => {
        button.onclick = async () => {
          if (!token) {
            openAuth("login");
            return;
          }

          try {
            await api(`/ocorrencias/${button.dataset.id}/vote`, {
              method: "POST",
              body: JSON.stringify({ prioridade: button.dataset.vote })
            });

            await loadOccurrences();
          } catch (err) {
            toast(err.message);
          }
        };
      });
    } catch (err) {
      list.innerHTML = `<p>Erro ao carregar ocorrências: ${escapeHtml(err.message)}</p>`;
      ranking.innerHTML = `<p>Erro ao carregar ranking: ${escapeHtml(err.message)}</p>`;
    }
  }

  document.addEventListener("DOMContentLoaded", () => {
    style();
    setupAccessButton();
    renderProfile();
    renderOccurrences();
  });
})();
