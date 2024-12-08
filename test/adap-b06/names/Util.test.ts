import { it } from "node:test";
import { describe, expect } from "vitest";
import { isMasked, mask, splitMaskedComponents, unmask } from "../../../src/adap-b06/names/Util";

describe("Util tests", () => {
    it("isMasked", () => {
        expect(isMasked("\\", ".")).toBe(false);
        expect(isMasked("\\a", ".")).toBe(false);
        expect(isMasked("\\\\", ".")).toBe(true);
        expect(isMasked("\\.", ".")).toBe(true);
        expect(isMasked(".", ".")).toBe(false);
        expect(isMasked("\\ ", " ")).toBe(true);
    })
    
    it("mask", () => {
        expect(mask("\\", ".")).toBe("\\\\");
        expect(mask(".", ".")).toBe("\\.");
    })
    
    it("unmask", () => {
        expect(unmask("\\\\", ".")).toBe("\\");
        expect(unmask("\\.", ".")).toBe(".");
    })
    
    it("splitMaskedComponents", () => {
        expect(splitMaskedComponents("\\\\", ".")).toEqual(["\\\\"])
        expect(splitMaskedComponents("\\.", ".")).toEqual(["\\."])
        expect(splitMaskedComponents(".", ".")).toEqual(["", ""])
        expect(splitMaskedComponents("\\\\.oss", ".")).toEqual(["\\\\", "oss"])
        expect(splitMaskedComponents("oss\\.", ".")).toEqual(["oss\\."])
        expect(splitMaskedComponents("\\\\.oss", ".")).toEqual(["\\\\", "oss"])
        expect(splitMaskedComponents("oss\\\\.", ".")).toEqual(["oss\\\\", ""])
    })
})