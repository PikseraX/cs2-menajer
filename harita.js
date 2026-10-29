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
const HARITA_MAX = 10;
const HARITA_MIN = -10;

function haritaGelisimSansi(v) { return 0.6 * (HARITA_MAX - v) / (HARITA_MAX - HARITA_MIN); }
function haritaKayipSansi(v) { return 0.1 * (v - HARITA_MIN) / (HARITA_MAX - HARITA_MIN); }

// Hafta sonunda çağrılır: odak haritası gelişir, diğerleri aşınır
function haritaAntrenmaniUygula(rapor) {
  const h = haritaOf({ oyuncular: kariyer.oyuncular });
  const odak = kariyer.haritaOdak;
  HARITALAR.forEach(function (ad) {
    const v = h[ad];
    if (ad === odak) {
      if (v < HARITA_MAX && Math.random() < haritaGelisimSansi(v)) {
        h[ad] = v + 1;
        rapor.push("Harita " + ad + ": " + v + " → " + (v + 1) + " (antrenman)");
      }
    } else if (v > HARITA_MIN && Math.random() < haritaKayipSansi(v)) {
      h[ad] = v - 1;
      rapor.push("Harita " + ad + ": " + v + " → " + (v - 1) + " (pratik kaybı)");
    }
  });
}

function haritaAntrenmanEkrani() {
  const h = haritaOf({ oyuncular: kariyer.oyuncular });
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Harita Antrenmanı</h2>';
  html += "<p>Her hafta tek haritaya odaklanırsın. Kötü haritalar hızlı gelişir, yüksek haritalar yavaş. Çalışılmayan haritalar zamanla düşer.</p>";
  if (!kariyer.haritaOdak) html += '<div class="bilgi-kutusu" style="border-color:#ef4444">Odak seçilmedi: tüm haritalar aşınır.</div>';
  HARITALAR.forEach(function (ad) {
    const v = h[ad];
    const secili = ad === kariyer.haritaOdak;
    const renk = secili ? ' style="border-color:#f59e0b"' : "";
    const gel = v >= HARITA_MAX ? "max" : Math.round(haritaGelisimSansi(v) * 100) + "%";
    const kay = v <= HARITA_MIN ? "0%" : Math.round(haritaKayipSansi(v) * 100) + "%";
    html += '<button class="takim-butonu"' + renk + ' onclick="haritaOdakSec(\'' + ad + '\')"><span style="text-align:left">' + ad + (secili ? " · SEÇİLİ" : "") + "<br>Puan: " + (v > 0 ? "+" : "") + v + '</span><span style="text-align:right">Gelişme: ' + gel + "<br>Kayıp: " + kay + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function haritaOdakSec(ad) {
  kariyer.haritaOdak = ad;
  kaydet();
  haritaAntrenmanEkrani();
}
