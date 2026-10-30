const AKADEMI_MAX = 4;
const AKADEMI_IMZA = 10000;
const AKADEMI_MAAS = 500;
const SCOUT_MAAS = 1000;
const SCOUT_MALIYET = [0, 30000, 80000, 200000]; // hedef seviye
const SCOUT_BELIRSIZLIK = [0, 14, 8, 3];

function akademiHazirla() {
  let d = false;
  if (!kariyer.akademi) { kariyer.akademi = []; d = true; }
  if (kariyer.scout === undefined) { kariyer.scout = 0; d = true; }
  if (kariyer.scout >= 1 && !kariyer.adaylar) { adaylariUret(); d = true; }
  if (d) kaydet();
}

function akademiGideri() {
  return (kariyer.akademi || []).length * AKADEMI_MAAS + (kariyer.scout || 0) * SCOUT_MAAS;
}

function adayUret() {
  const r = (Math.random() + Math.random()) / 2;
  const pot = Math.round(55 + r * 40);
  const g = 28 + Math.random() * 12;
  const o = { ad: yeniAd(), rol: TARZ_LISTESI[Math.floor(Math.random() * TARZ_LISTESI.length)], yas: 16 + Math.floor(Math.random() * 3), pot: pot };
  OZELLIKLER.forEach(function (z) { o[z] = sinirla(g + Math.random() * 16 - 8); });
  genelHesapla(o);
  const w = SCOUT_BELIRSIZLIK[kariyer.scout];
  const lo = Math.max(1, Math.round(pot - Math.random() * w));
  o.tahmin = [lo, Math.min(99, lo + w)];
  return o;
}

function adaylariUret() {
  kariyer.adaylar = [];
  for (let i = 0; i < 2 + kariyer.scout; i++) kariyer.adaylar.push(adayUret());
}

// Hafta sonunda: akademi gelişimi ve aday yenileme (haftaGec içinden çağrılır)
function akademiHaftalik(rapor) {
  (kariyer.akademi || []).forEach(function (o) {
    const once = o.genel;
    if (o.genel < o.pot) {
      OZELLIKLER.forEach(function (z) { if (Math.random() < 0.35) o[z] = Math.min(99, o[z] + 1); });
      genelHesapla(o);
    }
    if (o.genel !== once) rapor.push("Akademi " + o.ad + ": " + once + " → " + o.genel);
  });
  if ((kariyer.scout || 0) >= 1 && kariyer.hafta % 4 === 1) adaylariUret();
}

function tahminYazi(o) {
  return o.tahmin ? o.tahmin[0] + " - " + o.tahmin[1] : "bilinmiyor";
}

function akademiEkrani() {
  akademiHazirla();
  const a = kariyer.akademi;
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Akademi ve Scout</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Akademi: <b>" + a.length + "/" + AKADEMI_MAX + "</b> (haftalık " + para(a.length * AKADEMI_MAAS) + ")<br>Scout seviyesi: <b>" + (kariyer.scout || "yok") + "</b>" + (kariyer.scout ? " (haftalık " + para(kariyer.scout * SCOUT_MAAS) + ")" : "") + "<br>Yedek kadro: <b>" + yedekListe().length + "/" + YEDEK_MAX + "</b></div>";
  if (kariyer.scout < 3) {
    const hedef = kariyer.scout + 1;
    html += '<button class="buton" onclick="scoutYukselt()">' + (kariyer.scout === 0 ? "Scout İşe Al" : "Scout Seviyesini Yükselt (" + hedef + ")") + ": " + para(SCOUT_MALIYET[hedef]) + "</button>";
  }
  html += "<h2>Akademi Oyuncuları</h2>";
  if (a.length === 0) html += "<p>Akademide oyuncu yok.</p>";
  a.forEach(function (o, i) {
    html += '<button class="takim-butonu" onclick="akademiOyuncu(' + i + ')"><span style="text-align:left">' + o.ad + " (" + o.rol + ", " + o.yas + ")<br><small>Potansiyel tahmini: " + tahminYazi(o) + "</small></span><span>GEN " + o.genel + "</span></button>";
  });
  html += "<h2>Scout Adayları</h2>";
  if (!kariyer.scout) {
    html += "<p>Aday görmek için scout işe al. Aday listesi her 4 haftada bir yenilenir.</p>";
  } else {
    (kariyer.adaylar || []).forEach(function (o, i) {
      html += '<button class="takim-butonu" onclick="adayGoster(' + i + ')"><span style="text-align:left">' + o.ad + " (" + o.rol + ", " + o.yas + ")<br><small>Potansiyel tahmini: " + tahminYazi(o) + "</small></span><span>GEN " + o.genel + "</span></button>";
    });
  }
  uygulama.innerHTML = html;
}

