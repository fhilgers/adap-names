import { InvalidStateException } from "../common/InvalidStateException";
import { AbstractName } from "./AbstractName";
import { Exception } from "./AssertionDispatcher";

export class StringArrayName extends AbstractName {
    
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);
        source.forEach((component) => {
            this.assertComponentIsMasked(component, Exception.Precondition);
        });
        this.components = source;
    }
    
    protected override doGetNoComponents(): number {
        return this.components.length;
    }
    protected override doGetComponent(i: number): string {
        return this.components[i];
    }

    protected override doSetComponent(i: number, c: string): StringArrayName {
        const components = [...this.components];
        components[i] = c;

        return new StringArrayName(components, this.getDelimiterCharacter());
    }
    protected override doInsert(i: number, c: string): StringArrayName {
        const components = [...this.components];
        components.splice(i, 0, c);
        
        return new StringArrayName(components, this.getDelimiterCharacter());
    }
    protected override doAppend(c: string): StringArrayName {
        const components = [...this.components];
        components.push(c);

        return new StringArrayName(components, this.getDelimiterCharacter());
    }
    protected override doRemove(i: number): StringArrayName {
        const components = [...this.components];
        components.splice(i, 1);
        return new StringArrayName(components, this.getDelimiterCharacter());
    }
    
    protected override withClassInvariants<T>(func: () => T): T {
        return super.withClassInvariants(() => {
            const componentsBefore = this.components;
            const result = func();
            
            InvalidStateException.assert(componentsBefore.length === this.components.length, `mutated this.components.length: ${componentsBefore.length} !== ${this.components.length}`);
            
            for (let i = 0; i < componentsBefore.length; i++) {
                InvalidStateException.assert(componentsBefore[i] === this.components[i], `mutated this.components[${i}]: ${componentsBefore[i]} !== ${this.components[i]}`);
            }
            
            return result;
        });
    }
}