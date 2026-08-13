from django.db import models
from django.contrib.auth.models import User

# Create your models here.
class Department(models.Model):
    department_name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.department_name

class SubDepartment(models.Model):
    department = models.ForeignKey(Department, on_delete=models.CASCADE, related_name='sub_departments')
    sub_department_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.department.department_name} - {self.sub_department_name}"

class Employee(models.Model):

    GENDER = (
        ('Male', 'Male'),
        ('Female', 'Female'),
    )

    EMPLOYMENT_TYPE = (
        ('Intern', 'Intern'),
        ('Trainee', 'Trainee'),
        ('Full Time', 'Full Time'),
        ('Part Time', 'Part Time'),
    )

    BOND = (
        ('No Bond', 'No Bond'),
        ('120 Hours', '120 Hours'),
        ('1 Month', '1 Month'),
        ('3 Months', '3 Months'),
        ('6 Months', '6 Months'),
        ('1 Year', '1 Year'),
        ('2 Years', '2 Years'),
    )

    user = models.OneToOneField(User, on_delete=models.CASCADE, null=True, blank=True)
    first_name = models.CharField(max_length=100, blank=True, null=True)
    last_name = models.CharField(max_length=100, blank=True, null=True)
    email = models.EmailField(blank=True, null=True)
    department = models.ForeignKey(Department, on_delete=models.CASCADE)

    phone = models.CharField(max_length=15)

    gender = models.CharField(
        max_length=10,
        choices=GENDER,
        default='Male'
    )

    employment_type = models.CharField(
        max_length=20,
        choices=EMPLOYMENT_TYPE,
        default='Intern'
    )

    date_of_birth = models.DateField(null=True, blank=True)
    joining_date = models.DateField()

    designation = models.CharField(max_length=100)

    salary = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True
    )

    bond_period = models.CharField(
        max_length=20,
        choices=BOND,
        default='No Bond'
    )

    address = models.TextField()
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.user.username

class Attendance(models.Model):

    STATUS = (
        ('Present', 'Present'),
        ('Absent', 'Absent'),
        ('Half Day', 'Half Day'),
        ('Leave', 'Leave'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    date = models.DateField()

    check_in = models.TimeField(null=True, blank=True)
    check_out = models.TimeField(null=True, blank=True)

    status = models.CharField(max_length=20, choices=STATUS)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.date}"

class Leave(models.Model):

    LEAVE_TYPES = [
    ('Casual Leave', 'Casual Leave'),
    ('Sick Leave', 'Sick Leave'),
    ('Paid Leave', 'Paid Leave'),
    ]
    leave_type = models.CharField(max_length=100, choices=LEAVE_TYPES)

    STATUS = (
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)
    leave_type = models.CharField(max_length=100, choices=LEAVE_TYPES)

    from_date = models.DateField()
    to_date = models.DateField()

    reason = models.TextField()

    status = models.CharField(
        max_length=20,
        choices=STATUS,
        default="Pending"
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.leave_type}"


class Payroll(models.Model):

    SALARY_STATUS = (
        ('Paid', 'Paid'),
        ('Unpaid', 'Unpaid'),
    )

    employee = models.ForeignKey(Employee, on_delete=models.CASCADE)

    month = models.CharField(max_length=20)
    year = models.PositiveIntegerField()

    basic_salary = models.DecimalField(max_digits=10, decimal_places=2)
    bonus = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    deduction = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    net_salary = models.DecimalField(max_digits=10, decimal_places=2)

    salary_status = models.CharField(
        max_length=10,
        choices=SALARY_STATUS,
        default='Unpaid'
    )

    payment_date = models.DateField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.employee.user.username} - {self.month} {self.year}"


class Task(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    assigned_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='created_tasks')
    
    priority = models.CharField(max_length=20, default='Medium', choices=[
        ('Low', 'Low'),
        ('Medium', 'Medium'),
        ('High', 'High')
    ])
    due_date = models.DateField(null=True, blank=True)
    
    status = models.CharField(max_length=50, default='Pending', choices=[
        ('Pending', 'Pending'),
        ('In Progress', 'In Progress'),
        ('Completed', 'Completed')
    ])
    progress_percentage = models.IntegerField(default=0) 
    employee_remarks = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    github_link = models.URLField(max_length=500, blank=True, null=True)

    def __str__(self):
        return self.title