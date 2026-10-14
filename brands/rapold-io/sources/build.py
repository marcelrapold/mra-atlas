"""rapold.io Dachmarke «Der First» – final logo masters (refined from concept «fold»).

Writes the eight logo masters to brands/rapold-io/assets/logos/ and deck/check renders to
brands/rapold-io/sources/. All lettering is outlined from Geist / Geist Mono (OFL 1.1,
brands/rapold/assets/fonts). No <text> elements.

Refinements vs. concept:
  * Logo masters are pure two-tone (body Azure + facet Ice) like the ten Raumfalten signets.
    The 3.2-unit Firstglut sliver of the concept read as misregistration below ~200 px and
    is moved to rendered light (glow) in supergraphics only.
  * Mono variants are truly one colour; the fold survives as the «First-Fuge», a 6-unit
    air gap along the ridge (colour = light on the ridge, mono = air on the ridge).
  * Lockup is optically locked: mark ink top = ascender of «l/d», mark ink bottom =
    descriptor baseline; descriptor starts on the stem of «r».
  * Wordmark rhombus dot sized to the Geist period weight at 600 and sat on the baseline.
"""
import os, sys, math, json
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'fold'))
from mark import clip
import txt

import os
REPO = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')).replace(os.sep, '/') + '/'
LOGOS_OUT = REPO + 'brands/rapold-io/assets/logos/'
SIGNETS = REPO + 'brands/rapold/assets/logos/'
SCR = os.path.dirname(os.path.abspath(__file__)).replace('\\', '/') + '/'

C = dict(navy='#050B19', abyss='#02060F', panel='#0B1528', panel2='#142741', line='#23334A',
         ink='#EDF5FF', muted='#9AADC7', azure='#009DFF', ice='#A8EDFF', sky='#38B8FF', paper='#F4FAFF',
         lprimary='#0066B3', lfacet='#2B89B5', link='#10253D', lmuted='#46617E', lline='#CDDEEE',
         glut='#FFA36C', glutcore='#FFE2CC', lglut='#B4511A', white='#FFFFFF')

# ------------------------------------------------------------------ construction
# Flat letter R in (u,v), v up. Folded once about the vertical ridge u = UF with the
# family iso slope 1:0.5 (isoP in scripts/build-signet-proposals.mjs).
UF = 80
OUTER = [(0, 0), (44, 0), (44, 72), (160, 72), (160, 168), (0, 168)]
COUNTER = [(44, 104), (118, 104), (118, 134), (44, 134)]
LEG = [(86, 58), (138, 58), (176, 0), (124, 0)]   # open gap of 14 to the bowl


def fold(p):
    u, v = p
    return (u, -v - 0.5 * u) if u <= UF + 1e-9 else (u, -v - 0.5 * UF + 0.5 * (u - UF))


def raw(gap=0.0):
    """gap: flat units of air cut from the falling page along the ridge (mono)."""
    L, R = [], []
    for poly in (OUTER, COUNTER, LEG):
        l = clip(poly, 1, 0, UF); r = clip(poly, -1, 0, -(UF + gap))
        if len(l) > 2: L.append([fold(p) for p in l])
        if len(r) > 2: R.append([fold(p) for p in r])
    return L, R


def _fit_transform(box=(24, 24, 232, 232)):
    L, R = raw()
    pts = [p for g in (L, R) for q in g for p in q]
    xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    s = min((box[2] - box[0]) / w, (box[3] - box[1]) / h)
    ox = box[0] + ((box[2] - box[0]) - w * s) / 2 - min(xs) * s
    oy = box[1] + ((box[3] - box[1]) - h * s) / 2 - min(ys) * s
    return s, ox, oy


S, OX, OY = _fit_transform()
F = lambda p: (round(OX + p[0] * S, 3), round(OY + p[1] * S, 3))


def fitted(gap=0.0):
    L, R = raw(gap)
    return [[F(p) for p in q] for q in L], [[F(p) for p in q] for q in R]


