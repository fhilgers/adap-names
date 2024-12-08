import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {
    
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        throw new Error("Method not implemented.");
    }

    override getNoComponents(): number {
        throw new Error("Method not implemented.");
    }
    override getComponent(i: number): string {
        throw new Error("Method not implemented.");
    }
    override setComponent(i: number, c: string): StringName {
        throw new Error("Method not implemented.");
    }
    override insert(i: number, c: string): StringName {
        throw new Error("Method not implemented.");
    }
    override append(c: string): StringName {
        throw new Error("Method not implemented.");
    }
    override remove(i: number): StringName {
        throw new Error("Method not implemented.");
    }
}