pipeline {
    agent any
    stages {
        stage('Build API container') {
            steps {
                bat 'docker build . -t dbala/movie-api'
            }
        }
    }
}