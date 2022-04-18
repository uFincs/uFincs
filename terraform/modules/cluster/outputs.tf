output "cluster_name" {
  value = google_container_cluster.primary.name
}

output "cluster_database_backups_bucket_name" {
  value = google_storage_bucket.cluster_database_backups.name
}

