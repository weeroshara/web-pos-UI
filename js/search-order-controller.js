var tblSearch = null;
var selectedRow = null;

$(function (){
    initializeDataTable();
})


$("#tbl-search tbody").on("click", "tr", selectItem);

function initializeDataTable(callBackFn) {
    if (tblSearch != null) {
        tblSearch.destroy();
    }

    if (callBackFn != undefined) {
        callBackFn();
        if($("#tbl-search tbody tr").length > 0){
            $("#tbl-search tfoot").addClass("d-none");
        }else{
            $("#tbl-search tfoot").removeClass("d-none");
        }
    }
    tblSearch = $("#tbl-search").DataTable({
        "lengthChange": false,
        "info": false,
        "pageLength": 6,
        "responsive": true,
        "autoWidth": false,
    });
    $("#tbl-search tr .dataTables_empty").remove();
}

function selectItem() {
    deSelectRows();
    $(this).addClass("selected-row");
}

function deSelectRows() {
    selectedRow = null;
    $("#tbl-search tbody tr").removeClass("selected-row");;
}