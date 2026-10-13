// Menú del celular y año del pie de página.
(function () {
  var top = document.querySelector('.top');
  var boton = document.querySelector('.menu-btn');
  if (top && boton) {
    boton.addEventListener('click', function () {
      var abierto = top.classList.toggle('abierto');
      boton.setAttribute('aria-expanded', abierto ? 'true' : 'false');
      boton.textContent = abierto ? 'Cerrar' : 'Menú';
    });
    top.querySelectorAll('.nav a').forEach(function (a) {
      a.addEventListener('click', function () {
        top.classList.remove('abierto');
        boton.setAttribute('aria-expanded', 'false');
        boton.textContent = 'Menú';
      });
    });
  }
  var y = document.getElementById('y');
  if (y) y.textContent = new Date().getFullYear();
})();
