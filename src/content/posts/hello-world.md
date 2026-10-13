---
title: Hello, world
description: Welcome to Ethanet.XYZ — what this blog is for and what's coming up.
pubDate: 2026-10-13
updatedDate: ''
category: open-source
tags:
  - meta
  - astro
heroImage: ''
heroAlt: ''
draft: false
---

Welcome to **Ethanet.XYZ**! This is a hobby blog where I'll be writing up the things I build in my spare time.

## What to expect

- **3D printing** — printer upgrades, slicer profiles, and models worth printing.
- **Home Assistant** — automations, dashboards and the hardware behind them.
- **Open source** — software I'm working on, and the self-hosted tools I rely on.

## How this site works

The site is built with [Astro](https://astro.build) and hosted on GitHub Pages. Posts are plain Markdown files in a Git repo, and I write them through a web-based CMS that commits straight to that repo. Every push triggers a GitHub Actions build and deploy.

```yaml
# A taste of what's coming
automation:
  - alias: Turn off printer when the print finishes
    trigger:
      - platform: state
        entity_id: sensor.printer_status
        to: finished
    action:
      - service: switch.turn_off
        target:
          entity_id: switch.printer_plug
```

Thanks for stopping by!
