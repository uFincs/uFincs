locals {
  database_backups_check = "${var.project_name}-database-backups"
  backend_check          = "${var.project_name}-backend"
  frontend_check         = "${var.project_name}-frontend"
  marketing_check        = "${var.project_name}-marketing"

  healthcheck_endpoint    = "healthcheck"
  ingress_nginx_namespace = "ingress-nginx"
  ingress_nginx_container = "controller"
  stackdriver_user_agent  = "GoogleStackdriverMonitoring-UptimeChecks(https://cloud.google.com/monitoring)"
}

# Uptime check for monitoring the backend -- i.e. the API.
resource "google_monitoring_uptime_check_config" "backend_check" {
  display_name = local.backend_check
  timeout      = var.uptime_check_timeout
  period       = var.uptime_check_period

  http_check {
    path         = "/${local.healthcheck_endpoint}"
    port         = "443"
    use_ssl      = true
    validate_ssl = true
  }

  monitored_resource {
    type = "uptime_url"

    labels = {
      project_id = var.gcp_project
      host       = "backend.${var.domain}"
    }
  }
}

# Uptime check for monitoring the frontend -- i.e. the app.
resource "google_monitoring_uptime_check_config" "frontend_check" {
  display_name = local.frontend_check
  timeout      = var.uptime_check_timeout
  period       = var.uptime_check_period

  http_check {
    path         = "/${local.healthcheck_endpoint}"
    port         = "443"
    use_ssl      = true
    validate_ssl = true

    headers = {
      # Bypass cache to ensure service uptime, rather than Nginx uptime.
      "Pragma" = "no-cache"
    }
  }

  monitored_resource {
    type = "uptime_url"

    labels = {
      project_id = var.gcp_project
      host       = "app.${var.domain}"
    }
  }
}

# Uptime check for monitoring the marketing site.
resource "google_monitoring_uptime_check_config" "marketing_check" {
  display_name = local.marketing_check
  timeout      = var.uptime_check_timeout
  period       = var.uptime_check_period

  http_check {
    path         = "/${local.healthcheck_endpoint}"
    port         = "443"
    use_ssl      = true
    validate_ssl = true

    headers = {
      # Bypass cache to ensure service uptime, rather than Nginx uptime.
      "Pragma" = "no-cache"
    }
  }

  monitored_resource {
    type = "uptime_url"

    labels = {
      project_id = var.gcp_project
      host       = var.domain
    }
  }
}

# Notification channel for emails.
resource "google_monitoring_notification_channel" "email" {
  display_name = "Email Alerts"
  type         = "email"

  labels = {
    email_address = var.alerts_email
  }
}

