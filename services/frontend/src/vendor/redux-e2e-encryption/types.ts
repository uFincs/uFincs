// These types are duplicated here from `workerize.d.ts` because we need to use the `Workerized`
// type in `workerPool`. However, it seems like the type declaration file doesn't like when
// we import in it or import from it, so we need the types in a separate file.
//
// And by "doesn't like", I mean that the 'workerize-loader!./worker' import in `WorkerPool` errors
// out with "Cannot find module".
export type Workerized<T> = Worker & {[K in keyof T]: T[K]};
