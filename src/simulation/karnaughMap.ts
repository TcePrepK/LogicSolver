import { CellState } from "./utils/types";

type GroupData = {
    pos: number[],
    size: number[],
    cells: number[],
};

type SolutionCell = {
    varIdx: number,
    negate: boolean,
};

export class KarnaughMap {
    private size: number;
    private amount: number;
    private names: string[];

    private outputs: CellState[][];
    private solutions: string[];

    public constructor(size: number, amount: number) {
        this.size = size;
        this.amount = amount;
        this.names = new Array(this.size);
        this.outputs = new Array(amount).fill(0).map(_ => new Array(2 ** this.size).fill(CellState.OFF));
        this.solutions = new Array(amount).fill("0");

        // this.outputs[0][0] = CellState.ON;
        // this.outputs[0][1] = CellState.X;
        // this.updateSolution(this.outputs);
    }

    public updateNames(newNames: string[]): void {
        this.names = newNames;
    }

    public updateSolution(newOutputs: CellState[][]): void {
        this.outputs = newOutputs;
        for (let i = 0; i < this.amount; i++) {
            this.solutions[i] = this.findSolution(this.outputs[i]);
        }

        console.log(this.solutions);
    }

    private findSolution(data: CellState[]): string {
        const allGroups = this.findAllGroups(data);
        if (allGroups.length === 0) return "0";
        if (allGroups.length === 1) {
            const group = allGroups[0];
            if (group.pos.every(a => a === 0) && group.size.every(a => a === 2)) return "1";
        }

        this.devlog(allGroups);
        const groupSolutions = [] as SolutionCell[][];
        for (let i = 0; i < allGroups.length; i++) {
            const { pos, size } = allGroups[i];

            const solution = [] as SolutionCell[];
            for (let j = 0; j < this.size; j++) {
                if (size[j] === 2) continue;
                solution.push({ varIdx: j, negate: pos[j] === 0 } as SolutionCell);
            }

            groupSolutions.push(solution);
        }

        return groupSolutions.map(cell => cell.map(a => ["A", "B"][a.varIdx] + (a.negate ? "'" : "")).join("")).join(" + ");
    }

    private findAllGroups(data: CellState[]): GroupData[] {
        const allGroups = [] as GroupData[];

        const groupAmount = 2 ** this.size;
        for (let posIndex = 0; posIndex < groupAmount; posIndex++) {
            const startPosition = new Array(this.size).fill(0).map((_, ii) => Math.floor(posIndex / (2 ** ii)) % 2).reverse();
            if (data[posIndex] === CellState.OFF) continue;

            const checkedSizes = new Set<string>();
            for (let i = 0; i < groupAmount; i++) {
                const group = new Array(this.size).fill(0).map((_, ii) => Math.floor(i / (2 ** ii)) % 2 + 1).reverse();
                const sizes = group.map(a => new Array(a).fill(0).map((_, i) => i));
                const fixedSizes = sizes.map((a, i) => a.slice(0, 2 - startPosition[i]));

                const sizeString = fixedSizes.join();
                if (checkedSizes.has(sizeString)) continue;
                checkedSizes.add(sizeString);

                const indices = [];
                const twos = fixedSizes.filter(a => a.length === 2).length;
                for (let j = 0; j < 2 ** twos; j++) {
                    let t = 0;
                    const preIndices = new Array(twos).fill(0).map((_, ii) => Math.floor(j / (2 ** ii)) % 2).reverse();
                    const finalIndices = fixedSizes.map(a => a.length === 1 ? 0 : preIndices[t++]);
                    const position = fixedSizes.map((a, i) => a[finalIndices[i]]);
                    const transPoses = position.map((a, i) => a + startPosition[i]);

                    const index = transPoses.reverse().reduce(((p, c, i) => p + c * (2 ** i)), 0);
                    indices.push(index);
                }

                allGroups.push({ pos: startPosition, size: group, cells: indices });
            }
        }

        const fixedGroups = allGroups.filter(pg => !pg.cells.some(d => data[d] === CellState.OFF));
        const sortedGroups = fixedGroups.sort((a, b) => a.cells.length - b.cells.length);
        const noXGroups = sortedGroups.filter(a => !a.cells.every(b => data[b] === CellState.X));
        // const filteredGroups = sortedGroups.filter((gd, idx) => !sortedGroups.find((d, i) => idx < i && gd.cells.every(a => data[a] !== CellState.ON || d.cells.includes(a))));
        // console.log(filteredGroups);
        // return filteredGroups;

        return this.groupAtoBTest(data, noXGroups);
    }

    private groupAtoBTest(data: CellState[], groups: GroupData[]): GroupData[] {
        if (groups.length === 0) return [];

        // A\B 0 1
        // 0 | X 1
        // 1 | 0 0
        // const baseSorted = groups.sort((a, b) => b.cells.length - a.cells.length);
        const sorted = groups.sort((a, b) => b.cells.length - a.cells.length);
        const onlyOnStates = sorted.map(a => (a.cells = a.cells.filter(b => data[b] === CellState.ON), a));
        const filtered = [];

        // this.devlog(onlyOnStates);

        // Loop through every group big to small
        // for (let i = 0; i < sorted.length; i++) {
        //     const group = sorted[i];
        for (const group of onlyOnStates) {
            if (filtered.length === 0) {
                filtered.push(group);
                continue;
            }

            // Check the already found groups
            const alreadyExists = filtered.some(b => group.cells.every(a => b.cells.includes(a)));
            if (!alreadyExists) filtered.push(group);
        }
        // this.devlog(filtered);
        return filtered;
    }

    private devlog(arr: GroupData[]): void {
        const str = arr.map(a => `{\n  Pos: <${a.pos}>\n  Size: <${a.size}>\n  Cells: [${a.cells}]\n}`);
        console.log(str.join(",\n"));
    }
}