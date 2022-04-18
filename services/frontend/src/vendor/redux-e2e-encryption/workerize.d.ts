// This declaration is so that TypeScript knows what to do with the `workerize-loader` imports.
// Taken from https://github.com/developit/workerize-loader/issues/3#issuecomment-538730979.
declare module "workerize-loader!*" {
    type Workerized<T> = Worker & {[K in keyof T]: T[K]};

    function createInstance<T>(): Workerized<T>;
    export = createInstance;
}
