import { boolean } from "fast-check";
import { ESCAPE_CHARACTER } from "../common/Printable";
import { AssertionDispatcher, Exception } from "./AssertionDispatcher";
import { Name } from "./Name";

/**
 * This function returns true if every delimiter character in the component is escaped.
 * @param component The component to check
 * @param delimiter The delimiter which has to be masked
 * @returns Whether the component is properly masked
 */
export function isMasked(component: string, delimiter: string) {
    let nextEscaped = false;

    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
            if (c != delimiter && c != ESCAPE_CHARACTER) {
                // Can only escape delimiter or escape char
                // That means if any other character is escaped, the component is not valid
                return false;
            }
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } else if (c == delimiter) {
                return false;
            }
        }
    }
    
    // if the last character is an escape character, the component cannot be masked
    return !nextEscaped;
}

export function splitMaskedComponents(components: string, delimiter: string) {
    const parts = [];
    const current = [];
    
    let nextEscaped = false;
    for (const c of components) {
        if (nextEscaped) {
            current.push(c)
            nextEscaped = false;
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
                current.push(c);
            } else if (c == delimiter) {
                parts.push(current.join(""))
                current.length = 0;
            } else {
                current.push(c)
            }
        }
    }

    // unconditional, because "" -> one empty part and so forth ("abc." -> ["abc", ""], "xyz.abc." -> ["xyz", "abc", ""])
    parts.push(current.join(""))
    
    return parts;
}

export function listCompare(a: string[], b: string[]) {
    if (a.length != b.length) return false;

    for (let i = 0; i < a.length; i++) {
        if (a[i] != b[i]) {
            return false;
        }
    }
    return true;
}

export function getHashCode(s: string): number {
    let hashCode: number = 0;
    for (let i = 0; i < s.length; i++) {
        let c = s.charCodeAt(i);
        hashCode = (hashCode << 5) - hashCode + c;
        hashCode |= 0;
    }
    return hashCode;
}

export function unmask(component: string, delimiter: string): string {
    AssertionDispatcher.dispatch(Exception.Precondition, isMasked(component, delimiter), `${component} is not masked`);

    const unmaskedComponent = new Array(component.length);
    unmaskedComponent.length = 0;
    
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
            unmaskedComponent.push(c);
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } else {
                unmaskedComponent.push(c);
            }
        }
    }
    
    return unmaskedComponent.join("");
}

export function mask(component: string, delimiter: string): string {
    const maskedComponent = new Array(component.length);
    maskedComponent.length = 0;

    let nextEscaped = false;
    
    for (const c of component) {
        if (c == delimiter || c == ESCAPE_CHARACTER) {
            maskedComponent.push(ESCAPE_CHARACTER);
            maskedComponent.push(c);
        } else {
            maskedComponent.push(c);
        }
    }
    
    return maskedComponent.join("");
}

export function replaceDelimiter(component: string, fromDelimiter: string, toDelimiter: string | null): string {
    if (fromDelimiter == toDelimiter) return component;
    
    const unmasked = unmask(component, fromDelimiter);
    
    if (toDelimiter) {
        return mask(unmasked, toDelimiter)
    } else {
        return unmasked
    }
}

export function getComponents(name: Name, delimiter: string | null = name.getDelimiterCharacter()): string[] {
    const collector = Array(name.getNoComponents())
    for (let i = 0; i < collector.length; i++) {
        collector[i] = replaceDelimiter(name.getComponent(i), name.getDelimiterCharacter(), delimiter);
    }
    return collector
}