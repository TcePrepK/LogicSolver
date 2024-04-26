import { checkFor, createDiv } from "../core/utils";
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
        const inputs = new Array(2 ** this.inputSize).fill(0).map((_, i) => new Array(this.inputSize).fill(0).map((_, ii) => (Math.floor(i / (2 ** ii)) % 2) === 0 ? CellState.OFF : CellState.ON).reverse());
        const datas = inputs.map(a => (a.push(...new Array(this.outputSize).fill(CellState.OFF)), a));

        const mainRow = createDiv({ id: "names", parent: this.body });
        const inputsRow = createDiv({ id: "inputs", parent: mainRow });
        const outputsRow = createDiv({ id: "outputs", parent: mainRow });

        this.names = [];
        for (let i = 0; i < this.inputSize + this.outputSize; i++) {
            const element = createDiv({ contentEditable: "true", parent: i < this.inputSize ? inputsRow : outputsRow });
            this.names[i] = "";

            this.onNameBlur(element, i);
            element.addEventListener("focus", () => this.onNameFocus(element, i));
            element.addEventListener("blur", () => this.onNameBlur(element, i));
            element.addEventListener("keydown", e => this.onNameChange(e as KeyboardEvent, element, i));
            element.addEventListener("input", e => this.onNameInput(e as InputEvent, element));
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

    private onNameFocus(input: HTMLDivElement, idx: number): void {
        if (!input.classList.contains("placeholder")) return;
        input.classList.remove("placeholder");
        input.innerText = "";
    }

    private onNameBlur(input: HTMLDivElement, idx: number): void {
        const value = input.innerText;
        if (value.length !== 0) return;
        input.innerText = "-";
        input.classList.add("placeholder");
    }

    private onNameInput(event: InputEvent, input: HTMLDivElement): void {
        if (event.inputType === "insertFromPaste") {
            const value = input.innerText;
            input.innerText = value.substring(0, 2);
            this.setCaretPos(input, 1);
        }
    }

    private onNameChange(event: KeyboardEvent, input: HTMLDivElement, idx: number): void {
        const value = input.innerHTML;

        if (value.length < 2) return;
        if (event.key.length > 2) return;

        // Only accepting, A_B form!
        if ((/[A-Za-z]+[_\\^]/).test(value)) {
            const key = event.key;
            const pos = key === "_" ? "sub" : "sup";
            input.innerHTML = `${input.innerHTML[0]}<${pos}>${key}</${pos}>`;
            this.setCaretPos(input, 1);
            event.preventDefault();
            return;
        }

        const select = window.getSelection();
        if (select && !select.isCollapsed) return;

        event.preventDefault();
        // const totalValue = input.value;
        // if (this.names[idx].length < 1) {
        //     this.names[idx] = totalValue;
        //     return;
        // }

        // const space = event.data === " ";
        // if (event.data === null || space) {
        //     const index = space ? 1 : 0;
        //     const codePoint = input.value.codePointAt(index);
        //     if (codePoint === undefined) return;

        //     const data = codePoint - 0x2080;
        //     if (data >= 0 && data < 10) {
        //         input.value = input.value.substring(0, space ? 1 : 0) + data;
        //     }

        //     return;
        // }

        // const addedData = event.data;
        // const numberData = Number(addedData);
        // if (isNaN(numberData)) return;
        // if (totalValue[0] === addedData) return;
        // if (totalValue[0] === " ") return;

        // input.value = totalValue[0] + `&sup${String.fromCodePoint(0x2080 + numberData)}`;
    }

    // Stolen code, idk how it does it!
    private getCaretPos(element: HTMLDivElement): number {
        const sel = window.getSelection();
        if (sel === null) return -1;
        if (sel.rangeCount <= 0) return -1;

        const range = sel.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        return preCaretRange.toString().length;
    }

    // Stolen code, idk how it does it!
    private setCaretPos(element: HTMLDivElement, idx: number): void {
        const range = document.createRange();
        const sel = window.getSelection();

        range.setStart(element, idx);
        range.collapse(true);

        if (sel === null) return;
        sel.removeAllRanges();
        sel.addRange(range);
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