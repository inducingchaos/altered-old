/**
//  *
//  */

// console.log("Hello, world!")

// // const isRangeValue = ({
// //     value,
// //     min,
// //     max,
// //     interval,
// //     debug
// // }: {
// //     value: number
// //     min: number
// //     max: number
// //     interval: number
// //     debug?: { enabled: boolean; id: string }
// // }): boolean => {
// //     if (debug?.enabled) {
// //         console.log(`\n[${debug.id}] Input values:`, { value, min, max, interval })
// //     }

// //     const isWithinRange = value >= min && value <= max
// //     const difference = value - min
// //     const isOnInterval = difference % interval === 0

// //     if (debug?.enabled) {
// //         console.log(`[${debug.id}] Calculations:`, {
// //             isWithinRange,
// //             difference,
// //             moduloResult: difference % interval,
// //             isOnInterval
// //         })
// //     }

// //     return isWithinRange && isOnInterval
// // }

// // function test(name: string, testFn: () => void): void {
// //     try {
// //         testFn()
// //         console.log(`✅ ${name}`)
// //     } catch (error) {
// //         console.log(`❌ ${name}: ${error.message}`)
// //     }
// // }

// // function expect(actual: boolean, id: string): { toBe: (expected: boolean) => void } {
// //     return {
// //         toBe: (expected: boolean): void => {
// //             if (actual !== expected) {
// //                 throw new Error(`[${id}] Expected ${expected}, got ${actual}`)
// //             }
// //         }
// //     }
// // }

// // function runTest(
// //     id: string,
// //     params: { value: number; min: number; max: number; interval: number },
// //     expected: boolean,
// //     debug = false
// // ) {
// //     expect(isRangeValue({ ...params, debug: debug ? { enabled: true, id } : undefined }), id).toBe(expected)
// // }

// // // Basic positive ranges
// // test("basic positive range", () => {
// //     runTest("P1", { value: 5, min: 0, max: 10, interval: 1 }, true)
// //     runTest("P2", { value: 0, min: 0, max: 10, interval: 1 }, true)
// //     runTest("P3", { value: 10, min: 0, max: 10, interval: 1 }, true)
// //     runTest("P4", { value: 7.5, min: 0, max: 10, interval: 2.5 }, true)
// // })

// // // Intervals with offsets
// // test("offset intervals", () => {
// //     runTest("O1", { value: 3.75, min: 1.25, max: 8.75, interval: 2.5 }, true)
// //     runTest("O2", { value: 4.5, min: 1.25, max: 8.75, interval: 2.5 }, false)
// //     runTest("O3", { value: 8.75, min: 1.25, max: 8.75, interval: 2.5 }, true)
// //     runTest("O4", { value: 1.25, min: 1.25, max: 8.75, interval: 2.5 }, true)
// // })

// // // Negative ranges with fractions
// // test("negative fractional ranges", () => {
// //     runTest("N1", { value: -5.25, min: -10.5, max: -0.75, interval: 1.5 }, true)
// //     runTest("N2", { value: -3.5, min: -10.5, max: -0.75, interval: 1.5 }, false)
// //     runTest("N3", { value: -6.75, min: -10.5, max: -0.75, interval: 1.5 }, true)
// // })

// // // Mixed ranges with irregular intervals
// // test("mixed irregular ranges", () => {
// //     runTest("M1", { value: -1.25, min: -3.75, max: 2.25, interval: 1.25 }, true)
// //     runTest("M2", { value: 0.5, min: -3.75, max: 2.25, interval: 1.25 }, false)
// //     runTest("M3", { value: 2.25, min: -3.75, max: 2.25, interval: 1.25 }, true)
// // })

// // // Edge cases with fractions
// // test("fractional edge cases", () => {
// //     runTest("E1", { value: 1 / 3, min: 0, max: 1, interval: 1 / 3 }, true)
// //     runTest("E2", { value: 0.333, min: 0, max: 1, interval: 1 / 3 }, false)
// //     runTest("E3", { value: 2 / 3, min: 0, max: 1, interval: 1 / 3 }, true)
// // })

// // // Very small intervals
// // test("tiny intervals", () => {
// //     runTest("T1", { value: 0.125, min: 0, max: 1, interval: 0.125 }, true)
// //     runTest("T2", { value: 0.126, min: 0, max: 1, interval: 0.125 }, false)
// //     runTest("T3", { value: 0.875, min: 0, max: 1, interval: 0.125 }, true)
// // })

// // /**
// //  * @remarks
// //  * - Run this script with `bun execute test`.
// //  */

// // import { colors } from "~/config/external/tailwind"

// console.log("Hello, world!")

// export function clamp({ value, min = 0, max }: { value: number; min?: number; max: number }): number {
//     return Math.min(Math.max(value, min), max)
// }

// export function setDecimalPrecision({ for: value, to: decimalPlaces }: { for: number; to: number }): number {
//     const factor = Math.pow(10, decimalPlaces)
//     return Math.round(value * factor) / factor
// }

// export function getRandomInRange({
//     min = 0,
//     max,
//     incrementBy: interval,
//     anchorIntervalAt: origin = 0,
//     decimalPrecision = 3
// }: {
//     min?: number
//     max: number
//     incrementBy?: number
//     anchorIntervalAt?: number
//     decimalPrecision?: number
// }): number {
//     const intervalRange = max - min
//     const correctedOrigin = origin - min
//     const rangeOffset = interval ? Math.abs(correctedOrigin % interval) : 0
//     const randomInOffsetRange = Math.random() * intervalRange

