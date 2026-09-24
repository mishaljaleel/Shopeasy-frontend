pipeline {
    agent any

    stages {
        stage('Checkout Source') {
            steps {
                echo 'Checking out latest frontend code from GitHub...'
                checkout scm
            }
        }

        stage('Build & Package Frontend Container') {
            steps {
                echo 'Building React 19 SPA and Nginx image...'
                sh 'docker build -t easyshop-frontend:latest .'
            }
        }

        stage('Deploy to Production') {
            steps {
                echo 'Restarting live frontend container with newly built image...'
                sh 'docker restart easyshop-frontend'
            }
        }
    }

    post {
        success {
            echo '🎉 EasyShop Frontend CI/CD Pipeline completed successfully!'
        }
        failure {
            echo '❌ Pipeline failed. Check console logs.'
        }
    }
}
