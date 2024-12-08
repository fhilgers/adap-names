import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { joinUnescapedComponents, splitEscapedComponents, escape, unescape, checkValid, checkEscaped } from "./Util";

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        this.delimiter = delimiter || this.delimiter;
        
        const parts = splitEscapedComponents(source, this.delimiter);
        this.noComponents = parts.length;
        this.name = joinUnescapedComponents(parts, this.delimiter);
    }

    public asString(delimiter: string = this.delimiter): string {
        return this.name.replaceAll(ESCAPE_CHARACTER, "")
    }

    public asDataString(): string {
        return this.project((parts) => joinUnescapedComponents(parts, DEFAULT_DELIMITER), false)
    }

    public isEmpty(): boolean {
        return this.getNoComponents() == 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(x: number): string {
        this.checkBounds(x, 0, this.getNoComponents());
        return this.project((parts) => escape(parts[x], this.delimiter), false)
    }

    public setComponent(n: number, c: string): void {
        this.checkBounds(n, 0, this.getNoComponents());
        this.project((parts) => parts[n] = unescape(c, this.delimiter))
    }

    public insert(n: number, c: string): void {
        this.checkBounds(n, 0, this.getNoComponents() + 1);
        this.project((parts) => parts.splice(n, 0, c))
    }

    public append(c: string): void {
        this.project((parts) => parts.push(unescape(c, this.delimiter)))
    }

    public remove(n: number): void {
        this.checkBounds(n, 0, this.getNoComponents());
        this.project((parts) => parts.splice(n, 1))
    }

    public concat(other: Name): void {
        let left: string[] = [];
        let right: string[] = [];
        
        if (this.getNoComponents() > 0) {
            left = splitEscapedComponents(this.name, this.delimiter);
        }
        
        if (other.getNoComponents() > 0) {
            right = splitEscapedComponents(other.asDataString(), DEFAULT_DELIMITER);
        }

        let joined = [...left, ...right];
        this.name = joinUnescapedComponents(joined, this.delimiter);
        this.noComponents = joined.length;
    }
    
    private project<T>(fn: (components: string[]) => T, apply: boolean = true): T {
        let parts: string[] = [];
        if (this.getNoComponents() > 0) {
            parts = splitEscapedComponents(this.name, this.delimiter);
        }
        const result = fn(parts);
        if (apply) {
            this.name = joinUnescapedComponents(parts, this.delimiter);
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
