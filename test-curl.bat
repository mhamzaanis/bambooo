@echo off
echo Testing GET dependents...
curl -v http://localhost:5000/api/employees/emp-1/dependents
echo.
echo.
echo Testing POST dependent...
curl -v -X POST http://localhost:5000/api/employees/emp-1/dependents -H "Content-Type: application/json" -d "{\"firstName\":\"Test\",\"lastName\":\"Dependent\",\"relationship\":\"child\",\"dateOfBirth\":\"2010-01-01\"}"
pause
