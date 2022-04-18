# uFincs User Guides

OK, so you want to run or self-host uFincs yourself? You've come to the right place! Because uFincs uses Docker, there are a ton of different ways you can go about running: using docker-compose, using Kubernetes, using one of the many serverless container services (e.g. GCP Cloud Run), etc. And thanks to Capacitor, it can also run as a native app on Android, iOS, or any of the desktop platforms through Electron.

However, if there's one thing you need to keep in mind, it's this: the uFincs services (i.e. the Frontend and Backend) **must be served over HTTPS**. The Service Worker and crypto libraries in the Frontend make it a pain/impossible to not use TLS (outside of `localhost`).

So let's walk through a couple different deployment options. Just note that these are just some guidelines and are entirely non-comprehensive; the only officially supported way of 'running' uFincs is by going to [ufincs.com](https://ufincs.com) :)

## Table of Contents

- [Absolute Fastest Option: app.ufincs.com no-account mode](#absolute-fastest-option-appufincscom-no-account-mode)
- [Fastest Option without ufincs.com: Local Docker Compose](#fastest-option-without-ufincscom-local-docker-compose)
- [Native App (without Backend)](#native-app-without-backend)
- [Native App (with Backend](#native-app-with-backend)
- [Deploying to GCP/GKE (with Kubails)](#deploying-to-gcpgke-with-kubails)
- [Deploying to Kubernetes](#deploy-to-kubernetes)
- [GCP Cloud Run + Cloud SQL](#gcp-cloud-run--cloud-sql)
- [Migrating Data between uFincs Accounts/Instances](#migrating-data-between-ufincs-accountsinstances)

## Absolute Fastest Option: app.ufincs.com no-account mode

Just head over to [app.ufincs.com](https://app.ufincs.com), choose "Use without an account" at the login page, then 'install' uFincs as a PWA to your device. Boom, uFincs will now work entirely self-contained without having to install or build anything for development

## Fastest Option without ufincs.com: Local Docker Compose

The only method that doesn't require TLS! Just follow the [Running Locally](../dev/README.md#running-locally) instructions in the Developer guide.

Of course, the limitation here is that the services can only be accessed (in a functional manner) over localhost. You can of course access the services over an IP address, but you won't be able to do anything but enter "no-account" mode.

If you try to sign up or log in over anything but `localhost`, you'll probably hit the wonderfully useless error:

```
isomorphic_webcrypto__WEBPACK_IMPORTED_MODULE_1__.default.subtle is undefined
```

tl;dr this is because Subtle Crypto can only be used in [secure contexts](https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto) (aka over HTTPS).

## Native App (without Backend)

Just want to use uFincs standalone and without the Backend or Database? Then how about running it as a native app!

Depending on which platform you want to run on, you'll need to already have the required developer tools installed (i.e. Android Studio/Xcode). Electron is the simplest to get running, since it just requires installing deps through NPM.

Then, just follow the instructions in the [Frontend README](../../services/frontend/README.md#running-the-native-apps) to get it running locally. Then, just choose "Use without an account" at the login page to enter no-account mode.

This will only get things running locally on an emulator/simulator (for Android/iOS). If you instead want to have properly install uFincs on a device, then pull out the Android/iOS developer guides and the corresponding IDE: you're on your own for that. Just know that you need to re-build (`npm run build`) the Frontend and copy it (`npm run cap:copy`) everytime you make any code changes.

Note: Native Apps aren't 'officially' supported by uFincs — Capacitor is used and the code is provided merely for convenience. If something breaks, have fun!

## Native App (with Backend)

Same thing as above, except you can use the `scripts/capBuildProd.sh` script in `services/frontend` as an example of passing all of the necessary environment variables to build the Frontend to point to wherever you have the Backend deployed.

## Deploying to GCP/GKE (with Kubails)

This is how [ufincs.com](https://ufincs.com) is deployed in production. Honestly, no idea if this process still works from the start (it's been a while since I first bootstrapped the infrastructure), but the `kubails.json` and Terraform configs mean that you have a very good starting point!

The first step you'll have to take is configure the values in `kubails.json` to meet your needs. Things like changing the emails, GCP project IDs/zones, etc.

Now, while this'll get you like 90% of the way there as far as config is concerned, there's still some files in `manifests/` and `terraform/` that need to be manually updated (e.g. the `project` in the `letsencrypt-cluserissuer-production.yaml` file). Just do a `grep` for "ufincs" and you'll probably find everything that needs to be changed.

Finally, you can actually try the process of deploying to GCP. [Here](https://docs.kubails.com/gettingstarted#deploy-the-kubails-infrastructure) are the Kubails deployment docs.

Honestly, I wouldn't bother going this route. There's probably too many Kubails-specific things that I haven't documented that'll just make this frustrating. Not to mention, you know, it's expensive and entirely overkill. Instead...

## Deploy to Kubernetes

Whether it be GKE or a single-node k3s cluster, deploying to Kubernetes should be fairly 'straightforward'. Just build the Docker images for each service, push them to some Docker registry, and then use the templates in `helm/` to build the Kubernetes manifests you need.

Of course, you'll need to customize the manifests to fit your needs (they're currently configured for GCP deployments), but I'm sure you can figure it out.

Oh, and don't forget to get a domain for Lets Encrypt!

## GCP Cloud Run + Cloud SQL

This is probably one of the easiest 'prod-style' deployments. Just build the images for each service, push them to the Docker registry of your choice (e.g. Artifact/Container Registry in your GCP project), and deploy them to Cloud Run.

Make sure to spin up a Cloud SQL (Postgres) instance to point the Backend to, and you should be good to go. You even get TLS out of the box!

## No Docker, Just Node

Docker too much for you? Well, there's nothing stopping you from running the services directly using NPM (specifically, `npm start:prod`). 

Of course, you can also serve the Frontend over something like a CDN just by giving it the static assets (from `npm run build`).

## Migrating Data between uFincs Accounts/Instances

If you want to easily migrate data between accounts or installations of uFincs (e.g. from the hosted [ufincs.com](https://ufincs.com) to a self-hosted instance), this is basically trivial. In the app, just go "Settings" -> "My Data" and choose "Download Regular Backup". This will give you a JSON file with all of your data.

Then, wherever you want to import the data, just go "Settings" -> "My Data" and choose "Restore Backup". Done!

If you're using a proper uFincs account (i.e. with a username/password), then you also have the option of exporting an encrypted backup. Note, however, that you can't reimport an encrypted backup to a different account (the encryption keys would be different and thus useless).

If you have a paid [ufincs.com](https://ufincs.com) account and would like a copy of the cryptographic key material (i.e. EDEK, KEK salt) that is stored for your account, please send an email to [support@ufincs.com](mailto:support@ufincs.com) and I'll get you sorted out :)
