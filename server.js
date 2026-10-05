require("dotenv").config();
const express = require("express");
const path = require("path");
const Stripe = require("stripe");

const app = express();
const PORT = process.env.PORT || 4242;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "sk_test_placeholder");

const products = [
  { id:"p1", name:"Pokémon — Stellar Crown Booster Box", game:"Pokémon", price:12999, tag:"EM DESTAQUE", image:"https://m.media-amazon.com/images/I/81qYG3wAxgL._AC_SL1500_.jpg", desc:"Display selado com 36 boosters." },
  { id:"p2", name:"One Piece — Wings of the Captain", game:"One Piece", price:10999, tag:"NOVO", image:"https://i5.walmartimages.com/seo/One-Piece-Trading-Card-Game-Wings-of-the-Captain-Booster-Display-Box-OP-06-24-Packs_d7449af2-6f6c-496f-b72c-fc7f061ac423.62830b67871287ed6b45403eee86d262.jpeg", desc:"Display selado com 24 boosters." },
  { id:"p3", name:"Magic — Booster Box", game:"Magic", price:4999, tag:"COLEÇÃO", image:"https://www.smokeandmirrorshobby.com/cdn/shop/products/1671053406029_700x700.jpg?v=1671053429", desc:"Produto selado para jogadores e colecionadores." },
  { id:"p4", name:"Dragon Ball Super — Booster Display", game:"Dragon Ball", price:8499, tag:"NOVO", image:"https://images.unsplash.com/photo-1659480141041-c41defa79a71?auto=format&fit=crop&q=80&w=1200", desc:"Display TCG para a tua coleção." },
  { id:"p5", name:"Lorcana — Into the Inklands", game:"Lorcana", price:5999, tag:"LIMITADO", image:"https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=1200", desc:"Produto selado para colecionadores." },
  { id:"p6", name:"Ultimate Guard — Sidewinder 100+", game:"Acessórios", price:2399, tag:"ESSENCIAL", image:"https://images.unsplash.com/photo-1587145820266-a5951ee6f620?auto=format&fit=crop&q=80&w=1200", desc:"Deck box premium para 100+ cartas." }
];

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (_, res) => res.json(products));

app.post("/api/create-checkout-session", express.json(), async (req, res) => {
  try {
    if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY.includes("placeholder")) {
      return res.status(503).json({error:"Stripe ainda não está configurado. Adiciona STRIPE_SECRET_KEY ao .env."});
    }
    const items = Array.isArray(req.body.items) ? req.body.items : [];
    const line_items = items.map(i => {
      const p = products.find(x => x.id === i.id);
      const qty = Math.max(1, Math.min(20, Number(i.qty) || 1));
      if (!p) throw new Error("Produto inválido");
      return {
        quantity: qty,
        price_data: {
          currency: "eur",
          unit_amount: p.price,
          product_data: { name: p.name, description: p.desc }
        }
      };
    });
    if (!line_items.length) return res.status(400).json({error:"Carrinho vazio."});

    const base = process.env.BASE_URL || `http://localhost:${PORT}`;
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items,
      payment_method_types: ["card", "mb_way", "multibanco"],
      shipping_address_collection: {allowed_countries: ["PT", "ES"]},
      billing_address_collection: "required",
      allow_promotion_codes: true,
      customer_creation: "always",
      success_url: `${base}/success.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${base}/?checkout=cancelled`
    });
    res.json({url: session.url});
  } catch (e) {
    res.status(400).json({error:e.message || "Não foi possível criar o checkout."});
  }
});

app.post("/api/stripe-webhook", express.raw({type:"application/json"}), (req,res) => {
  const sig = req.headers["stripe-signature"];
  try {
    const event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      console.log("ENCOMENDA PAGA:", session.id, session.amount_total, session.currency);
      // Aqui podes ligar a base de dados, emails, stock e sistema de expedição.
    }
    res.json({received:true});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

app.get("*", (_, res) => res.sendFile(path.join(__dirname, "public", "index.html")));
app.listen(PORT, () => console.log(`Nexora TCG em http://localhost:${PORT}`));