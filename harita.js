const HARITALAR = ["Çöl Kalesi", "Eski Liman", "Bakır Vadi", "Buz Fabrika", "Gece Çarşısı", "Kızıl Tapınak", "Çelik Kule"];
const HARITA_MAX = 10;
const HARITA_MIN = -10;

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

// ---------- Harita antrenmanı ----------
function haritaGelisimSansi(v) { return 0.6 * (HARITA_MAX - v) / (HARITA_MAX - HARITA_MIN); }
function haritaKayipSansi(v) { return 0.1 * (v - HARITA_MIN) / (HARITA_MAX - HARITA_MIN); }

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

// Sezon sonunda rakip 14 hafta harita antrenmanı yapmış sayılır
function rakipHaritaGelisim(t) {
  const h = haritaOf(t);
    for (let hafta = 0; hafta < 28; hafta++) {
    const odak = rastgeleHarita();
    HARITALAR.forEach(function (ad) {
      const v = h[ad];
      if (ad === odak) {
        if (v < HARITA_MAX && Math.random() < haritaGelisimSansi(v)) h[ad] = v + 1;
      } else if (v > HARITA_MIN && Math.random() < haritaKayipSansi(v)) {
        h[ad] = v - 1;
      }
    });
  }
}

// ---------- Sıralı harita yasaklama (lig ve turnuva) ----------
let banDurum = null;

function haftaRakip() {
  const sz = kariyer.sezon;
  const m = sz.fikstur[sz.gun].find(function (x) { return x[0] === 0 || x[1] === 0; });
  return ligTakim(m[0] === 0 ? m[1] : m[0]);
}

function banKalan() {
  const yasak = banDurum.banlar.map(function (b) { return b.harita; });
  return HARITALAR.filter(function (x) { return yasak.indexOf(x) < 0; });
}

// Rakip, kalan haritalar arasında senin en avantajlı olduğun haritayı yasaklar
function rakipBanSec(rakip, kalan) {
  const hb = haritaOf({ oyuncular: kariyer.oyuncular });
  const hr = haritaOf(rakip);
  let en = kalan[0];
  kalan.forEach(function (x) {
    if ((hb[x] - hr[x]) > (hb[en] - hr[en])) en = x;
  });
  return en;
}

function hazirlikEkrani() {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (sz.bitti || sz.oynandi) { kariyerEkrani(); return; }
  banDurum = { mod: "lig", rakip: haftaRakip(), hedef: 1, geri: "kariyerEkrani()", banlar: [] };
  banEkrani();
}

function banEkrani() {
  const d = banDurum;
  if (!d) { kariyerEkrani(); return; }
  const an = personelSeviye("analist");
  const hb = haritaOf({ oyuncular: kariyer.oyuncular });
  const hr = haritaOf(d.rakip);
  const kalan = banKalan();
  let html = '<button class="geri" onclick="' + d.geri + '">← Geri</button><h2>Harita Yasaklama</h2>';
  html += '<div class="bilgi-kutusu">Rakip: <b>' + d.rakip.ad + "</b><br>Güç: <b>" + Math.round(ortGuc(d.rakip.oyuncular)) + "</b>";
  if (an >= 1) {
    if (d.rakip.strateji) html += "<br>Strateji: <b>" + d.rakip.strateji + "</b>";
    let en = HARITALAR[0];
    HARITALAR.forEach(function (x) { if (hr[x] > hr[en]) en = x; });
    html += "<br>Rakibin en güçlü haritası: <b>" + en + "</b>";
  } else {
    html += "<br>Strateji ve harita bilgisi gizli (Analist gerekli)";
  }
  html += "<br>" + (d.mod === "lig" ? "Her taraf 3 harita yasaklar, kalan 1 haritada maç oynanır." : "Her taraf 2 harita yasaklar, kalan 3 haritada BO3 oynanır (2 harita kazanan turu geçer).") + "</div>";
  html += "<p>Kalan harita: <b>" + kalan.length + "</b> · Hedef: <b>" + d.hedef + "</b></p>";
  if (d.banlar.length > 0) {
    html += "<p>" + d.banlar.map(function (b, i) {
      return (i + 1) + ". " + (b.kim === "sen" ? "Sen" : "Rakip") + ": " + b.harita;
    }).join("<br>") + "</p>";
  }
  if (kalan.length === d.hedef) {
    html += '<div class="bilgi-kutusu">Oynanacak harita' + (kalan.length > 1 ? "lar" : "") + ": <b>" + kalan.join(", ") + "</b></div>";
    html += '<button class="buton" onclick="banOyna()">Maçı Oyna</button>';
  } else {
    if (an >= 3) {
      let oneri = kalan[0];
      kalan.forEach(function (x) { if ((hr[x] - hb[x]) > (hr[oneri] - hb[oneri])) oneri = x; });
      html += '<div class="bilgi-kutusu" style="border-color:#22c55e">Analist tavsiyesi: <b>' + oneri + "</b> haritasını yasakla (rakibin en avantajlı olduğu harita).</div>";
    }
    html += "<p>Sıra sende: bir harita yasakla.</p>";
    kalan.forEach(function (ad) {
      let yazi, renk = "";
      if (an >= 2) {
        const fark = hb[ad] - hr[ad];
        yazi = "Sen " + (hb[ad] > 0 ? "+" : "") + hb[ad] + " · Rakip " + (hr[ad] > 0 ? "+" : "") + hr[ad] + " · Fark " + (fark > 0 ? "+" : "") + fark;
        renk = fark > 0 ? ' style="border-color:#22c55e"' : (fark < 0 ? ' style="border-color:#ef4444"' : "");
      } else {
        yazi = "Sen " + (hb[ad] > 0 ? "+" : "") + hb[ad] + " · Rakip ?";
      }
      html += '<button class="takim-butonu"' + renk + " onclick=\"banYap('" + ad + "')\"><span style=\"text-align:left\">" + ad + "<br><small>" + yazi + "</small></span><span>Yasakla</span></button>";
    });
  }
  uygulama.innerHTML = html;
}

function banYap(ad) {
  if (!banDurum) return;
  if (banKalan().length <= banDurum.hedef) return;
  banDurum.banlar.push({ kim: "sen", harita: ad });
  const kalan = banKalan();
  if (kalan.length > banDurum.hedef) {
    banDurum.banlar.push({ kim: "rakip", harita: rakipBanSec(banDurum.rakip, kalan) });
  }
  banEkrani();
}

function banOyna() {
  const d = banDurum;
  if (!d) return;
  const kalan = banKalan();
  if (kalan.length !== d.hedef) return;
  banDurum = null;
  if (d.mod === "lig") {
    canliMacHazirla(kalan[0]);
  } else {
    const sen = d.banlar.filter(function (b) { return b.kim === "sen"; }).map(function (b) { return b.harita; }).join(", ");
    const rk = d.banlar.filter(function (b) { return b.kim === "rakip"; }).map(function (b) { return b.harita; }).join(", ");
    turnuvaTurOyna(kalan, "Yasaklar: sen " + sen + " · rakip " + rk);
  }
}
