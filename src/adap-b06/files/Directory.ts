import { InvalidStateException } from "../common/InvalidStateException";
import { Node } from "./Node";

export class Directory extends Node {

    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
    }

    public hasChildNode(cn: Node): boolean {
        return this.childNodes.has(cn);
    }

    public addChildNode(cn: Node): void {
        this.childNodes.add(cn);
        
        this.assertClassInvariants()
    }

    public removeChildNode(cn: Node): void {
        this.childNodes.delete(cn); // Yikes! Should have been called remove
        
        this.assertClassInvariants()
    }
    
    protected override findNodesInversion(bn: string, nodes: Set<Node>, seen: Set<Node>) {
        InvalidStateException.assert(!seen.has(this), "invalid file tree, duplicate nodes");

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