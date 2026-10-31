// ---- Canlı maç ayarları ----
const TAKTIKLER = ["Dengeli", "Agresif", "Temkinli"];
const TAKTIK_ACIKLAMA = {
  "Dengeli": "Dengeli oyun. Rol uyumu gerektirmez.",
  "Agresif": "Hızlı girişler. Giriş ve Yıldız rolleri ister.",
  "Temkinli": "Sabırlı, bölge tutan oyun. Anchor, Lurker ve Destek ister."
};
const TAKTIK_ROLLERI = { "Dengeli": [], "Agresif": ["Giriş", "Yıldız"], "Temkinli": ["Anchor", "Lurker", "Destek"] };
const TAKTIK_USTUNLUK = { "Agresif": "Dengeli", "Dengeli": "Temkinli", "Temkinli": "Agresif" };
const TAKTIK_ROL_BONUSU = 2;
const TAKTIK_USTUN_BONUSU = 6;
const SERI_CEZASI = 6;
const MOLA_BONUSU = 5;
const MOLA_TUR = 4;
const DEGISIM_HAKKI = 2;

let canli = null;
let canliSeri = null;

function taktikRolBonusu(t, oyuncular) {
  const rl = TAKTIK_ROLLERI[t] || [];
  if (rl.length === 0) return 0;
  const n = oyuncular.filter(function (o) { return rl.indexOf(o.rol) >= 0; }).length;
  return (n - 2) * TAKTIK_ROL_BONUSU;
}

// t taktiği, rakipT karşısında: +6 üstün, -6 zayıf, 0 eşit
function taktikUstunluk(t, rakipT) {
  if (TAKTIK_USTUNLUK[t] === rakipT) return TAKTIK_USTUN_BONUSU;
  if (TAKTIK_USTUNLUK[rakipT] === t) return -TAKTIK_USTUN_BONUSU;
  return 0;
}

function aiIlkTaktik(B) {
  if (B.strateji === "Agresif") return "Agresif";
  if (B.strateji === "Taktiksel" || B.strateji === "Savunma") return "Temkinli";
  return "Dengeli";
}

function aiYariTaktik(c) {
  const fark = c.sb - c.sa;
  if (fark <= -2) return "Agresif";
  if (fark >= 2) return "Temkinli";
  return c.tB;
}

// rakip verilmezse bu haftanın lig rakibi kullanılır. seri verilirse takım ve değişiklik hakkı seriden gelir.
function canliKur(harita, rakip, seri) {
  sezonHazirla();
  let B = rakip;
  if (!B) {
    const sz = kariyer.sezon;
    const m = sz.fikstur[sz.gun].find(function (x) { return x[0] === 0 || x[1] === 0; });
    B = ligTakim(m[0] === 0 ? m[1] : m[0]);
  }
  const A = seri ? seri.A : { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular.slice(), strateji: kariyer.strateji };
  const istA = A.oyuncular.map(function (o) { return { o: o, kill: 0, death: 0 }; });
  const istB = B.oyuncular.map(function (o) { return { o: o, kill: 0, death: 0 }; });
  return {
    harita: harita, A: A, B: B, seri: seri || null,
    hf: haritaPuani({ oyuncular: kariyer.oyuncular }, harita) - haritaPuani(B, harita),
    sa: 0, sb: 0, istA: istA, istB: istB, aktifA: istA.slice(), aktifB: istB.slice(),
    tA: "Dengeli", tB: aiIlkTaktik(B),
    mola: 1, molaB: 1, molaTur: 0, molaTurB: 0, serA: 0, serB: 0, seriSoruldu: false,
    yariGecti: false, ot: false, otA: 0, otB: 0, otN: 0,
    degisimHak: seri ? seri.degisimHak : DEGISIM_HAKKI, olaylar: []
  };
}

function canliP(c) {
  let fark = takimEtkin(c.A.oyuncular, c.A.strateji) - takimEtkin(c.B.oyuncular, c.B.strateji) + c.hf;
  fark += taktikRolBonusu(c.tA, c.A.oyuncular) - taktikRolBonusu(c.tB, c.B.oyuncular) + taktikUstunluk(c.tA, c.tB);
  fark += analistHazirlik();
  if (c.serA >= 3) fark -= SERI_CEZASI;
  if (c.serB >= 3) fark += SERI_CEZASI;
  if (c.molaTur > 0) fark += MOLA_BONUSU;
  if (c.molaTurB > 0) fark -= MOLA_BONUSU;
  return Math.min(0.7, Math.max(0.3, 1 / (1 + Math.exp(-fark / 80))));
}

