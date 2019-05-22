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
def get_staffbatch(user):
	Employee = frappe.db.get_all('Employee', fields=['name'],filters={'user_id':user})
	for emp in Employee:
		InstGroup = frappe.db.get_all('Instructor', fields=['instructor_name'],filters={'employee':emp.name})
		if len(InstGroup)==1:
			for inst in InstGroup:
				StudentGroup = frappe.db.get_all('Student Group Instructor', fields=['parent'],filters={'instructor_name':inst.instructor_name})
				for item in StudentGroup:
					Batch = frappe.db.get_all('Student Group', fields=['name','academic_year','academic_term', 'program', 'course', 'batch'],filters={'name':item.parent})
					# item.Student = frappe.db.get_all('Student Group Student', fields=['student','student_name','group_roll_number'],filters={'parent':item.parent})
					# datas.append(item)
					return Batch 
		elif len(InstGroup)!=1: 
			Batch = frappe.db.get_all('Student Group', fields=['name','academic_year','academic_term', 'program', 'course', 'batch'])
			# for item in StudentGroup:
			# 	item.Student = frappe.db.get_all('Student Group Student', fields=['student','student_name','group_roll_number'],filters={'parent':item.name})
			# datas.append(item)
			return Batch        

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