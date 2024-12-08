import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
    }

    public clone(): AbstractName {
        throw new Error("TODO")
    }

    public asString(delimiter: string = this.getDelimiterCharacter()): string {
        throw new Error("TODO")
    }

    public toString(): string {
        throw new Error("TODO")
    }

    public asDataString(): string {
        throw new Error("TODO")
    }

    public isEqual(other: Name): boolean {
        throw new Error("TODO")
    }

    public getHashCode(): number {
        throw new Error("TODO")
    }

    public isEmpty(): boolean {
        throw new Error("TODO")
    }

    public getDelimiterCharacter(): string {
        throw new Error("TODO")
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): AbstractName;

    abstract insert(i: number, c: string): AbstractName;
    abstract append(c: string): AbstractName;
    abstract remove(i: number): AbstractName;

    public concat(other: Name): AbstractName {
        throw new Error("TODO")
    }
}