function canliRound(c) {
  const aK = Math.random() < canliP(c);
  const kaz = aK ? c.aktifA : c.aktifB;
  const kay = aK ? c.aktifB : c.aktifA;
  for (let i = 0; i < 5; i++) agirlikliSec(kaz).kill++;
  kay.forEach(function (x) { x.death++; });
  const n = Math.floor(Math.random() * 5);
  for (let i = 0; i < n; i++) agirlikliSec(kay).kill++;
  karistir(kaz).slice(0, n).forEach(function (x) { x.death++; });
  if (aK) { c.sa++; c.serA = 0; c.serB++; c.seriSoruldu = false; }
  else { c.sb++; c.serB = 0; c.serA++; }
  if (c.molaTur > 0) c.molaTur--;
  if (c.molaTurB > 0) c.molaTurB--;
  if (c.serB >= 3 && c.molaB > 0) {
    c.molaB--; c.serB = 0; c.molaTurB = MOLA_TUR;
    c.olaylar.push("Rakip mola aldı (" + c.sa + "-" + c.sb + ")");
  }
  return aK;
}

// Oynatır; durma sebebini döndürür: "yari", "seri" veya "bitti"
function canliIlerle(c) {
  for (;;) {
    if (!c.yariGecti && c.sa + c.sb >= 12) {
      c.yariGecti = true;
      c.olaylar.push("Yarı devre skoru: " + c.sa + "-" + c.sb);
      return "yari";
    }
    if (!c.ot && c.sa === 12 && c.sb === 12) { c.ot = true; c.otA = 0; c.otB = 0; c.otN = 0; }
    if (!c.ot && (c.sa >= 13 || c.sb >= 13)) return "bitti";
    if (c.ot && c.otN === 6) {
      if (c.otA >= 4 || c.otB >= 4) return "bitti";
      c.otA = 0; c.otB = 0; c.otN = 0;
    }
    if (c.serA >= 3 && c.mola > 0 && !c.seriSoruldu) return "seri";
    const aK = canliRound(c);
    if (c.ot) { c.otN++; if (aK) c.otA++; else c.otB++; }
  }
}

function canliDevam() {
  const s = canliIlerle(canli);
  if (s === "yari") yariEkrani();
  else if (s === "seri") seriEkrani();
  else canliBitir();
}

function canliIptal() {
  const seri = canli && canli.seri;
  canli = null;
  canliSeri = null;
  if (seri) turnuvaDevam(); else kariyerEkrani();
}

function taktikButonlari(fn, acik, rakipT) {
  const c = canli;
  const rt = rakipT || c.tB;
  let h = "";
  TAKTIKLER.forEach(function (t) {
    const rol = taktikRolBonusu(t, c.A.oyuncular);
    if (acik) {
      const ust = taktikUstunluk(t, rt);
      const net = rol + ust;
      const renk = net > 0 ? ' style="border-color:#22c55e"' : (net < 0 ? ' style="border-color:#ef4444"' : "");
      h += '<button class="takim-butonu"' + renk + ' onclick="' + fn + "('" + t + "')\">" +
        '<span style="text-align:left">' + t + "<br><small>" + TAKTIK_ACIKLAMA[t] + "<br>Kadro uyumu " + etkiYazi(rol) + " · Taktik üstünlüğü " + etkiYazi(ust) + "</small></span><span>Net " + etkiYazi(net) + "</span></button>";
    } else {
      h += '<button class="takim-butonu" onclick="' + fn + "('" + t + "')\">" +
        '<span style="text-align:left">' + t + "<br><small>" + TAKTIK_ACIKLAMA[t] + "<br>Kadro uyumu " + etkiYazi(rol) + " · Taktik üstünlüğü ? (Analist gerekli)</small></span><span>Net ?</span></button>";
    }
  });
  return h;
}

