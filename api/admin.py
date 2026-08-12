from django.contrib import admin
from api.models import *

# Register your models here.
admin.site.register(Department)
admin.site.register(Employee)
admin.site.register(Attendance)
admin.site.register(Leave)
admin.site.register(Payroll)
admin.site.register(Task)