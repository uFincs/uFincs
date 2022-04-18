# NOTE: Since KMS keys and key rings can't be deleted from GCP, 
# they are manually excluded when running `terraform destroy` 
# through `kubails infra destroy`.
#
# The `prevent_destroy` args here are just a formality, 
# since they don't really come into play.
#
# It'd be nice if those args allowed the resource to be implicitly 
# skipped as part of `destroy`, but alas, that is not the case.

resource "google_kms_key_ring" "secrets" {
  name     = var.key_ring_name
  location = var.region

  lifecycle {
    prevent_destroy = true
  }
}

resource "google_kms_crypto_key" "secrets" {
  name     = var.key_name
  key_ring = google_kms_key_ring.secrets.self_link

  lifecycle {
    prevent_destroy = true
  }
}

