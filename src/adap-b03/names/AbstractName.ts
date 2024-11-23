import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { joinUnescapedComponents, escape, getUnescapedComponents, getHashCode } from "./Util"

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.checkDelimiter(delimiter);
        this.delimiter = delimiter;
    }

    public clone(): Name {
        return Object.create(this)
    }

    public asString(delimiter: string = this.delimiter): string {
        this.checkDelimiter(delimiter);
        return getUnescapedComponents(this).join(delimiter);
    }

    public toString(): string {
        return this.asDataString()
    }

    public asDataString(): string {
        return joinUnescapedComponents(getUnescapedComponents(this), this.getDelimiterCharacter());
    }

    public isEqual(other: Name): boolean {
        return this.asDataString() == other.asDataString()
            && this.getDelimiterCharacter() == other.getDelimiterCharacter();
    }

    public getHashCode(): number {
        return getHashCode(this.asDataString() + this.getDelimiterCharacter())
    }

    public isEmpty(): boolean {
        return this.getNoComponents() == 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        const otherComponents = getUnescapedComponents(other);

        for (const component of otherComponents) {
            this.append(escape(component, this.getDelimiterCharacter()))
        }
    }

    private checkDelimiter(delim: string) {
        if (delim.length != 1) {
            throw new Error("delimiter can only contain a single char")
        }
    }
}
