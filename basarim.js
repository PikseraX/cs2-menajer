const BASARIMLAR = [
  { id: "g1", ad: "İlk Galibiyet", acik: "İlk maçını kazan.", kos: function () { return (kariyer.galibiyet || 0) >= 1; } },
  { id: "g10", ad: "Isınma Turu", acik: "Toplam 10 galibiyet al.", kos: function () { return (kariyer.galibiyet || 0) >= 10; } },
  { id: "g50", ad: "Maç Makinesi", acik: "Toplam 50 galibiyet al.", kos: function () { return (kariyer.galibiyet || 0) >= 50; } },
  { id: "g100", ad: "Yüz Numara", acik: "Toplam 100 galibiyet al.", kos: function () { return (kariyer.galibiyet || 0) >= 100; } },
  { id: "sezon1", ad: "İlk Sezon", acik: "Bir sezonu tamamla.", kos: function () { return (kariyer.gecmis || []).length >= 1; } },
  { id: "sezon5", ad: "Köklü Kulüp", acik: "5 sezonu tamamla.", kos: function () { return (kariyer.gecmis || []).length >= 5; } },
  { id: "yuksel", ad: "Yükselen Takım", acik: "Bir üst lige yüksel.", kos: function () { return (kariyer.gecmis || []).some(function (x) { return x.lig && x.yeniLig && x.yeniLig < x.lig; }); } },
  { id: "ligsamp", ad: "Lig Şampiyonu", acik: "Bir ligi 1. sırada bitir.", kos: function () { return (kariyer.gecmis || []).some(function (x) { return x.sira === 1; }); } },
  { id: "birinci", ad: "Zirve Ligi", acik: "1. Lig'e ulaş.", kos: function () { return kariyer.ligNo === 1; } },
  { id: "sira50", ad: "İlk 50", acik: "Dünya sıralamasında ilk 50'ye gir.", kos: function () { return benimDunyaSirasi() <= 50; } },
  { id: "sira16", ad: "Elit Takım", acik: "Dünya sıralamasında ilk 16'ya gir.", kos: function () { return benimDunyaSirasi() <= 16; } },
  { id: "sira1", ad: "Dünya Bir Numarası", acik: "Dünya sıralamasında 1. ol.", kos: function () { return benimDunyaSirasi() === 1; } },
  { id: "turn1", ad: "Turnuva Acemisi", acik: "İlk turnuvanı oyna.", kos: function () { return (kariyer.turnuvaGecmis || []).length >= 1; } },
  { id: "final", ad: "Finalist", acik: "Bir turnuvada finale çık.", kos: function () { return (kariyer.turnuvaGecmis || []).some(function (x) { return x.yer === "Finalde elendi" || x.yer === "Şampiyon!"; }); } },
  { id: "kupa", ad: "Kupa Sahibi", acik: "Bir turnuvayı kazan.", kos: function () { return (kariyer.turnuvaGecmis || []).some(function (x) { return x.yer === "Şampiyon!"; }); } },
  { id: "dunya", ad: "Dünya Şampiyonu", acik: "Uluslararası Büyük Turnuva'yı kazan.", kos: function () { return (kariyer.turnuvaGecmis || []).some(function (x) { return x.ad === "Uluslararası Büyük Turnuva" && x.yer === "Şampiyon!"; }); } },
  { id: "milyon", ad: "Milyoner", acik: "Bütçeni 1.000.000 $'a çıkar.", kos: function () { return kariyer.butce >= 1000000; } },
  { id: "yildiz", ad: "Yıldız Oyuncu", acik: "GEN 75 veya üstü bir oyuncun olsun.", kos: function () { return tumKadro().some(function (o) { return o.genel >= 75; }); } },
  { id: "mezun", ad: "Akademi Mezunu", acik: "Akademiden çıkan bir oyuncu GEN 70'e ulaşsın.", kos: function () { return tumKadro().some(function (o) { return o.pot !== undefined && o.genel >= 70; }); } },
  { id: "kusursuz", ad: "Kusursuz Kadro", acik: "İlk 5'teki herkes kendi rolünde 4 yeşil özelliğe sahip olsun.", kos: function () { return kariyer.oyuncular.every(function (o) { return yesilSayisi(o, o.rol) === 4; }); } },
  { id: "personel", ad: "Tam Kadro Personel", acik: "Koç, fizyoterapist ve analisti seviye 3 yap.", kos: function () { return PERSONEL_TURLERI.every(function (t) { return personelSeviye(t) >= 3; }); } },
  { id: "sponsor3", ad: "Marka Değeri", acik: "Aynı anda 3 sponsorun olsun.", kos: function () { return (kariyer.sponsorlar || []).filter(sponsorAktif).length >= 3; } },
  { id: "aile", ad: "Büyük Aile", acik: "Yedek kadroyu (3) ve akademiyi (4) doldur.", kos: function () { return yedekListe().length >= YEDEK_MAX && (kariyer.akademi || []).length >= AKADEMI_MAX; } }
];

