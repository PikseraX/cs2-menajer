function formulMaas(o) { return Math.round(o.genel * o.genel / 2); }
function temelMaas(o) { return o.maas !== undefined ? o.maas : formulMaas(o); }

function sozlesmeHazirla() {
  const h = kariyer.hafta || 1;
  tumKadro().forEach(function (o) {
    if (o.bitis === undefined) o.bitis = h + 20;
  });
}

function sozlesmeBitti(o) {
  return (kariyer.hafta || 1) > o.bitis;
}

function maas(o) {
  const baz = temelMaas(o);
  return sozlesmeBitti(o) ? Math.round(baz * 1.25) : baz;
}

function haftalikGider() {
  let t = kariyer.oyuncular.reduce(function (s, o) { return s + maas(o); }, 0);
  yedekListe().forEach(function (o) { t += Math.round(maas(o) * YEDEK_MAAS_ORANI); });
  return t + akademiGideri() + personelGideri();
}

function maasKutusu() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  let h = '<div class="bilgi-kutusu">Hafta: <b>' + hf + "</b><br>Haftalık maaş gideri: <b>" + para(haftalikGider()) + "</b>";
  if (kariyer.butce < 0) {
    h += '<br><span style="color:#ef4444">Bütçe eksi! Transfer yapamazsın.</span>';
  }
  tumKadro().filter(sozlesmeBitti).forEach(function (o) {
    h += '<br><span style="color:#ef4444">' + o.ad + ": sözleşmesi bitti, " + (o.bitis + SOZLESME_EK_HAFTA + 1 - hf) + " hafta içinde ayrılır (maaş %25 zamlı).</span>";
  });
  const yaklasan = tumKadro().filter(function (o) {
    const kalan = o.bitis - hf + 1;
    return kalan > 0 && kalan <= SOZLESME_UYARI_HAFTA;
  }).map(function (o) { return o.ad + " (" + (o.bitis - hf + 1) + " hf)"; });
  if (yaklasan.length > 0) {
    h += '<br><span style="color:#f59e0b">Sözleşmesi yaklaşan: ' + yaklasan.join(", ") + "</span>";
  }
  return h + "</div>";
}

function haftaGec() {
  sezonHazirla();
  const sz = kariyer.sezon;
  const ligHaftasi = sz.hf % 2 === 0;
  if (!sz.bitti) {
    if (ligHaftasi && !sz.oynandi) { alert("Önce bu haftanın lig maçını oyna."); return; }
    const tu = kariyer.turnuva;
    if (!ligHaftasi && tu && tu.sezon === sz.no && tu.sonHafta !== kariyer.hafta) { alert("Önce bu haftanın turnuva maçını oyna."); return; }
  }
  const g = haftalikGider();
  const sp = sponsorGeliri();
  if (!confirm("Hafta bitecek. Maaş: -" + para(g) + ", sponsor: +" + para(sp) + ". Onaylıyor musun?")) return;
  kariyer.butce += sp - g;
  maliIsle("gelir", "sponsor", sp);
  maliIsle("gider", "maas", g);
  maliIsle("gider", "maas", g - personelGideri());
  maliIsle("gider", "personel", personelGideri());
  let faiz = 0;
  if (kariyer.butce < 0) {
    faiz = Math.round(-kariyer.butce * BORC_FAIZ);
    kariyer.butce -= faiz;
    maliIsle("gider", "faiz", faiz);
  }
  kariyer.hafta = (kariyer.hafta || 1) + 1;
  if (!sz.bitti) {
    sz.oynandi = false;
    sz.hf++;
    sz.gun = Math.floor(sz.hf / 2);
    if (sz.hf >= sz.fikstur.length * 2) sz.bitti = true;
  }
  const rapor = antrenmanUygula();
  haritaAntrenmaniUygula(rapor);
  akademiHaftalik(rapor);
  formHaftalik(rapor);
  const yasArtti = yasKontrol();
  kaydet();
  haftaRaporu(g, rapor, yasArtti, sp, faiz);
}

function sozlesmeEkrani() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Sözleşmeler</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Hafta: <b>" + hf + "</b><br>Yenileme: +26 hafta, 4 haftalık maaş ödenir, maaş %15 artar.<br>Sözleşmesi biten oyuncu " + SOZLESME_EK_HAFTA + " hafta içinde yenilenmezse ayrılır. Morali 40'ın altındaki oyuncu yenilemeyi reddeder.</div>";
  tumKadro().forEach(function (o, i) {
    const kalan = o.bitis - hf + 1;
    const durum = kalan > 0 ? kalan + " hafta kaldı" : "SÖZLEŞME BİTTİ (" + (o.bitis + SOZLESME_EK_HAFTA + 1 - hf) + " hf içinde ayrılır)";
    const renk = kalan > 0 ? (kalan <= SOZLESME_UYARI_HAFTA ? ' style="border-color:#f59e0b"' : "") : ' style="border-color:#ef4444"';
    const yedek = i >= kariyer.oyuncular.length ? " · Yedek" : "";
    html += '<button class="takim-butonu"' + renk + ' onclick="sozlesmeYenile(' + i + ')"><span style="text-align:left">' + o.ad + " (" + durum + ")<br>Yaş " + o.yas + " · GEN " + o.genel + " · " + tarzYazi(o) + yedek + "<br>Moral " + moralOf(o) + " · Maaş: " + para(temelMaas(o)) + "</span><span>Ücret: " + para(temelMaas(o) * 4) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function sozlesmeYenile(i) {
  const o = tumKadro()[i];
  if (moralOf(o) < 40) {
    alert(o.ad + " yenilemeyi reddetti (moral " + moralOf(o) + "). Morali 40'ın üstüne çıkana kadar sözleşme yenilemez.");
    return;
  }
  const baz = temelMaas(o);
  const ucret = baz * 4;
  const yeniMaas = Math.round(baz * 1.15);
  if (kariyer.butce - ucret < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm(o.ad + " için " + para(ucret) + " ödenecek. Maaşı " + para(baz) + " → " + para(yeniMaas) + " olacak, sözleşme 26 hafta uzayacak. Onaylıyor musun?")) return;
  kariyer.butce -= ucret;
  maliIsle("gider", "yenileme", ucret);
  o.maas = yeniMaas;
  o.mor = sinir100(moralOf(o) + 10);
  const h = kariyer.hafta || 1;
  o.bitis = Math.max(o.bitis, h) + 26;
  kaydet();
  sozlesmeEkrani();
}
