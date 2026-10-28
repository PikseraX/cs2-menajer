const LIG_TAKIM_SAYISI = 8;
const SEZON_ODULLERI = [150000, 100000, 60000, 30000, 15000, 10000, 5000, 5000];

// 0 = senin takımın, 1-7 = sezon.takimlar listesindeki rakipler
function ligTakim(i) {
  if (i === 0) return { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular, strateji: kariyer.strateji };
  return dunya[kariyer.sezon.takimlar[i]];
}

function fiksturUret(n) {
  const t = [];
  for (let i = 0; i < n; i++) t.push(i);
  const tur = [];
  for (let r = 0; r < n - 1; r++) {
    const m = [];
    for (let i = 0; i < n / 2; i++) {
      const a = t[i], b = t[n - 1 - i];
      m.push(r % 2 === 0 ? [a, b] : [b, a]);
    }
    tur.push(m);
    t.splice(1, 0, t.pop());
  }
  const ikinci = tur.map(function (m) {
    return m.map(function (x) { return [x[1], x[0]]; });
  });
  return tur.concat(ikinci);
}

function yeniSezon(no) {
  const tablo = [];
  for (let i = 0; i < LIG_TAKIM_SAYISI; i++) tablo.push({ o: 0, g: 0, m: 0, puan: 0, rd: 0 });
  return { no: no, gun: 0, oynandi: false, bitti: false, fikstur: fiksturUret(LIG_TAKIM_SAYISI), tablo: tablo, takimlar: ligTakimlari() };
}

function sezonHazirla() {
  ligHazirla();
  if (!kariyer.sezon) { kariyer.sezon = yeniSezon(1); kaydet(); }
}

function siralama() {
  const t = kariyer.sezon.tablo;
  return t.map(function (x, i) { return i; }).sort(function (a, b) {
    return (t[b].puan - t[a].puan) || (t[b].rd - t[a].rd) || (a - b);
  });
}

function sonucIsle(a, b, s) {
  const t = kariyer.sezon.tablo;
  const x = t[a], y = t[b];
  x.o++; y.o++;
  x.rd += s.sa - s.sb;
  y.rd += s.sb - s.sa;
  if (s.sa > s.sb) { x.g++; x.puan += 3; y.m++; }
  else { y.g++; y.puan += 3; x.m++; }
}

function sezonKutusu() {
  sezonHazirla();
  const sz = kariyer.sezon;
  let h = '<div class="bilgi-kutusu">Sezon ' + sz.no + " · " + LIG_ADLARI[kariyer.ligNo - 1] + " · ";
  if (sz.bitti) {
    h += "Bitti<br>Sıralaman: <b>" + (siralama().indexOf(0) + 1) + ".</b></div>";
    h += '<button class="buton" onclick="sezonuKapat()">Ödülü Al, Yeni Sezonu Başlat</button>';
  } else {
    const m = sz.fikstur[sz.gun].find(function (x) { return x[0] === 0 || x[1] === 0; });
    const rakip = ligTakim(m[0] === 0 ? m[1] : m[0]);
    h += "Hafta " + (sz.gun + 1) + "/" + sz.fikstur.length;
    h += "<br>Rakip: <b>" + rakip.ad + "</b> (Güç " + Math.round(ortGuc(rakip.oyuncular)) + ")";
    if (sz.oynandi) h += "<br>Bu haftanın maçı oynandı.";
    h += "</div>";
    if (!sz.oynandi) { h += '<button class="buton" onclick="sezonMaciOyna()">Maçı Oyna</button>'; }
    else { h += '<button class="buton" onclick="haftaGec()">Haftayı Bitir</button>'; }
  }
  h += '<button class="buton ikincil" onclick="tabloEkrani()">Puan Tablosu</button>';
  return h;
}

