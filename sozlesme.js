const SOZLESME_EK_HAFTA = 2;
const SOZLESME_UYARI_HAFTA = 4;
const TEKLIF_MIN_GEN = 65;
const TEKLIF_MAX = 2;

function ayrilmaZamaniGeldi(o) {
  return (kariyer.hafta || 1) > o.bitis + SOZLESME_EK_HAFTA;
}

// İlk 5 eksilirse yedekten, yedek yoksa piyasadan en ucuz oyuncuyla tamamlar
function kadroTamamla(rapor, haric) {
  haric = haric || [];
  while (kariyer.oyuncular.length < 5) {
    const y = yedekListe();
    if (y.length > 0) {
      let en = 0;
      y.forEach(function (o, i) { if (o.genel > y[en].genel) en = i; });
      const o = y.splice(en, 1)[0];
      kariyer.oyuncular.push(o);
      rapor.push("Yedekten ilk 5'e alındı: " + o.ad);
      continue;
    }
    serbestHazirla();
    const aday = kariyer.serbest.filter(function (x) { return haric.indexOf(x) < 0; });
    if (aday.length === 0) {
      const n = serbestOyuncuUret(yeniAd());
      kariyer.serbest.push(n);
      aday.push(n);
    }
    let en = aday[0];
    aday.forEach(function (x) { if (transferUcreti(x) < transferUcreti(en)) en = x; });
    const ucret = transferUcreti(en);
    kariyer.butce -= ucret;
    maliIsle("gider", "transfer", ucret);
    kariyer.serbest.splice(kariyer.serbest.indexOf(en), 1);
    en.bitis = (kariyer.hafta || 1) + 30;
    kariyer.oyuncular.push(en);
    rapor.push("Kadro eksikti, piyasadan alındı: " + en.ad + " (GEN " + en.genel + ", " + para(ucret) + ")");
  }
  serbestDoldur();
}

// haftaGec içinden çağrılır
function sozlesmeKontrol(rapor) {
  sozlesmeHazirla();
  const gidenler = tumKadro().filter(ayrilmaZamaniGeldi);
  if (gidenler.length === 0) return;
  serbestHazirla();
  gidenler.forEach(function (o) {
    const i = kariyer.oyuncular.indexOf(o);
    if (i >= 0) kariyer.oyuncular.splice(i, 1);
    else yedekListe().splice(yedekListe().indexOf(o), 1);
    delete o.bitis;
    kariyer.serbest.push(o);
    rapor.push("Sözleşmesi bitti, ayrıldı: " + o.ad + " (GEN " + o.genel + ")");
  });
  while (kariyer.serbest.length > 12) kariyer.serbest.shift();
  kadroTamamla(rapor, gidenler);
}

// ---------- Rakip satın alma teklifleri ----------
function teklifOyuncu(t) {
  return tumKadro().find(function (o) { return o.ad === t.ad; });
}

function teklifTemizle() {
  kariyer.teklifler = (kariyer.teklifler || []).filter(function (t) { return !!teklifOyuncu(t); });
}

function teklifSayisi() {
  teklifTemizle();
  return kariyer.teklifler.length;
}

// Sezon sonunda çağrılır
function teklifUret() {
  kariyer.teklifler = [];
  karistir(tumKadro().filter(function (o) { return o.genel >= TEKLIF_MIN_GEN; })).forEach(function (o) {
    if (kariyer.teklifler.length >= TEKLIF_MAX) return;
    if (Math.random() < 0.5) {
      const fiyat = Math.round(transferUcreti(o) * (1.1 + Math.random() * 0.4) / 1000) * 1000;
      kariyer.teklifler.push({ ad: o.ad, kulup: rastgeleEleman(dunya).ad, fiyat: fiyat });
    }
  });
}

function teklifEkrani() {
  teklifTemizle();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Satın Alma Teklifleri</h2>';
  html += "<p>Rakip kulüpler oyuncuların için teklif yaptı. Teklifler bir sonraki sezon sonuna kadar geçerlidir.</p>";
  if (kariyer.teklifler.length === 0) html += "<p>Şu an teklif yok.</p>";
  kariyer.teklifler.forEach(function (t, i) {
    const o = teklifOyuncu(t);
    html += '<button class="takim-butonu" onclick="teklifDetay(' + i + ')"><span style="text-align:left">' + o.ad + " (" + o.rol + ", GEN " + o.genel + ")<br><small>" + t.kulup + "</small></span><span>" + para(t.fiyat) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function teklifDetay(i) {
  const t = kariyer.teklifler[i];
  const o = t && teklifOyuncu(t);
  if (!o) { teklifEkrani(); return; }
  let html = '<button class="geri" onclick="teklifEkrani()">← Geri</button><h2>' + o.ad + "</h2>";
  html += tabloHtml([o]);
  html += '<div class="bilgi-kutusu">Teklif eden: <b>' + t.kulup + "</b><br>Teklif: <b>" + para(t.fiyat) + "</b><br>Senin satış fiyatın olurdu: " + para(satisFiyati(o)) + "<br>Moral: <b>" + moralOf(o) + "</b></div>";
  html += '<button class="buton" onclick="teklifKabul(' + i + ')">Kabul Et</button>';
  html += '<button class="buton tehlike" onclick="teklifRed(' + i + ')">Reddet (moral -5)</button>';
  uygulama.innerHTML = html;
}

function teklifKabul(i) {
  const t = kariyer.teklifler[i];
  const o = t && teklifOyuncu(t);
  if (!o) { teklifEkrani(); return; }
  if (!confirm(o.ad + " " + t.kulup + " takımına satılacak: +" + para(t.fiyat) + ". Kadro eksik kalırsa yedekten ya da piyasadan en ucuz oyuncu otomatik alınır. Onaylıyor musun?")) return;
  kariyer.butce += t.fiyat;
  maliIsle("gelir", "transfer", t.fiyat);
  const k = kariyer.oyuncular.indexOf(o);
  if (k >= 0) kariyer.oyuncular.splice(k, 1);
  else yedekListe().splice(yedekListe().indexOf(o), 1);
  const rapor = [];
  kadroTamamla(rapor, [o]);
  kariyer.teklifler.splice(i, 1);
  kaydet();
  if (rapor.length > 0) alert(rapor.join("\n"));
  teklifEkrani();
}

function teklifRed(i) {
  const t = kariyer.teklifler[i];
  const o = t && teklifOyuncu(t);
  if (o) o.mor = sinir100(moralOf(o) - 5);
  kariyer.teklifler.splice(i, 1);
  kaydet();
  teklifEkrani();
}