MARK_L, MARK_R = fitted()
FUGE = 6.0 / S                     # 6 grid units of air in mono
MONO_L, MONO_R = fitted(FUGE)
RIDGE_TOP = F(fold((UF, 168)))
RIDGE_CNT = F(fold((UF, 134)))     # ridge meets the window
RIDGE_CNB = F(fold((UF, 104)))
RIDGE_BOT = F(fold((UF, 72)))
INK = (min(p[0] for q in MARK_L + MARK_R for p in q), min(p[1] for q in MARK_L + MARK_R for p in q),
       max(p[0] for q in MARK_L + MARK_R for p in q), max(p[1] for q in MARK_L + MARK_R for p in q))


def d(polys):
    return ' '.join('M ' + ' L '.join(f'{x:g} {y:g}' for x, y in p) + ' Z' for p in polys)


def mark_paths(body, facet, mono=False, body_attr='', facet_attr=''):
    L, R = (MONO_L, MONO_R) if mono else (MARK_L, MARK_R)
    return (f'<path data-part="body" fill="{body}" fill-rule="evenodd"{body_attr} d="{d(L)}"/>'
            f'<path data-part="facet" fill="{facet}" fill-rule="evenodd"{facet_attr} d="{d(R)}"/>')


def svg(w, h, body, title, desc, extra=''):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" width="{w:g}" height="{h:g}" viewBox="0 0 {w:g} {h:g}" role="img"{extra}>\n'
            f'  <title>{title}</title>\n  <desc>{desc}</desc>\n{body}\n</svg>\n')


def write(path, content):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    open(path, 'w', encoding='utf-8', newline='\n').write(content)
    print('wrote', path)


MARK_DESC = ('Dachmarke rapold.io «Der First»: ein R, einmal um einen senkrechten Grat gefaltet. Links steigt die Ebene, '
             'rechts fällt sie, Steigung 1:0,5 wie die zehn Raumfalten-Signets. Oben entsteht ein Satteldach (der First), '
             'die Punze wird zum Hausfenster, das Bein steht frei mit offener Fuge. 256er-Raster, 24 Einheiten Schutzraum, keine Schrift.')

# ------------------------------------------------------------------ type helpers
def glyph_bounds(s, size, w=600):
    f = txt.font('sans', w); gs = f.getGlyphSet(); cmap = f.getBestCmap()
    from fontTools.pens.boundsPen import BoundsPen
    bp = BoundsPen(gs); gs[cmap[ord(s)]].draw(bp)
    k = size / 1000
    return tuple(v * k for v in bp.bounds)


def kern_text(s, x, base, size, w=600, track=0.0):
    """Outlined text with GPOS pair kerning (class + pair) from Geist."""
    f = txt.font('sans', w); cmap = f.getBestCmap(); gs = f.getGlyphSet(); hm = f['hmtx']
    sc = size / 1000
    names = [cmap[ord(c)] for c in s]
    kern = _pairs(f)
    from fontTools.pens.svgPathPen import SVGPathPen
    from fontTools.pens.transformPen import TransformPen
    pen = SVGPathPen(gs, ntos=lambda v: ('%.2f' % v).rstrip('0').rstrip('.'))
    cx = x
    for i, n in enumerate(names):
        gs[n].draw(TransformPen(pen, (sc, 0, 0, -sc, cx, base)))
        cx += hm[n][0] * sc + track * size
        if i + 1 < len(names):
            cx += kern(n, names[i + 1]) * sc
    return pen.getCommands(), cx - x - track * size


