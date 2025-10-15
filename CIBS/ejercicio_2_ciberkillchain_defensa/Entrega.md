Ejercicio CiberKillChain - Defensa

# Alumno
Marco Scasserra

# Enunciado

Desarrollar la defensa en función del ataque planteado en orden inverso, mencionar una medida de detección y una de mitigación, sólo lo más importante, considerar recursos limitados. No es una respuesta a un incidente, hay que detectar el ataque independientemente de la etapa.
Resolución

# Resolucion

## Action on objectives
**Deteccion**: Implementación de una correlación entre el evento físico y el digital
- Sensores de apertura y de estado redundantes que reporten por canal independiente como puede ser una alarma sonora o lumínica.
- Detección por parte de la central de estos sensores redundantes.
- Alertas ante discrepancias de estados de dispositivos

**Mitigacion**: Sistema de verificación con cámara
- Uso de una cámara física para la detección visual del estado del candado
- Se puede implementar IA para la detección automática del estado

# Installation
**Detección de dispositivos desconocidos en proximidad**
- Escaneo activo del espectro RF cada un periodo de tiempo
- Descubre e identifica dispositivos en el rango
- Compara con whitelist interna
- Alerta de dispositivos anomalos

**Autenticación mutua en capa de enlace**
- Pairing criptografico durante instalacion
- Candados y centrales intercambian certificados en modo físico
- Payloads con firma digital
- Central alerta en caso de payloads anomalos
- Re pairing requiere acceso físico al candado y al gateway

# Exploitation
**Validacion de timestamp**
- Mensajes con timestamp incluido
- Central rechaza y alerta en caso de timestamp con un delta mayor a x segundos y/o menores al último mensaje de ese id
- Ventana corta para aumentar la dificultad de un replay attack

**Numero de sequencia**
- Contador de mensajes enviados por el candado
- Central mantiene la secuencia de este contados
- Rechazo y alerta en caso de mensajes anómalos
- Contador de hasta 32 o 64 bits garantiza que solo en el repairing del dispositivo se van a volver a repetir

**Cifrado AES-128**
- Se incluye cifrado AES-128 durante la transmisión del mensaje
- El intercambio de claves se hace conectando físicamente el candado a la central durante el pairing

# Delivery

**Detección en espectro RF**
- Detectar señales RF anómalas en el rango de trabajo (para detección de SDR)
- Rotación de candados para hacer que el ID se vuelva aleatorio.
- Detección de zonas y horarios de accionamiento de candados
- Zonas de exclusion RF con respectiva señalizacion
- Detecta también jamming para evitar ataques por interferencia

**Deteccion fisica**
- Sistema de vigilancia mediante cámaras
- Detectores de manipulación física en candados, centrales y antenas
- Patrullaje aleatorizado en el perímetro de los candados

# Weaponization
**Monitoreo de intentos de captura**
- Se lleva un log de todos los dispositivos que realicen el pairing con la central
- Se generan alertas en caso de que aparezcan dispositivos desconocidos
- Indica un ataque a la infraestructura
- Ventana de comunicación limitadas (por ejemplo al minuto exacto 10:00, 10:01, 10:02) para detectar dispositivos anómalos

# Reconnaissance

**Detección de dispositivos de logeo**
- Transmisiones periódicas que no sean de la comunicación de nuestro sistema para provocar respuestas y datos incorrectos en sniffers
- Incluir vulnerabilidades aparentes para provocar un ataque incorrecto

**Detección física mediante reconocimiento**
- CCTV con IA para detección de actitudes sospechosas: Vehículos no identificados estacionados cerca de las puertas, antenas o equipos no declarados
