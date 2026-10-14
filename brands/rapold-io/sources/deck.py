"""rapold.io deck mocks (16:9, 1600x900 = 13.333 x 7.5 in, 120 px/in, 1 pt = 1.6667 px).
Verifies the slide recipes in DESIGN-DNA.md / dna.json. Scratchpad only."""
import math
import build as B
from build import C, d, mark_paths, sans, mono, headline, wordmark, signet_g, rhombus, svg, write, lockup, FAMILY
import txt

W, H = 1600, 900
M = 112                       # outer margin (0.933 in)
OUT = B.SCR


# ---------------------------------------------------------------- shared stage
def grain(fid='grain', op=0.035):
    return (f'<filter id="{fid}" x="0" y="0" width="100%" height="100%"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="1909" stitchTiles="stitch"/>'
            f'<feColorMatrix values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 {op} 0"/></filter>')


def iso_grid(step, op, mask):
    ls = []
    for k in range(-40, 80):
        c = k * step
        ls.append(f'M -20 {c:g} L {W + 20} {c + 0.5 * (W + 40):g}')
        ls.append(f'M -20 {c:g} L {W + 20} {c - 0.5 * (W + 40):g}')
    return f'<path d="{" ".join(ls)}" stroke="{C["ice"]}" stroke-opacity="{op}" stroke-width="1" fill="none" mask="url(#{mask})"/>'


def stage(bloom_cx=0.74, bloom_cy=0.34, warm=None, grid_c=(0.7, 0.4)):
    defs = (f'<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C["navy"]}"/><stop offset="1" stop-color="{C["abyss"]}"/></linearGradient>'
            f'<radialGradient id="bloom" cx="{bloom_cx}" cy="{bloom_cy}" r="0.62"><stop offset="0" stop-color="{C["azure"]}" stop-opacity="0.30"/><stop offset="0.45" stop-color="{C["azure"]}" stop-opacity="0.07"/><stop offset="1" stop-color="{C["azure"]}" stop-opacity="0"/></radialGradient>'
            f'<radialGradient id="gm" cx="{grid_c[0]}" cy="{grid_c[1]}" r="0.7"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#000"/></radialGradient>'
            f'<mask id="gridmask"><rect width="{W}" height="{H}" fill="url(#gm)"/></mask>' + grain())
    if warm:
        defs += (f'<radialGradient id="warm" cx="{warm[0]}" cy="{warm[1]}" r="{warm[2]}"><stop offset="0" stop-color="{C["glut"]}" stop-opacity="0.24"/>'
                 f'<stop offset="1" stop-color="{C["glut"]}" stop-opacity="0"/></radialGradient>')
    body = [f'<rect width="{W}" height="{H}" fill="url(#floor)"/>', f'<rect width="{W}" height="{H}" fill="url(#bloom)"/>']
    if warm: body.append(f'<rect width="{W}" height="{H}" fill="url(#warm)"/>')
    body.append(iso_grid(56, 0.055, 'gridmask'))
    return defs, body


