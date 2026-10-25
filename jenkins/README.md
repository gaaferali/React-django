# Jenkins pipeline

Configure the Jenkins job to use `jenkins/Jenkinsfile` as its Script Path.

The pipeline runs Django migration checks and the integration suite with SQLite,
builds the React application, and optionally builds the Docker Compose images.
Deployment is deliberately opt-in through the `DEPLOY` parameter and only runs
for `main`.

Before enabling deployment, create a Jenkins **Secret file** credential named
`aman-production-env`. Its contents should follow the root `.env.Example` file
with production values. The deployment stage passes that file to Docker Compose;
it is never copied into the repository.
