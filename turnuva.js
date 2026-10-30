const TURNUVALAR = [
  { id: "yerel", ad: "Yerel Kupa", boyut: 32, min: 49, max: 80,
    oduller: [40000, 20000, 12000, 8000, 4000, 2000], puan: [30, 18, 12, 8, 4, 2] },
  { id: "bolgesel", ad: "Bölgesel Turnuva", boyut: 32, min: 17, max: 48,
    oduller: [120000, 60000, 35000, 20000, 10000, 5000], puan: [60, 36, 24, 14, 8, 4] },
  { id: "uluslararasi", ad: "Uluslararası Büyük Turnuva", boyut: 16, min: 1, max: 16,
    oduller: [500000, 250000, 120000, 60000, 30000], puan: [120, 72, 40, 20, 10] }
];

function turnuvaBul(id) {
  return TURNUVALAR.find(function (t) { return t.id === id; });
}

function turnuvaTakim(id) {
  return id === -1 ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular, strateji: kariyer.strateji } : dunya[id];
}

function benimDunyaSirasi() {
  const l = dunyaSirasi();
  for (let i = 0; i < l.length; i++) { if (l[i].ben) return i + 1; }
  return l.length;
}

function turnuvaToplamTur(T) {
  return Math.round(Math.log(T.boyut) / Math.log(2));
}

function turAdi(T, tur) {
  const n = T.boyut / Math.pow(2, tur - 1);
  if (n === 2) return "Final";
  if (n === 4) return "Yarı Final";
  if (n === 8) return "Çeyrek Final";
  return "Son " + n;
}

function turnuvaDurum(T) {
  sezonHazirla();
  const sz = kariyer.sezon;
  sz.tb = sz.tb || {};
  if (sz.tb[T.id]) return "bitti";
  if (kariyer.turnuva && kariyer.turnuva.tid === T.id && kariyer.turnuva.sezon === sz.no) return "devam";
  if (sz.bitti || (sz.fikstur.length - sz.gun) < turnuvaToplamTur(T)) return "gec";
  const s = benimDunyaSirasi();
  if (s < T.min || s > T.max) return "davetsiz";
  return "hazir";
}

// Ana ekrandaki turnuva haftası kutusunun devamı (kutuyu kapatır, butonları ekler)
function turnuvaHaftaKutusu() {
  const sz = kariyer.sezon;
  const tu = kariyer.turnuva;
  const aktif = tu && tu.sezon === sz.no && tu.v === 2;
  let h = "";
  if (aktif) {
    const T = turnuvaBul(tu.tid);
    const rakip = turnuvaRakibi(tu);
    h += "<br>" + T.ad + " · " + turAdi(T, tu.tur);
    if (rakip) h += "<br>Rakip: <b>" + rakip.ad + "</b> (Güç " + Math.round(ortGuc(rakip.oyuncular)) + ")";
    if (tu.sonHafta === kariyer.hafta) h += "<br>Bu haftanın turu oynandı.";
    h += "</div>";
    if (tu.sonHafta === kariyer.hafta) h += '<button class="buton" onclick="haftaGec()">Haftayı Bitir</button>';
    else h += '<button class="buton" onclick="turnuvaBanBaslat()">Maçı Oyna</button>';
    return h;
  }
  const davetli = TURNUVALAR.filter(function (T) { return turnuvaDurum(T) === "hazir"; });
  if (davetli.length > 0) {
    h += "<br>Davetlisin: <b>" + davetli.map(function (T) { return T.ad; }).join(", ") + "</b></div>";
    h += '<button class="buton" onclick="turnuvaEkrani()">Turnuvaya Katıl</button>';
    h += '<button class="buton ikincil" onclick="haftaGec()">Katılma, Haftayı Bitir</button>';
  } else {
    h += "<br>Bu hafta turnuva maçın yok.</div>";
    h += '<button class="buton" onclick="haftaGec()">Haftayı Bitir</button>';
  }
  return h;
}

