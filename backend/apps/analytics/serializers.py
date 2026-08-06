from rest_framework import serializers


class TopProductItemSerializer(serializers.Serializer):
    item_id = serializers.IntegerField()
    name = serializers.CharField()
    quantity_sold = serializers.IntegerField()


class TopProductsSerializer(serializers.Serializer):
    period = serializers.CharField()
    products = TopProductItemSerializer(many=True)


class HourlyCountSerializer(serializers.Serializer):
    hour = serializers.IntegerField()
    count = serializers.IntegerField()


class OrdersByHourSerializer(serializers.Serializer):
    period = serializers.CharField()
    date = serializers.DateField()
    hours = HourlyCountSerializer(many=True)


class SalesDataPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    total = serializers.DecimalField(max_digits=12, decimal_places=2)
    order_count = serializers.IntegerField()


class SalesSerializer(serializers.Serializer):
    period = serializers.CharField()
    data = SalesDataPointSerializer(many=True)


class DailySummarySerializer(serializers.Serializer):
    sales_total = serializers.DecimalField(max_digits=12, decimal_places=2)
    orders_count = serializers.IntegerField()
    top_product = TopProductItemSerializer(allow_null=True)
    avg_operation_minutes = serializers.FloatField(allow_null=True)
    period = serializers.CharField()
    date = serializers.DateField()


class OperationTimePointSerializer(serializers.Serializer):
    date = serializers.DateField()
    avg_minutes = serializers.FloatField(allow_null=True)
    min_minutes = serializers.FloatField(allow_null=True)
    max_minutes = serializers.FloatField(allow_null=True)


class OperationTimesSerializer(serializers.Serializer):
    period = serializers.CharField()
    avg_minutes = serializers.FloatField(allow_null=True)
    data = OperationTimePointSerializer(many=True)
