output "network_link" {
  value = google_compute_network.primary.self_link
}

output "subnetwork_link" {
  value = google_compute_subnetwork.primary.self_link
}

output "subnetwork_secondary_range_1_name" {
  value = google_compute_subnetwork.primary.secondary_ip_range[0].range_name
}

output "subnetwork_secondary_range_2_name" {
  value = google_compute_subnetwork.primary.secondary_ip_range[1].range_name
}

output "subnetwork_secondary_range_1_cidr" {
  value = google_compute_subnetwork.primary.secondary_ip_range[0].ip_cidr_range
}

output "subnetwork_secondary_range_2_cidr" {
  value = google_compute_subnetwork.primary.secondary_ip_range[1].ip_cidr_range
}

