locals {
  cluster_name = "${var.cluster_base_name}-cluster"
}

# Create a custom service account that will be used by the cluster nodes.
resource "google_service_account" "node_account" {
  account_id   = "${local.cluster_name}-node-sa"
  display_name = "${local.cluster_name} Node Service Account"
}

# At a minimum, the service requires the following 4 roles:
#
# - logging.logWriter
# - monitoring.metricWriter
# - monitoring.viewer
# - stackdriver.resourceMetadata.writer
#
# Additionally, in order to pull from the Container Registry to get the container images,
# the service account reuqires the storage.objectViewer role. However, since our database backup script
# requires writing to a storage bucket, we also need writer perimissions.
#
# As such, we assign storage.objectAdmin instead.
#
# We shouldn't need any more roles at this time, but we can always add more later.
resource "google_project_iam_binding" "node_account_log_writer" {
  role    = "roles/logging.logWriter"
  members = ["serviceAccount:${google_service_account.node_account.email}"]
}

resource "google_project_iam_binding" "node_account_metric_writer" {
  role    = "roles/monitoring.metricWriter"
  members = ["serviceAccount:${google_service_account.node_account.email}"]
}

resource "google_project_iam_binding" "node_account_monitoring_viewer" {
  role    = "roles/monitoring.viewer"
  members = ["serviceAccount:${google_service_account.node_account.email}"]
}

resource "google_project_iam_binding" "node_account_metadata_writer" {
  role    = "roles/stackdriver.resourceMetadata.writer"
  members = ["serviceAccount:${google_service_account.node_account.email}"]
}

resource "google_project_iam_binding" "node_account_object_admin" {
  role    = "roles/storage.objectAdmin"
  members = ["serviceAccount:${google_service_account.node_account.email}"]
}

# The Kubernetes cluster where all of the application containers will be deployed to.
# resource "google_container_cluster" "primary" {
#   name     = local.cluster_name
#   location = var.zone

#   enable_shielded_nodes    = true
#   remove_default_node_pool = true

#   network    = var.network_link
#   subnetwork = var.subnetwork_link

#   monitoring_service = "monitoring.googleapis.com/kubernetes"
#   logging_service    = "logging.googleapis.com/kubernetes"

#   # Need to have an IP allocation policy setup so that IP Aliases get enabled.
#   # And we need IP Aliases enabled to access a potential Memorystore (Redis) instance.
#   # See Step 2 of https://cloud.google.com/memorystore/docs/redis/connecting-redis-instance#connecting-cluster
#   ip_allocation_policy {
#     cluster_secondary_range_name  = var.cluster_secondary_range_name
#     services_secondary_range_name = var.services_secondary_range_name
#   }

#   lifecycle {
#     # Terraform always wants to update the network/subnetwork values with a fuller URL, but it doesn't matter.
#     # Can just ignore it.
#     # As for the node pool, want to ignore it so that changes happen on dedicated resource below.
#     ignore_changes = [
#       node_pool,
#       network,
#       subnetwork,
#     ]
#   }

#   node_pool {
#     name = "default-pool"
#   }

#   release_channel {
#     channel = var.cluster_release_channel
#   }
# }

# The node pool for the Kubernetes cluster.
# It is called "large" because we migrated from the original node pool that was smaller.
# And since we can't rename a node pool after it's creaetd, the name sticks until such time that
# we migrate to another node pool (whether that be an even bigger one or back to a smaller one).
# resource "google_container_node_pool" "large" {
#   name               = "${google_container_cluster.primary.name}-node-pool-large"
#   cluster            = google_container_cluster.primary.name
#   location           = var.zone
#   initial_node_count = var.initial_node_count

#   lifecycle {
#     # Ignore changes to version since we want to update it ourselves.
#     ignore_changes = [version]
#   }

#   autoscaling {
#     min_node_count = var.min_node_count
#     max_node_count = var.max_node_count
#   }

#   management {
#     auto_repair  = true
#     auto_upgrade = true
#   }

#   node_config {
#     preemptible  = var.preemptible_nodes
#     disk_size_gb = var.node_disk_size
#     image_type   = var.node_image_type
#     machine_type = var.node_machine_type

#     # Need this so Terraform doesn't try to unset it.
#     metadata = {
#       "disable-legacy-endpoints" = "true"
#     }

#     shielded_instance_config {
#       enable_secure_boot = true
#     }

#     service_account = google_service_account.node_account.email
#     oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]
#     tags            = [local.cluster_name, "nodes"]
#   }

#   upgrade_settings {
#     max_surge       = 1
#     max_unavailable = 0
#   }
# }

# A firewall rule that enables the Kubernetes master nodes to access the cert-manager 'webhook' service.
# This 'webhook' service offloads the validation of manifests for cert-manager.
# For reference: https://www.revsys.com/tidbits/jetstackcert-manager-gke-private-clusters/
# resource "google_compute_firewall" "allow_cert_manager_webhook_to_cluster" {
#   name    = "allow-cert-manager-webhook-to-cluster"
#   network = var.network_link

#   source_ranges = [var.cluster_secondary_range_cidr, var.services_secondary_range_cidr]
#   target_tags   = [local.cluster_name]

#   allow {
#     protocol = "tcp"
#     ports    = ["6443"]
#   }
# }

# A storage bucket used for storing backups taken from the in-cluster database(s).
resource "google_storage_bucket" "cluster_database_backups" {
  name          = "${var.gcp_project}-cluster-database-backups"
  location      = var.region
  storage_class = "NEARLINE"

  lifecycle_rule {
    condition {
      age = 60 # Days

      # For some reason, not setting `with_state` causes GCP to set the state to "non-current".
      # This seems to prevent objects from actually being cleaned up, so manually set it to LIVE. 
      with_state = "LIVE"
    }

    action {
      type = "Delete"
    }
  }
}

