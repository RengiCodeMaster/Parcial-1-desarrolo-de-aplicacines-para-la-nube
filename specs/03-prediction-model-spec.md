# Especificación 03: Modelo Matemático Predictivo y Estimación de Afluencia

## 1. Fundamentación Teórica y Capacidad de Carga Turística (CCT)
De acuerdo con las directrices de la Organización Mundial del Turismo (OMT) y la metodología de Cifuentes (1992) aplicada por el SERNANP en Áreas Naturales del Perú, la **Capacidad de Carga Física (CCF)** y **Efectiva (CCE)** de un atractivo natural acuático delimitado se rige por su superficie disponible:

- **Superficie de la Poza Principal de Jacintillo:** ~700 m² de espejo de agua utilizable ($\approx 30\text{ m}$ de diámetro).
- **Espacio personal normativo en recreación acuática:** $3.5\text{ m}^2$ por persona.
- **Aforo Simultáneo Instantáneo Máximo:** $\frac{700}{3.5} \approx 200\text{ bañistas al mismo tiempo}$.
- **Rotación diaria estimada:** 4 a 6 recambios por jornada (horario 08:00 a 17:00).
- **Capacidad de Carga Máxima Diaria Teórica:** $\approx 800 - 1,200\text{ visitantes/día}$.

---

## 2. Formulación Matemática de la Afluencia Diaria ($V$)

El número total proyectado de visitantes para una fecha $d$ se formula como una función multifactorial:

$$V(d) = \text{round}\Big( V_{\text{base}} \times F_{\text{cal}}(d) \times F_{\text{temp}}(T) \times F_{\text{precip}}(P, \text{prob}) \times F_{\text{temp\_est}}(d) \times (1 + \epsilon) \Big)$$

Donde:

### 2.1 Visitantes Base ($V_{\text{base}}$)
- Constante calibrada para un día laborable ordinario (martes/miércoles) con clima templado neutro: **$V_{\text{base}} = 140\text{ personas}$**.

### 2.2 Factor Calendario ($F_{\text{cal}}$)
| Tipo de Día | Días de la Semana / Fechas | Multiplicador | Justificación |
| :--- | :--- | :---: | :--- |
| **Laborable Ordinario** | Lunes a Jueves | `1.00` | Flujo turístico basal y residentes locales. |
| **Víspera / Fin de Semana Parcial** | Viernes | `1.30` | Llegada de excursionistas de Huánuco, Pucallpa y Lima. |
| **Fin de Semana Regular** | Sábado | `2.20` | Alta actividad recreacional familiar. |
| **Día Pico de Fin de Semana** | Domingo | `2.60` | Día tradicional de visita campestre y baños termales. |
| **Feriados Nacionales Peruanos** | Semana Santa, Fiestas Patrias (28-29 Julio), Año Nuevo | `3.80` | Éxodo turístico masivo regional y nacional hacia Tingo María. |
| **Festividad Regional Mayor** | **Fiesta de San Juan (24 de Junio)** | `5.00` | Tradición amazónica obligatoria de baño purificador en ríos y pozas naturales. |

### 2.3 Factor Temperatura ($F_{\text{temp}}$)
La temperatura máxima diaria $T_{\text{max}}$ en grados Celsius influye en el deseo de refrescarse en la piscina natural:
- $T_{\text{max}} < 22^\circ\text{C}$: `0.65` (Sensación de frío, baja atracción acuática)
- $22^\circ\text{C} \le T_{\text{max}} < 26^\circ\text{C}$: `0.95` (Templado, concurrencia regular)
- $26^\circ\text{C} \le T_{\text{max}} < 31^\circ\text{C}$: `1.30` (Clima tropical cálido ideal para baño en pozas)
- $T_{\text{max}} \ge 31^\circ\text{C}$: `1.50` (Bochorno intenso en selva, alta necesidad de inmersión)

### 2.4 Factor Precipitación y Lluvia ($F_{\text{precip}}$)
El volumen acumulado de lluvia $P$ (en milímetros) y la probabilidad de precipitación reducen la movilidad y accesibilidad:
- $P = 0\text{ mm}$ y $\text{prob} \le 15\%$: `1.20` (Día soleado despejado garantizado)
- $0 < P \le 2\text{ mm}$ (Llovizna leve): `1.00` (No detiene a los bañistas)
- $2 < P \le 10\text{ mm}$ (Lluvia moderada): `0.50` (Caminos resbaladizos, turistas prefieren actividades techadas)
- $P > 10\text{ mm}$ o Tormenta eléctrica: `0.15` (Riesgo de crecida del arroyo y turbidez del agua, desaconsejado)

### 2.5 Factor Estacional Selva ($F_{\text{temp\_est}}$)
- **Temporada Seca (Mayo a Octubre):** `1.15` (Menor caudal de ríos, aguas más cristalinas y vías expeditas).
- **Temporada Lluviosa (Noviembre a Abril):** `0.85` (Período de mayor descarga pluvial en la cuenca del Huallaga).

### 2.6 Ruido Estocástico ($\epsilon$)
- Variación aleatoria controlada $\epsilon \sim \text{Uniforme}(-0.05, +0.05)$ simulando fluctuaciones menores del comportamiento humano no determinista.

---

## 3. Matriz de Categorización y Umbrales de Aforo

| Proyección ($V$) | Porcentaje de Capacidad | Nivel de Afluencia | Código de Color | Indicador Visual | Recomendación Operativa |
| :---: | :---: | :---: | :---: | :---: | :--- |
| **$< 150$** | $< 18\%$ | **Baja** | `#10B981` (Verde Esmeralda) | 🟢 Tranquilo | Ideal para relajación, fotografía y personas de la tercera edad. |
| **$150 - 449$** | $18\% - 55\%$ | **Moderada** | `#0EA5E9` (Azul Turquesa) | 🔵 Moderado | Flujo balanceado, buen espacio en orillas y vestuarios. |
| **$450 - 799$** | $56\% - 95\%$ | **Alta** | `#F59E0B` (Ámbar) | 🟡 Concurrido | Llegar antes de las 10:30 AM para evitar congestión de transporte. |
| **$\ge 800$** | $> 95\%$ | **Saturado** | `#EF4444` (Rojo Carmesí) | 🔴 Al Límite | Aforo cercano a la capacidad de carga máxima. Alta densidad en agua. |

---

## 4. Intervalo de Confianza Estadístico
Todo cálculo debe exponer un intervalo de confianza al $90\%$:
$$\text{IC} = [\text{round}(V \times 0.92), \text{round}(V \times 1.08)]$$
