# Frontend Server

This is just a lightweight Express server for serving the statically built assets of the Frontend. Main reasons we do this vs serving the assets from e.g. a CDN:

-   Because I wanted the Frontend needed to be served through Kubails. And Kubails requires a Docker-based server.
-   For supplying env vars to the Frontend dynamically. The server handles taking regular env vars and injecting them at serve time.
    -   We do this to support Kubails' per-branch deployments. Can't do this with built-time 'env' vars.
-   For finer grain control over headers (especially cache and CSP).
-   For dynamically generating the script hashes necessary for the CSP.
    -   This could technically be done at build time, but I was too lazy to modify the build process vs modifying the server.
