// ---------- Ortak parçalar ----------
function etiket(m, t) { return '<span class="etiket' + (t ? " " + t : "") + '">' + m + "</span>"; }
function etiketler(liste) { return '<div class="etiketler">' + liste.join("") + "</div>"; }

// s1 ve s2 null ise ortada VS yazar. bitti ise kazanan yeşil, kaybeden kırmızı olur.
function skorTahtasi(ad1, ad2, s1, s2, bitti, alt1, alt2) {
  let orta;
  if (s1 === null) {
    orta = '<div class="sayi vs">VS</div>';
  } else {
    const k1 = bitti ? (s1 > s2 ? "kaz" : "kay") : "";
    const k2 = bitti ? (s2 > s1 ? "kaz" : "kay") : "";
    orta = '<div class="sayi"><span class="' + k1 + '">' + s1 + '</span> : <span class="' + k2 + '">' + s2 + "</span></div>";
  }
  return '<div class="skor"><div class="takim" style="color:' + kariyer.renk + '">' + ad1 + (alt1 ? "<small>" + alt1 + "</small>" : "") + "</div>" + orta + '<div class="takim">' + ad2 + (alt2 ? "<small>" + alt2 + "</small>" : "") + "</div></div>";
}

function olayListesi(not) {
  if (!not) return "";
  return '<div class="olay-liste">' + not.split("<br>").join("<br>") + "</div>";
}

function guc(o) { return Math.round(ortGuc(o)); }

// ---------- Oyuncu tablosu ----------
function istTablo(ad, ist) {
  let en = null;
  ist.forEach(function (x) { if (!en || x.kill > en.kill) en = x; });
  let h = "<h2>" + ad + '</h2><div class="tablo-kutusu"><table><tr><th>Oyuncu</th><th>Öl</th><th>Ölüm</th><th>K/D</th></tr>';
  ist.forEach(function (x) {
    const kd = x.death === 0 ? x.kill : x.kill / x.death;
    const kdYazi = x.death === 0 ? String(x.kill) : kd.toFixed(2);
    const renk = kd >= 1.2 ? "#22c55e" : (kd < 0.8 ? "#ef4444" : "#f9fafb");
    h += "<tr><td>" + (x === en && x.kill > 0 ? "⭐ " : "") + x.o.ad + '<br><small style="color:#9ca3af">' + x.o.rol + "</small></td><td>" + x.kill + "</td><td>" + x.death + '</td><td style="color:' + renk + ';font-weight:bold">' + kdYazi + "</td></tr>";
  });
  return h + "</table></div>";
}

// ---------- Harita yasaklama ----------
function banEkrani() {
  const d = banDurum;
  if (!d) { kariyerEkrani(); return; }
  const an = personelSeviye("analist");
  const hb = haritaOf({ oyuncular: kariyer.oyuncular });
  const hr = haritaOf(d.rakip);
  const kalan = banKalan();
  const bitti = kalan.length === d.hedef;
  const toplamBan = HARITALAR.length - d.hedef;
  let html = '<button class="geri" onclick="' + d.geri + '">← Geri</button><h2>Harita Yasaklama</h2>';
  html += skorTahtasi(kariyer.takimAdi, d.rakip.ad, null, null, false, "Güç " + guc(kariyer.oyuncular), "Güç " + guc(d.rakip.oyuncular) + (an >= 1 && d.rakip.strateji ? " · " + d.rakip.strateji : ""));
  const e = [etiket(d.mod === "lig" ? "Lig maçı · 1 harita" : "Turnuva · BO3, 3 harita", "sari"), etiket("Yasak " + d.banlar.length + "/" + toplamBan)];
  if (an >= 1) {
    let en = HARITALAR[0];
    HARITALAR.forEach(function (x) { if (hr[x] > hr[en]) en = x; });
    e.push(etiket("Rakibin en güçlü haritası: " + en, "kirmizi"));
  } else {
    e.push(etiket("Rakip bilgisi gizli (Analist)"));
  }
  d.banlar.forEach(function (b) { e.push(etiket((b.kim === "sen" ? "Sen" : "Rakip") + ": " + b.harita, b.kim === "sen" ? "sari" : "kirmizi")); });
  html += etiketler(e);
  if (bitti) {
    html += '<div class="ipucu">Oynanacak harita' + (kalan.length > 1 ? "lar" : "") + ": <b>" + kalan.join(", ") + "</b></div>";
    html += '<button class="buton" onclick="banOyna()">Maçı Oyna</button>';
  } else {
    html += "<p>Sıra sende: yasaklamak istediğin haritaya bas.</p>";
  }
  HARITALAR.forEach(function (ad) {
    const yasak = d.banlar.find(function (b) { return b.harita === ad; });
    if (yasak) {
      html += '<div class="harita-kart yasakli"><span><span class="ad">' + ad + "</span><small>Yasaklayan: " + (yasak.kim === "sen" ? "Sen" : "Rakip") + "</small></span></div>";
      return;
    }
    let alt, sinif = "";
    if (an >= 2) {
      const fark = hb[ad] - hr[ad];
      alt = "Sen " + (hb[ad] > 0 ? "+" : "") + hb[ad] + " · Rakip " + (hr[ad] > 0 ? "+" : "") + hr[ad] + " · Fark " + (fark > 0 ? "+" : "") + fark;
      sinif = fark > 0 ? " avantaj" : (fark < 0 ? " dezavantaj" : "");
    } else {
      alt = "Sen " + (hb[ad] > 0 ? "+" : "") + hb[ad] + " · Rakip ?";
    }
    if (bitti) {
      html += '<div class="harita-kart secili"><span><span class="ad">' + ad + "</span><small>" + alt + '</small></span><span class="eylem">Oynanacak</span></div>';
    } else {
      html += '<button class="harita-kart' + sinif + '" onclick="banYap(\'' + ad + '\')"><span><span class="ad">' + ad + "</span><small>" + alt + '</small></span><span class="eylem">Yasakla</span></button>';
    }
  });
  uygulama.innerHTML = html;
}

