function ortGuc(oyuncular) {
  return oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / oyuncular.length;
}

function agirlikPuani(o) {
  return Math.pow(o.nisan + o.refleks, 3);
}

function agirlikliSec(liste) {
  let toplam = 0;
  liste.forEach(function (x) { toplam += agirlikPuani(x.o); });
  let r = Math.random() * toplam;
  for (const x of liste) {
    r -= agirlikPuani(x.o);
    if (r <= 0) return x;
  }
  return liste[liste.length - 1];
}

function karistir(d) {
  const k = d.slice();
  for (let i = k.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const t = k[i]; k[i] = k[j]; k[j] = t;
  }
  return k;
}

function macOyna(A, B) {
  const fark = ortGuc(A.oyuncular) - ortGuc(B.oyuncular);
  const p = Math.min(0.8, Math.max(0.2, 1 / (1 + Math.exp(-fark / 15))));
  const ist = function (t) {
    return t.oyuncular.map(function (o) { return { o: o, kill: 0, death: 0 }; });
  };
  const istA = ist(A), istB = ist(B);
  let sa = 0, sb = 0;

  function round() {
    const aKazandi = Math.random() < p;
    const kaz = aKazandi ? istA : istB;
    const kay = aKazandi ? istB : istA;
    for (let i = 0; i < 5; i++) agirlikliSec(kaz).kill++;
    kay.forEach(function (x) { x.death++; });
    const n = Math.floor(Math.random() * 5);
    for (let i = 0; i < n; i++) agirlikliSec(kay).kill++;
    karistir(kaz).slice(0, n).forEach(function (x) { x.death++; });
    if (aKazandi) sa++; else sb++;
    return aKazandi;
  }

  while (sa < 13 && sb < 13 && !(sa === 12 && sb === 12)) round();
  let uzatma = false;
  if (sa === 12 && sb === 12) {
    uzatma = true;
    for (;;) {
      let ba = 0, bb = 0;
      for (let i = 0; i < 6; i++) { if (round()) ba++; else bb++; }
      if (ba >= 4 || bb >= 4) break;
    }
  }
  return { sa: sa, sb: sb, istA: istA, istB: istB, uzatma: uzatma };
}

function macRakipSec() {
  let html = '<button class="geri" onclick="kariyerEkrani()">← Geri</button><h2>Rakip Seç</h2>';
  dunya.forEach(function (t, i) {
    html += '<button class="takim-butonu" onclick="macBaslat(' + i + ')"><span>' + t.ad + '</span><span>Güç: ' + Math.round(ortGuc(t.oyuncular)) + "</span></button>";
  });
  uygulama.innerHTML = html;
}

function macBaslat(i) {
  const A = { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular };
  const B = dunya[i];
  macRaporu(A, B, macOyna(A, B));
}

function istTablo(ad, ist) {
  let h = "<h2>" + ad + "</h2>";
  h += '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Öl</th><th>Ölüm</th><th>K/D</th></tr>';
  ist.forEach(function (x) {
    const kd = x.death === 0 ? x.kill : (x.kill / x.death).toFixed(2);
    h += "<tr><td>" + x.o.ad + "</td><td>" + x.kill + "</td><td>" + x.death + "</td><td>" + kd + "</td></tr>";
  });
  return h + "</table></div>";
}

function macRaporu(A, B, s) {
  const kazandi = s.sa > s.sb;
  let html = "<h2>Maç Raporu</h2>";
  html += '<div class="bilgi-kutusu"><b>' + A.ad + " " + s.sa + " - " + s.sb + " " + B.ad + "</b><br>";
  html += kazandi ? "Kazandın!" : "Kaybettin.";
  html += s.uzatma ? " (Uzatma oynandı)" : "";
  html += "</div>";
  html += istTablo(A.ad, s.istA) + istTablo(B.ad, s.istB);
  html += '<button class="buton" onclick="macRakipSec()">Başka Maç</button>';
  html += '<button class="buton ikincil" onclick="kariyerEkrani()">Kariyere Dön</button>';
  uygulama.innerHTML = html;
}
