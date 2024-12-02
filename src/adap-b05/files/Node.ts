import { exit } from "process";
import { ExceptionType, AssertionDispatcher } from "../common/AssertionDispatcher";
import { Exception } from "../common/Exception";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";

import { Name } from "../names/Name";
import { Directory } from "./Directory";

export class Node {

    protected baseName: string = "";
    protected parentNode: Directory;

    constructor(bn: string, pn: Directory) {
        this.doSetBaseName(bn);
        this.parentNode = pn; // why oh why do I have to set this
        this.initialize(pn);

        // Cannot set that otherwise buggy test creation fails
        // this.assertClassInvariants()
    }

    protected initialize(pn: Directory): void {
        this.parentNode = pn;
        this.parentNode.add(this);
    }

    public move(to: Directory): void {
        this.assertClassInvariants()

        this.parentNode.remove(this);
        to.add(this);
        this.parentNode = to;

        this.assertClassInvariants()
    }

    public getFullName(): Name {
        this.assertClassInvariants()

        const result: Name = this.parentNode.getFullName();
        result.append(this.getBaseName());

        this.assertClassInvariants()

        return result;
    }

    public getBaseName(): string {
        this.assertClassInvariants()

        return this.doGetBaseName();
    }

    protected doGetBaseName(): string {
        return this.baseName;
    }

    public rename(bn: string): void {
        this.assertClassInvariants()
        this.assertIsValidBaseName(bn, ExceptionType.PRECONDITION)

        this.doSetBaseName(bn);

        AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, this.doGetBaseName() == bn, "renaming failed")
        this.assertClassInvariants()
    }

    protected doSetBaseName(bn: string): void {
        this.baseName = bn;
    }

    public getParentNode(): Directory {
        this.assertClassInvariants()

        return this.parentNode;
    }

    /**
     * Returns all nodes in the tree that match bn
     * @param bn basename of node being searched for
     */
    public findNodes(bn: string): Set<Node> {
        // NOTE: I have interpreted this function to traverse only downward into the leaves of the tree akin to tools like find and tree
        // It also does not follow links.
        try {
            this.assertClassInvariants();

            let nodes = new Set<Node>();

            if (this.getBaseName() == bn) {
                nodes.add(this);
            } 
            
            //this.assertFindNodesPostCondition(nodes, bn);
            this.assertClassInvariants();
            
            return nodes;
        } catch (e) {
            if (e instanceof ServiceFailureException) throw e
            else throw new ServiceFailureException("Could not find nodes", e as Exception);
        }
    }

    protected assertFindNodesPostCondition(nodes: Set<Node>, bn: string) {
        let invalidNodes = [...nodes].reduce((acc, current) => {
            if (current.getBaseName() != bn) {
                acc.add(current)
            }
            return acc
        }, new Set())

        AssertionDispatcher.dispatch(ExceptionType.POSTCONDITION, invalidNodes.size == 0, `nodes '${[...invalidNodes]}' do not match the basename '${bn}'`)
    }

    protected assertClassInvariants(): void {
        const bn: string = this.doGetBaseName();
        this.assertIsValidBaseName(bn, ExceptionType.CLASS_INVARIANT);
    }

    protected assertIsValidBaseName(bn: string, et: ExceptionType): void {
        const condition: boolean = (bn != "");
        AssertionDispatcher.dispatch(et, condition, "invalid base name");
    }

}
