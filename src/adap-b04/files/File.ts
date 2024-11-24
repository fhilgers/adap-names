import { Node } from "./Node";
import { Directory } from "./Directory";
import { InvalidStateException } from "../common/InvalidStateException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
        this.assertClassInvariants();
    }

    public open(): void {
        this.assertClassInvariants();
        // I have explicitly opted to check the negatives to provide better error messages
        this.assertIsNotInState([FileState.DELETED, FileState.OPEN]);
        this.assertIsInState(FileState.CLOSED);

        this.doSetFileState(FileState.OPEN);
        
        this.assertIsInState(FileState.OPEN);
    }

    public close(): void {
        this.assertClassInvariants();
        // I have explicitly opted to check the negatives to provide better error messages
        this.assertIsNotInState([FileState.DELETED, FileState.CLOSED]);
        this.assertIsInState(FileState.OPEN);

        this.doSetFileState(FileState.CLOSED);
        
        this.assertIsInState(FileState.CLOSED);
    }

    protected doGetFileState(): FileState {
        return this.state;
    }
    
    protected doSetFileState(state: FileState): void {
        this.state = state;
    }

    protected assertIsNotInState(states: FileState[]) {
        for (const state of states) {
            InvalidStateException.assertCondition(this.doGetFileState() !== state, `file is ${this.doGetFileState()}`);
        }
    }
    
    protected assertIsInState(state: FileState) {
        InvalidStateException.assertCondition(this.doGetFileState() === state, `file should be ${state} but is ${this.doGetFileState()}`);
    }
    
    protected assertClassInvariants() {
        InvalidStateException.assertCondition(
            this.doGetFileState() == FileState.CLOSED || this.doGetFileState() == FileState.OPEN || this.doGetFileState() == FileState.DELETED,
            `file is in unknown state ${this.doGetFileState()}`
        );
    }
}