_kcache = {}
def _pairs(f):
    if id(f) in _kcache: return _kcache[id(f)]
    gpos = f['GPOS'].table
    looks = []
    for fr in gpos.FeatureList.FeatureRecord:
        if fr.FeatureTag == 'kern':
            looks += fr.Feature.LookupListIndex
    subs = []
    for li in sorted(set(looks)):
        lk = gpos.LookupList.Lookup[li]
        for st in lk.SubTable:
            if lk.LookupType == 9: st = st.ExtSubTable
            if getattr(st, 'LookupType', 2) == 2 or lk.LookupType in (2, 9): subs.append(st)
    def k(a, b):
        for st in subs:
            if not hasattr(st, 'Format'): continue
            cov = st.Coverage.glyphs
            if a not in cov: continue
            if st.Format == 1:
                ps = st.PairSet[cov.index(a)]
                for pv in ps.PairValueRecord:
                    if pv.SecondGlyph == b:
                        return getattr(pv.Value1, 'XAdvance', 0) or 0
            elif st.Format == 2:
                c1 = st.ClassDef1.classDefs.get(a, 0); c2 = st.ClassDef2.classDefs.get(b, 0)
                v = st.Class1Record[c1].Class2Record[c2].Value1
                xa = getattr(v, 'XAdvance', 0) if v else 0
                if xa: return xa
        return 0
    _kcache[id(f)] = k
    return k


def mono(s, x, base, size, fill, w=450, track=0.2, anchor='start', op=None):
    dd, a = txt.text(s, x, base, size, fam='mono', w=w, track=track, anchor=anchor)
    o = f' fill-opacity="{op}"' if op is not None else ''
    return f'<path fill="{fill}"{o} d="{dd}"/>', a


def sans(s, x, base, size, fill, w=400, track=-0.01, anchor='start', extra=''):
    if anchor == 'start':
        dd, a = kern_text(s, x, base, size, w=w, track=track)
    else:
        _, a = kern_text(s, 0, 0, size, w=w, track=track)
        x0 = x - a if anchor == 'end' else x - a / 2
        dd, a = kern_text(s, x0, base, size, w=w, track=track)
    return f'<path fill="{fill}" {extra} d="{dd}"/>', a


def rhombus(cx, base, r):
    """45° rhombus standing on the baseline: the family's free point (Argus pupil, Atlas pin)."""
    return f'M {cx:.2f} {base - 2 * r:.2f} L {cx + r:.2f} {base - r:.2f} L {cx:.2f} {base:.2f} L {cx - r:.2f} {base - r:.2f} Z'


# ------------------------------------------------------------------ wordmark
WM_TRACK = -0.045
WM_W = 600
DOT_R = 0.078          # rhombus half-diagonal in em; diagonal 0.156 em ~ Geist 600 period height


def wordmark(x, base, size, root, accent, dot=None):
    """'rapold' + rhombus point + 'io'. Returns (svg, advance)."""
    d1, a1 = kern_text('rapold', x, base, size, w=WM_W, track=WM_TRACK)
    r = DOT_R * size
    side = 0.05 * size                       # optical side bearing either side of the point
    cx = x + a1 + WM_TRACK * size + side + r
    x2 = cx + r + side
    d2, a2 = kern_text('io', x2, base, size, w=WM_W, track=WM_TRACK)
    s = (f'<path data-part="wordmark-root" fill="{root}" d="{d1}"/>'
         f'<path data-part="wordmark-point" fill="{dot or accent}" d="{rhombus(cx, base, r)}"/>'
         f'<path data-part="wordmark-tld" fill="{accent}" d="{d2}"/>')
    return s, (x2 + a2) - x


def headline(s, x, base, size, fill, point, w=600, track=-0.045):
    """Headline whose final full stop is the brand rhombus («Rautenpunkt»)."""
    body = s[:-1] if s.endswith('.') else s
    p, a = sans(body, x, base, size, fill, w=w, track=track)
    r = DOT_R * size * 1.12
    cx = x + a + track * size + 0.03 * size + r
    return p + f'<path fill="{point}" d="{rhombus(cx, base, r)}"/>', (cx + r) - x


# ------------------------------------------------------------------ signets
import re
FAMILY = ['fabric', 'argus', 'learn', 'edgeportal', 'lotse', 'cockpit', 'auditor', 'auth', 'pocketforge', 'atlas']


