export interface IResponseView {
    status: number,
    message: string,
    traceID?: string
}

export interface ISensorData {
    temperature: number | null,
    ph: number | null
}

export interface Fish {
    name: string,
    minTmp: number,
    maxTmp: number,
    minPh: number,
    maxPh: number
}