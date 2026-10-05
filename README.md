# Nexora TCG

Loja TCG responsiva com catálogo, carrinho e checkout Stripe.

## Pagamentos
O checkout está preparado para:
- Cartão
- MB WAY
- Referência MULTIBANCO

Para ativar pagamentos reais:
1. Cria uma conta Stripe para a empresa.
2. Copia a chave secreta para `.env` como `STRIPE_SECRET_KEY`.
3. Define `BASE_URL` para o domínio público da loja.
4. Configura o webhook Stripe `POST /api/stripe-webhook` e copia o segredo para `STRIPE_WEBHOOK_SECRET`.
5. Em produção usa HTTPS.

Sem as credenciais Stripe da tua empresa, não é possível ativar cobranças reais de forma legítima. O projeto funciona em modo teste assim que colocares uma chave `sk_test_...`.

## Arrancar
```bash
npm install
cp .env.example .env
npm start
```
Abrir `http://localhost:4242`.

## Nota de marca
Foi escolhido "Nexora TCG" como nome de trabalho. A pesquisa web não encontrou uma loja TCG portuguesa com esse nome, mas isto não substitui pesquisa de marca no INPI/EUIPO, consulta de empresas e confirmação do domínio antes de lançar comercialmente.

## Imagens
A versão de demonstração usa imagens externas para dar aspeto de loja premium. Antes de uma publicação comercial, substitui-as por fotografias/assets que tenhas autorização para utilizar comercialmente, sobretudo imagens de produtos de marcas TCG.
