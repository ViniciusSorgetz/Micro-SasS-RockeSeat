import { auth } from "@/lib/auth";
import getOrCreateCustomer from "@/lib/server/stripe/get-customer-id";
import stripe from "@/lib/stripe";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { testId } = await req.json();

  const price = process.env.STRIPE_SUBSCRIPTION_PRICE_ID;

  if (!price) {
    return NextResponse.json({ error: "Price not found" }, { status: 500 });
  }

  const session = await auth();
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  if (!userId || !userEmail) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Necessário criar um cliente na stripe para ter uma referência dele quando for criar o portal
  // Isso também significa armazenar o stripeCustomerId no banco de dados do usuário

  const customerId = await getOrCreateCustomer(userId, userEmail);

  const metadata = {
    testId,
  };

  try {
    // função para gerar uma sessão de pagamento na Stripe
    // adicionado o mode: "subscription" para definir o modo como assinatura
    const session = await stripe.checkout.sessions.create({
      line_items: [{ price, quantity: 1 }],
      mode: "subscription",
      payment_method_types: ["card"],
      success_url: `${req.headers.get("origin")}/success`,
      cancel_url: `${req.headers.get("origin")}/`,
      metadata,
      customer: customerId,
    });

    if (!session) {
      throw new Error("Error in creating stripe session");
    }

    return NextResponse.json({ sessionId: session.id }, { status: 200 });
  } catch (error) {
    console.log(error);
    return NextResponse.error();
  }
}
