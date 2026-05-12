#!/usr/bin/env bash
# Smoke test for POST /api/score.
#
# Sends three Spanish texts of varying length (≈65, ≈165 and ≈340 words) plus
# one deliberately-too-short text to exercise the 400 path. Prints the HTTP
# status and the pretty-printed JSON response for each.
#
# Usage:
#   ./scripts/test-score.sh                # talks to http://localhost:3000
#   PORT=3001 ./scripts/test-score.sh      # if your dev server is on 3001
#
# Requires: a running dev server (`npm run dev`) and python3. Each non-rejected
# request makes a real Anthropic API call (claude-sonnet-4-6), so it costs a
# little money — that is the point of an end-to-end check.
set -euo pipefail

BASE="http://localhost:${PORT:-3000}"
TMP="$(mktemp)"
trap 'rm -f "$TMP"' EXIT

post () {
  local label="$1" text="$2"
  local words
  words="$(printf '%s' "$text" | wc -w | tr -d ' ')"
  echo
  echo "──────────────────────────────────────────────────────────────"
  echo "▶ ${label}  (~${words} palabras)  →  ${BASE}/api/score"
  echo "──────────────────────────────────────────────────────────────"
  python3 -c 'import sys, json; print(json.dumps({"text": sys.argv[1]}))' "$text" \
    | curl -sS -o "$TMP" -w 'HTTP %{http_code}\n' \
        -X POST "${BASE}/api/score" \
        -H 'Content-Type: application/json' \
        --data @-
  python3 -m json.tool < "$TMP" 2>/dev/null || cat "$TMP"
}

T_SHORT='Este texto es deliberadamente muy corto, solo para comprobar que el endpoint rechaza con un 400 cualquier texto que esté por debajo del mínimo de cincuenta palabras.'

T1='Nuestra fundación lleva más de quince años entregando apoyo a familias en situación de pobreza. Cada mes repartimos despensas, ropa y útiles escolares a quienes más lo necesitan en las colonias del oriente de la ciudad. Gracias a la generosidad de nuestros donantes hemos podido crecer año con año, y confiamos en seguir ayudando a muchas más personas que dependen de nuestra labor para salir adelante.'

T2='Cuando empezamos a trabajar con los colectivos juveniles de la zona, llegamos con un plan cerrado y un cronograma de talleres ya definido. No funcionó. Los propios jóvenes nos dijeron que ese formato no respondía a lo que ellos veían todos los días en sus barrios, y tuvimos que rehacer buena parte del proyecto desde cero. Hoy son ellos quienes definen las prioridades: hay chicas de dieciséis años coordinando las mesas de prevención de violencia de su colonia, no porque nosotros las hayamos capacitado, sino porque sus propias comunidades decidieron que ese espacio necesitaba su mirada. Mi rol cambió por completo. Ya no llego con respuestas; llego a escuchar y a conectar a organizaciones vecinales que antes ni siquiera se hablaban entre sí. Sigo aprendiendo a soltar el control, y con frecuencia mi lectura del problema resulta incompleta frente a la de quienes lo viven en carne propia. Eso ha sido lo más difícil de este trabajo, y también lo más valioso.'

T3='Cuando hablamos de transformar la educación pública casi siempre terminamos hablando del salón de clases: la formación de los docentes, los materiales, la pedagogía. Pero las reglas que definen qué cuenta como aprendizaje válido en este país no viven en el aula. Viven en los marcos de evaluación nacionales, en los criterios con los que se asigna el financiamiento a las escuelas, en las decisiones de las autoridades educativas sobre qué se mide y qué no aparece en ningún reporte. Mientras esas reglas no se rediseñen, todo lo que intentamos hacer dentro del aula empuja contra una arquitectura que premia exactamente lo contrario de lo que buscamos. En la red en la que trabajo colaboramos con escuelas que están experimentando con métricas de bienestar y de agencia juvenil, indicadores que el sistema oficial todavía no reconoce. Una de las maestras lo dice mejor que yo: no es que estemos midiendo cosas distintas, es que estamos cuestionando que esas otras cosas sean lo medible. Y al mismo tiempo hay un grupo de adolescentes que está ayudándonos a diseñar cómo se vería un instrumento de evaluación que tomara en serio su propia lectura de qué les está pasando como estudiantes. No son destinatarios del proyecto: son coautores. Cuando arrancamos no teníamos claro si esto era pedagogía, política pública o investigación sobre medición. La respuesta honesta es que es las tres cosas a la vez, y que esa interdependencia no la podemos resolver eligiendo una sola. Lo que sí podemos hacer es trabajar simultáneamente en los tres frentes —el cultural, el de gobernanza y el de las métricas— y aceptar que algunas tensiones no se cierran, se sostienen. Hemos aprendido a no apurar las conclusiones. Cada vez que una escuela cambia su forma de evaluar aparecen efectos de segundo orden que no habíamos previsto, y parte del trabajo es quedarnos con esa complejidad en lugar de simplificarla para que quepa en una diapositiva.'

post "Texto demasiado corto (se espera HTTP 400)" "$T_SHORT"
post "Texto 1 — corto pero válido"               "$T1"
post "Texto 2 — longitud media"                   "$T2"
post "Texto 3 — largo"                             "$T3"

echo
echo "Listo."
