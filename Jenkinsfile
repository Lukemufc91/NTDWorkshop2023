pipeline {
    agent any
    stages {
    stage('Build API container') {
                steps {
                    bat 'docker kill api-container'
                    bat 'docker build . -t dbala/movie-api'
                }
            }
            stage ('Run API container') {
                steps {
                    bat 'docker run -p 3000:3000 --network bridge --name api-container --rm -d dbala/movie-api'
                }
            }
            stage('Build Test container') {
                steps {
                    bat 'docker build tests -t dbala/movie-api-tests'
                }
            }
        stage('Execute tests') {
            steps {
                sh 'docker volume create test-reports'
                sh 'docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge -v test-reports:/usr/src/app --rm masterman/movie-api-tests'
            }
        }
        stage('Retrieve reports') {
            steps {
                sh 'docker container create --name report-container -v test-reports:/root alpine'
                sh 'docker cp report-container:/root/reports/. ${WORKSPACE}/reports'
            }
        }
        stage('Cleanup') {
            steps {
                sh 'docker kill api-container'
                sh 'docker rm report-container'
                sh 'docker volume rm test-reports'
            }
        }
    }
}