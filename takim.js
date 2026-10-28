function kadroOzet(oyuncular) {
  const y = oyuncular.reduce(function (s, o) { return s + o.yas; }, 0) / oyuncular.length;
  const g = oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / oyuncular.length;
  return '<div class="bilgi-kutusu">Ortalama yaş: <b>' + y.toFixed(1) + "</b><br>Ortalama GEN: <b>" + g.toFixed(1) + "</b></div>";
}

// i = -1: senin takımın, diğerleri dunya[i]
function takimKadro(i, geri) {
  const t = i === -1 ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular } : dunya[i];
  let html = '<button class="geri" onclick="' + geri + '">← Geri</button><h2>' + t.ad + "</h2>";
  html += kadroOzet(t.oyuncular) + tabloHtml(t.oyuncular);
  uygulama.innerHTML = html;
}
