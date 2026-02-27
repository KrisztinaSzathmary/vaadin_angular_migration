# State – Vaadin-zu-Angular-Migration

---

## Iteration 3 – REST-API: Produkte schreiben

**Status:** Abgeschlossen
**Datum:** 2026-02-27

### Umgesetzte Änderungen

- `rest/dto/ProductDTO.java` – Bean Validation Annotationen (`@NotBlank`, `@Size`, `@NotNull`, `@Min`) + `toEntity(Collection<Category>)` Methode für Rückkonvertierung
- `rest/dto/AvailabilityDTO.java` – `toEntity()` Methode für Rückkonvertierung zu `Availability`
- `rest/ProductResource.java` – Erweitert um drei schreibende Endpunkte:
  - `POST /api/v1/products` → 201 Created + `ProductDTO` (nur Admin)
  - `PUT /api/v1/products/{id}` → 200 OK + `ProductDTO` (nur Admin)
  - `DELETE /api/v1/products/{id}` → 204 No Content (nur Admin)
- `rest/ProductResourceTest.java` – Erweitert auf 21 Tests (17 neue Tests für CRUD + Auth + Validierung)

### Entscheidungen

- **Programmatische Bean Validation** mit `@Inject Validator` statt `@Valid` auf Methodenparameter – ermöglicht konsistente JSON-Fehlerantworten
- **`requireAdmin()` Helper-Methode** – prüft `isUserSignedIn()` (401) und `isUserInRole("admin")` (403), wiederverwendbar für alle schreibenden Endpunkte
- **Kategorie-Auflösung per ID** – `toEntity()` mappt `CategoryDTO`-IDs gegen `dataService.getAllCategories()`, unbekannte IDs werden ignoriert
- **`ParameterMessageInterpolator`** in Tests statt EL-Dependency – Hibernate Validator benötigt Expression Language, die im Test-Classpath fehlt
- **Keine neuen Dateien** – nur bestehende DTOs und `ProductResource` erweitert

### Verifikation

- `mvn clean install` – BUILD SUCCESS, 39 Tests (21 ProductResource + 13 Auth + 2 ProductDTO + 3 CORS), 0 Fehler
- Manuelle curl-Tests ausstehend (WildFly-Deployment durch Reviewer)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 4 – REST-API: Kategorien (siehe `backlog.md`)

---

## Iteration 2 – REST-API: Authentifizierung

**Status:** Abgeschlossen
**Datum:** 2026-02-27

### Umgesetzte Änderungen

- `rest/dto/LoginRequestDTO.java` – POJO mit `username`, `password`, No-Arg/All-Args-Konstruktor
- `rest/dto/LoginResponseDTO.java` – POJO mit `username`, `role`, No-Arg/All-Args-Konstruktor
- `rest/dto/UserInfoDTO.java` – POJO mit `username`, `role`, No-Arg/All-Args-Konstruktor (semantisch getrennt von `LoginResponseDTO`)
- `rest/AuthResource.java` – `@Path("auth")`, `@RequestScoped`, drei Endpunkte:
  - `POST /api/v1/auth/login` → `LoginResponseDTO` (200) oder JSON-Fehler (400/401)
  - `POST /api/v1/auth/logout` → 204 No Content (idempotent)
  - `GET /api/v1/auth/me` → `UserInfoDTO` (200) oder JSON-Fehler (401)
- `rest/AuthResourceTest.java` – 13 Unit-Tests (JUnit 5 + Mockito)

### Entscheidungen

- **Session-Invalidierung direkt über `HttpServletRequest`** statt `AccessControl.signOut()` – `signOut()` greift auf `VaadinSession` zu, die in JAX-RS-Kontext nicht verfügbar ist
- **`request.changeSessionId()`** nach Login – Session-Fixation-Schutz
- **`request.getSession(false)` bei Logout** – keine neue Session anlegen, wenn keine existiert
- **Field Injection** für `AccessControl`, `@Context` für `HttpServletRequest` – konsistent mit `ProductResource`-Pattern
- **Keine Änderungen an CORS-Filter** – POST, GET, Credentials und Content-Type bereits unterstützt
- **Keine POM-Änderungen** – alle Test-Dependencies (JUnit 5, Mockito 5) bereits vorhanden

### Verifikation

