// Copyright (c) 2017, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt


frappe.ui.form.on("Fees", {
// 		validate: function(frm) {
// 		frappe
//  if ((frm.doc.save_to == "LMS" || frm.doc.save_to == "Exam")) {
// 	if(!(frm.doc.subject && frm.doc.chapter && frm.doc.section)){
// 		frappe.throw("Mandatory fields are empty")

// 	}

//   }
// }, 
total: function(frm) {
	
},

after_save: function(frm) {
	if(frm.doc.discount_amount){
		var d = parseInt(frm.doc.grand_total)-parseInt(frm.doc.discount_amount) 
             console.log(d)
          frm.set_value("total", d);
      }
      else{
      	frm.set_value("total", frm.doc.grand_total);
      }
},

	setup: function(frm) {
		frm.add_fetch("fee_structure", "receivable_account", "receivable_account");
		frm.add_fetch("fee_structure", "income_account", "income_account");
		frm.add_fetch("fee_structure", "cost_center", "cost_center");
	},

	onload: function(frm){
		frm.set_query("academic_term",function(){
			return{
				"filters":{
					"academic_year": (frm.doc.academic_year)
				}
			};
		});
		frm.set_query("fee_structure",function(){
			return{
				"filters":{
					"academic_year": (frm.doc.academic_year)
				}
			};
		});
		frm.set_query("receivable_account", function(doc) {
			return {
				filters: {
					'account_type': 'Receivable',
					'is_group': 0,
					'company': doc.company
				}
			};
		});
		frm.set_query("income_account", function(doc) {
			return {
				filters: {
					'account_type': 'Income Account',
					'is_group': 0,
					'company': doc.company
				}
			};
		});
		if (!frm.doc.posting_date) {
			frm.doc.posting_date = frappe.datetime.get_today();
		}
	},

	refresh: function(frm) {
		if(frm.doc.docstatus == 0 && frm.doc.set_posting_time) {
			frm.set_df_property('posting_date', 'read_only', 0);
			frm.set_df_property('posting_time', 'read_only', 0);
		} else {
			frm.set_df_property('posting_date', 'read_only', 1);
			frm.set_df_property('posting_time', 'read_only', 1);
		}
		if(frm.doc.docstatus===1) {
			frm.add_custom_button(__('Accounting Ledger'), function() {
				frappe.route_options = {
					voucher_no: frm.doc.name,
					from_date: frm.doc.posting_date,
					to_date: frm.doc.posting_date,
					company: frm.doc.company,
					group_by_voucher: false
				};
				frappe.set_route("query-report", "General Ledger");
			}, __("View"));
		}
		if(frm.doc.docstatus===1 && frm.doc.outstanding_amount>0) {
			frm.add_custom_button(__("Payment Request"), function() {
				frm.events.make_payment_request(frm);
			}, __("Make"));
			frm.page.set_inner_btn_group_as_primary(__("Make"));
		}
		if(frm.doc.docstatus===1 && frm.doc.outstanding_amount!=0) {
			frm.add_custom_button(__("Payment"), function() {
				frm.events.make_payment_entry(frm);
			}, __("Make"));
			frm.page.set_inner_btn_group_as_primary(__("Make"));
		}
	},

	coupon_code: function(frm) {
         	frappe.call({
				method: "erpnext.education.api.get_coupon_details",
				args: {
					"coupon_code": frm.doc.coupon_code
				},
				callback: function(r) {
					console.log(r.message)
					$.each(r.message, function(i, d) {
			 frm.set_value("discount", d.discount);
              frm.set_value("discount_amount", d.price);
				});
			}
		});
		},

	student: function(frm) {
		if (frm.doc.student) {
			frappe.call({
				method:"erpnext.education.api.get_current_enrollment",
				args: {
					"student": frm.doc.student,
					"academic_year": frm.doc.academic_year
				},
				callback: function(r) {
					if(r){
						$.each(r.message, function(i, d) {
							frm.set_value(i,d);
						});
					}
				}
			});
		}
	},

	make_payment_request: function(frm) {
		if (!frm.doc.student_email) {
			frappe.msgprint(__("Please set the Email ID for the Student to send the Payment Request"));
		} else {
			frappe.call({
				method:"erpnext.accounts.doctype.payment_request.payment_request.make_payment_request",
				args: {
					"dt": frm.doc.doctype,
					"dn": frm.doc.name,
					"recipient_id": frm.doc.student_email
				},
				callback: function(r) {
					if(!r.exc){
						var doc = frappe.model.sync(r.message);
						frappe.set_route("Form", doc[0].doctype, doc[0].name);
					}
				}
			});
		}
	},

	make_payment_entry: function(frm) {
		return frappe.call({
			method: "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry",
			args: {
				"dt": frm.doc.doctype,
				"dn": frm.doc.name
			},
			callback: function(r) {
				var doc = frappe.model.sync(r.message);
				frappe.set_route("Form", doc[0].doctype, doc[0].name);
			}
		});
	},

	set_posting_time: function(frm) {
		frm.refresh();
	},

	academic_term: function() {
		frappe.ui.form.trigger("Fees", "program");
	},

	fee_structure: function(frm) {
		frm.set_value("components" ,"");
		if (frm.doc.fee_structure) {
			frappe.call({
				method: "erpnext.education.api.get_fee_components",
				args: {
					"fee_structure": frm.doc.fee_structure
				},
				callback: function(r) {
					if (r.message) {
						$.each(r.message, function(i, d) {
							var row = frappe.model.add_child(frm.doc, "Fee Component", "components");
							console.log( d.fees_category)
							
								row.fees_category = d.fees_category;
							row.description = d.description;
							row.amount = d.amount;
					
// 					$.each(r.message, function(i, d) {
// console.log(d.eligible_scholarship)

// 						});

					});
				}
					refresh_field("components");
					frm.trigger("calculate_total_amount");
				}
			});
		}
	},

	calculate_total_amount: function(frm) {
		var grand_total = 0;
		for(var i=0;i<frm.doc.components.length;i++) {
			grand_total += frm.doc.components[i].amount;
		}
		frm.set_value("grand_total", grand_total);
	}
});

