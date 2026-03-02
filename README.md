# MicroService TEST

## 🧪 H2 Database Console

You can access the H2 in-memory database console from your browser.

**URL:**

```z
http://localhost:8080/h2-console
```

### 🔐 Login Settings

Make sure to change the JDBC URL to match the one defined in your application properties.

**JDBC URL:**

```
jdbc:h2:mem:testdb
```

**Username:**

```
Ganaa
```

**Password:**

```
1234
```

Click **Connect** after entering the credentials.

---

## 🐳 Docker Container Build & Run

Build and start the containers using Docker Compose:

```
docker compose up -d --build
```

Docker compose container down

```
docker compose down
```

---

## 🐘 PostgreSQL Configuration

Environment variables for PostgreSQL:

```
POSTGRES_USERNAME=postgres
POSTGRES_PASSWORD=1234
```

Url for PostgreSQL admin:

```
http://localhost:5050
```
