import { FPSCounter } from "../core/fpsCounter";
import { KarnaughMap } from "./karnaughMap";
import { TruthTable } from "./truthTable";

export class Main {
    public initialize(): void {
        const inputAmount = 3;
        const outputAmount = 2;

        const table = new TruthTable(inputAmount, outputAmount);
        const map = new KarnaughMap(inputAmount, outputAmount);

        table.onNameUpdate.add(map.updateNames.bind(map));
        table.onDataUpdate.add(map.updateSolution.bind(map));
    }

    public startRunning(): void {
        FPSCounter.frameUpdate();

        requestAnimationFrame(this.startRunning.bind(this));
    }
}