def supergraphic(x, y, s, gid, ridge_op=1.0, fade=False):
    """The mark as lit glass planes with the glowing First (light as material)."""
    L = d(B.MARK_L); R = d(B.MARK_R)
    (x1, y1), (x2, y2) = B.RIDGE_TOP, B.RIDGE_CNT
    (x3, y3), (x4, y4) = B.RIDGE_CNB, B.RIDGE_BOT
    defs = (f'<linearGradient id="{gid}L" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2FB1FF"/><stop offset="0.55" stop-color="{C["azure"]}"/><stop offset="1" stop-color="#003E86"/></linearGradient>'
            f'<linearGradient id="{gid}R" x1="0" y1="0" x2="0.3" y2="1"><stop offset="0" stop-color="#E6FAFF"/><stop offset="0.5" stop-color="{C["ice"]}"/><stop offset="1" stop-color="#3D7FA6"/></linearGradient>'
            f'<filter id="{gid}G" filterUnits="userSpaceOnUse" x="-100" y="-100" width="456" height="456"><feGaussianBlur stdDeviation="{3 / s:g}"/></filter>'
            f'<filter id="{gid}H" filterUnits="userSpaceOnUse" x="-100" y="-100" width="456" height="456"><feGaussianBlur stdDeviation="{16 / s:g}"/></filter>'
            f'<linearGradient id="{gid}F" x1="0" y1="0" x2="0" y2="1"><stop offset="0.62" stop-color="#fff"/><stop offset="0.95" stop-color="#000"/></linearGradient>'
            f'<mask id="{gid}M" maskContentUnits="userSpaceOnUse"><rect width="{W}" height="{H}" fill="url(#{gid}F)"/></mask>')
    sw = 1.5 / s
    g = (f'<g transform="translate({x:g} {y:g}) scale({s:g})">'
         f'<path fill="url(#{gid}L)" fill-rule="evenodd" d="{L}"/>'
         f'<path fill="url(#{gid}R)" fill-rule="evenodd" d="{R}"/>'
         # glass rim: 1.5 px Ice hairline at 45 %
         f'<path fill="none" stroke="{C["ice"]}" stroke-opacity="0.45" stroke-width="{sw:g}" d="{L} {R}"/>'
         # the First: warm glow + light core on both ridge segments
         f'<g opacity="{ridge_op}"><path d="M {x1} {y1} L {x2} {y2} M {x3} {y3} L {x4} {y4}" stroke="{C["glut"]}" stroke-opacity="0.55" stroke-width="{24 / s:g}" filter="url(#{gid}H)"/>'
         f'<path d="M {x1} {y1} L {x2} {y2} M {x3} {y3} L {x4} {y4}" stroke="{C["glut"]}" stroke-width="{8 / s:g}" filter="url(#{gid}G)"/>'
         f'<path d="M {x1} {y1} L {x2} {y2} M {x3} {y3} L {x4} {y4}" stroke="{C["glutcore"]}" stroke-width="{2 / s:g}"/></g>'
         '</g>')
    g = f'<g mask="url(#{gid}M)">{g}</g>' if fade else g
    return defs, g


def small_lockup(x, y, h, mode='dark'):
    """Header/footer lockup without descriptor; h = wordmark size."""
    dk = mode == 'dark'
    body, facet = (C['azure'], C['ice']) if dk else (C['lprimary'], C['lfacet'])
    root, acc = (C['ink'], C['azure']) if dk else (C['link'], C['lprimary'])
    asc = B.glyph_bounds('l', h)[3]
    k = (asc * 1.32) / (B.INK[3] - B.INK[1])          # mark ink = 1.32 x ascender, centred on x-height band
    mh = (B.INK[3] - B.INK[1]) * k; mw = (B.INK[2] - B.INK[0]) * k
    top = y - asc - (mh - asc) / 2 - 0.0
    g = f'<g transform="translate({x - B.INK[0] * k:.2f} {top - B.INK[1] * k:.2f}) scale({k:.5f})">{mark_paths(body, facet)}</g>'
    wm, adv = wordmark(x + mw + h * 0.34, y, h, root, acc)
    return g + wm, mw + h * 0.34 + adv


def footer_dark(page, context):
    p = [f'<line x1="{M}" y1="808" x2="{W - M}" y2="808" stroke="#FFFFFF" stroke-opacity="0.12"/>']
    g, _ = small_lockup(M, 852, 22); p.append(g)
    t, _ = mono(context, 420, 850, 14, C['muted'], track=0.2); p.append(t)
    t, _ = mono(page, W - M, 850, 14, C['muted'], track=0.2, anchor='end'); p.append(t)
    return p


