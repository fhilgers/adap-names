import { ESCAPE_CHARACTER } from "../common/Printable";

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
    
    let nextEscaped = false;
    const collector = [];

    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
            collector.push(c);
        } else if (c == ESCAPE_CHARACTER) {
            nextEscaped = true;
        } else {
            collector.push(c);
        }
    }
    
    return collector.join("");
}

export function escape(component: string, delimiter: string) {
    checkNotEscaped(component, delimiter);
    
    const collector = [];
    
    for (const c of component) {
        if (c == delimiter || c == ESCAPE_CHARACTER) {
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
            
            // Only escape delimiter or escape char
            if (c != delimiter && c != ESCAPE_CHARACTER) {
                return false;
            }
            
            nextEscaped = false;

        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } 
        }
    }
    
    return true;
}

export function isNotEscaped(component: string, delimiter: string) {
    let nextEscaped = false;
    let hasDelimiter = false;

    for (const c of component) {
        if (c == delimiter) {
            hasDelimiter = true;
        }
        
        if (nextEscaped) {
            nextEscaped = false
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true
            } else if (c == delimiter) {
                return true
            }
        }
    }

    return false || !hasDelimiter
} 

export function isEscaped(component: string, delimiter: string) {
    let nextEscaped = false;
    
    for (const c of component) {
        if (nextEscaped) {
            nextEscaped = false;
        } else {
            if (c == ESCAPE_CHARACTER) {
                nextEscaped = true;
            } else if (c == delimiter || c == ESCAPE_CHARACTER) {
                // delimiter and escape chars have to be escaped
                return false;
            }
        }
    }
    
    return !nextEscaped;
}
