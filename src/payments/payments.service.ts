import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {

  private readonly stripe = new Stripe(
    envs.stripeSecret
  )

  async createPaymentSession(paymentSessionDto: PaymentSessionDto){

    const { currency, items, orderId } = paymentSessionDto;               // Se recibe el contenido del dto con los items a comprar

    const lineItems = items.map((item) => {                               // Formato en el que trabaja stripe
      return {
        price_data: {
          currency: currency,
            product_data: {
              name: item.name
          },
          unit_amount: Math.round(item.price * 100),  
        },
        quantity: item.quantity
      }
    })
    
    const session = await this.stripe.checkout.sessions.create({          // Construcción de la session con la instancia de stripe -> Pago -> stripe comunica el pago vía webhook
    
      payment_intent_data: {
        metadata: {
          orderId: orderId
        }
      },

      line_items: lineItems,

      mode: 'payment',
      success_url: envs.stripeSuccessUrl,
      cancel_url: envs.stripeCancelUrl,

    });

    return session;
  }


  async stripeWebhook(req:Request, res:Response) {                        // Stripe comunica via webhook como fue el pago

    const sig = req.headers['stripe-signature'];                          // Se obtiene la firma de Stripe desde los headers
    
    let event: Stripe.Event;
    
    const endpointSecret = envs.stripeEndpointSecret

    try {
      event = this.stripe.webhooks.constructEvent(req['rawBody'], sig, endpointSecret); // Se construye el evento de la comunicación 
    } catch (error) {
      res.status(400).send(`Webhook Error: ${error.message}`);
      return;
    }

    console.log({event});
    switch(event.type){                                                   // Si el event
      case 'charge.succeeded':                                            // fue 'cargo realizado'
        // TODO: llamar nuestro microservicio
        const chargeSucceeded = event.data.object;
        console.log({                                                     // Mostramos la respuesta
          metadata: chargeSucceeded.metadata ,
          orderId: chargeSucceeded.metadata.orderId
        });
      break;

      default:
        console.log(`Event ${event.type} not handled`)
    }

    return res.status(200).json({sig})
  }
}
