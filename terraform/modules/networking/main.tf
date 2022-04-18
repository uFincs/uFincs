# The separate VPC network to use just for the Kubernetes cluster.
# The reason we need this is so that we can allocate a subnetwork with
# secondary IP ranges to enable IP aliasing for the cluster.
# And the reason we need IP aliasing is to use the Redis (GCP Memorystore) service
# (not configured here by default).
resource "google_compute_network" "primary" {
  name                    = var.network_name
  auto_create_subnetworks = false
}

# The primary subnetwork that is used to enable IP aliasing for the cluster.
resource "google_compute_subnetwork" "primary" {
  depends_on = [google_compute_network.primary]

  name    = var.subnetwork_name
  network = google_compute_network.primary.self_link
  region  = var.region

  ip_cidr_range = var.subnetwork_primary_range

  secondary_ip_range {
    range_name    = "${var.subnetwork_name}-secondary-1"
    ip_cidr_range = var.subnetwork_secondary_range_1
  }

  secondary_ip_range {
    range_name    = "${var.subnetwork_name}-secondary-2"
    ip_cidr_range = var.subnetwork_secondary_range_2
  }
}

