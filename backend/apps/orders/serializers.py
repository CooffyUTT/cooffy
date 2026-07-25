from decimal import Decimal

def serialize_order(order):
    return {
        "id": order.id,
        "order_number": order.order_number,
        "date": str(order.date),
        "branch_id": order.branch_id,
        "client_id": order.client_id,
        "created_at": order.created_at.isoformat() if order.created_at else None,
        "prepared_at": order.prepared_at.isoformat() if order.prepared_at else None,
        "picked_up_at": order.picked_up_at.isoformat() if order.picked_up_at else None,
        "scheduled_pickup_at": order.scheduled_pickup_at.isoformat() if order.scheduled_pickup_at else None,
        "total": str(order.total),
        "state": order.state,
        "payment_method": order.payment_method,
        "payment_status": order.payment_status,
        "comment": order.comment,
        "products": [
            {
                "id": item.id,
                "item_id": item.item_id,
                "quantity": item.quantity,
                "price": str(item.price),
                "excluded_modifiers": item.excluded_modifiers or [],
            }
            for item in order.order_products.all()
        ],
    }