locals {
  backend_host      = "cheap-backend.${var.dns_domain}"
  frontend_host     = "cheap-frontend.${var.dns_domain}"
  marketing_host    = "cheap-marketing.${var.dns_domain}"
  staging_subdomain = "staging"
}

################################################################################
# Database
################################################################################

resource "random_id" "main_db_suffix" {
  byte_length = 4
}

resource "google_sql_database_instance" "main" {
  name             = "${var.__gcp_project_id}-database-${random_id.main_db_suffix.hex}"
  database_version = "POSTGRES_13"
  region           = var.__gcp_project_region

  settings {
    disk_size = "10"
    disk_type = "PD_SSD"
    tier      = "db-f1-micro"

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = true
      location                       = var.__gcp_project_region
    }

    insights_config {
      query_insights_enabled = true
    }
  }
}

resource "google_sql_database" "app" {
  name     = "app-database"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app_user" {
  name     = "app-database-user"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

### Database Backups Config ###

# Note: Need to deploy the Cloud Function/Cloud Run service from the
# `cheap-database-backups` folder before deploying this infrastructure.

# Allow the database's service account to write to the backups bucket.
resource "google_storage_bucket_iam_member" "backups_bucket_member" {
  bucket = var.database_backups_bucket_name
  role   = "roles/storage.objectAdmin"
  member = "serviceAccount:${google_sql_database_instance.main.service_account_email_address}"
}

# The service account that Cloud Scheduler will use to invoke the backup Cloud Function/Cloud Run service.
resource "google_service_account" "cheap_database_backups_scheduler" {
  account_id   = "cheap-database-backups-account"
  display_name = "Cheap Database Backups Scheduler Account"
}

# Allow the above service account to invoke Cloud Functions.
resource "google_project_iam_member" "cheap_database_backups_scheduler" {
  role   = "roles/cloudfunctions.invoker"
  member = "serviceAccount:${google_service_account.cheap_database_backups_scheduler.email}"
}

# Allow the above service account to invoke Cloud Run.
resource "google_project_iam_member" "cheap_database_backups_scheduler_cloud_run" {
  role   = "roles/run.invoker"
  member = "serviceAccount:${google_service_account.cheap_database_backups_scheduler.email}"
}

# The Cloud Scheduler job for running the backup Cloud Function for GCS.
resource "google_cloud_scheduler_job" "cheap_database_backups_job" {
  name        = "cheap-database-backups"
  description = "Backup the Cloud SQL database used for the cheap infrastructure."
  schedule    = "0 4 * * *"
  time_zone   = "America/New_York"
  region      = var.__gcp_project_region

  http_target {
    http_method = "GET"
    uri         = "https://us-east1-${var.__gcp_project_id}.cloudfunctions.net/cheap-database-backup"

    oidc_token {
      service_account_email = google_service_account.cheap_database_backups_scheduler.email
    }
  }

  lifecycle {
    ignore_changes = [
      http_target[0].oidc_token[0].audience
    ]
  }
}

# The Cloud Scheduler job for running the backup Cloud Run service for syncing to S3.
resource "google_cloud_scheduler_job" "cheap_database_backups_s3_sync_job" {
  name        = "cheap-database-backups-s3-sync"
  description = "Sync the GCS exports to S3."
  schedule    = "0 5 * * *"
  time_zone   = "America/New_York"
  region      = var.__gcp_project_region

  http_target {
    http_method = "GET"
    uri         = "https://cheap-database-backups-s3-service-566qp2df3q-ue.a.run.app/"

    oidc_token {
      service_account_email = google_service_account.cheap_database_backups_scheduler.email
    }
  }

  lifecycle {
    ignore_changes = [
      http_target[0].oidc_token[0].audience
    ]
  }
}

################################################################################
# Cloud Run
################################################################################

resource "google_cloud_run_service" "backend" {
  count    = 2
  name     = "${var.__gcp_project_id}-backend${count.index == 1 ? "-staging" : ""}"
  location = var.__gcp_project_region

  template {
    spec {
      containers {
        image = "gcr.io/${var.__gcp_project_id}/${var.__project_name}-backend:master"

        ports {
          name           = "http1"
          container_port = 5000
        }

        env {
          name  = "NODE_ENV"
          value = "production"
        }

        env {
          name  = "FRONTEND_HOST"
          value = count.index == 0 ? local.frontend_host : "${local.staging_subdomain}.${local.frontend_host}"
        }

        env {
          name  = "FRONTEND_PORT"
          value = "443"
        }

        env {
          name  = "POSTGRES_HOST"
          value = "/cloudsql/${google_sql_database_instance.main.connection_name}"
        }

        env {
          name  = "POSTGRES_PASSWORD"
          value = var.db_password
        }

        env {
          name  = "MAILGUN_API_KEY"
          value = var.mailgun_api_key
        }

        env {
          name  = "SLACK_WEBHOOK"
          value = var.slack_webhook
        }

        env {
          name  = "SLACK_WEBHOOK_TEST"
          value = var.slack_webhook_test
        }

        env {
          name  = "STRIPE_SECRET_KEY_TEST"
          value = var.stripe_secret_key_test
        }

        env {
          name  = "STRIPE_SECRET_KEY_PROD"
          value = var.stripe_secret_key_prod
        }

        env {
          name  = "STRIPE_WEBHOOK_SECRET"
          value = var.stripe_webhook_secret
        }

        env {
          name  = "TOKEN_SECRET"
          value = var.token_secret
        }
      }
    }

    metadata {
      annotations = {
        "autoscaling.knative.dev/maxScale"      = "3"
        "run.googleapis.com/cloudsql-instances" = google_sql_database_instance.main.connection_name
      }
    }
  }

  lifecycle {
    ignore_changes = [
      template[0].spec[0].service_account_name,
      template[0].spec[0].containers[0].image,
      template[0].metadata[0].annotations["client.knative.dev/user-image"],
      template[0].metadata[0].annotations["run.googleapis.com/client-name"],
      template[0].metadata[0].annotations["run.googleapis.com/client-version"],
    ]
  }
}

data "google_iam_policy" "noauth" {
  binding {
    role    = "roles/run.invoker"
    members = ["allUsers"]
  }
}

resource "google_cloud_run_service_iam_policy" "noauth" {
  count    = 2
  location = google_cloud_run_service.backend[count.index].location
  service  = google_cloud_run_service.backend[count.index].name

  policy_data = data.google_iam_policy.noauth.policy_data
}

################################################################################
# Cheap Infrastructure Records
################################################################################

resource "google_dns_record_set" "cheap_frontend" {
  count        = 2
  managed_zone = var.dns_zone_name

  name = "${count.index == 1 ? "staging." : ""}${local.frontend_host}."
  type = "A"
  ttl  = 300

  rrdatas = ["199.36.158.100"]
}

resource "google_dns_record_set" "cheap_backend" {
  count        = 2
  managed_zone = var.dns_zone_name

  name = "${count.index == 1 ? "staging." : ""}${local.backend_host}."
  type = "A"
  ttl  = 300

  rrdatas = ["199.36.158.100"]
}

resource "google_dns_record_set" "cheap_marketing" {
  count        = 2
  managed_zone = var.dns_zone_name

  name = "${count.index == 1 ? "staging." : ""}${local.marketing_host}."
  type = "A"
  ttl  = 300

  rrdatas = ["199.36.158.100"]
}

################################################################################
# Temp Cheap Infrastructure Records
################################################################################

resource "google_dns_record_set" "cheap_frontend_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.app.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "UbKEo-gfZ8WzRzqx1bDz2LVpNSHQC7YjqLGgw31ktCM"
  ]
}

