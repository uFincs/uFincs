declare module "@feathersjs/client" {
    type Feathers = import("./feathers.types").Feathers;

    const feathers: Feathers;
    export = feathers;
}
