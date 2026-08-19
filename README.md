# Prototipo V0.1 - Gestion del Desempeno USFQ

Prototipo funcional sin backend para validar experiencia, navegacion, reglas visibles y pantallas antes del desarrollo por TI.

## Como abrirlo

Opcion 1: abrir `index.html` directamente en Chrome o Edge.

Opcion 2 (recomendada): iniciar un servidor local desde esta carpeta:

```bash
python -m http.server 8080
```

Luego abrir `http://localhost:8080`.

## Publicarlo en GitHub Pages

1. Crear un repositorio, por ejemplo `gestion-desempeno-usfq`.
2. Copiar `index.html`, `styles.css`, `app.js` y este `README.md` en la raiz del repositorio.
3. Hacer commit y push.
4. En GitHub: Settings > Pages.
5. En Source seleccionar `Deploy from a branch`.
6. Elegir la rama `main` y la carpeta `/ (root)`.
7. Guardar. GitHub mostrara la URL publica del prototipo.

## Alcance de V0.1

- Dashboard del ciclo y barra visual de avance.
- Cambio de rol para simular Colaborador, Jefe, RRHH y Comite de Talento.
- Perfil de cargo y funciones.
- Objetivos/KPIs con meta, linea base, indicador y avance.
- Registro conceptual de sesiones/check-ins.
- Autoevaluacion interactiva con rubrica, evidencia y borrador local.
- Vista de equipo para el jefe.
- Matriz de evaluaciones y excepciones de estructura para RRHH.
- Configuracion basica de ponderaciones.
- Vista consolidada y registro de plan de accion del Comite de Talento.

## Notas

- Los datos son ficticios.
- `localStorage` se usa solo para simular persistencia de KPIs y respuestas.
- No existe autenticacion, API ni base de datos en esta version.
- El objetivo es validar comportamiento y experiencia antes de la implementacion productiva.
