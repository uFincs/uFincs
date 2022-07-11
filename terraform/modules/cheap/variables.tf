variable "__project_name" {
  type = string
}

variable "__gcp_project_id" {
  type = string
}

variable "__gcp_project_region" {
  type = string
}

variable "cloud_source_repo_name" {
  type = string
}

variable "database_backups_bucket_name" {
  type = string
}

# Note: `dns_domain` does not have the period at the end that a FQDN needs.
variable "dns_domain" {
  type = string
}

variable "dns_zone_name" {
  type = string
}

# The following are sensitive vars that can be retrieved from `secrets.auto.tfvars.encrypted`.

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
