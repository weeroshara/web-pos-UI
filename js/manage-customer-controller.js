/*===========================================================================
 *Global variables and constants
 ===========================================================================*/

//var RS = jQuery.noConflict();

var tblCustomer = null;
var selectedRow = null;
/*
===========================================================================
 *Document.ready() and Window.load()
 ===========================================================================*/

$(function () {
    initializeDataTable();
    loadAllCustomer();
});

/*
===========================================================================
 *Event Handlers
 ===========================================================================*/

$("#btn-save").click(saveOrUpdateCustomer);
$("#btn-clear").click(deSelectRows);
$("#btn-clear").click(removeAllValidation);
$("#tbl-customers tbody").on("click", "tr", selectCustomer);
$("#tbl-customers tbody").on("click", "tr .bin", deleteCustomer);
$("#txt-id, #txt-name, #txt-address").keypress(validationListener);

/*
===========================================================================
 *Methods
 ===========================================================================*/

function loadAllCustomer() {
    $.ajax({
       method:'GET',
       url:'http://localhost:8080/app/api/v1/customers'
    }).done(function (customers) {
        for (var i = 0; i < customers.length; i++) {
            var id = customers[i].id;
            var name = customers[i].name;
            var address = customers[i].address;

            var rowHTML = "<tr>\n" +
                "<td>" + id + "</td>\n" +
                "<td>" + name + "</td>\n" +
                "<td>" + address + "</td>\n" +
                "<td class=\"bin\"><i class=\" fas fa-trash\"></i></td>\n" +
                "</tr>";

            initializeDataTable(function () {
                $("#tbl-customers tbody").append(rowHTML);
            });
        }
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'There are no customers',
            footer: '<a href>Why do I have this issue?</a>'
        });
    })

}

function initializeDataTable(callBackFn) {
    if (tblCustomer != null) {
        tblCustomer.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if($("#tbl-customers tbody tr").length > 0){
            $("#tbl-customers tfoot").addClass("d-none");
        }else{
            $("#tbl-customers tfoot").removeClass("d-none");
        }
     }
    tblCustomer = $("#tbl-customers").DataTable({
        "lengthChange": false,
        "info": false,
        "pageLength": 4,
        "responsive": true,
        "autoWidth": false,
    });
    $("#tbl-customers tr .dataTables_empty").remove();
}

function saveOrUpdateCustomer() {
    var id = $("#txt-id").val();
    var name = $("#txt-name").val();
    var address = $("#txt-address").val();

    var validate = true;

    if(address.trim().length < 3){
        $("#txt-address").select();
        $("#txt-address").addClass("is-invalid");
        validate = false;
    }

    if(!/[A-Za-z]{3,}/.test(name)){
        $("#txt-name").select();
        $("#txt-name").addClass("is-invalid");
        validate = false;
    }

    if(!/^C\d{3}$/.test(id)){
        $("#txt-id").select();
        $("#txt-id").addClass("is-invalid");
        validate = false;
    }

    if(!validate){
        $("form .is-invalid").tooltip("show");
        return ;
    }


    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method: 'PUT',
            url: 'http://localhost:8080/app/api/v1/customers/' + selectedRow.find("td:first-child").text(),
            data:$("form").serialize()
        }).done(function () {
            selectedRow.find("td:nth-child(2)").text(name);
            selectedRow.find("td:nth-child(3)").text(address);
            $("#btn-clear").click();

            Swal.fire(
                'Updated!',
                ''+name+' has been Updated.',
                'success'
            )
        }).fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to update Customer',
                footer: '<a href>Why do I have this issue?</a>'
            });
            $("#txt-id").select();
        })
        return ;
    }


    $.ajax({
       method: 'POST',
       url:'http://localhost:8080/app/api/v1/customers',
        data:$("form").serialize()
    }).done(function () {
        var rowHTML = "<tr>\n" +
            "<td>" + id + "</td>\n" +
            "<td>" + name + "</td>\n" +
            "<td>" + address + "</td>\n" +
            "<td class=\"bin\"><i class=\" fas fa-trash\"></i></td>\n" +
            "</tr>";

        initializeDataTable(function () {
            $("#tbl-customers tbody").append(rowHTML);
        });
        $("#btn-clear").click();
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Can not Save customer',
            footer: '<a href>Why do I have this issue?</a>'
        });
        $("#txt-id").select();
    });
    $("#btn-clear").click();
    removeAllValidation();

    /*/!*1. create XML request object*!/
    var http = new XMLHttpRequest();

    /!*2. Async all call back function (Request awama thamai me function eka wada karanne)*!/
    http.onreadystatechange = function (){
        if (http.readyState === 4) {
            if (http.status === 201) {

                var rowHTML = "<tr>\n" +
                    "<td>" + id + "</td>\n" +
                    "<td>" + name + "</td>\n" +
                    "<td>" + address + "</td>\n" +
                    "<td class=\"bin\"><i class=\" fas fa-trash\"></i></td>\n" +
                    "</tr>";

                initializeDataTable(function () {
                    $("#tbl-customers tbody").append(rowHTML);
                });
                $("#btn-clear").click();
            }else{
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'This customer is Already in Database',
                    footer: '<a href>Why do I have this issue?</a>'
                });
                $("#txt-id").select();
            }
        }
    };

    /!*3. It's time to open request*!/
    http.open('POST','http://localhost:8080/app/customer',true);

    /!*4.Let's set headers for the request*!/
    http.setRequestHeader('Content-type','application/x-www-form-urlencoded');

    // var queryString = 'id=' + id + '&name=' + name + '&address=' + address;
    var queryString = $("form").serialize();
    /!*5. Let's sent request*!/
    http.send(queryString);
    */
}

function selectCustomer() {
    deSelectRows();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-id").val(selectedRow.find("td:first-child").text());
    $("#txt-name").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-address").val(selectedRow.find("td:nth-child(3)").text());
    $("#btn-save").text("Update");
    $("#txt-id").attr("disabled", true);
}

function deSelectRows() {
    selectedRow = null;
    $("#tbl-customers tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    $("#txt-id").attr("disabled", false);
}

function deleteCustomer() {
    Swal.fire({
        title: 'Are you sure whether you want to delete...?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            $.ajax({
                method : 'DELETE',
                url : 'http://localhost:8080/app/api/v1/customers/' + selectedRow.find("td:first-child").text(),
            }).done(function (){
                selectedRow.fadeOut(500, function () {
                    initializeDataTable(function () {
                        selectedRow.remove();
                        $("#btn-clear").click();
                        Swal.fire(
                            'Deleted!',
                            'Customer has been deleted.',
                            'success'
                        )
                    });
                });
            }).fail(function (){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Can not delete this customer',
                    footer: '<a href>Why do I have this issue?</a>'
                });
                $("#txt-id").select();
            })
        }else{
            deSelectRows();
            $("#btn-clear").click();
        }
    });
}

function validationListener() {
    $(this).removeClass("is-invalid");
    $(this).tooltip('hide');
}

function removeAllValidation(){
    $("#txt-id, #txt-name, #txt-address").removeClass("is-invalid");
    $("#txt-id, #txt-name, #txt-address").tooltip('hide');
}