output "cluster_name" {
  value = module.cluster.cluster_name
}

output "ingress_ip" {
  value = module.dns.ip_address
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

