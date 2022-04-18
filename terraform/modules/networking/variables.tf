variable "region" {
  type = string
}

variable "network_name" {
  type = string
}

variable "subnetwork_name" {
  type = string
}

variable "subnetwork_primary_range" {
  type    = string
  default = "10.100.0.0/20"
}

variable "subnetwork_secondary_range_1" {
  type    = string
  default = "10.101.0.0/20"
}

variable "subnetwork_secondary_range_2" {
  type    = string
  default = "10.102.0.0/20"
}

