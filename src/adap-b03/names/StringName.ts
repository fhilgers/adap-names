import { AbstractName } from "./AbstractName";
import { escape, unescape, joinUnescapedComponents, splitEscapedComponents } from "./Util";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(other: string, delimiter?: string) {
        super(delimiter);
        
        const parts = splitEscapedComponents(other, this.getDelimiterCharacter());
        this.noComponents = parts.length;
        this.name = joinUnescapedComponents(parts, this.getDelimiterCharacter());
    }

    getNoComponents(): number {
        return this.noComponents;
    }

    getComponent(x: number): string {
        this.checkBounds(x, 0, this.getNoComponents());
        return this.project((parts) => escape(parts[x], this.getDelimiterCharacter()), false)
    }

    setComponent(n: number, c: string): void {
        this.checkBounds(n, 0, this.getNoComponents());
        this.project((parts) => parts[n] = unescape(c, this.getDelimiterCharacter()))
    }

    insert(n: number, c: string): void {
        this.checkBounds(n, 0, this.getNoComponents() + 1);
        this.project((parts) => parts.splice(n, 0, c))
    }

    append(c: string): void {
        this.project((parts) => parts.push(unescape(c, this.getDelimiterCharacter())))
    }

    remove(n: number): void {
        this.checkBounds(n, 0, this.getNoComponents());
        this.project((parts) => parts.splice(n, 1))
    }

    private project<T>(fn: (components: string[]) => T, apply: boolean = true): T {
        let parts: string[] = [];
        if (this.getNoComponents() > 0) {
            parts = splitEscapedComponents(this.name, this.getDelimiterCharacter());
        }
        const result = fn(parts);
        if (apply) {
            this.name = joinUnescapedComponents(parts, this.getDelimiterCharacter());
            this.noComponents = parts.length;
        }
        
        return result;
    }
    
    private checkBounds(i: number, left: number, right: number) {
        if (i < left || i >= right) {
            throw new Error("index out of bounds")
        }
    }
}
