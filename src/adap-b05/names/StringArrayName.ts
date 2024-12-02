import { AssertionDispatcher, ExceptionType } from "../common/AssertionDispatcher";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(other: string[], delimiter?: string) {
        super(delimiter);
        
        
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, other !== undefined && other !== null, "other is null or undefined");
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, other.length > 0, "other must have at least one component");
        
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
        
        this.assertIsMasked(component, ExceptionType.POSTCONDITION);

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
        AssertionDispatcher.dispatch(ExceptionType.CLASS_INVARIANT, this.components instanceof Array, "components is not an array");

        this.components.forEach(c => {
            AssertionDispatcher.dispatch(ExceptionType.CLASS_INVARIANT, typeof c == "string", "component is not a string");
        })
    }
    
    protected override assertClassInvariants() {
        super.assertClassInvariants();
        this.assertComponentsIsStringArray();
    }
}
