import { describe } from "node:test";
import { expect, it } from "vitest";
import { RootNode } from "./RootNode";
import { File } from "./File";

const createDummyFile = () => new File("file", RootNode.getRootNode());

describe("File tests", () => {
    it("Closing closed file should fail", () => {
        const file = createDummyFile();
        
        expect(() => file.close()).toThrow();
    })
    it("Opening closed file should work", () => {
        const file = createDummyFile();

        expect(() => file.open()).not.toThrow();
    });
    it("Closing open file should work", () => {
        const file = createDummyFile();
        file.open();

        expect(() => file.close()).not.toThrow();
    });
    it("Opening open file should fail", () => {
        const file = createDummyFile();
        file.open();

        expect(() => file.open()).toThrow();
    });
})