provider "google" {
  project = "hopeful-sunset-311310"
  region  = "europe-central2"
  zone    = "europe-central2-a"
}

resource "google_storage_bucket" "bucket" {
  name     = "perun"
  location = "EUROPE-CENTRAL2"
}

resource "google_storage_bucket_object" "archive" {
  name   = "index.zip"
  bucket = google_storage_bucket.bucket.name
  source = "../build/index.zip"
}

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
}