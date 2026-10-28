// ---------- Rastgelelik (sabit tohumlu) ----------
function tohum(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rastgele = tohum(12345);

function sinirla(d) {
  return Math.max(1, Math.min(99, Math.round(d)));
}

// ---------- Oyuncu ve dünya üretimi ----------
function oyuncuUret(ad, rol, takimGucu) {
  const o = { ad: ad, rol: rol, yas: 17 + Math.floor(rastgele() * 14) };
  let toplam = 0;
  for (const z of OZELLIKLER) {
    o[z] = sinirla(takimGucu + (rastgele() * 20 - 10));
    toplam += o[z];
  }
  o.genel = Math.round(toplam / OZELLIKLER.length);
  return o;
}

function dunyaUret() {
  const adlar = [...OYUNCU_ADLARI];
  return TAKIMLAR.map(function (t) {
    return {
      ad: t.ad,
      guc: t.guc,
      oyuncular: ROLLER.map(function (rol) {
        return oyuncuUret(adlar.shift(), rol, t.guc);
      })
    };
  });
}

const dunya = dunyaUret();
const uygulama = document.getElementById("uygulama");

// ---------- Kariyer ve kayıt ----------
const KAYIT_ANAHTARI = "cs2menajer_kayit";
const RENKLER = [
  { ad: "Turuncu", kod: "#f59e0b" },
  { ad: "Mavi", kod: "#3b82f6" },
  { ad: "Yeşil", kod: "#10b981" },
  { ad: "Kırmızı", kod: "#ef4444" },
  { ad: "Mor", kod: "#8b5cf6" }
];
const BASLANGIC_ADLARI = ["Poyraz", "Tarkan", "Murat", "Yusuf", "Kağan"];
const BASLANGIC_BUTCE = 500000;
const BASLANGIC_GUC = 48;

let kariyer = null;
let secilenRenk = RENKLER[0].kod;

function kayitVarMi() {
  try { return localStorage.getItem(KAYIT_ANAHTARI) !== null; } catch (e) { return false; }
}

function kaydet() {
  try { localStorage.setItem(KAYIT_ANAHTARI, JSON.stringify(kariyer)); } catch (e) { alert("Kayıt yapılamadı."); }
}

function kayitYukle() {
  try {
    kariyer = JSON.parse(localStorage.getItem(KAYIT_ANAHTARI));
  } catch (e) { kariyer = null; }
  if (kariyer) { kariyerEkrani(); } else { anaMenu(); }
}

function kayitSil() {
  if (confirm("Kariyerin kalıcı olarak silinecek. Emin misin?")) {
    try { localStorage.removeItem(KAYIT_ANAHTARI); } catch (e) {}
    kariyer = null;
    anaMenu();
  }
}

function temizle(m) {
  return m.replace(/[<>&"']/g, "");
}

function para(sayi) {
  return sayi.toLocaleString("tr-TR") + " $";
}

// ---------- Ekranlar ----------
function anaMenu() {
  let html = "<h1>CS2 Menajer</h1><h2>Ana Menü</h2>";
  if (kayitVarMi()) {
    html += '<button class="buton" onclick="kayitYukle()">Devam Et</button>';
  }
  html += '<button class="buton" onclick="yeniKariyerFormu()">Yeni Kariyer</button>';
  html += '<button class="buton ikincil" onclick="takimListesiGoster()">Rakip Takımlar</button>';
  if (kayitVarMi()) {
    html += '<button class="buton tehlike" onclick="kayitSil()">Kariyeri Sil</button>';
  }
  uygulama.innerHTML = html;
}

function yeniKariyerFormu() {
  secilenRenk = RENKLER[0].kod;
  let html = '<button class="geri" onclick="anaMenu()">← Geri</button>';
  html += "<h2>Yeni Kariyer</h2>";
  html += "<p>Takım adı:</p>";
  html += '<input id="takimAdi" class="alan" type="text" maxlength="20" placeholder="Örn: Anadolu Aslanları">';
  html += "<p>Takım rengi:</p><div>";
  RENKLER.forEach(function (r, i) {
    html += '<button class="renk' + (i === 0 ? " secili" : "") + '" style="background:' + r.kod + '" onclick="renkSec(\'' + r.kod + '\', this)"></button>';
  });
  html += "</div>";
  html += '<button class="buton" onclick="kariyerBaslat()">Kariyeri Başlat</button>';
  uygulama.innerHTML = html;
}

function renkSec(kod, dugme) {
  secilenRenk = kod;
  document.querySelectorAll(".renk").forEach(function (b) { b.classList.remove("secili"); });
  dugme.classList.add("secili");
}

function kariyerBaslat() {
  const ad = temizle(document.getElementById("takimAdi").value.trim());
  if (ad === "") { alert("Lütfen bir takım adı yaz."); return; }
  kariyer = {
    takimAdi: ad,
    renk: secilenRenk,
    butce: BASLANGIC_BUTCE,
    galibiyet: 0,
    maglubiyet: 0,

    oyuncular: ROLLER.map(function (rol, i) {
      return oyuncuUret(BASLANGIC_ADLARI[i], rol, BASLANGIC_GUC);
    })
  };
  kaydet();
  kariyerEkrani();
}

function tabloHtml(oyuncular) {
  let html = '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Rol</th><th>Yaş</th><th>NİŞ</th><th>BİL</th><th>REF</th><th>İLE</th><th>İST</th><th>BAS</th><th>GEN</th></tr>';
  oyuncular.forEach(function (o) {
    html += "<tr><td>" + o.ad + "</td><td>" + o.rol + "</td><td>" + o.yas + "</td><td>" + o.nisan + "</td><td>" + o.bilgi + "</td><td>" + o.refleks + "</td><td>" + o.iletisim + "</td><td>" + o.istikrar + "</td><td>" + o.baski + '</td><td class="genel">' + o.genel + "</td></tr>";
  });
  return html + "</table></div>";
}

function kariyerEkrani() {
  let html = '<h1 style="color:' + kariyer.renk + '">' + kariyer.takimAdi + "</h1>";
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Galibiyet: <b>" + (kariyer.galibiyet || 0) + "</b> &nbsp; Mağlubiyet: <b>" + (kariyer.maglubiyet || 0) + "</b></div>";
  html += "<h2>Kadro</h2>" + tabloHtml(kariyer.oyuncular);
  html += '<button class="buton" onclick="macRakipSec()">Maç Oyna</button>';
  html += '<button class="buton" onclick="transferEkrani()">Transfer Piyasası</button>';
  html += '<button class="buton ikincil" onclick="takimListesiGoster()">Rakip Takımlar</button>';
  html += '<button class="buton ikincil" onclick="anaMenu()">Ana Menü</button>';
  uygulama.innerHTML = html;
}

function takimListesiGoster() {
  let html = '<button class="geri" onclick="anaMenu()">← Ana Menü</button><h2>Rakip Takımlar</h2>';
  dunya.forEach(function (t, i) {
    const ort = Math.round(t.oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / t.oyuncular.length);
    html += '<button class="takim-butonu" onclick="kadroGoster(' + i + ')"><span>' + t.ad + '</span><span>Güç: ' + ort + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function kadroGoster(i) {
  const t = dunya[i];
  let html = '<button class="geri" onclick="takimListesiGoster()">← Geri</button>';
  html += "<h2>" + t.ad + "</h2>" + tabloHtml(t.oyuncular);
  uygulama.innerHTML = html;
}

anaMenu();
