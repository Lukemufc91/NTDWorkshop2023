pipeline {
    agent any
    stages {
        stage('Build API container') {
            steps {
                sh 'docker build . -t masterman/movie-api'
            }
        }
    }
}