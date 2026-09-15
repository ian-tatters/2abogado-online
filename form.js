/* Motor común de los cuestionarios — Asesoría y Servicio Notarial
   Cada página define window.CFG = { formulario:'…', validate:function(errs, api){…} } antes de cargar este archivo. */
(function(){
  "use strict";
  var CFG = window.CFG || {};
  var MAX_BYTES = 7 * 1024 * 1024;      // margen frente al límite de 8 MB por envío de Netlify
  var MAX_EDGE  = 1600;                 // lado mayor de las imágenes comprimidas
  var JPEG_Q    = 0.72;

  var f = document.getElementById('f');
  var btn = document.getElementById('btn');
  var errbox = document.getElementById('errbox');
  var y = document.getElementById('y'); if(y) y.textContent = new Date().getFullYear();

  function isHidden(el){ return !!(el.closest && el.closest('[hidden]')); }
  function fieldValue(name){
    var e = f.elements[name];
    if(!e) return '';
    if(e.type === 'checkbox') return e.checked ? (e.value || 'Sí') : '';
    if(typeof e.length === 'number' && !e.tagName){ // RadioNodeList
      for(var i = 0; i < e.length; i++){ if(e[i].checked) return e[i].value; }
      return '';
    }
    return String(e.value || '').trim();
  }
  function labelOf(el){
    var lab = el.closest('label, .file, .opt, fieldset');
    var s = lab && lab.querySelector('.lab, legend h2, b');
    var t = s ? s.textContent : (el.name || '');
    return t.replace(/\*/g, '').replace(/\s+/g, ' ').trim();
  }

  /* ---------- mostrar / ocultar: data-show-if="campo:valor1|valor2" o "campo:checked" ---------- */
  function applyConditions(){
    Array.prototype.forEach.call(document.querySelectorAll('[data-show-if]'), function(el){
      var rule = el.getAttribute('data-show-if').split(':');
      var name = rule[0], want = (rule[1] || '').split('|');
      var v = fieldValue(name);
      var show;
      if(want[0] === 'checked') show = !!v;
      else if(want[0] === 'any') show = !!v;
      else show = want.indexOf(v) !== -1;
      el.hidden = !show;
    });
  }
  f.addEventListener('change', applyConditions);
  f.addEventListener('input', function(e){ if(e.target.type === 'text' || e.target.tagName === 'SELECT') applyConditions(); });
  applyConditions();

  /* ---------- repetidores ---------- */
  function slots(group){
    return Array.prototype.slice.call(document.querySelectorAll('.slot[data-group="' + group + '"]'));
  }
  document.addEventListener('click', function(e){
    var t = e.target.closest('[data-add],[data-remove]');
    if(!t) return;
    var add = t.getAttribute('data-add'), rem = t.getAttribute('data-remove');
    if(add){
      var next = slots(add).filter(function(s){ return s.hidden; })[0];
      if(next){ next.hidden = false; var i = next.querySelector('input,select'); if(i) i.focus(); }
      else { t.textContent = 'Ya no caben más en el formulario'; t.disabled = true; }
    }
    if(rem){
      var slot = t.closest('.slot');
      if(slot){
        slot.hidden = true;
        Array.prototype.forEach.call(slot.querySelectorAll('input,select,textarea'), function(el){
          if(el.type === 'checkbox' || el.type === 'radio') el.checked = false; else if(el.type !== 'file') el.value = '';
        });
        var addBtn = document.querySelector('[data-add="' + rem + '"]');
        if(addBtn){ addBtn.disabled = false; addBtn.textContent = addBtn.getAttribute('data-label') || addBtn.textContent; }
      }
    }
    recalcPct(); applyConditions();
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-add]'), function(b){ b.setAttribute('data-label', b.textContent); });

  /* ---------- suma de porcentajes (.pct + #sumbar) ---------- */
  var sumbar = document.getElementById('sumbar');
  var sumval = document.getElementById('sumval');
  function pctTotal(){
    var t = 0;
    Array.prototype.forEach.call(document.querySelectorAll('.pct'), function(el){
      if(isHidden(el)) return;
      var n = parseFloat(el.value);
      if(!isNaN(n)) t += n;
    });
    return Math.round(t * 100) / 100;
  }
  function recalcPct(){
    if(!sumbar) return;
    var t = pctTotal();
    sumval.textContent = t;
    sumbar.className = 'sumbar' + (t === 0 ? '' : (t === 100 ? ' ok' : ' bad'));
  }
  f.addEventListener('input', function(e){ if(e.target.classList.contains('pct')) recalcPct(); });
  recalcPct();

  /* ---------- medidor de peso ---------- */
  var fills = document.getElementById('meter_fill');
  var mtxt  = document.getElementById('meter_txt');
  var meter = document.getElementById('meter');
  function human(b){
    if(b < 1024) return b + ' B';
    if(b < 1024*1024) return Math.round(b/1024) + ' KB';
    return (b/1048576).toFixed(1) + ' MB';
  }
  function rawTotal(){
    var t = 0;
    Array.prototype.forEach.call(f.querySelectorAll('input[type=file]'), function(i){
      if(i.files && i.files[0]) t += i.files[0].size;
    });
    return t;
  }
  function refreshMeter(){
    if(!meter) return;
    var t = rawTotal();
    fills.style.width = Math.min(100, Math.round(t / MAX_BYTES * 100)) + '%';
    mtxt.textContent = human(t) + ' de 7 MB';
    meter.className = 'meter' + (t > MAX_BYTES ? ' warn' : '');
  }
  f.addEventListener('change', function(e){
    if(e.target.type === 'file'){
      var box = e.target.closest('.file');
      var tag = box.querySelector('.fsize');
      if(!tag){ tag = document.createElement('span'); tag.className = 'fsize'; box.appendChild(tag); }
      tag.textContent = (e.target.files && e.target.files[0]) ? human(e.target.files[0].size) : '';
      refreshMeter();
    }
  });

  /* ---------- compresión de imágenes ---------- */
  function compress(file){
    return new Promise(function(resolve){
      if(!file || file.type.indexOf('image/') !== 0 || file.type === 'image/gif'){ resolve(file); return; }
      var url = URL.createObjectURL(file);
      var img = new Image();
      img.onload = function(){
        var w = img.naturalWidth, h = img.naturalHeight;
        var scale = Math.min(1, MAX_EDGE / Math.max(w, h));
        var cw = Math.max(1, Math.round(w * scale)), ch = Math.max(1, Math.round(h * scale));
        var c = document.createElement('canvas');
        c.width = cw; c.height = ch;
        var ctx = c.getContext('2d');
        ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, cw, ch);
        ctx.drawImage(img, 0, 0, cw, ch);
        c.toBlob(function(blob){
          URL.revokeObjectURL(url);
          if(!blob || blob.size >= file.size){ resolve(file); return; }
          var base = file.name.replace(/\.[^.]+$/, '');
          resolve(new File([blob], base + '.jpg', { type: 'image/jpeg', lastModified: Date.now() }));
        }, 'image/jpeg', JPEG_Q);
      };
      img.onerror = function(){ URL.revokeObjectURL(url); resolve(file); };
      img.src = url;
    });
  }

  /* ---------- datos estructurados (genérico) ----------
     Campos visibles → datos{}. Nombres tipo "socio2_rfc" → grupos.socio[1].rfc. */
  var SKIP = { 'form-name':1, 'subject':1, 'datos_json':1, 'bot-field':1 };
  function buildJSON(){
    var datos = {}, grupos = {}, seen = {};
    Array.prototype.forEach.call(f.elements, function(el){
      var n = el.name;
      if(!n || SKIP[n] || el.type === 'file' || el.type === 'button' || el.type === 'submit') return;
      if(isHidden(el)) return;
      if(seen[n]) return;
      var v;
      if(el.type === 'checkbox'){ v = el.checked ? (el.value === 'on' ? true : el.value) : false; }
      else if(el.type === 'radio'){ v = fieldValue(n); }
      else { v = String(el.value || '').trim(); }
      seen[n] = 1;
      var m = /^([a-z]+)(\d+)_(.+)$/.exec(n);
      if(m){
        var g = m[1], i = parseInt(m[2], 10) - 1, k = m[3];
        if(!grupos[g]) grupos[g] = [];
        if(!grupos[g][i]) grupos[g][i] = {};
        grupos[g][i][k] = v;
      } else {
        datos[n] = v;
      }
    });
    Object.keys(grupos).forEach(function(g){
      grupos[g] = grupos[g].filter(function(o){
        return o && Object.keys(o).some(function(k){ return o[k] !== '' && o[k] !== false; });
      });
    });
    var adjuntos = [];
    Array.prototype.forEach.call(f.querySelectorAll('input[type=file]'), function(i){
      if(i.files && i.files[0]) adjuntos.push({ campo: i.name, archivo: i.files[0].name, bytes: i.files[0].size });
    });
    var out = { version: 2, formulario: CFG.formulario || f.getAttribute('name'), enviado: new Date().toISOString(),
                datos: datos, grupos: grupos, adjuntos: adjuntos };
    if(sumbar) out.suma_porcentajes = pctTotal();
    return out;
  }

  /* ---------- validación ---------- */
  function showErrors(list){
    if(!list.length){ errbox.className = 'errbox'; errbox.innerHTML = ''; return; }
    errbox.className = 'errbox on';
    errbox.innerHTML = '<b>Falta algo antes de enviar:</b><ul>' +
      list.map(function(t){ return '<li>' + t + '</li>'; }).join('') + '</ul>';
    errbox.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }
  var api = { val: fieldValue, hidden: isHidden, pct: pctTotal, group: function(g){ return buildJSON().grupos[g] || []; }, human: human };
  function validate(){
    var errs = [], doneRadio = {};
    Array.prototype.forEach.call(f.querySelectorAll('.bad'), function(el){ el.classList.remove('bad'); });
    Array.prototype.forEach.call(f.querySelectorAll('[required]'), function(el){
      if(isHidden(el)) return;
      if(el.type === 'file'){
        if(!el.files.length) errs.push(labelOf(el));
        return;
      }
      if(el.type === 'radio'){
        if(doneRadio[el.name]) return; doneRadio[el.name] = 1;
        if(!fieldValue(el.name)) errs.push(labelOf(el.closest('fieldset')) || el.name);
        return;
      }
      if(el.type === 'checkbox'){ if(!el.checked) errs.push(labelOf(el)); return; }
      if(!String(el.value || '').trim()){ errs.push(labelOf(el)); el.classList.add('bad'); }
    });
    Array.prototype.forEach.call(f.querySelectorAll('input[type=email]'), function(mail){
      if(!isHidden(mail) && mail.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail.value)){
        errs.push('El correo electrónico no parece válido'); mail.classList.add('bad');
      }
    });
    if(typeof CFG.validate === 'function') CFG.validate(errs, api);
    var av = document.getElementById('acepta_aviso');
    if(av && !av.checked) errs.push('Autorizar el tratamiento de sus datos');
    showErrors(errs);
    return errs.length === 0;
  }

  /* ---------- envío ---------- */
  var sending = false;
  var btnLabel = btn.textContent;
  f.addEventListener('submit', function(e){
    e.preventDefault();
    if(sending) return;
    if(!validate()) return;
    sending = true; btn.disabled = true; btn.textContent = 'Preparando documentos…';

    var inputs = Array.prototype.filter.call(f.querySelectorAll('input[type=file]'), function(i){ return i.files && i.files.length; });
    var chain = Promise.resolve(0);
    inputs.forEach(function(input){
      chain = chain.then(function(acc){
        return compress(input.files[0]).then(function(out){
          try { var dt = new DataTransfer(); dt.items.add(out); input.files = dt.files; } catch(err){ out = input.files[0]; }
          return acc + out.size;
        });
      });
    });
    chain.then(function(total){
      if(total > MAX_BYTES){
        sending = false; btn.disabled = false; btn.textContent = btnLabel;
        showErrors(['Los documentos pesan ' + human(total) + ' en total y el límite por envío es de 7 MB. ' +
          'Quite alguno y mándelo después por WhatsApp, o vuelva a tomar la foto con menos resolución.']);
        return;
      }
      var json = JSON.stringify(buildJSON());
      document.getElementById('datos_json').value = json;
      btn.textContent = 'Enviando…';
      if(window.__DRY_RUN){ sending = false; btn.disabled = false; btn.textContent = btnLabel; return; }
      var copia = (window.Expediente && window.Expediente.activo())
        ? window.Expediente.enviar(f, json)
        : Promise.resolve(false);
      copia.then(function(){
        var cfgSitio = window.SITIO || {};
        if(cfgSitio.usarNetlifyForms === false){
          window.location.href = f.getAttribute('action') || cfgSitio.paginaGracias || '/gracias/';
        } else {
          HTMLFormElement.prototype.submit.call(f);
        }
      });
    }).catch(function(){
      sending = false; btn.disabled = false; btn.textContent = btnLabel;
      showErrors(['Hubo un problema al preparar los archivos. Intente de nuevo o mándenos los documentos por WhatsApp.']);
    });
  });
  window.__buildJSON = buildJSON; window.__validate = validate;
})();
