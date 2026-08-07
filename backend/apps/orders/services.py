"""Service helpers for the orders app.

Encapsulates business rules that must be reused by both the order
serializer and the order viewset, keeping the validation logic out of
either layer.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Iterable

from apps.products.models import Product, ProductStock


@dataclass(frozen=True)
class UnavailableProduct:
    """Describes a single product that cannot be ordered at a branch."""

    product_id: int
    product_name: str
    reason: str  # "not_offered" | "out_of_stock"


def get_unavailable_products(
    branch_id: int, items: Iterable[dict]
) -> list[UnavailableProduct]:
    """Return products that cannot be ordered at the given branch.

    A product is unavailable when:
    - It has no ``ProductStock(branch_id, product_id)`` row at all
      (``not_offered``).
    - It has a ``ProductStock`` row for the branch but the row's
      ``stock`` is ``OUT_OF_STOCK`` (``out_of_stock``).

    A product whose stock is ``NOT_TRACKED`` is considered available
    because the branch does not gate the order on inventory.
    """
    product_ids: list[int] = []
    for item in items:
        item_id = item.get("item_id")
        if item_id is None:
            continue
        product_ids.append(int(item_id))

    if not product_ids:
        return []

    stocks = ProductStock.objects.filter(
        branch_id=branch_id, product_id__in=product_ids
    )
    stock_by_product = {stock.product_id: stock for stock in stocks}

    name_by_id = {
        p.pk: p.name
        for p in Product.objects.filter(pk__in=product_ids).only("pk", "name")
    }

    unavailable: list[UnavailableProduct] = []
    for pid in product_ids:
        stock = stock_by_product.get(pid)
        if stock is None:
            unavailable.append(
                UnavailableProduct(
                    product_id=pid,
                    product_name=name_by_id.get(pid, f"Producto #{pid}"),
                    reason="not_offered",
                )
            )
            continue
        if stock.stock == ProductStock.StockState.OUT_OF_STOCK:
            unavailable.append(
                UnavailableProduct(
                    product_id=pid,
                    product_name=name_by_id.get(pid, f"Producto #{pid}"),
                    reason="out_of_stock",
                )
            )
    return unavailable
