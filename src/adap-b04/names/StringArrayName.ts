import { MethodFailedException } from "../../adap-b05/common/MethodFailedException";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(other: string[], delimiter?: string) {
        super(delimiter);
        
        IllegalArgumentException.assertIsNotNullOrUndefined(other, "other is null or undefined");
        IllegalArgumentException.assertCondition(other.length > 0, "other must have at least one component");
        
        this.components = other.map(c => {
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
        InvalidStateException.assertCondition(this.components instanceof Array, "components is not an array");

        this.components.forEach(c => {
            InvalidStateException.assertCondition(typeof c == "string", "component is not a string");
        })
    }
    
    protected override assertClassInvariants() {
        super.assertClassInvariants();
        this.assertComponentsIsStringArray();
    }
}
