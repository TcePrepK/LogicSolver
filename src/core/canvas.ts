import { createCanvas } from "./utils";

export class Canvas {
    public mainCanvas!: HTMLCanvasElement;
    public context!: CanvasRenderingContext2D;

    public WIDTH!: number;
    public HEIGHT!: number;

    public initialize(): void {
        this.mainCanvas = createCanvas();
        this.context = this.mainCanvas.getContext("2d") as CanvasRenderingContext2D;

        this.onResize();
        window.addEventListener("resize", this.onResize.bind(this));
    }

    private onResize(): void {
        // this.mainCanvas.width = window.innerWidth;
        // this.mainCanvas.height = window.innerHeight;
    }
}