function scoutYukselt() {
  const hedef = (kariyer.scout || 0) + 1;
  if (hedef > 3) return;
  const m = SCOUT_MALIYET[hedef];
  if (kariyer.butce - m < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm("Scout seviyesi " + hedef + " olacak: " + para(m) + ". Haftalık scout maaşı " + para(hedef * SCOUT_MAAS) + " olur. Onaylıyor musun?")) return;
  kariyer.butce -= m;
  maliIsle("gider", "akademi", m);
  kariyer.scout = hedef;
  adaylariUret();
  kaydet();
  akademiEkrani();
}

function adayGoster(i) {
  const o = kariyer.adaylar[i];
  let html = '<button class="geri" onclick="akademiEkrani()">← Geri</button><h2>' + o.ad + "</h2>";
  html += tabloHtml([o]);
  html += '<div class="bilgi-kutusu">Potansiyel tahmini: <b>' + tahminYazi(o) + "</b><br>İmza ücreti: <b>" + para(AKADEMI_IMZA) + "</b><br>Akademi maaşı: <b>" + para(AKADEMI_MAAS) + "</b>/hafta</div>";
  html += '<button class="buton" onclick="adayAl(' + i + ')">Akademiye Al</button>';
  uygulama.innerHTML = html;
}

function adayAl(i) {
  if (kariyer.akademi.length >= AKADEMI_MAX) { alert("Akademi dolu. Önce birini yükselt veya serbest bırak."); return; }
  if (kariyer.butce - AKADEMI_IMZA < 0) { alert("Bütçen yetersiz."); return; }
  const o = kariyer.adaylar[i];
  if (!confirm(o.ad + " akademiye alınacak: " + para(AKADEMI_IMZA) + ". Onaylıyor musun?")) return;
  kariyer.butce -= AKADEMI_IMZA;
  maliIsle("gider", "akademi", AKADEMI_IMZA);
  kariyer.akademi.push(o);
  kariyer.adaylar.splice(i, 1);
  kaydet();
  akademiEkrani();
}

function akademiOyuncu(i) {
  const o = kariyer.akademi[i];
  let html = '<button class="geri" onclick="akademiEkrani()">← Geri</button><h2>' + o.ad + "</h2>";
  html += tabloHtml([o]);
  html += '<div class="bilgi-kutusu">Potansiyel tahmini: <b>' + tahminYazi(o) + "</b><br>" + (o.genel >= o.pot ? "Potansiyeline ulaştı, artık gelişmez." : "Akademide haftalık gelişiyor.") + "</div>";
  html += '<button class="buton" onclick="akademiYukselt(' + i + ')">Yedek Kadroya Yükselt</button>';
  html += '<button class="buton tehlike" onclick="akademiCikar(' + i + ')">Serbest Bırak</button>';
  uygulama.innerHTML = html;
}

function akademiYukselt(i) {
  if (yedekListe().length >= YEDEK_MAX) { alert("Yedek kadro dolu. Önce bir yedeği sat veya ilk 5'e al."); return; }
  const o = kariyer.akademi[i];
  if (!confirm(o.ad + " yedek kadroya yükseltilecek. Onaylıyor musun?")) return;
  kariyer.akademi.splice(i, 1);
  o.bitis = (kariyer.hafta || 1) + 30;
  delete o.tahmin;
  yedekListe().push(o);
  kaydet();
  akademiEkrani();
}

function akademiCikar(i) {
  const o = kariyer.akademi[i];
  if (!confirm(o.ad + " serbest bırakılacak, geri ödeme yok. Onaylıyor musun?")) return;
  kariyer.akademi.splice(i, 1);
  kaydet();
  akademiEkrani();
}
