import { InvalidStateException } from "../common/InvalidStateException";
import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
    }

    protected abstract doGetNoComponents(): number;
    protected abstract doGetComponent(i: number): string;
    protected abstract doSetComponent(i: number, c: string): AbstractName;
    protected abstract doInsert(i: number, c: string): AbstractName;
    protected abstract doAppend(c: string): AbstractName;
    protected abstract doRemove(i: number): AbstractName;

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
        return this.withClassInvariants(() => this.delimiter)
    }

    public getNoComponents(): number {
        return this.withClassInvariants(() => this.doGetNoComponents());
    }

    public getComponent(i: number): string {
        return this.withClassInvariants(() => this.doGetComponent(i));
    }

    public setComponent(i: number, c: string): AbstractName {
        return this.withClassInvariants(() => this.doSetComponent(i, c));
    }
    
    public insert(i: number, c: string): AbstractName {
        return this.withClassInvariants(() => this.doInsert(i, c));
    }
    
    public append(c: string): AbstractName {
        return this.withClassInvariants(() => this.doAppend(c));
    }

    
    public remove(i: number) : AbstractName {
        return this.withClassInvariants(() => this.doRemove(i))
    }

    public concat(other: Name): AbstractName {
        throw new Error("TODO")
    }
    
    protected withClassInvariants<T>(func: () => T): T {
        let delimiterBefore = this.delimiter;
        let result = func();
        InvalidStateException.assert(delimiterBefore !== this.delimiter, `mutated this.delimiter: ${delimiterBefore} !== ${this.delimiter}`);
        
        return result;
    }
}
