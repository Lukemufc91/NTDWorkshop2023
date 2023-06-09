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
                bat 'docker volume create test-reports'
                bat 'docker run -e PORT=3000 -e BASE_URI=172.17.0.2 --network bridge -v test-reports:/usr/src/app --rm dbala/movie-api-tests'
            }
        }
        stage('Retrieve reports') {
            steps {
                bat 'docker container create --name report-container -v test-reports:/root alpine'
                bat 'docker cp report-container:/root/reports/. ${WORKSPACE}/reports'
//                 bat 'docker cp report-container:/root/reports/. C:/ProgramData/Jenkins/.jenkins/workspace/movies-api-test/reports'
            }
        }
    }
    post('Cleanup') {
                always {
                    bat 'docker kill api-container'
                    bat 'docker rm report-container'
                    bat 'docker volume rm test-reports'
                }
    }
}