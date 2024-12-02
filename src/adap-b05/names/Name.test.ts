import { fc, it } from "@fast-check/vitest";
import { describe } from "node:test";
import { expect } from "vitest";
import { StringArrayName } from "./StringArrayName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { StringName } from "./StringName";


describe("Name tests", () => {
    it("StringArrayName Constructor Preconditions", () => {
        expect(() => new StringArrayName(["oss", "\\.fau", "\\\\"])).not.toThrow();
        expect(() => new StringArrayName(["oss", "\\/fau", "\\\\"], "/")).not.toThrow();
        
        // We escape . but / is the delimiter, so this should fail
        expect(() => new StringArrayName(["oss", "\\.fau", "\\\\"], "/")).toThrow(new IllegalArgumentException("component is not masked"));
        
        expect(() => new StringArrayName([])).toThrow(new IllegalArgumentException("other must have at least one component"));
        expect(() => new StringArrayName(null as any)).toThrow(new IllegalArgumentException("other is null or undefined"));
        expect(() => new StringArrayName(undefined as any)).toThrow(new IllegalArgumentException("other is null or undefined"));
        
        expect(() => new StringArrayName(["abc"], "\\")).toThrow(new IllegalArgumentException("delimiter can't be the escape character"));
        expect(() => new StringArrayName(["abc"], "abc")).toThrow(new IllegalArgumentException("delimiter can only contain a single char"));
        expect(() => new StringArrayName(["abc"], "")).toThrow(new IllegalArgumentException("delimiter can only contain a single char"));
        expect(() => new StringArrayName(["abc"], null as any)).toThrow(new IllegalArgumentException("delimiter is null or undefined"));
        
        // We expect the delimiter to be default so undefined should work
        expect(() => new StringArrayName(["abc"], undefined as any)).not.toThrow();
    })
    
    it("StringArrayName Constructor Postconditions", () => {
        const fakeArrayThatHasNoComponentsAfterMap = new Array<string>(1);
        fakeArrayThatHasNoComponentsAfterMap.length = 1;
        (fakeArrayThatHasNoComponentsAfterMap as any).map = (fn: any) => new Array<string>(0);
        
        expect(() => new StringArrayName(fakeArrayThatHasNoComponentsAfterMap)).toThrow(new Error("name must have at least one component after construction"));
        
        const fakeArrayThatIsNoArray = { length: 1, map: (fn: any) => this };

        expect(() => new StringArrayName(fakeArrayThatIsNoArray as any)).toThrow(new Error("components is not an array"));
    });
    
    it("StringName Constructor Preconditions", () => {
        expect(() => new StringName("")).not.toThrow();

        // Components with escape char should not work, as StringName expects each component to be masked
        expect(() => new StringName("\\")).toThrow();
        expect(() => new StringName("\\.\\")).toThrow();
        expect(() => new StringName("\\a")).toThrow();
        expect(() => new StringName("\\a", "a")).not.toThrow();
        expect(() => new StringName("\\.")).not.toThrow();
        expect(() => new StringName("....\\")).toThrow();
        expect(() => new StringName("///", "/")).not.toThrow();
        
        expect(() => new StringName(null as any)).toThrow(new IllegalArgumentException("other is null or undefined"));
        expect(() => new StringName(undefined as any)).toThrow(new IllegalArgumentException("other is null or undefined"));

        expect(() => new StringName("", "")).toThrow(new IllegalArgumentException("delimiter can only contain a single char"));
        expect(() => new StringName("", "abc")).toThrow(new IllegalArgumentException("delimiter can only contain a single char"));
        expect(() => new StringName("", "\\")).toThrow(new IllegalArgumentException("delimiter can't be the escape character"));
        expect(() => new StringName("", null as any)).toThrow(new IllegalArgumentException("delimiter is null or undefined"));
        expect(() => new StringName("", undefined as any)).not.toThrow();
    });
    
    it("StringName Constructor Postconditions", () => {
        // Cannot ovveride the utils function used in constructor to force the number of components to be 0
    });
})

