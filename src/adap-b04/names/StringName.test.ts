import { describe, it } from "node:test";
import { StringArrayName } from "./StringArrayName";
import { expect } from "vitest";
import { InvalidStateException } from "../common/InvalidStateException";
import { ESCAPE_CHARACTER } from "../common/Printable";
import { MethodFailureException } from "../common/MethodFailureException";
import { StringName } from "./StringName";

describe("StringArrayName tests", () => {
    it("preconditions", () => {
        const name = new StringName("oss.fau.de");
        
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
})