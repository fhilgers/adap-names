import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { checkEscaped, checkValid, joinUnescapedComponents, splitEscapedComponents, unescape, escape } from "./Util";

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    constructor(other: string[], delimiter?: string) {
        if (other.length == 0) {
            throw new Error("Empty components not allowed");
        }

        this.delimiter = delimiter || this.delimiter;
        this.components = other.map(c => {
            checkValid(c, this.delimiter);
            checkEscaped(c, this.delimiter);
            return unescape(c, this.delimiter);
        })
    }

    public asString(delimiter: string = this.delimiter): string {
        return joinUnescapedComponents(this.components, delimiter).replaceAll(ESCAPE_CHARACTER, "");
    }

    public asDataString(): string {
        return joinUnescapedComponents(this.components, DEFAULT_DELIMITER);
    }

    public isEmpty(): boolean {
        return this.getNoComponents() == 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.checkBounds(i, 0, this.getNoComponents());
        
        // There was no specification whether getComponent should be escaped or not.
        // I chose to escape it with the classes set delimiter, as that is the specification
        // for inputs to insert, append, and setComponent.
        return escape(this.components[i], this.delimiter);
    }

    public setComponent(i: number, c: string): void {
        this.checkBounds(i, 0, this.getNoComponents());
        this.components[i] = unescape(c, this.delimiter);
    }

    public insert(i: number, c: string): void {
        this.checkBounds(i, 0, this.getNoComponents() + 1) // can insert into last place
        this.components.splice(i, 0, unescape(c, this.delimiter));
    }

    public append(c: string): void {
        this.components.push(unescape(c, this.delimiter));
    }

    public remove(i: number): void {
        this.checkBounds(i, 0, this.getNoComponents())
        this.components.splice(i, 1);
    }

    public concat(other: Name): void {
        if (other.getNoComponents() == 0) {
            return;
        }

        const otherComponents = splitEscapedComponents(other.asDataString(), DEFAULT_DELIMITER);
        this.components.push(...otherComponents);
    }
    
    private checkBounds(i: number, left: number, right: number) {
        if (i < left || i >= right) {
            throw new Error("index out of bounds")
        }
    }

}
