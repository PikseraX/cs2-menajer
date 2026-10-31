const OLAY_IHTIMAL = 0.3;
const YEMEK_UCRETI = 5000;

function itibarOf() { return kariyer.itibar === undefined ? 50 : kariyer.itibar; }
function itibarDegis(d) { kariyer.itibar = Math.max(0, Math.min(100, itibarOf() + d)); }
function itibarCarpani() { return 0.9 + itibarOf() / 500; }
function oyuncuBul(ad) { return tumKadro().find(function (o) { return o.ad === ad; }); }
function moralDegisOyuncu(o, d) { if (o) o.mor = sinir100(moralOf(o) + d); }
function takimMoralDegis(d) { kariyer.oyuncular.forEach(function (o) { moralDegisOyuncu(o, d); }); }

// ---------- Basın toplantısı ----------
const BASIN_GALIBIYET = [
  { soru: "Gazeteciler galibiyetin sırrını soruyor. Ne dersin?", sec: [
    { ad: "Takımın emeğini öv", itibar: 2, moral: 3 },
    { ad: "Kendine güvenen bir açıklama yap", itibar: 3, moral: 1 },
    { ad: "Rakibi küçümse", itibar: -3, moral: 4 } ] },
  { soru: "Rakip tarafı hakem kararlarından şikâyet etti. Yorumun?", sec: [
    { ad: "Sportmence cevap ver", itibar: 3, moral: 0 },
    { ad: "Yorum yapma", itibar: 0, moral: 1 },
    { ad: "Sert karşılık ver", itibar: -2, moral: 3 } ] },
  { soru: "Bir sonraki hedefin nedir?", sec: [
    { ad: "Şampiyonluk hedefini açıkla", itibar: 2, moral: -2 },
    { ad: "Maç maç ilerleyeceğini söyle", itibar: 1, moral: 2 },
    { ad: "Hedef belirtme", itibar: 0, moral: 0 } ] }
];

const BASIN_MAGLUBIYET = [
  { soru: "Mağlubiyetin nedeni nedir?", sec: [
    { ad: "Sorumluluğu üstlen", itibar: 2, moral: 3 },
    { ad: "Şanssızlıktan bahset", itibar: -1, moral: 2 },
    { ad: "Oyuncuları eleştir", itibar: 0, moral: -5 } ] },
  { soru: "Taraftarlar tepkili. Ne diyorsun?", sec: [
    { ad: "Özür dile ve söz ver", itibar: 1, moral: -1 },
    { ad: "Taraftardan güven iste", itibar: 2, moral: 0 },
    { ad: "Basını suçla", itibar: -4, moral: 3 } ] },
  { soru: "Rakip bunu hak ederek mi kazandı?", sec: [
    { ad: "Evet, tebrik et", itibar: 3, moral: -1 },
    { ad: "Hayır, hakemi suçla", itibar: -3, moral: 3 },
    { ad: "Konuşmaktan kaçın", itibar: -1, moral: 0 } ] }
];

function basinHazirla(kazandi) {
  itibarDegis(kazandi ? 1 : -1);
  const havuz = kazandi ? BASIN_GALIBIYET : BASIN_MAGLUBIYET;
  kariyer.basin = { hafta: kariyer.hafta || 1, kazandi: kazandi, soru: Math.floor(Math.random() * havuz.length), yapildi: false };
}

function basinBekliyor() {
  const b = kariyer.basin;
  return !!b && !b.yapildi && b.hafta === (kariyer.hafta || 1);
}

function basinEkrani() {
  if (!basinBekliyor()) { kariyerEkrani(); return; }
  const b = kariyer.basin;
  const q = (b.kazandi ? BASIN_GALIBIYET : BASIN_MAGLUBIYET)[b.soru];
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Basın Toplantısı</h2>';
  html += '<div class="bilgi-kutusu">' + q.soru + "</div>";
  q.sec.forEach(function (s, i) {
    html += '<button class="takim-butonu" onclick="basinCevap(' + i + ')"><span style="text-align:left">' + s.ad + "<br><small>İtibar " + etkiYazi(s.itibar) + " · Takım morali " + etkiYazi(s.moral) + "</small></span></button>";
  });
  uygulama.innerHTML = html;
}

function basinCevap(i) {
  if (!basinBekliyor()) { kariyerEkrani(); return; }
  const b = kariyer.basin;
  const s = (b.kazandi ? BASIN_GALIBIYET : BASIN_MAGLUBIYET)[b.soru].sec[i];
  itibarDegis(s.itibar);
  takimMoralDegis(s.moral);
  b.yapildi = true;
  kaydet();
  let html = "<h2>Basın Toplantısı</h2>";
  html += '<div class="bilgi-kutusu">Cevabın: <b>' + s.ad + "</b><br>İtibar: <b>" + etkiYazi(s.itibar) + "</b> (şimdi " + itibarOf() + ")<br>Takım morali: <b>" + etkiYazi(s.moral) + "</b></div>";
  html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  uygulama.innerHTML = html;
}

