init:
	gcloud auth application-default login
	terraform -chdir=./terraform init

build: clean
	mkdir build
	zip -r build/index.zip src/ package.json yarn.lock

plan: build
	terraform -chdir=./terraform plan

deploy: build
	terraform -chdir=./terraform apply

clean-function:
	terraform -chdir=./terraform destroy -target=google_cloudfunctions_function.function

clean:
	rm -rf ./build