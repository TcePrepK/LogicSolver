import { checkFor, createDiv, createElement } from "../core/utils";
import { CellState } from "./utils/types";

/** [BackGround, Hover, Text] */
const stateColors = {
    [CellState.OFF]: ["#fff", "#eee", "#113"],
    [CellState.ON]: ["#79b", "#8ac", "#fff"],
    [CellState.X]: ["#aaa", "#bbb", "#777"]
};

export class TruthTable {
    private body!: HTMLDivElement;
    private outputElements!: HTMLDivElement[][];

    private inputSize!: number;
    private outputSize!: number;

    private names!: string[];
    private outputs!: CellState[][];

    public constructor(inputSize: number, outputSize: number) {
        this.body = createDiv({ id: "table", parent: document.body });

        checkFor(inputSize > 0, "Invalid Input Size!");
        checkFor(outputSize > 0, "Invalid Output Size!");

        this.inputSize = inputSize;
        this.outputSize = outputSize;

        this.setupHTML();
    }

    private setupHTML(): void {
        const inputs = new Array(2 ** this.inputSize).fill(0).map((_, i) => new Array(this.inputSize).fill(0).map((_, ii) => (Math.floor(i / (2 ** ii)) % 2) == 0 ? CellState.OFF : CellState.ON).reverse());
        const datas = inputs.map(a => (a.push(...new Array(this.outputSize).fill(CellState.OFF)), a));

        const mainRow = createDiv({ id: "names", parent: this.body });
        const inputsRow = createDiv({ id: "inputs", parent: mainRow });
        const outputsRow = createDiv({ id: "outputs", parent: mainRow });

        this.names = [];
        for (let i = 0; i < this.inputSize + this.outputSize; i++) {
            const element = createElement<HTMLInputElement>("input", { maxLength: 2, placeholder: "-", parent: i < this.inputSize ? inputsRow : outputsRow });
            element.addEventListener("input", e => this.onNameChange(e as InputEvent, element, i));
            this.names[i] = "";
        }

        this.outputElements = [];
        this.outputs = [];
        for (let rowIndex = 0; rowIndex < datas.length; rowIndex++) {
            const data = datas[rowIndex];

            const mainRow = createDiv({ id: "datas", parent: this.body });
            const inputRow = createDiv({ id: "inputs", parent: mainRow });
            const outputRow = createDiv({ id: "outputs", parent: mainRow });

            for (let i = 0; i < this.inputSize; i++) {
                const bool = data[i];
                const element = createDiv({ id: "input", textContent: bool, parent: inputRow });

                this.updateColor(element, bool);
            }

            const rowOutputs = [];
            for (let i = 0; i < this.outputSize; i++) {
                const bool = data[i + this.inputSize];
                const element = createDiv({ id: "output", textContent: bool, parent: outputRow });
                element.addEventListener("click", () => this.onOutputToggle(element, i, rowIndex));

                rowOutputs.push(element);

                this.updateColor(element, bool);
            }

            this.outputElements.push(rowOutputs);
            this.outputs.push(new Array(this.outputSize).fill(0));
        }
    }

    private onNameChange(event: InputEvent, input: HTMLInputElement, idx: number): void {
        const totalValue = input.value;
        if (this.names[idx].length < 1) {
            this.names[idx] = totalValue;
            return;
        }

        const space = event.data === " ";
        if (event.data === null || space) {
            const index = space ? 1 : 0;
            const codePoint = input.value.codePointAt(index);
            if (codePoint === undefined) return;

            const data = codePoint - 0x2080;
            if (data >= 0 && data < 10) {
                input.value = input.value.substring(0, space ? 1 : 0) + data;
            }

            return;
        }

        const addedData = event.data;
        const numberData = Number(addedData);
        if (isNaN(numberData)) return;
        if (totalValue[0] === addedData) return;
        if (totalValue[0] === " ") return;

        input.value = totalValue[0] + `&sup${String.fromCodePoint(0x2080 + numberData)}`;
    }

    private onOutputToggle(output: HTMLDivElement, x: number, y: number): void {
        const prevState = output.textContent as CellState;
        const newState = prevState === CellState.OFF ? CellState.ON : prevState === CellState.ON ? CellState.X : CellState.OFF;

        this.updateColor(output, newState);
        output.textContent = newState;
        this.outputs[y][x] = newState;
    }

    private updateColor(element: HTMLElement, state: CellState): void {
        const colors = stateColors[state];
        element.style.setProperty("--cellBackground", colors[0]);
        element.style.setProperty("--cellHover", colors[1]);
        element.style.setProperty("--cellText", colors[2]);
    }
}