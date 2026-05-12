# 📝 How to Register Your Service

## ❓ "I don't know the port and host"

**Don't worry!** Here's how to figure it out:

---

## 🔍 Step 1: What Service Are You Registering?

### Scenario A: You Want to Monitor Existing Services (Company, Job, Review, Gateway)

**These are already running in Docker!** You don't need to register them manually.

They are automatically monitored:
- **Company** → `companyms:8081`
- **Job** → `jobms:8082`
- **Review** → `reviewms:8083`
- **Gateway** → `gateway-ms:8084`

Just view their 
- Prometheus: http://localhost:9090
- Loki: http://localhost:3100
- Tempo: http://localhost:3200

---

### Scenario B: You Have a NEW Service to Add

**Example:** You built a new web application called "MyWebApp"

#### Question 1: Where is your service running?

**A. Running on your laptop (localhost):**
```bash
# You started your service like this:
java -jar myapp.jar
# or
npm start
```
- **Host:** `localhost`
- **Port:** The port your app uses (e.g., `8080`, `3000`, `5000`)

**B. Running in Docker:**
```yaml
# In your docker-compose.yml
myapp:
  image: myapp:latest
  ports:
    - "8086:8080"  # Host:Container
```
- **Host:** Container name (e.g., `myapp`)
- **Port:** Container port (e.g., `8080`)

---

## 📋 Step 2: Fill the Registration Form

### Example 1: Service Running on Your Laptop

Your service runs on `http://localhost:8086`

**Fill the form:**
```
Service Name: my-web-app
Service Type: web
Port: 8086
Host: localhost
Description: My awesome web application
Owner: My Team

✓ Metrics (Prometheus)
✓ Logs (Loki)
✓ Tracing (Tempo)
```

### Example 2: Service Running in Docker

Your service container is named `myapp` and uses port `8080` internally:

**Fill the form:**
```
Service Name: my-app
Service Type: application
Port: 8080
Host: myapp
Description: My Dockerized app
Owner: My Team

✓ Metrics (Prometheus)
✓ Logs (Loki)
✓ Tracing (Tempo)
```

---

## 🔧 Step 3: Configure Your Service

### For Metrics (Prometheus)

Add to your `pom.xml`:
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-actuator</artifactId>
</dependency>
<dependency>
    <groupId>io.micrometer</groupId>
    <artifactId>micrometer-registry-prometheus</artifactId>
</dependency>
```

Add to your `application.properties`:
```properties
management.endpoints.web.exposure.include=health,info,prometheus
```

**Verify:** Open `http://localhost:8086/actuator/prometheus`

### For Logs (Loki)

Your service must write logs to a file.

**If running on laptop:**
```properties
# application.properties
logging.file.name=/logs/my-web-app.log
```

**If running in Docker:**
```yaml
volumes:
  - ./logs:/logs
environment:
  - LOGGING_FILE_NAME=/logs/my-web-app.log
```

### For Tracing (Tempo)

Add to your Docker environment:
```yaml
environment:
  - OTEL_EXPORTER_OTLP_ENDPOINT=http://tempo:4318
  - OTEL_TRACES_EXPORTER=otlp
  - OTEL_SERVICE_NAME=my-web-app
```

---

## ✅ Step 4: Verify

After registering:

1. **Check Registration:**
   - Dashboard shows your service in the list

2. **Check Prometheus:**
   - Go to http://localhost:9090
   - Click "Status" → "Targets"
   - Your service should appear

3. **Check Logs:**
   - Go to http://localhost:3100
   - Or use Grafana/Loki UI

4. **Check Traces:**
   - Go to http://localhost:3200
   - Search by service name

---

## 🎯 Quick Reference

| Your Service Location | Host | Port | Example |
|-----------------------|------|------|---------|
| **Local laptop** | `localhost` | Your app's port | `localhost:8086` |
| **Docker container** | Container name | Container's internal port | `myapp:8080` |
| **Another server** | Server IP/DNS | Service port | `192.168.1.100:8080` |

---

## ❓ Common Questions

### "What if my service doesn't have /actuator/prometheus?"

That's OK! Just uncheck "Metrics" when registering. You can still use Logs and Tracing.

### "What if I'm not writing to /logs/*.log?"

That's OK! Just uncheck "Logs" when registering. You can still use Metrics and Tracing.

### "Can I register a service that's not Spring Boot?"

**Yes!** Any service can be registered:
- Node.js, Python, Go, etc.
- Just provide the correct host and port
- Use appropriate metrics/logs/tracing libraries for your language

### "Do I need to register the demo services (company, job, review, gateway)?"

**No!** They are already built-in and automatically monitored.

---

## 🚀 Summary

1. **Find your service's port** → What port does your app run on?
2. **Find your service's host** → `localhost` (laptop) or container name (Docker)
3. **Fill the form** → Name, type, port, host
4. **Configure your service** → Add actuator, logging, tracing
5. **View data** → Prometheus, Loki, Tempo

**Need help?** Check if your service is accessible first:
```bash
# Test from your browser or terminal
curl http://localhost:8086/actuator/prometheus
```

If that works, registration will work too!
