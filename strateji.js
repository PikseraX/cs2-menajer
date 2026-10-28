const STRATEJILER = {
  "Dengeli": ["Lider", "Yıldız", "Destek", "Giriş", "Sniper"],
  "Agresif": ["Giriş", "Giriş", "Yıldız", "Sniper", "Lider"],
  "Taktiksel": ["Taktisyen", "Lider", "Destek", "Lurker", "Anchor"],
  "Savunma": ["Anchor", "Anchor", "Destek", "Sniper", "Lider"],
  "Sniper Ağırlıklı": ["Sniper", "Sniper", "Destek", "Lurker", "Lider"]
};
const STRATEJI_LISTESI = Object.keys(STRATEJILER);

const STRATEJI_ACIKLAMA = {
  "Dengeli": "Her duruma uyum sağlayan güvenli kadro.",
  "Agresif": "Hızlı girişler ve erken çatışma. İki Giriş oyuncusu ister.",
  "Taktiksel": "Planlı ve sabırlı oyun. Taktisyen, Lurker ve Anchor ister.",
  "Savunma": "Sağlam savunma ve bölge tutma. İki Anchor ister.",
  "Sniper Ağırlıklı": "Uzun mesafe hakimiyeti. İki Sniper ister."
};

// Eşleşen rol sayısına göre takım gücü etkisi (0..5)
const STRATEJI_UYUM_ETKISI = [-3, -2.5, -1.5, 0, 1.5, 3];

function etkiYazi(x) { return (x > 0 ? "+" : "") + x; }

function stratejiUyumu(oyuncular, strateji) {
  const gerek = STRATEJILER[strateji];
  if (!gerek) return null;
  const kalan = gerek.slice();
  let eslesen = 0;
  oyuncular.forEach(function (o) {
    const i = kalan.indexOf(o.rol);
    if (i >= 0) { kalan.splice(i, 1); eslesen++; }
  });
  return eslesen;
}

function stratejiEtkisi(oyuncular, strateji) {
  const u = stratejiUyumu(oyuncular, strateji);
  return u === null ? 0 : STRATEJI_UYUM_ETKISI[u];
}

function rolUygunluk(o, rol) {
  const toplam = TARZLAR[rol].reduce(function (s, z) { return s + o[z]; }, 0);
  return yesilSayisi(o, rol) * 1000 + toplam;
}

// Stratejinin istediği rolleri, en uygun oyunculara dağıtır (t.strateji ve t.oyuncular kullanır)
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
  if (!kariyer.strateji || !STRATEJILER[kariyer.strateji]) {
    kariyer.strateji = "Dengeli";
    degisti = true;
  }
  dunya.forEach(function (t) {
    if (!t.strateji || !STRATEJILER[t.strateji]) {
      t.strateji = STRATEJI_LISTESI[Math.floor(Math.random() * STRATEJI_LISTESI.length)];
      stratejiUygula(t);
      degisti = true;
    }
  });
  if (degisti) kaydet();
}

function stratejiEkrani() {
  const u = stratejiUyumu(kariyer.oyuncular, kariyer.strateji);
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Takım Stratejisi</h2>';
  html += '<div class="bilgi-kutusu">Seçili: <b>' + kariyer.strateji + "</b><br>Uyum: <b>" + u + "/5</b> (takım gücüne " + etkiYazi(STRATEJI_UYUM_ETKISI[u]) + ")</div>";
  html += "<p>Strateji seçince roller değişmez. Uyumu artırmak için rolleri diz veya transfer yap.</p>";
  STRATEJI_LISTESI.forEach(function (s) {
    const k = stratejiUyumu(kariyer.oyuncular, s);
    const renk = s === kariyer.strateji ? ' style="border-color:#f59e0b"' : "";
    html += '<button class="takim-butonu"' + renk + ' onclick="stratejiSec(\'' + s + '\')"><span>' + s + "</span><span>Uyum " + k + "/5 · " + etkiYazi(STRATEJI_UYUM_ETKISI[k]) + "</span></button>";
  });
  html += '<button class="buton" onclick="stratejiDiz()">Rolleri Stratejiye Göre Diz</button>';
  uygulama.innerHTML = html;
}

function stratejiSec(s) {
  kariyer.strateji = s;
  kaydet();
  stratejiEkrani();
}

function stratejiDiz() {
  if (!confirm("Roller seçili stratejiye göre yeniden dağıtılacak, oyuncuların rolleri değişecek. Onaylıyor musun?")) return;
  stratejiUygula(kariyer);
  kaydet();
  stratejiEkrani();
}

function stratejiRehberi() {
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Strateji Rehberi</h2>';
  html += "<p>Stratejinin istediği roller kadronda ne kadar varsa takım gücüne etki eder:<br>" + STRATEJI_UYUM_ETKISI.map(function (e, i) { return i + "/5: " + etkiYazi(e); }).join(" · ") + "</p>";
  STRATEJI_LISTESI.forEach(function (s) {
    html += '<div class="bilgi-kutusu"><b>' + s + "</b><br>" + STRATEJI_ACIKLAMA[s] + "<br>İstediği roller: " + STRATEJILER[s].join(", ") + "</div>";
  });
  uygulama.innerHTML = html;
}
