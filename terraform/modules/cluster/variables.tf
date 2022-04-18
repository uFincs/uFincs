variable "gcp_project" {
  type = string
}

variable "region" {
  type = string
}

variable "zone" {
  type = string
}

variable "cluster_base_name" {
  type = string
}

variable "cluster_release_channel" {
  type    = string
  default = "STABLE"
}

variable "initial_node_count" {
  type    = string
  default = "3"
}

variable "min_node_count" {
  type    = string
  default = "3"
}

variable "max_node_count" {
  type    = string
  default = "5"
}

variable "preemptible_nodes" {
  type    = string
  default = true
}

variable "node_disk_size" {
  type    = string
  default = "10"
}

variable "node_image_type" {
  type    = string
  default = "COS_CONTAINERD"
}

variable "node_machine_type" {
  type    = string
  default = "e2-standard-2"
}

variable "network_link" {
  type = string
}

variable "subnetwork_link" {
  type = string
}

variable "cluster_secondary_range_name" {
  type = string
}

variable "services_secondary_range_name" {
  type = string
}

variable "cluster_secondary_range_cidr" {
  type = string
}

variable "services_secondary_range_cidr" {
  type = string
}