// frappe.ui.form.on("Fees", "student", function(frm) {
// 			frappe.call({
// 				method: "erpnext.education.api.get_list_of_studentdetails",
// 				args: {
// 					"student": frm.doc.student
// 				},
// 				callback: function(r) {
// 				if(r.message){
// 					console.log(r.message)
// 						// $.each(r.message, function(i, d) {
//        frm.set_value("program_enrollment", d.name);
//        frm.set_value("program", d.program);
//        frm.set_value("student_batch", d.academic_year);
//        frm.set_value("student_category", d.academic_term);
//        frm.set_value("academic_term", d.student_batch_name);
//        frm.set_value("academic_year", d.student_category);
//        // });
// 					}

// 				}
// 			});

		
// });

// frappe.ui.form.on("Fees", "coupon_code", function(frm) {
// 	frappe.call({
// 				method: "erpnext.education.api.get_coupon_details",
// 				args: {
// 					"coupon_code": frm.doc.coupon_code
// 				},
// 				callback: function(r) {
// 					console.log(r.message)
// 					$.each(r.message, function(i, d) {
// 			 frm.set_value("discount", d.discount);
//               frm.set_value("discount_amount", d.price);
//              var s= parseInt(frm.doc.total)-parseInt(d.price) 
//              console.log(s)
//           frm.set_value("grand_total", s);
// 				});
// 			}
// 		});
// });


frappe.ui.form.on("Fee Component", {
	amount: function(frm) {
		frm.trigger("calculate_total_amount");
	}
});

// frappe.ui.form.on("Fees", "student", function(frm, cdt, cdn) {
//  frappe.call({
// 				method:"erpnext.education.doctype.fees.fees.get_student_scholarship",
// 				args: {
// 					"student": frm.doc.student,
// 					"student_name": frm.doc.student_name,
// 				},
// 				callback: function(r) {
// 					console.log(r.message)
// 					// var s=r.message;
// if(r.message){
// 						$.each(r.message, function(i, d) {
							
// 							 frm.set_value("is_scholarship_eligible", 1);
// 							 frm.set_value("scholarship", d.eligible_scholarship);		
// 						});
// 					}
// 					else{
// 						 frm.set_value("is_scholarship_eligible", 0);
// 					 frm.set_value("scholarship",0);	
// 					}
// 				}
// 			});    
// });
