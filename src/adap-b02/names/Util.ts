import { ESCAPE_CHARACTER } from "./Name";

export function splitEscapedComponents(components: string, delimiter: string) {
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
                parts.push(unescape(current.join(""), delimiter))
                current.length = 0;
            } else {
                current.push(c)
            }
        }
    }
    
    // unconditional, because "" -> one empty part and so forth ("abc." -> ["abc", ""], "xyz.abc." -> ["xyz", "abc", ""])
    parts.push(unescape(current.join(""), delimiter))
    
    return parts;
}

export function joinUnescapedComponents(components: string[], delimiter: string) {
    return components.map(component => escape(component, delimiter)).join(delimiter)
}

export function unescape(component: string, delimiter: string) {
    checkValid(component, delimiter);
    checkEscaped(component, delimiter);
    
    const nextEscaped = false;
    const collector = [];
    
    for (const c of component) {
        if (c == ESCAPE_CHARACTER) {
            // ignore, checkEscaped guarantees, that the next char can only be the delimiter
        } else {
            collector.push(c)
        }
    }
    
    return collector.join("");
}

export function escape(component: string, delimiter: string) {
    checkValid(component, delimiter);
    checkNotEscaped(component, delimiter);
    
    const collector = [];
    
    for (const c of component) {
        if (c == delimiter) {
            collector.push(ESCAPE_CHARACTER + c)
        } else {
            collector.push(c)
        }
    }
    
    return collector.join("");
}

export function checkEscaped(component: string, delimiter: string) {
    if (!isEscaped(component, delimiter)) {
        throw new Error("component is not properly escaped");
    }
}

export function checkNotEscaped(component: string, delimiter: string) {
    if (!isNotEscaped(component, delimiter)) {
        throw new Error("component contains escape chars");
    }
}

export function checkValid(component: string, delimiter: string) {
    if (!isValid(component, delimiter)) {
        throw new Error("component is not valid")
    }
}

export function isValid(component: string, delimiter: string) {
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            
            if (c == ESCAPE_CHARACTER) {
                // The escape character can't be set, the delimiter character can.
                return false;
            } else if (c != delimiter) {
                // Cannot escape non delimiter
                return false;
            }
            
            nextEscaped = false;

        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } 
        }
    }
    
    return !nextEscaped;
}

export function isNotEscaped(component: string, delimiter: string) {
    return !component.includes(delimiter) || !component.includes(ESCAPE_CHARACTER)
} 

export function isEscaped(component: string, delimiter: string) {
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;

        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } else if (c == delimiter) {
                return false;
            }
        }
    }
    
    return true;
}