# 🚦 Quick Reference - How to Register Services

## ❗ Problem: "403 Error" or "Don't know port/host"

### Solution:

**Step 1: Make sure Service Registry API is running**

```bash
# Test if API is accessible
curl http://localhost:8085/api/services

# If not working, start the services
cd /Users/tab/Documents/MicroServiceTEST
docker compose up -d
```

**Wait 30 seconds for services to start, then try again.**

---

## 📋 What Host and Port to Use?

### Case 1: Service Running on Your Laptop

```bash
# Your service runs locally
java -jar myapp.jar
# or
npm start
```

**Use:**
- **Host:** `localhost`
- **Port:** The port number (e.g., `8080`, `3000`, `5000`)

**Example:**
```
Service Name: my-app
Port: 8080
Host: localhost
```

---

### Case 2: Service Running in Docker Container

```yaml
# Your docker-compose.yml
myapp:
  image: myapp:latest
  ports:
    - "8086:8080"
```

**Use:**
- **Host:** Container name (`myapp`)
- **Port:** Container's internal port (`8080`)

**Example:**
```
Service Name: my-app
Port: 8080
Host: myapp
```

---

### Case 3: Demo Services (Company, Job, Review, Gateway)

**You don't need to register them!** They are already monitored automatically.

Just view their 
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100  
- Tempo: http://localhost:3200

---

## 🔧 Full Registration Steps

### 1. Start All Services

```bash
cd /Users/tab/Documents/MicroServiceTEST
./start.sh
```

Wait 30 seconds.

### 2. Test API is Working

```bash
curl http://localhost:8085/api/services
```

Should return: `[]` (empty array)

### 3. Open Dashboard

http://localhost:3001

### 4. Click "Register Service"

### 5. Fill the Form

**For a service running on localhost:8086:**

```
Service Name:     my-web-app
Service Type:     web
Port:             8086
Host:             localhost
Description:      My test service
Owner:            My Team

☑ Metrics (Prometheus)
☑ Logs (Loki)
☑ Tracing (Tempo)
```

### 6. Click "Register"

✅ Success! Your service is now registered.

---

## ✅ Verify Registration

### Check in Dashboard
- Your service appears in the list

### Check Prometheus
- Go to http://localhost:9090
- Click "Status" → "Targets"
- See your service

### Check Logs
- Logs written to: `/logs/my-web-app.log`
- View in Loki: http://localhost:3100

---

## 🐛 Troubleshooting

### 403 Error

**Cause:** Service Registry API not running

**Fix:**
```bash
docker compose up -d service-registry-api
docker compose logs service-registry-api
```

### "Cannot connect to API"

**Cause:** API not ready yet

**Fix:** Wait 30 seconds after starting services

### Service not appearing in Prometheus

**Cause:** Metrics endpoint not exposed

**Fix:** Add to your service:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
```

```properties
management.endpoints.web.exposure.include=health,info,prometheus
```

---

## 📞 Quick Commands

```bash
# Start everything
docker compose up -d

# Check API
curl http://localhost:8085/api/services

# Check services status
docker compose ps

# View API logs
docker compose logs service-registry-api

# View dashboard logs
docker compose logs observability-dashboard-ui

# Restart API
docker compose restart service-registry-api
```

---

## 🎯 Summary

| Question | Answer |
|----------|--------|
| **Dashboard URL** | http://localhost:3001 |
| **API URL** | http://localhost:8085 |
| **Host for localhost** | `localhost` |
| **Host for Docker** | Container name |
| **Demo services** | Already registered automatically |
| **403 Error** | Start Service Registry API |

**Remember:** Wait 30 seconds after starting services for everything to be ready!