//     // let correctedInterval
//     if (interval) {
//         const intervalInOffsetRange = Math.round(randomInOffsetRange / interval) * interval
//         const adjustedIntervalRange = Math.floor(intervalRange / interval) * interval

//         let res

//         if (intervalInOffsetRange > adjustedIntervalRange) {
//             const a = (intervalInOffsetRange + rangeOffset) % intervalRange
//             res = a + min
//         }
//         const a = intervalInOffsetRange + rangeOffset

//         res = a

//         const correctedInterval = res + min

//         return setDecimalPrecision({ for: correctedInterval, to: decimalPrecision })
//     } else return setDecimalPrecision({ for: randomInOffsetRange, to: decimalPrecision })
// }

// //
// //
// //
// //
// //

// // 2.05, 4.55, 7.05, 9.55

// // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
// function runTestMultipleTimes(times: number = 100) {
//     const results = Array(times)
//         .fill(null)
//         .map(() => getRandomInRange({ min: 1, max: 10, incrementBy: 2.5, anchorIntervalAt: 12.05 }))

//     const counts = results.reduce(
//         (acc, num) => {
//             const roundedNum = Math.round(num * 100) / 100 // Round to 2 decimal places
//             acc[roundedNum] = (acc[roundedNum] ?? 0) + 1
//             return acc
//         },
//         {} as Record<number, number>
//     )

//     const probabilities = Object.entries(counts).reduce(
//         (acc: Record<string, number>, [num, count]) => {
//             acc[num] = count / times
//             return acc
//         },
//         {} as Record<number, number>
//     )

//     console.log("Probabilities:")
//     Object.entries(probabilities)
//         .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
//         .forEach(([num, prob]) => {
//             console.log(`${num}: ${(prob * 100).toFixed(2)}%`)
//         })

//     return probabilities
// }

// // Run the test 1000 times
// runTestMultipleTimes(1000)

// // console.log(getRandomInRange({ min: 1, max: 10, incrementBy: 2.5, anchorIntervalAt: 12.05 }))
// // console.log(getRandomInRange({ min: 1, max: 10, incrementBy: 2.5, anchorIntervalAt: 100.05 }))

// console.log(
//     Array(20)
//         .fill(null)
//         .map(() => getRandomInRange({ min: 1, max: 10, incrementBy: 2.5, anchorIntervalAt: 12.05 }))
// )
// // console.log(
// //     Array(20)
// //         .fill(null)
// //         .map(() => getRandomInRange({ min: 1, max: 10, incrementBy: 2.5, anchorIntervalAt: 100.05 }))
// // )

// // Should produce 1.5, 3.5, 5.5, 7.5, or 9.5

// // water when done
// // /**
// //  *
// //  */

// // const test = <Params, Result>({
// //     function: toTest,
// //     params,
// //     expectedResult,
// //     id
// // }: {
// //     function: (params: Params) => Result
// //     params: Params
// //     expectedResult: Result
// //     id: string
// // }): void => {
// //     const result = toTest(params)

// //     if (expectedResult === result) console.info(`Test ${id}: Success!`)
// //     else {
// //         console.error(`Test ${id}: Failed! Retrying with debug on...`)
// //         toTest({ ...params, debug: { enabled: true } })
// //     }
// // }

// // export function isValueInRange({
// //     value,
// //     min,
// //     max,
// //     interval,
// //     debug
// // }: {
// //     value: number
// //     min: number
// //     max: number
// //     interval: number
// //     debug?: { enabled: boolean }
// // }): boolean {
// //     const isWithinRange = value >= min && value <= max
// //     const isOnInterval = (value - min) % interval === 0

// //     if (debug?.enabled) console.log({ value, min, max, interval, isWithinRange, isOnInterval })

// //     return isWithinRange && isOnInterval
// // }

// // test({ function: isValueInRange, params: { value: -1, min: 0, max: 10, interval: 1 }, expectedResult: false, testId: "A1" })

// // //  Test Group A: Simple Range
// // test({ expected: false, actual: isValueInRange({ value: -1, min: 0, max: 10, interval: 1 }), id: "A1" })
// // test({ expected: true, actual: isValueInRange({ value: 0, min: 0, max: 10, interval: 1 }), id: "A2" })
// // test({ expected: true, actual: isValueInRange({ value: 1, min: 0, max: 10, interval: 1 }), id: "A3" })
// // test({ expected: true, actual: isValueInRange({ value: 9, min: 0, max: 10, interval: 1 }), id: "A4" })
// // test({ expected: true, actual: isValueInRange({ value: 10, min: 0, max: 10, interval: 1 }), id: "A5" })
// // test({ expected: false, actual: isValueInRange({ value: 11, min: 0, max: 10, interval: 1 }), id: "A6" })

// // //  Test Group B: Range with Decimal Precision
// // test({ expected: false, actual: isValueInRange({ value: 1.01, min: 0, max: 10, interval: 1 }), id: "B1" })
// // test({ expected: true, actual: isValueInRange({ value: 1.02, min: 0, max: 10, interval: 1 }), id: "B2" })
// // test({ expected: true, actual: isValueInRange({ value: 1.03, min: 0, max: 10, interval: 1 }), id: "B3" })
// // test({ expected: true, actual: isValueInRange({ value: 9.01, min: 0, max: 10, interval: 1 }), id: "B4" })
// // test({ expected: true, actual: isValueInRange({ value: 10.02, min: 0, max: 10, interval: 1 }), id: "B5" })
// // test({ expected: false, actual: isValueInRange({ value: 11.03, min: 0, max: 10, interval: 1 }), id: "B6" })
