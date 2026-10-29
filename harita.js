const HARITALAR = ["Çöl Kalesi", "Eski Liman", "Bakır Vadi", "Buz Fabrika", "Gece Çarşısı", "Kızıl Tapınak", "Çelik Kule"];

function haritaUret(m) {
  const h = {};
  HARITALAR.forEach(function (x) { h[x] = Math.round(Math.random() * 2 * m - m); });
  return h;
}

// Takımın harita puanlarını döndürür, yoksa oluşturur
function haritaOf(t) {
  if (t.oyuncular === kariyer.oyuncular) {
    if (!kariyer.harita) kariyer.harita = haritaUret(4);
    return kariyer.harita;
  }
  if (!t.harita) t.harita = haritaUret(8);
  return t.harita;
}

function haritaPuani(t, ad) {
  return haritaOf(t)[ad] || 0;
}

function rastgeleHarita() {
  return HARITALAR[Math.floor(Math.random() * HARITALAR.length)];
}

function haritaTablosu(t) {
  const h = haritaOf(t);
  let html = '<h2>Harita Puanları</h2><div class="tablo-kutusu"><table><tr><th>Harita</th><th>Puan</th></tr>';
  HARITALAR.forEach(function (ad) {
    const v = h[ad];
    const stil = v >= 4 ? ' style="color:#22c55e;font-weight:bold"' : (v <= -4 ? ' style="color:#ef4444"' : "");
    html += "<tr><td>" + ad + "</td><td" + stil + ">" + (v > 0 ? "+" : "") + v + "</td></tr>";
  });
  return html + "</table></div>";
}
