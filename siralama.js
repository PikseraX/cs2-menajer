const LIG_PRIMI = [150, 110, 80, 50, 30, 15, 5, 0];

function takimPuaniIlk(ort) {
  return Math.round(ort * 10 + Math.random() * 100 - 50);
}

// Puanı olmayan takımlara ilk puanı verir (eski kayıtlar için de)
function dunyaSiralamaHazirla() {
  let degisti = false;
  dunya.forEach(function (t) {
    if (t.puan === undefined) { t.puan = takimPuaniIlk(ortGuc(t.oyuncular)); degisti = true; }
  });
  if (kariyer.puan === undefined) { kariyer.puan = takimPuaniIlk(ortGuc(kariyer.oyuncular)); degisti = true; }
  if (degisti) kaydet();
}

// ligSirasi: sezon.js'teki siralama() sonucu (0 = sen, 1-7 = dunya[0..6])
function siralamaGuncelle(prim, benPrim) {
  dunyaSiralamaHazirla();
  dunya.forEach(function (t, i) {
    const sezonPuani = ortGuc(t.oyuncular) * 10 + Math.random() * 160 - 80 + (prim[i] || 0);
    t.puan = Math.round(t.puan * 0.4 + sezonPuani * 0.6);
  });
  const benimSezon = ortGuc(kariyer.oyuncular) * 10 + Math.random() * 160 - 80 + benPrim;
  kariyer.puan = Math.round(kariyer.puan * 0.4 + benimSezon * 0.6);
}

function dunyaSirasi() {
  dunyaSiralamaHazirla();
  const liste = dunya.map(function (t, i) {
    return { ad: t.ad, puan: t.puan, guc: Math.round(ortGuc(t.oyuncular)), ben: false, idx: i };
  });
  liste.push({ ad: kariyer.takimAdi, puan: kariyer.puan, guc: Math.round(ortGuc(kariyer.oyuncular)), ben: true, idx: -1 });
  liste.sort(function (a, b) { return b.puan - a.puan; });
  return liste;
}

function siralamaEkrani() {
  const l = dunyaSirasi();
  let benim = 0;
  l.forEach(function (x, i) { if (x.ben) benim = i + 1; });
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Dünya Sıralaması</h2>';
  html += '<div class="bilgi-kutusu">Senin sıran: <b>' + benim + ". / " + l.length + "</b><br>Puan: <b>" + kariyer.puan + "</b><br>Kadro görmek için takıma bas.</div>";
  html += '<div class="tablo-kutusu"><table><tr><th>Takım</th><th>Güç</th><th>Puan</th></tr>';
  l.forEach(function (x, i) {
    const stil = x.ben ? ' style="color:' + kariyer.renk + ';font-weight:bold"' : "";
    html += "<tr" + stil + ' onclick="takimKadro(' + x.idx + ", 'siralamaEkrani()')\"><td>" + (i + 1) + ". " + x.ad + "</td><td>" + x.guc + "</td><td>" + x.puan + "</td></tr>";
  });
  html += "</table></div>";
  uygulama.innerHTML = html;
}