// Ana ekran açılırken çağrılır, yeni açılan başarımları işler
function basarimKontrol() {
  sezonHazirla();
  if (!kariyer.basarimlar) kariyer.basarimlar = {};
  let degisti = false;
  const sira = benimDunyaSirasi();
  if (!kariyer.enIyiSira || sira < kariyer.enIyiSira) { kariyer.enIyiSira = sira; degisti = true; }
  const yeni = [];
  BASARIMLAR.forEach(function (b) {
    if (kariyer.basarimlar[b.id]) return;
    let ok = false;
    try { ok = b.kos(); } catch (e) { ok = false; }
    if (ok) {
      kariyer.basarimlar[b.id] = { sezon: kariyer.sezon.no, hafta: kariyer.hafta || 1 };
      yeni.push(b.ad);
      degisti = true;
    }
  });
  if (degisti) kaydet();
  if (yeni.length > 0) alert("Yeni başarım: " + yeni.join(", "));
}

function basarimEkrani() {
  const acik = kariyer.basarimlar || {};
  const n = BASARIMLAR.filter(function (b) { return acik[b.id]; }).length;
  let html = '<button class="geri" onclick="arsivEkrani()">← Geri</button><h2>Başarımlar</h2>';
  html += '<div class="bilgi-kutusu">Açılan: <b>' + n + " / " + BASARIMLAR.length + "</b></div>";
  BASARIMLAR.forEach(function (b) {
    const a = acik[b.id];
    const stil = a ? ' style="border-color:#22c55e"' : "";
    html += '<div class="bilgi-kutusu"' + stil + "><b>" + (a ? "✓ " : "") + b.ad + "</b><br>" + b.acik + (a ? "<br><small>Sezon " + a.sezon + ", hafta " + a.hafta + "</small>" : "") + "</div>";
  });
  uygulama.innerHTML = html;
}

function arsivEkrani() {
  sezonHazirla();
  const g = kariyer.gecmis || [];
  const tg = kariyer.turnuvaGecmis || [];
  const w = kariyer.galibiyet || 0, l = kariyer.maglubiyet || 0;
  const oran = w + l > 0 ? Math.round(w * 100 / (w + l)) : 0;
  const ligSamp = g.filter(function (x) { return x.sira === 1; }).length;
  const kupa = tg.filter(function (x) { return x.yer === "Şampiyon!"; }).length;
  const acik = kariyer.basarimlar || {};
  const n = BASARIMLAR.filter(function (b) { return acik[b.id]; }).length;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Kariyer Arşivi</h2>';
  html += '<div class="bilgi-kutusu"><b>' + kariyer.takimAdi + "</b><br>Mevcut sezon: <b>" + kariyer.sezon.no + "</b> · Tamamlanan: <b>" + g.length + "</b><br>Galibiyet: <b>" + w + "</b> · Mağlubiyet: <b>" + l + "</b> (%" + oran + ")<br>Lig şampiyonluğu: <b>" + ligSamp + "</b><br>Turnuva kupası: <b>" + kupa + "</b> (" + tg.length + " turnuva)<br>En iyi dünya sırası: <b>" + (kariyer.enIyiSira || benimDunyaSirasi()) + "</b> · Şimdiki: <b>" + benimDunyaSirasi() + "</b><br>Bütçe: <b>" + para(kariyer.butce) + "</b></div>";
  html += '<button class="buton" onclick="basarimEkrani()">Başarımlar (' + n + "/" + BASARIMLAR.length + ")</button>";
  html += "<h2>Sezon Geçmişi</h2>";
  if (g.length === 0) html += "<p>Henüz tamamlanan sezon yok.</p>";
  else {
    html += '<div class="tablo-kutusu"><table><tr><th>Sezon</th><th>Lig</th><th>Sıra</th><th>Sonuç</th><th>En İyi Oyuncu</th></tr>';
    g.slice().reverse().forEach(function (x) {
      let sonuc = "-";
      if (x.lig && x.yeniLig) sonuc = x.yeniLig < x.lig ? "Yükseldi" : (x.yeniLig > x.lig ? "Düştü" : "Kaldı");
      html += "<tr><td>" + x.sezon + "</td><td>" + (x.lig ? LIG_ADLARI[x.lig - 1] : "-") + "</td><td>" + x.sira + "</td><td>" + sonuc + "</td><td>" + (x.mvp ? x.mvp.ad + " (" + x.mvp.ort + ")" : "-") + "</td></tr>";
    });
    html += "</table></div>";
  }
  html += "<h2>Turnuva Geçmişi</h2>";
  if (tg.length === 0) html += "<p>Henüz turnuva oynamadın.</p>";
  tg.slice().reverse().slice(0, 15).forEach(function (x) {
    html += "<p>Sezon " + x.sezon + " · " + x.ad + ": " + x.yer + "</p>";
  });
  uygulama.innerHTML = html;
}
