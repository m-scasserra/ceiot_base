# Alumno
Marco Scasserra

# Sistema víctima
Sistema diseñado para el monitoreo en tiempo real de candados inteligentes en depositos fiscales.

# Objetivo
- Inhibir las alertas de apertura para poder abrir el candado sin que se detecte.
- Reportar datos falsos a la central de monitoreo (ej. el candado nunca se abrió).
- Dejar inutilizados los dispositivos fiscales en competencia.
- Usar los dispositivos como puerta de entrada a la red central de monitoreo de aduanas/transporte.
# Resolución

## Reconnaissance
En un primer analisis podemos ver que los candados de cada deposito reportan periodicamente a una central ubicada en cada oficina de los objetivos.
Estos candados se comunican de manera inalambrica con la misma para reportar el estado de los mismos y la central utiliza un medio cableado a internet para reportar al centro de control.
1. Candados -> Antena: Protocolo MiWi (inalambrico)
2. Antena -> Central: Protocolo CAN (cableado)
3. Central -> Centro de control: HTTP sobre Internet

# T1592 Gather Victim Host Information 

# .001 Hardware
- Los candados se comunican utilizando protocolo MiWi a una antena conectada a la central.
- A su vez esta antena se comunica mediante protocolo CAN con la central en si.
- La central se comunica con el centro de control por Internet mediante un endpoint expuesto en el servidor.

# .002 Software
- La central se encuentra corriendo un Linux con el servicio SSH en el puerto por default.

# .003 Firmware
- La comunicacion MiWi transporta el ID identificador del candado, el estado de la cerradura y el estado de la bateria interna. Esto no esta cifrado ni tiene un indicador historico de vulneraciones.
- La comunicacion CAN transporta el ID del candado, el estado de la cerradura y la bateria apenas es recibido por la antena. No tiene ningun cifrado.
- La central se comunica usando HTTP y enviando un JSON sin cifrar.

## Weaponization
Basado en las vulnerabilidades encontradas se preparan diferentes posibles herramientas para explotarlas
# Vector 1
Protocolo MiWi sin cifrado ni autenticacion
Herramientas: SDR
Pasos:
1. Captura de tramas MiWi en tiempo real
2. Extraccion de datos (ID, estado y bateria)
3. Generar e inyectar datos falsos
4. Evitar la transmision de datos del dispositivo

# Vector 2
Bus CAN sin autenticacion ni cifrado
Hardware: Interfaz CAN
Pasos:
1. Captura de mensajes CAN
2. Extraccion de datos
3. Generar e inyectar datos falsos
4. 4. Evitar la transmision de datos del dispositivo

# Vector 3
Central corriendo Linux con SSH
Herramientas: Scripts para acceso al SSH.
Se va a probar intentando un ataque de fuerza bruta utilizando diccionarios desde especificos (Bases de datos locales de credenciales filtradas) hasta mas genericos (Bases de datos de credenciales de dispoositivos IoT).
Una vez dentro de la central podemos utilizar WireShark para identificar los paquetes con los datos necesarios y con un script interceptor HTTP podemos modificarlos.

## Delivery y Exploitation
El delivery se pueden plantear dos casos, uno en el cual se pueda tener acceso a la red interna y otro en la cual no

# Sin acceso a la red interna
Este ataque seria un T1557.002 - Man-in-the-Middle: ARP Cache Poisoning pero adaptado a redes RF.
Podemos utilizar el dispositivo descripto en el Vector 1 para poder suplantar las transmisiciones del candado.

# Acceso a red interna CAN
Este ataque seria un T1110 - Brute Force adaptado a un CANBus.
Identificado el punto de acceso fisico al cableado CAN procedemos a conectar nuestro dispositivo del Vector 2 para poder inyectar datos falsos.

# Acceso a la red interna de Internet
Este ataque seria un T1110.001 - Password Guessing (SSH) y una vez logrado acceso pasaria a ser T1557.001 - Man-in-the-Middle: LLMNR/NBT-NS Poisoning.
En el caso de no tener acceso al cableado CAN, pero si acceso a la red donde se encuentra la central podemos utilizar el Vector 3 para obtener acceso.

## Installation
# Persistencia del componente MiWi
El Vector 1 al ser un SDR controlado por un dipositivo que puede ser una computadora puede agregarse capacidades remotas para poder ser controlado y que pueda capturar y cambiar los datos que retransmite para poder hacerse pasar por diferentes candados
# Persistencia del componente CAN
El Vector 2 al ser una interfaz CAN controlado por un dipositivo que puede ser una computadora puede agregarse capacidades remotas para poder ser controlado y que pueda capturar y cambiar los datos que inyecta al BUS
# Persistencia del acceso SSH
Se pueden agregar credenciales publicas del atacante junto con un reverse shell para que se pueda tener acceso constante al dispositivo sin importar cambios de credenciales

## Command & Control

## Actions on Objetives

# Objetivo 1: Inhibir alertas de apertura
Resultado: La central no recibe notificaciones de apertura por ende, nunca las transmite.
# Objetivo 2: Reportar datos falsos continuos
Resultado: El centro de control recibe datos fabricados
# Objetivo 4: Puerta de entrada a la red Interna
Resultado: Se logro que un dispositivo infectado este en la infraestructura de los depositos fiscales
