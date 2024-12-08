import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

export namespace Exception {
    export const Precondition = "Precondition";
    export const Postcondition = "Postcondition";
    export const Invariant = "Invariant"
    
    export type Type = typeof Precondition | typeof Postcondition | typeof Invariant;
}

export class AssertionDispatcher {

    protected static instance: AssertionDispatcher = new AssertionDispatcher();
    
    protected constructor() { }

    public dispatch(type: Exception.Type, condition: boolean, message: string) {
        switch (type) {
            case Exception.Precondition: return IllegalArgumentException.assert(condition, message);
            case Exception.Postcondition: return MethodFailedException.assert(condition, message);
            case Exception.Invariant: return InvalidStateException.assert(condition, message);
        }
    }
    
    public static dispatch(type: Exception.Type, condition: boolean, message: string) {
        AssertionDispatcher.instance.dispatch(type, condition, message)
    }
}