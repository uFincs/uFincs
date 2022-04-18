resource "google_compute_address" "primary" {
  name = var.ip_name
}

resource "google_dns_managed_zone" "prod" {
  depends_on = [google_compute_address.primary]

  name        = var.dns_zone_name
  dns_name    = "${var.domain}."
  description = "Production DNS Zone"
}

resource "google_dns_record_set" "base" {
  managed_zone = google_dns_managed_zone.prod.name

  name    = google_dns_managed_zone.prod.dns_name
  type    = "A"
  ttl     = 300
  rrdatas = [google_compute_address.primary.address]
}

resource "google_dns_record_set" "wildcard" {
  managed_zone = google_dns_managed_zone.prod.name

  name    = "*.${google_dns_managed_zone.prod.dns_name}"
  type    = "A"
  ttl     = 300
  rrdatas = [google_compute_address.primary.address]
}

# Mailgun Records

resource "google_dns_record_set" "mailgun_spf" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "${var.app_mail_subdomain}.${google_dns_managed_zone.prod.dns_name}"
  type = "TXT"
  ttl  = 300

  rrdatas = [
    "\"v=spf1 include:mailgun.org ~all\"",
    # Need this for verifying the subdomain for Google Workspace.
    "\"google-site-verification=LUx_5xFifE5WYr7geQsnn9xGVB79vFkeWSxmRpEtIRQ\"",
  ]
}

resource "google_dns_record_set" "mailgun_dkim" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "k1._domainkey.${var.app_mail_subdomain}.${google_dns_managed_zone.prod.dns_name}"
  type = "TXT"
  ttl  = 300

  rrdatas = [
    "\"k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAyCiq7/7RJHy/SSV9hPGu0RXolGsXe9/VZKx5q5pJ0/quCYdNmTSE5V/ZCjOWcLSH2clICShnb/IEKFmukGar0DC0+49uf3toAUx0TW7LNUzkPoxR8SM/ipmKqMt+5magP5E4YTid5SI09+Uu9oyqcZzApnPJ+XDCVdsyS5M29vg+E8WWpne+VB8vtX7LTRwhXlhXpTC5JA\" \"cU97LBZna4ta2RFfug5DQF8hWkQX9G+XbGbRs/3+076GPwnn/I91xiSRlEXi02K/85A2WKPBRUSFVw/q/oVIZGn1VYAqgTUZCKToMXBSuPscAzPqz47rCBH68pYReum6zIWmKqg6y1RwIDAQAB\"",
  ]
}

resource "google_dns_record_set" "mailgun_tracking" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "email.${var.app_mail_subdomain}.${google_dns_managed_zone.prod.dns_name}"
  type = "CNAME"
  ttl  = 300

  rrdatas = ["mailgun.org."]
}

# Google Workspace Records

resource "google_dns_record_set" "workspace_root_mx" {
  managed_zone = google_dns_managed_zone.prod.name

  name = google_dns_managed_zone.prod.dns_name
  type = "MX"
  ttl  = 300

  rrdatas = [
    "1 aspmx.l.google.com.",
    "5 alt1.aspmx.l.google.com.",
    "5 alt2.aspmx.l.google.com.",
    "10 alt3.aspmx.l.google.com.",
    "10 alt4.aspmx.l.google.com.",
  ]
}

resource "google_dns_record_set" "workspace_root_spf" {
  managed_zone = google_dns_managed_zone.prod.name

  name = google_dns_managed_zone.prod.dns_name
  type = "SPF"
  ttl  = 300

  rrdatas = ["\"v=spf1 include:_spf.google.com ~all\""]
}

resource "google_dns_record_set" "workspace_root_txt" {
  managed_zone = google_dns_managed_zone.prod.name

  name = google_dns_managed_zone.prod.dns_name
  type = "TXT"
  ttl  = 300

  rrdatas = ["\"v=spf1 include:_spf.google.com ~all\""]
}

resource "google_dns_record_set" "workspace_root_dkim" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "google._domainkey.${google_dns_managed_zone.prod.dns_name}"
  type = "TXT"
  ttl  = 300

  rrdatas = [
    "\"v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAj7c4scfRKwLMkxS6KYAPG/C76lDGHq7LsYNCB2YhDMYi8THznv7wCsA3jnHGjE56nMKn8qSsePkDsXrkkUUNzy3s52RAtRIF1y9Ivv5hoP7s23iCFp5fiQaPbrAbA/NJRna/DU4eLnyVxp6pMx0k6B3OfjIfzCLlRQkyqtFpTJDWRf5E8LOEcwpmYmSxBEOZ4\" \"DzBROzeDtiZ7sAM/l9DcocJhn/Ux13nUXRA501CKCGLaEI/YZKTRIMrZsi7ohn+4QWfAl/fBnUIAmkb8UaXK4ReBYfOXcgmKXVP/tCaqgqOdLUu446k24yLii5JmPr90iKknFCH+FiDR9+Y4+HSWwIDAQAB\"",
  ]
}

resource "google_dns_record_set" "workspace_mail_mx" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "${var.app_mail_subdomain}.${google_dns_managed_zone.prod.dns_name}"
  type = "MX"
  ttl  = 300

  rrdatas = [
    "1 aspmx.l.google.com.",
    "5 alt1.aspmx.l.google.com.",
    "5 alt2.aspmx.l.google.com.",
    "10 alt3.aspmx.l.google.com.",
    "10 alt4.aspmx.l.google.com.",
  ]
}

# Substack Records

resource "google_dns_record_set" "substack_domain" {
  managed_zone = google_dns_managed_zone.prod.name

  name = "blog.${google_dns_managed_zone.prod.dns_name}"
  type = "CNAME"
  ttl  = 300

  rrdatas = ["target.substack-custom-domains.com."]
}
