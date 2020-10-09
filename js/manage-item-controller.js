/*===========================================================================
 *Global variables and constants
 ===========================================================================*/

var tblItem = null;
var selectedRow = null;
/*
===========================================================================
 *Document.ready() and Window.load()
 ===========================================================================*/

$(function () {
    initializeDataTable();
    loadAllItems();
});

/*
===========================================================================
 *Event Handlers
 ===========================================================================*/

$("#btn-save").click(saveOrUpdateItem);
$("#btn-clear").click(deSelectRows);
$("#btn-clear").click(removeAllValidation);
$("#tbl-items tbody").on("click", "tr", selectItem);
$("#tbl-items tbody").on("click", "tr .bin", deleteItem);
$("#txt-id, #txt-desc, #txt-price, #txt-qty").keypress(validationListener);

/*
===========================================================================
 *Methods
 ===========================================================================*/

function initializeDataTable(callBackFn) {
    if (tblItem != null) {
        tblItem.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if($("#tbl-items tbody tr").length > 0){
            $("#tbl-items tfoot").addClass("d-none");
        }else{
            $("#tbl-items tfoot").removeClass("d-none");
        }
     }
    tblItem = $("#tbl-items").DataTable({
        "lengthChange": false,
        "info": false,
        "pageLength": 6,
        "responsive": true,
        "autoWidth": false,
    });
    $("#tbl-items tr .dataTables_empty").remove();
}

function saveOrUpdateItem() {
    var id = $("#txt-id").val();
    var desc = $("#txt-desc").val();
    var price = $("#txt-price").val();
    var qty = $("#txt-qty").val();

    var validate = true;

    if(desc.trim().length < 3){
        $("#txt-desc").select();
        $("#txt-desc").addClass("is-invalid");
        validate = false;
    }

    if(!/\d+/.test(price)){
        $("#txt-price").select();
        $("#txt-price").addClass("is-invalid");
        validate = false;
    }

    if(!/^I\d{3}$/.test(id)){
        $("#txt-id").select();
        $("#txt-id").addClass("is-invalid");
        validate = false;
    }

    if(!/^\d+$/.test(qty)){
        $("#txt-qty").select();
        $("#txt-qty").addClass("is-invalid");
        validate = false;
    }

    if(!validate){
        $("form .is-invalid").tooltip("show");
        return ;
    }


    if ($("#btn-save").text() === "Update") {
        $.ajax({
            method : 'PUT',
            url : 'http://localhost:8080/app/api/v1/items/' + selectedRow.find("td:first-child").text(),
            data: $("form").serialize()
        }).done(function () {
            selectedRow.find("td:nth-child(2)").text(desc);
            selectedRow.find("td:nth-child(3)").text(price);
            selectedRow.find("td:nth-child(4)").text(qty);
            $("#btn-clear").click();

            Swal.fire(
                'Updated!',
                'Item has been Updated.',
                'success'
            )
        }).fail(function () {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: 'Failed to update Item',
                footer: '<a href>Why do I have this issue?</a>'
            });
            $("#txt-id").select();
        })
        return;
    }

    $.ajax({
        method: 'POST',
        url: 'http://localhost:8080/app/api/v1/items',
        /*using query String*/
        /*data: $("form").serialize()*/

        /*using json*/
        data : JSON.stringify({
            name:$("#txt-name").val(),
            address:$("#txt-address").val(),
        }),
        contentType : "application/json"
    }).done(function (){
        var rowHTML = "<tr>\n" +
            "<td>" + id + "</td>\n" +
            "<td>" + desc + "</td>\n" +
            "<td>" + price + "</td>\n" +
            "<td>" + qty + "</td>\n" +
            "<td class=\"bin\"><i class=\" fas fa-trash\"></i></td>\n" +
            "</tr>";

        initializeDataTable(function () {
            $("#tbl-items tbody").append(rowHTML);
        });
        Swal.fire(
            'Saved!',
            'Item has been Saved.',
            'success'
        )
        $("#btn-clear").click();
    }).fail(function () {
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'Can not Save This Item',
            footer: '<a href>Why do I have this issue?</a>'
        });
    })
}

function selectItem() {
    deSelectRows();
    $(this).addClass("selected-row");

    selectedRow = $(this);
    $("#txt-id").val(selectedRow.find("td:first-child").text());
    $("#txt-desc").val(selectedRow.find("td:nth-child(2)").text());
    $("#txt-price").val(selectedRow.find("td:nth-child(3)").text());
    $("#txt-qty").val(selectedRow.find("td:nth-child(4)").text());
    $("#btn-save").text("Update");
    $("#txt-id").attr("disabled", true);
}

function deSelectRows() {
    selectedRow = null;
    $("#tbl-items tbody tr").removeClass("selected-row");
    $("#btn-save").text("Save");
    $("#txt-id").attr("disabled", false);
}

function deleteItem() {
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
                url:'http://localhost:8080/app/api/v1/items/' + selectedRow.find("td:first-child").text(),
            }).done(function (){
                selectedRow.fadeOut(500, function () {
                    // initializeDataTable(function () {
                        selectedRow.remove();
                        $("#btn-clear").click();
                        Swal.fire(
                            'Deleted!',
                            'Item has been deleted.',
                            'success'
                        )
                    // });
                });
            }).fail(function (){
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Can not delete this Item',
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
    $("#txt-id, #txt-desc, #txt-price, #txt-qty").removeClass("is-invalid");
    $("#txt-id, #txt-desc, #txt-price, #txt-qty").tooltip('hide');
}

function loadAllItems() {
    $.ajax({
        method : 'GET',
        url : 'http://localhost:8080/app/api/v1/items',
    }).done(function (items){
        for (var i = 0; i < items.length; i++) {
            var itemCode = items[i].itemCode;
            var description = items[i].description;
            var unitPrice= items[i].unitPrice;
            var qtyOnHand = items[i].qty;

            var rowHTML = "<tr>\n" +
                "<td>" + itemCode + "</td>\n" +
                "<td>" + description + "</td>\n" +
                "<td>" + unitPrice + "</td>\n" +
                "<td>" + qtyOnHand + "</td>\n" +
                "<td class=\"bin\"><i class=\" fas fa-trash\"></i></td>\n" +
                "</tr>";

            initializeDataTable(function () {
                $("#tbl-items tbody").append(rowHTML);
            });

            $("#btn-clear").click();
        }
    }).fail(function (){
        Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: 'There are no Items',
            footer: '<a href>Why do I have this issue?</a>'
        });
    })
}