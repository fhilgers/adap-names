import { InvalidStateException } from "../common/InvalidStateException";
import { AbstractName } from "./AbstractName";
import { Exception } from "./AssertionDispatcher";
import { splitMaskedComponents } from "./Util";

export class StringName extends AbstractName {
    
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        
        const components = splitMaskedComponents(source, this.getDelimiterCharacter());
        
        components.forEach((component) => {
            this.assertComponentIsMasked(component, Exception.Precondition);
        });
        
        this.name = components.join(this.getDelimiterCharacter());
        this.noComponents = components.length;
    }

    protected override doGetNoComponents(): number {
        return this.project((components, construct) => {
            return components.length;
        })
    }
    protected override doGetComponent(i: number): string {
        return this.project((components, construct) => {
            return components[i];
        })
    }
    protected override doSetComponent(i: number, c: string): StringName {
        return this.project((components, construct) => {
            components[i] = c;
            return construct();
        })
    }
    protected override doInsert(i: number, c: string): StringName {
        return this.project((components, construct) => {
            components.splice(i, 0, c);
            return construct();
        })
    }
    protected override doAppend(c: string): StringName {
        return this.project((components, construct) => {
            components.push(c);
            return construct();
        })
    }
    protected override doRemove(i: number): StringName {
        return this.project((components, construct) => {
            components.splice(i, 1);
            return construct();
        })
    }
    
    private project<T>(
        fn: (components: string[], construct: () => StringName) => T,
    ): T {
        let parts: string[] = [];
        if (this.noComponents > 0) {
            parts = splitMaskedComponents(this.name, this.getDelimiterCharacter());
        }
        const construct = () => {
            const newName = parts.join(this.getDelimiterCharacter());
            const newComponentsLength = parts.length;
            const newStringName = new StringName(newName, this.getDelimiterCharacter());
            newStringName.noComponents = newComponentsLength // in the case of newName == "" but components being []
            return newStringName;
        }

        const result = fn(
            parts, 
            construct,
        );
        
        return result;
    }

    protected override withClassInvariants<T>(func: () => T): T {
        return super.withClassInvariants(() => {
            const nameBefore = this.name;
            const noComponentsBefore = this.noComponents;
            const result = func();
            
            InvalidStateException.assert(nameBefore === this.name, `mutated this.name: ${nameBefore} !== ${this.name}`);
            InvalidStateException.assert(noComponentsBefore === this.noComponents, `mutated this.noComponents: ${noComponentsBefore} !== ${this.noComponents}`);
            
            return result;
        });
    }
}