function turnuvaEkrani() {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (kariyer.turnuva && (kariyer.turnuva.sezon !== sz.no || kariyer.turnuva.v !== 2)) kariyer.turnuva = null;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Turnuvalar</h2>';
  html += '<div class="bilgi-kutusu">Dünya sıralaman: <b>' + benimDunyaSirasi() + ". / 100</b><br>Davetler dünya sıralamana göre gelir. Turlar yalnızca turnuva haftalarında oynanır (lig ve turnuva haftaları sırayla gelir). Maçlar BO3, her taraf 2 harita yasaklar. Sezon bitince yarım kalan turnuva silinir.</div>";
  TURNUVALAR.forEach(function (T) {
    const d = turnuvaDurum(T);
    let durum = "";
    if (d === "bitti") durum = "Bu sezon oynandı.";
    if (d === "devam") durum = "<b>Devam ediyor.</b>";
    if (d === "gec") durum = "Bu sezon için yeterli turnuva haftası kalmadı.";
    if (d === "davetsiz") durum = "Davet yok.";
    if (d === "hazir") durum = '<b style="color:#22c55e">DAVETLİSİN</b>';
    html += '<div class="bilgi-kutusu"><b>' + T.ad + "</b> (" + T.boyut + " takım, " + turnuvaToplamTur(T) + " tur)<br>Davet: dünya sıralamasında " + T.min + "-" + T.max + ". sıra<br>Şampiyonluk ödülü: " + para(T.oduller[0]) + "<br>" + durum + "</div>";
    if (d === "hazir") html += '<button class="buton" onclick="turnuvaBaslat(\'' + T.id + '\')">Katıl</button>';
    if (d === "devam") html += '<button class="buton" onclick="turnuvaDevam()">Turnuvaya Devam Et</button>';
  });
  html += "<h2>Turnuva Geçmişi</h2>";
  const g = kariyer.turnuvaGecmis || [];
  if (g.length === 0) html += "<p>Henüz turnuva oynamadın.</p>";
  g.slice().reverse().slice(0, 10).forEach(function (x) {
    html += "<p>Sezon " + x.sezon + " · " + x.ad + ": " + x.yer + "</p>";
  });
  uygulama.innerHTML = html;
}

function turnuvaBaslat(tid) {
  const T = turnuvaBul(tid);
  if (turnuvaDurum(T) !== "hazir") return;
  if (kariyer.turnuva && kariyer.turnuva.sezon === kariyer.sezon.no && kariyer.turnuva.v === 2) {
    alert("Önce devam eden turnuvayı bitir.");
    return;
  }
  const katilan = dunyaSirasi().slice(T.min - 1, T.max).map(function (x) { return x.idx; });
  if (katilan.length !== T.boyut || katilan.indexOf(-1) < 0) { alert("Katılımcı listesi kurulamadı."); return; }
  kariyer.turnuva = {
    v: 2,
    tid: T.id,
    sezon: kariyer.sezon.no,
    katilan: katilan,
    hayatta: karistir(katilan),
    tur: 1,
    toplamTur: turnuvaToplamTur(T),
    elendi: {},
    sonHafta: 0
  };
  kaydet();
  turnuvaDevam();
}

// Senin maçındaki rakip (yoksa null)
function turnuvaRakibi(tu) {
  for (let i = 0; i < tu.hayatta.length; i += 2) {
    const a = tu.hayatta[i], b = tu.hayatta[i + 1];
    if (a === -1) return turnuvaTakim(b);
    if (b === -1) return turnuvaTakim(a);
  }
  return null;
}

function turnuvaDevam() {
  const tu = kariyer.turnuva;
  if (!tu) { turnuvaEkrani(); return; }
  const T = turnuvaBul(tu.tid);
  const rakip = turnuvaRakibi(tu);
  let html = '<button class="geri" onclick="turnuvaEkrani()">← Geri</button><h2>' + T.ad + " · " + turAdi(T, tu.tur) + "</h2>";
  html += "<p>Kalan takım: " + tu.hayatta.length + " · Her turnuva haftasında 1 tur · Maçlar BO3</p>";
  if (rakip) {
    html += '<div class="bilgi-kutusu" style="border-color:' + kariyer.renk + '"><b>Senin maçın</b><br>' + kariyer.takimAdi + " (Güç " + Math.round(ortGuc(kariyer.oyuncular)) + ")<br>vs<br>" + rakip.ad + " (Güç " + Math.round(ortGuc(rakip.oyuncular)) + ")</div>";
  }
  if (tu.sonHafta === kariyer.hafta) {
    html += '<div class="bilgi-kutusu">Bu haftaki turu oynadın. Sonraki tur için haftayı bitir.</div>';
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  } else if (kariyer.sezon.hf % 2 !== 1) {
    html += '<div class="bilgi-kutusu">Turnuva turları yalnızca turnuva haftasında oynanır. Önce lig maçını oyna ve haftayı bitir.</div>';
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  } else {
    html += '<button class="buton" onclick="turnuvaBanBaslat()">Harita Yasaklamaya Geç</button>';
  }
  uygulama.innerHTML = html;
}

function turnuvaBanBaslat() {
  const tu = kariyer.turnuva;
  if (!tu || tu.sonHafta === kariyer.hafta || kariyer.sezon.hf % 2 !== 1) return;
  const rakip = turnuvaRakibi(tu);
  if (!rakip) return;
  banDurum = { mod: "turnuva", rakip: rakip, hedef: 3, geri: "turnuvaDevam()", banlar: [] };
  banEkrani();
}

