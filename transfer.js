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
  let toplam = 0;
  for (const z of OZELLIKLER) {
    o[z] = sinirla(g + (Math.random() * 20 - 10));
    toplam += o[z];
  }
  genelHesapla(o);
  return o;
}

function serbestHazirla() {
  if (kariyer.serbest) return;
  kariyer.serbest = karistir(SERBEST_ADLAR).slice(0, 10).map(serbestOyuncuUret);
  kaydet();
}

function transferEkrani() {
  serbestHazirla();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Transfer Piyasası</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b></div>";
  kariyer.serbest.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="transferSec(' + i + ')"><span>' + o.ad + " (" + o.rol + ", " + o.yas + ")</span><span>GEN " + o.genel + " · " + para(transferUcreti(o)) + " · Maaş " + para(oyuncuMaasi(o)) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function transferSec(i) {
  const yeni = kariyer.serbest[i];
  let html = '<button class="geri" onclick="transferEkrani()">← Geri</button><h2>' + yeni.ad + "</h2>";
  html += tabloHtml([yeni]);
  html += "<p>Kimin yerine oynasın? Seçtiğin oyuncu satılır ve piyasaya düşer.</p>";
  kariyer.oyuncular.forEach(function (e, k) {
    const net = transferUcreti(yeni) - satisFiyati(e);
    const yazi = net >= 0 ? "Ödenecek: " + para(net) : "Kazanç: " + para(-net);
    html += '<button class="takim-butonu" onclick="transferYap(' + i + ", " + k + ')"><span>' + e.ad + " (GEN " + e.genel + ")</span><span>" + yazi + "</span></button>";
  });
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
