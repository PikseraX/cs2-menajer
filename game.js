// Sabit tohumlu rastgele sayı üreticisi (her açılışta aynı dünya çıkar)
function tohum(a) {
  return function () {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}
const rastgele = tohum(12345);

function sinirla(d) {
  return Math.max(1, Math.min(99, Math.round(d)));
}

function oyuncuUret(ad, rol, takimGucu) {
  const o = { ad: ad, rol: rol, yas: 17 + Math.floor(rastgele() * 14) };
  let toplam = 0;
  for (const z of OZELLIKLER) {
    o[z] = sinirla(takimGucu + (rastgele() * 20 - 10));
    toplam += o[z];
  }
  o.genel = Math.round(toplam / OZELLIKLER.length);
  return o;
}

function dunyaUret() {
  const adlar = [...OYUNCU_ADLARI];
  return TAKIMLAR.map(function (t) {
    return {
      ad: t.ad,
      guc: t.guc,
      oyuncular: ROLLER.map(function (rol) {
        return oyuncuUret(adlar.shift(), rol, t.guc);
      })
    };
  });
}

const dunya = dunyaUret();
const uygulama = document.getElementById("uygulama");

function takimListesiGoster() {
  let html = "<h1>CS2 Menajer</h1><h2>Takımlar</h2>";
  dunya.forEach(function (t, i) {
    const ort = Math.round(t.oyuncular.reduce(function (s, o) { return s + o.genel; }, 0) / t.oyuncular.length);
    html += '<button class="takim-butonu" onclick="kadroGoster(' + i + ')"><span>' + t.ad + '</span><span>Güç: ' + ort + '</span></button>';
  });
  uygulama.innerHTML = html;
}

function kadroGoster(i) {
  const t = dunya[i];
  let html = '<button class="geri" onclick="takimListesiGoster()">← Geri</button>';
  html += "<h2>" + t.ad + "</h2>";
  html += '<div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Rol</th><th>Yaş</th><th>NİŞ</th><th>BİL</th><th>REF</th><th>İLE</th><th>İST</th><th>BAS</th><th>GEN</th></tr>';
  t.oyuncular.forEach(function (o) {
    html += "<tr><td>" + o.ad + "</td><td>" + o.rol + "</td><td>" + o.yas + "</td><td>" + o.nisan + "</td><td>" + o.bilgi + "</td><td>" + o.refleks + "</td><td>" + o.iletisim + "</td><td>" + o.istikrar + "</td><td>" + o.baski + '</td><td class="genel">' + o.genel + "</td></tr>";
  });
  html += "</table></div>";
  uygulama.innerHTML = html;
}

takimListesiGoster();
