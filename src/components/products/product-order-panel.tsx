"use client";

import { useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { createOrder } from "@/actions/orders";
import { calculateEstimatedOrderTotal } from "@/application/orders/calculate-order-estimate";
import { toMoney } from "@/lib/format";
import type { ProductListItem } from "@/lib/data";

type ProductOrderPanelProps = {
  initialIdempotencyKey: string;
  products: ProductListItem[];
};

type Quantities = Record<string, number>;

type SubmitOrderButtonProps = {
  disabled: boolean;
  submitted: boolean;
};

function SubmitOrderButton({ disabled, submitted }: SubmitOrderButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = disabled || pending || submitted;

  return (
    <button
      className="h-11 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      disabled={isDisabled}
      type="submit"
    >
      {pending || submitted ? "Enviando pedido..." : "Solicitar pedido"}
    </button>
  );
}

function normalizeQuantity(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.floor(value));
}

export function ProductOrderPanel({
  initialIdempotencyKey,
  products,
}: ProductOrderPanelProps) {
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [quantities, setQuantities] = useState<Quantities>({});

  const selectedItems = useMemo(
    () =>
      Object.entries(quantities)
        .filter(([, quantity]) => quantity > 0)
        .map(([product_id, quantity]) => ({
          product_id,
          quantity,
        })),
    [quantities],
  );

  const estimatedTotal = calculateEstimatedOrderTotal(products, selectedItems);
  const productsById = useMemo(
    () => new Map(products.map((product) => [product.id, product])),
    [products],
  );
  const stockIssues = selectedItems
    .map((item) => {
      const product = productsById.get(item.product_id);

      if (!product || item.quantity <= product.stock_qty) {
        return null;
      }

      return {
        available: product.stock_qty,
        name: product.name,
        quantity: item.quantity,
      };
    })
    .filter((item) => item !== null);

  function setQuantity(productId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: normalizeQuantity(value),
    }));
  }

  return (
    <form
      action={createOrder}
      className="mt-6"
      onSubmit={() => setHasSubmitted(true)}
    >
      <input
        name="idempotency_key"
        type="hidden"
        value={initialIdempotencyKey}
      />
      <input name="items" type="hidden" value={JSON.stringify(selectedItems)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const quantity = quantities[product.id] ?? 0;
          const unitPrice = product.promo_price ?? product.base_price;
          const hasStockIssue = quantity > product.stock_qty;
          const controlsDisabled = hasSubmitted;

          return (
            <article
              className={`rounded-lg border bg-white p-5 shadow-sm ${
                hasStockIssue ? "border-red-300" : "border-slate-200"
              }`}
              key={product.id}
            >
              <p className="text-xs font-medium uppercase text-slate-400">
                {product.sku}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-950">
                {product.name}
              </h2>
              <div className="mt-4">
                <p className="text-sm text-slate-500">Precio</p>
                <p className="text-2xl font-semibold text-slate-950">
                  {toMoney(unitPrice)}
                </p>
                {product.promo_price ? (
                  <p className="text-sm text-slate-500 line-through">
                    {toMoney(product.base_price)}
                  </p>
                ) : null}
              </div>
              <p className="mt-4 text-sm text-slate-600">
                Stock: {product.stock_qty} unidades
              </p>
              {product.discount_rules.length ? (
                <p className="mt-2 text-xs font-medium text-emerald-700">
                  Descuento desde {product.discount_rules[0].min_qty} unidades
                </p>
              ) : null}

              <div className="mt-5 grid grid-cols-[40px_1fr_40px] items-center gap-2">
                <button
                  className="h-10 rounded-md border border-slate-300 text-lg font-semibold text-slate-700"
                  disabled={controlsDisabled || quantity === 0}
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  type="button"
                >
                  -
                </button>
                <input
                  className={`h-10 rounded-md border px-2 text-center text-sm outline-none ${
                    hasStockIssue
                      ? "border-red-400 bg-red-50 text-red-700"
                      : "border-slate-300"
                  }`}
                  disabled={controlsDisabled}
                  max={product.stock_qty}
                  min={0}
                  onChange={(event) =>
                    setQuantity(product.id, Number(event.target.value))
                  }
                  type="number"
                  value={quantity}
                />
                <button
                  className="h-10 rounded-md border border-slate-300 text-lg font-semibold text-slate-700"
                  disabled={controlsDisabled || quantity >= product.stock_qty}
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
              {hasStockIssue ? (
                <p className="mt-2 text-xs font-medium text-red-600">
                  Solo hay {product.stock_qty} unidades disponibles.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>

      <div className="sticky bottom-0 mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-lg">
        <label className="block">
          <span className="text-sm font-medium text-slate-700">Notas</span>
          <textarea
            className="mt-2 min-h-20 w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-emerald-600"
            name="notes"
            placeholder="Entrega, horario o comentario del pedido"
          />
        </label>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-slate-500">Total estimado</p>
            <p className="text-2xl font-semibold text-slate-950">
              {toMoney(estimatedTotal)}
            </p>
            {stockIssues.length ? (
              <p className="mt-1 text-sm font-medium text-red-600">
                Corrige el stock de {stockIssues[0].name}: solicitado{" "}
                {stockIssues[0].quantity}, disponible {stockIssues[0].available}.
              </p>
            ) : null}
          </div>
          <SubmitOrderButton
            disabled={
              selectedItems.length === 0 ||
              stockIssues.length > 0 ||
              !initialIdempotencyKey
            }
            submitted={hasSubmitted}
          />
        </div>
      </div>
    </form>
  );
}
