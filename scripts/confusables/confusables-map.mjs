/**
 * Mapping of ASCII characters to visually similar Unicode confusables.
 * Each character maps to an array of alternatives.
 */
export const CONFUSABLES = {
    // Lowercase letters
    a: ['а', 'ɑ', 'α'], // Cyrillic а, Latin alpha, Greek alpha
    b: ['Ь', 'ḃ', 'ƅ'], // Cyrillic soft sign, b with dot, b with stroke
    c: ['с', 'ϲ', 'ⅽ'], // Cyrillic с, Greek lunate sigma, Roman numeral c
    d: ['ԁ', 'ḋ', 'ɗ'], // Cyrillic komi de, d with dot, African d
    e: ['е', 'ė', 'ё'], // Cyrillic е, e with dot, Cyrillic yo
    f: ['f', 'ḟ', 'ƒ'], // ASCII f, f with dot, florin
    g: ['ɡ', 'ġ', 'ģ'], // Latin g, g with dot, g with cedilla
    h: ['һ', 'ḣ', 'ћ'], // Cyrillic shha, h with dot, Serbian tshe
    i: ['і', 'ı', 'ɩ'], // Cyrillic і, Turkish dotless i, Latin iota
    j: ['ј', 'ȷ', 'ɉ'], // Cyrillic je, dotless j, j with stroke
    k: ['κ', 'ḳ', 'ķ'], // Greek kappa, k with dot below, k with cedilla
    l: ['ӏ', 'ḷ', 'ļ'], // Cyrillic palochka, l with dot, l with cedilla
    m: ['m', 'ṁ', 'ṃ'], // ASCII m, m with dot, m with dot below
    n: ['п', 'ṅ', 'ņ'], // Cyrillic pe, n with dot, n with cedilla
    o: ['о', 'ο', 'ө'], // Cyrillic о, Greek omicron, Cyrillic barred o
    p: ['р', 'ρ', 'ṗ'], // Cyrillic р, Greek rho, p with dot
    q: ['q', 'ԛ', 'ʠ'], // ASCII q, Cyrillic qa, q with hook
    r: ['г', 'ṙ', 'ŗ'], // Cyrillic ge, r with dot, r with cedilla
    s: ['ѕ', 'ṡ', 'ş'], // Cyrillic dze, s with dot, s with cedilla
    t: ['t', 'ṫ', 'ţ'], // ASCII t, t with dot, t with cedilla
    u: ['υ', 'ս', 'ṳ'], // Greek upsilon, Armenian se, u with diaeresis below
    v: ['ν', 'v', 'ṿ'], // Greek nu, ASCII v, v with dot below
    w: ['w', 'ẇ', 'ẉ'], // ASCII w, w with dot, w with dot below
    x: ['х', 'χ', 'ẋ'], // Cyrillic kha, Greek chi, x with dot
    y: ['у', 'ү', 'ẏ'], // Cyrillic u, Cyrillic straight u, y with dot
    z: ['z', 'ż', 'ẓ'], // ASCII z, z with dot, z with dot below

    // Uppercase letters
    A: ['А', 'Α', 'Ꭺ'], // Cyrillic А, Greek Alpha, Cherokee A
    B: ['В', 'Β', 'Ḃ'], // Cyrillic В, Greek Beta, B with dot
    C: ['С', 'Ϲ', 'Ⅽ'], // Cyrillic С, Greek Capital Lunate Sigma, Roman numeral C
    D: ['D', 'Ḋ', 'Ð'], // ASCII D, D with dot, Eth
    E: ['Е', 'Ε', 'Ё'], // Cyrillic Е, Greek Epsilon, Cyrillic Yo
    F: ['F', 'Ḟ', 'Ƒ'], // ASCII F, F with dot, F with hook
    G: ['G', 'Ġ', 'Ģ'], // ASCII G, G with dot, G with cedilla
    H: ['Н', 'Η', 'Ḣ'], // Cyrillic Н, Greek Eta, H with dot
    I: ['І', 'Ι', 'Ӏ'], // Cyrillic І, Greek Iota, Cyrillic Palochka
    J: ['Ј', 'J', 'Ɉ'], // Cyrillic Je, ASCII J, J with stroke
    K: ['К', 'Κ', 'Ḳ'], // Cyrillic К, Greek Kappa, K with dot below
    L: ['L', 'Ḷ', 'Ļ'], // ASCII L, L with dot below, L with cedilla
    M: ['М', 'Μ', 'Ṁ'], // Cyrillic М, Greek Mu, M with dot
    N: ['Ν', 'N', 'Ṅ'], // Greek Nu, ASCII N, N with dot
    O: ['О', 'Ο', 'Ө'], // Cyrillic О, Greek Omicron, Cyrillic Barred O
    P: ['Р', 'Ρ', 'Ṗ'], // Cyrillic Р, Greek Rho, P with dot
    Q: ['Q', 'Ԛ', 'Ǫ'], // ASCII Q, Cyrillic Qa, Q with ogonek
    R: ['R', 'Ṙ', 'Ŗ'], // ASCII R, R with dot, R with cedilla
    S: ['Ѕ', 'Ṡ', 'Ş'], // Cyrillic Dze, S with dot, S with cedilla
    T: ['Т', 'Τ', 'Ṫ'], // Cyrillic Т, Greek Tau, T with dot
    U: ['U', 'Ս', 'Ṳ'], // ASCII U, Armenian Se, U with diaeresis below
    V: ['V', 'Ṿ', 'Ѵ'], // ASCII V, V with dot below, Cyrillic Izhitsa
    W: ['W', 'Ẇ', 'Ẉ'], // ASCII W, W with dot, W with dot below
    X: ['Х', 'Χ', 'Ẋ'], // Cyrillic Kha, Greek Chi, X with dot
    Y: ['Υ', 'Ү', 'Ẏ'], // Greek Upsilon, Cyrillic Straight U, Y with dot
    Z: ['Z', 'Ż', 'Ẓ'], // ASCII Z, Z with dot, Z with dot below
};
