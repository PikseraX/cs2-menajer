const SPONSOR_MAX = 3;
const SPONSOR_IPTAL_HAFTA = 4;
const SPONSOR_MARKA = ["Kelvix", "Zorax", "Vorlux", "Nexor", "Drako", "Mirex", "Tavox", "Brixo", "Qualen", "Syrex"];
const SPONSOR_SEKTOR = ["Enerji", "Bilişim", "Gıda", "Mobil", "Giyim", "Oyun", "Finans", "Ulaşım"];
const SPONSOR_ARALIK = [[800, 2000], [2000, 4000], [4000, 7000]];
const LIG_HEDEF_BONUS = { 2: 14, 3: 10, 4: 7, 5: 5 };
const GALIBIYET_HEDEF_BONUS = { 5: 5, 7: 8, 9: 12 };

function sponsorAktif(s) { return s.bitis >= kariyer.hafta; }

function sponsorHaftalik() {
  return (kariyer.sponsorlar || []).reduce(function (t, s) { return t + (sponsorAktif(s) ? s.haftalik : 0); }, 0);
}

function sponsorTemizle() {
  kariyer.sponsorlar = (kariyer.sponsorlar || []).filter(sponsorAktif);
}

function hedefYazi(h) {
  return h.tur === "lig" ? "Ligde ilk " + h.deger + "'te bitir" : "Sezonda en az " + h.deger + " galibiyet al";
}

function sponsorTeklifUret(kullanilan) {
  const r = benimDunyaSirasi();
  const seviye = r <= 16 ? 3 : (r <= 48 ? 2 : 1);
  const a = SPONSOR_ARALIK[seviye - 1];
  let ad;
  do { ad = rastgeleEleman(SPONSOR_MARKA) + " " + rastgeleEleman(SPONSOR_SEKTOR); } while (kullanilan.indexOf(ad) >= 0);
  kullanilan.push(ad);
  const sure = Math.random() < 0.5 ? 28 : 56;
  let haftalik = a[0] + Math.random() * (a[1] - a[0]);
  if (sure === 56) haftalik *= 1.1;
  haftalik = Math.round(haftalik / 100) * 100;
  let hedef, carpan;
  if (Math.random() < 0.5) {
    const k = [2, 3, 4, 5][Math.floor(Math.random() * 4)];
    hedef = { tur: "lig", deger: k };
    carpan = LIG_HEDEF_BONUS[k];
  } else {
    const n = [5, 7, 9][Math.floor(Math.random() * 3)];
    hedef = { tur: "galibiyet", deger: n };
    carpan = GALIBIYET_HEDEF_BONUS[n];
  }
  return { ad: ad, haftalik: haftalik, sure: sure, hedef: hedef, bonus: haftalik * carpan };
}

function sponsorTeklifYenile() {
  const k = [];
  kariyer.sponsorTeklif = [sponsorTeklifUret(k), sponsorTeklifUret(k), sponsorTeklifUret(k)];
  kaydet();
}

function sponsorHazirla() {
  if (!kariyer.sponsorlar) kariyer.sponsorlar = [];
  if (!kariyer.sponsorTeklif) sponsorTeklifYenile();
}

