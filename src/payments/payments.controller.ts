import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { MessagePattern, Payload } from '@nestjs/microservices';


@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  //@Post('create-payment-session')                     // Aquí se envía el bodyRaw a stripe con los items que queremos comprar
  @MessagePattern('create.payment.session')             // Cuando se conecta con order-ms esta es la etiqueta que se usa
  createPaymentSession(
    @Payload() paymentSessionDto: PaymentSessionDto
  ){
    return this.paymentsService.createPaymentSession(paymentSessionDto) 
  }

  @Get('success')
  success(){
    return {
      ok: true,
      message: 'Payment successful'
    }
  }
    
  @Get('cancelled')
  cancel(){
    return {
      ok: false,
      message: 'Payment cancelled'
    }
  }
    
   @Post('webhook')
   async stripeWebhook(@Req() req:Request, @Res() res:Response){ // Cuando Stripe recibe la session nos envía su respuesta a nuestro server con express y Next la recibe con Nextjs/common
    console.log('stripeWebhook llamado');
    return this.paymentsService.stripeWebhook(req, res)
   } 


}
