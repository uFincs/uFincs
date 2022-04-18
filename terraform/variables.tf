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

