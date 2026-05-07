(function(){
  const carousels = [];

  function initCarousel(root){
    const track = root.querySelector(".bc-carousel-track");
    const slides = Array.from(root.querySelectorAll(".bc-banner"));
    const dotsWrap = root.parentElement.querySelector(".bc-dots");
    const prev = root.parentElement.querySelector("[data-carousel-prev]");
    const next = root.parentElement.querySelector("[data-carousel-next]");
    let index = 0;

    if(!track || !slides.length) return;

    function renderDots(){
      if(!dotsWrap) return;
      dotsWrap.innerHTML = slides.map((_, i) => `<button type="button" data-dot="${i}" class="${i===index ? "active" : ""}"></button>`).join("");
      dotsWrap.querySelectorAll("[data-dot]").forEach((btn) => {
        btn.onclick = () => {
          index = Number(btn.dataset.dot);
          update();
        };
      });
    }

    function update(){
      track.style.transform = `translateX(-${index * 100}%)`;
      renderDots();
    }

    function goPrev(){
      index = (index - 1 + slides.length) % slides.length;
      update();
    }

    function goNext(){
      index = (index + 1) % slides.length;
      update();
    }

    if(prev) prev.onclick = goPrev;
    if(next) next.onclick = goNext;

    renderDots();

    let timer = setInterval(goNext, 5500);

    root.addEventListener("mouseenter", () => clearInterval(timer));
    root.addEventListener("mouseleave", () => {
      clearInterval(timer);
      timer = setInterval(goNext, 5500);
    });

    carousels.push({ update });
    update();
  }

  function smoothInternalMenu(){
    const links = document.querySelectorAll('.bc-home-subnav a, .bc-topnav a[href^="#"]');
    links.forEach((link) => {
      link.addEventListener("click", function(e){
        const href = this.getAttribute("href");
        if(!href || !href.startsWith("#")) return;
        const target = document.querySelector(href);
        if(target){
          e.preventDefault();
          target.scrollIntoView({ behavior:"smooth", block:"start" });
        }
      });
    });
  }

  function rebuildTopInternalMenu(){
    const topnav = document.querySelector(".bc-topnav");
    if(!topnav) return;

    const onHome = location.pathname === "/" || location.pathname.endsWith("/index.html");

    if(onHome){
      topnav.innerHTML = `
        <a href="#eventos">Eventos</a>
        <a href="#empregos">Empregos</a>
        <a href="#comercio">Comércio</a>
        <a href="#projetos">Projetos</a>
        <a href="#obras">Obras</a>
      `;
    } else {
      topnav.innerHTML = "";
    }
  }

  document.addEventListener("DOMContentLoaded", function(){
    rebuildTopInternalMenu();
    smoothInternalMenu();
    document.querySelectorAll(".bc-carousel").forEach(initCarousel);
  });
})();
