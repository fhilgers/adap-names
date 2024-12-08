import { InvalidStateException } from "../common/InvalidStateException";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {
    
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        throw new Error("Method not implemented.");
    }

    protected override doGetNoComponents(): number {
        throw new Error("Method not implemented.");
    }
    protected override doGetComponent(i: number): string {
        throw new Error("Method not implemented.");
    }
    protected override doSetComponent(i: number, c: string): StringName {
        throw new Error("Method not implemented.");
    }
    protected override doInsert(i: number, c: string): StringName {
        throw new Error("Method not implemented.");
    }
    protected override doAppend(c: string): StringName {
        throw new Error("Method not implemented.");
    }
    protected override doRemove(i: number): StringName {
        throw new Error("Method not implemented.");
    }

    protected override withClassInvariants<T>(func: () => T): T {
        return super.withClassInvariants(() => {
            const nameBefore = this.name;
            const noComponentsBefore = this.noComponents;
            const result = func();
            
            InvalidStateException.assert(nameBefore !== this.name, `mutated this.name: ${nameBefore} !== ${this.name}`);
            InvalidStateException.assert(noComponentsBefore !== this.noComponents, `mutated this.noComponents: ${noComponentsBefore} !== ${this.noComponents}`);
            
            return result;
        });
    }
}