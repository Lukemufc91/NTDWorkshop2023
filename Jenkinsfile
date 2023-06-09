pipeline {
    agent any
    stages {
    stage('Build API container') {
                steps {
                    bat 'docker build . -t dbala/movie-api'
                }
            }
    stage ('Run API container') {
                steps {
                    bat 'docker run -p 3000:3000 --network bridge -d dbala/movie-api'
                }
            }
    stage('Build Test container') {
                steps {
                    bat 'docker build tests -t dbala/movie-api-tests'
                }
            }
    stage('Execute tests') {
                steps {
                    bat 'docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge --rm dbala/movie-api-tests'
                }
            }
    stage('Cleanup') {
                steps {
                    bat 'docker kill dbala/movie-api'
                    bat 'docker kill dbala/movie-api-tests'
                }
            }
}
}