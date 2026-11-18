// Übungsmodus: Zufalls-Rechenaufgaben mit immer neuen Zahlen.
// Jede Vorlage würfelt Werte, rechnet Lösung und Rechenweg selbst aus und liefert eine
// "Karte" im gleichen Format wie die normalen Rechenaufgaben (card.calc), damit Eingabe,
// Tastatur und Prüfung der App unverändert genutzt werden.
(function(){
  'use strict';

  // ---------- Hilfsfunktionen ----------
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const E12 = [1, 1.2, 1.5, 1.8, 2.2, 2.7, 3.3, 3.9, 4.7, 5.6, 6.8, 8.2];
  const clean = x => +Number(x).toPrecision(12);
  const res = decs => clean(+(pick(E12) * pick(decs)).toPrecision(3)); // Widerstand aus der E12-Reihe
  // Zahl auf n gültige Stellen, deutsches Komma
  function n(x, sig){
    sig = sig || 3;
    const v = Number(x);
    if(v === 0) return '0';
    let s = String(parseFloat(v.toPrecision(sig)));
    if(/e/i.test(s)) s = v.toFixed(Math.max(0, sig - 1 - Math.floor(Math.log10(Math.abs(v)))));
    return s.replace('.', ',');
  }
  const u = (x, unit, sig) => n(x, sig) + ' ' + unit;
  const ZEIT = (t) => n(t) + ' h';

  // Teilaufgabe → Lösungstext im Format der App ("I = 0,435 A")
  function answerOf(p){
    const num = p.dec != null ? Number(p.val).toFixed(p.dec).replace('.', ',') : n(p.val, p.sig);
    return p.sym + ' = ' + num + (p.unit ? ' ' + p.unit : '');
  }
  // Rechenweg einer Teilaufgabe als Zeilen (Brüche als [[Zähler||Nenner]])
  function wegOf(p){
    if(p.w) return p.w;
    const num = p.dec != null ? Number(p.val).toFixed(p.dec).replace('.', ',') : n(p.val, p.sig);
    return [
      p.sym + ' = ' + p.f,
      p.sym + ' = ' + p.e + ' = ' + num + (p.unit ? ' ' + p.unit : '')
    ];
  }

  // ---------- Vorlagen ----------
  // Jede Vorlage: { thema, gen() → { q, parts:[{ t, sym, val, unit, f, e, [dec], [sig], [w], [t_] }] } }
  const T = [];
  const add = (thema, name, gen) => T.push({ thema, name, gen });

  // ===== Grundlagen =====
  add('grund', 'Ohm: Strom', () => {
    const U = pick([12, 24, 48, 110, 230, 400]), R = res([10, 100, 1000]);
    const I = U / R, P = U * I;
    return { q: `Ein Heizwiderstand mit ${u(R, 'Ω')} liegt an einer Spannung von ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Strom I.', sym: 'I', val: I, unit: 'A', f: '[[U||R]]', e: `[[${u(U, 'V')}||${u(R, 'Ω')}]]` },
      { t: 'Berechne die aufgenommene Leistung P.', sym: 'P', val: P, unit: 'W', f: 'U · I', e: `${u(U, 'V')} · ${u(I, 'A')}` }
    ] };
  });
  add('grund', 'Ohm: Spannung', () => {
    const R = res([10, 100, 1000]), I = pick([1, 2, 5, 10, 20]);
    const U = R * I / 1000, P = U * I / 1000;
    return { q: `Durch einen Widerstand von ${u(R, 'Ω')} fließt ein Strom von ${u(I, 'mA')}.`, parts: [
      { t: 'Berechne die Spannung U am Widerstand.', sym: 'U', val: U, unit: 'V', f: 'R · I', e: `${u(R, 'Ω')} · ${u(I, 'mA')}` },
      { t: 'Berechne die Leistung P, die der Widerstand umsetzt.', sym: 'P', val: P, unit: 'W', f: 'U · I', e: `${u(U, 'V')} · ${u(I, 'mA')}` }
    ] };
  });
  add('grund', 'Ohm: Widerstand', () => {
    const U = pick([12, 24, 230, 400]), I = pick([0.1, 0.25, 0.5, 1, 2, 4, 6.5, 10, 16]);
    const R = U / I, P = U * I;
    return { q: `Ein Verbraucher nimmt an ${u(U, 'V')} einen Strom von ${u(I, 'A')} auf (rein ohmsch).`, parts: [
      { t: 'Berechne den Widerstand R.', sym: 'R', val: R, unit: 'Ω', f: '[[U||I]]', e: `[[${u(U, 'V')}||${u(I, 'A')}]]` },
      { t: 'Berechne die Leistung P.', sym: 'P', val: P, unit: 'W', f: 'U · I', e: `${u(U, 'V')} · ${u(I, 'A')}` }
    ] };
  });
  add('grund', 'Reihenschaltung', () => {
    const R1 = res([10, 100]), R2 = res([10, 100]), R3 = res([10, 100]), U = pick([12, 24, 48, 230]);
    const Rg = R1 + R2 + R3, I = U / Rg, U2 = I * R2;
    return { q: `Drei Widerstände R_1 = ${u(R1, 'Ω')}, R_2 = ${u(R2, 'Ω')} und R_3 = ${u(R3, 'Ω')} liegen in Reihe an ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Gesamtwiderstand R_ges.', sym: 'R_ges', val: Rg, unit: 'Ω', f: 'R_1 + R_2 + R_3', e: `${u(R1, 'Ω')} + ${u(R2, 'Ω')} + ${u(R3, 'Ω')}` },
      { t: 'Berechne den Strom I.', sym: 'I', val: I, unit: 'A', f: '[[U||R_ges]]', e: `[[${u(U, 'V')}||${u(Rg, 'Ω')}]]` },
      { t: 'Berechne die Spannung U_2 an R_2.', sym: 'U_2', val: U2, unit: 'V', f: 'I · R_2', e: `${u(I, 'A')} · ${u(R2, 'Ω')}` }
    ] };
  });
  add('grund', 'Parallelschaltung', () => {
    const k = pick([2, 3]), U = pick([12, 24, 230]);
    const R1 = res([10, 100]), R2 = res([10, 100]), R3 = res([10, 100]);
    let Rg, p1;
    if(k === 2){
      Rg = R1 * R2 / (R1 + R2);
      p1 = { t: 'Berechne den Ersatzwiderstand R_ges.', sym: 'R_ges', val: Rg, unit: 'Ω', f: '[[R_1 · R_2||R_1 + R_2]]', e: `[[${u(R1, 'Ω')} · ${u(R2, 'Ω')}||${u(R1, 'Ω')} + ${u(R2, 'Ω')}]]` };
    }else{
      Rg = 1 / (1 / R1 + 1 / R2 + 1 / R3);
      p1 = { t: 'Berechne den Ersatzwiderstand R_ges.', sym: 'R_ges', val: Rg, unit: 'Ω',
        w: ['[[1||R_ges]] = [[1||R_1]] + [[1||R_2]] + [[1||R_3]]',
            `[[1||R_ges]] = [[1||${u(R1, 'Ω')}]] + [[1||${u(R2, 'Ω')}]] + [[1||${u(R3, 'Ω')}]] = ${n(1 / Rg)} S`,
            `R_ges = [[1||${n(1 / Rg)} S]] = ${n(Rg)} Ω`],
        e: `1 / ([[1||${u(R1, 'Ω')}]] + [[1||${u(R2, 'Ω')}]] + [[1||${u(R3, 'Ω')}]])` };
    }
    const lst = k === 2 ? `R_1 = ${u(R1, 'Ω')} und R_2 = ${u(R2, 'Ω')}` : `R_1 = ${u(R1, 'Ω')}, R_2 = ${u(R2, 'Ω')} und R_3 = ${u(R3, 'Ω')}`;
    return { q: `${k === 2 ? 'Zwei' : 'Drei'} Widerstände (${lst}) liegen parallel an ${u(U, 'V')}.`, parts: [
      p1,
      { t: 'Berechne den Gesamtstrom I_ges.', sym: 'I_ges', val: U / Rg, unit: 'A', f: '[[U||R_ges]]', e: `[[${u(U, 'V')}||${u(Rg, 'Ω')}]]` },
      { t: 'Berechne den Strom I_1 durch R_1.', sym: 'I_1', val: U / R1, unit: 'A', f: '[[U||R_1]]', e: `[[${u(U, 'V')}||${u(R1, 'Ω')}]]` }
    ] };
  });
  add('grund', 'Spannungsteiler', () => {
    const U = pick([5, 12, 24, 230]), R1 = res([100, 1000]), R2 = res([100, 1000]);
    const U2 = U * R2 / (R1 + R2), I = U / (R1 + R2);
    return { q: `Ein Spannungsteiler aus R_1 = ${u(R1, 'Ω')} und R_2 = ${u(R2, 'Ω')} liegt an ${u(U, 'V')} (unbelastet).`, parts: [
      { t: 'Berechne die Spannung U_2 an R_2.', sym: 'U_2', val: U2, unit: 'V', f: '[[U · R_2||R_1 + R_2]]', e: `[[${u(U, 'V')} · ${u(R2, 'Ω')}||${u(R1, 'Ω')} + ${u(R2, 'Ω')}]]` },
      { t: 'Berechne den Strom I durch beide Widerstände.', sym: 'I', val: I, unit: 'A', f: '[[U||R_1 + R_2]]', e: `[[${u(U, 'V')}||${u(R1, 'Ω')} + ${u(R2, 'Ω')}]]` }
    ] };
  });
  add('grund', 'Innenwiderstand', () => {
    const U0 = pick([12, 12.6, 24]), I = pick([2, 5, 10, 20]), Ri = pick([0.05, 0.1, 0.2, 0.25, 0.5]);
    const UK = clean(U0 - I * Ri);
    return { q: `Eine Spannungsquelle hat im Leerlauf ${u(U0, 'V')}. Unter Last (I = ${u(I, 'A')}) bricht die Klemmenspannung auf ${u(UK, 'V', 4)} ein.`, parts: [
      { t: 'Berechne den Innenwiderstand R_i der Quelle.', sym: 'R_i', val: Ri, unit: 'Ω', f: '[[U_0 − U_K||I]]', e: `[[${u(U0, 'V')} − ${u(UK, 'V', 4)}||${u(I, 'A')}]]` },
      { t: 'Berechne den Kurzschlussstrom I_K.', sym: 'I_K', val: U0 / Ri, unit: 'A', f: '[[U_0||R_i]]', e: `[[${u(U0, 'V')}||${u(Ri, 'Ω')}]]` }
    ] };
  });
  add('grund', 'LED-Vorwiderstand', () => {
    const U = pick([5, 9, 12, 24]), UF = pick([1.8, 2, 2.1, 3.2]), IF = pick([10, 15, 20]);
    const RV = (U - UF) / (IF / 1000), PR = (U - UF) * IF / 1000;
    return { q: `Eine LED (U_F = ${u(UF, 'V')}, I_F = ${u(IF, 'mA')}) soll an ${u(U, 'V')} betrieben werden.`, parts: [
      { t: 'Berechne den Vorwiderstand R_V.', sym: 'R_V', val: RV, unit: 'Ω', f: '[[U − U_F||I_F]]', e: `[[${u(U, 'V')} − ${u(UF, 'V')}||${u(IF, 'mA')}]]` },
      { t: 'Berechne die Verlustleistung P_R im Vorwiderstand.', sym: 'P_R', val: PR, unit: 'W', f: '(U − U_F) · I_F', e: `(${u(U, 'V')} − ${u(UF, 'V')}) · ${u(IF, 'mA')}` }
    ] };
  });
  add('grund', 'Drahtquerschnitt', () => {
    const d = pick([1, 1.2, 1.5, 1.8, 2, 2.5, 3]), l = pick([10, 20, 30, 50, 100]);
    const A = Math.PI * d * d / 4, R = l / (56 * A);
    return { q: `Ein Kupferdraht (γ = 56 m/Ωmm²) hat einen Durchmesser von ${u(d, 'mm')} und ist ${u(l, 'm')} lang.`, parts: [
      { t: 'Berechne den Querschnitt A.', sym: 'A', val: A, unit: 'mm²', f: '[[π · d²||4]]', e: `[[π · (${u(d, 'mm')})²||4]]` },
      { t: 'Berechne den Widerstand R des Drahtes (einfache Länge).', sym: 'R', val: R, unit: 'Ω', f: '[[l||γ · A]]', e: `[[${u(l, 'm')}||56 m/Ωmm² · ${u(A, 'mm²')}]]` }
    ] };
  });

  // ===== Leistung, Arbeit, Kosten =====
  add('leistung', 'Leistung Gerät', () => {
    const dev = pick(['Bügeleisen', 'Wasserkocher', 'Toaster', 'Heizlüfter', 'Fön']);
    const I = pick([2.2, 4.3, 6.5, 8.7, 10, 13]), U = 230;
    return { q: `Ein ${dev} (ohmscher Verbraucher) nimmt an ${u(U, 'V')} einen Strom von ${u(I, 'A')} auf.`, parts: [
      { t: 'Berechne die Leistung P.', sym: 'P', val: U * I, unit: 'W', f: 'U · I', e: `${u(U, 'V')} · ${u(I, 'A')}` },
      { t: 'Berechne den Widerstand R des Heizelements.', sym: 'R', val: U / I, unit: 'Ω', f: '[[U||I]]', e: `[[${u(U, 'V')}||${u(I, 'A')}]]` }
    ] };
  });
  add('leistung', 'Heizlüfter', () => {
    const P = pick([1000, 1500, 2000, 2500, 3000]), U = 230;
    return { q: `Ein Heizlüfter hat laut Typenschild ${u(P, 'W')} bei ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Strom I.', sym: 'I', val: P / U, unit: 'A', f: '[[P||U]]', e: `[[${u(P, 'W')}||${u(U, 'V')}]]` },
      { t: 'Berechne den Widerstand R der Heizwendel.', sym: 'R', val: U * U / P, unit: 'Ω', f: '[[U²||P]]', e: `[[(${u(U, 'V')})²||${u(P, 'W')}]]` }
    ] };
  });
  add('leistung', 'Arbeit und Kosten', () => {
    const P = pick([0.75, 1.1, 1.5, 2.2, 3, 7.5]), t = pick([2, 2.5, 3, 4, 6, 8, 10]), pr = pick([0.28, 0.30, 0.32, 0.35, 0.38, 0.40]);
    const W = P * t, K = W * pr;
    return { q: `Ein Gerät mit ${u(P, 'kW')} läuft ${ZEIT(t)}. Die Kilowattstunde kostet ${n(pr)} €.`, parts: [
      { t: 'Berechne die elektrische Arbeit W.', sym: 'W', val: W, unit: 'kWh', sig: 4, f: 'P · t', e: `${u(P, 'kW')} · ${ZEIT(t)}` },
      { t: 'Berechne die Energiekosten K.', sym: 'K', val: K, unit: '€', dec: 2, f: 'W · Preis', e: `${n(W, 4)} kWh · ${n(pr)} €/kWh` }
    ] };
  });
  add('leistung', 'Wirkungsgrad', () => {
    const Pz = pick([750, 1100, 1500, 2200, 3000, 4000, 5500, 7500]), eta0 = pick([0.72, 0.78, 0.82, 0.85, 0.88, 0.9]);
    const Pa = Math.round(Pz * eta0 / 10) * 10, eta = Pa / Pz;
    return { q: `Ein Motor nimmt P_zu = ${u(Pz, 'W')} auf und gibt P_ab = ${u(Pa, 'W')} an der Welle ab.`, parts: [
      { t: 'Berechne den Wirkungsgrad η (als Dezimalzahl).', sym: 'η', val: eta, unit: '', f: '[[P_ab||P_zu]]', e: `[[${u(Pa, 'W')}||${u(Pz, 'W')}]]` },
      { t: 'Berechne die Verlustleistung P_v.', sym: 'P_v', val: Pz - Pa, unit: 'W', f: 'P_zu − P_ab', e: `${u(Pz, 'W')} − ${u(Pa, 'W')}` }
    ] };
  });
  add('leistung', 'Drehstrom-Heizung', () => {
    const P = pick([6, 9, 12, 15, 18]), U = 400, t = pick([2, 3, 4, 5]);
    const I = P * 1000 / (Math.sqrt(3) * U), W = P * t;
    return { q: `Ein Drehstrom-Heizgerät (ohmsch) hat ${u(P, 'kW')} und wird an ${u(U, 'V')} betrieben. Es läuft ${ZEIT(t)}.`, parts: [
      { t: 'Berechne den Leiterstrom I.', sym: 'I', val: I, unit: 'A', f: '[[P||√3 · U]]', e: `[[${u(P, 'kW')}||√3 · ${u(U, 'V')}]]` },
      { t: 'Berechne die elektrische Arbeit W.', sym: 'W', val: W, unit: 'kWh', f: 'P · t', e: `${u(P, 'kW')} · ${ZEIT(t)}` }
    ] };
  });

  // ===== Wechselstrom =====
  add('wechsel', 'Strom Wechselstrom', () => {
    const P = pick([500, 750, 1100, 1500, 2200]), c = pick([0.7, 0.75, 0.8, 0.85, 0.9]), U = 230;
    const I = P / (U * c);
    return { q: `Ein Wechselstromverbraucher nimmt ${u(P, 'W')} bei ${u(U, 'V')} und cos φ = ${n(c)} auf.`, parts: [
      { t: 'Berechne den Strom I.', sym: 'I', val: I, unit: 'A', f: '[[P||U · cos φ]]', e: `[[${u(P, 'W')}||${u(U, 'V')} · ${n(c)}]]` },
      { t: 'Berechne die Scheinleistung S.', sym: 'S', val: U * I, unit: 'VA', f: 'U · I', e: `${u(U, 'V')} · ${u(I, 'A')}` }
    ] };
  });
  add('wechsel', 'Blindwiderstände', () => {
    const L = pick([0.05, 0.1, 0.2, 0.5, 1, 2]), C = pick([2.2, 4.7, 10, 22, 47, 100]);
    return { q: `Am 50-Hz-Netz hängen eine Spule mit L = ${u(L, 'H')} und ein Kondensator mit C = ${u(C, 'µF')}.`, parts: [
      { t: 'Berechne den induktiven Blindwiderstand X_L der Spule.', sym: 'X_L', val: 2 * Math.PI * 50 * L, unit: 'Ω', f: '2 · π · f · L', e: `2 · π · 50 Hz · ${u(L, 'H')}` },
      { t: 'Berechne den kapazitiven Blindwiderstand X_C des Kondensators.', sym: 'X_C', val: 1 / (2 * Math.PI * 50 * C * 1e-6), unit: 'Ω', f: '[[1||2 · π · f · C]]', e: `[[1||2 · π · 50 Hz · ${u(C, 'µF')}]]` }
    ] };
  });
  add('wechsel', 'Scheinwiderstand', () => {
    const R = pick([30, 40, 60, 80, 100, 120]), X = pick([40, 50, 70, 90, 100, 160]), U = pick([24, 230]);
    const Z = Math.sqrt(R * R + X * X);
    return { q: `Eine Reihenschaltung aus R = ${u(R, 'Ω')} und einem Blindwiderstand X = ${u(X, 'Ω')} liegt an ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Scheinwiderstand Z.', sym: 'Z', val: Z, unit: 'Ω', f: '√(R² + X²)', e: `√((${u(R, 'Ω')})² + (${u(X, 'Ω')})²)` },
      { t: 'Berechne den Strom I.', sym: 'I', val: U / Z, unit: 'A', f: '[[U||Z]]', e: `[[${u(U, 'V')}||${u(Z, 'Ω')}]]` },
      { t: 'Berechne den Leistungsfaktor cos φ.', sym: 'cos φ', val: R / Z, unit: '', f: '[[R||Z]]', e: `[[${u(R, 'Ω')}||${u(Z, 'Ω')}]]` }
    ] };
  });
  add('wechsel', 'Scheitelwert und Frequenz', () => {
    const U = pick([12, 24, 48, 230, 400]), T = pick([2, 4, 5, 10, 20, 25]);
    return { q: `Eine Wechselspannung hat den Effektivwert U = ${u(U, 'V')}. Eine zweite Schwingung hat die Periodendauer T = ${u(T, 'ms')}.`, parts: [
      { t: 'Berechne den Scheitelwert û der ersten Spannung.', sym: 'û', val: U * Math.SQRT2, unit: 'V', f: 'U · √2', e: `${u(U, 'V')} · √2` },
      { t: 'Berechne die Frequenz f der zweiten Schwingung.', sym: 'f', val: 1000 / T, unit: 'Hz', f: '[[1||T]]', e: `[[1||${u(T, 'ms')}]]` }
    ] };
  });
  add('wechsel', 'Transformator', () => {
    const U1 = pick([230, 400]), N1 = pick([460, 800, 1000, 1150, 2000]), N2 = pick([50, 100, 115, 200, 250, 300]), RL = pick([2, 4, 5, 10, 20]);
    const U2 = U1 * N2 / N1, I2 = U2 / RL, I1 = I2 * N2 / N1;
    return { q: `Ein idealer Transformator hat N_1 = ${n(N1)} und N_2 = ${n(N2)} Windungen und liegt primär an U_1 = ${u(U1, 'V')}. Sekundär hängt ein Widerstand R_L = ${u(RL, 'Ω')}.`, parts: [
      { t: 'Berechne die Sekundärspannung U_2.', sym: 'U_2', val: U2, unit: 'V', f: '[[U_1 · N_2||N_1]]', e: `[[${u(U1, 'V')} · ${n(N2)}||${n(N1)}]]` },
      { t: 'Berechne den Sekundärstrom I_2.', sym: 'I_2', val: I2, unit: 'A', f: '[[U_2||R_L]]', e: `[[${u(U2, 'V')}||${u(RL, 'Ω')}]]` },
      { t: 'Berechne den Primärstrom I_1.', sym: 'I_1', val: I1, unit: 'A', f: '[[I_2 · N_2||N_1]]', e: `[[${u(I2, 'A')} · ${n(N2)}||${n(N1)}]]` }
    ] };
  });

  // ===== Drehstrom und Motor =====
  add('dreh', 'Drehstrom-Leistungen', () => {
    const U = 400, I = pick([4, 6.5, 8, 11, 16, 20, 32]), c = pick([0.7, 0.75, 0.8, 0.85, 0.9]);
    const S = Math.sqrt(3) * U * I, P = S * c, Q = Math.sqrt(S * S - P * P);
    return { q: `Ein Drehstromverbraucher nimmt an ${u(U, 'V')} einen Strom von ${u(I, 'A')} bei cos φ = ${n(c)} auf.`, parts: [
      { t: 'Berechne die Scheinleistung S.', sym: 'S', val: S, unit: 'VA', f: '√3 · U · I', e: `√3 · ${u(U, 'V')} · ${u(I, 'A')}` },
      { t: 'Berechne die Wirkleistung P.', sym: 'P', val: P, unit: 'W', f: 'S · cos φ', e: `${u(S, 'VA')} · ${n(c)}` },
      { t: 'Berechne die Blindleistung Q.', sym: 'Q', val: Q, unit: 'var', f: '√(S² − P²)', e: `√((${u(S, 'VA')})² − (${u(P, 'W')})²)` }
    ] };
  });
  add('dreh', 'Motorstrom', () => {
    const Pm = pick([0.37, 0.55, 0.75, 1.1, 1.5, 2.2, 3, 4, 5.5, 7.5, 11]), eta = pick([0.72, 0.78, 0.82, 0.85, 0.88]), c = pick([0.75, 0.8, 0.82, 0.85]), U = 400;
    const Pz = Pm / eta, I = Pz * 1000 / (Math.sqrt(3) * U * c);
    return { q: `Auf dem Leistungsschild eines Drehstrommotors steht: P_mec = ${u(Pm, 'kW')}, η = ${n(eta)}, cos φ = ${n(c)}, ${u(U, 'V')}.`, parts: [
      { t: 'Berechne die aufgenommene Leistung P_zu.', sym: 'P_zu', val: Pz, unit: 'kW', f: '[[P_mec||η]]', e: `[[${u(Pm, 'kW')}||${n(eta)}]]` },
      { t: 'Berechne den Motorstrom I aus dem Netz.', sym: 'I', val: I, unit: 'A', f: '[[P_zu||√3 · U · cos φ]]', e: `[[${u(Pz, 'kW')}||√3 · ${u(U, 'V')} · ${n(c)}]]` }
    ] };
  });
  add('dreh', 'Stern und Dreieck', () => {
    const U = 400, R = pick([40, 50, 60, 80, 100, 200]), stern = Math.random() < 0.5;
    if(stern){
      const Us = U / Math.sqrt(3), I = Us / R, P = Math.sqrt(3) * U * I;
      return { q: `Drei gleiche Heizwiderstände mit je ${u(R, 'Ω')} sind in Stern an ${u(U, 'V')} (Außenleiterspannung) geschaltet.`, parts: [
        { t: 'Berechne die Strangspannung U_Str.', sym: 'U_Str', val: Us, unit: 'V', f: '[[U||√3]]', e: `[[${u(U, 'V')}||√3]]` },
        { t: 'Berechne den Leiterstrom I (= Strangstrom).', sym: 'I', val: I, unit: 'A', f: '[[U_Str||R]]', e: `[[${u(Us, 'V')}||${u(R, 'Ω')}]]` },
        { t: 'Berechne die gesamte Wirkleistung P.', sym: 'P', val: P, unit: 'W', f: '√3 · U · I', e: `√3 · ${u(U, 'V')} · ${u(I, 'A')}` }
      ] };
    }
    const Is = U / R, I = Math.sqrt(3) * Is, P = Math.sqrt(3) * U * I;
    return { q: `Drei gleiche Heizwiderstände mit je ${u(R, 'Ω')} sind in Dreieck an ${u(U, 'V')} (Außenleiterspannung) geschaltet.`, parts: [
      { t: 'Berechne den Strangstrom I_Str.', sym: 'I_Str', val: Is, unit: 'A', f: '[[U||R]]', e: `[[${u(U, 'V')}||${u(R, 'Ω')}]]` },
      { t: 'Berechne den Leiterstrom I.', sym: 'I', val: I, unit: 'A', f: '√3 · I_Str', e: `√3 · ${u(Is, 'A')}` },
      { t: 'Berechne die gesamte Wirkleistung P.', sym: 'P', val: P, unit: 'W', f: '√3 · U · I', e: `√3 · ${u(U, 'V')} · ${u(I, 'A')}` }
    ] };
  });
  add('dreh', 'Drehzahl und Schlupf', () => {
    const p = pick([1, 2, 3, 4]), s = pick([2, 3, 4, 5, 6]);
    const ns = 3000 / p, nn = ns * (1 - s / 100);
    return { q: `Ein Asynchronmotor hat ${n(2 * p)} Pole und läuft am 50-Hz-Netz. Der Schlupf beträgt ${n(s)} %.`, parts: [
      { t: 'Berechne die Synchrondrehzahl n_s.', sym: 'n_s', val: ns, unit: '1/min', f: '[[f · 60||p]]', e: `[[50 · 60||${n(p)}]]`, t_: `[[50||${n(p)}]]` },
      { t: 'Berechne die Läuferdrehzahl n.', sym: 'n', val: nn, unit: '1/min', f: 'n_s · (1 − [[s||100 %]])', e: `${u(ns, '1/min')} · (1 − [[${n(s)} %||100 %]])` }
    ] };
  });
  add('dreh', 'Schlupf berechnen', () => {
    const ns = pick([3000, 1500, 1000, 750]), s0 = pick([2, 3, 4, 5, 6]);
    const nn = Math.round(ns * (1 - s0 / 100)), s = (ns - nn) / ns * 100;
    return { q: `Ein Asynchronmotor am 50-Hz-Netz hat die Synchrondrehzahl n_s = ${u(ns, '1/min')} und dreht im Betrieb mit n = ${u(nn, '1/min', 4)}.`, parts: [
      { t: 'Berechne den Schlupf s in Prozent.', sym: 's', val: s, unit: '%', f: '[[n_s − n||n_s]] · 100 %', e: `[[${u(ns, '1/min', 4)} − ${u(nn, '1/min', 4)}||${u(ns, '1/min', 4)}]] · 100 %` },
      { t: 'Berechne die Polpaarzahl p.', sym: 'p', val: 3000 / ns, unit: '', f: '[[f · 60||n_s]]', e: `[[50 · 60||${n(ns)}]]` }
    ] };
  });

  // ===== Leitungen und Spannungsfall =====
  add('leitung', 'Leitungswiderstand', () => {
    const l = pick([10, 15, 25, 40, 60, 80, 100]), A = pick([1.5, 2.5, 4, 6, 10, 16]), I = pick([5, 10, 13, 16]);
    const R = 2 * l / (56 * A), dU = R * I;
    return { q: `Eine Kupferleitung (γ = 56 m/Ωmm²) mit ${u(A, 'mm²')} ist ${u(l, 'm')} lang (Hin- und Rückleitung beachten).`, parts: [
      { t: 'Berechne den Leitungswiderstand R.', sym: 'R', val: R, unit: 'Ω', f: '[[2 · l||γ · A]]', e: `[[2 · ${u(l, 'm')}||56 m/Ωmm² · ${u(A, 'mm²')}]]` },
      { t: `Berechne den Spannungsfall ΔU bei ${u(I, 'A')}.`, sym: 'ΔU', val: dU, unit: 'V', f: 'R · I', e: `${u(R, 'Ω')} · ${u(I, 'A')}` }
    ] };
  });
  add('leitung', 'Spannungsfall Wechselstrom', () => {
    const l = pick([10, 15, 20, 25, 30, 40, 50]), A = pick([1.5, 2.5, 4, 6]), I = pick([6, 10, 13, 16]), c = pick([1, 1, 0.9, 0.8]), U = 230;
    const dU = 2 * l * I * c / (56 * A), du = dU / U * 100;
    return { q: `Eine Wechselstromleitung aus Kupfer (γ = 56 m/Ωmm²) ist ${u(l, 'm')} lang und hat ${u(A, 'mm²')}. Sie führt ${u(I, 'A')} bei cos φ = ${n(c)}. Netz: ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Spannungsfall ΔU.', sym: 'ΔU', val: dU, unit: 'V', f: '[[2 · l · I · cos φ||γ · A]]', e: `[[2 · ${u(l, 'm')} · ${u(I, 'A')} · ${n(c)}||56 m/Ωmm² · ${u(A, 'mm²')}]]` },
      { t: 'Berechne den Spannungsfall Δu in Prozent.', sym: 'Δu', val: du, unit: '%', f: '[[ΔU||U]] · 100 %', e: `[[${u(dU, 'V')}||${u(U, 'V')}]] · 100 %` }
    ] };
  });
  add('leitung', 'Spannungsfall Drehstrom', () => {
    const l = pick([20, 30, 40, 50, 80, 100]), A = pick([2.5, 4, 6, 10, 16]), I = pick([10, 16, 20, 25, 32]), c = pick([1, 0.9, 0.85]), U = 400;
    const dU = Math.sqrt(3) * l * I * c / (56 * A), du = dU / U * 100;
    return { q: `Eine Drehstromleitung aus Kupfer (γ = 56 m/Ωmm²) ist ${u(l, 'm')} lang und hat ${u(A, 'mm²')}. Sie führt ${u(I, 'A')} bei cos φ = ${n(c)}. Netz: ${u(U, 'V')}.`, parts: [
      { t: 'Berechne den Spannungsfall ΔU.', sym: 'ΔU', val: dU, unit: 'V', f: '[[√3 · l · I · cos φ||γ · A]]', e: `[[√3 · ${u(l, 'm')} · ${u(I, 'A')} · ${n(c)}||56 m/Ωmm² · ${u(A, 'mm²')}]]` },
      { t: 'Berechne den Spannungsfall Δu in Prozent.', sym: 'Δu', val: du, unit: '%', f: '[[ΔU||U]] · 100 %', e: `[[${u(dU, 'V')}||${u(U, 'V')}]] · 100 %` }
    ] };
  });
  add('leitung', 'Leiterquerschnitt', () => {
    const dreh = Math.random() < 0.5, l = pick([20, 30, 40, 50, 80, 100]), I = pick([10, 13, 16, 20, 25]), c = pick([1, 0.9]), pz = pick([2, 3, 4]);
    const U = dreh ? 400 : 230, dU = U * pz / 100, k = dreh ? Math.sqrt(3) : 2;
    const A = k * l * I * c / (56 * dU);
    const art = dreh ? 'Drehstromleitung' : 'Wechselstromleitung';
    return { q: `Eine Kupfer-${art} (γ = 56 m/Ωmm²) mit ${u(l, 'm')} Länge führt ${u(I, 'A')} bei cos φ = ${n(c)}. Netz: ${u(U, 'V')}. Zulässig sind ${n(pz)} % Spannungsfall.`, parts: [
      { t: 'Berechne den zulässigen Spannungsfall ΔU in Volt.', sym: 'ΔU', val: dU, unit: 'V', f: '[[U · Δu||100 %]]', e: `[[${u(U, 'V')} · ${n(pz)} %||100 %]]` },
      { t: 'Berechne den mindestens nötigen Leiterquerschnitt A.', sym: 'A', val: A, unit: 'mm²', f: dreh ? '[[√3 · l · I · cos φ||γ · ΔU]]' : '[[2 · l · I · cos φ||γ · ΔU]]',
        e: `[[${dreh ? '√3' : '2'} · ${u(l, 'm')} · ${u(I, 'A')} · ${n(c)}||56 m/Ωmm² · ${u(dU, 'V')}]]` }
    ] };
  });

  // ===== Schutz und Messen =====
  add('schutz', 'Schleifenimpedanz (LS-Schalter)', () => {
    const typ = pick(['B', 'C']), k = typ === 'B' ? 5 : 10, In = pick([6, 10, 13, 16, 20, 25]), U0 = 230;
    const Ia = k * In;
    return { q: `Eine Steckdose ist mit einem Leitungsschutzschalter ${typ}${In} abgesichert (TN-System, U_0 = ${u(U0, 'V')}). Der Typ ${typ} löst magnetisch beim ${k}-fachen Nennstrom aus.`, parts: [
      { t: 'Berechne den Abschaltstrom I_a.', sym: 'I_a', val: Ia, unit: 'A', f: `${k} · I_n`, e: `${k} · ${u(In, 'A')}` },
      { t: 'Berechne die höchstzulässige Schleifenimpedanz Z_S.', sym: 'Z_S', val: U0 / Ia, unit: 'Ω', f: '[[U_0||I_a]]', e: `[[${u(U0, 'V')}||${u(Ia, 'A')}]]` }
    ] };
  });
  add('schutz', 'Schleifenimpedanz (RCD)', () => {
    const I = pick([10, 30, 300, 500]);
    return { q: `Eine Anlage wird mit einer Fehlerstrom-Schutzeinrichtung (RCD) mit I_Δn = ${u(I, 'mA')} geschützt. Die zulässige Berührungsspannung beträgt U_L = 50 V.`, parts: [
      { t: 'Berechne die höchstzulässige Schleifenimpedanz Z_S.', sym: 'Z_S', val: 50 / (I / 1000), unit: 'Ω', f: '[[U_L||I_Δn]]', e: `[[50 V||${u(I, 'mA')}]]` }
    ] };
  });
  add('schutz', 'Messabweichung', () => {
    const Kl = pick([0.5, 1, 1.5, 2.5]), UE = pick([10, 30, 60, 100, 300, 600]);
    const Ug = Math.round(UE * pick([0.3, 0.4, 0.5, 0.6, 0.8]));
    const dU = Kl * UE / 100, du = dU / Ug * 100;
    return { q: `Ein Spannungsmesser der Klasse ${n(Kl)} hat den Messbereichsendwert U_E = ${u(UE, 'V')}. Er zeigt ${u(Ug, 'V')} an.`, parts: [
      { t: 'Berechne die größtmögliche Messabweichung ΔU.', sym: 'ΔU', val: dU, unit: 'V', f: '[[Kl · U_E||100]]', e: `[[${n(Kl)} · ${u(UE, 'V')}||100]]` },
      { t: 'Berechne die relative Abweichung Δu bezogen auf den angezeigten Wert.', sym: 'Δu', val: du, unit: '%', f: '[[ΔU||U_gem]] · 100 %', e: `[[${u(dU, 'V')}||${u(Ug, 'V')}]] · 100 %` }
    ] };
  });

  // ---------- Themen ----------
  const THEMEN = [
    { id: 'grund', name: 'Grundlagen', info: 'Ohm, Reihe, Parallel, Teiler' },
    { id: 'leistung', name: 'Leistung & Kosten', info: 'P, W, Wirkungsgrad' },
    { id: 'wechsel', name: 'Wechselstrom', info: 'cos φ, X_L, X_C, Trafo' },
    { id: 'dreh', name: 'Drehstrom & Motor', info: 'Stern/Dreieck, Schlupf' },
    { id: 'leitung', name: 'Leitungen', info: 'Widerstand, Spannungsfall' },
    { id: 'schutz', name: 'Schutz & Messen', info: 'Z_S, RCD, Messfehler' }
  ];

  // ---------- Aufgabe als Karte bauen ----------
  let last = null;
  function neueAufgabe(topics, prevCard){
    const ok = (topics && topics.length) ? T.filter(t => topics.includes(t.thema)) : T;
    let pool = ok.length ? ok : T;
    if(last && pool.length > 1) pool = pool.filter(t => t !== last);
    const tpl = pick(pool);
    last = tpl;
    const g = tpl.gen();
    const hint = g.parts.map(p => wegOf(p)[0]).join('\n');
    return {
      id: 'ueben-' + Date.now().toString(36) + Math.floor(Math.random() * 1e4),
      practice: true,
      template: tpl.name,
      question: g.q,
      image: '',
      calc: g.parts.map(p => ({ text: p.t, answer: answerOf(p) })),
      explanation: 'Formeln:\n' + hint,
      wegLines: g.parts.map(wegOf),
      _parts: g.parts // nur für Tests
    };
  }

  window.uebenNeueAufgabe = neueAufgabe;
  window.uebenThemen = THEMEN;
  window.uebenVorlagen = T;
  window.uebenInternals = { answerOf, wegOf, n };

  // ---------- Auswahlfenster ----------
  const overlay = document.getElementById('uebenPicker');
  if(overlay){
    const list = document.getElementById('uebenThemen');
    const startBtn = document.getElementById('uebenStart');
    const sel = new Set(THEMEN.map(t => t.id));
    function draw(){
      list.innerHTML = '';
      THEMEN.forEach(t => {
        const b = document.createElement('button');
        b.type = 'button';
        b.className = 'ueb-chip' + (sel.has(t.id) ? ' on' : '');
        b.innerHTML = '<span class="ueb-box">' + (sel.has(t.id) ? '✓' : '') + '</span><span><b>' + t.name + '</b><br><small>' +
          t.info.replace(/([A-Za-zηφ])_([A-Za-z0-9]+)/g, '$1<sub>$2</sub>') + '</small></span>';
        b.addEventListener('click', () => { sel.has(t.id) ? sel.delete(t.id) : sel.add(t.id); draw(); });
        list.appendChild(b);
      });
      startBtn.disabled = sel.size === 0;
      startBtn.style.opacity = sel.size === 0 ? '0.5' : '';
    }
    window.openUebenPicker = function(){ draw(); overlay.classList.add('open'); };
    window.closeUebenPicker = function(){ overlay.classList.remove('open'); };
    document.getElementById('uebenBtn').addEventListener('click', window.openUebenPicker);
    document.getElementById('uebenCancel').addEventListener('click', window.closeUebenPicker);
    overlay.addEventListener('click', e => { if(e.target === overlay) window.closeUebenPicker(); });
    startBtn.addEventListener('click', () => {
      if(!sel.size) return;
      const topics = sel.size === THEMEN.length ? null : [...sel];
      window.closeUebenPicker();
      window.startUeben(topics);
    });
  }
})();
