variable "gcp_project" {
  type = string
}

variable "project_name" {
  type = string
}

variable "project_short_code" {
  type = string
}

variable "production_namespace" {
  type = string
}

variable "alerts_email" {
  type = string
}

variable "cluster_name" {
  type = string
}

variable "domain" {
  type = string
}

variable "database_backups_check_period" {
  type    = string
  default = "86400s"
}

variable "database_backups_bucket" {
  type = string
}

variable "uptime_check_timeout" {
  type    = string
  default = "10s"
}

variable "uptime_check_period" {
  type    = string
  default = "300s"
}