def signet_g(id_, x, y, size, body, facet, op=1):
    s = open(SIGNETS + id_ + '.svg', encoding='utf-8').read()
    b = re.search(r'data-part="body"[^>]*\sd="([^"]+)"', s).group(1)
    fs = re.findall(r'points="([^"]+)"', s)
    fps = re.findall(r'<path data-part="facet[^"]*"[^>]*\sd="([^"]+)"', s)
    k = size / 256
    inner = (f'<path fill="{body}" fill-rule="evenodd" d="{b}"/>' + ''.join(f'<polygon fill="{facet}" points="{p}"/>' for p in fs)
             + ''.join(f'<path fill="{facet}" fill-rule="evenodd" d="{p}"/>' for p in fps))
    return f'<g transform="translate({x:g} {y:g}) scale({k:g})" opacity="{op}">{inner}</g>'


# ------------------------------------------------------------------ logo masters
def logos():
    V = {
        'dark': (C['azure'], C['ice'], 'dark: Body Azure #009DFF, Facette Ice #A8EDFF, für Navy #050B19'),
        'light': (C['lprimary'], C['lfacet'], 'light: Body #0066B3, Facette #2B89B5, für Ice Paper #F4FAFF'),
    }
    for k, (b, f, note) in V.items():
        write(LOGOS_OUT + f'mark-{k}.svg', svg(256, 256, '  ' + mark_paths(b, f), 'rapold.io – Dachmarke «Der First»', MARK_DESC + ' Variante ' + note + '.'))
    for k, col in (('mono-white', '#FFFFFF'), ('mono-black', '#000000')):
        write(LOGOS_OUT + f'mark-{k}.svg', svg(256, 256, '  ' + mark_paths(col, col, mono=True), 'rapold.io – Dachmarke «Der First»',
              MARK_DESC + f' Variante {k}: einfarbig {col}; der Grat ist als First-Fuge (6 Einheiten Luft) ausgespart, damit die Faltung ohne zweite Farbe lesbar bleibt.'))

    # wordmarks: viewBox hugs the ink + 0.16 em air
    size = 100
    for mode, root, acc in (('dark', C['ink'], C['azure']), ('light', C['link'], C['lprimary'])):
        wm, adv = wordmark(0, 0, size, root, acc)
        asc = glyph_bounds('l', size)[3]; desc = -glyph_bounds('p', size)[1]
        pad = 16
        W = math.ceil(adv + 2 * pad); H = math.ceil(asc + desc + 2 * pad)
        write(LOGOS_OUT + f'wordmark-{mode}.svg', svg(W, H, f'  <g transform="translate({pad} {pad + asc:g})">{wm}</g>', 'rapold.io – Wortmarke',
              f'Wortmarke rapold.io in Geist 600, Laufweite −0,045 em, GPOS-Kerning, als Pfade. «rapold» in {"Ink #EDF5FF" if mode == "dark" else "#10253D"}, '
              f'der Punkt ist die 45°-Raute der Familie, Raute und «io» in {"Azure #009DFF" if mode == "dark" else "#0066B3"}. Variante: {mode}. Transparent.'))

    # horizontal lockups
    for mode in ('dark', 'light'):
        dk = mode == 'dark'
        body, facet = (C['azure'], C['ice']) if dk else (C['lprimary'], C['lfacet'])
        root, acc, mu = (C['ink'], C['azure'], C['muted']) if dk else (C['link'], C['lprimary'], C['lmuted'])
        g, W, H = lockup(0, 0, 92, body, facet, root, acc, mu)
        write(LOGOS_OUT + f'lockup-horizontal-{mode}.svg', svg(W, H, '  ' + g, 'rapold.io – Lockup horizontal',
              f'Dachmarke «Der First» mit Wortmarke rapold.io und Deskriptor FULLSTACK DIGITAL OPERATIONS in Geist Mono 450, Laufweite 0,2 em. '
              f'Optisch verriegelt: Zeichen-Oberkante = Oberlänge von «l», Zeichen-Unterkante = Grundlinie Deskriptor. Variante: {mode}. Transparent.'))


