from django.urls import path, include
from rest_framework.routers import DefaultRouter
from api.views import *

router = DefaultRouter()
router.register("department", DepartmentViewSet, basename="department")
router.register("employee", EmployeeViewSet, basename="employee")
router.register("attendance", AttendanceViewSet, basename="attendance")
router.register("leave", LeaveViewSet, basename="leave")
router.register("payroll", PayrollViewSet, basename="payroll")
router.register("tasks", TaskViewSet, basename="tasks")
router.register("sub-department", SubDepartmentViewSet, basename="sub-department")


urlpatterns = [
    # ================= HTML PAGES (SIDEBAR LINKS) =================
    path("login_page/", login_page, name="login_page"),
    path("", register_page, name="register_page"),
    path("dashboard/", dashboard, name="dashboard"),
    
    path("department-page/", department_page, name="department_page"),
    path("employee-page/", employee_page, name="employee_page"),
    path("attendance-page/", attendance_page, name="attendance_page"),
    path("leave-page/", leave_page, name="leave_page"),
    path("payroll-page/", payroll_page, name="payroll_page"),
    path("dashboard/tasks.html", tasks, name="tasks"),
    
    
    # Employee Pages
    path("employee-dashboard/", employee_dashboard, name="employee_dashboard"), 

    # ================= AUTH APIs =================
    path("login/", LoginAPIView.as_view(), name="login"),
    path("register/", RegisterAPIView.as_view(), name="register"),

    # ================= ATTENDANCE APIs =================
    path("attendance/check-in/", CheckInAPIView.as_view(), name="check_in"),
    path("attendance/check-out/", CheckOutAPIView.as_view(), name="check_out"),

    # ================= REST API ROUTER =================
    path("api/", include(router.urls)), 
]