function seriKutusu(seri) {
  let h = '<div class="bilgi-kutusu" style="border-color:' + kariyer.renk + '"><b>BO3 Seri: ' + seri.A.ad + " " + seri.mine + " - " + seri.theirs + " " + seri.rakip.ad + "</b><br>Harita " + (seri.idx + 1) + "/3";
  if (seri.hr.length > 0) h += "<br>Oynanan: " + seri.hr.map(function (x) { return x.h + " " + x.m + "-" + x.t; }).join(", ");
  return h + "</div>";
}

// ---------- Lig maçı ----------
// Harita yasaklama bitince burası çağrılır
function canliMacHazirla(harita) {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (sz.bitti || sz.oynandi) { kariyerEkrani(); return; }
  canli = canliKur(harita);
  canliHazirlikEkrani();
}

// ---------- Turnuva serisi ----------
function canliSeriBasla(kalan, banYazi) {
  const tu = kariyer.turnuva;
  if (!tu) { kariyerEkrani(); return; }
  const rakip = turnuvaRakibi(tu);
  if (!rakip) { turnuvaDevam(); return; }
  canliSeri = {
    A: { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular.slice(), strateji: kariyer.strateji },
    rakip: rakip, liste: karistir(kalan), idx: 0, mine: 0, theirs: 0,
    hr: [], notlar: [], degisimHak: DEGISIM_HAKKI, kalan: kalan, banYazi: banYazi
  };
  canli = canliKur(canliSeri.liste[0], rakip, canliSeri);
  canliHazirlikEkrani();
}

function canliSeriSonraki() {
  const seri = canliSeri;
  if (!seri) { kariyerEkrani(); return; }
  canli = canliKur(seri.liste[seri.idx], seri.rakip, seri);
  canliHazirlikEkrani();
}

function canliSeriIsle(seri, s) {
  const kaz = s.sa > s.sb;
  if (kaz) seri.mine++; else seri.theirs++;
  seri.hr.push({ h: s.harita, m: s.sa, t: s.sb });
  seri.notlar.push(s.harita + ": " + s.not);
  seri.idx++;
  if (seri.mine >= 2 || seri.theirs >= 2) {
    const sonuc = { mine: seri.mine, theirs: seri.theirs, hr: seri.hr, not: seri.notlar.join("<br>") };
    canliSeri = null;
    turnuvaTurOyna(seri.kalan, seri.banYazi, sonuc);
    return;
  }
  let html = "<h2>Harita Bitti</h2>";
  html += '<div class="bilgi-kutusu"><b>' + seri.A.ad + " " + s.sa + " - " + s.sb + " " + seri.rakip.ad + "</b><br>" + s.harita + (kaz ? " · Kazandın" : " · Kaybettin") + "<br>Seri: <b>" + seri.mine + " - " + seri.theirs + "</b></div>";
  html += '<button class="buton" onclick="canliSeriSonraki()">Sonraki Harita: ' + seri.liste[seri.idx] + "</button>";
  uygulama.innerHTML = html;
}

// ---------- Ortak ekranlar ----------
function canliHazirlikEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  let html = '<button class="geri" onclick="canliIptal()">← Geri</button><h2>Maç Öncesi Taktik</h2>';
  if (c.seri) html += seriKutusu(c.seri);
  html += '<div class="bilgi-kutusu">Rakip: <b>' + c.B.ad + "</b><br>Güç: <b>" + Math.round(ortGuc(c.B.oyuncular)) + "</b>";
  if (an >= 1) html += "<br>Strateji: <b>" + c.B.strateji + "</b><br>Rakibin ilk yarı taktiği: <b>" + c.tB + "</b>";
  else html += "<br>Strateji ve taktik: gizli (Analist gerekli)";
  html += "<br>Harita: <b>" + c.harita + "</b>";
  if (an >= 2) html += " (harita farkı " + etkiYazi(c.hf) + ")";
  if (an >= 3) html += "<br>Analist hazırlığı: <b>+" + analistHazirlik() + " güç</b>";
  html += "</div>";
  html += "<p>İlk yarı için taktik seç." + (an >= 1 ? " Net değer, kadro uyumu ve rakibin taktiğine karşı üstünlüğün toplamıdır." : " Rakibin taktiğini bilmediğin için yalnızca kadro uyumunu görebilirsin.") + "</p>";
  html += taktikButonlari("canliBasla", an >= 1, c.tB);
  uygulama.innerHTML = html;
}

