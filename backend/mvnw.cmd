@echo off
set "MAVEN_OPTS=-Djava.net.preferIPv4Stack=true"
set "IDEA_MAVEN=E:\IntelliJ IDEA 2023.2.8\plugins\maven\lib\maven3\bin\mvn.cmd"
if exist "%IDEA_MAVEN%" (
    call "%IDEA_MAVEN%" %*
) else (
    call mvn %*
)
