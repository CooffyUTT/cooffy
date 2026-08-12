from datetime import timedelta

from django.db.models import Sum, Count, Avg, F, Min, Max
from django.db.models.functions import ExtractHour, Extract
from django.db.models import (
    ExpressionWrapper,
    DurationField,
)
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from apps.branches.models import Branch
from apps.orders.models import Order, OrderProduct
from apps.products.models import Product

from .permissions import IsManagerOrSupervisor
from .serializers import (
    DailySummarySerializer,
    TopProductsSerializer,
    OrdersByHourSerializer,
    SalesSerializer,
    OperationTimesSerializer,
)

# Contrato RF-04-02: únicamente cuentan los pedidos confirmados. Los pedidos
# pending y rejected se excluyen de todas las métricas (ventas, conteos,
# productos y tiempos) para mantenerlas consistentes entre sí.
CONFIRMED_STATES = [
    Order.State.PREPARING,
    Order.State.READY,
    Order.State.PICKED_UP,
]

# PERIOD_DAYS: cantidad de días calendario que cubre cada periodo. El rango es
# móvil y cerrado (inclusivo de hoy): start = today - (days - 1).
PERIOD_DAYS = {
    'daily': 1,
    'weekly': 7,
    'monthly': 30,
    'four_monthly': 120,
    'semesterly': 180,
}


class AnalyticsViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated, IsManagerOrSupervisor]

    def _get_branch_ids(self):
        """Contrato RF-04-01 (RN-23): sucursales autorizadas por rol.

        - superuser: todas las sucursales activas.
        - supervisor: únicamente su sucursal asignada (user.branch_id).
        - gerente: todas las sucursales activas de sus empresas
          (company__owner=user). Otros roles no llegan aquí (403 en permisos).
        """
        user = self.request.user
        if user.is_superuser:
            return set(
                Branch.objects.filter(active=True).values_list('id', flat=True)
            )
        if user.groups.filter(name='supervisor').exists():
            return {user.branch_id} if user.branch_id else set()
        return set(
            Branch.objects.filter(
                company__owner=user,
                active=True,
            ).values_list('id', flat=True)
        )

    def _resolve_date_range(self):
        period = self.request.query_params.get('period', 'daily')
        # Zona horaria del proyecto (settings.TIME_ZONE); timezone.now()
        # devuelve la hora actual en esa zona y .date() obtiene el día local.
        end_date = timezone.now().date()
        days = PERIOD_DAYS.get(period, 1)
        # Contrato RF-04-03: periodos móviles e inclusivos de hoy (7 días
        # calendario para semanal, 30 mensual, 120 cuatrimestral, 180 semestral).
        start_date = end_date - timedelta(days=days - 1)

        start_param = self.request.query_params.get('start_date')
        end_param = self.request.query_params.get('end_date')
        if start_param:
            start_date = timezone.datetime.strptime(start_param, '%Y-%m-%d').date()
        if end_param:
            end_date = timezone.datetime.strptime(end_param, '%Y-%m-%d').date()

        return period, start_date, end_date

    def _base_order_qs(self, branch_ids, start_date, end_date):
        # Los pedidos rejected y pending no representan ventas confirmadas ni
        # operación completada, por lo que se excluyen del análisis.
        return Order.objects.filter(
            branch_id__in=branch_ids,
            date__gte=start_date,
            date__lte=end_date,
            state__in=CONFIRMED_STATES,
        )

    def _resolve_product_names(self, item_ids):
        products = Product.objects.filter(id__in=item_ids).values('id', 'name')
        return {p['id']: p['name'] for p in products}

    @action(detail=False, methods=['get'], url_path='daily-summary')
    def daily_summary(self, request):
        branch_ids = self._get_branch_ids()
        period, start_date, end_date = self._resolve_date_range()

        base_qs = self._base_order_qs(branch_ids, start_date, end_date)

        sales_total = base_qs.aggregate(total=Sum('total'))['total'] or 0
        orders_count = base_qs.count()

        top_entry = (
            OrderProduct.objects
            .filter(order__in=base_qs)
            .values('item_id')
            .annotate(quantity_sold=Sum('quantity'))
            .order_by('-quantity_sold')
            .first()
        )

        top_product = None
        if top_entry:
            product_names = self._resolve_product_names([top_entry['item_id']])
            top_product = {
                'item_id': top_entry['item_id'],
                'name': product_names.get(top_entry['item_id'], ''),
                'quantity_sold': top_entry['quantity_sold'],
            }

        completed_qs = base_qs.filter(picked_up_at__isnull=False)
        avg_operation_minutes = None
        if completed_qs.exists():
            avg_duration = completed_qs.annotate(
                duration=ExpressionWrapper(
                    F('picked_up_at') - F('created_at'),
                    output_field=DurationField(),
                )
            ).aggregate(avg=Avg('duration'))['avg']
            if avg_duration is not None:
                avg_operation_minutes = round(avg_duration.total_seconds() / 60, 2)

        data = {
            'sales_total': str(sales_total),
            'orders_count': orders_count,
            'top_product': top_product,
            'avg_operation_minutes': avg_operation_minutes,
            'period': period,
            'date': timezone.now().date(),
        }
        serializer = DailySummarySerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='top-products')
    def top_products(self, request):
        branch_ids = self._get_branch_ids()
        period, start_date, end_date = self._resolve_date_range()
        base_qs = self._base_order_qs(branch_ids, start_date, end_date)

        entries = (
            OrderProduct.objects
            .filter(order__in=base_qs)
            .values('item_id')
            .annotate(quantity_sold=Sum('quantity'))
            .order_by('-quantity_sold')[:10]
        )

        item_ids = [e['item_id'] for e in entries]
        product_names = self._resolve_product_names(item_ids)

        products = [
            {
                'item_id': e['item_id'],
                'name': product_names.get(e['item_id'], ''),
                'quantity_sold': e['quantity_sold'],
            }
            for e in entries
        ]

        data = {'period': period, 'products': products}
        serializer = TopProductsSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='orders-by-hour')
    def orders_by_hour(self, request):
        branch_ids = self._get_branch_ids()
        period, start_date, end_date = self._resolve_date_range()
        base_qs = self._base_order_qs(branch_ids, start_date, end_date)

        hourly_data = (
            base_qs
            .annotate(
                hour=ExtractHour(
                    'created_at',
                    tzinfo=timezone.get_current_timezone(),
                )
            )
            .values('hour')
            .annotate(count=Count('id'))
            .order_by('hour')
        )

        hour_map = {entry['hour']: entry['count'] for entry in hourly_data}
        hours = [
            {'hour': h, 'count': hour_map.get(h, 0)}
            for h in range(24)
        ]

        data = {
            'period': period,
            'date': timezone.now().date(),
            'hours': hours,
        }
        serializer = OrdersByHourSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='sales')
    def sales(self, request):
        branch_ids = self._get_branch_ids()
        period, start_date, end_date = self._resolve_date_range()
        base_qs = self._base_order_qs(branch_ids, start_date, end_date)

        daily_sales = (
            base_qs
            .values('date')
            .annotate(
                total=Sum('total'),
                order_count=Count('id'),
            )
            .order_by('date')
        )

        data = {
            'period': period,
            'data': [
                {
                    'date': entry['date'],
                    'total': str(entry['total'] or 0),
                    'order_count': entry['order_count'],
                }
                for entry in daily_sales
            ],
        }
        serializer = SalesSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='operation-times')
    def operation_times(self, request):
        branch_ids = self._get_branch_ids()
        period, start_date, end_date = self._resolve_date_range()
        base_qs = self._base_order_qs(branch_ids, start_date, end_date)

        completed_qs = base_qs.filter(picked_up_at__isnull=False).annotate(
            duration_epoch=Extract(
                ExpressionWrapper(
                    F('picked_up_at') - F('created_at'),
                    output_field=DurationField(),
                ),
                'epoch',
            )
        )

        daily_data = (
            completed_qs
            .values('date')
            .annotate(
                avg_epoch=Avg('duration_epoch'),
                min_epoch=Min('duration_epoch'),
                max_epoch=Max('duration_epoch'),
            )
            .order_by('date')
        )

        def to_minutes(seconds):
            if seconds is None:
                return None
            return round(seconds / 60, 2)

        data_points = [
            {
                'date': entry['date'],
                'avg_minutes': to_minutes(entry['avg_epoch']),
                'min_minutes': to_minutes(entry['min_epoch']),
                'max_minutes': to_minutes(entry['max_epoch']),
            }
            for entry in daily_data
        ]

        all_epochs = [d['avg_epoch'] for d in daily_data if d['avg_epoch'] is not None]
        overall_avg = round(sum(all_epochs) / len(all_epochs) / 60, 2) if all_epochs else None

        data = {
            'period': period,
            'avg_minutes': overall_avg,
            'data': data_points,
        }
        serializer = OperationTimesSerializer(data=data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.data)
