const ODAK_ADLARI = {
  nisan: "Nişan", bilgi: "Oyun Bilgisi", refleks: "Refleks",
  iletisim: "İletişim", istikrar: "İstikrar", baski: "Baskı"
};

function genelHesapla(o) {
  let t = 0;
  OZELLIKLER.forEach(function (z) { t += o[z]; });
  o.genel = Math.round(t / OZELLIKLER.length);
}

function gelisimSansi(o, odak) {
  if (o.yas < 24) return odak ? 0.6 : 0.15;
  if (o.yas < 30) return odak ? 0.3 : 0.05;
  return 0;
}

function gerilemeSansi(o) {
  if (o.yas >= 33) return 0.25;
  if (o.yas >= 30) return 0.12;
  return 0;
}

function oyuncuOdagi(o) {
  return o.odak || kariyer.odak || "nisan";
}

function antrenmanUygula() {
  const rapor = [];
  kariyer.oyuncular.forEach(function (o) {
    const once = o.genel;
    const odak = oyuncuOdagi(o);
    OZELLIKLER.forEach(function (z) {
      if (Math.random() < gelisimSansi(o, z === odak)) o[z] = Math.min(99, o[z] + 1);
      if (Math.random() < gerilemeSansi(o)) o[z] = Math.max(1, o[z] - 1);
    });
    genelHesapla(o);
    if (o.genel !== once) rapor.push(o.ad + ": " + once + " → " + o.genel);
  });
  return rapor;
}

function yasKontrol() {
  const h = kariyer.hafta || 1;
  if (h % 52 === 1 && h > 1) {
    kariyer.oyuncular.forEach(function (o) { o.yas++; });
    if (kariyer.serbest) kariyer.serbest.forEach(function (o) { o.yas++; });
    return true;
  }
  return false;
}

function odakEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Antrenman Odağı</h2>';
  html += "<p>Bir oyuncuya bas, odağını seç.</p>";
  kariyer.oyuncular.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="oyuncuOdakSec(' + i + ')"><span>' + o.ad + " (" + o.rol + ", " + o.yas + ")</span><span>" + ODAK_ADLARI[oyuncuOdagi(o)] + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function oyuncuOdakSec(i) {
  const o = kariyer.oyuncular[i];
  const secili = oyuncuOdagi(o);
  let html = '<button class="geri" onclick="odakEkrani()">← Geri</button><h2>' + o.ad + "</h2>";
  html += "<p>Seçtiğin özellik her hafta daha hızlı gelişir.</p>";
  OZELLIKLER.forEach(function (z) {
    const renk = z === secili ? ' style="border-color:#f59e0b"' : "";
    html += '<button class="takim-butonu"' + renk + ' onclick="odakKaydet(' + i + ", '" + z + '\')"><span>' + ODAK_ADLARI[z] + "</span><span>" + o[z] + (z === secili ? " · SEÇİLİ" : "") + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function odakKaydet(i, z) {
  kariyer.oyuncular[i].odak = z;
  kaydet();
  odakEkrani();
}

function haftaRaporu(g, rapor, yasArtti) {
  let html = "<h2>Hafta Raporu</h2>";
  html += '<div class="bilgi-kutusu">Ödenen maaş: <b>' + para(g) + "</b><br>Hafta: <b>" + kariyer.hafta + "</b>";
  if (yasArtti) html += "<br>Yeni sezon: oyuncular 1 yaş büyüdü.";
  html += "</div><h2>Gelişim</h2>";
  if (rapor.length === 0) html += "<p>Bu hafta genel değeri değişen oyuncu yok.</p>";
  rapor.forEach(function (r) { html += "<p>" + r + "</p>"; });
  html += '<button class="buton" onclick="kariyerEkrani()">Tamam</button>';
  uygulama.innerHTML = html;
}
