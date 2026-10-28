function istHazirla(o) {
  if (!o.ist) o.ist = { sk: 0, sm: 0, sol: 0, sod: 0, m: 0, ol: 0, od: 0 };
}

// Maç sonrası: senin takımının oyuncu istatistiklerini işler
function macIstatistikIsle(istA) {
  const no = kariyer.sezon.no;
  istA.forEach(function (x) {
    const o = x.o;
    istHazirla(o);
    if (o.ist.sk !== no) { o.ist.sk = no; o.ist.sm = 0; o.ist.sol = 0; o.ist.sod = 0; }
    o.ist.sm++; o.ist.sol += x.kill; o.ist.sod += x.death;
    o.ist.m++; o.ist.ol += x.kill; o.ist.od += x.death;
  });
}

function istDeger(o, mod) {
  istHazirla(o);
  if (mod === "sezon") {
    const gecerli = o.ist.sk === kariyer.sezon.no;
    return { m: gecerli ? o.ist.sm : 0, ol: gecerli ? o.ist.sol : 0, od: gecerli ? o.ist.sod : 0 };
  }
  return { m: o.ist.m, ol: o.ist.ol, od: o.ist.od };
}

function sezonEnIyi(no) {
  let en = null, enOrt = -1;
  kariyer.oyuncular.forEach(function (o) {
    istHazirla(o);
    if (o.ist.sk === no && o.ist.sm > 0) {
      const ort = o.ist.sol / o.ist.sm;
      if (ort > enOrt) { enOrt = ort; en = { ad: o.ad, ort: ort.toFixed(1) }; }
    }
  });
  return en;
}

function istatistikEkrani(mod) {
  mod = mod || "sezon";
  let html = '<button class="geri" onclick="kadroEkrani()">← Geri</button><h2>İstatistikler</h2>';
  html += '<button class="buton' + (mod === "sezon" ? "" : " ikincil") + '" onclick="istatistikEkrani(\'sezon\')">Bu Sezon</button>';
  html += '<button class="buton' + (mod === "kariyer" ? "" : " ikincil") + '" onclick="istatistikEkrani(\'kariyer\')">Kariyer</button>';
  html += '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Maç</th><th>Öl</th><th>Ölüm</th><th>K/D</th><th>Maç Başı</th></tr>';
  kariyer.oyuncular.forEach(function (o) {
    const d = istDeger(o, mod);
    const kd = d.od === 0 ? (d.ol === 0 ? "-" : d.ol) : (d.ol / d.od).toFixed(2);
    const mb = d.m === 0 ? "-" : (d.ol / d.m).toFixed(1);
    html += "<tr><td>" + o.ad + "</td><td>" + d.m + "</td><td>" + d.ol + "</td><td>" + d.od + "</td><td>" + kd + "</td><td>" + mb + "</td></tr>";
  });
  html += "</table></div>";
  html += "<h2>Sezon Geçmişi</h2>";
  const g = kariyer.gecmis || [];
  if (g.length === 0) html += "<p>Henüz tamamlanan sezon yok.</p>";
  g.forEach(function (x) {
    html += '<div class="bilgi-kutusu">Sezon ' + x.sezon + ": <b>" + x.sira + ".</b> sıra" + (x.mvp ? "<br>En iyi oyuncu: <b>" + x.mvp.ad + "</b> (maç başı " + x.mvp.ort + " öldürme)" : "") + "</div>";
  });
  html += "<p>Not: Satılan oyuncuların istatistikleri listede görünmez.</p>";
  uygulama.innerHTML = html;
}
