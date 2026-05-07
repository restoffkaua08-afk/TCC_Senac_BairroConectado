(function(){
  function setupCarousel(carousel){
    const track = carousel.querySelector(".home-carousel-track");
    const slides = Array.from(carousel.querySelectorAll(".home-banner"));
    const wrapper = carousel.closest(".home-carousel-block");
    const prev = wrapper ? wrapper.querySelector("[data-home-prev]") : null;
    const next = wrapper ? wrapper.querySelector("[data-home-next]") : null;
    const dots = wrapper ? wrapper.querySelector(".home-dots") : null;

    if(!track || !slides.length) return;

    let index = 0;

    function render(){
      track.style.transform = `translateX(-${index * 100}%)`;

      if(dots){
        dots.innerHTML = slides.map((_, i) => `<button type="button" class="${i === index ? "active" : ""}" data-dot="${i}"></button>`).join("");
        dots.querySelectorAll("[data-dot]").forEach((btn) => {
          btn.onclick = () => {
            index = Number(btn.dataset.dot);
            render();
          };
        });
      }
    }

    function goNext(){
      index = (index + 1) % slides.length;
      render();
    }

    function goPrev(){
      index = (index - 1 + slides.length) % slides.length;
      render();
    }

    if(next) next.onclick = goNext;
    if(prev) prev.onclick = goPrev;

    let timer = setInterval(goNext, 6000);

    carousel.addEventListener("mouseenter", () => clearInterval(timer));
    carousel.addEventListener("mouseleave", () => {
      clearInterval(timer);
      timer = setInterval(goNext, 6000);
    });

    render();
  }

  function fixTopInternalMenu(){
    const topnav = document.querySelector(".bc-topnav");
    const onHome = location.pathname === "/" || location.pathname.endsWith("/index.html");

    if(!topnav || !onHome) return;

    topnav.innerHTML = `
      <a href="#eventos">Eventos</a>
      <a href="#obras">Obras</a>
      <a href="#comercio">Comércio</a>
      <a href="#empregos">Empregos</a>
      <a href="#projetos">Projetos</a>
      <a href="#servicos">Serviços</a>
    `;
  }

  function setupAnchors(){
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
      link.onclick = (event) => {
        const href = link.getAttribute("href");
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
      fixTopInternalMenu();
      setupAnchors();
      document.querySelectorAll(".home-carousel").forEach(setupCarousel);
    }, 250);
  });
})();
