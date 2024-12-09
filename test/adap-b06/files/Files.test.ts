import { describe, it, expect } from "vitest";


import { StringName } from "../../../src/adap-b05/names/StringName";

import { Node } from "../../../src/adap-b05/files/Node";
import { File } from "../../../src/adap-b05/files/File";
import { BuggyFile } from "../../../src/adap-b05/files/BuggyFile";
import { Directory } from "../../../src/adap-b05/files/Directory";
import { RootNode } from "../../../src/adap-b05/files/RootNode";
import { Exception } from "../../../src/adap-b05/common/Exception";
import { ServiceFailureException } from "../../../src/adap-b05/common/ServiceFailureException";
import { InvalidStateException } from "../../../src/adap-b05/common/InvalidStateException";

function createFileSystem(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new File("ls", bin);
  let code: File = new File("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new File(".bashrc", riehle);
  let wallpaper: File = new File("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Basic naming test", () => {
  it("test name checking", () => {
    let fs: RootNode = createFileSystem();
    let ls: Node = [...fs.findNodes("ls")][0];
    expect(ls.getFullName().asString()).toBe(new StringName("/usr/bin/ls", '/').asString());
  });
});

function createBuggySetup(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new BuggyFile("ls", bin);
  let code: File = new BuggyFile("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new BuggyFile(".bashrc", riehle);
  let wallpaper: File = new BuggyFile("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Buggy setup test", () => {
  it("test finding files", () => {
    let threwException: boolean = false;
    try {
      let fs: RootNode = createBuggySetup();
      fs.findNodes("ls");
    } catch(er) {
      threwException = true;
      expect(er).toBeInstanceOf(Exception);
      expect(er).toBeInstanceOf(ServiceFailureException);
      let ex = er as ServiceFailureException;
      expect(ex.hasTrigger()).toBe(true);
      let tx: Exception = ex.getTrigger();
      expect(tx).toBeInstanceOf(InvalidStateException);
    }
    expect(threwException).toBe(true);
  });
});


describe("Recursion", () => {
  it("fails correctly on recursion", () => {
    let rt = new RootNode();

    let child = new Directory("bin", rt);
    rt.addChildNode(child);
    child.addChildNode(rt);
    
    expect(() => rt.findNodes("bin")).toSatisfy((lambda: () => Set<Node>) => {
      try { 
        lambda()
        return false;
      } catch (e) {
        expect(e).toBeInstanceOf(ServiceFailureException);
        const serviceFailureException = e as ServiceFailureException;
        expect(serviceFailureException.hasTrigger()).toBe(true);
        const trigger = serviceFailureException.getTrigger();
        expect(trigger).toBeInstanceOf(InvalidStateException);
        const invalidStateException = trigger as InvalidStateException;
        expect(invalidStateException.message).toBe("invalid file tree, duplicate nodes");
        return true;
      }
    })
  })
  it("fails correctly on invalid tree with duplicate children", () => {
    let rt = new RootNode();
    
    let childA = new Directory("bin", rt);
    let childB = new Directory("bun", rt);
    let child = new File("member", childA);
    childA.addChildNode(child);
    childB.addChildNode(childB);

    expect(() => rt.findNodes("bin")).toSatisfy((lambda: () => Set<Node>) => {
      try { 
        lambda()
        return false;
      } catch (e) {
        expect(e).toBeInstanceOf(ServiceFailureException);
        const serviceFailureException = e as ServiceFailureException;
        expect(serviceFailureException.hasTrigger()).toBe(true);
        const trigger = serviceFailureException.getTrigger();
        expect(trigger).toBeInstanceOf(InvalidStateException);
        const invalidStateException = trigger as InvalidStateException;
        expect(invalidStateException.message).toBe("invalid file tree, duplicate nodes");
        return true;
      }
    })
  })
})