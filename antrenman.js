function oyuncuOdagi(o) {
  return o.odak || kariyer.odak || "nisan";
}

function antrenmanUygula() {
  const rapor = [];
  kariyer.oyuncular.forEach(function (o) {
    const once = o.genel;
    const odak = oyuncuOdagi(o);
    OZELLIKLER.forEach(function (z) {
      if (Math.random() < gelisimSansi(o, z === odak)) o[z] = Math.min(99, o[z] + 1);
      if (Math.random() < gerilemeSansi(o)) o[z] = Math.max(1, o[z] - 1);
    });
    genelHesapla(o);
    if (o.genel !== once) rapor.push(o.ad + ": " + once + " → " + o.genel);
  });
  return rapor;
}
