import { InvalidStateException } from "../common/InvalidStateException";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {
    
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        throw new Error("Method not implemented.");
    }
    
    protected override doGetNoComponents(): number {
        throw new Error("Method not implemented.");
    }
    protected override doGetComponent(i: number): string {
        throw new Error("Method not implemented.");
    }
    protected override doSetComponent(i: number, c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    protected override doInsert(i: number, c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    protected override doAppend(c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    protected override doRemove(i: number): StringArrayName {
        throw new Error("Method not implemented.");
    }
    
    protected override withClassInvariants<T>(func: () => T): T {
        return super.withClassInvariants(() => {
            const componentsBefore = this.components;
            const result = func();
            
            InvalidStateException.assert(componentsBefore.length !== this.components.length, `mutated this.components.length: ${componentsBefore.length} !== ${this.components.length}`);
            
            for (let i = 0; i < componentsBefore.length; i++) {
                InvalidStateException.assert(componentsBefore[i] !== this.components[i], `mutated this.components[${i}]: ${componentsBefore[i]} !== ${this.components[i]}`);
            }
            
            return result;
        });
    }
}