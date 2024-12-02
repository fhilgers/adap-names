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
    
    public override findNodes(bn: string): Set<Node> {
        try {
            // NOTE: I have interpreted this function to traverse only downward into the leaves of the tree akin to tools like find and tree
            this.assertClassInvariants();

            const nodesList: Node[] = [];

            nodesList.push(...super.findNodes(bn));

            for (const child of this.childNodes) {
                nodesList.push(...child.findNodes(bn));
            }

            const nodes = new Set(nodesList)

            //this.assertFindNodesPostCondition(nodes, bn);
            this.assertClassInvariants();

            return nodes;
        } catch (e) {
            throw new ServiceFailureException("Could not find nodes", e as Exception);
        }
        
    }
}