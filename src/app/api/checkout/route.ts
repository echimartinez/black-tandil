import { Preference } from "mercadopago";
import client from "../../../lib/mercadopago";
import dbConnect from "../../../lib/mongodb";
import Order from "../../../model/Order";
import { CartItem } from "@/types";
 
function validateCartItems(items: CartItem[]): CartItem[] {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("El carrito está vacío.");
  }
 
  return items.map((item, index) => {
    const { product, size, quantity } = item;
 
    if (!product?.name || typeof product.name !== "string" || product.name.trim().length === 0) {
      throw new Error(`Producto ${index + 1}: nombre inválido.`);
    }
    if (product.name.trim().length > 200) {
      throw new Error(`Producto ${index + 1}: nombre demasiado largo.`);
    }
 
    const parsedPrice = Number(product.price);
    if (isNaN(parsedPrice) || parsedPrice <= 0 || parsedPrice > 10_000_000) {
      throw new Error(`Producto ${index + 1}: precio inválido.`);
    }
 
    const parsedQty = Number(quantity);
    if (!Number.isInteger(parsedQty) || parsedQty < 1 || parsedQty > 99) {
      throw new Error(`Producto ${index + 1}: cantidad inválida.`);
    }
 
    if (!size || typeof size !== "string" || size.trim().length === 0) {
      throw new Error(`Producto ${index + 1}: talle inválido.`);
    }
 
    return {
      product: { ...product, name: product.name.trim(), price: parsedPrice },
      size: size.trim(),
      quantity: parsedQty,
    };
  });
}
 
export async function POST(req: Request) {
  try {
    await dbConnect();
 
    const rawBody = await req.json();
    const { items } = rawBody;
 
    let validatedItems: CartItem[];
    try {
      validatedItems = validateCartItems(items);
    } catch (validationError: any) {
      return new Response(
        JSON.stringify({ error: validationError.message }),
        { status: 400 }
      );
    }
 
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;
    if (!baseUrl) throw new Error("NEXT_PUBLIC_BASE_URL no está configurada.");
 
    const pedidoId = `pago_${Date.now()}`;
    const totalAmount = validatedItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity, 0
    );
 
    // Guardar orden con todos los items
    await Order.create({
      external_reference: pedidoId,
      title: validatedItems.map(i => `${i.product.name} (${i.size})`).join(", "),
      amount: totalAmount,
      status: "pending",
    });
 
    const preference = new Preference(client);
    const response = await preference.create({
      body: {
        items: validatedItems.map((item) => ({
          id: String(item.product.id),
          title: `${item.product.name} - Talle ${item.size}`,
          unit_price: item.product.price,
          quantity: item.quantity,
          currency_id: "ARS",
        })),
        notification_url: `${baseUrl}/api/webhook`,
        external_reference: pedidoId,
        back_urls: {
          success: `${baseUrl}/success`,
          failure: `${baseUrl}/cart`,
          pending: `${baseUrl}/cart`,
        },
        auto_return: "approved",
      },
    });
 
    console.log("✅ Preferencia creada:", response.init_point);
 
    return new Response(
      JSON.stringify({ init_point: response.init_point }),
      { status: 200 }
    );
 
  } catch (error: any) {
    console.error("❌ Error en Checkout:", error.message);
    return new Response(
      JSON.stringify({ error: "Error interno del servidor." }),
      { status: 500 }
    );
  }
}