// İki takım arka arkaya harita oynar, önce 2 harita kazanan seriyi alır
function seriOyna(A, B, liste) {
  let a = 0, b = 0;
  const haritalar = [];
  while (a < 2 && b < 2) {
    const hr = liste[haritalar.length];
    const s = macOyna(A, B, hr);
    haritalar.push(hr + " " + s.sa + "-" + s.sb);
    if (s.sa > s.sb) a++; else b++;
  }
  return { a: a, b: b, haritalar: haritalar };
}

// Bir turu oynatır, kazananları ayırır. kalan: senin maçının 3 haritası
function turVer(tu, kalan, banYazi) {
  const n = tu.tur;
  const satirlar = [];
  const yeni = [];
  for (let i = 0; i < tu.hayatta.length; i += 2) {
    const a = tu.hayatta[i], b = tu.hayatta[i + 1];
    const A = turnuvaTakim(a), B = turnuvaTakim(b);
    const benim = a === -1 || b === -1;
    const liste = (benim && kalan) ? karistir(kalan) : karistir(HARITALAR).slice(0, 3);
    const s = seriOyna(A, B, liste);
    const aKazandi = s.a > s.b;
    yeni.push(aKazandi ? a : b);
    tu.elendi[aKazandi ? b : a] = n;
    let satir = A.ad + " " + s.a + " - " + s.b + " " + B.ad;
    if (benim) satir = "<b>" + satir + "</b> (" + s.haritalar.join(", ") + ")" + (banYazi ? "<br>" + banYazi : "");
    satirlar.push(satir);
  }
  tu.hayatta = yeni;
  tu.tur = n + 1;
  return { tur: n, satirlar: satirlar };
}

function turnuvaTurOyna(kalan, banYazi) {
  const tu = kariyer.turnuva;
  if (!tu || tu.sonHafta === kariyer.hafta || kariyer.sezon.hf % 2 !== 1) return;
  const T = turnuvaBul(tu.tid);
  tu.sonHafta = kariyer.hafta;
  const rapor = [turVer(tu, kalan, banYazi)];
  moralMacSonucu(tu.elendi[-1] === undefined);
  while (tu.hayatta.length > 1 && tu.hayatta.indexOf(-1) < 0) {
    rapor.push(turVer(tu));
  }
  if (tu.hayatta.length === 1) {
    turnuvaBitir(T, tu, rapor);
  } else {
    kaydet();
    turnuvaRaporu(T, rapor, null);
  }
}

function turnuvaBitir(T, tu, rapor) {
  const sampiyon = tu.hayatta[0];
  const yer = function (id) {
    return id === sampiyon ? 0 : tu.toplamTur - tu.elendi[id] + 1;
  };
  dunyaSiralamaHazirla();
  tu.katilan.forEach(function (id) {
    const p = T.puan[yer(id)];
    if (id === -1) kariyer.puan += p; else dunya[id].puan += p;
  });
  const y = yer(-1);
  const odul = T.oduller[y];
  kariyer.butce += odul;
  maliIsle("gelir", "turnuva", odul);
  let yerYazi = "Şampiyon!";
  if (y === 1) yerYazi = "Finalde elendi";
  if (y > 1) yerYazi = turAdi(T, tu.elendi[-1]) + " turunda elendi";
  kariyer.sezon.tb = kariyer.sezon.tb || {};
  kariyer.sezon.tb[T.id] = true;
  (kariyer.turnuvaGecmis = kariyer.turnuvaGecmis || []).push({ sezon: kariyer.sezon.no, ad: T.ad, yer: yerYazi });
  const sonuc = { yerYazi: yerYazi, sampiyon: turnuvaTakim(sampiyon).ad, odul: odul, puan: T.puan[y] };
  kariyer.turnuva = null;
  kaydet();
  turnuvaRaporu(T, rapor, sonuc);
}

function turnuvaRaporu(T, rapor, sonuc) {
  let html = "<h2>" + T.ad + "</h2>";
  if (sonuc) {
    html += '<div class="bilgi-kutusu">Sonucun: <b>' + sonuc.yerYazi + "</b><br>Şampiyon: <b>" + sonuc.sampiyon + "</b><br>Ödül: <b>+" + para(sonuc.odul) + "</b><br>Sıralama puanı: <b>+" + sonuc.puan + "</b></div>";
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
    html += '<button class="buton ikincil" onclick="turnuvaEkrani()">Turnuvalar</button>';
  } else {
    html += '<div class="bilgi-kutusu">Turu geçtin. Sonraki tur bir sonraki turnuva haftasında (2 hafta sonra) oynanır.</div>';
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  }
  rapor.forEach(function (r) {
    html += "<h2>" + turAdi(T, r.tur) + "</h2>";
    r.satirlar.forEach(function (s) { html += "<p>" + s + "</p>"; });
  });
  uygulama.innerHTML = html;
}