# ---------------------------------------------------------------- COVER
def cover():
    defs, p = stage(warm=(0.865, 0.06, 0.18))
    sd, sg = supergraphic(905, -40, 4.0, 'cv', fade=True)
    veil = (f'<linearGradient id="veil" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="{C["navy"]}" stop-opacity="0.92"/>'
            f'<stop offset="0.52" stop-color="{C["navy"]}" stop-opacity="0.55"/><stop offset="0.7" stop-color="{C["navy"]}" stop-opacity="0"/></linearGradient>')
    out = [f'<defs>{defs}{sd}{veil}</defs>'] + p + [sg, f'<rect width="{W}" height="{H}" fill="url(#veil)"/>']
    g, a = small_lockup(M, 112, 30); out.append(g)
    out.append(f'<line x1="{M + a + 32:g}" y1="88" x2="{M + a + 32:g}" y2="120" stroke="{C["ice"]}" stroke-opacity="0.2"/>')
    t, _ = mono('MANAGEMENT REVIEW  ·  Q4 2026', M + a + 60, 110, 14, C['muted'], track=0.22); out.append(t)
    # eyebrow
    out.append(f'<path fill="{C["ice"]}" d="{rhombus(M + 6, 333, 6)}"/>')
    t, _ = mono('RAPOLD.IO  /  PRODUKTE & BETRIEB  /  2026', M + 26, 333, 15, C['ice'], track=0.24); out.append(t)
    t, _ = sans('Systeme,', M - 6, 476, 136, C['ink'], w=600, track=-0.05); out.append(t)
    t, _ = headline('die laufen.', M - 6, 618, 136, C['azure'], C['glut'], track=-0.05); out.append(t)
    t, _ = sans('Zehn Produkte, ein Betrieb, eine Handschrift.', M, 692, 26, C['muted'], w=400); out.append(t)
    # family rail
    out.append(f'<line x1="{M}" y1="776" x2="{W - M}" y2="776" stroke="{C["ice"]}" stroke-opacity="0.12"/>')
    for i, pid in enumerate(FAMILY):
        out.append(signet_g(pid, M + i * 52, 796, 40, C['azure'], C['ice'], op=0.92))
    t, _ = mono('MARCEL RAPOLD  ·  FOUNDER  ·  14.10.2026', W - M, 824, 14, C['muted'], track=0.2, anchor='end'); out.append(t)
    out.append(f'<rect width="{W}" height="{H}" filter="url(#grain)"/>')
    write(OUT + 'deck-cover.svg', svg(W, H, '  ' + '\n  '.join(out), 'rapold.io – Cover', 'Cover-Rezept'))


# ---------------------------------------------------------------- SECTION
def section():
    defs, p = stage(bloom_cx=0.26, bloom_cy=0.40, grid_c=(0.3, 0.45))
    sd, sg = supergraphic(-300, 130, 3.2, 'sc')
    fade = (f'<linearGradient id="fade" x1="0" y1="0" x2="1" y2="0"><stop offset="0.24" stop-color="{C["navy"]}" stop-opacity="0"/>'
            f'<stop offset="0.6" stop-color="{C["navy"]}" stop-opacity="0.94"/></linearGradient>')
    out = [f'<defs>{defs}{sd}{fade}</defs>'] + p + [sg, f'<rect width="{W}" height="{H}" fill="url(#fade)"/>']
    # giant outlined numeral + rhombus point
    dd, a = txt.text('02', 0, 0, 360, w=250, track=-0.05)
    out.append(f'<path d="{dd}" transform="translate(820 470)" fill="none" stroke="{C["ice"]}" stroke-opacity="0.55" stroke-width="1.5"/>')
    r = 360 * B.DOT_R * 0.9
    out.append(f'<path fill="{C["azure"]}" d="{rhombus(820 + a + 4 + r, 470, r)}"/>')
    out.append(f'<path fill="{C["glut"]}" d="{rhombus(826, 560, 6)}"/>')
    t, _ = mono('KAPITEL 02  /  BETRIEB', 846, 559, 15, C['ice'], track=0.24); out.append(t)
    t, _ = sans('Was läuft,', 816, 660, 84, C['ink'], w=600, track=-0.045); out.append(t)
    t, _ = sans('bleibt gepflegt.', 816, 752, 84, C['azure'], w=600, track=-0.045); out.append(t)
    t, _ = mono('08 / 24', W - M, 850, 14, C['muted'], track=0.2, anchor='end'); out.append(t)
    t, _ = mono('EDGEPORTAL  ·  ARGUS  ·  COCKPIT', 816, 850, 14, C['muted'], track=0.2); out.append(t)
    out.append(f'<rect width="{W}" height="{H}" filter="url(#grain)"/>')
    write(OUT + 'deck-section.svg', svg(W, H, '  ' + '\n  '.join(out), 'rapold.io – Kapitel', 'Kapitel-Rezept'))


