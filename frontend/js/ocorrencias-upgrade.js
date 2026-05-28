(function () {
  const isOccurrences =
    location.pathname.includes("ocorrencias");

  if (!isOccurrences) return;

  function boot() {
    document.body.classList.add("page-ocorrencias");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
