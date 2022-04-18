# Terraform (for AWS)

uFincs has an AWS account. Account alias "ufincs".

The reason we want to keep the AWS Terraform config separate from the GCP config is because the AWS infra is outside the scope of Kubails, and Kubails manages the GCP infra.

In order to run Terraform against this AWS account, you need to do the following:

1. Add your access key/ID to your ~/.aws/credentials file under a `[ufincs]` profile.
2. Make sure a `ufincs-terraform` bucket exists in the project (or change the name if need be).
3. Run all terraform commands prefixed with `AWS_PROFILE=ufincs`. For example, `AWS_PROFILE=ufincs terraform apply`.