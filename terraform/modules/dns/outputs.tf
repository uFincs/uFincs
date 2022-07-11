output "ip_address" {
  value = google_compute_address.primary.address
}

output "dns_name_servers" {
  value = google_dns_managed_zone.prod.name_servers
}

output "dns_zone_name" {
  value = google_dns_managed_zone.prod.name
}
