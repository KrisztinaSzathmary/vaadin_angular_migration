---
name: provision
description: Einmaliges Maschinen-Setup für den Migration Harness — stellt JVM-Voraussetzungen (JDK 17 + Maven, Vaadin-Quelle) und Node-Voraussetzungen (Angular-22-taugliche Node/npm, Angular-Ziel) in einem Durchlauf sicher. Bündelt die beiden Provisioner-Helfer unter einem Aufruf. Kein Teil der Migrations-Loop — einmaliger Setup-Helfer.
---

# Provision — Toolchain-Setup-Helfer (einmalig)

Bündelt die beiden Maschinen-Setup-Helfer des Harness unter **einem** Aufruf. Das
ist **kein** Schritt der Migrations-Loop und nicht Teil von `/migrate-project` —
es ist der einmalige Setup, der die Voraussetzungen herstellt, bevor irgendetwas
gebaut, gestartet oder migriert wird.

## Aufruf

```
/provision          # beide Gates: JVM (Quelle) + Node (Ziel)
/provision jvm      # nur JDK 17 + Maven  (entspricht sdkman-provisioner)
/provision node     # nur Node/npm        (entspricht nvm-provisioner)
```

Die beiden Agents bleiben weiterhin einzeln aufrufbar — `/provision` ist nur die
bequeme Klammer, die sie nacheinander startet.

## Ablauf

Ohne Argument: starte **beide** Agents nacheinander (Reihenfolge unten). Mit
`jvm`/`node`: nur den jeweiligen.

### 1. JVM-Voraussetzungen — Agent `sdkman-provisioner`

Stellt **JDK 17 + Maven** über SDKMAN sicher, damit die Vaadin-Quelle
(`bookstore-starter-flow-*`) gebaut und per WildFly gestartet werden kann.
Voraussetzung für `/ui-plan` (braucht die laufende Alt-App).

### 2. Node-Voraussetzungen — Agent `nvm-provisioner`

Stellt eine **Angular-22-taugliche Node-/npm-Version** über NVM sicher, damit alle
`ng`-Befehle in `bookstore-angular/` laufen. Erst zur ersten `/translate` zwingend
nötig — wird hier mit erledigt, damit kein Setup-Bruch mitten in der Loop kommt.

JVM zuerst, Node danach: die Quelle (UI-Plan) wird vor dem Ziel (Translate)
gebraucht.

## Regeln (gelten für beide Agents)

- **Kein `sudo`/root selbst** — sobald Superuser nötig ist, führt der Agent den
  Nutzer an, die Befehle selbst auszuführen (im Prompt mit `! ` davor). SDKMAN/NVM
  sind genau dafür da, systemweite Installation zu vermeiden.
- **Idempotent** — erfüllt die vorhandene Umgebung den Soll, wird nichts neu
  installiert, nur gemeldet.
- Reine Voraussetzungs-Helfer: sie **bauen/starten die App nicht**, legen das
  Angular-Projekt **nicht** an und führen keine `ng`-Befehle aus.

## Ausgabe

Pro Agent ein Kurzbericht (Ist → Aktionen → verifizierter Soll). Am Ende ein
Gesamt-Fazit: ist die Maschine bereit für `/ui-plan` (JVM ✓) und später für
`/migrate`/`/translate` (Node ✓)? Offene Punkte (z. B. „neue Shell öffnen") klar
benennen.
