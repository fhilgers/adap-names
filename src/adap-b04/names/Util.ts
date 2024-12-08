import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { ESCAPE_CHARACTER } from "../common/Printable";
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
                // That means if any other character is escaped, the component is not masked
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

/**
 * The function returns false if any delimiter was escaped, otherwise true.
 * @param component The component to check
 * @param delimiter The delimiter which has to be masked
 * @returns Whether the component is not masked
 */
export function isNotMasked(component: string, delimiter: string) {
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
            if (c == delimiter || c == ESCAPE_CHARACTER) {
                return false;
            }
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } 
        }
    }
    
    return true;
}

export function mask(component: string, delimiter: string) {
    //IllegalArgumentException.assertCondition(isNotMasked(component, delimiter), "component is already masked");

    const collector = [];
    
    for (const c of component) {
        if (c == delimiter || c == ESCAPE_CHARACTER) {
            collector.push(ESCAPE_CHARACTER + c)
        } else {
            collector.push(c)
        }
    }
    
    let maskedComponent = collector.join("");
    
    MethodFailedException.assert(isMasked(maskedComponent, delimiter), "could not mask component");
    
    return maskedComponent;
}

export function unmask(component: string, delimiter: string) {
    IllegalArgumentException.assert(isMasked(component, delimiter), "component is not masked");

    const collector = [];
    
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
            collector.push(c);
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } else {
                collector.push(c);
            }
        }
    }
    
    let unmaskedComponent = collector.join("");
    
    //MethodFailedException.assertCondition(isNotMasked(unmaskedComponent, delimiter), "could not unmask component");
    
    return unmaskedComponent;
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
                parts.push(unmask(current.join(""), delimiter))
                current.length = 0;
            } else {
                current.push(c)
            }
        }
    }

    // unconditional, because "" -> one empty part and so forth ("abc." -> ["abc", ""], "xyz.abc." -> ["xyz", "abc", ""])
    parts.push(unmask(current.join(""), delimiter))
    
    return parts;
}

export function joinUnmaskedComponents(components: string[], delimiter: string) {
    return components.map(component => mask(component, delimiter)).join(delimiter)
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


export function getUnmaskedComponents(name: Name): string[] {
    const collector = Array(name.getNoComponents())
    for (let i = 0; i < collector.length; i++) {
        collector[i] = unmask(name.getComponent(i), name.getDelimiterCharacter())
    }
    return collector
}
