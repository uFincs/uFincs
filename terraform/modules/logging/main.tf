# Storage bucket for dumping all cluster logs into.
resource "google_storage_bucket" "cluster_logs_bucket" {
  name          = "${var.logging_base_name}-cluster-logs-bucket"
  location      = var.region
  storage_class = "NEARLINE"

  lifecycle_rule {
    condition {
      age = "180" # Days

      # For some reason, not setting `with_state` causes GCP to set the state to "non-current".
      # This seems to prevent objects from actually being cleaned up, so manually set it to LIVE.
      with_state = "LIVE"
    }

    action {
      type = "Delete"
    }
  }
}

# Logging sink that dumps all cluster logs into the above storage bucket.
resource "google_logging_project_sink" "cluster_logs_sink" {
  name        = "${var.logging_base_name}-cluster-logs-sink"
  destination = "storage.googleapis.com/${google_storage_bucket.cluster_logs_bucket.name}"
  filter      = "resource.type=k8s_container AND resource.labels.cluster_name=${var.cluster_name}"

  unique_writer_identity = true
}

# An IAM binding that enables the unique service account for the logging sink to dump to the storage bucket.
resource "google_project_iam_binding" "log_writer" {
  role    = "roles/storage.objectCreator"
  members = [google_logging_project_sink.cluster_logs_sink.writer_identity]
}

