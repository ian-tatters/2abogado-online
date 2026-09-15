/* Apoyo de captura — Asesoría y Servicio Notarial
   1) Modo de captura: "documentos" (el despacho captura los datos de los archivos adjuntos) o "manual".
   2) Autocompletado desde la CURP: fecha de nacimiento, sexo y entidad de nacimiento.
   Funciona junto con /assets/form.js y también en páginas autocontenidas. */
(function(){
  "use strict";
  var ENT = {AS:'Aguascalientes',BC:'Baja California',BS:'Baja California Sur',CC:'Campeche',CL:'Coahuila',CM:'Colima',CS:'Chiapas',CH:'Chihuahua',DF:'Ciudad de México',DG:'Durango',GT:'Guanajuato',GR:'Guerrero',HG:'Hidalgo',JC:'Jalisco',MC:'Estado de México',MN:'Michoacán',MS:'Morelos',NT:'Nayarit',NL:'Nuevo León',OC:'Oaxaca',PL:'Puebla',QT:'Querétaro',QR:'Quintana Roo',SP:'San Luis Potosí',SL:'Sinaloa',SR:'Sonora',TC:'Tabasco',TS:'Tamaulipas',TL:'Tlaxcala',VZ:'Veracruz',YN:'Yucatán',ZS:'Zacatecas',NE:'Nacido en el extranjero'};

  function parseCURP(v){
    v = String(v||'').toUpperCase().replace(/\s/g,'');
    if(!/^[A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}[0-9A-Z]\d$/.test(v)) return null;
    var aa = parseInt(v.substr(4,2),10), mm = v.substr(6,2), dd = v.substr(8,2);
    var homo = v.charAt(17);
    var siglo = /[0-9]/.test(homo) ? 1900 : 2000;         // homoclave numérica = siglo XX
    var anio = siglo + aa;
    return {
      fecha: anio + '-' + mm + '-' + dd,
      sexo: v.charAt(10) === 'H' ? 'Hombre' : 'Mujer',
      entidad: ENT[v.substr(11,2)] || ''
    };
  }

  function setIfEmpty(form, name, value){
    if(!value) return;
    var el = form.elements[name];
    if(!el || (el.length && !el.tagName)) return;
    if(!String(el.value||'').trim()){ el.value = value; el.dispatchEvent(new Event('change', {bubbles:true})); }
  }

  document.addEventListener('input', function(e){
    var t = e.target;
    if(!t.name || !/curp/i.test(t.name)) return;
    var d = parseCURP(t.value);
    var form = t.form; if(!form || !d) return;
    var pre = t.name.replace(/curp.*$/i,'');            // soporta socio1_curp, vendedor2_curp, etc.
    setIfEmpty(form, pre + 'fecha_nacimiento', d.fecha);
    setIfEmpty(form, 'fecha_nacimiento', d.fecha);
    setIfEmpty(form, pre + 'sexo', d.sexo);
    setIfEmpty(form, pre + 'entidad_nacimiento', d.entidad);
    setIfEmpty(form, 'entidad_nacimiento', d.entidad);
    var av = document.querySelector('[data-curp-aviso]');
    if(av){ av.hidden = false; av.textContent = 'Tomamos de su CURP: ' + d.fecha.split('-').reverse().join('/') + ' · ' + d.sexo + (d.entidad ? ' · ' + d.entidad : '') + '. Corríjalo si algo no coincide.'; }
  });
})();
