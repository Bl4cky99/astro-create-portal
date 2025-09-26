import { createComponent } from 'astro/runtime/server/astro-component.js'
import { renderSlotToString } from 'astro/runtime/server/render/slot.js'
import { renderTemplate } from 'astro/runtime/server/render/astro/render-template.js'
import { resolvePortalKey } from './portal-utils.js'

import type { PortalComponent, PortalKey, PortalProps } from '../types.js'

const component = createComponent(async (result, props: PortalProps, slots) => {
    const key = resolvePortalKey('Portal', props?.key)
    const content = await renderSlotToString(result, slots?.default)
    return renderTemplate`<template data-astro-portal-source="${key}">${content ?? ''}</template>`
}) as PortalComponent

export default component
