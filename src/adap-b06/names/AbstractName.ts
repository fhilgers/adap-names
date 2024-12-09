import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { AssertionDispatcher, Exception } from "./AssertionDispatcher";
import { Name } from "./Name";
import { getComponents, getHashCode, isMasked, mask, unmask } from "./Util";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertValidDelimiter(delimiter, Exception.Precondition);
        this.delimiter = delimiter;
    }

    protected abstract doGetNoComponents(): number;
    protected abstract doGetComponent(i: number): string;
    protected abstract doSetComponent(i: number, c: string): AbstractName;
    protected abstract doInsert(i: number, c: string): AbstractName;
    protected abstract doAppend(c: string): AbstractName;
    protected abstract doRemove(i: number): AbstractName;

    public clone(): AbstractName {
        // immutable
        return this;
    }

    public asString(delimiter: string = this.getDelimiterCharacter()): string {
        this.assertValidDelimiter(delimiter, Exception.Precondition);
        
        return this.withClassInvariants(() => {
            return this.getComponents(null).join(delimiter)
        })
    }

    public toString(): string {
        return JSON.stringify(this)
    }

    public asDataString(): string {
        return this.getComponents().join(this.delimiter);
    }

    public isEqual(other: Name): boolean {
        /*
         * Reflexivity, Symmetricity, Transitivity and Consisency always hold:
            - getDelimiterCharacter() and asDataString() return strings and the conditions hold for strings
            - everything is immutable, so consistency is always guaranteed
           Null-Object:
            - typescript argument requires our argument to be not null
            - if avoided by isEqual(null as any), then the method calls implicitly require it to be not null
        */
        try {
            return this.getDelimiterCharacter() == other.getDelimiterCharacter() 
                && this.asDataString() == other.asDataString()
        } catch (e) {
            return false;
        }
    }

    public getHashCode(): number {
        return getHashCode(this.getDelimiterCharacter() + this.asDataString())
    }

    public isEmpty(): boolean {
        return this.getNoComponents() == 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public getNoComponents(): number {
        const result = this.withClassInvariants(() => this.doGetNoComponents());
        
        this.assertValidNoComponents(result);
        
        return result;
    }

    public getComponent(i: number): string {
        this.assertIndexInBounds(i, this.doGetNoComponents())

        const result = this.withClassInvariants(() => this.doGetComponent(i));
        
        this.assertComponentIsMasked(result, Exception.Postcondition);

        return result;
    }

    public setComponent(i: number, c: string): AbstractName {
        this.assertIndexInBounds(i, this.doGetNoComponents())
        this.assertComponentIsMasked(c);

        return this.withClassInvariants(() => this.doSetComponent(i, c));
    }
    
    public insert(i: number, c: string): AbstractName {
        this.assertIndexInBounds(i, this.doGetNoComponents() + 1) // can insert after last component
        this.assertComponentIsMasked(c);

        return this.withClassInvariants(() => this.doInsert(i, c));
    }
    
    public append(c: string): AbstractName {
        this.assertComponentIsMasked(c);

        return this.withClassInvariants(() => this.doAppend(c));
    }
    
    public remove(i: number) : AbstractName {
        this.assertIndexInBounds(i, this.doGetNoComponents())

        return this.withClassInvariants(() => this.doRemove(i))
    }

    public concat(other: Name): AbstractName {
        const otherComponents = getComponents(other, this.getDelimiterCharacter());
        
        let name: AbstractName = this
        
        for (const c of otherComponents) {
            name = name.append(c)
        }
        
        return name;
    }
    
    protected assertIndexInBounds(i: number, upperNonInclusive: number) {
        AssertionDispatcher.dispatch(Exception.Precondition, upperNonInclusive > 0, "non inclusive upper bound cannot be 0");
        AssertionDispatcher.dispatch(Exception.Precondition, i >= 0, "index has to be greater or equal to 0");
        AssertionDispatcher.dispatch(Exception.Precondition, i < upperNonInclusive, `index out of bounds: ${i >= upperNonInclusive}`)
    }
    
    protected assertComponentIsMasked(component: string, ty: Exception.Type = Exception.Precondition) {
        AssertionDispatcher.dispatch(ty, isMasked(component, this.getDelimiterCharacter()), `${component} is not masked`)
    }
    
    protected assertValidNoComponents(noComponents: number) {
        AssertionDispatcher.dispatch(Exception.Precondition, noComponents >= 0, "number of components has to be greater or equal to 0");
    }
    
    protected assertValidDelimiter(delimiter: string, ty: Exception.Type) {
        AssertionDispatcher.dispatch(ty, delimiter.length == 1, "delimiter has to be exactly one character");
        AssertionDispatcher.dispatch(ty, delimiter !== ESCAPE_CHARACTER, "delimiter cannot be the escape character");
    }

    protected withClassInvariants<T>(func: () => T): T {
        let delimiterBefore = this.delimiter;
        let result = func();
        AssertionDispatcher.dispatch(Exception.Invariant, delimiterBefore === this.delimiter, `mutated this.delimiter: ${delimiterBefore} !== ${this.delimiter}`);
        
        return result;
    }
    
    protected getComponents(delimiter: string | null = this.getDelimiterCharacter()) {
        return getComponents(this, delimiter)
    }
}
