export type PortalKey = string | number | bigint

export interface HeadPortalProps {
    // no props for head portal
}

export interface CreatePortalProps {
    key: PortalKey
}

export interface PortalProps {
    key: PortalKey
}

type AstroResult = unknown
type AstroSlots = unknown

interface AstroComponentShape<Props> {
    (props: Props): AstroResult
    (result: AstroResult, props: Props, slots: AstroSlots): AstroResult
    isAstroComponentFactory?: boolean
    moduleId?: string
    propagation?: unknown
}

export type TypedAstroComponent<Props> = AstroComponentShape<Props>

export type HeadPortalComponent = TypedAstroComponent<HeadPortalProps>
export type CreatePortalComponent = TypedAstroComponent<CreatePortalProps>
export type PortalComponent = TypedAstroComponent<PortalProps>
