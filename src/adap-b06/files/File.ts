import { Node } from "./Node";
import { Directory } from "./Directory";
import { MethodFailedException } from "../common/MethodFailedException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
    }

    public open(): void {
        this.assertClassInvariants();
        this.assertFileState("pre", FileState.CLOSED);
        
        this.doSetFileState(FileState.OPEN);
        
        this.assertFileState("post", FileState.OPEN);
        this.assertClassInvariants();
    }

    public read(noBytes: number): Int8Array {
        this.assertClassInvariants();
        this.assertFileState("pre", FileState.OPEN);

        let result: Int8Array = new Int8Array(noBytes);
        // do something

        let tries: number = 0;
        for (let i: number = 0; i < noBytes; i++) {
            try {
                result[i] = this.readNextByte();
            } catch(ex) {
                tries++;
                if (ex instanceof MethodFailedException) {
                    // Oh no! What @todo?!
                }
            }
        }
        
        this.assertFileState("post", FileState.OPEN);
        this.assertClassInvariants();

        return result;
    }

    protected readNextByte(): number {
        return 0; // @todo
    }

    public close(): void {
        this.assertClassInvariants();
        this.assertFileState("pre", FileState.OPEN);
        
        this.doSetFileState(FileState.CLOSED);
        
        this.assertFileState("post", FileState.CLOSED);
        this.assertClassInvariants()
    }

    protected doGetFileState(): FileState {
        return this.state;
    }

    protected doSetFileState(state: FileState) {
        this.state = state;
    }
    
    protected assertFileState(ex: "pre" | "post" | "inv", state: FileState) {
        this.doAssert(ex, state == this.doGetFileState(), `invalid file state: expected ${state}, found ${this.doGetFileState()}`)
    }
    
    protected override assertClassInvariants(): void {
        super.assertClassInvariants()
        const state = this.doGetFileState()
        this.doAssert("inv", 
                                     state == FileState.CLOSED || state == FileState.DELETED || state == FileState.OPEN, `unknown file state ${state}`)
    }

}