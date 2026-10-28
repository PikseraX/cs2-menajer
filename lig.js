const LIG_SAYISI = 3;
const LIG_ADLARI = ["1. Lig", "2. Lig", "3. Lig"];
const LIG_ODUL_CARPANI = [4, 2, 1];
const LIG_BONUS = [60, 30, 0];
const YUKSELEN = 2;

// -1 = senin takımın, diğerleri dunya[] sırası
function ligTakimlari() {
  return [-1].concat(kariyer.ligler[kariyer.ligNo - 1].filter(function (x) { return x !== -1; }));
}

function ligHazirla() {
  if (kariyer.ligler) return;
  const sirali = dunya.map(function (t, i) { return i; }).sort(function (a, b) {
    return ortGuc(dunya[b].oyuncular) - ortGuc(dunya[a].oyuncular);
  });
  const eskiNo = kariyer.sezon ? kariyer.sezon.no : 1;
  kariyer.ligler = [sirali.slice(0, 8), sirali.slice(24, 32), [-1].concat(sirali.slice(50, 57))];
  kariyer.ligNo = 3;
  kariyer.sezon = yeniSezon(eskiNo);
  kaydet();
}

// Senin oynamadığın bir ligi sezon sonunda simüle eder, takımları iyiden kötüye sıralar
function ligSimule(idler) {
  const tablo = idler.map(function () { return { puan: 0, rd: 0 }; });
  fiksturUret(idler.length).forEach(function (hafta) {
    hafta.forEach(function (m) {
      const s = macOyna(dunya[idler[m[0]]], dunya[idler[m[1]]]);
      tablo[m[0]].rd += s.sa - s.sb;
      tablo[m[1]].rd += s.sb - s.sa;
      if (s.sa > s.sb) tablo[m[0]].puan += 3; else tablo[m[1]].puan += 3;
    });
  });
  return idler.map(function (id, i) { return i; }).sort(function (a, b) {
    return (tablo[b].puan - tablo[a].puan) || (tablo[b].rd - tablo[a].rd) || (a - b);
  }).map(function (i) { return idler[i]; });
}

// Sezon sonu: sıralamalar, yükselme/düşme, yeni ligler
function ligSezonSonu(ligSirasi) {
  const sz = kariyer.sezon;
  const eski = kariyer.ligNo;
  const sirali = [];
  for (let t = 1; t <= LIG_SAYISI; t++) {
    if (t === eski) {
      sirali.push(ligSirasi.map(function (p) { return sz.takimlar[p]; }));
    } else {
      sirali.push(ligSimule(kariyer.ligler[t - 1]));
    }
  }
  const prim = {};
  let benPrim = 0;
  sirali.forEach(function (liste, t) {
    liste.forEach(function (id, p) {
      const v = (LIG_PRIMI[p] || 0) + LIG_BONUS[t];
      if (id === -1) benPrim = v; else prim[id] = v;
    });
  });
  const yeni = [];
  for (let t = 0; t < LIG_SAYISI; t++) {
    let l = sirali[t].slice(t > 0 ? YUKSELEN : 0, t < LIG_SAYISI - 1 ? 8 - YUKSELEN : 8);
    if (t < LIG_SAYISI - 1) l = l.concat(sirali[t + 1].slice(0, YUKSELEN));
    if (t > 0) l = l.concat(sirali[t - 1].slice(8 - YUKSELEN));
    yeni.push(l);
  }
  yeni.forEach(function (l, t) { if (l.indexOf(-1) >= 0) kariyer.ligNo = t + 1; });
  kariyer.ligler = yeni;
  let mesaj = "Ligde kaldın: " + LIG_ADLARI[kariyer.ligNo - 1];
  if (kariyer.ligNo < eski) mesaj = "Yükseldin! Yeni ligin: " + LIG_ADLARI[kariyer.ligNo - 1];
  if (kariyer.ligNo > eski) mesaj = "Düştün. Yeni ligin: " + LIG_ADLARI[kariyer.ligNo - 1];
  return { mesaj: mesaj, eski: eski, yeni: kariyer.ligNo, prim: prim, benPrim: benPrim };
}

function ligEkrani() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Ligler</h2>';
  html += "<p>Her sezon sonunda her ligin ilk " + YUKSELEN + " takımı yükselir, son " + YUKSELEN + " takımı düşer. Kadro görmek için takıma bas.</p>";
  kariyer.ligler.forEach(function (l, t) {
    html += "<h2>" + LIG_ADLARI[t] + (kariyer.ligNo === t + 1 ? " (senin ligin)" : "") + "</h2>";
    l.forEach(function (id) {
      const takim = id === -1 ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular } : dunya[id];
      const renk = id === -1 ? ' style="border-color:' + kariyer.renk + '"' : "";
      html += '<button class="takim-butonu"' + renk + ' onclick="takimKadro(' + id + ", 'ligEkrani()')\"><span>" + takim.ad + "</span><span>Güç: " + Math.round(ortGuc(takim.oyuncular)) + "</span></button>";
    });
  });
  uygulama.innerHTML = html;
}
