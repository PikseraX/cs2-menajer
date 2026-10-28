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
    hafta: 1,

    oyuncular: ROLLER.map(function (rol, i) {
      return oyuncuUret(BASLANGIC_ADLARI[i], rol, BASLANGIC_GUC);
    })
  };
  kaydet();
  kariyerEkrani();
}

function tabloHtml(oyuncular) {
  const basliklar = [["nisan", "NİŞ"], ["sprey", "SPR"], ["refleks", "REF"], ["bilgi", "BİL"], ["karar", "KAR"], ["pozisyon", "POZ"], ["iletisim", "İLE"], ["liderlik", "LİD"], ["takimoyunu", "TOP"], ["utility", "UTL"], ["istikrar", "İST"], ["baski", "BAS"]];
  let html = '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Rol</th><th>Yaş</th><th>GEN</th>';
  basliklar.forEach(function (b) { html += "<th>" + b[1] + "</th>"; });
  html += "</tr>";
  oyuncular.forEach(function (o) {
    const gerek = TARZLAR[o.rol] || [];
    html += "<tr><td>" + o.ad + "</td><td>" + o.rol + "</td><td>" + o.yas + '</td><td class="genel">' + o.genel + "</td>";
    basliklar.forEach(function (b) {
      const z = b[0];
      const yesil = gerek.indexOf(z) >= 0 && o[z] >= YESIL_ESIK;
      const gerekli = gerek.indexOf(z) >= 0;
      const stil = yesil ? ' style="color:#22c55e;font-weight:bold"' : (gerekli ? ' style="color:#f59e0b"' : "");
      html += "<td" + stil + ">" + (o[z] === undefined ? "-" : o[z]) + "</td>";
    });
    html += "</tr>";
  });
  return html + "</table></div>";
}

function kariyerEkrani() {
    rakipleriBagla();
    tarzlariHazirla();
    stratejiHazirla();
  let html = '<h1 style="color:' + kariyer.renk + '">' + kariyer.takimAdi + "</h1>";
  html += '<div class="bilgi-kutusu">Bütçe: <b>' + para(kariyer.butce) + "</b><br>Galibiyet: <b>" + (kariyer.galibiyet || 0) + "</b> &nbsp; Mağlubiyet: <b>" + (kariyer.maglubiyet || 0) + "</b></div>";
  html += maasKutusu();
  html += sezonKutusu();
  html += '<button class="buton ikincil" onclick="kadroEkrani()">Kadro</button>';
  html += '<button class="buton ikincil" onclick="siralamaEkrani()">Dünya Sıralaması</button>';
  html += '<button class="buton ikincil" onclick="ligEkrani()">Ligler</button>';
  html += '<button class="buton" onclick="transferEkrani()">Transfer Piyasası</button>';
  html += '<button class="buton ikincil" onclick="sozlesmeEkrani()">Sözleşmeler</button>';
  html += '<button class="buton ikincil" onclick="odakEkrani()">Antrenman Odağı</button>';
  html += '<button class="buton ikincil" onclick="anaMenu()">Ana Menü</button>';
  uygulama.innerHTML = html;
}

function kadroEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Kadro</h2>';
  html += kadroOzet(kariyer.oyuncular, kariyer.strateji) + tabloHtml(kariyer.oyuncular);
  html += '<button class="buton" onclick="stratejiEkrani()">Strateji Belirle</button>';
  html += '<button class="buton ikincil" onclick="istatistikEkrani()">İstatistikler</button>';
  html += '<button class="buton ikincil" onclick="stratejiRehberi()">Strateji Rehberi</button>';
  html += '<button class="buton ikincil" onclick="rolRehberi()">Rol Rehberi</button>';
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
