import { AbstractName } from "./AbstractName";

import { checkValid, checkEscaped, unescape, escape } from "./Util"

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(other: string[], delimiter?: string) {
        super(delimiter);

        if (other.length == 0) {
            throw new Error("Empty components not allowed");
        }

        this.components = other.map(c => {
            checkValid(c, this.getDelimiterCharacter());
            checkEscaped(c, this.getDelimiterCharacter());
            return unescape(c, this.getDelimiterCharacter());
        })
    }

    getNoComponents(): number {
        return this.components.length;
    }

    getComponent(i: number): string {
        this.checkBounds(i, 0, this.getNoComponents());
        
        // There was no specification whether getComponent should be escaped or not.
        // I chose to escape it with the classes set delimiter, as that is the specification
        // for inputs to insert, append, and setComponent.
        return escape(this.components[i], this.getDelimiterCharacter());
    }
    setComponent(i: number, c: string) {
        this.checkBounds(i, 0, this.getNoComponents());
        this.components[i] = unescape(c, this.getDelimiterCharacter());
    }

    insert(i: number, c: string) {
        this.checkBounds(i, 0, this.getNoComponents() + 1)
        this.components.splice(i, 0, unescape(c, this.getDelimiterCharacter()));
    }
    append(c: string) {
        this.components.push(unescape(c, this.getDelimiterCharacter()));
    }
    remove(i: number) {
        this.checkBounds(i, 0, this.getNoComponents())
        this.components.splice(i, 1);
    }

    private checkBounds(i: number, left: number, right: number) {
        if (i < left || i >= right) {
            throw new Error("index out of bounds")
        }
    }
}
