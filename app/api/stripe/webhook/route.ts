import handleCancelSubscription from "@/lib/server/stripe/handle-cancel";
import handleStripePayment from "@/lib/server/stripe/handle-payment";
import handleAStripeSubscription from "@/lib/server/stripe/handle-subscription";
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

const secret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");

    if (!signature || !secret) {
      return NextResponse.json(
        { error: "Signature or Secret is not set" },
        { status: 400 }
      );
    }

    const event = stripe.webhooks.constructEvent(body, signature, secret);

    switch (event.type) {
      case "checkout.session.completed": // Pagamento realizado se status = paid
        const metadata = event.data.object.metadata;

        if (metadata?.price == process.env.STRIPE_PRODUCT_PRICE_ID) {
          await handleStripePayment(event);
        }
        if (metadata?.price == process.env.STRIPE_SUBSCRIPTION_PRICE_ID) {
          await handleAStripeSubscription(event);
        }

        break;
      case "checkout.session.expired": // Espirou tempo de pagamento
        console.log("Enviar e-mail falando que o pagamento expirou");
        break;
      case "checkout.session.async_payment_succeeded": // Boleto pago
        console.log("Enviar e-mail falando que o pagamento foi realizado");
        break;
      case "checkout.session.async_payment_failed": // Boleto falhou
        console.log("Enviar e-mail falando que o pagamento falhou");
        break;
      case "customer.subscription.created": // Criou a assinatura
        console.log("Enviar e-mail falando uma mensagem de boas vindas");
        break;
      case "customer.subscription.updated": // Atualizou a assinatura
        console.log("Enviar e-mail falando que algo mudou na assinatura");
        break;
      case "customer.subscription.deleted": // Cancelou a assinatura
        await handleCancelSubscription(event);
        break;
    }

    return NextResponse.json({
      message: "Webhook ativado com sucesso.",
    });
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      {
        error: "Internal Server Error",
      },
      {
        status: 500,
      }
    );
  }
}
