// import { CellState } from "./utils/types";

import { CellState } from "./utils/types";

export class KarnaughMap {
    // private width: number;
    // private height: number;

    private size: number;
    private mainData: CellState[];

    public constructor(size: number) {
        this.size = size;
        this.mainData = new Array(2 ** this.size).fill(0);

        this.findTheGroups([0, 0, 1]);
    }

    public findTheGroups(startPosition: number[]): void {
        const groupAmount = 2 ** this.size;

        const checkedSizes = new Set<string>();
        const allGroups = [];
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

            allGroups.push(indices);
        }

        console.log(allGroups);
    }
}