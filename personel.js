const PERSONEL_TURLERI = ["koc", "fizyo"];
const PERSONEL_MALIYET = [0, 25000, 70000, 160000];
const FIZYO_DINLENME = [0, 2, 3, 4];

const PERSONEL = {
  koc: {
    ad: "Koç", maas: 2000,
    etki: ["", "Antrenman gelişimi +%10, strateji uyumu cezası -%20", "Antrenman gelişimi +%20, strateji uyumu cezası -%40", "Antrenman gelişimi +%30, strateji uyumu cezası -%60"]
  },
  fizyo: {
    ad: "Fizyoterapist", maas: 1500,
    etki: ["", "Haftalık dinlenme +2, mağlubiyet moral kaybı 4", "Haftalık dinlenme +3, mağlubiyet moral kaybı 3", "Haftalık dinlenme +4, mağlubiyet moral kaybı 2"]
  }
};

function personelSeviye(tur) {
  return (kariyer.personel && kariyer.personel[tur]) || 0;
}

function personelGideri() {
  let t = 0;
  PERSONEL_TURLERI.forEach(function (k) { t += personelSeviye(k) * PERSONEL[k].maas; });
  return t;
}

// Oyuncu listesi senin takımına mı ait (canlı maçta kopya liste kullanılır)
function benimTakimMi(oyuncular) {
  return oyuncular.some(function (o) { return kariyer.oyuncular.indexOf(o) >= 0; });
}

function personelEkrani() {
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Personel</h2>';
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Haftalık personel gideri: <b>" + para(personelGideri()) + "</b></div>";
  PERSONEL_TURLERI.forEach(function (tur) {
    const p = PERSONEL[tur];
    const s = personelSeviye(tur);
    html += '<div class="bilgi-kutusu"><b>' + p.ad + "</b> · Seviye " + s + "/3<br>Haftalık maaş: <b>" + para(s * p.maas) + "</b><br>";
    html += s > 0 ? "Etki: " + p.etki[s] : "İşe alınmadı.";
    if (s < 3) html += "<br>Sonraki seviye: " + p.etki[s + 1] + "<br>Ücret: <b>" + para(PERSONEL_MALIYET[s + 1] - PERSONEL_MALIYET[s]) + "</b> · Yeni maaş: " + para((s + 1) * p.maas) + "/hafta";
    html += "</div>";
    if (s < 3) html += '<button class="buton" onclick="personelYukselt(\'' + tur + '\')">' + (s === 0 ? p.ad + " İşe Al" : p.ad + " Seviyesini Yükselt") + "</button>";
    if (s > 0) html += '<button class="buton tehlike" onclick="personelCikar(\'' + tur + '\')">' + p.ad + " İşten Çıkar</button>";
  });
  uygulama.innerHTML = html;
}

function personelYukselt(tur) {
  const s = personelSeviye(tur);
  if (s >= 3) return;
  const p = PERSONEL[tur];
  const ucret = PERSONEL_MALIYET[s + 1] - PERSONEL_MALIYET[s];
  if (kariyer.butce - ucret < 0) { alert("Bütçen yetersiz."); return; }
  if (!confirm(p.ad + " seviye " + (s + 1) + " olacak: " + para(ucret) + ". Haftalık maaşı " + para((s + 1) * p.maas) + " olur. Onaylıyor musun?")) return;
  kariyer.butce -= ucret;
  maliIsle("gider", "personel", ucret);
  if (!kariyer.personel) kariyer.personel = {};
  kariyer.personel[tur] = s + 1;
  kaydet();
  personelEkrani();
}

function personelCikar(tur) {
  const p = PERSONEL[tur];
  if (!confirm(p.ad + " işten çıkarılacak, ödenen ücret geri gelmez. Onaylıyor musun?")) return;
  kariyer.personel[tur] = 0;
  kaydet();
  personelEkrani();
}
