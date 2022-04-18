import * as worker from "./worker";

// Because we don't really have Web Workers in Jest, we mock them out so that they just turn into
// objects that just happen to have the same interface. Everything still workers the same,
// things just aren't run in a worker.
export default () => worker;
