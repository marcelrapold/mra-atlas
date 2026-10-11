"""Prepare the supplied Inter and Geist fonts for native reference rendering.

Requires fonttools with WOFF support (``pip install 'fonttools[woff]'``) and
Fontconfig. The converted fonts stay in the local user font cache. Geist is
instanced at fixed weights so LibreOffice does not need variable-font support.
"""

from pathlib import Path
import shutil
import subprocess

from fontTools.ttLib import TTFont
from fontTools.ttLib.woff2 import haveBrotli
from fontTools.varLib.instancer import instantiateVariableFont


REPO_ROOT = Path(__file__).resolve().parents[1]
FONT_CACHE = Path.home() / ".local/share/fonts/framework"
GEIST_SOURCES = (
    ("Geist", "Geist-Variable.woff2", (400, 500, 650, 700)),
    ("Geist Mono", "GeistMono-Variable.woff2", (400, 500)),
)
STYLE_NAMES = {400: "Regular", 500: "Medium", 650: "SemiBold", 700: "Bold"}
# Fontconfig weights are not OpenType usWeightClass values. 650 lies between
# Fontconfig's DemiBold (180) and Bold (200).
FC_WEIGHTS = {300: 50, 400: 80, 500: 100, 650: 190, 700: 200}


def name_static_face(font, family, weight):
    """Retain license records and give each static weight unambiguous names."""
    style = STYLE_NAMES[weight]
    is_bold = weight >= 700
    # Legacy RIBBI names link Regular/Bold. Other weights get a separate legacy
    # family while typographic family IDs keep all weights under Geist.
    legacy_family = family if weight in (400, 700) else f"{family} {style}"
    postscript = f"{family.replace(' ', '')}-{style}"
    names = {
        1: legacy_family,
        2: "Bold" if is_bold else "Regular",
        3: f"{postscript};static-reference;{weight}",
        4: f"{family} {style}",
        6: postscript,
        16: family,
        17: style,
        21: family,
        22: style,
    }
    renamed_ids = set(names) | {25}  # Variable PostScript prefix is obsolete.
    font["name"].names = [record for record in font["name"].names if record.nameID not in renamed_ids]
    for name_id, value in names.items():
        font["name"].setName(value, name_id, 3, 1, 0x409)
        font["name"].setName(value, name_id, 1, 0, 0)
    font["OS/2"].usWeightClass = weight
    selection = font["OS/2"].fsSelection & ~((1 << 0) | (1 << 5) | (1 << 6))
    font["OS/2"].fsSelection = selection | ((1 << 5) if is_bold else (1 << 6))
    font["head"].macStyle = (font["head"].macStyle & ~3) | int(is_bold)
    # The explicit static names replace variable axis labels. An original
    # digital signature, if supplied, cannot describe modified font tables.
    for table in ("STAT", "DSIG"):
        if table in font:
            del font[table]


def save_static(font, destination):
    if "fvar" in font:
        raise RuntimeError(f"Unpinned variation axes in {destination.name}")
    font.flavor = None
    font.recalcTimestamp = False
    font.save(destination)


def main():
    if not haveBrotli:
        raise SystemExit("WOFF2 decoding requires Brotli. Install: python -m pip install 'fonttools[woff]'")
    for command in ("fc-cache", "fc-match"):
        if not shutil.which(command):
            raise SystemExit(f"{command} is required to install and verify the reference fonts.")

    inter_dir = REPO_ROOT / "node_modules/@fontsource/inter/files"
    geist_dir = REPO_ROOT / "brands/rapold/assets/fonts"
    required = [inter_dir / f"inter-latin-{weight}-normal.woff" for weight in (300, 400, 700)]
    required += [geist_dir / filename for _, filename, _ in GEIST_SOURCES]
    for source in required:
        if not source.is_file():
            raise SystemExit(f"Required font source is missing: {source}")

    FONT_CACHE.mkdir(parents=True, exist_ok=True)
    prepared = []
    for weight in (300, 400, 700):
        with TTFont(inter_dir / f"inter-latin-{weight}-normal.woff", recalcTimestamp=False) as font:
            destination = FONT_CACHE / f"Inter-{weight}.ttf"
            save_static(font, destination)
            # The supplied 300 face is named "Inter Light". Preserve that
            # original family instead of changing the existing Inter inputs.
            family = font["name"].getDebugName(16) or font["name"].getDebugName(1)
            prepared.append((family, weight, destination))

    for family, filename, weights in GEIST_SOURCES:
        with TTFont(geist_dir / filename, recalcTimestamp=False) as variable:
            axes = {axis.axisTag: axis for axis in variable["fvar"].axes}
            if "wght" not in axes:
                raise RuntimeError(f"Weight axis missing in {filename}")
            for weight in weights:
                if not axes["wght"].minValue <= weight <= axes["wght"].maxValue:
                    raise RuntimeError(f"Weight {weight} is outside the range of {filename}")
                # Freeze every axis, including any future non-weight axes.
                location = {tag: axis.defaultValue for tag, axis in axes.items()}
                location["wght"] = weight
                font = instantiateVariableFont(variable, location, inplace=False, updateFontNames=False)
                name_static_face(font, family, weight)
                destination = FONT_CACHE / f"{family.replace(' ', '')}-{weight}.ttf"
                save_static(font, destination)
                font.close()
                prepared.append((family, weight, destination))

    subprocess.run(["fc-cache", "-f", str(FONT_CACHE)], check=True)
    for family, weight, expected in prepared:
        pattern = f"{family}:weight={FC_WEIGHTS[weight]}"
        selected = subprocess.check_output(["fc-match", "--format=%{file}", pattern], text=True).strip()
        if Path(selected).resolve() != expected.resolve():
            raise RuntimeError(f"Font fallback for {pattern}: {selected}; expected {expected}")
        print(f"{family} {weight}: {expected.name} (Fontconfig resolved)")
    print(f"Prepared {len(prepared)} static faces in {FONT_CACHE}")


if __name__ == "__main__":
    main()
