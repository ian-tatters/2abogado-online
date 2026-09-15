/* Envía una copia del cuestionario (respuestas + archivos) al Apps Script que
   crea la carpeta del cliente en Google Drive. Es "mejor esfuerzo": si falla,
   el envío normal del formulario sigue su curso y nadie se queda sin trámite. */
(function(){
  "use strict";
  function base64(file){
    return new Promise(function(res, rej){
      var r = new FileReader();
      r.onload = function(){ var s = String(r.result || ''); res(s.substring(s.indexOf(',') + 1)); };
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }
  function archivosDe(form){
    var lista = [];
    Array.prototype.forEach.call(form.querySelectorAll('input[type=file]'), function(i){
      if(i.files && i.files[0]) lista.push({ input: i, file: i.files[0] });
    });
    return lista;
  }
  window.Expediente = {
    activo: function(){
      return !!(window.SITIO && window.SITIO.expedientesUrl);
    },
    /* form: el <form>; datosJson: la cadena que ya se guarda en el campo datos_json */
    enviar: function(form, datosJson){
      if(!this.activo()) return Promise.resolve(false);
      var url = window.SITIO.expedientesUrl;
      var pendientes = archivosDe(form);
      var chain = Promise.resolve([]);
      pendientes.forEach(function(p){
        chain = chain.then(function(acc){
          return base64(p.file).then(function(b64){
            acc.push({ campo: p.input.name, nombre: p.file.name, tipo: p.file.type || 'application/octet-stream', datos: b64 });
            return acc;
          }).catch(function(){ return acc; });
        });
      });
      return chain.then(function(archivos){
        var cuerpo = JSON.stringify({
          origen: 'sitio',
          formulario: form.getAttribute('name') || '',
          enviado: new Date().toISOString(),
          datos_json: datosJson || '',
          archivos: archivos
        });
        return fetch(url, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: cuerpo
        }).then(function(){ return true; }).catch(function(){ return false; });
      }).catch(function(){ return false; });
    }
  };
})();
