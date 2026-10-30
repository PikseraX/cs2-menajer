function moralOf(o) { return o.mor === undefined ? 70 : o.mor; }
function yorOf(o) { return o.yor === undefined ? 0 : o.yor; }
function sinir100(x) { return Math.max(0, Math.min(100, Math.round(x))); }

function oyuncuFormEtkisi(o) {
  return (moralOf(o) - 70) / 10 - Math.max(0, yorOf(o) - 40) / 6;
}

function formEtkisi(oyuncular) {
  if (!oyuncular.length) return 0;
  return oyuncular.reduce(function (s, o) { return s + oyuncuFormEtkisi(o); }, 0) / oyuncular.length;
}

// Maç bitince çağrılır (lig ve turnuva)
function moralMacSonucu(kazandi) {
  kariyer.haftaMac = true;
  const d = kazandi ? 5 : -5;
  kariyer.oyuncular.forEach(function (o) { o.mor = sinir100(moralOf(o) + d); });
}

// Hafta sonunda çağrılır
function formHaftalik(rapor) {
  const oynadi = !!kariyer.haftaMac;
  kariyer.haftaMac = false;
  kariyer.oyuncular.forEach(function (o) {
    o.yor = sinir100(yorOf(o) + (oynadi ? 6 : -8));
    let m = moralOf(o);
    m += m < 70 ? 1 : (m > 70 ? -1 : 0);
    if (sozlesmeBitti(o)) m -= 2;
    o.mor = sinir100(m);
    if (o.yor >= 70) rapor.push("Yorgun: " + o.ad + " (yorgunluk " + o.yor + ")");
    if (o.mor < 40) rapor.push("Moralsiz: " + o.ad + " (moral " + o.mor + ")");
  });
  yedekListe().forEach(function (o) {
    o.yor = sinir100(yorOf(o) - 10);
    let m = moralOf(o);
    m += m < 55 ? 1 : (m > 55 ? -1 : 0);
    if (sozlesmeBitti(o)) m -= 2;
    o.mor = sinir100(m);
  });
}

function formTablosu(liste, baslik) {
  let h = "<h2>" + baslik + '</h2><div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Moral</th><th>Yorgunluk</th><th>Etki</th></tr>';
  liste.forEach(function (o) {
    const m = moralOf(o), y = yorOf(o), e = oyuncuFormEtkisi(o);
    const mr = m >= 70 ? "#22c55e" : (m < 45 ? "#ef4444" : "#f59e0b");
    const yr = y <= 40 ? "#22c55e" : (y >= 70 ? "#ef4444" : "#f59e0b");
    h += "<tr><td>" + o.ad + '</td><td style="color:' + mr + '">' + m + '</td><td style="color:' + yr + '">' + y + "</td><td>" + (e > 0 ? "+" : "") + e.toFixed(1) + "</td></tr>";
  });
  return h + "</table></div>";
}
