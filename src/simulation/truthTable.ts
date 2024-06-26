import { Signal } from "../core/signal";
import { checkFor, createDiv } from "../core/utils";
import { CellState } from "./utils/types";

/** [BackGround, Hover, Text] */
const stateColors = {
    [CellState.OFF]: ["#fff", "#eee", "#113"],
    [CellState.ON]: ["#79b", "#8ac", "#fff"],
    [CellState.X]: ["#aaa", "#bbb", "#777"]
};

export class TruthTable {
    public onNameUpdate = new Signal<[string[]]>();
    public onDataUpdate = new Signal<[CellState[][]]>();

    private readonly body!: HTMLDivElement;

    private readonly inputSize!: number;
    private readonly outputSize!: number;

    private readonly names!: string[];
    private readonly outputs!: CellState[][];

    public constructor(inputSize: number, outputSize: number) {
        this.body = createDiv({ id: "table", parent: document.body });
        this.names = new Array(inputSize + outputSize).fill("");

        checkFor(inputSize > 0, "Invalid Input Size!");
        checkFor(outputSize > 0, "Invalid Output Size!");

        this.inputSize = inputSize;
        this.outputSize = outputSize;

        this.outputs = new Array(outputSize).fill(0).map(_ => new Array(2 ** inputSize).fill(CellState.OFF));

        this.setupHTML();
    }

    private setupHTML(): void {
        const inputs = new Array(2 ** this.inputSize).fill(0).map((_, i) => new Array(this.inputSize).fill(0).map((_, ii) => (Math.floor(i / (2 ** ii)) % 2) === 0 ? CellState.OFF : CellState.ON).reverse());
        const datas = inputs.map(a => (a.push(...new Array(this.outputSize).fill(CellState.OFF)), a));

        const mainRow = createDiv({ id: "names", parent: this.body });
        const inputsRow = createDiv({ id: "inputs", parent: mainRow });
        const outputsRow = createDiv({ id: "outputs", parent: mainRow });

        for (let i = 0; i < this.inputSize + this.outputSize; i++) {
            const element = createDiv({ contentEditable: "true", parent: i < this.inputSize ? inputsRow : outputsRow });

            this.onNameBlur(element);
            element.addEventListener("focus", _ => this.onNameFocus(element));
            element.addEventListener("blur", _ => this.onNameBlur(element));
            element.addEventListener("keydown", e => this.onNameKeyDown(e as KeyboardEvent, element));
            element.addEventListener("input", e => {
                this.onNameInput(e as InputEvent, element);
                const prevVal = this.names[i];
                const newVal = element.innerHTML;

                if (prevVal === newVal) return;
                this.names[i] = element.innerHTML;
                this.onNameUpdate.dispatch(this.names);
            });
        }

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
        }
    }

    private onNameFocus(input: HTMLDivElement): void {
        if (!input.classList.contains("placeholder")) return;
        input.classList.remove("placeholder");
        input.innerText = "";
    }

    private onNameBlur(input: HTMLDivElement): void {
        const value = input.innerText;
        if (value.length !== 0) return;
        input.innerText = "-";
        input.classList.add("placeholder");
    }

    private onNameInput(event: InputEvent, input: HTMLDivElement): void {
        if (event.inputType === "insertFromPaste") {
            const value = input.innerText;
            input.innerText = value.substring(0, 2);
        }

        const value = input.innerText;
        if (value.length > 2) input.innerText = value.slice(0, 2);
        if (value.length !== 2) return;
        input.innerHTML = `${value[0]}<sub>${value[1]}</sub>`;
        this.setCaretPos(input, 2);
    }

    private onNameKeyDown(event: KeyboardEvent, input: HTMLDivElement): boolean {
        const key = event.key;
        const value = input.innerHTML;
        if (value.length < 2 && key !== " " && key.length < 2) return true;

        const deleteKeys = ["Backspace", "Delete"];

        const select = window.getSelection();
        const posReg = /<(\/)?sub>/;
        if (deleteKeys.includes(key)) {
            if (!posReg.test(value)) return true;

            if (select && select.toString().length === 2) {
                input.innerHTML = "";
                event.preventDefault();
                return true;
            }

            const idx = deleteKeys.indexOf(key);
            const caret = this.getCaretPos(input);
            if (caret === idx * 2) return false;

            const nonPos = value.replace(posReg, "");
            input.innerHTML = nonPos.split("")[2 - idx - caret];
            this.setCaretPos(input, caret - 1 + idx);

            event.preventDefault();
            return true;
        }

        if (key.length > 2 || event.ctrlKey) return false;
        event.preventDefault();

        return false;
    }

    // Stolen code, IDK how it does it!
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

    // Stolen code, IDK how it does it!
    private setCaretPos(element: HTMLDivElement, idx: number): void {
        const range = document.createRange();
        const sel = window.getSelection();

        if (idx >= 2) {
            range.selectNodeContents(element);
            range.collapse(false);

            if (sel === null) return;
            sel.removeAllRanges();
            sel.addRange(range);
            return;
        }

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
        this.outputs[x][y] = newState;

        this.onDataUpdate.dispatch(this.outputs);
    }

    private updateColor(element: HTMLElement, state: CellState): void {
        const colors = stateColors[state];
        element.style.setProperty("--cellBackground", colors[0]);
        element.style.setProperty("--cellHover", colors[1]);
        element.style.setProperty("--cellText", colors[2]);
    }
}