// ---------- Taktik ve seri ----------
function taktikButonlari(fn, acik, rakipT) {
  const c = canli;
  const rt = rakipT || c.tB;
  let h = "";
  TAKTIKLER.forEach(function (t) {
    const rol = taktikRolBonusu(t, c.A.oyuncular);
    let sinif = "", netYazi = "?";
    let alt = "Kadro uyumu " + etkiYazi(rol);
    if (acik) {
      const ust = taktikUstunluk(t, rt);
      const net = rol + ust;
      sinif = net > 0 ? " avantaj" : (net < 0 ? " dezavantaj" : "");
      netYazi = etkiYazi(net);
      alt += " · Üstünlük " + etkiYazi(ust);
    } else {
      alt += " · Üstünlük ?";
    }
    h += '<button class="harita-kart' + sinif + '" onclick="' + fn + "('" + t + "')\">" +
      '<span><span class="ad">' + t + "</span><small>" + TAKTIK_ACIKLAMA[t] + "<br>" + alt + '</small></span><span class="net">' + netYazi + "</span></button>";
  });
  return h;
}

function seriKutusu(seri) {
  let h = '<div class="etiketler">' + etiket("BO3 · Harita " + (seri.idx + 1) + "/3", "sari") + etiket("Seri " + seri.mine + " - " + seri.theirs, seri.mine > seri.theirs ? "yesil" : (seri.mine < seri.theirs ? "kirmizi" : ""));
  seri.hr.forEach(function (x) { h += etiket(x.h + " " + x.m + "-" + x.t, x.m > x.t ? "yesil" : "kirmizi"); });
  return h + "</div>";
}

function canliHazirlikEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  let html = '<button class="geri" onclick="canliIptal()">← Geri</button><h2>Maç Öncesi</h2>';
  if (c.seri) html += seriKutusu(c.seri);
  html += skorTahtasi(c.A.ad, c.B.ad, null, null, false, "Güç " + guc(c.A.oyuncular), "Güç " + guc(c.B.oyuncular));
  const e = [etiket("Harita: " + c.harita, "sari")];
  if (an >= 1) {
    e.push(etiket("Rakip strateji: " + c.B.strateji));
    e.push(etiket("Rakip taktiği: " + c.tB, "kirmizi"));
  } else {
    e.push(etiket("Rakip bilgisi gizli (Analist)"));
  }
  if (an >= 2) e.push(etiket("Harita farkı " + etkiYazi(c.hf), c.hf > 0 ? "yesil" : (c.hf < 0 ? "kirmizi" : "")));
  if (an >= 3) e.push(etiket("Hazırlık +" + analistHazirlik(), "yesil"));
  html += etiketler(e);
  html += "<p>İlk yarı taktiğini seç." + (an >= 1 ? " Net değer, kadro uyumu ile rakibin taktiğine karşı üstünlüğün toplamıdır." : " Rakibin taktiğini bilmediğin için yalnızca kadro uyumunu görürsün.") + "</p>";
  html += taktikButonlari("canliBasla", an >= 1, c.tB);
  uygulama.innerHTML = html;
}

function yariEkrani() {
  const c = canli;
  const an = personelSeviye("analist");
  const tahmin = aiYariTaktik(c);
  const rakipT = an >= 3 ? tahmin : c.tB;
  let html = "<h2>Yarı Devre</h2>";
  if (c.seri) html += seriKutusu(c.seri);
  html += skorTahtasi(c.A.ad, c.B.ad, c.sa, c.sb, false, "Taktik: " + c.tA, "Taktik: " + c.tB);
  html += etiketler([etiket("Harita: " + c.harita, "sari"), etiket("Mola: " + c.mola), etiket("Değişiklik: " + c.degisimHak)]);
  if (an >= 3) {
    html += '<div class="ipucu">Analist: rakip ikinci yarıda <b>' + tahmin + "</b> oynayacak" + (tahmin !== c.tB ? " (taktik değiştiriyor)." : " (taktik değişmiyor).") + "</div>";
  } else {
    html += "<p>Rakip ikinci yarıda taktik değiştirebilir. Aşağıdaki değerler rakibin ilk yarı taktiğine göre hesaplandı. Analist seviye 3 rakibin ikinci yarı taktiğini önceden gösterir.</p>";
  }
  if (c.degisimHak > 0 && yedekListe().length > 0) {
    html += '<button class="buton ikincil" onclick="degisimEkrani()">Oyuncu Değişikliği</button>';
  }
  html += "<h2>İkinci Yarı Taktiği</h2>" + taktikButonlari("canliYariDevam", true, rakipT);
  html += istTablo(c.A.ad, c.aktifA) + istTablo(c.B.ad, c.aktifB);
  uygulama.innerHTML = html;
}

