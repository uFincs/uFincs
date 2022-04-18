# Feathers Services

These Feathers services make up the bulk of the code and logic for the Backend — specifically in the 'hooks' for each service (generally, the 'class'/'service' portion of each service is just boilerplate).

That logic is mostly in the form of data validation/multi-tenancy checking code. Again, since the Backend deals with encrypted data, there's not really much else it can do. Although there are a few services (e.g. billing) that have a bit more meat to them.

Note: If you're not familiar with how Feathers works, basically each service that maps to a model abstracts away the calls (i.e. Sequelize calls) for manipulating the database — this is the hidden chunk of logic that happens in between 'before' and 'after' hooks. The hooks just serve to operate on incoming request data or outgoing response data.
