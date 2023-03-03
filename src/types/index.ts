export enum CellValue {
    none,
    one,
    two,
    three,
    four,
    five,
    six, 
    seven,
    eight,
    min,

}

export enum CellState {
    open,
    visible,
    flagged,
    question
}

export type Cell = {value:CellValue, state: CellState, red?: boolean};

export enum Face {
    smile = '🙂',
    ohFace = '😯',
    rip = '😵',
    winner = '😎', 
}