// ---- Ekonomi ayarları (hepsi buradan değişir) ----
const SPONSOR_TABAN = 2000;
const SPONSOR_SIRA_CARPANI = 90;
const MAC_GALIBIYET = 20000;
const MAC_MAGLUBIYET = 5000;
const MAC_ODUL_CARPANI = [2, 1.5, 1]; // 1. Lig, 2. Lig, 3. Lig
const BORC_FAIZ = 0.02;

const GELIR_ADLARI = { mac: "Maç ödülü", sezon: "Sezon sonu ödülü", turnuva: "Turnuva ödülü", sponsor: "Sponsor", transfer: "Oyuncu satışı / takas kazancı" };
const GIDER_ADLARI = { maas: "Maaşlar", transfer: "Transfer ücretleri", yenileme: "Sözleşme yenileme", faiz: "Borç faizi" };

function sponsorGeliri() {
  return SPONSOR_TABAN + (101 - benimDunyaSirasi()) * SPONSOR_SIRA_CARPANI;
}

function macOdulu(kazandi) {
  return Math.round((kazandi ? MAC_GALIBIYET : MAC_MAGLUBIYET) * MAC_ODUL_CARPANI[kariyer.ligNo - 1]);
}

// Sezon bazlı gelir/gider defteri
function maliHazirla() {
  sezonHazirla();
  const no = kariyer.sezon.no;
  if (!kariyer.mali) kariyer.mali = { sezon: no, gelir: {}, gider: {} };
  if (kariyer.mali.sezon !== no) {
    (kariyer.maliGecmis = kariyer.maliGecmis || []).push(kariyer.mali);
    kariyer.mali = { sezon: no, gelir: {}, gider: {} };
  }
}

// tur: "gelir" veya "gider", kat: kategori adı, miktar: pozitif sayı
function maliIsle(tur, kat, miktar) {
  maliHazirla();
  kariyer.mali[tur][kat] = (kariyer.mali[tur][kat] || 0) + miktar;
}

function maliToplam(o) {
  return Object.keys(o).reduce(function (s, k) { return s + o[k]; }, 0);
}

function maliSatirlari(o, adlar) {
  let h = "";
  Object.keys(adlar).forEach(function (k) {
    if (o[k]) h += "<br>" + adlar[k] + ": <b>" + para(o[k]) + "</b>";
  });
  return h || "<br>-";
}

function ekonomiEkrani() {
  maliHazirla();
  const m = kariyer.mali;
  const gelir = maliToplam(m.gelir), gider = maliToplam(m.gider);
  const sira = benimDunyaSirasi();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Finans</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Haftalık maaş: <b>" + para(haftalikGider()) + "</b><br>Haftalık sponsor: <b>" + para(sponsorGeliri()) + "</b> (dünya sırası " + sira + ")<br>Haftalık net: <b>" + para(sponsorGeliri() - haftalikGider()) + "</b><br>Sezonluk maaş (28 hafta): <b>" + para(haftalikGider() * 28) + "</b>";
  if (kariyer.butce < 0) html += '<br><span style="color:#ef4444">Borçtasın: her hafta %' + (BORC_FAIZ * 100) + " faiz işler.</span>";
  html += "</div>";
  html += '<div class="bilgi-kutusu"><b>Sezon ' + m.sezon + " gelirleri</b>" + maliSatirlari(m.gelir, GELIR_ADLARI) + "<br><b>Toplam: " + para(gelir) + "</b></div>";
  html += '<div class="bilgi-kutusu"><b>Sezon ' + m.sezon + " giderleri</b>" + maliSatirlari(m.gider, GIDER_ADLARI) + "<br><b>Toplam: " + para(gider) + "</b></div>";
  html += '<div class="bilgi-kutusu">Sezon neti: <b>' + para(gelir - gider) + "</b></div>";
  const g = kariyer.maliGecmis || [];
  if (g.length > 0) {
    html += "<h2>Önceki Sezonlar</h2>";
    g.slice(-5).reverse().forEach(function (x) {
      const a = maliToplam(x.gelir), b = maliToplam(x.gider);
      html += "<p>Sezon " + x.sezon + ": gelir " + para(a) + " · gider " + para(b) + " · net " + para(a - b) + "</p>";
    });
  }
  html += "<p>Not: Kayıtlar bu güncellemeden itibaren tutulur.</p>";
  uygulama.innerHTML = html;
}
