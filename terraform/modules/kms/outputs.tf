output "key_name" {
  value = google_kms_crypto_key.secrets.name
}

output "key_ring_name" {
  value = google_kms_key_ring.secrets.name
}

