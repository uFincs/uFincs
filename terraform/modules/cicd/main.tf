# The repo and trigger resources seem to complain if the GCP project
# isn't specified, even though it shouldn't need to be required...

resource "google_sourcerepo_repository" "primary" {
  name    = "${var.repo_host}_${var.repo_owner}_${var.repo_name}"
  project = var.gcp_project
}

resource "google_cloudbuild_trigger" "primary" {
  depends_on  = [google_sourcerepo_repository.primary]
  description = "Push to any branch"
  filename    = "cloudbuild.yaml"
  project     = var.gcp_project

  trigger_template {
    branch_name = ".*"
    project_id  = var.gcp_project
    repo_name   = google_sourcerepo_repository.primary.name
  }

  lifecycle {
    # 'substitutions' includes the Slack webhook that is added manually (since it's a secret)
    ignore_changes = [disabled, substitutions]
  }
}
