// Rakiplerin başlangıç hâli (yeni kariyer her zaman buradan başlar)
const DUNYA_ILK = JSON.parse(JSON.stringify(dunya));
const RAKIP_GELISIM_HAFTA = 12;
const TOPLAM_TAKIM = 100; // senin takımın dahil
const GUC_MIN = 35;
const GUC_MAX = 90;

const HECE_1 = ["Kel", "Zor", "Vor", "Nex", "Dra", "Kyr", "Tav", "Bri", "Jol", "Mir", "Hex", "Qui", "Vol", "Rav", "Zen", "Tax", "Ork", "Dro", "Syl", "Nar", "Fen", "Lum", "Cav", "Ryk", "Taz", "Elv", "Zyr", "Pyr", "Gal", "Mox"];
const HECE_2 = ["vix", "ax", "en", "or", "ex", "ion", "an", "ik", "ul", "os", "ys", "ar", "ron", "dex", "lux", "tor", "mar", "zen", "kai", "rox", "vel", "nix", "tis", "ban", "dal", "rek", "mon", "sul", "tek", "wen", "yor", "zak"];

function rastgeleEleman(d) {
  return d[Math.floor(Math.random() * d.length)];
}

function kullanilanAdlar() {
  const s = new Set();
  dunya.forEach(function (t) {
    s.add(t.ad);
    t.oyuncular.forEach(function (o) { s.add(o.ad); });
  });
  kariyer.oyuncular.forEach(function (o) { s.add(o.ad); });
  if (kariyer.serbest) kariyer.serbest.forEach(function (o) { s.add(o.ad); });
  return s;
}

// Kullanılmamış bir isim üretir ve kümeye ekler
function benzersizAd(kullanilan) {
  for (let i = 0; i < 300; i++) {
    const ad = rastgeleEleman(HECE_1) + rastgeleEleman(HECE_2);
    if (!kullanilan.has(ad)) { kullanilan.add(ad); return ad; }
  }
  const ad = rastgeleEleman(HECE_1) + rastgeleEleman(HECE_2) + Math.floor(Math.random() * 90 + 10);
  kullanilan.add(ad);
  return ad;
}

function yeniAd() {
  return benzersizAd(kullanilanAdlar());
}

function takimOrt(t) {
  return Math.round(ortGuc(t.oyuncular));
}

function rakipOyuncuGelistir(o, odak) {
  for (let h = 0; h < RAKIP_GELISIM_HAFTA; h++) {
    OZELLIKLER.forEach(function (z) {
      if (Math.random() < gelisimSansi(o, z === odak)) o[z] = Math.min(99, o[z] + 1);
      if (Math.random() < gerilemeSansi(o)) o[z] = Math.max(1, o[z] - 1);
    });
  }
  genelHesapla(o);
}

function rakipOyuncuUret(ad, rol, g) {
  const o = { ad: ad, rol: rol, yas: 17 + Math.floor(Math.random() * 11) };
  OZELLIKLER.forEach(function (z) { o[z] = sinirla(g + (Math.random() * 20 - 10)); });
  genelHesapla(o);
  return o;
}

// Rakip sayısını 99'a tamamlar (güç 35-90, ortada yoğun)
function dunyaGenislet() {
  const liste = kariyer.rakipler;
  const kullanilan = new Set();
  liste.forEach(function (t) {
    kullanilan.add(t.ad);
    t.oyuncular.forEach(function (o) { kullanilan.add(o.ad); });
  });
  kariyer.oyuncular.forEach(function (o) { kullanilan.add(o.ad); });
  if (kariyer.serbest) kariyer.serbest.forEach(function (o) { kullanilan.add(o.ad); });

  while (liste.length < TOPLAM_TAKIM - 1) {
    const u = (Math.random() + Math.random()) / 2;
    const guc = Math.round(GUC_MIN + u * (GUC_MAX - GUC_MIN));
    const ad = benzersizAd(kullanilan);
    const oyuncular = ROLLER.map(function (rol) {
      return rakipOyuncuUret(benzersizAd(kullanilan), rol, guc);
    });
    liste.push({ ad: ad, guc: guc, oyuncular: oyuncular });
  }
}

// dunya listesini kariyer kaydındaki rakiplere bağlar
function rakipleriBagla() {
  if (!kariyer.rakipler) kariyer.rakipler = JSON.parse(JSON.stringify(DUNYA_ILK));
  if (kariyer.rakipler.length < TOPLAM_TAKIM - 1) {
    dunyaGenislet();
    kaydet();
  }
  dunya.splice(0, dunya.length, ...kariyer.rakipler);
}

// Sezon sonu: tüm takımlar gelişir, rakipler transfer yapar.
// Ekranda yalnızca senin yeni ligindeki takımlar gösterilir.
function rakipSezonSonu() {
  rakipleriBagla();
  const haberler = [];
  const ozet = [];
  const ligdekiler = kariyer.sezon.takimlar;
  dunya.forEach(function (t, ti) {
    const ligde = ligdekiler.indexOf(ti) >= 0;
    const once = takimOrt(t);
    rakipHaritaGelisim(t);
    t.oyuncular.forEach(function (o) {
      rakipOyuncuGelistir(o, rastgeleEleman(OZELLIKLER));
    });
    if (Math.random() < 0.6) {
      let zi = 0;
      t.oyuncular.forEach(function (o, i) {
        if (o.genel < t.oyuncular[zi].genel) zi = i;
      });
      const zayif = t.oyuncular[zi];
      const aday = rakipOyuncuUret(yeniAd(), zayif.rol, t.guc + Math.random() * 16 - 6);
      if (aday.genel >= zayif.genel + 3) {
        t.oyuncular[zi] = aday;
        if (ligde) {
          haberler.push(t.ad + ": " + zayif.ad + " (GEN " + zayif.genel + ") ayrıldı, " + aday.ad + " (GEN " + aday.genel + ") geldi.");
        }
      }
    }
    if (ligde) ozet.push({ ad: t.ad, once: once, sonra: takimOrt(t) });
  });
  return { haberler: haberler, ozet: ozet };
}

function sezonSonuEkrani(no, sira, odul, r, sonuc) {
  let html = "<h2>Sezon " + no + " Bitti</h2>";
  html += '<div class="bilgi-kutusu">Sıralaman: <b>' + sira + ".</b><br><b>" + sonuc.mesaj + "</b><br>Sezon ödülü: <b>+" + para(odul) + "</b></div>";
  html += "<h2>Yeni Ligindeki Takımların Gücü</h2>";
  html += '<div class="tablo-kutusu"><table><tr><th>Takım</th><th>Önce</th><th>Sonra</th><th>Fark</th></tr>';
  r.ozet.forEach(function (x) {
    const f = x.sonra - x.once;
    html += "<tr><td>" + x.ad + "</td><td>" + x.once + "</td><td>" + x.sonra + "</td><td>" + (f > 0 ? "+" : "") + f + "</td></tr>";
  });
  html += "</table></div><h2>Lig Transferleri</h2>";
  if (r.haberler.length === 0) html += "<p>Bu sezon ligindeki rakipler transfer yapmadı.</p>";
  r.haberler.forEach(function (h) { html += "<p>" + h + "</p>"; });
  html += '<button class="buton" onclick="kariyerEkrani()">Yeni Sezona Başla</button>';
  uygulama.innerHTML = html;
}
