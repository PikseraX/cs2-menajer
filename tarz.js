const YESIL_ESIK = 60;
const TARZ_ETKISI = [-4, 0, 2, 4]; // 0, 1, 2, 3 yeşil özellik

const TARZLAR = {
  "Lider": ["iletisim", "bilgi", "baski"],
  "Yıldız": ["nisan", "refleks", "baski"],
  "Destek": ["iletisim", "istikrar", "bilgi"],
  "Giriş": ["refleks", "nisan", "baski"],
  "Sniper": ["nisan", "istikrar", "refleks"],
  "Lurker": ["bilgi", "istikrar", "baski"],
  "Anchor": ["istikrar", "bilgi", "baski"],
  "Taktisyen": ["bilgi", "iletisim", "istikrar"]
};
const TARZ_LISTESI = Object.keys(TARZLAR);

function yesilSayisi(o, tarz) {
  const g = TARZLAR[tarz];
  if (!g) return 0;
  return g.filter(function (z) { return o[z] >= YESIL_ESIK; }).length;
}

function tarzEtkisi(o) {
  return TARZ_ETKISI[yesilSayisi(o, o.rol)];
}

function takimEtkin(oyuncular, strateji) {
  const t = oyuncular.reduce(function (s, o) { return s + tarzEtkisi(o); }, 0) / oyuncular.length;
  return ortGuc(oyuncular) + t + stratejiEtkisi(oyuncular, strateji);
}

function tarzYazi(o) {
  return o.rol;
}

// Eski kayıtlardaki yan tarzları temizler
function tarzlariHazirla() {
  let degisti = false;
  function isle(o) {
    if (o.yan !== undefined) { delete o.yan; degisti = true; }
  }
  dunya.forEach(function (t) { t.oyuncular.forEach(isle); });
  kariyer.oyuncular.forEach(isle);
  if (kariyer.serbest) kariyer.serbest.forEach(isle);
  if (degisti) kaydet();
}

function rolRehberi() {
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Rol Rehberi</h2>';
  html += "<p>Rolün istediği özellik " + YESIL_ESIK + " ve üzerindeyse yeşil yanar. Oyuncu başına etki: 0 yeşil " + TARZ_ETKISI[0] + ", 1 yeşil " + TARZ_ETKISI[1] + ", 2 yeşil +" + TARZ_ETKISI[2] + ", 3 yeşil +" + TARZ_ETKISI[3] + " takım gücü.</p>";
  TARZ_LISTESI.forEach(function (t) {
    html += '<div class="bilgi-kutusu"><b>' + t + "</b><br>" + TARZLAR[t].map(function (z) { return ODAK_ADLARI[z]; }).join(", ") + "</div>";
  });
  uygulama.innerHTML = html;
}
