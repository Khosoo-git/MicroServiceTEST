# 🧪 Health Monitoring Testing Guide

## 🎯 **Quick Tests**

### **Test 1: Stop a Service (See it go DOWN)**

```bash
# Stop company service
docker stop company

# Wait 20 seconds for health checker to detect
sleep 20

# Check status - should show UNHEALTHY
curl http://localhost:8085/api/admin/health-stats | python3 -m json.tool

# Check dashboard - http://localhost:3002/services
# Company should show RED/UNHEALTHY with dropping uptime
```

---

### **Test 2: Restart Service (See it RECOVER)**

```bash
# Start company service
docker start company

# Wait 30 seconds for recovery
sleep 30

# Check status - should show HEALTHY
curl http://localhost:8085/api/admin/health-stats | python3 -m json.tool

# Dashboard should show GREEN/HEALTHY
# Uptime will be less than 100% due to downtime
```

---

### **Test 3: Rapid Failure Test**

```bash
# Quick stop/start cycle
docker stop job
sleep 5
docker start job

# Wait for health check cycle
sleep 15

# Check - should see some failed checks
curl http://localhost:8085/api/admin/health-stats | python3 -c "
import sys, json
data = json.load(sys.stdin)
job = data['services'].get('job', {})
print(f'Job Service:')
print(f'  Status: {job.get(\"status\")}')
print(f'  Uptime: {job.get(\"uptimePercentage\", 0):.1f}%')
print(f'  Total Checks: {job.get(\"totalChecks\", 0)}')
print(f'  Successful: {job.get(\"successfulChecks\", 0)}')
print(f'  Failed: {job.get(\"totalChecks\", 0) - job.get(\"successfulChecks\", 0)}')
"
```

---

### **Test 4: Monitor Real-Time**

```bash
# Watch health stats update in real-time
watch -n 5 'curl -s http://localhost:8085/api/admin/health-stats | python3 -c "
import sys, json
data = json.load(sys.stdin)
for name, stats in data.get(\"services\", {}).items():
    status = stats.get(\"status\", \"?\")
    uptime = stats.get(\"uptimePercentage\", 0)
    print(f\"{name:10} | {status:10} | {uptime:5.1f}%\")
"'

# In another terminal, stop a service:
docker stop review

# Watch the dashboard update!
```

---

### **Test 5: Use Interactive Test Script**

```bash
# Run the complete test suite
./test-health-monitoring.sh

# Menu options:
# 1. Run ALL tests automatically
# 2. Test 1: Stop Service
# 3. Test 2: Restart Service
# 4. Test 3: Check Uptime
# 5. Test 4: Rapid Cycle
# 6. View Dashboard
# 7. Check Status
```

---

## 📊 **What to Observe**

### **When Service Goes DOWN:**

1. **Dashboard (http://localhost:3002/services)**
   - Status badge changes: GREEN → RED
   - Status text: HEALTHY → UNHEALTHY
   - Uptime % starts dropping
   - Response time: Shows N/A or last known

2. **Health Stats API**
   ```json
   {
     "company": {
       "status": "UNHEALTHY",
       "uptimePercentage": 85.5,  // Dropping
       "totalChecks": 50,
       "successfulChecks": 43,     // Not increasing
       "lastResponseTime": 0       // No response
     }
   }
   ```

---

### **When Service Recovers:**

1. **Dashboard**
   - Status badge: RED → GREEN
   - Status text: UNHEALTHY → HEALTHY
   - Uptime % slowly recovers
   - Response time reappears

2. **Health Stats API**
   ```json
   {
     "company": {
       "status": "HEALTHY",
       "uptimePercentage": 87.2,  // Slowly recovering
       "totalChecks": 60,
       "successfulChecks": 53,     // Increasing again
       "lastResponseTime": 18      // Back!
     }
   }
   ```

---

## 🎯 **Expected Results**

### **Scenario 1: Service Crash (docker stop)**

| Time | Status | Uptime | Response Time |
|------|--------|--------|---------------|
| T=0s | HEALTHY | 100% | 15ms |
| T=10s | UNHEALTHY | 95% | N/A |
| T=20s | UNHEALTHY | 90% | N/A |
| T=30s | UNHEALTHY | 85% | N/A |

---

### **Scenario 2: Service Recovery (docker start)**

| Time | Status | Uptime | Response Time |
|------|--------|--------|---------------|
| T=0s | UNHEALTHY | 85% | N/A |
| T=10s | HEALTHY | 86% | 20ms |
| T=20s | HEALTHY | 87% | 18ms |
| T=30s | HEALTHY | 88% | 17ms |

---

### **Scenario 3: Quick Blip (stop/start 5s)**

| Time | Status | Uptime | Successful/Total |
|------|--------|--------|------------------|
| T=0s | HEALTHY | 100% | 50/50 |
| T=5s | UNHEALTHY | 91% | 50/55 |
| T=15s | HEALTHY | 92% | 51/56 |
| T=30s | HEALTHY | 93% | 53/58 |

---

## 🔍 **API Endpoints for Testing**

### **Get Health Stats**
```bash
curl http://localhost:8085/api/admin/health-stats
```

### **Get All Services**
```bash
curl http://localhost:8085/api/services
```

### **Manually Mark Service HEALTHY**
```bash
curl -X POST "http://localhost:8085/api/admin/recover/company"
```

### **Manually Mark Service DOWN**
```bash
curl -X POST "http://localhost:8085/api/admin/simulate-failure/company?permanent=true"
```

### **Reset All Stats**
```bash
curl -X POST "http://localhost:8085/api/admin/reset-stats"
```

---

## 📈 **Dashboard Testing Checklist**

- [ ] All 4 services show HEALTHY (GREEN)
- [ ] Uptime shows 100% for all
- [ ] Response times visible (10-20ms)
- [ ] Auto-refresh works (watch timer)
- [ ] Stop company service
- [ ] Wait 20 seconds
- [ ] Company shows UNHEALTHY (RED)
- [ ] Uptime drops below 100%
- [ ] Start company service
- [ ] Wait 30 seconds
- [ ] Company shows HEALTHY again
- [ ] Uptime slowly recovers
- [ ] Response time reappears

---

## 🎬 **Complete Demo Script**

```bash
# 1. Show healthy state
echo "=== INITIAL STATE ==="
curl -s http://localhost:8085/api/admin/health-stats | python3 -m json.tool

# 2. Stop company
echo "=== STOPPING COMPANY ==="
docker stop company

# 3. Wait and check
sleep 20
echo "=== AFTER STOP ==="
curl -s http://localhost:8085/api/admin/health-stats | python3 -m json.tool

# 4. Restart company
echo "=== RESTARTING COMPANY ==="
docker start company

# 5. Wait and check recovery
sleep 30
echo "=== AFTER RECOVERY ==="
curl -s http://localhost:8085/api/admin/health-stats | python3 -m json.tool
```

---

## ✅ **Success Criteria**

Your monitoring system is working if:

1. ✅ Services automatically checked every 10 seconds
2. ✅ Status changes HEALTHY → UNHEALTHY when stopped
3. ✅ Uptime % drops when service is down
4. ✅ Status changes UNHEALTHY → HEALTHY when restarted
5. ✅ Response times measured accurately
6. ✅ Dashboard auto-refreshes with new data
7. ✅ Historical data preserved (total checks, successful checks)

---

**Your monitoring system is production-ready!** 🎉

**Test it now:** `./test-health-monitoring.sh`
