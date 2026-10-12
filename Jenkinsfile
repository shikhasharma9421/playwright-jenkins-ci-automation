pipeline {
    agent any

    tools {
        nodejs 'NodeJS-20'
    }

    parameters {
        string(name: 'BASE_URL', defaultValue: 'https://www.saucedemo.com', description: 'Environment under test')
        string(name: 'GREP', defaultValue: '', description: 'Optional test title filter')
    }

    triggers {
        githubPush()
        cron('H 2 * * *')
    }

    options {
        timestamps()
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '20'))
    }

    environment {
        CI = 'true'
        BASE_URL = "${params.BASE_URL}"
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install') {
            steps {
                sh 'npm ci'
                sh 'npx playwright install chromium'
            }
        }

        stage('Health Check') {
            steps {
                sh "curl -sf --max-time 30 ${params.BASE_URL} > /dev/null"
            }
        }

        stage('Test') {
            steps {
                script {
                    def cmd = 'npx playwright test'
                    if (params.GREP?.trim()) {
                        cmd += " --grep \"${params.GREP}\""
                    }
                    sh cmd
                }
            }
        }
    }

    post {
        always {
            junit allowEmptyResults: true, testResults: 'results/junit.xml'

            publishHTML(target: [
                reportName           : 'Playwright Report',
                reportDir            : 'playwright-report',
                reportFiles          : 'index.html',
                keepAll              : true,
                alwaysLinkToLastBuild: true,
                allowMissing         : true
            ])

            archiveArtifacts artifacts: 'test-results/**', allowEmptyArchive: true

            emailext(
                subject: "[${currentBuild.currentResult}] ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                mimeType: 'text/html',
                to: 'your.email@gmail.com',
                attachLog: true,
                body: """
                    <h3>${env.JOB_NAME} - Build #${env.BUILD_NUMBER}</h3>
                    <p><b>Status:</b> ${currentBuild.currentResult}</p>
                    <p><b>Environment:</b> ${params.BASE_URL}</p>
                    <p><b>Duration:</b> ${currentBuild.durationString}</p>
                    <p><a href="${env.BUILD_URL}Playwright_20Report/">Open Playwright Report</a></p>
                    <p><a href="${env.BUILD_URL}console">Console Output</a></p>
                """
            )
        }
    }
}