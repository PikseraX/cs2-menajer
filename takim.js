function kadroOzet(oyuncular, strateji) {
  const y = oyuncular.reduce(function (s, o) { return s + o.yas; }, 0) / oyuncular.length;
  const g = oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / oyuncular.length;
  const rol = oyuncular.reduce(function (s, o) { return s + tarzEtkisi(o); }, 0) / oyuncular.length;
  let h = '<div class="bilgi-kutusu">';
  if (strateji) {
    const u = stratejiUyumu(oyuncular, strateji);
    h += "Strateji: <b>" + strateji + "</b><br>Strateji uyumu: <b>" + u + "/5</b> (" + etkiYazi(STRATEJI_UYUM_ETKISI[u]) + ")<br>";
  }
  h += "Ortalama yaş: <b>" + y.toFixed(1) + "</b><br>Ortalama GEN: <b>" + g.toFixed(1) + "</b><br>Rol etkisi: <b>" + (rol > 0 ? "+" : "") + rol.toFixed(1) + "</b></div>";
  return h;
}

// i = -1: senin takımın, diğerleri dunya[i]
function takimKadro(i, geri) {
  const t = i === -1 ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular, strateji: kariyer.strateji } : dunya[i];
  let html = '<button class="geri" onclick="' + geri + '">← Geri</button><h2>' + t.ad + "</h2>";
  html += kadroOzet(t.oyuncular, t.strateji) + tabloHtml(t.oyuncular);
  uygulama.innerHTML = html;
}
