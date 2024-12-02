import { exit } from "process";
import { AssertionDispatcher, ExceptionType } from "../common/AssertionDispatcher";
import { Exception } from "../common/Exception";
import { ServiceFailureException } from "../common/ServiceFailureException";
import { Node } from "./Node";

export class Directory extends Node {

    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
    }

    public add(cn: Node): void {
        this.assertClassInvariants()

        this.childNodes.add(cn);
        
        this.assertClassInvariants()
    }

    public remove(cn: Node): void {
        this.assertClassInvariants()
        
        this.childNodes.delete(cn); // Yikes! Should have been called remove
        
        this.assertClassInvariants()
    }
    
    protected override findNodesInversion(bn: string, nodes: Set<Node>, seen: Set<Node>) {
        AssertionDispatcher.dispatch(ExceptionType.CLASS_INVARIANT, !seen.has(this), "invalid file tree, duplicate nodes");

        super.findNodesInversion(bn, nodes, seen);
        for (const child of this.childNodes) {
            if (child instanceof Directory) {
                child.findNodesInversion(bn, nodes, seen);
            } else {
                child.findNodes(bn).forEach((n) => nodes.add(n))
            }
        }
    }
}