# -*- coding: utf-8 -*-
"""Generates the palette-exploration artboards.

Every type, spacing and radius value below is lifted from app/tokens.css so the
artboards are indistinguishable from the shipped components:
  --fs-label .6875rem / lh 1.30 / ls .14em    --fs-body 1.0625rem / lh 1.60
  --fs-mega  lh .82 / ls -.045em              --fs-h2 lh 1.08 / ls -.022em
  metric value: Geist Mono 700, tabular-nums   --radius-md 4px
Only the palette varies between files.
"""
import io

PALETTES = [
    dict(
        file="Current.dc.html", tag="CURRENT", name="Lime on neutral black",
        motive="What is shipped today: a saturated lime plus amber plus cyan on a neutral near-black. Three high-chroma accents competing on a default dark-mode base is the combination that reads as generated.",
        bg="#08090B", raised="#101318", inset="#040507",
        text="#EDF1F5", sec="#A7B0BC", mut="#7C8695",
        signal="#C6F24E", null="#FF9A4D", trace="#6FD3FF",
        line="rgba(237,241,245,0.09)", line2="rgba(237,241,245,0.16)",
    ),
    dict(
        file="Main.dc.html", tag="OPTION A", name="Archive",
        motive="Warm ink and bone. Brass carries a confirmed result, clay a refuted one, and every accent sits at one shared chroma. The portrait's cream dots are already this temperature, so it needs no recolouring. Tradeoff: brass can drift toward luxury-brand if it spreads beyond verdicts.",
        bg="#0E0C09", raised="#1A1713", inset="#080604",
        text="#EAE5DD", sec="#AEA8A0", mut="#8C877F",
        signal="#C8AE71", null="#E19F8A", trace="#9BB4CE",
        line="rgba(234,229,221,0.09)", line2="rgba(234,229,221,0.16)",
    ),
    dict(
        file="Instrument.dc.html", tag="OPTION B", name="Instrument",
        motive="Cool blue-black and steel. Reads as a measurement device — the most legible fit for the quant audience. Tradeoff: blue-on-dark is the default serious-tech palette, so it is the least distinctive of the three, and the warm portrait needs tinting to sit in it.",
        bg="#090D11", raised="#13181D", inset="#04070A",
        text="#E4E8ED", sec="#A5ACB2", mut="#82888F",
        signal="#7DBADA", null="#DAA483", trace="#92BAB7",
        line="rgba(228,232,237,0.09)", line2="rgba(228,232,237,0.16)",
    ),
    dict(
        file="Graphite.dc.html", tag="OPTION C", name="Graphite",
        motive="Colour almost withdrawn. Typography and spacing carry the page; an accent appears only where a result has a verdict. Tradeoff: the most restrained and the least memorable — it risks reading as under-designed rather than confident.",
        bg="#0C0C0D", raised="#171719", inset="#060607",
        text="#EBEBED", sec="#ACACAF", mut="#87878B",
        signal="#99C1A6", null="#D8A99F", trace="#A7B8CA",
        line="rgba(235,235,237,0.09)", line2="rgba(235,235,237,0.16)",
    ),
]

MONO = "'Geist Mono', ui-monospace, monospace"