def lockup(x0, y0, wsize, body, facet, root, acc, mu, descriptor='FULLSTACK DIGITAL OPERATIONS', pad=None):
    """Returns (svg group, W, H). wsize = wordmark size in px."""
    asc = glyph_bounds('l', wsize)[3]          # ascender above baseline
    dsz = wsize * 0.163                          # descriptor size (15 px at 92)
    dgap = wsize * 0.46                          # baseline-to-baseline wordmark -> descriptor
    ink_h = asc + dgap
    k = ink_h / (INK[3] - INK[1])
    mark_w = (INK[2] - INK[0]) * k
    gap = wsize * 0.40                           # mark ink -> wordmark («r» stem)
    pad = wsize * 0.26 if pad is None else pad
    mx = x0 + pad; top = y0 + pad
    base = top + asc
    g = f'<g transform="translate({mx - INK[0] * k:.3f} {top - INK[1] * k:.3f}) scale({k:.5f})">{mark_paths(body, facet)}</g>'
    wx = mx + mark_w + gap
    r_lsb = glyph_bounds('r', wsize)[0]
    wm, adv = wordmark(wx - r_lsb, base, wsize, root, acc)
    ds, da = mono(descriptor, wx, base + dgap, dsz, mu, w=450, track=0.2) if descriptor else ('', 0)
    W = math.ceil(wx + max(adv, da) + pad - x0)
    H = math.ceil(ink_h + 2 * pad)
    return g + wm + ds, W, H


# ------------------------------------------------------------------ previews and checks
def previews():
    out = SCR
    # small-size sheet: 16 / 24 / 32 / 48 / 64 px on navy and paper, colour and mono
    parts = [f'<rect width="760" height="300" fill="{C["navy"]}"/><rect y="150" width="760" height="150" fill="{C["paper"]}"/>']
    x = 24
    for px in (16, 24, 32, 48, 64, 96):
        k = px / 256
        parts.append(f'<g transform="translate({x} {75 - px / 2}) scale({k})">{mark_paths(C["azure"], C["ice"])}</g>')
        parts.append(f'<g transform="translate({x} {225 - px / 2}) scale({k})">{mark_paths(C["lprimary"], C["lfacet"])}</g>')
        x += px + 24
    for px in (16, 32, 64):
        k = px / 256
        parts.append(f'<g transform="translate({x} {75 - px / 2}) scale({k})">{mark_paths("#FFFFFF", "#FFFFFF", mono=True)}</g>')
        parts.append(f'<g transform="translate({x} {225 - px / 2}) scale({k})">{mark_paths("#000000", "#000000", mono=True)}</g>')
        x += px + 24
    write(out + 'check-sizes.svg', svg(760, 300, '  ' + ''.join(parts), 'size check', 'favicon to 96 px'))

    # family line-up: umbrella next to the ten signets at equal canvas
    W = 64 + 11 * 132
    parts = [f'<rect width="{W}" height="200" fill="{C["navy"]}"/>']
    parts.append(f'<g transform="translate(32 36) scale({128 / 256})">{mark_paths(C["azure"], C["ice"])}</g>')
    parts.append(f'<line x1="{32 + 128 + 2}" y1="40" x2="{32 + 128 + 2}" y2="160" stroke="{C["ice"]}" stroke-opacity="0.2"/>')
    for i, pid in enumerate(FAMILY):
        parts.append(signet_g(pid, 32 + (i + 1) * 132, 36, 128, C['azure'], C['ice']))
    write(out + 'check-family.svg', svg(W, 200, '  ' + ''.join(parts), 'family check', 'umbrella plus ten signets'))


if __name__ == '__main__':
    logos()
    previews()
    import deck
    deck.build()
