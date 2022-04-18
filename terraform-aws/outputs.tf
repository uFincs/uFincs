output "database_backup_writer_key_id" {
  value = aws_iam_access_key.database_backup_writer.id
}

output "database_backup_writer_key" {
  value = aws_iam_access_key.database_backup_writer.secret
}

