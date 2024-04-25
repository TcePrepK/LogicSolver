export class FPSCounter {
    private static lastTime: number = performance.now();
    public static FPS: number;

    /**
     * @returns {number} Returns deltaTime 
     */
    public static frameUpdate(): number {
        const now = performance.now();
        const dt = now - this.lastTime;

        this.lastTime = now;
        this.FPS = 1000 / dt;

        return dt;
    }
}