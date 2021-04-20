terraform {
  backend "gcs" {
    bucket = "perun-state"
    prefix = "terraform/state"
  }
}