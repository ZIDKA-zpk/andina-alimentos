"use client";

import { useMemo, useState } from "react";

import { createOrder } from "@/actions/orders";
import { toMoney } from "@/lib/format";
import type { ProductListItem } from "@/lib/data";

type ProductOrderPanelProps = {
  products: ProductListItem[];
};

type Quantities = Record<string, number>;

export function ProductOrderPanel({ products }: ProductOrderPanelProps) {
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

  const estimatedTotal = selectedItems.reduce((total, item) => {
    const product = products.find((candidate) => candidate.id === item.product_id);
    const unitPrice = product?.promo_price ?? product?.base_price ?? 0;
    const discount =
      product?.discount_rules
        .filter((rule) => rule.active && rule.min_qty <= item.quantity)
        .sort((a, b) => b.discount_percent - a.discount_percent)[0]
        ?.discount_percent ?? 0;

    return total + item.quantity * unitPrice * (1 - discount / 100);
  }, 0);

  function setQuantity(productId: string, value: number) {
    setQuantities((current) => ({
      ...current,
      [productId]: Math.max(0, value),
    }));
  }

  return (
    <form action={createOrder} className="mt-6">
      <input name="items" type="hidden" value={JSON.stringify(selectedItems)} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const quantity = quantities[product.id] ?? 0;
          const unitPrice = product.promo_price ?? product.base_price;

          return (
            <article
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
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
                  onClick={() => setQuantity(product.id, quantity - 1)}
                  type="button"
                >
                  -
                </button>
                <input
                  className="h-10 rounded-md border border-slate-300 px-2 text-center text-sm"
                  min={0}
                  onChange={(event) =>
                    setQuantity(product.id, Number(event.target.value))
                  }
                  type="number"
                  value={quantity}
                />
                <button
                  className="h-10 rounded-md border border-slate-300 text-lg font-semibold text-slate-700"
                  onClick={() => setQuantity(product.id, quantity + 1)}
                  type="button"
                >
                  +
                </button>
              </div>
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
          </div>
          <button
            className="h-11 rounded-md bg-emerald-700 px-5 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={selectedItems.length === 0}
            type="submit"
          >
            Crear pedido
          </button>
        </div>
      </div>
    </form>
  );
}
