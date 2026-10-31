let sonHub = null;

function metrik(deger, ad, kotu) {
  return '<div class="metrik"><b' + (kotu ? ' style="color:#ef4444"' : "") + ">" + deger + "</b><span>" + ad + "</span></div>";
}

function menuSatiri(ad, aciklama, fn, rozet) {
  return '<button class="menu-satir" onclick="' + fn + '"><span><b>' + ad + "</b><small>" + aciklama + "</small></span>" + (rozet ? '<em class="rozet">' + rozet + "</em>" : "<i>›</i>") + "</button>";
}

function menuKarti(ikon, ad, aciklama, fn, rozet) {
  return '<button class="menu-kart" onclick="' + fn + '"><span class="ikon">' + ikon + "</span>" + ad + "<small>" + aciklama + "</small>" + (rozet ? '<em class="rozet" style="position:absolute;top:10px;right:10px">' + rozet + "</em>" : "") + "</button>";
}

function hubAc(kimlik, baslik, icerik) {
  sonHub = kimlik + "()";
  uygulama.innerHTML = '<button class="geri" data-sabit="1" onclick="kariyerEkrani()">← Ana Ekran</button><h2>' + baslik + "</h2>" + icerik;
}

function sozlesmeUyariSayisi() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  return tumKadro().filter(function (o) { return o.bitis - hf + 1 <= SOZLESME_UYARI_HAFTA; }).length;
}

function uyariKutusu() {
  sozlesmeHazirla();
  const hf = kariyer.hafta || 1;
  const u = [];
  if (kariyer.butce < 0) u.push("Bütçe eksi: her hafta %" + (BORC_FAIZ * 100) + " faiz işliyor.");
  tumKadro().filter(sozlesmeBitti).forEach(function (o) {
    u.push(o.ad + ": sözleşmesi bitti, " + (o.bitis + SOZLESME_EK_HAFTA + 1 - hf) + " hafta içinde ayrılır.");
  });
  const yaklasan = tumKadro().filter(function (o) {
    const kalan = o.bitis - hf + 1;
    return kalan > 0 && kalan <= SOZLESME_UYARI_HAFTA;
  }).map(function (o) { return o.ad + " (" + (o.bitis - hf + 1) + " hf)"; });
  if (yaklasan.length > 0) u.push("Sözleşmesi yaklaşan: " + yaklasan.join(", "));
  return u.length === 0 ? "" : '<div class="uyari">' + u.join("<br>") + "</div>";
}

function bildirimler() {
  let h = "";
  if (basinBekliyor()) h += '<button class="buton" onclick="basinEkrani()">Basın Toplantısı</button>';
  if (kariyer.olay) h += '<button class="buton" onclick="olayEkrani()">Takım İçi Olay!</button>';
  if (teklifSayisi() > 0) h += '<button class="buton" onclick="teklifEkrani()">Satın Alma Teklifleri (' + kariyer.teklifler.length + ")</button>";
  return h;
}

// ---------- Ana ekran ----------
function kariyerEkrani() {
  sonHub = null;
  rakipleriBagla();
  tarzlariHazirla();
  stratejiHazirla();
  basarimKontrol();
  sezonHazirla();
  const sira = benimDunyaSirasi();
  let html = '<div class="hero"><h1 style="color:' + kariyer.renk + '">' + kariyer.takimAdi + "</h1>";
  html += '<div class="alt">' + LIG_ADLARI[kariyer.ligNo - 1] + " · " + (kariyer.galibiyet || 0) + " galibiyet · " + (kariyer.maglubiyet || 0) + " mağlubiyet</div>";
  html += '<div class="metrikler">' + metrik(para(kariyer.butce), "Bütçe", kariyer.butce < 0) + metrik(para(haftalikGider()), "Haftalık gider") + metrik(sira + ". / 100", "Dünya sırası") + metrik(itibarOf(), "İtibar") + "</div></div>";
  html += uyariKutusu();
  html += sezonKutusu().replace('<button class="buton ikincil" onclick="tabloEkrani()">Puan Tablosu</button>', "");
  html += bildirimler();
  const piyasaRozet = sozlesmeUyariSayisi() + teklifSayisi();
  html += '<div class="menu-izgara">';
  html += menuKarti("👥", "Takım", "Kadro, gelişim, personel", "kadroEkrani()");
  html += menuKarti("🔄", "Transfer", "Piyasa ve sözleşmeler", "piyasaMenu()", piyasaRozet > 0 ? piyasaRozet : "");
  html += menuKarti("🏢", "Kulüp", "Finans, sponsor, arşiv", "kulupMenu()");
  html += menuKarti("🏆", "Lig ve Turnuva", "Tablo, lig, sıralama", "ligMenu()");
  html += "</div>";
  html += '<button class="buton ikincil" onclick="anaMenu()">Ana Menü</button>';
  uygulama.innerHTML = html;
}

