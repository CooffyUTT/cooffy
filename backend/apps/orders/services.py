"""Service helpers for the orders app.

Encapsulates business rules that must be reused by both the order
serializer and the order viewset, keeping the validation logic out of
either layer.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import timedelta
from typing import Iterable

from django.utils import timezone

from apps.products.models import Product, ProductStock


PRE_ORDER_KITCHEN_LEAD_MINUTES = 30


def pre_order_release_cutoff(now=None):
    """Instant after which a pre-order joins the kitchen queue (RN-29).

    Pre-orders whose ``scheduled_pickup_at`` is later than this cutoff are
    still planned and must not appear in the ``pending`` kitchen queue.
    """
    now = now if now is not None else timezone.now()
    return now + timedelta(minutes=PRE_ORDER_KITCHEN_LEAD_MINUTES)


@dataclass(frozen=True)
class UnavailableProduct:
    """Describes a single product that cannot be ordered at a branch."""

    product_id: int
    product_name: str
    reason: str  # "not_offered" | "out_of_stock"
    message: str


def get_unavailable_products(
    branch_id: int, items: Iterable[dict]
) -> list[UnavailableProduct]:
    """Return products that cannot be ordered at the given branch.

    Distinguishes two mutually exclusive reasons (RN-24):

    - ``not_offered``: there is no ``ProductStock(branch_id, product_id)``
      row for the branch, so the product does not belong to that branch
      even though it may exist or have stock in another branch.
    - ``out_of_stock``: the product does belong to the branch (it has a
      ``ProductStock`` row) but its ``stock`` is ``OUT_OF_STOCK``.

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
        product_name = name_by_id.get(pid, f"Producto #{pid}")
        stock = stock_by_product.get(pid)
        if stock is None:
            # No ProductStock row for this branch: the product is not
            # offered here (RN-24), regardless of its stock elsewhere.
            unavailable.append(
                UnavailableProduct(
                    product_id=pid,
                    product_name=product_name,
                    reason="not_offered",
                    message=(
                        f"El producto '{product_name}' no pertenece a esta "
                        "sucursal o no está disponible en ella."
                    ),
                )
            )
            continue
        if stock.stock == ProductStock.StockState.OUT_OF_STOCK:
            # The product belongs to the branch but is sold out there.
            unavailable.append(
                UnavailableProduct(
                    product_id=pid,
                    product_name=product_name,
                    reason="out_of_stock",
                    message=(
                        f"El producto '{product_name}' está agotado en esta "
                        "sucursal."
                    ),
                )
            )
    return unavailable
