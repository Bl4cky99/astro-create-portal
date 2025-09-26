import type { AstroIntegration } from "astro"

import { PORTAL_RUNTIME } from "./runtime.js"

const HEAD_PORTAL_SELECTOR = 'template[data-head-portal]'
const PORTAL_TARGET_SELECTOR = 'template[data-astro-portal-target]'
const PORTAL_SOURCE_SELECTOR = 'template[data-astro-portal-source]'
const SUPPORTED_HEAD_TAGS = new Set(['meta', 'link', 'script', 'style', 'title', 'base'])

type BuildPage = { pathname: string }

type DomEnvironment = {
    Element: typeof Element
    HTMLTemplateElement: typeof HTMLTemplateElement
}

type PortalMarkers = Map<string, Comment>

export default function headPortal(): AstroIntegration {
    return {
        name: 'astro-head-portal',
        hooks: {
            'astro:config:setup'({ injectScript, updateConfig }) {
                injectScript('page', `if (import.meta.env.DEV) { ${PORTAL_RUNTIME} }`)
                updateConfig({
                    vite: {
                        ssr: {
                            noExternal: ['astro-portal']
                        }
                    }
                })
            },
            async 'astro:build:done'({ dir, pages }) {
                await transformStaticOutput(dir, pages)
            }
        }
    }
}

async function transformStaticOutput(dir: URL, pages: BuildPage[]): Promise<void> {
    if (pages.length === 0) return

    const [{ readFile, writeFile }, { JSDOM }] = await Promise.all([
        import('node:fs/promises'),
        import('jsdom')
    ])

    for (const { pathname } of pages) {
        const fileUrl = new URL(resolvePagePath(pathname), dir)
        const html = await readFile(fileUrl, 'utf8')
        const dom = new JSDOM(html)

        processDocument(dom.window.document, dom.window)
        await writeFile(fileUrl, dom.serialize(), 'utf8')
    }
}

function processDocument(document: Document, env: DomEnvironment): void {
    hoistHeadPortals(document, env)
    resolvePortals(document, env)
}

function hoistHeadPortals(document: Document, env: DomEnvironment): void {
    forEachTemplate(document, env, HEAD_PORTAL_SELECTOR, (template) => {
        const fragment = template.content.cloneNode(true)
        for (const node of Array.from(fragment.childNodes)) {
            if (!isElementNode(node, env)) continue
            moveNodeToHead(document, node)
        }

        template.remove()
    })

    dedupeHead(document)
}

function resolvePortals(document: Document, env: DomEnvironment): void {
    const targets = collectPortalTargets(document, env)
    if (targets.size === 0) return

    forEachTemplate(document, env, PORTAL_SOURCE_SELECTOR, (template) => {
        const key = template.getAttribute('data-astro-portal-source')
        if (!key) return

        const marker = targets.get(key)
        if (!marker || !marker.parentNode) return

        const fragment = template.content.cloneNode(true)
        marker.parentNode.insertBefore(fragment, marker)
        template.remove()
    })

    for (const marker of targets.values()) {
        if (marker.parentNode) {
            marker.remove()
        }
    }
}

function collectPortalTargets(document: Document, env: DomEnvironment): PortalMarkers {
    const targets: PortalMarkers = new Map()

    forEachTemplate(document, env, PORTAL_TARGET_SELECTOR, (template) => {
        const key = template.getAttribute('data-astro-portal-target')
        if (!key || targets.has(key)) return

        const marker = document.createComment(`astro-portal:${key}`)
        template.replaceWith(marker)
        targets.set(key, marker)
    })

    return targets
}

function forEachTemplate(
    document: Document,
    env: DomEnvironment,
    selector: string,
    callback: (template: HTMLTemplateElement) => void
): void {
    document.querySelectorAll(selector).forEach((node) => {
        if (node instanceof env.HTMLTemplateElement) {
            callback(node)
        }
    })
}

function isElementNode(node: Node, env: DomEnvironment): node is Element {
    return node instanceof env.Element
}

function moveNodeToHead(document: Document, node: Element): void {
    const tag = node.tagName.toLowerCase()
    if (!SUPPORTED_HEAD_TAGS.has(tag)) return

    if (tag === 'title') {
        document.head.querySelector('title')?.remove()
    }

    document.head.appendChild(node)
}

function dedupeHead(document: Document): void {
    const seen = new Set<string>()
    const titles = Array.from(document.head.querySelectorAll('title'))

    if (titles.length > 1) {
        titles.slice(0, -1).forEach((title) => title.remove())
    }

    for (const element of Array.from(document.head.children)) {
        if (element.tagName === 'TITLE') continue

        const key = createElementKey(element)
        if (seen.has(key)) {
            element.remove()
        } else {
            seen.add(key)
        }
    }
}

function createElementKey(element: Element): string {
    switch (element.tagName) {
        case 'TITLE':
            return 'title'
        case 'META':
            return createMetaKey(element)
        case 'LINK':
            return `link:${element.getAttribute('rel')}:${element.getAttribute('href')}`
        case 'SCRIPT':
            return `script:${element.getAttribute('src') ?? 'inline'}`
        case 'STYLE':
            return `style:${element.textContent ?? ''}`
        default:
            return `${element.tagName}:${element.outerHTML}`
    }
}

function createMetaKey(element: Element): string {
    const name = element.getAttribute('name')
    const property = element.getAttribute('property')
    const charset = element.getAttribute('charset')
    const httpEquiv = element.getAttribute('http-equiv')

    if (charset) return 'meta:charset'
    if (name) return `meta:name:${name}`
    if (property) return `meta:property:${property}`
    if (httpEquiv) return `meta:http:${httpEquiv}`

    return `meta:${element.getAttribute('content') ?? ''}`
}

function resolvePagePath(pathname: string): string {
    if (!pathname || pathname === '/') return 'index.html'
    return pathname.replace(/^\//, '')
}

export { default as HeadPortal } from './components/head-portal-component.js'
export { default as CreatePortal } from './components/create-portal-component.js'
export { default as Portal } from './components/portal-component.js'
export type {
    HeadPortalProps,
    HeadPortalComponent,
    CreatePortalProps,
    CreatePortalComponent,
    PortalKey,
    PortalProps,
    PortalComponent,
    TypedAstroComponent
} from './types.js'
