// Cloud provider
// https://registry.terraform.io/providers/hashicorp/google/latest/docs
provider "google" {
  project = "hopeful-sunset-311310"
  region  = "europe-central2"
  zone    = "europe-central2-a"
}

// Bucket for storing function's code
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket
resource "google_storage_bucket" "bucket" {
  name     = "perun"
  location = "EUROPE-CENTRAL2"
}

// Function's code stored as bucket object
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/storage_bucket_object
resource "google_storage_bucket_object" "archive" {
  name   = format("%s.zip", filemd5("../build/index.zip"))
  bucket = google_storage_bucket.bucket.name
  source = "../build/index.zip"
}

// Function's definition
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudfunctions_function
resource "google_cloudfunctions_function" "function" {
  name                  = "perun"
  entry_point           = "run"
  description           = "Function which performs source code analysis"
  runtime               = "nodejs12"
  available_memory_mb   = 4096
  timeout               = 540
  trigger_http          = true
  ingress_settings      = "ALLOW_ALL"
  source_archive_bucket = google_storage_bucket.bucket.name
  source_archive_object = google_storage_bucket_object.archive.name
  service_account_email = google_service_account.function_sa.email
  environment_variables = {
    "SECRETS_PATH"     = "projects/hopeful-sunset-311310/secrets/perun-secrets/versions/latest",
    "PRIVATE_KEY_PATH" = "projects/hopeful-sunset-311310/secrets/perun-private-key/versions/latest",
  }
}

// Role for invoking function
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/cloudfunctions_cloud_function_iam#google_cloudfunctions_function_iam_member
resource "google_cloudfunctions_function_iam_member" "invoker" {
  project        = google_cloudfunctions_function.function.project
  region         = google_cloudfunctions_function.function.region
  cloud_function = google_cloudfunctions_function.function.name
  role           = "roles/cloudfunctions.invoker"
  member         = "allUsers"
}

// Function's service account (role used by the function for accessing secret manager)
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_service_account
resource "google_service_account" "function_sa" {
  account_id   = "service-perun-333"
  display_name = "perun-service-account"
}

// Service account's policy
// https://registry.terraform.io/providers/hashicorp/google/latest/docs/resources/google_project_iam
resource "google_project_iam_member" "project" {
  project = "hopeful-sunset-311310"
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}
