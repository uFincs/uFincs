variable "__project_name" {
  type = string
}

variable "__project_short_code" {
  type = string
}

variable "__gcp_project_id" {
  type = string
}

variable "__gcp_project_region" {
  type = string
}

variable "__gcp_project_zone" {
  type = string
}

variable "__alerting_email" {
  type = string
}

variable "__domain" {
  type = string
}

variable "__domain_owner_email" {
  type = string
}

variable "__production_namespace" {
  type = string
}

variable "__remote_repo_host" {
  type = string
}

variable "__remote_repo_owner" {
  type = string
}

variable "cluster_initial_node_count" {
  type    = string
  default = "3"
}

variable "cluster_machine_type" {
  type    = string
  default = "e2-standard-2"
}

variable "cluster_disk_size" {
  type    = string
  default = "30"
}

variable "cluster_preemptible" {
  type    = string
  default = "true"
}

# Secret variables for the Cheap infrastructure (specifically, the Backend Cloud Run instance).
# Can be set in a `secret.auto.tfvars` file, which can be done by unencrypting the
# `secret.auto.tfvars.encrypted` file.

variable "db_password" {
  type      = string
  sensitive = true
}

variable "mailgun_api_key" {
  type      = string
  sensitive = true
}

variable "slack_webhook" {
  type      = string
  sensitive = true
}

variable "slack_webhook_test" {
  type      = string
  sensitive = true
}

variable "stripe_secret_key_test" {
  type      = string
  sensitive = true
}

variable "stripe_secret_key_prod" {
  type      = string
  sensitive = true
}

variable "stripe_webhook_secret" {
  type      = string
  sensitive = true
}

variable "token_secret" {
  type      = string
  sensitive = true
}