function canliBasla(t) {
  canli.tA = t;
  canli.olaylar.push("İlk yarı taktikleri: sen " + t + ", rakip " + canli.tB);
  canliDevam();
}

function yariEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  const tahmin = aiYariTaktik(c);
  const rakipT = an >= 3 ? tahmin : c.tB;
  let html = "<h2>Yarı Devre</h2>";
  if (c.seri) html += seriKutusu(c.seri);
  html += '<div class="bilgi-kutusu"><b>' + c.A.ad + " " + c.sa + " - " + c.sb + " " + c.B.ad + "</b><br>Harita: <b>" + c.harita + "</b><br>Taktikler: sen <b>" + c.tA + "</b> · rakip <b>" + c.tB + "</b><br>Mola hakkın: <b>" + c.mola + "</b><br>Oyuncu değişikliği hakkın: <b>" + c.degisimHak + "</b></div>";
  html += istTablo(c.A.ad, c.aktifA) + istTablo(c.B.ad, c.aktifB);
  if (an >= 3) {
    html += '<div class="bilgi-kutusu" style="border-color:#22c55e">Analist: rakip ikinci yarıda <b>' + tahmin + "</b> oynayacak" + (tahmin !== c.tB ? " (taktik değiştiriyor)" : " (taktik değişmiyor)") + ".</div>";
  } else {
    html += "<p>Rakip ikinci yarıda taktik değiştirebilir. Aşağıdaki değerler rakibin ilk yarı taktiğine göre hesaplandı. Analist seviye 3 rakibin ikinci yarı taktiğini önceden gösterir.</p>";
  }
  if (c.degisimHak > 0 && yedekListe().length > 0) {
    html += '<button class="buton ikincil" onclick="degisimEkrani()">Oyuncu Değişikliği</button>';
  }
  html += "<h2>İkinci Yarı Taktiği</h2>" + taktikButonlari("canliYariDevam", true, rakipT);
  uygulama.innerHTML = html;
}

function canliYariDevam(t) {
  const c = canli;
  const ai = aiYariTaktik(c);
  c.olaylar.push("İkinci yarı taktikleri: sen " + t + ", rakip " + ai);
  c.tA = t;
  c.tB = ai;
  canliDevam();
}

function seriEkrani() {
  const c = canli;
  c.seriSoruldu = true;
  let html = "<h2>Kritik An</h2>";
  html += '<div class="bilgi-kutusu"><b>' + c.A.ad + " " + c.sa + " - " + c.sb + " " + c.B.ad + "</b><br>Takımın üst üste " + c.serA + " round kaybetti. Seri kaybeden takım -" + SERI_CEZASI + " güç cezası alır.<br>Mola seriyi sıfırlar ve sonraki " + MOLA_TUR + " round'a +" + MOLA_BONUSU + " verir.</div>";
  html += '<button class="buton" onclick="canliMola()">Mola Al (kalan ' + c.mola + ")</button>";
  html += '<button class="buton ikincil" onclick="canliDevam()">Devam Et</button>';
  uygulama.innerHTML = html;
}

function canliMola() {
  const c = canli;
  c.mola--;
  c.serA = 0;
  c.molaTur = MOLA_TUR;
  c.olaylar.push("Mola aldın (" + c.sa + "-" + c.sb + ")");
  canliDevam();
}

function degisimEkrani() {
  const c = canli;
  let html = '<button class="geri" onclick="yariEkrani()">← Geri</button><h2>Oyuncu Değişikliği</h2>';
  html += "<p>Kalan hak: <b>" + c.degisimHak + "</b>. " + (c.seri ? "Değişiklik serinin geri kalanında geçerlidir." : "Değişiklik yalnızca bu maç için geçerlidir.") + " Çıkacak oyuncuyu seç:</p>";
  c.A.oyuncular.forEach(function (o, k) {
    html += '<button class="takim-butonu" onclick="degisimYedekSec(' + k + ')"><span>' + o.ad + " (" + o.rol + ")</span><span>GEN " + o.genel + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function degisimYedekSec(k) {
  const c = canli;
  const cikan = c.A.oyuncular[k];
  let html = '<button class="geri" onclick="degisimEkrani()">← Geri</button><h2>' + cikan.ad + " yerine kim girsin?