resource "google_dns_record_set" "cheap_frontend_staging_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.staging.app.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "XWw2l3KLoHZcn9AReMBdK64jSDiVtkLrR2KdPpJ1qF8"
  ]
}

resource "google_dns_record_set" "cheap_backend_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.backend.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "yPKfJneRwVRPmdhcQkdc7ouZZ-CTzWYaHRq0ibpMvFo"
  ]
}

resource "google_dns_record_set" "cheap_backend_staging_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.staging.backend.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "IjxYco1oJQb4a9c3G6ewh5N59XDC5ZRZMiMhNTZiQY4"
  ]
}

resource "google_dns_record_set" "cheap_marketing_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "V2Op81XSUtx8-YDJ7oDVumQtFYpsAba5EbiNww6rDA4"
  ]
}

resource "google_dns_record_set" "cheap_marketing_www_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.www.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "xXv_ARBby2-ERTkLqnxs31tpuCWwKBvyToq516YVIQs"
  ]
}

resource "google_dns_record_set" "cheap_marketing_staging_cert_verification" {
  managed_zone = var.dns_zone_name

  name = "_acme-challenge.staging.${var.dns_domain}."
  type = "TXT"
  ttl  = 60

  rrdatas = [
    "hk-280kXul7KdKINXef-cRjD7uL0l4eGFMES_Y8vn2w"
  ]
}

