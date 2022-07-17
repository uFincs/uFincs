output "cluster_name" {
  value = module.cluster.cluster_name
}

output "ingress_ip" {
  # value = module.dns.ip_address

  # This is now just a placeholder of old times. RIP uFincs on Kubernetes.
  value = "35.231.161.51"
}

output "dns_name_servers" {
  value = module.dns.dns_name_servers
}

output "secrets_key_name" {
  value = module.kms.key_name
}

output "secrets_key_ring_name" {
  value = module.kms.key_ring_name
}

