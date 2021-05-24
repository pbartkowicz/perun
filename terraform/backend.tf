// Bucket for terraform's remote state
// https://www.terraform.io/docs/language/settings/backends/gcs.html
terraform {
  backend "gcs" {
    bucket = "perun-state"
    prefix = "terraform/state"
  }
}