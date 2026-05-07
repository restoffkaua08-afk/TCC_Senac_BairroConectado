(function(){
  function ensureSingleInternalMenu(){
    const topnav = document.querySelector(".bc-topnav");
    if(topnav){
      topnav.innerHTML = "";
      topnav.style.display = "none";
    }

    const homeNavs = document.querySelectorAll(".home-internal-nav");
    if(homeNavs.length > 1){
      homeNavs.forEach((nav, index) => {
        if(index > 0) nav.remove();
      });
    }
  }

  function setupInternalAnchors(){
    document.querySelectorAll(".home-internal-nav a").forEach((link) => {
      link.onclick = (event) => {
        const href = link.getAttribute("href");
        if(!href || !href.startsWith("#")) return;

        const target = document.querySelector(href);
        if(target){
          event.preventDefault();
          target.scrollIntoView({ behavior:"smooth", block:"start" });
        }
      };
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      ensureSingleInternalMenu();
      setupInternalAnchors();
    }, 300);

    setTimeout(() => {
      ensureSingleInternalMenu();
      setupInternalAnchors();
    }, 900);
  });
})();
