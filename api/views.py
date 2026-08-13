from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import render, redirect
from django.utils import timezone
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated, BasePermission
from rest_framework_simplejwt.tokens import RefreshToken
from api.models import *
from api.serializers import *
from datetime import time

# ==================================================
# HTML PAGE VIEWS
# ==================================================

def login_page(request):
    return render(request, "login.html")


def register_page(request):
    return render(request, "register.html")


def dashboard(request):
    return render(request, "dashboard.html")


def department_page(request):
    return render(request, "department.html")


def employee_page(request):
    return render(request, "employee.html")


def attendance_page(request):
    return render(request, "attendance.html")


def leave_page(request):
    return render(request, "leave.html")


def payroll_page(request):
    return render(request, "payroll.html")


def employee_dashboard(request):
    return render(request, "employee_dashboard.html")

def tasks(request):
    return render(request, "tasks.html")

# ==================================================
# API VIEWSETS
# ==================================================

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    permission_classes = [AllowAny]


class EmployeeViewSet(viewsets.ModelViewSet):
    queryset = Employee.objects.all()
    serializer_class = EmployeeSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Employee.objects.all()
        return Employee.objects.filter(user=user)

class AttendanceViewSet(viewsets.ModelViewSet):

    queryset = Attendance.objects.all()
    serializer_class = AttendanceSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):

        user = self.request.user

        if user.is_staff:
            queryset = Attendance.objects.all()

        else:
            try:
                employee = Employee.objects.get(user=user)

                queryset = Attendance.objects.filter(
                    employee=employee
                )

            except Employee.DoesNotExist:
                queryset = Attendance.objects.none()

        # =========================
        # EMPLOYEE FILTER
        # =========================

        employee_id = self.request.query_params.get("employee")

        if employee_id:
            queryset = queryset.filter(
                employee_id=employee_id
            )

        # =========================
        # FROM DATE FILTER
        # =========================

        from_date = self.request.query_params.get("from_date")

        if from_date:
            queryset = queryset.filter(
                date__gte=from_date
            )

        return queryset.order_by("-date", "-id")
class LeaveViewSet(viewsets.ModelViewSet):
    queryset = Leave.objects.all().order_by("-id")
    serializer_class = LeaveSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Leave.objects.all().order_by("-id")
        return Leave.objects.filter(employee__user=self.request.user).order_by("-id")

    def perform_create(self, serializer):
        try:
            employee = Employee.objects.get(user=self.request.user)
            serializer.save(employee=employee)
        except Employee.DoesNotExist:
            serializer.save()


class PayrollViewSet(viewsets.ModelViewSet):
    queryset = Payroll.objects.all()
    serializer_class = PayrollSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        if self.request.user.is_staff:
            return Payroll.objects.all().order_by("-id")
        return Payroll.objects.filter(employee__user=self.request.user).order_by("-id")


# ==================================================
# AUTH APIs
# ==================================================

class RegisterAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "Register Successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginAPIView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        username = serializer.validated_data["username"]
        password = serializer.validated_data["password"]

        user = authenticate(username=username, password=password)

        if user is None:
            return Response({"message": "Invalid Username or Password"}, status=status.HTTP_401_UNAUTHORIZED)

        refresh = RefreshToken.for_user(user)

        # ADMIN LOGIN
        if user.is_staff:
            return Response({
                "message": "Login Successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": "admin"
            })

        # EMPLOYEE LOGIN
        try:
            employee = Employee.objects.get(user=user)
            return Response({
                "message": "Login Successfully",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": "employee",
                "profile": True,
                "employee_id": employee.id
            })
        except Employee.DoesNotExist:
            return Response({
                "message": "Complete Your Profile",
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "role": "employee",
                "profile": False
            })


# ==================================================
# ATTENDANCE APIs
# ==================================================

class CheckInAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({"message": "Complete Your Profile First"}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        attendance, created = Attendance.objects.get_or_create(
            employee=employee,
            date=today,
            defaults={
                "check_in": timezone.localtime().time(),
                "check_out": None,
                "status": "Present"
            }
        )

        if not created:
            if attendance.check_in:
                return Response({"message": "Already Checked In"}, status=status.HTTP_400_BAD_REQUEST)

            attendance.check_in = timezone.localtime().time()
            attendance.save()

        return Response({
            "message": "Check In Successful",
            "check_in": str(attendance.check_in)
        }, status=status.HTTP_200_OK)


class CheckOutAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            employee = Employee.objects.get(user=request.user)
        except Employee.DoesNotExist:
            return Response({"message": "Complete Your Profile First"}, status=status.HTTP_400_BAD_REQUEST)

        today = timezone.localdate()
        try:
            attendance = Attendance.objects.get(employee=employee, date=today)
        except Attendance.DoesNotExist:
            return Response({"message": "Please Check In First"}, status=status.HTTP_400_BAD_REQUEST)

        if attendance.check_out:
            return Response({"message": "Already Checked Out"}, status=status.HTTP_400_BAD_REQUEST)

        attendance.check_out = timezone.localtime().time()
        attendance.save()

        return Response({
            "message": "Check Out Successful",
            "check_out": str(attendance.check_out)
        }, status=status.HTTP_200_OK)

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all().order_by('-created_at')
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(assigned_by=self.request.user)

    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.is_superuser:
            return Task.objects.all().order_by('-created_at')
        return Task.objects.filter(assigned_to=user).order_by('-created_at')

class SubDepartmentViewSet(viewsets.ModelViewSet):
    queryset = SubDepartment.objects.all()
    serializer_class = SubDepartmentSerializer
    permission_classes = [IsAuthenticated]
