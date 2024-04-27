import { FPSCounter } from "../core/fpsCounter";
import { KarnaughMap } from "./karnaughMap";
import { TruthTable } from "./truthTable";

export class Main {
    public initialize(): void {
        new TruthTable(3, 2);
        new KarnaughMap(3);
    }

    public startRunning(): void {
        FPSCounter.frameUpdate();

        requestAnimationFrame(this.startRunning.bind(this));
    }
}