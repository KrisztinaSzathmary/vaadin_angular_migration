# Erkenntnisse aus einer eigenständig durch Claude Opus durchgeführten Vaadin-Angular-Migration

## Erste Schritte der Frontend-Migration

Nach dem Checkout des ursprünglichen Vaadin-Codes habe ich mit dem Claude-Opus eine Kopie des bestehenden Repositories
erstellt. Die Erstellung des neuen Repositories wurde erfolgreich über HTTPS durchgeführt. Mit SSH gab es zunächst
kleinere Probleme, diese wurden jedoch von Claude selbstständig erkannt und behoben.

Anschließend habe ich mit Hilfe von Claude den main-Branch angelegt und die ersten Commits erstellen lassen. Diese
Aufgaben konnte das Modell zuverlässig und ohne manuelle Eingriffe umsetzen.

Zusätzlich habe ich Claude angewiesen, eine MIGRATION.md-Datei zu erstellen. In dieser Datei wurden die bisher
durchgeführten Änderungen dokumentiert. Auf Basis der minimalen Information, dass eine Migration von einer
Vaadin-24-Applikation zu Angular geplant ist, hat Claude eigenständig sinnvolle nächste Schritte vorgeschlagen.

## Weiteres Vorgehen und erste Migrationsergebnisse

Im nächsten Schritt habe ich auf einem neuen Branch, ohne zusätzliche Detailinformationen, darum gebeten, bestehende
Migrationsmuster von Vaadin zu Angular zu analysieren und die Anwendung nach aktuellen Best Practices auf Angular zu
migrieren. Gleichzeitig sollte der gesamte Prozess dokumentiert sowie auftretende Probleme festgehalten werden.

Zunächst wurden von Claude Architektur- und Migrationspläne erstellt. Anschließend wurde die Umsetzung weitgehend
selbstständig durchgeführt. Bereits beim ersten Durchlauf konnte die Angular-Applikation erfolgreich gestartet werden.

Das Ergebnis ist keine perfekte, aber funktionierende Angular-Anwendung, die über eine REST-API mit der bestehenden
Backend-Logik kommuniziert. Es wurden eine Authentifizierung sowie eine Lokalisierung in englischer und finnischer
Sprache implementiert. Die Dokumentation wirkt auf den ersten Blick ausreichend, der Code ist in Komponenten
strukturiert und kommentiert.

## Fazit

Mit einem sehr geringen Zeitaufwand wurde durch Claude Opus ein bemerkenswert gutes Ergebnis erzielt. Für eine
produktionsreife Lösung sind jedoch weitere Verbesserungen notwendig, insbesondere klarere und detailliertere
Spezifikationen sowie feste Regeln, an denen sich Claude bei der weiteren Entwicklung orientieren kann.

----------------------------------------------------------------------------------------------------------------------------------------------

# Bookstore App Starter for Vaadin Flow / Java EE

A project example for a Vaadin application that requires a Servlet 6 container to run. The UI is built mostly with Java
only.

Vaadin 24 supports Servlet 6 and Jakarta EE 10. This demo app demonstrates many use cases with Java EE and CDI such as

- How to use dependency injection and inversion of control
- How to apply model view presenter architecture in Vaadin app using CDI
- How to use Vaadin scopes when beans.xml has bean-discovery-mode="annotated"
- How to use EAR packaging for production
- How to use WAR packaging for development

## Other useful Vaadin tips demoed

These tips are not specific to CDI or JavaEE

- How to build custom app layout when not using AppLayout component
- How to build CRUD view without using Crud component
- How to use Dialog as Offcanvas style modal view
- How to highlight changed fields in the Form
- How to use CustomI18NProvider with multiple supported languages
- How to persist chosen language in a cookie
- How to use localized error messages with JSR-303 and BeanValidationBinder
- How to use bean level validator
- How to implement caching data provider when backend is slow
- How to use warning colors with Button and ConfirmDialog
- How to create responsive design

## Prerequisites

The project can be imported into the IDE of your choice, with Java 17 installed, as a Maven project.

## Project Structure

The project consists of the following three modules:

- parent project: common metadata and configuration
- bookstore-starter-flow-ui: main application module that includes views (war)
- bookstore-starter-flow-my-component: sub module for custom components (jar)
- bookstore-starter-flow-backend: POJO classes and mock services being used in the ui (jar)
- bookstore-starter-flow-it: TestBench test examples (ToDo: update to work)
- bookstore-starter-flow-ear: EAR packaging

## Workflow

### Development version as WAR

To compile the entire project, run "mvn install" in the parent project.

- run `mvn clean wildfly:run -PrunWar` in ui module
- open http://localhost:8080/bookstore-starter-flow-ui-1.1-SNAPSHOT/

### Production version as EAR

To compile the entire project, run "mvn install" in the parent project.

Other basic workflow steps:

- getting started
- compiling the whole project
    - run `mvn clean install -Production` in parent project
- running in production mode
    - edit code in the ui module
    - run `mvn clean install -Pproduction` in ui project
    - run `mvn clean wildfly:run -Pproduction` in ear module
    - open http://localhost:8080/bookstore-starter-flow-ui/
- creating a production mode war
    - run `mvn package -Pproduction` ear module
- running in production mode
    - production mode is used by default

### Branching information:

* `v24` the latest version of the starter, using the latest platform version
