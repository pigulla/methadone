import z from 'zod'

// This needs to match the directory names in /src
const COMPONENT = {
  APPLICATION: 'application',
  DOMAIN: 'domain',
  PRESENTATION: 'presentation',
  INFRASTRUCTURE: 'infrastructure',
  MODULE: 'module',
  UTIL: 'util',
} as const
export type Component = keyof typeof COMPONENT

// This needs to match the file suffixes except for the trailing "s",
// e.g., "interfaces" will be mapped to  "*.interface.ts".
const EXCEPTION = {
  ERRORS: 'errors',
  INTERFACES: 'interfaces',
  CONFIGS: 'configs',
} as const
export type Exception = keyof typeof EXCEPTION

const componentSchema = z.union(
  Object.values(COMPONENT).map(value => z.literal(value).transform(value => value as Component)),
)

const exceptionSchema = z.union(
  Object.values(EXCEPTION).map(value => z.literal(value).transform(value => value as Exception)),
)

const ruleSchema = z.strictObject({
  mustNotImportFrom: z
    .union([componentSchema, z.array(componentSchema)])
    .transform<Set<Component>>(value => new Set(Array.isArray(value) ? value : [value])),
  exceptFor: z
    .union([exceptionSchema, z.array(exceptionSchema)])
    .optional()
    .default([])
    .transform(value => new Set(Array.isArray(value) ? value : [value])),
  ignoringErrorsIn: z
    .union([z.string(), z.array(z.string())])
    .transform(value => (Array.isArray(value) ? value : [value]))
    .transform(values => new Set(values))
    .optional()
    .default(new Set()),
})

export const rulesSchema = z.record(componentSchema, z.array(ruleSchema))

export type Rule = z.infer<typeof ruleSchema>
