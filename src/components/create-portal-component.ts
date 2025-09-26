import { createComponent } from 'astro/runtime/server/astro-component.js'
import { renderTemplate } from 'astro/runtime/server/render/astro/render-template.js'

import type { CreatePortalComponent, CreatePortalProps } from '../types.js'
import { resolvePortalKey } from './portal-utils.js'

const component = createComponent(async (_result, props: CreatePortalProps) => {
    const key = resolvePortalKey('CreatePortal', props?.key)
    return renderTemplate`<template data-astro-portal-target="${key}"></template>`
}) as CreatePortalComponent

export default component
