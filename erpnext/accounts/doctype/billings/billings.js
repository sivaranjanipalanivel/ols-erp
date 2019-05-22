// Copyright (c) 2018, Frappe Technologies Pvt. Ltd. and contributors
// For license information, please see license.txt

frappe.ui.form.on('Billings', {
	refresh: function(frm) {

	},
	after_save: function(frm) {
		if (!frm.doc.__islocal) {
	  debugger;
	  $.ajax({
method: "POST",
url: window.location.origin+"/api/resource/Journal Entry",
dataType: 'text',
type: 'POST',
contentType: 'application/json',
data:JSON.stringify({
 "title" : "Daily11 Sales Posting 1st Sep 2015" ,
 "posting_date" : "2015-09-01" , "doctype" : "Journal Entry" ,  
"naming_series" : "JV-" ,  "voucher_type" : "Journal Entry" , 
 "accounts" :[{ "is_advance" : "No" , "cost_center" : "Main - TC" , 
 "account" : "Cash-A" , "doctype" : "Journal Entry Account" ,
  "debit" :50.0, "docstatus" :1},{ "is_advance" : "No" ,
  "cost_center" : "Main - TC" , "account" : "Cash-A" , 
  "doctype" : "Journal Entry Account" , "credit" :50.0, "docstatus" :1}], 
   "owner" : "ardan@corebpm.com" ,  "user_remark" : "Daily Sales 1st Sep 2015" , 
    "remark" : "Daily Sales Posting 1st Sep 2015" ,  "docstatus" :1
})
}).success(function(data, status, xhr) {
alert("success");
alert(data);
}).error(function(data, status, xhr) {
alert("error");
});
	}
	else
	{
		frappe.throw(__("Save the Document first"));
	}
	},
});