- `mvn clean install` – BUILD SUCCESS, 22 Tests (13 neu + 9 bestehend), 0 Fehler
- **curl-Tests** (alle bestanden, Kontext-Pfad: `/bookstore-starter-flow-ui-1.1-SNAPSHOT/`):
  - `POST /api/v1/auth/login` mit `user1/user1` → 200, `{"username":"user1","role":"user"}`
  - `POST /api/v1/auth/login` mit falschen Credentials → 401, `{"error":"Invalid username or password"}`
  - `GET /api/v1/auth/me` mit Cookie → 200, `{"username":"user1","role":"user"}`
  - `GET /api/v1/auth/me` ohne Cookie → 401, `{"error":"Not authenticated"}`
  - `POST /api/v1/auth/logout` mit Cookie → 204 No Content
  - `GET /api/v1/auth/me` nach Logout → 401 (Session ungültig)
  - `POST /api/v1/auth/login` mit `admin/admin` → 200, `{"username":"admin","role":"admin"}`
  - `GET /api/v1/auth/me` als Admin → 200, `{"username":"admin","role":"admin"}`
  - Vaadin-UI → 200 OK (keine Regression)

### Offene Punkte

- Keine

### Nächste Iteration

- Iteration 3 – siehe `backlog.md`

---

## Iteration 1 – REST-API: Grundgerüst und Produkte lesen

**Status:** Abgeschlossen
**Datum:** 2026-02-26

### Umgesetzte Änderungen

- `rest/dto/AvailabilityDTO.java` – Enum mit `COMING`, `AVAILABLE`, `DISCONTINUED` + `fromEntity()` Factory
- `rest/dto/CategoryDTO.java` – POJO mit `id`, `name`, No-Arg/All-Args-Konstruktor, `fromEntity()` Factory
- `rest/dto/ProductDTO.java` – POJO mit allen Produkt-Feldern, `fromEntity()` Factory (konvertiert `Set<Category>` → `List<CategoryDTO>`, null-safe)
- `rest/BookstoreRestApplication.java` – `@ApplicationPath("/api/v1")` aktiviert JAX-RS
- `rest/CorsFilter.java` – `@Provider`, `ContainerRequestFilter` + `ContainerResponseFilter` für `http://localhost:4200`
- `rest/ProductResource.java` – `@Path("products")`, `@RequestScoped`, zwei Endpunkte:
  - `GET /api/v1/products` → `List<ProductDTO>` (200 OK)
  - `GET /api/v1/products/{id}` → `ProductDTO` (200 OK) oder JSON-Fehler (404)

### Entscheidungen

- **Basispfad `/api/v1`** statt `/api` (backlog.md) – `stack.rules.md` ist gemäß `CLAUDE.md` maßgeblich
- **JAX-RS `@Provider` CORS-Filter** statt Servlet-Filter – gilt nur für REST-Endpunkte, interferiert nicht mit Vaadin Servlet
- **`@RequestScoped`** für `ProductResource` – erforderlich wegen `bean-discovery-mode="annotated"` in `beans.xml`
- **Field Injection** statt Constructor Injection in `ProductResource` – RESTEasy benötigt No-Arg-Konstruktor für POJO-Instanziierung
- **JDK 17** für WildFly 27 – JDK 25 inkompatibel (Security Manager entfernt in JDK 24)

### Verifikation

- `mvn clean install` – BUILD SUCCESS
- **curl-Tests** (alle bestanden, Kontext-Pfad: `/bookstore-starter-flow-ui-1.1-SNAPSHOT/`):
  - `GET /api/v1/products` → 200 OK, 100 Produkte als JSON-Array
  - `GET /api/v1/products/1` → 200 OK, einzelnes Produkt-JSON
  - `GET /api/v1/products/99999` → 404, `{"error": "Product with id 99999 not found"}`
  - CORS-Headers bei `Origin: http://localhost:4200` → alle Header korrekt gesetzt
  - CORS Preflight (OPTIONS) → 200 OK mit allen CORS-Headers
  - Vaadin-UI → 200 OK (keine Regression)

### Offene Punkte

- **Kontext-Pfad:** WAR wird unter `/bookstore-starter-flow-ui-1.1-SNAPSHOT/` deployt. Angular-Proxy muss diesen Pfad berücksichtigen oder WildFly-Deployment auf Root `/` konfiguriert werden.

### Nächste Iteration

- Iteration 2 – REST-API: Authentifizierung (siehe `backlog.md`)
