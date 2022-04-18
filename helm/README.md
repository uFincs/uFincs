# Helm Chart

This is the Helm 'chart' used by Kubails for generating the Kubernetes manifests we need. Which is to say, we really only use the **template** portion rather than the 'chart' portion — we only make use of Helm's templating, not any of its chart installation features.

We also don't make use of 'values' in Helm — at least, not directly. Kubails handles injecting the values at templating time from `kubails.json` (among other things). I suggest reading the (practically non-existent) [Kubails docs](https://github.com/DevinSit/kubails) for more information :)

Noteworthy: Kubails is still on Helm 2 for templating. But that's more of a Kubails thing than a uFincs one...