function seriEkrani() {
  const c = canli;
  c.seriSoruldu = true;
  let html = "<h2>Kritik An</h2>";
  html += skorTahtasi(c.A.ad, c.B.ad, c.sa, c.sb, false, "Üst üste " + c.serA + " round kaybettin", "");
  html += '<div class="uyari">Seri kaybeden takım -' + SERI_CEZASI + " güç cezası alır.<br>Mola seriyi sıfırlar ve sonraki " + MOLA_TUR + " round'a +" + MOLA_BONUSU + " verir.</div>";
  html += '<button class="buton" onclick="canliMola()">Mola Al (kalan ' + c.mola + ")</button>";
  html += '<button class="buton ikincil" onclick="canliDevam()">Devam Et</button>';
  uygulama.innerHTML = html;
}

// ---------- Turnuva serisinde harita bitti ----------
function canliSeriIsle(seri, s) {
  const kaz = s.sa > s.sb;
  if (kaz) seri.mine++; else seri.theirs++;
  seri.hr.push({ h: s.harita, m: s.sa, t: s.sb });
  seri.notlar.push(s.harita + ": " + s.not);
  seri.idx++;
  if (seri.mine >= 2 || seri.theirs >= 2) {
    const sonuc = { mine: seri.mine, theirs: seri.theirs, hr: seri.hr, not: seri.notlar.join("<br>") };
    canliSeri = null;
    turnuvaTurOyna(seri.kalan, seri.banYazi, sonuc);
    return;
  }
  let html = "<h2>Harita Bitti</h2>";
  html += skorTahtasi(seri.A.ad, seri.rakip.ad, s.sa, s.sb, true, kaz ? "Haritayı kazandın" : "Haritayı kaybettin", s.harita);
  html += seriKutusu(seri);
  html += '<button class="buton" onclick="canliSeriSonraki()">Sonraki Harita: ' + seri.liste[seri.idx] + "</button>";
  uygulama.innerHTML = html;
}

// ---------- Maç raporları ----------
function sezonMacRaporu(B, s, odul, digerleri) {
  const kazandi = s.sa > s.sb;
  let html = "<h2>Maç Raporu</h2>";
  html += skorTahtasi(kariyer.takimAdi, B.ad, s.sa, s.sb, true, kazandi ? "Galibiyet" : "Mağlubiyet", "Güç " + guc(B.oyuncular));
  const e = [etiket("Harita: " + s.harita, "sari"), etiket("Kazanç +" + para(odul), "yesil")];
  if (s.uzatma) e.push(etiket("Uzatma", "sari"));
  html += etiketler(e);
  if (basinBekliyor()) html += '<button class="buton" onclick="basinEkrani()">Basın Toplantısı</button>';
  html += '<button class="buton ikincil" onclick="kariyerEkrani()">Kariyere Dön</button>';
  html += '<button class="buton ikincil" onclick="tabloEkrani()">Puan Tablosu</button>';
  html += olayListesi(s.not);
  html += istTablo(kariyer.takimAdi, s.istA) + istTablo(B.ad, s.istB);
  html += "<h2>Haftanın Diğer Maçları</h2>";
  digerleri.forEach(function (d) { html += '<div class="mac-satir">' + d + "</div>"; });
  uygulama.innerHTML = html;
}

function turnuvaRaporu(T, rapor, sonuc) {
  let html = "<h2>" + T.ad + "</h2>";
  if (sonuc) {
    html += '<div class="hero"><h1 style="color:' + kariyer.renk + '">' + sonuc.yerYazi + '</h1><div class="alt">Şampiyon: ' + sonuc.sampiyon + "</div>";
    html += '<div class="metrikler">' + metrik("+" + para(sonuc.odul), "Ödül") + metrik("+" + sonuc.puan, "Sıralama puanı") + "</div></div>";
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
    html += '<button class="buton ikincil" onclick="turnuvaEkrani()">Turnuvalar</button>';
  } else {
    html += '<div class="ipucu">Turu geçtin. Sonraki tur bir sonraki turnuva haftasında (2 hafta sonra) oynanır.</div>';
    html += '<button class="buton" onclick="kariyerEkrani()">Kariyere Dön</button>';
  }
  rapor.forEach(function (r) {
    html += "<h2>" + turAdi(T, r.tur) + "</h2>";
    r.satirlar.forEach(function (x) { html += '<div class="mac-satir' + (x.indexOf("<b>") === 0 ? " benim" : "") + '">' + x + "</div>"; });
  });
  uygulama.innerHTML = html;
}
