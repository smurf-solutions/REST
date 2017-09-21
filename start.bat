REM -/=/-

start /B "DATABASE Server" "c:\Program Files\MongoDB\Server\3.4\bin\mongod.exe"
start /B "RESTFull Server" node START.js
REM start "Application" chrome -app="https://localhost/admin/dbmanager/index.html"
start "Application" chrome -app="https://localhost/my/maps/index.html"
