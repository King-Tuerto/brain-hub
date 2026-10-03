# Brain Hub — Empieza aquí

*Prefer English?* → **[START-HERE.md](START-HERE.md)**

**Tiempo: unos 15 minutos.** Puedes hacer todos los pasos desde tu teléfono.

Al terminar tendrás tu propio Brain Hub: una app personal con herramientas de
IA para clases, búsqueda de empleo e investigación. Tu primer trabajo con él
será un análisis estratégico, con fuentes, de una empresa real.

> **La app está en inglés.** En esta guía, los nombres de botones y mensajes
> van **tal como aparecen en pantalla**, con su significado entre paréntesis
> la primera vez.

---

## Lee esto primero

**¿Te atoras? Pregúntale a tu IA, no a la persona que te mandó esto.**

Abre Claude, ChatGPT o Gemini. Pega esta guía completa y describe exactamente
lo que ves en tu pantalla. Por ejemplo:

- *"Estoy en el paso 3 y no veo la opción Pages. Aquí va una captura."*
- *"¿Qué significa 'fork'? ¿Es seguro?"*
- *"El hub dice 'Could not reach that brain'. ¿Qué hago?"*

No hay preguntas tontas, y preguntar no puede romper nada.

---

## Lo que necesitas

- **Una cuenta gratuita de GitHub.** Regístrate en
  [github.com](https://github.com) si no tienes una.
- **Una app de IA que ya uses:** Claude, ChatGPT o Gemini. La versión gratis
  funciona.
- **Opcional: un Open Brain.** Si construiste uno con
  [Open Brain Express](https://github.com/King-Tuerto/open-brain-express),
  el hub puede usar tus notas y guardar tu trabajo en él. Sin uno, todo
  funciona igual; simplemente descargas los resultados.

**No** necesitas instalar ni pagar nada.

---

## Paso 1 — Haz tu propia copia (2 minutos)

1. Entra a tu cuenta de GitHub.
2. Abre **[github.com/King-Tuerto/brain-hub](https://github.com/King-Tuerto/brain-hub)**.
3. Toca **Fork** (bifurcar, es decir, copiar), y luego **Create fork**.
   Deja el nombre `brain-hub`.

Ahora tienes tu propia copia en `github.com/TU-USUARIO/brain-hub`. Es tuya:
ahí van tus herramientas, y por ahí recibes las actualizaciones (Paso 6).

> En el teléfono, si no ves **Fork**, abre el menú del navegador y elige
> **Sitio de escritorio** (o **Desktop site**).

---

## Paso 2 — Activa tu sitio web (2 minutos)

1. En **tu copia**, toca **Settings** (configuración) y luego **Pages**.
   Pages está en el menú de la izquierda; en el teléfono, baja hasta verlo.
2. En **Build and deployment**, pon **Source** en **Deploy from a branch**.
3. Pon **Branch** en **main** y la carpeta en **/ (root)**, y toca **Save**.
4. Espera uno o dos minutos y vuelve a cargar la página. Aparece un recuadro:
   *"Your site is live at…"* (tu sitio ya está publicado en…).

La dirección de tu hub es:

**`https://TU-USUARIO.github.io/brain-hub/`**

Anótala. Esa es tu app.

---

## Paso 3 — Ponla en tu teléfono (1 minuto)

Abre la dirección de tu hub en el teléfono.

- **iPhone (Safari):** toca el botón **Compartir** y luego **Agregar a
  inicio**.
- **Android (Chrome):** toca el menú **⋮** y luego **Instalar app** (o
  **Agregar a la pantalla principal**).

De aquí en adelante, abre Brain Hub desde su ícono.

> **iPhone:** la app de la pantalla de inicio guarda su propia configuración,
> separada de Safari. Haz el Paso 4 **dentro de esa app**, no en Safari.

---

## Paso 4 — Configúrala (3 minutos)

El hub te pregunta tres cosas, una pantalla a la vez.

1. **Tu nombre.** Solo es para el saludo.
2. **Tu brain (cerebro).**
   - **¿No tienes Open Brain?** Toca **Skip — I don't have a brain yet**
     (omitir, todavía no tengo cerebro).
   - **¿Tienes uno?** Escribe su dirección (`https://….supabase.co`), su
     llave **pública** (empieza con `sb_publishable_` o `eyJ`), y el correo y
     la contraseña con los que entras a tu cerebro.
     - Primero el hub revisa que tu cerebro esté cerrado solo para ti. Si
       dice que tu cerebro está **open** (abierto), sigue su enlace para
       actualizarlo antes de continuar.
     - **Nunca pegues tu llave secreta** (empieza con `sb_secret_`).
3. **Cómo correr las herramientas.** Elige **Manual (copy and paste)**
   (copiar y pegar) y escoge la app de IA que usas.
   - **Manual es gratis:** usa la app de IA que ya tienes, incluida su
     búsqueda en la web.
   - **Automatic** necesita una llave de OpenRouter y es opcional; puedes
     cambiar después en **Settings**.

Toca **Finish** (terminar). Verás tu pantalla de inicio con tus herramientas.

> **Tus llaves y tu contraseña se quedan en tu teléfono.** Nunca se guardan en
> GitHub, y tu contraseña no se guarda en ningún lado.

---

## Paso 5 — Tu primer análisis de empresa (5–10 minutos)

1. En la pantalla de inicio, toca **Company Analysis** (análisis de empresa).
2. Llena:
   - **Company** (empresa): una empresa real que te interese, con su símbolo
     bursátil si tiene, p. ej. *Costco Wholesale (NASDAQ: COST)*.
   - **Business unit for the environmental scan** (unidad de negocio para el
     análisis del entorno): déjalo vacío, o escribe una.
   - **What is this for?** (¿para qué es?): elige una opción.
3. Toca **Run** (ejecutar). El hub escribe un prompt detallado por ti.
4. Toca **Copy prompt** (copiar prompt) y luego **Open Claude** (o tu app).
5. En tu app de IA, **pega** y envía. La respuesta tarda uno o dos minutos,
   porque busca en la web.
6. Cuando termine, **copia la respuesta completa**. Casi todas las apps
   tienen un botón de copiar debajo de la respuesta.
7. Regresa a Brain Hub. Toca **Paste answer** (pegar respuesta), o mantén
   presionado en el recuadro y elige **Pegar**. Luego toca **Use this
   answer** (usar esta respuesta).

Verás el análisis y, debajo de su título, una **revisión de fuentes**. Cada
dato debe tener un enlace. Si alguno no lo tiene, el hub te los muestra para
que sepas cuáles revisar.

**¿Quieres estar seguro?** Toca **Check this answer** (revisar esta
respuesta).
1. El hub escribe un segundo prompt que le pide a tu IA abrir cada enlace y
   confirmar que dice lo que afirma el análisis.
2. Cópialo, pégalo en tu app de IA y pega la respuesta de vuelta.
3. Recibes una calificación sobre 100 y una lista de correcciones concretas.

**Para guardarlo:**
- **Save to brain** (guardar en el cerebro, si conectaste uno): guarda un
  resumen corto que puedes buscar después, con el reporte completo adjunto.
  La próxima vez que analices la misma empresa, el hub encuentra tu trabajo
  anterior.
- **Download** (descargar) guarda el reporte como archivo.

**Listo. Hiciste un análisis de empresa con fuentes.**

---

## Paso 6 — Recibir actualizaciones

Cuando salgan herramientas o correcciones nuevas, tu copia puede ponerse al
día:

1. Abre tu copia en GitHub.
2. Toca **Sync fork** (sincronizar) y luego **Update branch** (actualizar).

Tu sitio se actualiza solo un minuto después.

**Nunca edites la carpeta `core/`.** Eso es lo que mantiene las
actualizaciones sin conflictos.

---

## Crea tus propias herramientas

¿Quieres una herramienta para otra cosa, como un plan de estudio,
preparación para networking o comentarios sobre un ensayo?

1. Abre tu app de IA y pega
   **[WIDGET-GUIDE.md](WIDGET-GUIDE.md)** de tu copia.
2. Pide la herramienta que quieres. Puedes pedirlo en español.
3. Pega lo que te dé en Brain Hub → **Add a tool** (agregar herramienta). El
   hub te muestra exactamente qué puede hacer la herramienta antes de
   instalarla.
4. Para tenerla en todos tus dispositivos, guarda el archivo en la carpeta
   `plugins/` de tu copia en GitHub. El hub la encuentra ahí solo.

---

## Si algo sale mal

| Lo que ves | Qué hacer |
|---|---|
| La dirección de tu sitio muestra "404" | Espera dos minutos más después del Paso 2. Revisa que Pages esté en **main** y **/ (root)**. |
| "Could not reach that brain" | Revisa que la dirección empiece con `https://` y termine en `.supabase.co`. |
| "This brain is open" | Tu cerebro necesita primero su actualización de seguridad. Sigue el enlace que muestra el hub. |
| "Your brain session ended" | Toca **Sign in again** (volver a entrar). |
| "Paste answer" no hace nada | Mantén presionado en el recuadro de la respuesta y elige **Pegar**. |
| Muchos datos "have no source" (sin fuente) | Pídele a tu IA *"agrega un enlace de fuente a cada dato, o márcalo [unverified]"* y pega la respuesta nueva. |
| Cualquier otra cosa | Pega esta guía en tu IA, describe tu pantalla y pregunta. |
