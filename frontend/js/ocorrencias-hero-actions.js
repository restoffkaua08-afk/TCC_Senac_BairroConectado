(function () {
  const isOccurrences = location.pathname.includes("ocorrencias");
  if (!isOccurrences) return;

  function enhanceHero() {
    const hero = document.querySelector(".bc-page-hero");
    if (!hero || hero.querySelector(".occ-hero-actions")) return;

    hero.classList.add("occ-hero-professional");

    const actions = document.createElement("div");
    actions.className = "occ-hero-actions";

    actions.innerHTML = `
      <button type="button" class="occ-hero-btn primary" data-occ-scroll="ver">Ver ocorrências</button>
      <button type="button" class="occ-hero-btn secondary" data-occ-scroll="criar">Criar ocorrência</button>
    `;

    hero.appendChild(actions);

    const viewButton = actions.querySelector('[data-occ-scroll="ver"]');
    const createButton = actions.querySelector('[data-occ-scroll="criar"]');

    viewButton.addEventListener("click", function () {
      const target =
        document.querySelector("#occurrence-list") ||
        document.querySelector("#ranking-list");

      const section = target ? target.closest(".bc-section") : null;

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });

    createButton.addEventListener("click", function () {
      const target =
        document.querySelector("#occurrence-form") ||
        document.querySelector("#login-occurrence");

      const section = target ? target.closest(".bc-section") : null;

      if (section) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  }

  function boot() {
    enhanceHero();

    const observer = new MutationObserver(enhanceHero);
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });

    setTimeout(enhanceHero, 150);
    setTimeout(enhanceHero, 500);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
