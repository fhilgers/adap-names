import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);
        
        
        IllegalArgumentException.assert(source !== undefined && source !== null, "source is null or undefined");
        IllegalArgumentException.assert(source.length > 0, "source must have at least one component");
        
        this.components = source.map(c => {
            this.assertIsMasked(c);

            return this.unmask(c);
        });
        
        this.assertValidConstruction();
        this.assertClassInvariants();
    }

    public override getNoComponents(): number {
        this.assertClassInvariants();
        return this.components.length;
    }

    public override getComponent(i: number): string {
        this.assertClassInvariants();
        this.assertBounds(i, 0, this.getNoComponents());
        
        const component = this.mask(this.components[i]);
        
        this.assertIsMasked(component, "post");

        return component;
    }

    public override setComponent(i: number, c: string) {
        this.assertClassInvariants();
        
        this.assertSetComponentWithSnapshotRestore(i, c,
            () => {
                const oldComponent = this.components[i];
                this.components[i] = this.unmask(c);
                return [ oldComponent ];
            },
            (components) => {
                this.components = components;
            }
        );
    }

    public override insert(i: number, c: string) {
        this.assertClassInvariants();
        
        this.assertInsertWithSnapshotRestore(i, c,
            () => {
                this.components.splice(i, 0, this.unmask(c));
                return [ ];
            },
            (components) => {
                this.components = components;
            }
        );
    }

    public override append(c: string) {
        this.assertClassInvariants();
        
        this.assertAppendWithSnapshotRestore(c,
            () => {
                this.components.push(this.unmask(c));
                return [ ];
            },
            (components) => {
                this.components = components;
            }
        )
    }

    public override remove(i: number) {
        this.assertClassInvariants();
        
        this.assertRemoveWithSnapshotRestore(i, 
            () => {
                return this.components.splice(i, 1);
            },
            (components) => {
                this.components = components;
            }
        );
    }
    
    private assertComponentsIsStringArray() {
        this.doAssert("inv", this.components instanceof Array, "components is not an array");

        this.components.forEach(c => {
            this.doAssert("inv", typeof c == "string", "component is not a string");
        })
    }
    
    protected override assertClassInvariants() {
        super.assertClassInvariants();
        this.assertComponentsIsStringArray();
    }
}
