import { AssertionDispatcher, ExceptionType } from "../common/AssertionDispatcher";
import { AbstractName } from "./AbstractName";
import { joinUnmaskedComponents, splitMaskedComponents } from "./Util";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(other: string, delimiter?: string) {
        super(delimiter);
        
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, other !== undefined && other !== null, "other is null or undefined");
        
        const components = splitMaskedComponents(other, this.getDelimiterCharacter());

        this.noComponents = components.length;
        this.name = joinUnmaskedComponents(components, this.getDelimiterCharacter());
        
        this.assertValidConstruction();
    }

    public override getNoComponents(): number {
        this.assertClassInvariants();
        return this.noComponents;
    }

    public override getComponent(i: number): string {
        this.assertClassInvariants();
        this.assertBounds(i, 0, this.getNoComponents());
        
        const component = this.project((components, _apply, _restore) => {
            return this.mask(components[i]);
        },);
        
        this.assertIsMasked(component, ExceptionType.POSTCONDITION);

        return component;
    }

    public override setComponent(i: number, c: string) {
        this.assertClassInvariants();
        
        this.project((components, apply, restore) => {
            this.assertSetComponentWithSnapshotRestore(i, c, 
                () => {
                    const oldComponent = components[i];
                    components[i] = this.unmask(c);
                    apply();
                    return [ oldComponent ];
                }, restore
            )
        });
    }

    public override insert(i: number, c: string) {
        this.assertClassInvariants();

        this.project((components, apply, restore) => {
            this.assertInsertWithSnapshotRestore(i, c,
                () => {
                    components.splice(i, 0, this.unmask(c));
                    apply();
                    return [ ];
                }, restore
            )
        });
    }

    public override append(c: string) {
        this.assertClassInvariants();

        this.project((components, apply, restore) => {
            this.assertAppendWithSnapshotRestore(c,
                () => {
                    components.push(this.unmask(c));
                    apply();
                    return [ ];
                }, restore
            )
        });
    }

    public override remove(i: number) {
        this.assertClassInvariants();

        this.project((components, apply, restore) => {
            this.assertRemoveWithSnapshotRestore(i,
                () => {
                    const removed = components.splice(i, 1);
                    apply();
                    return removed;
                }, restore
            )
        });
    }
    
    
    private project<T>(
        fn: (components: string[], apply: () => void, restore: (oldComponents: string[]) => void) => T
    ): T {
        let parts: string[] = [];
        if (this.getNoComponents() > 0) {
            parts = splitMaskedComponents(this.name, this.getDelimiterCharacter());
        }
        const apply = () => {
            this.name = joinUnmaskedComponents(parts, this.getDelimiterCharacter());
            this.noComponents = parts.length;
        }
        const restore = (oldComponents: string[]) => {
            parts = oldComponents;
            apply();
        }
        const result = fn(
            parts, 
            apply,
            restore
        );
        
        return result;
    }

    protected override assertClassInvariants() {
        super.assertClassInvariants();
    }
}
