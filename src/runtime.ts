export const PORTAL_RUNTIME = `
(function() {
  const HEAD_TEMPLATE_SELECTOR = 'template[data-head-portal]';
  const PORTAL_TARGET_SELECTOR = 'template[data-astro-portal-target]';
  const PORTAL_SOURCE_SELECTOR = 'template[data-astro-portal-source]';
  const SUPPORTED_HEAD_TAGS = new Set(['meta', 'link', 'script', 'style', 'title', 'base']);

  const getMetaKey = (el) => {
    const name = el.getAttribute('name');
    const property = el.getAttribute('property');
    const charset = el.getAttribute('charset');
    const httpEquiv = el.getAttribute('http-equiv');

    if (charset) return 'meta:charset';
    if (name) return 'meta:name:' + name;
    if (property) return 'meta:property:' + property;
    if (httpEquiv) return 'meta:http:' + httpEquiv;
    return 'meta:' + (el.getAttribute('content') ?? '');
  };

  const getElementKey = (el) => {
    switch (el.tagName) {
      case 'TITLE':
        return 'title';
      case 'META':
        return getMetaKey(el);
      case 'LINK':
        return 'link:' + el.getAttribute('rel') + ':' + el.getAttribute('href');
      case 'SCRIPT':
        return 'script:' + (el.getAttribute('src') ?? 'inline');
      case 'STYLE':
        return 'style:' + (el.textContent ?? '');
      default:
        return el.tagName + ':' + el.outerHTML;
    }
  };

  const moveNodeToHead = (node) => {
    if (!(node instanceof Element)) return;

    const tag = node.tagName.toLowerCase();
    if (!SUPPORTED_HEAD_TAGS.has(tag)) return;

    if (tag === 'title') {
      const existing = document.head.querySelector('title');
      if (existing) existing.remove();
    }

    document.head.appendChild(node);
  };

  const dedupeHead = () => {
    const seen = new Set();
    const titles = Array.from(document.head.querySelectorAll('title'));

    if (titles.length > 1) {
      titles.slice(0, -1).forEach((el) => el.remove());
    }

    Array.from(document.head.children).forEach((el) => {
      if (el.tagName === 'TITLE') return;

      const key = getElementKey(el);
      if (seen.has(key)) {
        el.remove();
      } else {
        seen.add(key);
      }
    });
  };

  const processHeadPortals = () => {
    document.querySelectorAll(HEAD_TEMPLATE_SELECTOR).forEach((template) => {
      if (!(template instanceof HTMLTemplateElement)) return;

      const fragment = template.content.cloneNode(true);
      Array.from(fragment.childNodes).forEach((node) => moveNodeToHead(node));
      template.remove();
    });

    dedupeHead();
  };

  const collectPortalTargets = (documentRef) => {
    const targets = new Map();

    documentRef.querySelectorAll(PORTAL_TARGET_SELECTOR).forEach((template) => {
      if (!(template instanceof HTMLTemplateElement)) return;

      const key = template.getAttribute('data-astro-portal-target');
      if (!key) return;

      const marker = documentRef.createComment('astro-portal:' + key);
      template.replaceWith(marker);
      targets.set(key, marker);
    });

    return targets;
  };

  const processPortals = (documentRef) => {
    const targets = collectPortalTargets(documentRef);
    if (targets.size === 0) return;

    documentRef.querySelectorAll(PORTAL_SOURCE_SELECTOR).forEach((template) => {
      if (!(template instanceof HTMLTemplateElement)) return;

      const key = template.getAttribute('data-astro-portal-source');
      if (!key) return;

      const marker = targets.get(key);
      if (!marker || !marker.parentNode) return;

      const fragment = template.content.cloneNode(true);
      marker.parentNode.insertBefore(fragment, marker);
      template.remove();
    });

    targets.forEach((marker) => {
      if (marker.parentNode) {
        marker.remove();
      }
    });
  };

  const processTemplates = () => {
    processHeadPortals();
    processPortals(document);
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', processTemplates, { once: true });
  } else {
    processTemplates();
  }

  document.addEventListener('astro:page-load', processTemplates);
})();
`;
