/**
 *
 */

export type ArrayToUnion<T extends readonly string[]> = T[number]

/**
 * Similar to `Partial`, but doesn't allow for the creation of additional properties. In most cases, you do not need this - however sometimes `Partial` will manifest as a weak type (allowing other values through), and when that happens this is a drop-in replacement.
 */
export type StrictPartial<Target, Self> = {
    [Key in keyof Self]: Key extends keyof Target
        ? StrictPartial<Self[Key], Target[Key]>
        : Self extends Record<string, Target>
          ? StrictPartial<Self[Key], Target>
          : never
}

export type AllowReturningFunctionsForPropertyValues<T> = {
    [K in keyof T]: T[K] | (() => T[K] | Promise<T[K]>)
}

export type Replace<
    String extends string,
    From extends string,
    To extends string
> = String extends `${infer Prefix}${From}${infer Suffix}` ? `${Prefix}${To}${Replace<Suffix, From, To>}` : String
