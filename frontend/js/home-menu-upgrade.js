(function () {
  const isHome =
    location.pathname === "/" ||
    location.pathname.endsWith("/index.html") ||
    location.pathname === "";

  if (!isHome) return;

  const links = [
    ["Eventos", "#eventos"],
    ["Obras", "#obras"],
    ["Comércio", "#comercio"],
    ["Empregos", "#empregos"],
    ["Projetos", "#projetos"],
    ["Serviços", "#servicos"],
    ["Mapa", "#mapa"]
  ];

  function mountHomeSubmenu() {
    const topnav = document.querySelector(".bc-topnav");

    if (!topnav) {
      setTimeout(mountHomeSubmenu, 80);
      return;
    }

    if (document.querySelector(".bc-home-subnav")) return;

    const group = document.createElement("div");
    group.className = "bc-home-subnav";
    group.setAttribute("aria-label", "Submenus da página inicial");

    group.innerHTML = links
      .map(([label, href]) => `<a href="${href}">${label}</a>`)
      .join("");

    const firstLink = topnav.querySelector('a[href="/"]');
    const authButton = topnav.querySelector("[data-auth-trigger]");

    if (firstLink && firstLink.nextSibling) {
      topnav.insertBefore(group, firstLink.nextSibling);
    } else if (authButton) {
      topnav.insertBefore(group, authButton);
    } else {
      topnav.appendChild(group);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", mountHomeSubmenu);
  } else {
    mountHomeSubmenu();
  }

  setTimeout(mountHomeSubmenu, 250);
})();
