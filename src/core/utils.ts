export function checkFor(check: unknown, message: string): void {
    if (check === null || check === undefined) {
        throw new Error(message);
    }
}

type ElementArgs = {
    parent?: HTMLElement
    classes?: string[]
};

type PossibleChildren = HTMLElement | string;

export function createElement<T extends HTMLElement>(tagName: string, data?: Partial<T> & ElementArgs, ...children: PossibleChildren[]): T {
    const element = document.createElement(tagName) as T;

    if (data !== undefined) {
        if (data.parent !== undefined) {
            data.parent.appendChild(element);
            delete data.parent;
        }

        if (data.classes !== undefined && data.classes.length > 0) {
            element.classList.add(...data.classes);
            delete data.classes;
        }

        Object.assign(element, data);
    }

    element.append(...children);

    return element;
}

export function createDiv(data?: Partial<HTMLDivElement> & ElementArgs, ...args: PossibleChildren[]): HTMLDivElement {
    return createElement<HTMLDivElement>("div", data, ...args);
}

export function createButton(data?: Partial<HTMLButtonElement> & ElementArgs, ...args: PossibleChildren[]): HTMLButtonElement {
    return createElement<HTMLButtonElement>("button", data, ...args);
}

export function createCanvas(data?: Partial<HTMLCanvasElement> & ElementArgs, ...args: PossibleChildren[]): HTMLCanvasElement {
    return createElement<HTMLCanvasElement>("canvas", data, ...args);
}

export function swapElements(parent: HTMLElement, oldElement: HTMLElement, newElement: HTMLElement): void {
    parent.insertBefore(newElement, oldElement);
    parent.removeChild(oldElement);
}
