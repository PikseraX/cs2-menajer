const STRATEJILER = {
  "Dengeli": ["Lider", "Yıldız", "Destek", "Giriş", "Sniper"],
  "Agresif": ["Giriş", "Giriş", "Yıldız", "Sniper", "Lider"],
  "Taktiksel": ["Taktisyen", "Lider", "Destek", "Lurker", "Anchor"],
  "Savunma": ["Anchor", "Anchor", "Destek", "Sniper", "Lider"],
  "Sniper Ağırlıklı": ["Sniper", "Sniper", "Destek", "Lurker", "Lider"]
};
const STRATEJI_LISTESI = Object.keys(STRATEJILER);

function rolUygunluk(o, rol) {
  const toplam = TARZLAR[rol].reduce(function (s, z) { return s + o[z]; }, 0);
  return yesilSayisi(o, rol) * 1000 + toplam;
}

// Stratejinin istediği tarzları, en uygun oyunculara dağıtır
function stratejiUygula(t) {
  const bos = t.oyuncular.slice();
  STRATEJILER[t.strateji].forEach(function (rol) {
    let en = 0;
    bos.forEach(function (o, i) {
      if (rolUygunluk(o, rol) > rolUygunluk(bos[en], rol)) en = i;
    });
    bos[en].rol = rol;
    bos.splice(en, 1);
  });
}

// Stratejisi olmayan takımlara strateji verir (eski kayıtlar dahil)
function stratejiHazirla() {
  let degisti = false;
  dunya.forEach(function (t) {
    if (!t.strateji || !STRATEJILER[t.strateji]) {
      t.strateji = STRATEJI_LISTESI[Math.floor(Math.random() * STRATEJI_LISTESI.length)];
      stratejiUygula(t);
      degisti = true;
    }
  });
  if (degisti) kaydet();
}