################################################################################
# Prod Cloud Build Pipelines
################################################################################

resource "google_cloudbuild_trigger" "frontend" {
  description = "Deploy Frontend to Firebase"
  filename    = "services/frontend/cloudbuild.firebase.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/frontend/**"]

  trigger_template {
    branch_name = "master"
    project_id  = var.__gcp_project_id
    repo_name   = var.cloud_source_repo_name
  }

  substitutions = {
    "_BACKEND_HOST"    = local.backend_host,
    "_MARKETING_HOST"  = local.marketing_host,
    "_FIREBASE_TARGET" = "frontend"
  }
}


resource "google_cloudbuild_trigger" "marketing" {
  description = "Deploy Marketing to Firebase"
  filename    = "services/marketing/cloudbuild.firebase.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/marketing/**"]

  trigger_template {
    branch_name = "master"
    project_id  = var.__gcp_project_id
    repo_name   = var.cloud_source_repo_name
  }

  substitutions = {
    "_FRONTEND_URL"    = "https://${local.frontend_host}",
    "_MARKETING_URL"   = "https://${local.marketing_host}",
    "_FIREBASE_TARGET" = "marketing"
  }
}

resource "google_cloudbuild_trigger" "backend" {
  description = "Deploy Backend to Cloud Run"
  filename    = "services/backend/cloudbuild.cloudrun.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/backend/**"]

  trigger_template {
    branch_name = "master"
    project_id  = var.__gcp_project_id
    repo_name   = var.cloud_source_repo_name
  }

  substitutions = {
    "_FRONTEND_HOST"  = local.frontend_host,
    "_CLOUD_RUN_NAME" = "backend"
  }
}

################################################################################
# Staging Cloud Build Pipelines
################################################################################

resource "google_cloudbuild_trigger" "frontend_staging" {
  description = "Deploy Frontend to Firebase Staging"
  filename    = "services/frontend/cloudbuild.firebase.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/frontend/**"]

  trigger_template {
    branch_name  = "master"
    invert_regex = true
    project_id   = var.__gcp_project_id
    repo_name    = var.cloud_source_repo_name
  }

  substitutions = {
    "_BACKEND_HOST"    = "${local.staging_subdomain}.${local.backend_host}",
    "_MARKETING_HOST"  = "${local.staging_subdomain}.${local.marketing_host}",
    "_FIREBASE_TARGET" = "frontend-staging"
  }
}

resource "google_cloudbuild_trigger" "marketing_staging" {
  description = "Deploy Marketing to Firebase Staging"
  filename    = "services/marketing/cloudbuild.firebase.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/marketing/**"]

  trigger_template {
    branch_name  = "master"
    invert_regex = true
    project_id   = var.__gcp_project_id
    repo_name    = var.cloud_source_repo_name
  }

  substitutions = {
    "_FRONTEND_URL"    = "https://${local.staging_subdomain}.${local.frontend_host}",
    "_MARKETING_URL"   = "https://${local.staging_subdomain}.${local.marketing_host}",
    "_FIREBASE_TARGET" = "marketing-staging"
  }
}

resource "google_cloudbuild_trigger" "backend_staging" {
  description = "Deploy Backend to Cloud Run Staging"
  filename    = "services/backend/cloudbuild.cloudrun.yaml"
  project     = var.__gcp_project_id

  included_files = ["services/backend/**"]

  trigger_template {
    branch_name  = "master"
    invert_regex = true
    project_id   = var.__gcp_project_id
    repo_name    = var.cloud_source_repo_name
  }

  substitutions = {
    "_FRONTEND_HOST"  = "${local.staging_subdomain}.${local.frontend_host}",
    "_CLOUD_RUN_NAME" = "backend-staging"
  }
}
