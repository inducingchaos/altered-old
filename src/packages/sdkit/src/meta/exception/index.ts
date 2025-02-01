/**
 *
 */

import { NETWORK_ERROR_STATUSES } from "@sdkit/constants/api"
import type { NetworkErrorStatusCode } from "@sdkit/types/api"
import type { ExceptionID, NetworkExceptionID } from "./id"

export type ExceptionDomain = keyof ExceptionID

export type ExceptionOptions<Domain extends ExceptionDomain, ID extends ExceptionID[Domain], Metadata extends object> = {
    in: Domain
    of: ID
    with?: {
        internal: {
            label: string
            message: string
        }
        external?: {
            label: string
            message: string
        }
    }
    and?: Metadata
}

export type SerializedException = {
    domain: string
    id: string
    info?: {
        internal: {
            label: string
            message: string
        }
        external?: {
            label: string
            message: string
        }
    }
    metadata: object
}

export class Exception<
    Domain extends ExceptionDomain = ExceptionDomain,
    ID extends ExceptionID[Domain] = ExceptionID[Domain],
    Metadata extends object = object
> {
    domain: string
    id: string
    info?: {
        internal: {
            label: string
            message: string
        }
        external?: {
            label: string
            message: string
        }
    }
    metadata?: object

    trace?: string

    static default: Exception = new Exception({
        in: "logic",
        of: "unknown",
        with: {
            internal: {
                label: "Internal Error",
                message: "An internal error occurred."
            },
            external: {
                label: "Something Went Wrong",
                message: "Please try again later or contact support."
            }
        }
    })

    constructor(options: ExceptionOptions<Domain, ID, Metadata> | SerializedException) {
        if (Exception.isSerializedException(options)) {
            this.domain = options.domain
            this.id = options.id
            this.info = options.info
            this.metadata = options.metadata
        } else {
            const { in: domain, of: id, with: info, and: metadata } = options

            this.domain = domain
            this.id = id
            this.info = info
            this.metadata = metadata
        }

        this.trace = new Error().stack
    }

    applyDefaults(): this {
        if (!this.info) this.info = Exception.default.info
        if (this.info && !this.info.external) this.info.external = Exception.default.info?.external

        return this
    }

    serialize(): SerializedException {
        return {
            domain: this.domain,
            id: this.id,
            info: this.info,
            metadata: JSON.parse(JSON.stringify(this.metadata)) as object
        }
    }

    static isSerializedException(checking: unknown): checking is SerializedException {
        const possibleException = checking as Partial<SerializedException>

        return (
            typeof possibleException === "object" &&
            possibleException !== null &&
            typeof possibleException.domain === "string" &&
            typeof possibleException.id === "string" &&
            typeof possibleException.info === "object" &&
            possibleException.info !== null &&
            typeof possibleException.metadata === "object" &&
            possibleException.metadata !== null
        )
    }

    static idFromNetworkStatusCode({ using: statusCode }: { using: NetworkErrorStatusCode }): NetworkExceptionID {
        return NETWORK_ERROR_STATUSES[statusCode].toLowerCase().replace(/_/g, "-") as NetworkExceptionID
    }

    static async catch<Data, SuccessResult = { success: true; data: Data }>(
        promise: Promise<Data>
    ): Promise<SuccessResult | { success: false; error: Exception }> {
        return promise
            .then(data => ({ success: true, data }) as SuccessResult)
            .catch(error => {
                if (error instanceof Exception) return { success: false, error }

                throw error
            })
    }
}

export * from "./id"
