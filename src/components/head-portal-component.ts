import { createComponent } from 'astro/runtime/server/astro-component.js'
import { renderSlotToString } from 'astro/runtime/server/render/slot.js'
import { renderTemplate } from 'astro/runtime/server/render/astro/render-template.js'

import type { HeadPortalComponent, HeadPortalProps } from '../types.js'

const component = createComponent(async (result, _props: HeadPortalProps, slots) => {
    const content = await renderSlotToString(result, slots?.default)
    return renderTemplate`<template data-head-portal>${content ?? ''}</template>`
}) as HeadPortalComponent

export default component
