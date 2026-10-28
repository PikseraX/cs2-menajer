function maas(o) { return Math.round(o.genel * o.genel / 2); }

function haftalikGider() {
  return kariyer.oyuncular.reduce(function (s, o) { return s + maas(o); }, 0);
}

function maasKutusu() {
  let h = '<div class="bilgi-kutusu">Hafta: <b>' + (kariyer.hafta || 1) + "</b><br>Haftalık maaş gideri: <b>" + para(haftalikGider()) + "</b>";
  if (kariyer.butce < 0) {
    h += '<br><span style="color:#ef4444">Bütçe eksi! Transfer yapamazsın.</span>';
  }
  return h + "</div>";
}

function haftaGec() {
  const g = haftalikGider();
  if (!confirm("Hafta bitecek ve " + para(g) + " maaş ödenecek. Onaylıyor musun?")) return;
  kariyer.butce -= g;
  kariyer.hafta = (kariyer.hafta || 1) + 1;
  kaydet();
  kariyerEkrani();
}
