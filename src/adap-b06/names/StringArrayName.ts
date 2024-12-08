import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {
    
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);

        throw new Error("Method not implemented.");
    }
    
    override getNoComponents(): number {
        throw new Error("Method not implemented.");
    }
    override getComponent(i: number): string {
        throw new Error("Method not implemented.");
    }
    override setComponent(i: number, c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    override insert(i: number, c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    override append(c: string): StringArrayName {
        throw new Error("Method not implemented.");
    }
    override remove(i: number): StringArrayName {
        throw new Error("Method not implemented.");
    }
}