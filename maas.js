function formulMaas(o) { return Math.round(o.genel * o.genel / 2); }
function temelMaas(o) { return o.maas !== undefined ? o.maas : formulMaas(o); }

function sozlesmeHazirla() {
  const h = kariyer.hafta || 1;
  kariyer.oyuncular.forEach(function (o) {
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
  return kariyer.oyuncular.reduce(function (s, o) { return s + maas(o); }, 0);
}

function maasKutusu() {
  sozlesmeHazirla();
  let h = '<div class="bilgi-kutusu">Hafta: <b>' + (kariyer.hafta || 1) + "</b><br>Haftalık maaş gideri: <b>" + para(haftalikGider()) + "</b>";
  if (kariyer.butce < 0) {
    h += '<br><span style="color:#ef4444">Bütçe eksi! Transfer yapamazsın.</span>';
  }
  const biten = kariyer.oyuncular.filter(sozlesmeBitti).length;
  if (biten > 0) {
    h += '<br><span style="color:#ef4444">' + biten + " oyuncunun sözleşmesi bitti (maaş %25 zamlı).</span>";
  }
  return h + "</div>";
}

function haftaGec() {
  const g = haftalikGider();
  if (!confirm("Hafta bitecek ve " + para(g) + " maaş ödenecek. Onaylıyor musun?")) return;
  kariyer.butce -= g;
  kariyer.hafta = (kariyer.hafta || 1) + 1;
  kaydet();
  kariyerEkrani();
}

function sozlesmeEkrani() {
  sozlesmeHazirla();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Sözleşmeler</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Hafta: <b>" + (kariyer.hafta || 1) + "</b><br>Yenileme: +26 hafta, 4 haftalık maaş ödenir, maaş %15 artar</div>";
  kariyer.oyuncular.forEach(function (o, i) {
    const kalan = o.bitis - (kariyer.hafta || 1) + 1;
    const durum = kalan > 0 ? kalan + " hafta kaldı" : "SÖZLEŞME BİTTİ";
    const renk = kalan > 0 ? "" : ' style="border-color:#ef4444"';
    html += '<button class="takim-butonu"' + renk + ' onclick="sozlesmeYenile(' + i + ')"><span>' + o.ad + " (" + durum + ")<br>Maaş: " + para(temelMaas(o)) + "</span><span>Ücret: " + para(temelMaas(o) * 4) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function sozlesmeYenile(i) {
  const o = kariyer.oyuncular[i];
  const baz = temelMaas(o);
  const ucret = baz * 4;
  const yeniMaas = Math.round(baz * 1.15);
  if (kariyer.butce - ucret < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm(o.ad + " için " + para(ucret) + " ödenecek. Maaşı " + para(baz) + " → " + para(yeniMaas) + " olacak, sözleşme 26 hafta uzayacak. Onaylıyor musun?")) return;
  kariyer.butce -= ucret;
  o.maas = yeniMaas;
  const h = kariyer.hafta || 1;
  o.bitis = Math.max(o.bitis, h) + 26;
  kaydet();
  sozlesmeEkrani();
}
