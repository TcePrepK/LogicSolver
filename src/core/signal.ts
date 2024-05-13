/* eslint-disable @typescript-eslint/no-explicit-any */
type EventHandler<T extends any[]> = (...args: T) => void;

export class Signal<T extends any[]> {
    private events: EventHandler<T>[] = [];
    private prevArgs: T | undefined;

    add(handler: (...args: T) => void): void {
        this.events.push(handler);
    }

    dispatch(...args: T): void {
        this.events.forEach(handler => handler(...args));
    }
}
