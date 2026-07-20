Start the server
bash
uvicorn app.main:app --reload --port 8000

Verify the server ir sunning
bash
curl http://localhost:8000/api/health

Regster to get a Token
bash
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@serenity.app","password":"calm1234","name":"Ruby"}'

login
bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@serenity.app","password":"calm1234"}'

List all active tasks
bash
curl http://localhost:8000/api/tasks/ \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI4NjNhOTliNS1jM2Y0LTQ0YmYtYmRhNy0xYTU1YzcwZTNlMTUiLCJleHAiOjE3ODAwNDg0OTcsInR5cGUiOiJhY2Nlc3MifQ.2S14FFCVRqgYEzC4T2Q1rLHUhCDw199DmvtZLqbRbgU"

One command for everything
  TOKEN=$(curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@serenity.app","password":"calm1234"}' \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

List tasks
curl http://localhost:8000/api/tasks/ -H "Authorization: Bearer $TOKEN"

Create task with subtasks
bash
curl -X POST http://localhost:8000/api/tasks/ \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"title":"Submit report","priority":"high","subtasks":[{"title":"Gather data","order":0},{"title":"Write draft","order":1}]}'

Check Limbo
bash
curl http://localhost:8000/api/tasks/limbo/count -H "Authorization: Bearer $TOKEN"

View archived
curl "http://localhost:8000/api/tasks/?destination=archive" -H "Authorization: Bearer $TOKEN"


STEP BY STEP OF HOW TO OPERATE APP
# ─── Login first ───
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@serenity.app","password":"calm1234"}' > /tmp/login.json
TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/login.json'))['access_token'])")

# ─── Your Profile ───
echo "=== YOUR PROFILE ==="
curl -s http://localhost:8000/api/users/me -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Active Tasks ───
echo "\n=== ACTIVE TASKS ==="
curl -s "http://localhost:8000/api/tasks/?destination=active" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Tasks In Limbo ───
echo "\n=== TASKS IN LIMBO ==="
curl -s "http://localhost:8000/api/tasks/?destination=limbo" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Completed/Archived Tasks ───
echo "\n=== ARCHIVED TASKS ==="
curl -s "http://localhost:8000/api/tasks/?destination=archive" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Limbo Count ───
echo "\n=== LIMBO COUNT ==="
curl -s http://localhost:8000/api/tasks/limbo/count -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Shopping List (Pending) ───
echo "\n=== SHOPPING LIST (PENDING) ==="
curl -s "http://localhost:8000/api/shopping/?is_purchased=false" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Shopping List (Purchased) ───
echo "\n=== SHOPPING LIST (PURCHASED) ==="
curl -s "http://localhost:8000/api/shopping/?is_purchased=true" -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Upcoming Shopping Trips ───
echo "\n=== UPCOMING SHOPPING TRIPS ==="
curl -s http://localhost:8000/api/shopping/trips/upcoming -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── All Off Days ───
echo "\n=== ALL OFF DAYS ==="
curl -s http://localhost:8000/api/off-days/ -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Upcoming Off Days (Next 7 Days) ───
echo "\n=== UPCOMING OFF DAYS ==="
curl -s http://localhost:8000/api/off-days/upcoming/soon -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

# ─── Today's Off Days ───
echo "\n=== OFF TODAY ==="
curl -s http://localhost:8000/api/off-days/today/list -H "Authorization: Bearer $TOKEN" | python3 -m json.tool

STATUS CHECK SCRIPT
cat > /home/ruby/GARNETIA\ GROUP/SERENITY/check-status.sh << 'SCRIPT'
#!/bin/bash

# Login
curl -s -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@serenity.app","password":"calm1234"}' > /tmp/login.json
TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/login.json'))['access_token'])")

echo "════════════════════════════════════════"
echo "          SERENITY DASHBOARD            "
echo "════════════════════════════════════════"

echo -e "\n📋 ACTIVE TASKS"
curl -s "http://localhost:8000/api/tasks/?destination=active" -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'  Total active: {data[\"total\"]}')
for t in data['tasks']:
    print(f'  • {t[\"title\"]} [{t[\"priority\"]}] - {t[\"status\"]}')
"

echo -e "\n⏳ IN LIMBO"
curl -s http://localhost:8000/api/tasks/limbo/count -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'  Tasks waiting: {data[\"count\"]}')
"

echo -e "\n📦 ARCHIVED"
curl -s "http://localhost:8000/api/tasks/?destination=archive" -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'  Completed tasks: {data[\"total\"]}')
"

echo -e "\n🛒 SHOPPING"
curl -s "http://localhost:8000/api/shopping/?is_purchased=false" -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'  Items to buy: {data[\"total\"]}')
for item in data['items']:
    date_info = f' (planned: {item[\"target_date\"]})' if item['target_date'] else ''
    print(f'  • {item[\"item_name\"]} x{item[\"quantity\"]}{date_info}')
"

echo -e "\n👥 OFF DAYS"
curl -s http://localhost:8000/api/off-days/upcoming/soon -H "Authorization: Bearer $TOKEN" | python3 -c "
import json, sys
data = json.load(sys.stdin)
print(f'  Upcoming in next {data[\"days_ahead\"]} days: {data[\"total\"]}')
for entry in data['entries']:
    print(f'  • {entry[\"employee_name\"]} - {entry[\"off_date\"]}')
"

echo -e "\n════════════════════════════════════════"
SCRIPT

chmod +x /home/ruby/GARNETIA\ GROUP/SERENITY/check-status.sh