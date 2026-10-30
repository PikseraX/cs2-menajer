const SERBEST_ADLAR = [
  "Vorex", "Kelvix", "Zorax", "Nexo", "Draven", "Kyro", "Tavil", "Brixen", "Joltan", "Mirax",
  "Hexor", "Quila", "Volta", "Ravix", "Zenko", "Taxel", "Orkan", "Drogo", "Sylex", "Narvo",
  "Fenix", "Lumor", "Cavex", "Bolero", "Ryker", "Tazor", "Elvix", "Morgan", "Kasper", "Zyron"
];

function transferUcreti(o) { return o.genel * o.genel * 40; }
function satisFiyati(o) { return Math.round(transferUcreti(o) * 0.6); }
function oyuncuMaasi(o) { return o.maas !== undefined ? o.maas : Math.round(o.genel * o.genel / 2); }

function serbestOyuncuUret(ad) {
  const g = 40 + Math.random() * 30;
  const o = { ad: ad, rol: TARZ_LISTESI[Math.floor(Math.random() * TARZ_LISTESI.length)], yas: 17 + Math.floor(Math.random() * 14) };
  OZELLIKLER.forEach(function (z) { o[z] = sinirla(g + (Math.random() * 20 - 10)); });
  genelHesapla(o);
  return o;
}

function serbestHazirla() {
  if (kariyer.serbest) return;
  kariyer.serbest = karistir(SERBEST_ADLAR).slice(0, 10).map(serbestOyuncuUret);
  kaydet();
}

// Piyasayı 10 oyuncuya tamamlar
function serbestDoldur() {
  while (kariyer.serbest.length < 10) kariyer.serbest.push(serbestOyuncuUret(yeniAd()));
}

// Sezon sonunda piyasa tamamen yenilenir
function serbestYenile() {
  kariyer.serbest = [];
  serbestDoldur();
}

function transferEkrani() {
  serbestHazirla();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Transfer Piyasası</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Yedek: <b>" + yedekListe().length + "/" + YEDEK_MAX + "</b></div>";
  kariyer.serbest.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="transferSec(' + i + ')"><span>' + o.ad + " (" + o.rol + ", " + o.yas + ")</span><span>GEN " + o.genel + " · " + para(transferUcreti(o)) + " · Maaş " + para(oyuncuMaasi(o)) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function transferSec(i) {
  const yeni = kariyer.serbest[i];
  const y = yedekListe();
  let html = '<button class="geri" onclick="transferEkrani()">← Geri</button><h2>' + yeni.ad + "</h2>";
  html += tabloHtml([yeni]);
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b></div>";
  if (y.length < YEDEK_MAX) {
    html += '<button class="buton" onclick="transferYedek(' + i + ', -1)">Yedek kadroya al: ' + para(transferUcreti(yeni)) + "</button>";
  }
  html += "<p>Ya da ilk 5'ten birinin yerine al (o oyuncu satılır):</p>";
  kariyer.oyuncular.forEach(function (e, k) {
    const net = transferUcreti(yeni) - satisFiyati(e);
    const yazi = net >= 0 ? "Ödenecek: " + para(net) : "Kazanç: " + para(-net);
    html += '<button class="takim-butonu" onclick="transferYap(' + i + ", " + k + ')"><span>' + e.ad + " (GEN " + e.genel + ")</span><span>" + yazi + "</span></button>";
  });
  if (y.length > 0) {
    html += "<p>Ya da bir yedeğin yerine al (o oyuncu satılır):</p>";
    y.forEach(function (e, j) {
      const net = transferUcreti(yeni) - satisFiyati(e);
      const yazi = net >= 0 ? "Ödenecek: " + para(net) : "Kazanç: " + para(-net);
      html += '<button class="takim-butonu" onclick="transferYedek(' + i + ", " + j + ')"><span>' + e.ad + " (Yedek, GEN " + e.genel + ")</span><span>" + yazi + "</span></button>";
    });
  }
  uygulama.innerHTML = html;
}

function transferYap(i, k) {
  const yeni = kariyer.serbest[i];
  const eski = kariyer.oyuncular[k];
  const net = transferUcreti(yeni) - satisFiyati(eski);
  if (kariyer.butce - net < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm(eski.ad + " satılacak, " + yeni.ad + " alınacak. Onaylıyor musun?")) return;
  kariyer.butce -= net;
  yeni.bitis = (kariyer.hafta || 1) + 30;
  kariyer.oyuncular[k] = yeni;
  kariyer.serbest[i] = eski;
  kaydet();
  transferEkrani();
}

// j = -1: yeni yedek olarak al, j >= 0: o yedeğin yerine al
function transferYedek(i, j) {
  const yeni = kariyer.serbest[i];
  const y = yedekListe();
  const eski = j >= 0 ? y[j] : null;
  const net = transferUcreti(yeni) - (eski ? satisFiyati(eski) : 0);
  if (kariyer.butce - net < 0) { alert("Bütçen yetersiz."); return; }
  const soru = eski ? eski.ad + " satılacak, " + yeni.ad + " yedeğe alınacak. Onaylıyor musun?" : yeni.ad + " yedek kadroya alınacak. Onaylıyor musun?";
  if (!confirm(soru)) return;
  kariyer.butce -= net;
  yeni.bitis = (kariyer.hafta || 1) + 30;
  if (eski) {
    y[j] = yeni;
    kariyer.serbest[i] = eski;
  } else {
    y.push(yeni);
    kariyer.serbest.splice(i, 1);
    serbestDoldur();
  }
  kaydet();
  transferEkrani();
}
