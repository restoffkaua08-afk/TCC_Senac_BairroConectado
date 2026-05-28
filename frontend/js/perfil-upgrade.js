(function () {
  const isProfile = location.pathname.includes("perfil");
  if (!isProfile) return;

  document.body.classList.add("page-perfil");

  function hasToken() {
    return !!localStorage.getItem("bairro_token");
  }

  function openAuth(mode) {
    if (window.BairroConectado && typeof window.BairroConectado.openAuth === "function") {
      window.BairroConectado.openAuth(mode);
    }
  }

  function scrollToProfileContent() {
    const target =
      document.querySelector(".bc-profile-layout") ||
      document.querySelector("#profile-form") ||
      document.querySelector("#login-profile") ||
      document.querySelector("main[data-profile-root] .bc-section");

    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  function enhanceHero() {
    const hero = document.querySelector(".bc-page-hero");
    if (!hero) return false;

    hero.classList.add("perfil-hero-professional");

    if (hero.querySelector(".perfil-hero-actions")) {
      return true;
    }

    const logged = hasToken();

    const actions = document.createElement("div");
    actions.className = "perfil-hero-actions";

    actions.innerHTML = logged
      ? `
        <button type="button" class="perfil-hero-btn primary" data-profile-action="ver">Ver dados</button>
        <button type="button" class="perfil-hero-btn secondary" data-profile-action="editar">Editar perfil</button>
      `
      : `
        <button type="button" class="perfil-hero-btn primary" data-profile-action="entrar">Entrar</button>
        <button type="button" class="perfil-hero-btn secondary" data-profile-action="criar">Criar conta</button>
      `;

    hero.appendChild(actions);

    actions.querySelectorAll("[data-profile-action]").forEach((button) => {
      button.addEventListener("click", function () {
        const action = button.dataset.profileAction;

        if (action === "entrar") {
          openAuth("login");
          return;
        }

        if (action === "criar") {
          openAuth("register");
          return;
        }

        scrollToProfileContent();
      });
    });

    return true;
  }

  function boot() {
    document.body.classList.add("page-perfil");

    let attempts = 0;

    const timer = setInterval(function () {
      attempts++;

      const done = enhanceHero();

      if (done || attempts >= 20) {
        clearInterval(timer);
      }
    }, 100);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
