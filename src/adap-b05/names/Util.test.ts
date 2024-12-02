import { it } from "node:test";
import { describe, expect } from "vitest";
import { isMasked, isNotMasked, joinUnmaskedComponents, mask, splitMaskedComponents, unmask } from "./Util";

describe("Util tests", () => {
    it("isMasked", () => {
        expect(isMasked("\\", ".")).toBe(false);
        expect(isMasked("\\a", ".")).toBe(false);
        expect(isMasked("\\\\", ".")).toBe(true);
        expect(isMasked("\\.", ".")).toBe(true);
        expect(isMasked(".", ".")).toBe(false);
        expect(isMasked("\\ ", " ")).toBe(true);
    })
    
    it("isNotMasked", () => {
        expect(isNotMasked("\\", ".")).toBe(true);
        expect(isNotMasked(".", ".")).toBe(true);
        expect(isNotMasked("\\\\", ".")).toBe(false);
        expect(isNotMasked("\\.", ".")).toBe(false);
    })
    
    it("mask", () => {
        expect(mask("\\", ".")).toBe("\\\\");
        expect(mask(".", ".")).toBe("\\.");
        //expect(() => mask("\\\\", ".")).toThrow();
        //expect(() => mask("\\.", ".")).toThrow();
    })
    
    it("unmask", () => {
        expect(unmask("\\\\", ".")).toBe("\\");
        expect(unmask("\\.", ".")).toBe(".");
        //expect(() => unmask("\\", ".")).toThrow();
        //expect(() => unmask(".", ".")).toThrow();
    })
    
    it("splitMaskedComponents", () => {
        expect(splitMaskedComponents("\\\\", ".")).toEqual(["\\"])
        expect(splitMaskedComponents("\\.", ".")).toEqual(["."])
        expect(splitMaskedComponents(".", ".")).toEqual(["", ""])
        expect(splitMaskedComponents("\\\\.oss", ".")).toEqual(["\\", "oss"])
        expect(splitMaskedComponents("oss\\.", ".")).toEqual(["oss."])
        expect(splitMaskedComponents("\\\\.oss", ".")).toEqual(["\\", "oss"])
        expect(splitMaskedComponents("oss\\\\.", ".")).toEqual(["oss\\", ""])
    })
    
    it("joinUnmaskedComponents", () => {
        expect(joinUnmaskedComponents(["\\"], ".")).toBe("\\\\")
        expect(joinUnmaskedComponents(["."], ".")).toBe("\\.")
        expect(joinUnmaskedComponents(["", ""], ".")).toBe(".")
        expect(joinUnmaskedComponents(["\\", "oss"], ".")).toBe("\\\\.oss")
        expect(joinUnmaskedComponents(["oss."], ".")).toBe("oss\\.")
        expect(joinUnmaskedComponents(["\\", "\\"], ".")).toBe("\\\\.\\\\")
    })
})