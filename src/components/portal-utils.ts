import type { PortalKey } from '../types.js'

type PortalKeyInput = PortalKey | undefined

export function resolvePortalKey(component: string, value: PortalKeyInput): string {
    if (typeof value === 'string') {
        const trimmed = value.trim()
        if (trimmed.length > 0) return trimmed
    }

    if (typeof value === 'number' && Number.isFinite(value)) {
        return String(value)
    }

    if (typeof value === 'bigint') {
        return value.toString()
    }

    throw new Error(`[astro-portal] ${component} requires a non-empty \`key\` prop.`)
}
