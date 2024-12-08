import { describe, expect, it, vi } from "vitest";
import { StringName } from "./StringName";
import { StringArrayName } from "./StringArrayName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { DEFAULT_DELIMITER } from "../common/Printable";

describe("Name tests", () => {
    
    const stringNameConstructor = (components: string[], delimiter: string = DEFAULT_DELIMITER) => {
        const name = new StringName(components.join(delimiter), delimiter);
        if (components.length == 0) {
            name.remove(0);
        }
        return name
    }
    
    const stringArrayNameConstructor = (components: string[], delimiter: string = DEFAULT_DELIMITER) => {
        return new StringArrayName(components, delimiter);
    }

    describe.each([
        { name: "StringName", constructor: stringNameConstructor },
        { name: "StringArrayName", constructor: stringArrayNameConstructor }
    ])("$name", ({ constructor }) => {
        describe("calling isEmpty()", () => {
            
            it("should return false after construction", () => {
                expect(constructor([""]).isEmpty()).toBe(false);
            })
            
            it("should return true after removal of elements", () => {
                expect(constructor([""]).remove(0).isEmpty()).toBe(true);
            })
            
        })
        
        describe("calling getNoComponents()", () => {
            it("should return 1 after construction", () => {
                expect(constructor([""]).getNoComponents()).toBe(1);
            })
            it("should update when adding and removing components", () => {
                expect(constructor([""]).append("").getNoComponents()).toBe(2);
                expect(constructor([""]).remove(0).getNoComponents()).toBe(0);
            })
        })
        
        describe("calling getComponent(i)", () => {
            it("should fail when index is negative", () => {
                expect(() => constructor([""]).getComponent(-1)).toThrow(IllegalArgumentException)
            })
            it("should fail when index is too small", () => {
                expect(() => constructor([""]).remove(0).getComponent(0)).toThrow(IllegalArgumentException)
            })
            it("should fail when index is too big", () => {
                expect(() => constructor([""]).getComponent(1)).toThrow(IllegalArgumentException)
            })
            it("should return component when index is in bounds", () => {
                expect(constructor([""]).getComponent(0)).toBe("")
            })
        })
        
        describe("calling setComponent(i, c)", () => {
            it("should fail when index is negative", () => {
                expect(() => constructor([""]).setComponent(-1, "")).toThrow(IllegalArgumentException)
            })
            it("should fail when index is too small", () => {
                expect(() => constructor([""]).remove(0).setComponent(0, "")).toThrow(IllegalArgumentException)
            })
            it("should fail when index is too big", () => {
                expect(() => constructor([""]).setComponent(1, "")).toThrow(IllegalArgumentException)
            })
            it("should set component when index is in bounds", () => {
                expect(constructor([""]).setComponent(0, "other").getComponent(0)).toBe("other")
            })
            it("should fail when component contains unmasked delimiter", () => {
                expect(() => constructor([""]).setComponent(0, ".")).toThrow(IllegalArgumentException)
            })
            it("should not mutate original name", () => {
                const base = constructor([""]);
                base.setComponent(0, "other");
                expect(base.getComponent(0)).toBe("");
                expect(base.getNoComponents()).toBe(1);
            })
        });

        describe("calling insert(i, c)", () => {
            it("should fail when index is negative", () => {
                expect(() => constructor([""]).insert(-1, "")).toThrow(IllegalArgumentException)
            })
            it("should fail when index is too big", () => {
                expect(() => constructor([""]).insert(2, "")).toThrow(IllegalArgumentException)
            })
            it("should insert component at the start", () => {
                expect(constructor([""]).insert(0, "other").getComponent(0)).toBe("other")
            })
            it("should insert component at the end", () => {
                expect(constructor([""]).insert(1, "other").getComponent(1)).toBe("other")
            })
            it("should fail when component contains unmasked delimiter", () => {
                expect(() => constructor([""]).insert(0, ".")).toThrow(IllegalArgumentException)
            })
            it("should not mutate original name", () => {
                const base = constructor([""]);
                base.insert(0, "other");
                expect(base.getComponent(0)).toBe("");
                expect(base.getNoComponents()).toBe(1);
            })
        })
        
        describe("calling append(c)", () => {
            it("should fail when component contains unmasked delimiter", () => {
                expect(() => constructor([""]).append(".")).toThrow(IllegalArgumentException)
            })
            it("should append the new component", () => {
                const name = constructor([""]).append("other");
                expect(name.getNoComponents()).toBe(2);
                expect(name.getComponent(0)).toBe("");
                expect(name.getComponent(1)).toBe("other");
            })
            it("should not mutate original name", () => {
                const base = constructor([""]);
                base.append("other");
                expect(base.getComponent(0)).toBe("");
                expect(base.getNoComponents()).toBe(1);
            })
        })
        
        describe("calling remove(i)", () => {
            it("should fail when index is negative", () => {
                expect(() => constructor([""]).remove(-1)).toThrow(IllegalArgumentException);
            })
            it("should fail when name is empty", () => {
                expect(() => constructor([""]).remove(0).remove(0)).toThrow(IllegalArgumentException);
            })
            it("should remove the component", () => {
                const base = constructor([""]).append("other").remove(0);
                expect(base.getNoComponents()).toBe(1);
                expect(base.getComponent(0)).toBe("other");
            })
        })

        describe("calling concat(other)", () => {
            it("should concat with different delimiters", () => {
                const n1 = new StringName("./", ".")
                const n2 = new StringName("/.", "/")
                const res1 = n1.concat(n2);
                const res2 = n2.concat(n1);
                expect(res1.getDelimiterCharacter()).toBe(n1.getDelimiterCharacter());
                expect(res2.getDelimiterCharacter()).toBe(n2.getDelimiterCharacter());
                expect(res1.getNoComponents()).toBe(4);
                expect(res2.getNoComponents()).toBe(4);
                expect(res1.getComponent(3)).toBe("\\.")
                expect(res2.getComponent(3)).toBe("\\/")
            })
        })
        
        describe("calling clone()", () => {
            it("should return the same element, as everything is immutable", () => {
                const a = constructor([""])
                expect(a).toBe(a.clone())
            })
        })
        
        describe("calling asString(delim)", () => {
            it("should return joined components without escaping", () => {
                expect(constructor(["a", "b", "c", "\\."]).asString("/")).toBe("a/b/c/.")
            })
        })
        
        describe("calling asDataString()", () => {
            it("should return joined components with escaping", () => {
                expect(constructor(["a", "b", "c", "\\."]).asDataString()).toBe("a.b.c.\\.")
            })
        })
        
        describe("calling getDelimiterCharacter()", () => {
            it("should return the delimiter", () => {
                expect(constructor([], "/").getDelimiterCharacter()).toBe("/")
            })
        })
        
        describe("calling isEqual(other)", () => {
            it("should be reflexive", () => {
                const name = constructor(["a", "b", "\\.", "c"]);
                expect(name.isEqual(name)).toBe(true);
            })
            it("should be symmetric", () => {
                const name = constructor(["a", "b", "\\.", "c"]);
                const other1 = constructor(["a", "b", "\\.", "c"]);
                const other2 = constructor(["a", "b", "\\.", "d"]);
                
                if (name.isEqual(other1)) {
                    expect(other1.isEqual(name)).toBe(true);
                }
                
                if (!name.isEqual(other2)) {
                    expect(other2.isEqual(other1)).toBe(false);
                }
            })
            it("should be transitive", () => {
                const name = constructor(["a", "b", "\\.", "c"]);
                const other1 = constructor(["a", "b", "\\.", "c"]);
                const other2 = constructor(["a", "b", "\\.", "c"]);
                
                if (name.isEqual(other1) && other1.isEqual(other2)) {
                    expect(name.isEqual(other2)).toBe(true);
                }
            })
            it("should be consistent", () => {
                const name = constructor(["a", "b", "\\.", "c"]);
                const other = constructor(["a", "b", "\\.", "c"]);
                
                expect(name.isEqual(other)).toBe(true);
                name.append("");
                expect(name.isEqual(other)).toBe(true);
            })
            it("should return false for null", () => {
                expect(constructor([]).isEqual(null as any)).toBe(false);
            })
        })
    })
});