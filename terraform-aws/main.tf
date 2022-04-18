################################################################################
# TERRAFORM CONFIGURATION
################################################################################

terraform {
  backend "s3" {
    bucket = "ufincs-terraform"
    key    = "terraform"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

################################################################################
# PRIMARY RESOURCES
################################################################################

# This is the bucket where we'll store the backups.
resource "aws_s3_bucket" "database_backups" {
  bucket = "${var.project_name}-cluster-database-backups"
  acl    = "private"

  lifecycle_rule {
    id      = "delete_old_backups"
    enabled = true

    expiration {
      # Delete after 60 days.
      days = 60
    }
  }
}

# For some awful reason, AWS requires this extra resource to make a bucket _actually_ private. 
# That is, a bucket can be private by default (see `acl = "private"` above), but an admin could still
# set an individual object as public. As such, we need this resource to prevent even _that_.
resource "aws_s3_bucket_public_access_block" "database_backups" {
  bucket = aws_s3_bucket.database_backups.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# This is the IAM user that will be used to perform the copying of the backups to S3.
resource "aws_iam_user" "database_backup_writer" {
  name = "database-backup-writer"
}

# This is the access key for the above IAM user.
# Note: It's secret value is actually stored in Terraform state, which isn't _ideal_, but since
# the user only has write permissions to a single bucket... eh, whatever.
# The secret value and ID value are configured as `outputs` (see `outputs.tf`).
resource "aws_iam_access_key" "database_backup_writer" {
  user = aws_iam_user.database_backup_writer.name
}

# This policy locks the backup writer user to only be able to write to the backups bucket, and nothing else. 
resource "aws_iam_policy" "database_backup_writer" {
  name        = "database-backup-writer-policy"
  description = "A policy for enabling only write access to the database backups bucket."

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action   = ["s3:PutObject"]
        Effect   = "Allow"
        Resource = ["${aws_s3_bucket.database_backups.arn}/*"]
      }
    ]
  })
}

# This attaches the above policy to the backup writer user.
resource "aws_iam_user_policy_attachment" "database_backup_writer" {
  user       = aws_iam_user.database_backup_writer.name
  policy_arn = aws_iam_policy.database_backup_writer.arn
}