// ---------- Takım içi olaylar ----------
function olayUret() {
  const ilk5 = kariyer.oyuncular;
  if (ilk5.length < 2) return null;
  const tip = rastgeleEleman(["anlasmazlik", "zam", "motivasyon", "sosyal", "yemek"]);
  const a = rastgeleEleman(ilk5);
  let b = rastgeleEleman(ilk5);
  let g = 0;
  while (b === a && g++ < 30) b = rastgeleEleman(ilk5);
  return { tip: tip, a: a.ad, b: b.ad, hafta: kariyer.hafta || 1 };
}

function olayBilgi(o) {
  const a = oyuncuBul(o.a), b = oyuncuBul(o.b);
  if (!a || (o.tip === "anlasmazlik" && (!b || a === b))) return null;
  if (o.tip === "anlasmazlik") {
    return { baslik: "Oyuncular Tartıştı", metin: a.ad + " ve " + b.ad + " antrenmanda sert tartıştı. Takım gerginleşti.", sec: [
      { ad: "Arabuluculuk yap", acik: "%60 başarı: ikisinin morali +4. Başarısızsa ikisi -3." },
      { ad: a.ad + " tarafını tut", acik: a.ad + " +6, " + b.ad + " -8" },
      { ad: b.ad + " tarafını tut", acik: b.ad + " +6, " + a.ad + " -8" } ] };
  }
  if (o.tip === "zam") {
    const yeni = Math.round(temelMaas(a) * 1.1);
    return { baslik: "Maaş Zammı Talebi", metin: a.ad + " (GEN " + a.genel + ") maaşını artırmanı istiyor. Şu anki maaşı " + para(temelMaas(a)) + ".", sec: [
      { ad: "Zammı kabul et", acik: "Maaş " + para(yeni) + " olur, moral +8." },
      { ad: "Reddet", acik: "Moral -8." },
      { ad: "Sezon sonuna ertele", acik: "Moral -2." } ] };
  }
  if (o.tip === "motivasyon") {
    return { baslik: "Motivasyon Düşüklüğü", metin: a.ad + " son zamanlarda isteksiz görünüyor.", sec: [
      { ad: "Özel görüşme yap", acik: a.ad + " morali +6." },
      { ad: "Bir hafta dinlendir", acik: "Yorgunluk -20, moral +2." },
      { ad: "Takım önünde öv", acik: a.ad + " morali +5, diğerleri +1." } ] };
  }
  if (o.tip === "sosyal") {
    return { baslik: "Sosyal Medya Tartışması", metin: a.ad + " sosyal medyada tartışma yarattı, taraftarlar tepkili.", sec: [
      { ad: "Kamuoyu açıklaması yap", acik: "İtibar -1, " + a.ad + " morali +1." },
      { ad: "Oyuncuyu savun", acik: "İtibar -3, " + a.ad + " morali +6." },
      { ad: "Para cezası ver", acik: "İtibar +1, " + a.ad + " morali -6." } ] };
  }
  return { baslik: "Takım Yemeği Teklifi", metin: "Takım arkadaşları moral için bir yemek düzenlemeni öneriyor.", sec: [
    { ad: "Yemeği düzenle (" + para(YEMEK_UCRETI) + ")", acik: "Takım morali +4, itibar +1." },
    { ad: "Geç", acik: "Etkisi yok." } ] };
}

function olayKutusu() {
  let h = '<div class="bilgi-kutusu">İtibar: <b>' + itibarOf() + " / 100</b> (organizasyon geliri ×" + itibarCarpani().toFixed(2) + ")</div>";
  if (basinBekliyor()) h += '<button class="buton" onclick="basinEkrani()">Basın Toplantısı</button>';
  if (kariyer.olay) h += '<button class="buton" onclick="olayEkrani()">Takım İçi Olay!</button>';
  return h;
}

function olayEkrani() {
  const o = kariyer.olay;
  const bilgi = o && olayBilgi(o);
  if (!bilgi) { kariyer.olay = null; kaydet(); kariyerEkrani(); return; }
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>' + bilgi.baslik + "</h2>";
  html += '<div class="bilgi-kutusu">' + bilgi.metin + "<br><small>Haftayı bitirmeden çözmezsen olay kötü sonuçlanır.</small></div>";
  bilgi.sec.forEach(function (s, i) {
    html += '<button class="takim-butonu" onclick="olayCoz(' + i + ')"><span style="text-align:left">' + s.ad + "<br><small>" + s.acik + "</small></span></button>";
  });
  uygulama.innerHTML = html;
}