# Alerting policy for the backend check that alerts on the email notification channel whenever the uptime check fails.
resource "google_monitoring_alert_policy" "backend_check_alerting_policy" {
  display_name = "${var.project_name}-backend-alerting-policy"
  combiner     = "OR"

  conditions {
    display_name = "Uptime Check for ${local.backend_check}"

    # Figuring out this whole configuration was done by manually by creating an Uptime Check alerting policy
    # and then inspecting its configuration using `gcloud alpha monitoring policies list`.
    condition_threshold {
      filter = "resource.type=\"uptime_url\" AND metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.backend_check.uptime_check_id}\""

      aggregations {
        alignment_period     = "1200s"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        group_by_fields      = ["resource.*"]
      }

      comparison      = "COMPARISON_GT"
      duration        = var.uptime_check_period
      threshold_value = "1"

      trigger {
        count = "1"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}

# Alerting policy for the frontend check that alerts on the email notification channel whenever the uptime check fails.
resource "google_monitoring_alert_policy" "frontend_check_alerting_policy" {
  display_name = "${var.project_name}-frontend-alerting-policy"
  combiner     = "OR"

  conditions {
    display_name = "Uptime Check for ${local.frontend_check}"

    condition_threshold {
      filter = "resource.type=\"uptime_url\" AND metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.frontend_check.uptime_check_id}\""

      aggregations {
        alignment_period     = "1200s"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        group_by_fields      = ["resource.*"]
      }

      comparison      = "COMPARISON_GT"
      duration        = var.uptime_check_period
      threshold_value = "1"

      trigger {
        count = "1"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}

# Alerting policy for the marketing check that alerts on the email notification channel whenever the uptime check fails.
resource "google_monitoring_alert_policy" "marketing_check_alerting_policy" {
  display_name = "${var.project_name}-marketing-alerting-policy"
  combiner     = "OR"

  conditions {
    display_name = "Uptime Check for ${local.marketing_check}"

    condition_threshold {
      filter = "resource.type=\"uptime_url\" AND metric.type=\"monitoring.googleapis.com/uptime_check/check_passed\" AND metric.label.check_id=\"${google_monitoring_uptime_check_config.marketing_check.uptime_check_id}\""

      aggregations {
        alignment_period     = "1200s"
        cross_series_reducer = "REDUCE_COUNT_FALSE"
        per_series_aligner   = "ALIGN_NEXT_OLDER"
        group_by_fields      = ["resource.*"]
      }

      comparison      = "COMPARISON_GT"
      duration        = var.uptime_check_period
      threshold_value = "1"

      trigger {
        count = "1"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}

# Alerting policy that complains if backups aren't being pushed to the designated storage bucket.
resource "google_monitoring_alert_policy" "database_backups_alerting_policy" {
  display_name = "${var.project_name}-database-backups-alerting-policy"
  combiner     = "OR"

  conditions {
    display_name = "Check for ${local.database_backups_check}"

    condition_absent {
      filter = "metric.type=\"storage.googleapis.com/api/request_count\" resource.type=\"gcs_bucket\" resource.label.\"bucket_name\"=\"${var.database_backups_bucket}\""

      aggregations {
        alignment_period   = "60s"
        per_series_aligner = "ALIGN_RATE"
      }

      duration = var.database_backups_check_period

      trigger {
        count = "1"
      }
    }
  }

  notification_channels = [google_monitoring_notification_channel.email.name]
}

# A custom metric that looks at the nginx logs for backend routes and aggregates their latency.
resource "google_logging_metric" "backend_latency" {
  name = "${var.cluster_name}/backend/latency"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
  httpRequest.requestUrl!~"${local.healthcheck_endpoint}"
  httpRequest.requestUrl!~"${var.project_short_code}-"
  httpRequest.requestUrl=~"backend.${var.domain}"
EOF

  bucket_options {
    exponential_buckets {
      growth_factor      = 2
      num_finite_buckets = 64
      scale              = 0.01
    }
  }

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "s"
  }

  value_extractor = "EXTRACT(httpRequest.latency)"
}

# A custom metric that looks at the nginx logs for frontend routes and aggregates their latency.
resource "google_logging_metric" "frontend_latency" {
  name = "${var.cluster_name}/frontend/latency"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
  httpRequest.requestUrl!~"${local.healthcheck_endpoint}"
  httpRequest.requestUrl!~"${var.project_short_code}-"
  httpRequest.requestUrl=~"app.${var.domain}"
EOF

  bucket_options {
    exponential_buckets {
      growth_factor      = 2
      num_finite_buckets = 64
      scale              = 0.01
    }
  }

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "s"
  }

  value_extractor = "EXTRACT(httpRequest.latency)"
}

# A custom metric that looks at the nginx logs for marketing routes and aggregates their latency.
resource "google_logging_metric" "marketing_latency" {
  name = "${var.cluster_name}/marketing/latency"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
  httpRequest.requestUrl!~"${local.healthcheck_endpoint}"
  httpRequest.requestUrl!~"${var.project_short_code}-"
  httpRequest.requestUrl!~"app"
  httpRequest.requestUrl!~"backend"
  httpRequest.requestUrl=~"${var.domain}"
EOF

  bucket_options {
    exponential_buckets {
      growth_factor      = 2
      num_finite_buckets = 64
      scale              = 0.01
    }
  }

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "s"
  }

  value_extractor = "EXTRACT(httpRequest.latency)"
}

# A custom metric that looks at the nginx logs and aggregates latency of all requests.
resource "google_logging_metric" "nginx_latency" {
  name = "${var.cluster_name}/nginx/latency"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
EOF

  bucket_options {
    exponential_buckets {
      growth_factor      = 2
      num_finite_buckets = 64
      scale              = 0.01
    }
  }

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "s"
  }

  value_extractor = "EXTRACT(httpRequest.latency)"
}

# A custom metric that looks at the nginx logs and counts all requests.
resource "google_logging_metric" "nginx_requests_count" {
  name = "${var.cluster_name}/nginx/requests-count"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
  httpRequest.requestUrl!~"${local.healthcheck_endpoint}"
  httpRequest.requestUrl!~"${var.project_short_code}-"
  httpRequest.requestUrl=~"${var.domain}"
EOF

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

# A custom metric that looks at the nginx logs and counts all no-accounts logins.
resource "google_logging_metric" "no_account_logins" {
  name = "${var.cluster_name}/no-account-logins"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${local.ingress_nginx_namespace}"
  resource.labels.container_name="${local.ingress_nginx_container}"
  httpRequest.userAgent!="${local.stackdriver_user_agent}"
  httpRequest.requestUrl=~"/login/no-account"
EOF

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

# A custom metric that looks at the database logs and collects query durations.
resource "google_logging_metric" "database_query_duration" {
  name = "${var.cluster_name}/database/query-duration"

  filter = <<EOF
  resource.type="k8s_container"
  resource.labels.cluster_name="${var.cluster_name}"
  resource.labels.namespace_name="${var.production_namespace}"
  resource.labels.container_name="backend-database"
  textPayload=~"duration"
EOF

  bucket_options {
    exponential_buckets {
      growth_factor      = 2
      num_finite_buckets = 64
      scale              = 0.01
    }
  }

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "DISTRIBUTION"
    unit        = "ms"
  }

  value_extractor = "REGEXP_EXTRACT(textPayload, \"duration: (.*) ms\")"
}

# A custom metric that counts when node preemptions happen.
resource "google_logging_metric" "node_preemptions" {
  name = "${var.cluster_name}/preemptions"

  filter = <<EOF
  resource.type="gce_instance"
  protoPayload.methodName="compute.instances.preempted"
  protoPayload.resourceName=~"${var.cluster_name}"
EOF

  metric_descriptor {
    metric_kind = "DELTA"
    value_type  = "INT64"
    unit        = "1"
  }
}

# I mean, all the configuration is in a separate file, but the gist of it is that it's a simple dashboard
# showing CPU/RAM usage for various cluster resources (nodes, production pods, etc).
resource "google_monitoring_dashboard" "cluster_dashboard" {
  depends_on = [
    google_logging_metric.backend_latency,
    google_logging_metric.frontend_latency,
    google_logging_metric.marketing_latency,
    google_logging_metric.nginx_latency
  ]

  dashboard_json = file("${path.module}/cluster-dashboard.json")
}