TPL = u"""<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <script src="./support.js"></script>
</head>
<body>
<x-dc>
<helmet>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500;700&display=swap">
  <style>
    body { margin: 0; background: %(bg)s; font-family: "Geist", system-ui, sans-serif; }
    a { color: %(signal)s; text-decoration: none; }
    a:hover { color: %(text)s; }
  </style>
</helmet>
<div style="width: 960px; height: 720px; background: %(bg)s; color: %(sec)s; display: flex; flex-direction: column; padding: 32px 40px; box-sizing: border-box; gap: 26px;">

  <div style="display: flex; align-items: baseline; gap: 12px; border-bottom: 1px solid %(line)s; padding-bottom: 14px;">
    <span style="font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(signal)s;">%(tag)s</span>
    <span style="font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(text)s;">%(name)s</span>
    <span style="flex-grow: 1;"></span>
    <span style="font-family: %(mono)s; font-size: 11px; letter-spacing: 0.06em; color: %(mut)s;">%(bg)s base</span>
  </div>

  <div style="display: flex; gap: 40px; align-items: flex-start;">
    <div style="display: flex; flex-direction: column; gap: 18px; flex-grow: 1;">

      <div style="display: flex; align-items: center; gap: 12px; font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(mut)s;">
        <span>Arizona State University</span>
        <span style="width: 3px; height: 3px; border-radius: 50%%; background: %(mut)s;"></span>
        <span>CS 2028</span>
      </div>

      <h1 style="margin: 0; font-size: 94px; font-weight: 700; line-height: 0.82; letter-spacing: -0.045em; color: %(text)s; display: flex; flex-direction: column;">
        <span>Hill</span>
        <span>Sudani</span>
      </h1>

      <div style="display: flex; align-items: center; gap: 12px; font-size: 19px; line-height: 1.5; letter-spacing: -0.005em; color: %(text)s;">
        <span style="display: block; width: 48px; height: 1px; background: %(signal)s; flex-shrink: 0;"></span>
        <span>ML systems / quant research</span>
      </div>

      <p style="margin: 0; max-width: 46ch; font-size: 17px; line-height: 1.6; color: %(sec)s; text-wrap: pretty;">Four projects, one line of work &#8212; from a hand-derived gradient to a circuit inside a pretrained model. The negative results are the load-bearing ones.</p>

      <div style="display: flex; align-items: center; gap: 20px; margin-top: 4px;">
        <span style="display: inline-flex; align-items: center; gap: 8px; padding: 12px 22px; border-radius: 4px; background: %(signal)s; color: %(bg)s; font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase;">
          Follow the arc
          <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v10"></path><path d="M3.5 8.5 8 13l4.5-4.5"></path></svg>
        </span>
        <span style="font-family: %(mono)s; font-size: 11px; letter-spacing: 0.14em; text-transform: uppercase; color: %(mut)s; border-bottom: 1px solid %(line2)s; padding-bottom: 2px;">Available Summer 2027</span>
      </div>
    </div>

    <div style="width: 226px; height: 256px; flex-shrink: 0; border: 1px solid %(line)s; border-radius: 4px; background: %(inset)s; display: flex; align-items: center; justify-content: center;">
      <span style="font-family: %(mono)s; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: %(mut)s; text-align: center; line-height: 1.7;">Particle<br>portrait</span>
    </div>
  </div>

  <div style="display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 24px; padding: 22px; border: 1px solid %(line)s; border-radius: 4px; background: %(raised)s;">
    <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid %(signal)s;">
      <span style="font-family: %(mono)s; font-size: 38px; font-weight: 700; line-height: 1.08; letter-spacing: -0.022em; font-variant-numeric: tabular-nums lining-nums; color: %(signal)s;">97.01%%</span>
      <span style="font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(mut)s;">MNIST test accuracy</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid %(null)s;">
      <span style="font-family: %(mono)s; font-size: 38px; font-weight: 700; line-height: 1.08; letter-spacing: -0.022em; font-variant-numeric: tabular-nums lining-nums; color: %(null)s;">6.04&#215;</span>
      <span style="font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(mut)s;">End-to-end slowdown</span>
    </div>
    <div style="display: flex; flex-direction: column; gap: 8px; padding-top: 12px; border-top: 1px solid %(trace)s;">
      <span style="font-family: %(mono)s; font-size: 38px; font-weight: 700; line-height: 1.08; letter-spacing: -0.022em; font-variant-numeric: tabular-nums lining-nums; color: %(trace)s;">11,256</span>
      <span style="font-family: %(mono)s; font-size: 11px; font-weight: 500; letter-spacing: 0.14em; text-transform: uppercase; color: %(mut)s;">Bridged matmul calls</span>
    </div>
  </div>

  <div style="display: flex; align-items: stretch; border: 1px solid %(line)s; border-radius: 4px; overflow: hidden;">
    <div style="flex-grow: 1; background: %(bg)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(mut)s;">BASE</span><span style="font-family: %(mono)s; font-size: 11px; color: %(text)s;">%(bg)s</span></div>
    <div style="flex-grow: 1; background: %(raised)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(mut)s;">RAISED</span><span style="font-family: %(mono)s; font-size: 11px; color: %(text)s;">%(raised)s</span></div>
    <div style="flex-grow: 1; background: %(signal)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(bg)s; opacity: 0.7;">SIGNAL</span><span style="font-family: %(mono)s; font-size: 11px; color: %(bg)s;">%(signal)s</span></div>
    <div style="flex-grow: 1; background: %(null)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(bg)s; opacity: 0.7;">NULL</span><span style="font-family: %(mono)s; font-size: 11px; color: %(bg)s;">%(null)s</span></div>
    <div style="flex-grow: 1; background: %(trace)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(bg)s; opacity: 0.7;">TRACE</span><span style="font-family: %(mono)s; font-size: 11px; color: %(bg)s;">%(trace)s</span></div>
    <div style="flex-grow: 1.7; background: %(inset)s; padding: 9px 12px; display: flex; flex-direction: column; gap: 3px;"><span style="font-family: %(mono)s; font-size: 9px; letter-spacing: 0.1em; color: %(mut)s;">TEXT &#183; SECONDARY &#183; MUTED</span><span style="font-family: %(mono)s; font-size: 11px; color: %(text)s;">%(text)s <span style="color: %(sec)s;">%(sec)s</span> <span style="color: %(mut)s;">%(mut)s</span></span></div>
  </div>

  <p style="margin: 0; font-size: 13px; line-height: 1.45; color: %(mut)s; max-width: 92ch; text-wrap: pretty;">%(motive)s</p>

</div>
</x-dc>
<script data-dc-script data-props='{"$preview": {"width": 960, "height": 720}}'>
class Component extends DCLogic {
  renderVals() {
    return {};
  }
}
</script>
</body>
</html>
"""

for p in PALETTES:
    p = dict(p)
    p["mono"] = MONO
    src = TPL % p
    io.open(p["file"], "w", encoding="utf-8", newline="\n").write(src)
    print("wrote %s (%d bytes)" % (p["file"], len(src)))
