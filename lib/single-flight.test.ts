import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { createSingleFlight } from "./single-flight";

void describe("createSingleFlight", () => {
  void it("shares one request while a request is in flight", async () => {
    let calls = 0;
    let resolve!: (value: number) => void;
    const pending = new Promise<number>((done) => {
      resolve = done;
    });
    const run = createSingleFlight<number>();
    const task = () => {
      calls += 1;
      return pending;
    };

    const first = run(task);
    const second = run(task);
    resolve(7);

    assert.equal(first, second);
    assert.equal(await first, 7);
    assert.equal(calls, 1);
  });

  void it("allows a new request after completion", async () => {
    let calls = 0;
    const run = createSingleFlight<number>();
    const task = async () => ++calls;

    assert.equal(await run(task), 1);
    assert.equal(await run(task), 2);
  });
});