// ---------- Takım menüsü (eski Kadro ekranının yerini alır) ----------
function kadroEkrani() {
  const u = stratejiUyumu(kariyer.oyuncular, kariyer.strateji);
  let h = menuSatiri("Kadro", "İlk 5 · ortalama GEN " + Math.round(ortGuc(kariyer.oyuncular)), "kadroDetay()");
  h += menuSatiri("Strateji Belirle", kariyer.strateji + " · uyum " + u + "/5", "stratejiEkrani()");
  h += menuSatiri("Yedek Kadro", yedekListe().length + "/" + YEDEK_MAX + " oyuncu", "yedekEkrani()");
  h += '<div class="alt-baslik">Gelişim</div>';
  h += menuSatiri("Antrenman Odağı", "Oyuncu başına gelişim odağı", "odakEkrani()");
  h += menuSatiri("Harita Antrenmanı", "Odak: " + (kariyer.haritaOdak || "seçilmedi"), "haritaAntrenmanEkrani()", kariyer.haritaOdak ? "" : "!");
  h += menuSatiri("Akademi ve Scout", "Akademi " + (kariyer.akademi || []).length + "/" + AKADEMI_MAX + " · scout seviye " + (kariyer.scout || 0), "akademiEkrani()");
  h += '<div class="alt-baslik">Ekip</div>';
  h += menuSatiri("Personel", "Koç " + personelSeviye("koc") + " · Fizyo " + personelSeviye("fizyo") + " · Analist " + personelSeviye("analist"), "personelEkrani()");
  h += menuSatiri("İstatistikler", "Sezon ve kariyer", "istatistikEkrani()");
  h += '<div class="alt-baslik">Rehberler</div>';
  h += menuSatiri("Strateji Rehberi", "Stratejiler ve istedikleri roller", "stratejiRehberi()");
  h += menuSatiri("Rol Rehberi", "Rollerin istediği özellikler", "rolRehberi()");
  hubAc("kadroEkrani", "Takım", h);
}

function kadroDetay() {
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>Kadro</h2>';
  html += kadroOzet(kariyer.oyuncular, kariyer.strateji) + tabloHtml(kariyer.oyuncular);
  html += formTablosu(kariyer.oyuncular, "Moral ve Yorgunluk");
  if (yedekListe().length > 0) html += formTablosu(yedekListe(), "Yedek Moral ve Yorgunluk");
  html += haritaTablosu({ oyuncular: kariyer.oyuncular });
  uygulama.innerHTML = html;
}

// ---------- Diğer menüler ----------
function piyasaMenu() {
  const yak = sozlesmeUyariSayisi();
  let h = menuSatiri("Transfer Piyasası", "Serbest oyuncular · bütçe " + para(kariyer.butce), "transferEkrani()");
  h += menuSatiri("Sözleşmeler", "Yenileme ve maaşlar", "sozlesmeEkrani()", yak > 0 ? yak : "");
  if (teklifSayisi() > 0) h += menuSatiri("Satın Alma Teklifleri", "Rakip kulüpler teklif yaptı", "teklifEkrani()", kariyer.teklifler.length);
  hubAc("piyasaMenu", "Transfer", h);
}

function kulupMenu() {
  const sp = (kariyer.sponsorlar || []).filter(sponsorAktif).length;
  const bs = BASARIMLAR.filter(function (b) { return (kariyer.basarimlar || {})[b.id]; }).length;
  let h = menuSatiri("Finans", "Gelir, gider ve sezon özeti", "ekonomiEkrani()");
  h += menuSatiri("Sponsorlar", "Aktif " + sp + "/" + SPONSOR_MAX + " · haftalık +" + para(sponsorHaftalik()), "sponsorEkrani()");
  h += menuSatiri("Kariyer Arşivi", "Geçmiş sezonlar · başarım " + bs + "/" + BASARIMLAR.length, "arsivEkrani()");
  hubAc("kulupMenu", "Kulüp", h);
}

function ligMenu() {
  const davet = TURNUVALAR.filter(function (T) { return turnuvaDurum(T) === "hazir"; }).length;
  let h = menuSatiri("Puan Tablosu", "Lig sıran: " + (siralama().indexOf(0) + 1) + ".", "tabloEkrani()");
  h += menuSatiri("Ligler", "3 lig · yükselme ve düşme", "ligEkrani()");
  h += menuSatiri("Turnuvalar", davet > 0 ? "Davetin var!" : "Davetler dünya sıralamana göre", "turnuvaEkrani()", davet > 0 ? davet : "");
  h += menuSatiri("Dünya Sıralaması", "Sıran " + benimDunyaSirasi() + ". / 100", "siralamaEkrani()");
  hubAc("ligMenu", "Lig ve Turnuva", h);
}

// Menüden açılan ekranlarda Geri tuşunu ana ekran yerine o menüye döndürür
function geriDuzelt() {
  window.scrollTo(0, 0);
  if (!sonHub) return;
  uygulama.querySelectorAll(".geri").forEach(function (g) {
    if (g.dataset.sabit) return;
    if (g.getAttribute("onclick") === "kariyerEkrani()") g.setAttribute("onclick", sonHub);
  });
}

new MutationObserver(geriDuzelt).observe(uygulama, { childList: true });