function olayCoz(i) {
  const o = kariyer.olay;
  const bilgi = o && olayBilgi(o);
  if (!bilgi) { kariyer.olay = null; kaydet(); kariyerEkrani(); return; }
  const a = oyuncuBul(o.a), b = oyuncuBul(o.b);
  const s = [];
  if (o.tip === "anlasmazlik") {
    if (i === 0) {
      if (Math.random() < 0.6) { moralDegisOyuncu(a, 4); moralDegisOyuncu(b, 4); s.push("Arabuluculuk işe yaradı. " + a.ad + " ve " + b.ad + " barıştı (moral +4)."); }
      else { moralDegisOyuncu(a, -3); moralDegisOyuncu(b, -3); s.push("Arabuluculuk başarısız oldu, gerginlik arttı (moral -3)."); }
    } else if (i === 1) {
      moralDegisOyuncu(a, 6); moralDegisOyuncu(b, -8);
      s.push(a.ad + " moral +6, " + b.ad + " moral -8.");
    } else {
      moralDegisOyuncu(b, 6); moralDegisOyuncu(a, -8);
      s.push(b.ad + " moral +6, " + a.ad + " moral -8.");
    }
  } else if (o.tip === "zam") {
    if (i === 0) {
      const yeni = Math.round(temelMaas(a) * 1.1);
      a.maas = yeni;
      moralDegisOyuncu(a, 8);
      s.push(a.ad + " yeni maaşı " + para(yeni) + " (moral +8).");
    } else if (i === 1) {
      moralDegisOyuncu(a, -8);
      s.push(a.ad + " morali -8.");
    } else {
      moralDegisOyuncu(a, -2);
      s.push(a.ad + " morali -2. Konu sezon sonuna ertelendi.");
    }
  } else if (o.tip === "motivasyon") {
    if (i === 0) { moralDegisOyuncu(a, 6); s.push(a.ad + " morali +6."); }
    else if (i === 1) { a.yor = sinir100(yorOf(a) - 20); moralDegisOyuncu(a, 2); s.push(a.ad + " yorgunluk -20, moral +2."); }
    else {
      kariyer.oyuncular.forEach(function (x) { moralDegisOyuncu(x, x === a ? 5 : 1); });
      s.push(a.ad + " morali +5, diğerleri +1.");
    }
  } else if (o.tip === "sosyal") {
    if (i === 0) { itibarDegis(-1); moralDegisOyuncu(a, 1); s.push("İtibar -1, " + a.ad + " morali +1."); }
    else if (i === 1) { itibarDegis(-3); moralDegisOyuncu(a, 6); s.push("İtibar -3, " + a.ad + " morali +6."); }
    else { itibarDegis(1); moralDegisOyuncu(a, -6); s.push("İtibar +1, " + a.ad + " morali -6."); }
  } else {
    if (i === 0) {
      if (kariyer.butce < YEMEK_UCRETI) { alert("Bütçen yetersiz."); return; }
      kariyer.butce -= YEMEK_UCRETI;
      maliIsle("gider", "olay", YEMEK_UCRETI);
      takimMoralDegis(4);
      itibarDegis(1);
      s.push("Takım yemeği güzel geçti. Takım morali +4, itibar +1.");
    } else {
      s.push("Yemek düzenlenmedi.");
    }
  }
  kariyer.olay = null;
  kaydet();
  let html = "<h2>" + bilgi.baslik + "</h2>";
  html += '<div class="bilgi-kutusu"><b>' + bilgi.sec[i].ad + "</b><br>" + s.join("<br>") + "</div>";
  html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  uygulama.innerHTML = html;
}

// haftaGec içinden çağrılır: çözülmeyen olayı sonuçlandırır, yeni olay üretir
function olayHaftalik(rapor) {
  const o = kariyer.olay;
  if (o) {
    const a = oyuncuBul(o.a), b = oyuncuBul(o.b);
    if (o.tip === "anlasmazlik" && a && b) { moralDegisOyuncu(a, -3); moralDegisOyuncu(b, -3); rapor.push("Çözülmeyen tartışma: " + a.ad + " ve " + b.ad + " moral -3."); }
    if (o.tip === "zam" && a) { moralDegisOyuncu(a, -5); rapor.push(a.ad + " zam talebine cevap alamadı, moral -5."); }
    if (o.tip === "motivasyon" && a) { moralDegisOyuncu(a, -3); rapor.push(a.ad + " ilgilenilmediği için moral -3."); }
    if (o.tip === "sosyal") { itibarDegis(-3); rapor.push("Sosyal medya tartışması büyüdü, itibar -3."); }
  }
  kariyer.olay = null;
  if (Math.random() < OLAY_IHTIMAL) {
    kariyer.olay = olayUret();
    if (kariyer.olay) rapor.push("Yeni takım içi olay çıktı. Ana ekrandan bakabilirsin.");
  }
}
