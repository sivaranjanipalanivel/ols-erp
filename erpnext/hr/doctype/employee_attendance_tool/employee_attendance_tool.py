# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe Technologies Pvt. Ltd. and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe.model.document import Document


class EmployeeAttendanceTool(Document):
	pass


@frappe.whitelist()
def get_employees(date, department = None, branch = None, company = None, shift = None, employment_type = None):
	attendance_not_marked = []
	attendance_marked = []
	filters = {"status": "Active"}
	if department != "All":
		filters["department"] = department
	if branch != "All":
		filters["branch"] = branch
	if company != "All":
		filters["company"] = company
	if employment_type != "All":
		filters["employment_type"] = employment_type
	if shift:
		employee_roster = frappe.get_list("Roster", fields=["name", "shift"], filters={"shift":shift})
		if employee_roster:
			for roster in employee_roster:
				employee_roster_detail = frappe.get_list("Roster Details", fields=["employee", "employee_name","employee_number"], filters={"parent":roster.name})
				for new in employee_roster_detail:
					if department != "All":
						filters["department"] = department
					if branch != "All":
						filters["branch"] = branch
					if company != "All":
						filters["company"] = company
					if new.employee_number != "All":
						filters["employee"] = new.employee_number
					if employment_type != "All":
						filters["employment_type"] = employment_type
					employee_list = frappe.get_list("Employee", fields=["employee", "employee_name"], filters=filters, order_by="employee_name")
					marked_employee = {}
					for emp in frappe.get_list("Attendance", fields=["employee", "status"],
											   filters={"attendance_date": date}):
						marked_employee[emp['employee']] = emp['status']
					for employee in employee_list:
						employee['status'] = marked_employee.get(employee['employee'])
						if employee['employee'] not in marked_employee:
							attendance_not_marked.append(employee)
						else:
							attendance_marked.append(employee)
					return {
						"marked": attendance_marked,
						"unmarked": attendance_not_marked
					}
		else :
			employee_list = frappe.get_list("Employee", fields=["employee", "employee_name"], filters={"employee":""})
			marked_employee = {}
			for emp in frappe.get_list("Attendance", fields=["employee", "status"],
											   filters={"attendance_date": date}):
				marked_employee[emp['employee']] = emp['status']
			for employee in employee_list:
				employee['status'] = marked_employee.get(employee['employee'])
				if employee['employee'] not in marked_employee:
					attendance_not_marked.append(employee)
				else:
					attendance_marked.append(employee)
			return {
				"marked": attendance_marked,
				"unmarked": attendance_not_marked
			}

	else :
		employee_list = frappe.get_list("Employee", fields=["employee", "employee_name"], filters=filters, order_by="employee_name")
		marked_employee = {}
		for emp in frappe.get_list("Attendance", fields=["employee", "status"],
								   filters={"attendance_date": date}):
			marked_employee[emp['employee']] = emp['status']
		for employee in employee_list:
			employee['status'] = marked_employee.get(employee['employee'])
			if employee['employee'] not in marked_employee:
				attendance_not_marked.append(employee)
			else:
				attendance_marked.append(employee)
		return {
			"marked": attendance_marked,
			"unmarked": attendance_not_marked
		}

@frappe.whitelist()
def mark_employee_attendance(employee_list, status, date, leave_type=None, company=None):
	employee_list = json.loads(employee_list)
	for employee in employee_list:
		attendance = frappe.new_doc("Attendance")
		attendance.employee = employee['employee']
		attendance.employee_name = employee['employee_name']
		attendance.attendance_date = date
		attendance.status = status
		if status == "On Leave" and leave_type:
			attendance.leave_type = leave_type
		if company:
			attendance.company = company
		else:
			attendance.company = frappe.db.get_value("Employee", employee['employee'], "Company")
		attendance.submit()

@frappe.whitelist()
def mark_employee_leave(employee,employee_name, status, date, leave_type, company):
	# employee_list = json.loads(employees)
	# for employee in employee_list:
	attendance = frappe.new_doc("Attendance")
	attendance.employee = employee
	attendance.employee_name =employee_name
	attendance.attendance_date = date
	attendance.status = status
	if status == "On Leave" and leave_type:
		attendance.leave_type = leave_type
	if company:
		attendance.company = company
	else:
		attendance.company = frappe.db.get_value("Employee", employee['employee'], "Company")
	attendance.submit()
