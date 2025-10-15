# Alumno
Marco Scasserra

# Sistema víctima
Sistema diseñado para el monitoreo en tiempo real de candados inteligentes en depósitos fiscales.

# Objetivo
- Inhibir las alertas de apertura para poder abrir el candado sin que se detecte.
- Reportar datos falsos a la central de monitoreo (ej. el candado nunca se abrió).
- Dejar inutilizados los dispositivos fiscales en competencia.
- Usar los dispositivos como puerta de entrada a la red central de monitoreo de aduanas/transporte.
# Resolución

# Reconnaissance
En un primer análisis podemos ver que los candados de cada depósito reportan periódicamente a una central ubicada en cada oficina de los objetivos.
Estos candados se comunican de manera inalámbrica con la misma para reportar el estado de los mismos y la central utiliza un medio cableado a internet para reportar al centro de control.
1. Candados -> Antena: Protocolo MiWi (inalambrico)
2. Antena -> Central: Protocolo CAN (cableado)
3. Central -> Centro de control: HTTP sobre Internet

## T1592 Gather Victim Host Information 

### .001 Hardware
- Los candados se comunican utilizando protocolo MiWi a una antena conectada a la central.
- A su vez esta antena se comunica mediante protocolo CAN con la central en sí.
- La central se comunica con el centro de control por Internet mediante un endpoint expuesto en el servidor.

### .002 Software
- La central se encuentra corriendo un Linux con el servicio SSH en el puerto por default.

### .003 Firmware
- La comunicación MiWi transporta el ID identificador del candado, el estado de la cerradura y el estado de la batería interna. Esto no está cifrado ni tiene un indicador histórico de vulneraciones.
- La comunicación CAN transporta el ID del candado, el estado de la cerradura y la batería apenas es recibido por la antena. No tiene ningún cifrado.
- La central se comunica usando HTTP y enviando un JSON sin cifrar.

# Weaponization
Basado en las vulnerabilidades encontradas se preparan diferentes posibles herramientas para explotarlas. Voy a centrarme en el Vector 1 para la realisacion y los vectore 2 y 3 quedan de referencia como vias alternativas
## Vector 1
Permite inyectar datos falsos directamente en los estados de los candados percibidos por al central. Esto no requiere acceso fisico al bus CAN ni a la central
Herramientas: SDR y modulo computacional
Pasos:
- Preparacion de escucha pasiva para comprender tramas y formatos, modelando mensajes correctos que la central acepte utilizando un SDR. Se identifican campos criticos como lo son el ID, estado y nivel de bateria y las validaciones si es que pasee
- Diseñar componente que pueda generar y transmitir estos mensajes validados respetando tiempos y secunciencia para evitar la deteccion de anomalias.
- Evitar la transmision de datos legitimos de los candados seleccionados a vulnerar para evitar colisiones y asegurando que el unico mensaje procesado por la central con ese ID sea el nuestro. Centrandose en un candado a vulnerar a la vez
- Mantener control de una telemetria coherente y evitar alarmas

## Vector 2
Bus CAN sin autenticación y cifrado
Hardware: Interfaz CAN
Pasos:
1. Captura de mensajes CAN
2. Extracción de datos
3. Generar e inyectar datos falsos
4. 4. Evitar la transmisión de datos del dispositivo

## Vector 3
Central corriendo Linux con SSH
Herramientas: Scripts para acceso al SSH.
Se va a probar intentando un ataque de fuerza bruta utilizando diccionarios desde especificos (Bases de datos locales de credenciales filtradas) hasta mas genéricos (Bases de datos de credenciales de dispositivos IoT).
Una vez dentro de la central podemos utilizar WireShark para identificar los paquetes con los datos necesarios y con un script interceptor HTTP podemos modificarlos.

# Delivery y Exploitation
El delivery se pueden plantear dos casos, uno en el cual se pueda tener acceso a la red interna y otro en la cual no

## Sin acceso a la red interna
Priorizando el vector 1, acciono sobre el canal inalambrico MiWi para el delivery y exploitation.
Se interfiere y/o suplanta exclusivamente el candado a vulnerar en el canal inalambrico.
Este ataque seria un T1557.002 - Man-in-the-Middle: ARP Cache Poisoning y un T0831 - Manipulation of Control pero adaptado a redes RF.

## Acceso a red interna CAN
Este ataque seria un T1110 - Brute Force adaptado a un CANBus.
Identificado el punto de acceso físico al cableado CAN procedemos a conectar nuestro dispositivo del Vector 2 para poder inyectar datos falsos.

## Acceso a la red interna de Internet
Este ataque sería un T1110.001 - Password Guessing (SSH) y una vez logrado acceso pasaría a ser T1557.001 - Man-in-the-Middle: LLMNR/NBT-NS Poisoning.
En el caso de no tener acceso al cableado CAN, pero si acceso a la red donde se encuentra la central podemos utilizar el Vector 3 para obtener acceso.

# Installation
## Persistencia del componente MiWi
El Vector 1 al ser un SDR controlado por un dispositivo que puede ser una computadora puede agregarse capacidades remotas para poder ser controlado y que pueda capturar y cambiar los datos que retransmite para poder hacerse pasar por diferentes candados.
Pasos:
- Instalar el dispositivo SDR junto con su control remoto en una ubicacion oculta cerca de las puertas a vulnerar.
- El dispositivo capta y emula las señales de los candados a emular mediante ejeccucion remota de comandos.
- Usa tecnologia 4G o GPRS para poder se controlado remotamente, saltenado la necesidad de conexion fisica a una red.
## Persistencia del componente CAN
El Vector 2 al ser una interfaz CAN controlado por un dispositivo que puede ser una computadora puede agregarse capacidades remotas para poder ser controlado y que pueda capturar y cambiar los datos que inyecta al BUS
## Persistencia del acceso SSH
Se pueden agregar credenciales públicas del atacante junto con un reverse shell para que se pueda tener acceso constante al dispositivo sin importar cambios de credenciales

# Command & Control

Una vez colocado el dispositivo el mismo puede ser controlado remotamente.
Para esto se implementa que este tenga comunicacion por LTE para realizar un SSH al mismo. Esto habilitaria el uso de comandos como: \
- Captura de paquetes
- Inyeccion de paquetes en el espectro de RF
- Inicio y parada de un ataque de replay de paquetes

Este metodo nos aisla de la red interna de la zona evitando posibles detecciones de paquetes sospechosos

# Actions on Objetives

## Objetivo 1: Inhibir alertas de apertura
Resultado: La central no recibe notificaciones de apertura por ende, nunca las transmite.
## Objetivo 2: Reportar datos falsos continuos
Resultado: El centro de control recibe datos fabricados
## Objetivo 4: Puerta de entrada a la red Interna
Resultado: Se logró que un dispositivo infectado este en la infraestructura de los depósitos fiscales