function sezonMaciOyna() {
  sezonHazirla();
  const sz = kariyer.sezon;
  if (sz.bitti || sz.oynandi) return;
  let benim = null;
  const digerleri = [];
  sz.fikstur[sz.gun].forEach(function (m) {
    const a = m[0], b = m[1];
    const A = ligTakim(a), B = ligTakim(b);
    const s = macOyna(A, B);
    sonucIsle(a, b, s);
    if (a === 0) {
      benim = { rakip: B, s: s };
    } else if (b === 0) {
      benim = { rakip: A, s: { sa: s.sb, sb: s.sa, istA: s.istB, istB: s.istA, uzatma: s.uzatma } };
    } else {
      digerleri.push(A.ad + " " + s.sa + " - " + s.sb + " " + B.ad);
    }
  });
  const kazandi = benim.s.sa > benim.s.sb;
  const odul = kazandi ? 20000 : 5000;
  kariyer.butce += odul;
  if (kazandi) { kariyer.galibiyet = (kariyer.galibiyet || 0) + 1; }
  else { kariyer.maglubiyet = (kariyer.maglubiyet || 0) + 1; }
  sz.oynandi = true;
  macIstatistikIsle(benim.s.istA);
  kaydet();
  sezonMacRaporu(benim.rakip, benim.s, odul, digerleri);
}

function sezonMacRaporu(B, s, odul, digerleri) {
  const kazandi = s.sa > s.sb;
  let html = "<h2>Maç Raporu</h2>";
  html += '<div class="bilgi-kutusu"><b>' + kariyer.takimAdi + " " + s.sa + " - " + s.sb + " " + B.ad + "</b><br>";
  html += kazandi ? "Kazandın!" : "Kaybettin.";
  html += s.uzatma ? " (Uzatma oynandı)" : "";
  html += "<br>Kazanç: <b>+" + para(odul) + "</b></div>";
  html += "<h2>Haftanın Diğer Maçları</h2>";
  digerleri.forEach(function (d) { html += "<p>" + d + "</p>"; });
  html += istTablo(kariyer.takimAdi, s.istA) + istTablo(B.ad, s.istB);
  html += '<button class="buton" onclick="tabloEkrani()">Puan Tablosu</button>';
  html += '<button class="buton ikincil" onclick="kariyerEkrani()">Kariyere Dön</button>';
  uygulama.innerHTML = html;
}

function tabloEkrani() {
  sezonHazirla();
  const sz = kariyer.sezon;
  const t = sz.tablo;
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>' + LIG_ADLARI[kariyer.ligNo - 1] + " · Sezon " + sz.no + "</h2>";
  html += "<p>İlk " + YUKSELEN + " yükselir, son " + YUKSELEN + " düşer (1. Lig'de yükselme, 3. Lig'de düşme yok). Kadro görmek için takıma bas.</p>";
  html += '<div class="tablo-kutusu"><table><tr><th>Takım</th><th>O</th><th>G</th><th>M</th><th>RF</th><th>P</th></tr>';
  siralama().forEach(function (i, sira) {
    const stil = i === 0 ? ' style="color:' + kariyer.renk + ';font-weight:bold"' : "";
    const idx = i === 0 ? -1 : sz.takimlar[i];
    html += "<tr" + stil + ' onclick="takimKadro(' + idx + ", 'tabloEkrani()')\"><td>" + (sira + 1) + ". " + ligTakim(i).ad + "</td><td>" + t[i].o + "</td><td>" + t[i].g + "</td><td>" + t[i].m + "</td><td>" + t[i].rd + "</td><td>" + t[i].puan + "</td></tr>";
  });
  html += "</table></div>";
  uygulama.innerHTML = html;
}

function sezonuKapat() {
  const sz = kariyer.sezon;
  if (!sz.bitti) return;
  const ligSirasi = siralama();
  const sira = ligSirasi.indexOf(0);
  const odul = Math.round(SEZON_ODULLERI[sira] * LIG_ODUL_CARPANI[kariyer.ligNo - 1]);
  kariyer.butce += odul;
  const mvp = sezonEnIyi(sz.no);
  const sonuc = ligSezonSonu(ligSirasi);
  (kariyer.gecmis = kariyer.gecmis || []).push({ sezon: sz.no, sira: sira + 1, mvp: mvp, lig: sonuc.eski, yeniLig: sonuc.yeni });
  siralamaGuncelle(sonuc.prim, sonuc.benPrim);
  kariyer.sezon = yeniSezon(sz.no + 1);
  const r = rakipSezonSonu();
  kaydet();
  sezonSonuEkrani(sz.no, sira + 1, odul, r, sonuc);
}
