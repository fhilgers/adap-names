import { describe, expect } from "vitest";
import { checkEscaped, checkNotEscaped, escape, isEscaped, isNotEscaped, isValid, joinUnescapedComponents, splitEscapedComponents, unescape } from "./Util";
import { ESCAPE_CHARACTER } from "../common/Printable";
import { fc, it } from "@fast-check/vitest";

const delimiter = fc.string({ maxLength: 1, minLength: 1 }).filter(d => d != ESCAPE_CHARACTER);
const unescapedComponent = fc.stringMatching(/^[^\\]*$/)


describe("Escaping", () => {
    describe("basic", () => {
        const delimiter = ".";
        it("valid escaping", () => {

            expect(isEscaped(`${ESCAPE_CHARACTER}${delimiter}`, delimiter)).toBe(true);
            expect(isEscaped(`aa${ESCAPE_CHARACTER}${delimiter}bb`, delimiter)).toBe(true);
            expect(isEscaped(`aa${ESCAPE_CHARACTER}${delimiter}`, delimiter)).toBe(true);
            expect(isEscaped(`${ESCAPE_CHARACTER}${delimiter}bb`, delimiter)).toBe(true);

        })

        it("unescaped delimiter", () => {
            expect(isEscaped(`${delimiter}`, delimiter)).toBe(false);
            expect(isEscaped(`aa${delimiter}bb`, delimiter)).toBe(false);
            expect(isEscaped(`aa${delimiter}`, delimiter)).toBe(false);
            expect(isEscaped(`${delimiter}bb`, delimiter)).toBe(false);
        })

        it("escaping non delimiter", () => {
            expect(isValid(`${ESCAPE_CHARACTER}a`, delimiter)).toBe(false);
        })

        it("escaping escape", () => {
            expect(isValid(`${ESCAPE_CHARACTER}${ESCAPE_CHARACTER}`, delimiter)).toBe(true);
            expect(escape(`${ESCAPE_CHARACTER}`, delimiter)).toBe(`${ESCAPE_CHARACTER}${ESCAPE_CHARACTER}`);
            expect(unescape(`${ESCAPE_CHARACTER}${ESCAPE_CHARACTER}`, delimiter)).toBe(`${ESCAPE_CHARACTER}`)
        })
    })

    
    const escapingInput = 
        fc.record({
            delimiter: delimiter,
            component: unescapedComponent,
        })

    it.prop([escapingInput])("escaping roundtrip", ({ delimiter, component }) => {
        expect(isNotEscaped(component, delimiter)).toBe(true);
        expect(checkNotEscaped(component, delimiter));

        const escaped = escape(component, delimiter);
        expect(isEscaped(escaped, delimiter)).toBe(true);
        expect(checkEscaped(escaped, delimiter));
        
        const unescaped = unescape(escaped, delimiter);
        expect(isNotEscaped(unescaped, delimiter)).toBe(true);
        expect(checkNotEscaped(unescaped, delimiter));

        expect(unescaped).toBe(component)
    })
    
    const splitJoinInput = 
        fc.record({
            delimiter: delimiter,
            components: fc.array(unescapedComponent, { minLength: 1 }),
        })
    
    it.prop([splitJoinInput])("split join roundtrip", ({ delimiter, components }) => {
        const joined = joinUnescapedComponents(components, delimiter);
        const split = splitEscapedComponents(joined, delimiter);
        expect(split).toEqual(components)
    })
    
    it("split fixtures", () => {
        const delimiter = ".";
        
        expect(splitEscapedComponents("oss.fau.de", delimiter)).toEqual(["oss", "fau", "de"])
        expect(splitEscapedComponents("", delimiter)).toEqual([""])
        expect(splitEscapedComponents(".", delimiter)).toEqual(["", ""])
        expect(splitEscapedComponents(".oss", delimiter)).toEqual(["", "oss"])
        expect(splitEscapedComponents("oss.", delimiter)).toEqual(["oss", ""])
        
        expect(splitEscapedComponents("oss\\.fau.de", delimiter)).toEqual(["oss.fau", "de"])
        expect(splitEscapedComponents("\\.", delimiter)).toEqual(["."])
        expect(splitEscapedComponents(".\\.", delimiter)).toEqual(["", "."])
        expect(splitEscapedComponents("\\.oss", delimiter)).toEqual([".oss"])
        expect(splitEscapedComponents("oss\\.", delimiter)).toEqual(["oss."])
        
        expect(splitEscapedComponents("\\\\.oss", delimiter)).toEqual(["\\", "oss"])
        expect(splitEscapedComponents("oss\\\\.", delimiter)).toEqual(["oss\\", ""])
    })
    
    it("join fixtures", () => {
        const delimiter = ".";
        
        expect(joinUnescapedComponents(["oss", "fau", "de"], delimiter)).toBe("oss.fau.de")
        expect(joinUnescapedComponents([""], delimiter)).toBe("")
        expect(joinUnescapedComponents(["", ""], delimiter)).toBe(".")
        expect(joinUnescapedComponents(["", "oss"], delimiter)).toBe(".oss")
        expect(joinUnescapedComponents(["oss", ""], delimiter)).toBe("oss.")

        expect(joinUnescapedComponents(["oss.fau", "de"], delimiter)).toBe("oss\\.fau.de")
        expect(joinUnescapedComponents(["."], delimiter)).toBe("\\.")
        expect(joinUnescapedComponents(["", "."], delimiter)).toBe(".\\.")
        expect(joinUnescapedComponents([".oss"], delimiter)).toBe("\\.oss")
        expect(joinUnescapedComponents(["oss."], delimiter)).toBe("oss\\.")

        expect(joinUnescapedComponents(["\\", "\\"], delimiter)).toBe("\\\\.\\\\")
    })
})