function sponsorEkrani() {
  sponsorHazirla();
  sponsorTemizle();
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Sponsorlar</h2>';
  html += '<div class="bilgi-kutusu">Dünya sıran: <b>' + benimDunyaSirasi() + ". / 100</b><br>Organizasyon geliri (sıralamadan): <b>" + para(sponsorGeliri() - sponsorHaftalik()) + "</b>/hafta<br>Sponsor geliri: <b>" + para(sponsorHaftalik()) + "</b>/hafta<br>Aktif sponsor: <b>" + kariyer.sponsorlar.length + "/" + SPONSOR_MAX + "</b></div>";
  if ((kariyer.sponsorSon || []).length > 0) {
    html += '<div class="bilgi-kutusu"><b>Geçen sezon sonucu</b><br>' + kariyer.sponsorSon.join("<br>") + "</div>";
  }
  html += "<h2>Aktif Anlaşmalar</h2>";
  if (kariyer.sponsorlar.length === 0) html += "<p>Aktif sponsor anlaşman yok.</p>";
  kariyer.sponsorlar.forEach(function (s, i) {
    html += '<button class="takim-butonu" onclick="sponsorIptal(' + i + ')"><span style="text-align:left">' + s.ad + "<br><small>Hedef: " + hedefYazi(s.hedef) + "<br>Bonus: " + para(s.bonus) + " · Kalan: " + (s.bitis - kariyer.hafta + 1) + ' hafta</small></span><span>' + para(s.haftalik) + "/hf</span></button>";
  });
  if (kariyer.sponsorlar.length > 0) html += "<p>Anlaşmayı erken bitirmek için üstüne bas (" + SPONSOR_IPTAL_HAFTA + " haftalık ücret cezası).</p>";
  html += "<h2>Gelen Teklifler</h2>";
  if (kariyer.sponsorTeklif.length === 0) html += "<p>Bu sezonluk teklif kalmadı. Yeni teklifler sezon başında gelir.</p>";
  kariyer.sponsorTeklif.forEach(function (t, i) {
    html += '<button class="takim-butonu" onclick="sponsorImzala(' + i + ')"><span style="text-align:left">' + t.ad + "<br><small>Süre: " + t.sure + " hafta · Hedef: " + hedefYazi(t.hedef) + "<br>Bonus: " + para(t.bonus) + " · İmza primi: " + para(t.haftalik * 2) + '</small></span><span>' + para(t.haftalik) + "/hf</span></button>";
  });
  uygulama.innerHTML = html;
}

function sponsorImzala(i) {
  sponsorHazirla();
  sponsorTemizle();
  const t = kariyer.sponsorTeklif[i];
  if (!t) return;
  if (kariyer.sponsorlar.length >= SPONSOR_MAX) { alert("En fazla " + SPONSOR_MAX + " sponsorun olabilir. Önce birini bitir."); return; }
  const imza = t.haftalik * 2;
  if (!confirm(t.ad + " ile " + t.sure + " haftalık anlaşma: haftalık " + para(t.haftalik) + ", imza primi " + para(imza) + ". Hedef: " + hedefYazi(t.hedef) + " (bonus " + para(t.bonus) + "). Onaylıyor musun?")) return;
  kariyer.sponsorlar.push({
    ad: t.ad, haftalik: t.haftalik, bitis: kariyer.hafta + t.sure - 1,
    hedef: t.hedef, bonus: t.bonus, imzaSezon: kariyer.sezon.no, imzaHf: kariyer.sezon.hf
  });
  kariyer.butce += imza;
  maliIsle("gelir", "sponsor", imza);
  kariyer.sponsorTeklif.splice(i, 1);
  kaydet();
  sponsorEkrani();
}

function sponsorIptal(i) {
  const s = kariyer.sponsorlar[i];
  if (!s) return;
  const ceza = s.haftalik * SPONSOR_IPTAL_HAFTA;
  if (kariyer.butce - ceza < 0) { alert("Ceza için bütçen yetersiz: " + para(ceza)); return; }
  if (!confirm(s.ad + " anlaşması bitirilecek. Ceza: " + para(ceza) + ". Onaylıyor musun?")) return;
  kariyer.butce -= ceza;
  maliIsle("gider", "faiz", ceza);
  kariyer.sponsorlar.splice(i, 1);
  kaydet();
  sponsorEkrani();
}

// Sezon sonunda hedef kontrolü ve bonus ödemesi (sira: lig sıran, 1'den başlar)
function sponsorSezonSonu(sira) {
  const sz = kariyer.sezon;
  const galibiyet = sz.tablo[0].g;
  const mesaj = [];
  (kariyer.sponsorlar || []).forEach(function (s) {
    if (s.bitis < kariyer.hafta - 1) return;
    if (!(s.imzaSezon < sz.no || s.imzaHf <= 1)) {
      mesaj.push(s.ad + ": sezon ortasında imzalandı, bonus yok.");
      return;
    }
    const ok = s.hedef.tur === "lig" ? sira <= s.hedef.deger : galibiyet >= s.hedef.deger;
    if (ok) {
      kariyer.butce += s.bonus;
      maliIsle("gelir", "sponsor", s.bonus);
      mesaj.push(s.ad + ": hedef tuttu, +" + para(s.bonus));
    } else {
      mesaj.push(s.ad + ": hedef tutmadı (" + hedefYazi(s.hedef) + ").");
    }
  });
  kariyer.sponsorSon = mesaj;
  sponsorTemizle();
}
