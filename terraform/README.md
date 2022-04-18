# Terraform (for GCP)

This is all of the Terraform that makes up uFincs' primary GCP infrastructure. It is primarily managed by Kubails, but there have been a number of customizations and improvements made over the default Kubails config.

Just like with the Helm templates, values get injected into Terraform at `apply` time from `kubails.json` when running `kubails infra deploy`. That is Kubails raison d'être after all: to share configuration between Helm and Terraform.
