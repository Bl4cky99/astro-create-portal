<a id="readme-top"></a>

<br />
<div align="center">
    <a href="https://github.com/Bl4cky99/astro-portal">
        <img src="README_ASSETS/logo.png" width="600">
    </a>
    <h3>astro-portal</h3>
    <p align="center">
        Headless portal primitives for <b>Astro 5+</b> that let you declaratively project markup into the document head and anywhere else in the DOM during SSR and static builds.
        <br/>
        Inspired by React's <code>createPortal</code>, reimagined for Astro's hybrid architecture.
        <br/><br/>
        <a href="https://github.com/Bl4cky99/astro-portal/issues/new?template=bug_report.yml">Report Bug</a>
        &middot;
        <a href="https://github.com/Bl4cky99/astro-portal/issues/new?template=feature_request.yml">Request Feature</a>
        <br/><br/>
    </p>
</div>

<details>
<summary>Table of Contents</summary>
<ol>
  <li><a href="#features">Features</a></li>
  <li><a href="#installation">Installation</a></li>
  <li><a href="#quickstart">Quickstart</a></li>
  <li><a href="#components">Components</a>
    <ul>
      <li><a href="#component-head-portal">HeadPortal</a></li>
      <li><a href="#component-create-portal">CreatePortal</a></li>
      <li><a href="#component-portal">Portal</a></li>
    </ul>
  </li>
  <li><a href="#runtime">Runtime behaviour</a></li>
  <li><a href="#build">Build integration</a></li>
  <li><a href="#example">Example (Astro)</a></li>
  <li><a href="#faq">FAQ</a></li>
  <li><a href="#contributing">Contributing</a></li>
  <li><a href="#license">License</a></li>
</ol>
</details>

---

## <span id="features">Features</span>

- **SSR & static ready**: works during `astro dev`, hybrid SSR, and fully static builds without custom scripts.
- **Head deduplication**: merges `<meta>`, `<link>`, `<script>`, and `<style>` tags by computed keys so only the latest unique entry survives.
- **Keyed portals**: reuse `CreatePortal` and `Portal` to bridge markup between distant parts of the DOM using a shared key.
- **No hydration overhead**: all components render to `<template>` tags and execute lightweight client-side runtime only when necessary.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="installation">Installation</span>

Install with your preferred package manager. The package declares Astro as a peer dependency (>= 5).

```bash
npm install astro-portal
# or
pnpm add astro-portal
# or
bun add astro-portal
```

Once installed, register the integration in `astro.config.mjs`:

```ts
import astroPortal from 'astro-portal';

export default defineConfig({
  integrations: [astroPortal()],
});
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="quickstart">Quickstart</span>

1. Add `<HeadPortal>` inside your page/component to push markup into the document head.
2. Use `<CreatePortal key="..." />` to define a target location.
3. Render `<Portal key="...">...</Portal>` elsewhere to project content to that target.

The runtime script is injected automatically in development; during builds, markup is hoisted and deduplicated ahead of time.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="components">Components</span>

### <span id="component-head-portal">HeadPortal</span>

Wrap any head-friendly markup in `<HeadPortal>` to duplicate the rendered output into the `<head>` element. Supports `<title>`, `<meta>`, `<link>`, `<style>`, `<script>`, and `<base>` tags. Duplicate entries are eliminated based on deterministic keys.

### <span id="component-create-portal">CreatePortal</span>

`<CreatePortal key="sidebar" />` declares a named insertion point. At build time it is replaced with a comment marker, and during hydration-free runtime the first matching marker receives the projected content.

### <span id="component-portal">Portal</span>

`<Portal key="sidebar">...children...</Portal>` moves its slot content to the matching `CreatePortal` marker. The move happens after `DOMContentLoaded` and on every `astro:page-load` navigation in dev/SPA modes.

Each component validates the `key` prop (string/number/bigint) and throws an informative error if it is missing or empty.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="runtime">Runtime behaviour</span>

- Injected only in development: the runtime script scans for `<template>` markers and performs DOM moves without hydration islands.
- On first render and on SPA navigations (`astro:page-load`), head portals are hoisted before ordinary portals resolve.
- `document.head` entries are deduplicated by tag type and identifying attributes (`name`, `property`, `rel`, `href`, etc.), ensuring predictable metadata.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="build">Build integration</span>

During `astro build`, the integration:

1. Loads each generated HTML page with JSDOM.
2. Hoists `<HeadPortal>` markup into `<head>` and deduplicates entries.
3. Resolves keyed portals by cloning their content into the corresponding marker position.
4. Writes the transformed HTML back to disk so no client runtime is needed for static hosting.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="example">Example (Astro)</span>

```astro
---
import { HeadPortal, CreatePortal, Portal } from 'astro-portal';
---

<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Portal Demo</title>
  </head>
  <body>
    <HeadPortal>
      <title>Contact</title>
      <meta name="description" content="Reach out to the team" />
      <link rel="canonical" href="https://example.com/contact" />
    </HeadPortal>

    <CreatePortal key="footer-contact" />

    <main>
      <h1>Welcome</h1>
      <Portal key="footer-contact">
        <aside>
          <h2>Contact</h2>
          <p>Email us at hello@example.com</p>
        </aside>
      </Portal>
    </main>
  </body>
</html>
```

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="faq">FAQ</span>

**Is this inspired by React's `createPortal`?**  
Yes! The API and keyed approach take cues from React's portal primitives, reworked to align with Astro's server-first rendering and static output pipeline.

**Do portals support multiple targets with the same key?**  
Only the first `CreatePortal` with a given key is used. Define unique keys for each target.

**Can I portal into the `<head>`?**  
Use `<HeadPortal>` for head content. Regular portals operate within the document body.

**Does it work with view transitions or SPA mode?**  
Yes. The runtime reprocesses templates on `astro:page-load`, covering client-side navigations.

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

## <span id="license">License</span>

This project is licensed under the **MIT License**.

- Copyright (c) 2025 [Jason Giese (Bl4cky99)](https://github.com/Bl4cky99)
- See the full text in [LICENSE](./LICENSE).

<p align="right">(<a href="#readme-top">back to top</a>)</p>

---

Happy portaling!
