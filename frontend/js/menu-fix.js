(function () {
  function getUser() {
    try {
      return JSON.parse(localStorage.getItem("bairro_user") || "null");
    } catch {
      return null;
    }
  }

  function normalize(text) {
    return String(text || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "");
  }

  function isHomePage() {
    const path = location.pathname.toLowerCase();
    return path === "/" || path.endsWith("/index.html");
  }

  function tagHomeSections() {
    if (!isHomePage()) return;

    const map = [
      { id: "comercio", keys: ["comercio", "comercios", "lojas"] },
      { id: "obras", keys: ["obras", "obra"] },
      { id: "projetos", keys: ["projetos", "projeto", "social"] },
      { id: "eventos", keys: ["eventos", "evento"] },
      { id: "servicos", keys: ["servicos", "serviços", "servico", "serviço"] },
      { id: "empregos", keys: ["empregos", "emprego", "vagas", "vaga"] },
      { id: "mapa", keys: ["mapa", "localizacao", "localização"] }
    ];

    const sections = Array.from(document.querySelectorAll("section, div, main"));

    for (const item of map) {
      if (document.getElementById(item.id)) continue;

      const found = sections.find((section) => {
        const text = normalize(section.textContent).slice(0, 800);
        return item.keys.some((key) => text.includes(normalize(key)));
      });

      if (found) {
        found.id = item.id;
      }
    }
  }

  function rebuildTopbar() {
    const topbar = document.querySelector(".bc-topbar");
    if (!topbar) return;

    const trigger = topbar.querySelector(".bc-menu-trigger");
    if (trigger && window.BairroConectado && window.BairroConectado.openSidebar) {
      trigger.onclick = function () {
        window.BairroConectado.openSidebar();
      };
    }

    let nav = topbar.querySelector(".bc-topnav");

    if (!nav) {
      nav = document.createElement("nav");
      nav.className = "bc-topnav";
      topbar.appendChild(nav);
    }

    if (isHomePage()) {
      nav.innerHTML = `
        <a href="#comercio">Comércio</a>
        <a href="#obras">Obras</a>
        <a href="#projetos">Projetos</a>
        <a href="#eventos">Eventos</a>
        <a href="#servicos">Serviços</a>
        <a href="#empregos">Empregos</a>
        <a href="#mapa">Mapa</a>
      `;
    } else {
      nav.innerHTML = "";
    }
  }

  function rebuildSidebarIfOpen() {
    const sidebar = document.querySelector(".bc-sidebar");
    if (!sidebar || !sidebar.classList.contains("open")) return;

    const user = getUser();
    const avatar = user && user.foto
      ? `<img class="bc-avatar" src="${user.foto}" alt="Foto do usuário">`
      : `<div class="bc-avatar">${user && user.nome ? user.nome.charAt(0).toUpperCase() : "U"}</div>`;

    sidebar.innerHTML = `
      <button class="bc-close-menu" type="button">×</button>

      <div class="bc-sidebar-head">
        ${avatar}
        <div>
          <h3>${user ? user.nome : "Visitante"}</h3>
          <p>${user ? user.email : "Entre para acessar a comunidade"}</p>
        </div>
      </div>

      <nav>
        <a href="/">Início</a>
        <a href="/ocorrencias.html">Ocorrências</a>
        <a href="/perfil.html">Perfil</a>
        ${
          user
            ? `<button type="button" id="bc-logout-fixed">Sair</button>`
            : `<button type="button" id="bc-login-fixed">Entrar / cadastrar</button>`
        }
      </nav>
    `;

    const close = sidebar.querySelector(".bc-close-menu");
    if (close) {
      close.onclick = function () {
        const bg = document.querySelector(".bc-sidebar-bg");
        sidebar.classList.remove("open");
        if (bg) bg.classList.remove("open");
      };
    }

    const logout = sidebar.querySelector("#bc-logout-fixed");
    if (logout) {
      logout.onclick = function () {
        localStorage.removeItem("bairro_token");
        localStorage.removeItem("bairro_user");
        location.href = "/";
      };
    }

    const login = sidebar.querySelector("#bc-login-fixed");
    if (login && window.BairroConectado && window.BairroConectado.openAuth) {
      login.onclick = function () {
        window.BairroConectado.openAuth("login");
      };
    }
  }

  function fixHomeWrongLinks() {
    if (!isHomePage()) return;

    const allLinks = Array.from(document.querySelectorAll("a, button"));

    for (const item of allLinks) {
      const text = normalize(item.textContent);

      if (text === "inicio" || text === "ocorrencias" || text === "perfil" || text === "sair") {
        const parentTopbar = item.closest(".bc-topnav");
        if (parentTopbar) item.remove();
      }
    }
  }

  function applyFix() {
    tagHomeSections();
    rebuildTopbar();
    rebuildSidebarIfOpen();
    fixHomeWrongLinks();
  }

  document.addEventListener("DOMContentLoaded", function () {
    setTimeout(applyFix, 300);
    setTimeout(applyFix, 900);
  });

  document.addEventListener("click", function () {
    setTimeout(applyFix, 80);
  });
})();
