# -*- coding: utf-8 -*-
# Copyright (c) 2015, Frappe Technologies and contributors
# For license information, please see license.txt

from __future__ import unicode_literals
import frappe
import json
from frappe import _
from frappe.model.mapper import get_mapped_doc
from frappe.utils import flt, cstr

@frappe.whitelist(allow_guest=True)
def get_employee_info(user):
	Employee = frappe.db.get_all('Employee', fields=['name','employee_name','user_id','image','status','branch','unsubscribed'],filters={'user_id':user})
	for emp in Employee:
		Role = frappe.db.get_all('Has Role', fields=['parent','parenttype','role'],filters={'parent':user})		
		for roles in Role:
			if roles.role == "Instructor":
				emp.InstGroup = frappe.db.get_all('Instructor', fields=['instructor_name'],filters={'employee':emp.name})
				emp.instructor = "true"
				emp.admin_staff = "false" 
			elif roles.role == "Admin Staff": 
				emp.User = frappe.db.get_all('User', fields=['username','full_name'],filters={'email':roles.parent})
				emp.instructor = "false"
				emp.admin_staff = "true"
		return Employee  