# ---------------------------------------------------------------- CONTENT (light)
def content():
    out = [f'<defs><radialGradient id="lb" cx="1" cy="0" r="0.55"><stop offset="0" stop-color="{C["azure"]}" stop-opacity="0.10"/><stop offset="1" stop-color="{C["azure"]}" stop-opacity="0"/></radialGradient>'
           f'<linearGradient id="bar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="{C["azure"]}"/><stop offset="1" stop-color="{C["lprimary"]}"/></linearGradient></defs>',
           f'<rect width="{W}" height="{H}" fill="{C["paper"]}"/>', f'<rect width="{W}" height="{H}" fill="url(#lb)"/>',
           f'<polygon points="{W - 260},0 {W},0 {W},130" fill="{C["lprimary"]}" fill-opacity="0.06"/>']
    out.append(f'<path fill="{C["lprimary"]}" d="{rhombus(M + 5, 112, 5)}"/>')
    t, _ = mono('02.3  /  BETRIEB  /  VERFÜGBARKEIT', M + 22, 112, 14, C['lprimary'], track=0.22); out.append(t)
    t, _ = headline('99,97 % Verfügbarkeit über alle Produkte.', M - 3, 190, 56, C['link'], C['lglut'], track=-0.035); out.append(t)
    t, _ = sans('Ein Ausfall von 13 Minuten im September – automatisch erkannt, behoben vor dem ersten Ticket.', M, 240, 22, C['lmuted']); out.append(t)
    # hero card with folded corner
    x, y, w, h = M, 312, 600, 420
    out.append(f'<path d="M {x + 16} {y} H {x + w - 16} Q {x + w} {y} {x + w} {y + 16} V {y + h} H {x + 36} L {x} {y + h - 18} V {y + 16} Q {x} {y} {x + 16} {y} Z" fill="#FFFFFF" stroke="{C["lline"]}"/>')
    out.append(f'<path d="M {x} {y + h - 18} L {x + 36} {y + h} L {x + 36} {y + h - 18} Z" fill="{C["lfacet"]}" fill-opacity="0.5"/>')
    t, _ = mono('UPTIME  ·  Q3 2026', x + 36, y + 56, 14, C['lmuted'], track=0.22); out.append(t)
    t, a = sans('99,97', x + 30, y + 250, 184, C['lprimary'], w=600, track=-0.055); out.append(t)
    t, _ = sans('%', x + 30 + a + 18, y + 250, 64, C['lprimary'], w=500, track=0); out.append(t)
    t, _ = sans('Ziel 99,9 %  ·  +0,05 Pp. ggü. Q2', x + 36, y + 312, 22, C['link'], w=500); out.append(t)
    out.append(f'<line x1="{x + 36}" y1="{y + 348}" x2="{x + w - 36}" y2="{y + 348}" stroke="{C["lline"]}"/>')
    t, _ = mono('BEISPIELDATEN  ·  QUELLE: ARGUS, 01.07.–30.09.2026', x + 36, y + 384, 14, C['lmuted'], track=0.16); out.append(t)
    # bars with 1:0.5 facet cut tops
    vals = [('AI FABRIC', 99.99), ('ARGUS', 99.98), ('ÆON LEARN', 99.95), ('EDGEPORTAL', 99.96), ('ATLAS', 100.00)]
    bx0, by0, bh, bw, gap = 776, 732, 340, 120, 32
    t, _ = mono('UPTIME IN %  ·  ACHSE AB 99,80', bx0, 350, 14, C['lmuted'], track=0.16); out.append(t)
    for i, (lab, v) in enumerate(vals):
        bx = bx0 + i * (bw + gap)
        top = by0 - (v - 99.8) / 0.2 * bh
        cut = bw * 0.5 * 0.25
        out.append(f'<path d="M {bx} {by0} V {top + cut:.1f} L {bx + bw} {top:.1f} V {by0} Z" fill="url(#bar)"/>')
        out.append(f'<path d="M {bx} {top + cut:.1f} L {bx + bw} {top:.1f}" stroke="{C["ice"]}" stroke-width="3"/>')
        t, _ = sans(f'{v:.2f}'.replace('.', ','), bx, top - 16, 24, C['link'], w=600, track=-0.02); out.append(t)
        t, _ = mono(lab, bx, by0 + 30, 14, C['lmuted'], track=0.16); out.append(t)
    out.append(f'<line x1="{bx0}" y1="{by0}" x2="{bx0 + 5 * bw + 4 * gap}" y2="{by0}" stroke="{C["lline"]}"/>')
    # footer
    out.append(f'<line x1="{M}" y1="808" x2="{W - M}" y2="808" stroke="{C["link"]}" stroke-opacity="0.12"/>')
    out.append(f'<line x1="{M}" y1="808" x2="{M + 96}" y2="808" stroke="{C["lprimary"]}" stroke-width="2"/>')
    g, _ = small_lockup(M, 852, 22, 'light'); out.append(g)
    t, _ = mono('RAPOLD.IO  ·  MANAGEMENT REVIEW Q4 2026', 420, 850, 14, C['lmuted'], track=0.2); out.append(t)
    t, _ = mono('14 / 24', W - M, 850, 14, C['lmuted'], track=0.2, anchor='end'); out.append(t)
    write(OUT + 'deck-content.svg', svg(W, H, '  ' + '\n  '.join(out), 'rapold.io – Inhalt hell', 'Inhalts-Rezept'))


