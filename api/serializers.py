from rest_framework import serializers
from django.contrib.auth.models import User
from api.models import *


# ================= DEPARTMENT =================

class DepartmentSerializer(serializers.ModelSerializer):

    class Meta:
        model = Department
        fields = "__all__"


# ================= EMPLOYEE =================

class EmployeeSerializer(serializers.ModelSerializer):

    username = serializers.CharField(required=False)
    password = serializers.CharField(
        write_only=True,
        required=False, allow_blank=True
    )

    first_name = serializers.CharField(required=False)
    last_name = serializers.CharField(required=False)
    email = serializers.EmailField(required=False)

    department_name = serializers.CharField(
        source="department.department_name",
        read_only=True
    )

    class Meta:

        model = Employee

        fields = [
            "id",

            "username",
            "password",
            "first_name",
            "last_name",
            "email",

           
            "department_name",

            "phone",
            "gender",
            "employment_type",
            "date_of_birth",
            "joining_date",
            "designation",
            "salary",
            "bond_period",
            "address",
            "city",
            "state",
        ]

    def to_representation(self, instance):

        data = super().to_representation(instance)

        data["username"] = instance.user.username
        data["first_name"] = instance.user.first_name
        data["last_name"] = instance.user.last_name
        data["email"] = instance.user.email

        return data

    def create(self, validated_data):

        username = validated_data.pop("username")
        password = validated_data.pop("password")
        first_name = validated_data.pop("first_name", "")
        last_name = validated_data.pop("last_name", "")
        email = validated_data.pop("email", "")

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )

        return Employee.objects.create(
            user=user,
            **validated_data
        )

    def update(self, instance, validated_data):

        user = instance.user

        user.username = validated_data.pop(
            "username",
            user.username
        )

        user.first_name = validated_data.pop(
            "first_name",
            user.first_name
        )

        user.last_name = validated_data.pop(
            "last_name",
            user.last_name
        )

        user.email = validated_data.pop(
            "email",
            user.email
        )

        password = validated_data.pop(
            "password",
            None
        )

        if password:
            user.set_password(password)

        user.save()

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        return instance


# ================= PROFILE =================

class EmployeeProfileSerializer(serializers.ModelSerializer):

    class Meta:

        model = Employee

        fields = [
            "department",
            "phone",
            "gender",
            "employment_type",
            "date_of_birth",
            "joining_date",
            "designation",
            "bond_period",
            "address",
            "city",
            "state",
        ]


# ================= ATTENDANCE =================

class AttendanceSerializer(serializers.ModelSerializer):

    employee_name = serializers.CharField(
        source="employee.user.get_full_name",
        read_only=True
    )

    class Meta:

        model = Attendance

        fields = [
            "id",
            "employee",
            "employee_name",
            "date",
            "check_in",
            "check_out",
            "status",
            "created_at"
        ]

        read_only_fields = [
            "created_at"
        ]


# ================= LEAVE =================

class LeaveSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Leave
        fields = '__all__'

    def get_employee_name(self, obj):
        try:
            if obj.employee:
                # 1. Direct Employee Model first_name
                if hasattr(obj.employee, 'first_name') and obj.employee.first_name:
                    last_name = getattr(obj.employee, 'last_name', '') or ''
                    return f"{obj.employee.first_name} {last_name}".strip()
                
                # 2. User Relation first_name
                if hasattr(obj.employee, 'user') and obj.employee.user:
                    u = obj.employee.user
                    full_name = f"{u.first_name} {u.last_name}".strip()
                    return full_name if full_name else u.username
                
                return str(obj.employee)
        except Exception:
            pass
        return "-"

# ================= PAYROLL =================

class PayrollSerializer(serializers.ModelSerializer):
    employee_name = serializers.SerializerMethodField()

    class Meta:
        model = Payroll
        fields = '__all__'

    def get_employee_name(self, obj):
        try:
            if obj.employee:
                # 1. Direct Employee Model first_name
                if hasattr(obj.employee, 'first_name') and obj.employee.first_name:
                    last_name = getattr(obj.employee, 'last_name', '') or ''
                    return f"{obj.employee.first_name} {last_name}".strip()
                
                # 2. User Relation first_name
                if hasattr(obj.employee, 'user') and obj.employee.user:
                    u = obj.employee.user
                    full_name = f"{u.first_name} {u.last_name}".strip()
                    return full_name if full_name else u.username
                
                return str(obj.employee)
        except Exception:
            pass
        return "-"

# ================= LOGIN =================

class LoginSerializer(serializers.Serializer):

    username = serializers.CharField()

    password = serializers.CharField(
        write_only=True
    )


# ================= REGISTER =================

class RegisterSerializer(serializers.ModelSerializer):

    class Meta:

        model = User

        fields = [
            "username",
            "password",
            "first_name",
            "last_name",
            "email"
        ]

        extra_kwargs = {
            "password": {
                "write_only": True
            }
        }

    def create(self, validated_data):

        return User.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
            first_name=validated_data.get(
                "first_name",
                ""
            ),
            last_name=validated_data.get(
                "last_name",
                ""
            ),
            email=validated_data.get(
                "email",
                ""
            )
        )

class TaskSerializer(serializers.ModelSerializer):
    assigned_to_name = serializers.ReadOnlyField(source='assigned_to.username')
    assigned_by_name = serializers.ReadOnlyField(source='assigned_by.username')

    class Meta:
        model = Task
        fields = '__all__'
        extra_kwargs = {
            'assigned_by': {'required': False}
        }