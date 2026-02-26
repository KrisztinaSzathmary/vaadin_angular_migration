# State – Vaadin-zu-Angular-Migration

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