# ---------------------------------------------------------------- CLOSING
def closing():
    defs, p = stage(bloom_cx=0.5, bloom_cy=0.36, warm=(0.5, 0.075, 0.12), grid_c=(0.5, 0.4))
    s = 1.55
    mw = (B.INK[2] - B.INK[0]) * s
    sd, sg = supergraphic(W / 2 - (B.INK[0] + (B.INK[2] - B.INK[0]) / 2) * s, 70 - B.INK[1] * s, s, 'cl')
    out = [f'<defs>{defs}{sd}</defs>'] + p + [sg]
    # statement, centred
    _, a1 = sans('Gebaut. Betrieben.', 0, 0, 72, C['ink'], w=600, track=-0.045)
    t, _ = sans('Gebaut. Betrieben.', W / 2, 512, 72, C['ink'], w=600, track=-0.045, anchor='middle'); out.append(t)
    _, a2 = headline('Unter einem Dach.', 0, 0, 72, C['azure'], C['glut'], track=-0.045)
    t, _ = headline('Unter einem Dach.', W / 2 - a2 / 2, 596, 72, C['azure'], C['glut'], track=-0.045); out.append(t)
    g, a = small_lockup(0, 0, 30)
    g, a = small_lockup(W / 2 - a / 2, 700, 30); out.append(g)
    t, _ = mono('MARCEL@RAPOLD.IO  ·  RAPOLD.IO  ·  MARCEL.RAPOLD.IO', W / 2, 760, 14, C['muted'], track=0.22, anchor='middle'); out.append(t)
    out.append(f'<line x1="{M}" y1="808" x2="{W - M}" y2="808" stroke="#FFFFFF" stroke-opacity="0.12"/>')
    for i, pid in enumerate(FAMILY):
        out.append(signet_g(pid, W / 2 - (10 * 40 + 9 * 20) / 2 + i * 60, 828, 40, C['azure'], C['ice'], op=0.85))
    out.append(f'<rect width="{W}" height="{H}" filter="url(#grain)"/>')
    write(OUT + 'deck-closing.svg', svg(W, H, '  ' + '\n  '.join(out), 'rapold.io – Schluss', 'Schluss-Rezept'))


def build():
    cover(); section(); content(); closing()
