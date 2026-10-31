function kadroOzet(oyuncular, strateji) {
  const y = oyuncular.reduce(function (s, o) { return s + o.yas; }, 0) / oyuncular.length;
  const g = oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / oyuncular.length;
  const rol = oyuncular.reduce(function (s, o) { return s + tarzEtkisi(o); }, 0) / oyuncular.length;
  const form = formEtkisi(oyuncular);
  let h = '<div class="bilgi-kutusu">';
  if (strateji) {
    const u = stratejiUyumu(oyuncular, strateji);
    h += "Strateji: <b>" + strateji + "</b><br>Strateji uyumu: <b>" + u + "/5</b> (" + etkiYazi(STRATEJI_UYUM_ETKISI[u]) + ")<br>";
  }
  h += "Ortalama yaş: <b>" + y.toFixed(1) + "</b><br>Ortalama GEN: <b>" + g.toFixed(1) + "</b><br>Rol etkisi: <b>" + (rol > 0 ? "+" : "") + rol.toFixed(1) + "</b><br>Form etkisi (moral/yorgunluk): <b>" + (form > 0 ? "+" : "") + form.toFixed(1) + "</b></div>";
  return h;
}

// i = -1: senin takımın, diğerleri dunya[i]
function takimKadro(i, geri) {
  const ben = i === -1;
  const t = ben ? { ad: kariyer.takimAdi, oyuncular: kariyer.oyuncular, strateji: kariyer.strateji } : dunya[i];
  const an = personelSeviye("analist");
  let html = '<button class="geri" onclick="' + geri + '">← Geri</button><h2>' + t.ad + "</h2>";
  html += kadroOzet(t.oyuncular, (ben || an >= 1) ? t.strateji : null) + tabloHtml(t.oyuncular);
  if (ben || an >= 2) html += haritaTablosu(t);
  else html += "<p>Rakibin strateji ve harita bilgisi için Analist gerekir (strateji: seviye 1, harita puanları: seviye 2).</p>";
  uygulama.innerHTML = html;
}
