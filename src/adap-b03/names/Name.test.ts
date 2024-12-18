import { fc, it } from "@fast-check/vitest";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { describe, expect } from "vitest";
import { deepArrayEquals, escape, getHashCode, getUnescapedComponents, isEscaped, joinUnescapedComponents, unescape } from "./Util";
import { StringName } from "./StringName";
import { StringArrayName } from "./StringArrayName";
import { Arbitrary } from "fast-check";

type Model = {
    delimiter: string,
    components: string[],
}

class AsStringCommand implements fc.Command<Model, Name> {
    toString = () => `asString()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.asString()).toBe(m.components.join(m.delimiter))
    }
}

class AsDataStringCommand implements fc.Command<Model, Name> {
    toString = () => `asDataString()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.asDataString()).toBe(joinUnescapedComponents(m.components, m.delimiter));
    }
}

class IsEqualCommand implements fc.Command<Model, Name> {
    constructor(readonly other: Name) {}
    toString = () => `isEqual()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.isEqual(this.other)).toBe(
            deepArrayEquals(m.components, getUnescapedComponents(this.other))
            && m.delimiter == this.other.getDelimiterCharacter()
        )
    }
}

class GetHashCodeCommand implements fc.Command<Model, Name> {
    toString = () => `getHashCode()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.getHashCode()).toBe(getHashCode(
            joinUnescapedComponents(m.components, m.delimiter) + m.delimiter
        ))
    }
}

class IsEmptyCommand implements fc.Command<Model, Name> {
    toString = () => `isEmpty()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.isEmpty()).toBe(m.components.length == 0);
    }
}

class GetDelimiterCharacterCommand implements fc.Command<Model, Name> {
    toString = () => `getDelimiterCharacter()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.getDelimiterCharacter()).toBe(m.delimiter);
    }
}

class GetNoComponentsCommand implements fc.Command<Model, Name> {
    toString = () => `getNoComponents()`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        expect(r.getNoComponents()).toBe(m.components.length);
    }
}

class GetComponentOutOfBoundsCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number) {}
    toString = () => `getComponent(${this.index})`;
    check(m: Readonly<Model>): boolean {
        return this.index < 0 || this.index >= m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.getComponent(this.index)).toThrowError();
    }
}

class GetComponentCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number) {}
    toString = () => `getComponent(${this.index})`;
    check(m: Readonly<Model>): boolean {
        return this.index >= 0 && this.index < m.components.length
    }
    run(m: Model, r: Name): void {
        expect(r.getComponent(this.index)).toBe(escape(m.components[this.index], m.delimiter));
    }
}

class SetComponentOutOfBoundsCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `setComponent(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return this.index < 0 || this.index >= m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.setComponent(this.index, this.component)).toThrowError();
    }
}

class SetComponentUnescapedCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `setComponent(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return !isEscaped(this.component, m.delimiter) &&
         this.index >= 0 && this.index < m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.setComponent(this.index, this.component)).toThrowError();
    }
}

class SetComponentCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `setComponent(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return isEscaped(this.component, m.delimiter) && 
         this.index >= 0 && this.index < m.components.length
    }
    run(m: Model, r: Name): void {
        m.components[this.index] = unescape(this.component, m.delimiter);
        expect(r.setComponent(this.index, this.component));
    }
}

class InsertOutOfBoundsCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `insert(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return this.index < 0 || this.index > m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.insert(this.index, this.component)).toThrowError();
    }
}

class InsertUnescapedCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `insert(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return !isEscaped(this.component, m.delimiter) &&
         this.index >= 0 && this.index <= m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.insert(this.index, this.component)).toThrowError();
    }
}

class InsertCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number, readonly component: string) {}
    toString = () => `insert(${this.index}, ${this.component})`;
    check(m: Readonly<Model>): boolean {
        return isEscaped(this.component, m.delimiter) && 
         this.index >= 0 && this.index <= m.components.length
    }
    run(m: Model, r: Name): void {
        m.components.splice(this.index, 0, unescape(this.component, m.delimiter));
        expect(r.insert(this.index, this.component));
    }
}

class AppendUnescapedCommand implements fc.Command<Model, Name> {
    constructor(readonly component: string) {}
    toString = () => `append(${this.component})`;
    check(m: Readonly<Model>): boolean {
        return !isEscaped(this.component, m.delimiter)
    }
    run(m: Model, r: Name): void {
        expect(() => r.append(this.component)).toThrowError();
    }
}

class AppendCommand implements fc.Command<Model, Name> {
    constructor(readonly component: string) {}
    toString = () => `append(${this.component})`;
    check(m: Readonly<Model>): boolean {
        return isEscaped(this.component, m.delimiter)
    }
    run(m: Model, r: Name): void {
        m.components.push(unescape(this.component, m.delimiter));
        expect(r.append(this.component));
    }
}

class RemoveOutOfBoundsCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number) {}
    toString = () => `remove(${this.index})`;
    check(m: Readonly<Model>): boolean {
        return this.index < 0 || this.index >= m.components.length
    }
    run(m: Model, r: Name): void {
        expect(() => r.remove(this.index)).toThrowError();
    }
}

class RemoveCommand implements fc.Command<Model, Name> {
    constructor(readonly index: number) {}
    toString = () => `remove(${this.index})`;
    check(m: Readonly<Model>): boolean {
        return this.index >= 0 && this.index < m.components.length
    }
    run(m: Model, r: Name): void {
        m.components.splice(this.index, 1);
        expect(r.remove(this.index));
    }
}

class ConcatCommand implements fc.Command<Model, Name> {
    constructor(readonly components: string[], readonly delimiter: string) {}
    toString = () => `concat(${this.components})`;
    check = (m: Readonly<Model>) => true;
    run(m: Model, r: Name): void {
        const name = new StringArrayName([""], this.delimiter);
        name.remove(0);
        this.components.forEach(c => name.append(c))
        
        m.components.push(...this.components.map(c => unescape(c, this.delimiter)))
        r.concat(name);
    }
}

const delimiter = fc.string({ maxLength: 1, minLength: 1 }).filter(d => d != ESCAPE_CHARACTER);
const component = fc.stringMatching(/^[^\\]*$/)
const escapedComponent = (delimiter: string) => component.map(c => escape(c, delimiter))
const unescapedComponent = (delimiter: string) => component.filter(c => c.includes(delimiter))
const nameArb = delimiter.chain(d => fc.tuple(fc.constant(d), fc.array(escapedComponent(d), { minLength: 1 }))).map(([d, components]) => new StringArrayName(components, d))

const allCommands = (d: string) => [
    fc.constant(new AsStringCommand()),
    fc.constant(new AsDataStringCommand()),
    nameArb.map((n) => new IsEqualCommand(n)),
    fc.constant(new GetHashCodeCommand()),
    fc.constant(new IsEmptyCommand()),
    fc.constant(new GetDelimiterCharacterCommand()),
    fc.constant(new GetNoComponentsCommand()),
    fc.integer().map(index => new GetComponentOutOfBoundsCommand(index)),
    fc.integer().map(index => new GetComponentCommand(index)),
    fc.tuple(fc.integer(), escapedComponent(d)).map(([index, component]) => new SetComponentOutOfBoundsCommand(index, component)),
    fc.tuple(fc.integer(), unescapedComponent(d)).map(([index, component]) => new SetComponentUnescapedCommand(index, component)),
    fc.tuple(fc.integer(), escapedComponent(d)).map(([index, component]) => new SetComponentCommand(index, component)),
    fc.tuple(fc.integer(), escapedComponent(d)).map(([index, component]) => new InsertOutOfBoundsCommand(index, component)),
    fc.tuple(fc.integer(), unescapedComponent(d)).map(([index, component]) => new InsertUnescapedCommand(index, component)),
    fc.tuple(fc.integer(), escapedComponent(d)).map(([index, component]) => new InsertCommand(index, component)),
    unescapedComponent(d).map(component => new AppendUnescapedCommand(component)),
    escapedComponent(d).map(component => new AppendCommand(component)),
    fc.integer().map(index => new RemoveOutOfBoundsCommand(index)),
    fc.integer().map(index => new RemoveCommand(index)),
    delimiter.chain(d => fc.tuple(fc.constant(d), fc.array(escapedComponent(d)))).map(([d, components]) => new ConcatCommand(components, d))
];
    
const delimWithCommands = delimiter.chain(d => fc.record({
    delimiter: fc.constant(d),
    commands: fc.commands(allCommands(d))
}))

describe("Name tests", () => {
    it.prop([delimWithCommands], { verbose: 2 })("StringName Model", ({ delimiter, commands }) => {
        const setup = () => {
            return {
                model: { delimiter: delimiter, components: [""] },
                real: new StringName("", delimiter)
            }
        };
        
        fc.modelRun(setup, commands)
    })

    it.prop([delimWithCommands], { verbose: 2 })("StringArrayName Model", ({ delimiter, commands }) => {
        const setup = () => {
            return {
                model: { delimiter: delimiter, components: [""] },
                real: new StringArrayName([""], delimiter)
            }
        };
        
        fc.modelRun(setup, commands)
    })

    it("StringArrayName empty array", () => {
        expect(() => new StringArrayName([])).toThrowError();
    })
})
    
