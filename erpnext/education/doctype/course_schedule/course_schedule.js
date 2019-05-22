frappe.provide("education");

cur_frm.add_fetch("project", "course", "course")
frappe.ui.form.on("Course Schedule", {
	refresh: function(frm) {
		if (!frm.doc.__islocal) {
			frm.add_custom_button(__("Attendance"), function() {
				frappe.route_options = {
					based_on: "Course Schedule",
					course_schedule: frm.doc.name
				}
				frappe.set_route("Form", "Student Attendance Tool");
			});
		}
	},
	project: function(frm) {
		var a = frappe.doc.get_value("project", frm.doc.project, "course")
		frm.doc.set_value("course", a);
	}
});