import { AssertionDispatcher, ExceptionType } from "../common/AssertionDispatcher";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { getHashCode, getUnmaskedComponents, isMasked, isNotMasked, joinUnmaskedComponents, listCompare, mask, unmask } from "./Util";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertValidDelimiter(delimiter);

        this.delimiter = delimiter;
        
        this.assertValidDelimiter(this.getDelimiterCharacter());
    }

    public clone(): Name {
        this.assertClassInvariants();

        return Object.create(this)
    }

    public asString(delimiter: string = this.getDelimiterCharacter()): string {
        this.assertClassInvariants();
        this.assertValidDelimiter(delimiter);

        return getUnmaskedComponents(this).join(delimiter);
    }

    public toString(): string {
        this.assertClassInvariants();

        return joinUnmaskedComponents(getUnmaskedComponents(this), this.getDelimiterCharacter());
    }

    public asDataString(): string {
        this.assertClassInvariants();

        return joinUnmaskedComponents(getUnmaskedComponents(this), DEFAULT_DELIMITER);
    }

    public isEqual(other: Name): boolean {
        this.assertClassInvariants();

        return this.asDataString() == other.asDataString()
            && this.getDelimiterCharacter() == other.getDelimiterCharacter();
    }

    public getHashCode(): number {
        this.assertClassInvariants();

        return getHashCode(this.toString() + this.getDelimiterCharacter())
    }

    public isEmpty(): boolean {
        this.assertClassInvariants();

        return this.getNoComponents() == 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        this.assertClassInvariants();

        let otherComponents = getUnmaskedComponents(other);
        
        for (const component of otherComponents) {
            this.append(mask(component, this.getDelimiterCharacter()));
        }
    }

    protected mask(component: string) {
        return mask(component, this.getDelimiterCharacter());
    }

    protected unmask(component: string) {
        return unmask(component, this.getDelimiterCharacter());
    }
    
    protected assertIsMasked(component: string, type: ExceptionType = ExceptionType.PRECONDITION) {
        const cond = isMasked(component, this.getDelimiterCharacter());
        const message = "component is not masked";
        
        AssertionDispatcher.dispatch(type, cond, message);
    }

    protected assertIsNotMasked(component: string, type: ExceptionType) {

        const cond = isNotMasked(component, this.getDelimiterCharacter());
        const message = "component masked";
        
        AssertionDispatcher.dispatch(type, cond, message);
    }
    
    protected assertBounds(index: number, left: number, right: number) {
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, index >= left && index < right, "index out of bounds");
    }
    
    protected assertValidDelimiter(delimiter: string) {
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, delimiter !== undefined && delimiter !== null, "delimiter is null or undefined");
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, this.getDelimiterCharacter().length == 1, "delimiter can only contain a single char");
        AssertionDispatcher.dispatch(ExceptionType.PRECONDITION, this.getDelimiterCharacter() != ESCAPE_CHARACTER, "delimiter can't be the escape character");
    }
    
    protected assertValidConstruction() {
        AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, this.getNoComponents() >= 1, "name must have at least one component after construction");
    }
    
    protected assertClassInvariants() {
        this.assertValidDelimiter(this.getDelimiterCharacter());
    }
    
    
    protected assertSetComponentWithSnapshotRestore(i: number, c: string, apply: () => string[], restore: (components: string[]) => void) {
        this.assertBounds(i, 0, this.getNoComponents());
        this.assertIsMasked(c);
        
        this.assertWithSnapshotRestore(i, { skipBefore: 1, skipAfter: 1 }, apply, restore);
    }
    
    protected assertInsertWithSnapshotRestore(i: number, c: string, apply: () => string[], restore: (components: string[]) => void) {
        this.assertBounds(i, 0, this.getNoComponents() + 1);
        this.assertIsMasked(c);

        this.assertWithSnapshotRestore(i, { skipBefore: 0, skipAfter: 1 }, apply, restore);
    }
    
    protected assertAppendWithSnapshotRestore(c: string, apply: () => string[], restore: (components: string[]) => void) {
        this.assertIsMasked(c);
        
        this.assertWithSnapshotRestore(this.getNoComponents(), { skipBefore: 0, skipAfter: 1 }, apply, restore);
    }
    
    protected assertRemoveWithSnapshotRestore(i: number, apply: () => string[], restore: (components: string[]) => void) {
        this.assertBounds(i, 0, this.getNoComponents());

        this.assertWithSnapshotRestore(i, { skipBefore: 1, skipAfter: 0 }, apply, restore);
    }

    protected assertWithSnapshotRestore(split: number, skip: { skipBefore: number, skipAfter: number }, apply: () => string[], restore: (components: string[]) => void) {
        const snapshotter = new StateSnaphotter(this, split);
        
        const stateSnapshotBefore = snapshotter.snapshot(skip.skipBefore);
        
        const res = apply();
        
        const stateSnapshotAfter = snapshotter.snapshot(skip.skipAfter);
        
        const delta = skip.skipAfter - skip.skipBefore;
        
        try {
            AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, stateSnapshotAfter.noComponents - stateSnapshotBefore.noComponents == delta, `${apply} did not modify the components by ${delta}`);
            AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, listCompare(stateSnapshotBefore.componentsBeforeSplit, stateSnapshotAfter.componentsBeforeSplit), `${apply} did not preserve component order before ${split}`);
            AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, listCompare(stateSnapshotBefore.componentsAfterSplit, stateSnapshotAfter.componentsAfterSplit), `${apply} did not preserve component order after ${split}`);
        } catch (e) {
            restore([...stateSnapshotBefore.componentsBeforeSplit, ...res, ...stateSnapshotBefore.componentsAfterSplit]);
            throw e;
        }
    }

}

interface StateSnapshot {
    componentsBeforeSplit: string[],
    componentsAfterSplit: string[],
    noComponents: number,
}

class StateSnaphotter {
    private name: Name;
    private split: number;

    constructor(name: Name, split: number) {
        this.name = name;
        this.split = split;
    }
    
    snapshot(amount: number) {
        const snapshot: StateSnapshot = {
            componentsBeforeSplit: [] as string[],
            componentsAfterSplit: [] as string[],
            noComponents: this.name.getNoComponents(),
        }
        
        for (let i = 0; i < this.split; i++) {
            snapshot.componentsBeforeSplit.push(unmask(this.name.getComponent(i), this.name.getDelimiterCharacter()));
        }
        for (let i = this.split + amount; i < this.name.getNoComponents(); i++) {
            snapshot.componentsAfterSplit.push(unmask(this.name.getComponent(i), this.name.getDelimiterCharacter()));
        }
        
        return snapshot;
    }
}
