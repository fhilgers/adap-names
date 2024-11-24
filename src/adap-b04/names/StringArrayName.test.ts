import { describe, it } from "node:test";
import { StringArrayName } from "./StringArrayName";
import { expect } from "vitest";
import { InvalidStateException } from "../common/InvalidStateException";
import { ESCAPE_CHARACTER } from "../common/Printable";
import { MethodFailureException } from "../common/MethodFailureException";

describe("StringArrayName tests", () => {
    it("preconditions", () => {
        const name = new StringArrayName(["oss", "fau", "de"]);
        
        expect(() => name.getComponent(-1)).toThrow();
        expect(() => name.getComponent(3)).toThrow();
        expect(() => name.getComponent(1000)).toThrow();
        expect(() => name.getComponent(-1000)).toThrow();
        
        expect(() => name.setComponent(-1, "oss")).toThrow();
        expect(() => name.setComponent(3, "oss")).toThrow();
        
        expect(() => name.insert(-1, "oss")).toThrow();
        expect(() => name.insert(4, "oss")).toThrow();
        
        expect(() => name.remove(-1)).toThrow();
        expect(() => name.remove(3)).toThrow();
        
        expect(() => name.append(".")).toThrow();
        expect(() => name.insert(0, ".")).toThrow();
        expect(() => name.setComponent(0, ".")).toThrow();
        
        expect(() => new StringArrayName(null as any)).toThrow();
        expect(() => new StringArrayName(undefined as any)).toThrow();
        expect(() => new StringArrayName([])).toThrow();
        expect(() => new StringArrayName(["abc"], "abc")).toThrow();
        expect(() => new StringArrayName(["abc"], `${ESCAPE_CHARACTER}`)).toThrow();
        expect(() => new StringArrayName(["abc"], null as any)).toThrow();
        expect(new StringArrayName(["abc"], undefined as any)); // delimiter? sets to default if undefined
    })
    
    it("postconditions", () => {
        const name = new StringArrayName(["oss\\.", "fau", "de"]);
        
        (name as any).mask = function (c: string) {
            return c;
        }
        
        expect(() => name.getComponent(0)).toThrow(new MethodFailureException("component is not masked"));
    })
    
    it("class invariants", () => {
        const name = new StringArrayName(["oss", "fau", "de"]);
        
        (name["components"] as any) = [1, 2, 3];
        
        expect(() => name.getComponent(0)).toThrow(new InvalidStateException("component is not a string"));

        (name["components"] as any) = {};

        expect(() => name.getComponent(0)).toThrow(new InvalidStateException("components is not an array"));
    })
})