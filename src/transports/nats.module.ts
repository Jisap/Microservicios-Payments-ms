import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { envs, NATS_SERVICE } from 'src/config';

// Aquí, ClientsModule.register configura un cliente NATS y lo registra con el token NATS_SERVICE.
// Esto significa que cualquier clase que necesite comunicarse con NATS puede solicitar una instancia del cliente NATS
// usando este token.

@Module({
  imports: [
    ClientsModule.register([        // Registra un cliente de microservicio.
      {
        name: NATS_SERVICE,         // Nombre del servicio que será usado como token de inyección de dependencias.
        transport: Transport.NATS,  // Especifica que el transporte usado entre servicios será NATS.
        options: {
          servers: envs.natsServers // se especifican los servidores NATS usando envs.natsServers.
        }
      }
    ])
  ],
  exports: [                        // Exporta la misma configuración que se registró en imports.
    ClientsModule.register([        // Esto permite que otros módulos que importen NatsModule tengan acceso al cliente NATS configurado.
      {
        name: NATS_SERVICE,         
        transport: Transport.NATS,
        options: {
          servers: envs.natsServers
        }
      }
    ])
  ]
})
export class NatsModule {}
