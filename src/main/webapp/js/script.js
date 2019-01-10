//10.01.2019
var app = angular.module('parts-list',  ['ngTouch', 'ngAnimate', 'ui.grid', 'ui.grid.pinning', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.bootstrap', 'ui.grid.edit', 'ui.grid.pagination', 'schemaForm'])
    .constant('PersonSchema', {
        type: 'object',
        properties: {
            id: {type: 'string', editable: false, title: 'ID', "default": "0", nullable: false, "readOnly": true},
            component: {
                type: 'string', title: 'Наименование', "default": "Franc", "minLength": 1, "maxLength": 100,
                "validationMessage": "Введите наименование размером от 0 до 100 символов!"/*, validation: {
                    required: true,
                    customRule: function (input) {
                        alert('bad data');
                    }
                }*/
            },
            quantity: {
                type: 'integer', title: 'Количество', "default": 25, "minimum": 1, "maximum": 2147483647
                // validation: {
                    // required: true,
                    /*customRule: function (input) {
                        alert('bad data');
                    }*/
                // }
            },

            /*   necessary: { type: 'string', title: 'Necessary', "default": true },*/
            necessary: {
                title: "Необходимость",
                type: 'boolean',
                "default": true
            }
        },
        required: [
            "component",
            "quantity"
        ]

    })

app.controller('MainCtrl', MainCtrl);
app.controller('RowEditCtrl', RowEditCtrl);
app.service('RowEditor', RowEditor);

var config = {
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
};

var flagFilterNecessary = false;

var dataFilterNecessary = "undefined";

var flagSearchComponent = false;


MainCtrl.$inject = ['$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants', '$rootScope'];
child = {};


function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $rootScope) {
    var parentScope = $scope.$parent;
    parentScope.child = $scope;
    $scope.alerts = [];
    var vm = this;
    // $scope.resultMessage = vm.resultMessage;
    // $rootScope.resultMessage = vm.resultMessage;
    $rootScope.resultMessage = "success";
    // $rootScope.resultMessage = "";
    // flagFilterNecessary = false;
    vm.last;
    vm.rowOffset = {};
    vm.editRow = RowEditor.editRow;
    vm.numberOfItemsOnPage = 5;
    vm.size = 10;
    // var totalItems = 0;
    vm.currentPageNumber = 1;
    dataFilterNecessary = 'undefined';
    // var totalPage = Math.ceil(vm.serviceGrid.totalItems / numberOfItemsOnPage);
    vm.serviceGrid = {
        paginationPageSizes: [vm.numberOfItemsOnPage, vm.numberOfItemsOnPage * 2, vm.numberOfItemsOnPage * 3],
        enableRowSelection: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        enableSorting: true,
        enableFiltering: true,
        useExternalFiltering: false,
        enableGridMenu: false,
        paginationPageSize: vm.numberOfItemsOnPage,
        enableHorizontalScrollbar: true,
        enableVerticalScrollbar: true,
        // excessColumns: 10,

        minRowsToShow: 12,

        enableFiltering: true,

        enableColumnMenus: false,
        // totalItems: 10,
        useExternalPagination: true,
        showGridFooter: true,
        // gridFooterTemplate: "<button ng-click='edit-button.html'> Add Part </button>",
        /*gridFooterTemplate:'<div  style="text-align:left" ><button ng-click=\'addRow()\' > Add Part </button></div>',*/
        gridFooterTemplate: /* "<button ng-click='alert()'> Add Book </button>",*/
            "<div align=\"left\"><button ng-click='grid.appScope.addRow();' > Add Part </button> <span  class=\"ui-grid-cell-contents\">Комплектующие в списке <ng-if ng-if=\"grid.appScope.filterTerm == 'undefined'\">ВСЕ</ng-if><ng-if ng-if=\"grid.appScope.filterTerm === 'true'\">необходимые для сборки</ng-if>\n" +
            "                <ng-if ng-if=\"grid.appScope.filterTerm === 'false'\">опциональные</ng-if> </span></div>",
        /*rowTemplate : "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"*/
        // rowTemlate : "ng-class='ui-grid-row-header-cell' "
    };

    vm.serviceGrid.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        console.log("onRegisterApi  ", vm.serviceGrid.totalItems);
        // getNubmberOfElements();
        $scope.getCountSets();

        $scope.getCurrentPage();

        gridApi.core.refresh();
        console.log(" gridApi ", gridApi);
        console.log(" gridApi current page ", gridApi.pagination.getPage());

        $scope.gridApi.core.on.rowsVisibleChanged(null, catchRowVisibleChanged);
        /* gridApi.core.notifyDataChange(uiGridConstants.dataChange.ROW) ;
         $scope.gridApi.core.on.rowsRendered( $scope, myFunction );*/
        /*{
            console.log(" gridApi.selection.on.rowSelectionChanged($scope,function(row)" );
            alert(' !');
            var msg = 'row selected ' + row.isSelected;
            $log.log(msg);
        };*/
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            // alert("Hello! I am an alert box!");
            console.log("gridApi.pagination.on.paginationChanged >>>>>>>>");
            console.log("newPage; ", newPage);
            vm.currentPageNumber = newPage;
            vm.numberOfItemsOnPage = pageSize;
            console.log("flagFilterNecessary ", flagFilterNecessary);
            console.log("dataFilterNecessary ", dataFilterNecessary);
            console.log("vm.serviceGrid.totalItems ", vm.serviceGrid.totalItems);
            console.log("vm.serviceGrid ", vm.serviceGrid);
            $scope.getCurrentPage($scope.filterTerm);


            console.log("getNumberOfParts paginationChanged vm.serviceGrid.pageSize ", pageSize);
            // console.log("getNumberOfParts paginationChanged vm.serviceGrid.totalItems ", vm.serviceGrid.totalItems);
            console.log("getNumberOfParts paginationChanged vm.serviceGrid.numberOfItemsOnPage ", vm.numberOfItemsOnPage);
            console.log(" gridApi Pagination changed current page ", gridApi.pagination.getPage());
            console.log(" gridApi Pagination changed total pages ", gridApi.pagination.getTotalPages());
            console.log(" gridApi Paginatione ", gridApi.pagination);
            console.log("gridApi.pagination.on.paginationChanged <<<<<<<<");

            /* vm.serviceGrid.totalPage = Math.ceil(vm.serviceGrid.totalItems / pageSize);
             console.log("Received: pageNumber=" + newPage + ", pageSize= " + pageSize, " total pages ", vm.serviceGrid.totalPage);*/
        });
        vm.msg = {};
        vm.serviceGrid.currentFocused = "";
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            vm.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue + " propName " + rowEntity.name;
            console.log("rowEntity cell edit", rowEntity);
            // $scope.addRow();
            // postUpdatePart($scope, rowEntity);
            // $scope.updateRow(rowEntity);
            $scope.$apply();

        });
    };

    vm.serviceGrid.columnDefs = [
        {name: 'id', displayName: "ID", width: '15%', enableCellEdit: false, enableFiltering: false},
        {
            name: 'component',
            displayName: "Наименование",
            width: '45%',
            enableCellEdit: false,
            type: 'string',
            enableFiltering: false,
            cellTooltip: true,
            /*cellTooltip: function (row) {
                return row.entity.title;
            },*/
            cellTemplate: '<div  style="text-align:left" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>',
            filter: {
                /*noTerm: true,*/
                // term: $scope.filterTerm
                condition: function (searchTerm, cellValue) {
                    return cellValue.match(serchTerm);
                }
            }
        },
        /*{name: 'quantity', displayName: "Количество", width: '10%', enableCellEdit: true, type: 'number'},*/
        {
            name: 'quantity',
            displayName: "Количество",
            width: '15%',
            enableCellEdit: false,
            type: 'number',
            enableFiltering: false,
            cellTooltip: true
        },
        {
            name: 'necessary',
            displayName: "Необходимость",
            width: '10%',
            enableCellEdit: false,
            type: 'boolean',
            enableFiltering: false,
            cellTemplate: "<div class='ui-grid-cell-contents'>{{row.entity.necessary ? 'Да' : 'Нет'}}</div>",
            cellFilter: true,
            filter: {
                /*noTerm: true,*/
                term: $scope.filterTerm
                /*condition: function (searchTerm, cellValue) {
                    return cellValue.match(filterTerm);
                }*/
            }
        },
        {
            name: ' ',
            width: '10%',
            enableCellEdit: false,
            enableFiltering: false,
            enableSorting: false,
            cellTemplate: /*'<button class="btn primary" ng-click="grid.appScope.myclick()">Delete</button>'*/
            '<button class="glyphicon glyphicon-remove"' +
            /*' ng-click="grid.appScope.getDeletePart(row.entity.id).onClick(row.entity.id)">' +*/
            ' ng-click="grid.appScope.getDeletePart(row)">' +
            '</button>'
        },
        {
            name: '  ',
            visible: true,
            width: '10%',
            enableCellEdit: false,
            enableFiltering: false,
            enableSorting: false,
            cellTemplate: /*'<button class="btn primary" ng-click="grid.appScope.myclick()">Delete</button>'*/
            '<button class="glyphicon glyphicon-pencil"' +
            ' ng-click="grid.appScope.updateRow(row)">' +
            '</button>'
        }
    ];

    $scope.searchGrid = function (searchTerm) {
        $scope.gridApi.grid.columns[1].filters[0] = {term: $scope.searchTerm};
        console.log("searchTerm ", $scope.searchTerm);
        console.log("$scope.gridApi.grid.columns[1].filters[0] ", $scope.gridApi.grid.columns[1].filters[0])
    }
    $scope.show = true;
/*
    $scope.closeAlert = function(index) {
        // $scope.show = false;
        $rootScope.operation = "";
    };*/

    $scope.addAlert = function(type, message) {

        $scope.alerts.push({type: type, msg: message});
    };

    $scope.closeAlert = function(index) {

        // $scope.alerts.splice(0);
       /* for(i = 0; i < $scope.alerts.length; i++) {
            $scope.alerts.splice(i, 1);
        }*/
        $scope.alerts.splice(index, 1);
    };

    var catchRowVisibleChanged = function (grid) {
        /*  console.log("call 1 next page necessary delete (not a last page) >>>>>");
          console.log(" ALERT 2 grid", grid);
          console.log(" ALERT 2 grid.core ", grid.core);
          console.log(" ALERT 2 rid.core.getVisibleRows()", grid.core.getVisibleRows());
          console.log(" ALERT 2 grid.core.getVisibleRows().length", grid.core.getVisibleRows().length);
          console.log(" ALERT 2 pagination ", grid.pagination);
          console.log(" ALERT 2 pagination total page ", grid.pagination.getTotalPages());
          console.log(" ALERT 2 pagination getPage", grid.pagination.getPage());
          console.log(" ALERT 2 pagination first row ", grid.pagination.getFirstRowIndex());
          console.log(" ALERT 2 pagination last row ", grid.pagination.getLastRowIndex());
          console.log(" vm.numberOfItemsOnPage  ", vm.numberOfItemsOnPage);
          console.log(" vm.serviceGrid.data  ", vm.serviceGrid.data);
          console.log(" vm.serviceGrid  ", vm.serviceGrid);
          console.log(" vm.serviceGrid.data[vm.numberOfItemsOnPage]  ", vm.serviceGrid.data[vm.numberOfItemsOnPage]);*/
        /* console.log(" call  getCurrentPageNecessary", (grid.pagination.getPage() < grid.pagination.getTotalPages() && grid.core.getVisibleRows().length > vm.numberOfItemsOnPage));
        // (grid.pagination.getLastRowIndex() - grid.pagination.getFirstRowIndex() +1)
        if (grid.pagination.getPage() < grid.pagination.getTotalPages() && grid.core.getVisibleRows().length > vm.numberOfItemsOnPage) {
            console.log(" (after add > size) >>>>>");
            // vm.currentPageNumber = grid.pagination.getTotalPages();
            vm.currentPageNumber += 1;
            if ( $scope.filterTerm == 'undefined') {
                console.log("undefined");
                 var index = grid.core.getVisibleRows().length-1;
               vm.serviceGrid.data.splice(index, 1);
                // grid.core.getVisibleRows().splice(index, 1);

                // console.log("grid.paginatio " , grid.pagination.nextPage());
                // vm.serviceGrid.data.paginationCurrentPage = grid.pagination.getTotalPages() ;
                vm.serviceGrid.paginationCurrentPage += 1;
                // grid.pagination.paginationCurrentPage = 6;
                console.log("vm.serviceGrid.data", vm.serviceGrid.data);
                console.log(" ALERT 2 rid.core.getVisibleRows()", grid.core.getVisibleRows());
                // $scope.getCurrentPage();
                $scope.getCurrentPageFilterNecessary();
            } else {
                console.log("not undefined");
                $scope.getCurrentPageFilterNecessary();
            }
            console.log(" (after add > size) <<<<<<");

        }
        if (grid.pagination.getPage() < grid.pagination.getTotalPages() && (grid.pagination.getLastRowIndex() - grid.pagination.getFirstRowIndex() +1) > vm.numberOfItemsOnPage && $scope.filterTerm != 'undefined')
        {
            console.log("call 1 next page (add > size)");
            // vm.currentPageNumber = grid.pagination.getTotalPages();
            vm.currentPageNumber += 1;
            $scope.getCurrentPageFilterNecessary();

        }
*/
        console.log("call 1 not a last", (grid.pagination.getPage() < grid.pagination.getTotalPages() && grid.core.getVisibleRows().length < vm.numberOfItemsOnPage));
        // if (grid.pagination.getPage() < grid.pagination.getTotalPages() && (grid.pagination.getLastRowIndex() - grid.pagination.getFirstRowIndex() +1) < vm.numberOfItemsOnPage && $scope.filterTerm == 'undefined') {
        if (grid.pagination.getPage() < grid.pagination.getTotalPages() && grid.core.getVisibleRows().length < vm.numberOfItemsOnPage) {
            console.log("$scope.getOnePartFromNextPage();---+++---+++");

            console.log("vm.serviceGrid.data ", vm.serviceGrid.data);
            console.log(" vm.rowOffset ", vm.rowOffset);

            $scope.getOnePartFromNextPage();
            vm.serviceGrid.totalItems--;
            // alert("change", vm.rowOffset.id);
            // vm.serviceGrid.data[vm.numberOfItemsOnPage]= vm.rowOffset;
            console.log(" vm.rowOffset after ", vm.rowOffset);
            console.log("vm.serviceGrid.data after ", vm.serviceGrid.data);

        }
        console.log("call 1 next page necessary delete (not a last page) <<<<<<<");
    }

    $scope.getCountSets = function () {
        // var url = "http://localhost:8887/api/part/min";
        var url = "/part/min";
        console.log("<<<<<<<<<< getCountSets");
        console.log("$rootScope.resultMessage 1", $rootScope.resultMessage);
        if ($rootScope.resultMessage == 'success') {
            $http.get(url, config, $scope)
                .then(function (response) {
                    $rootScope.resultMessage = response.data.result;

                    console.log("getCountSets response  ", response.data);
                    console.log("getCountSets $rootScope.resultMessage  ", $rootScope.resultMessage);
                    console.log("getMinNumberOfSet ", response.data);
                    if (response.data.result == "success") {
                        // $scope.operation = "Вычисление поля можно собрать компьютров";

                        // $rootScope.resultMessage = 'success';
                        $scope.addAlert("success","Вычисление поля можно собрать компьютров УСПЕШНО ");

                        console.log("$rootScope.resultMessage  ", $rootScope.resultMessage);
                        console.log("getMinNumberOfSet success numberOfItemsOnPage ", vm.numberOfItemsOnPage);
                        console.log("scope.min response.data.data; ", response.data.data);
                        $scope.min = response.data.data;
                    } else {
                        $scope.addAlert("warning", "Вычисление поля можно собрать компьютров" + "ОШИБКА КЛИЕНТА");

                        // $rootScope.resultMessage = response.data.error;
                    }
                }, function (response) {
                    $scope.addAlert("danger", "Вычисление поля можно собрать компьютров ОШИБКА СЕРВВЕРА");

                    // $rootScope.resultMessage = response.data.error;
                });

            // console.log("getCountSets timer tik ");
            console.log("$rootScope.resultMessage 2", $rootScope.resultMessage);
        } else {
            console.log("$rootScope.resultMessage 3", $rootScope.resultMessage);


        }

        /*$rootScope.resultMessage = "2 seconds";
        console.log("$rootScope.resultMessage 2", $rootScope.resultMessage);
        console.log("timer tak  ");*/
        console.log("$rootScope.resultMessage 4", $rootScope.resultMessage);

        console.log(">>>>>>>>> getCountSets");
        // var myVar = setInterval(myTimer ,1000);
    }

    $scope.searchTerm = "";
    $scope.filterTerm = "undefined";

    $scope.scopeFlagFilterNecessary = flagFilterNecessary;
    $scope.scopeDataFilterNecessary = dataFilterNecessary;

    $scope.filterReset = function () {
        $scope.filterTerm = "undefined";
        dataFilterNecessary = "undefined";
    }

    $scope.getCurrentPage = function () {
        console.log("<<<<< getCurrentPage");
        console.log("filterTerm 1", $scope.filterTerm);
        if ($scope.searchTerm == "") {
            if ($scope.filterTerm == "undefined") {
                var url = '/part/get?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/part/getcomponent?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        console.log(" url ", url);
        vm.necessary = $scope.filterTerm;
        // $rootScope.resultMessage = "";

        $http.get(url, config)
            .then(function (response) {

                console.log("<<<<<< getCurrentPage then  ", response.data);
                $rootScope.resultMessage = response.data.result;
                // $scope.addAlert(response.data.result, $rootScope.operation);
                // popup();
                if (response.data.result == "success") {
                    // $scope.operation = "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов УСПЕШНО";

                    $scope.addAlert("success", "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов УСПЕШНО");
                    $rootScope.resultMessage = 'success';

                    console.log("$rootScope.resultMessage ", $rootScope.resultMessage);
                    vm.serviceGrid.data = response.data.data.content;
                    vm.serviceGrid.totalItems = response.data.data.totalElements;
                    vm.currentPageNumber = response.data.data.number + 1;
                    vm.serviceGrid.paginationCurrentPage = vm.currentPageNumber;
                    if (response.data.data.last) {
                        console.log(" last page ", response.data.data.last);
                        vm.last = true;
                    } else {
                        vm.last = false;
                    }
                    console.log(" vm.serviceGrid", vm.serviceGrid);
                    console.log("response.data.data ", response.data.data);
                    // console.log("vm.serviceGrid.data  ", vm.serviceGrid);
                    // $scope.getCountSets();
                } else {
                    // $rootScope.resultMessage = response.data.error;
                    console.log(">>>>>> getCurrentPage then warn ", response.data);

                    $scope.addAlert("warning", "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов ОШИБКА КЛИЕНТА" + response.data.error);

                }
            }, function (response) {
                // $rootScope.resultMessage = response.data.error;
                console.log(">>>>>> getCurrentPage then false ", response.data);
                $scope.addAlert("warning", "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов ОШИБКА СЕРВЕРА" + response.data.error);
            });
        console.log(">>>>>>> getCurrentPage");

    };

    $scope.getOnePartFromNextPage = function () {
        console.log("<<<<<<< $scope.getOnePartFromNextPage");

        console.log("filterTerm 1", $scope.filterTerm);
        console.log("$scope.searchTerm 1", $scope.searchTerm);
        if ($scope.searchTerm == "") {
            if ($scope.filterTerm == "undefined") {
                var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        console.log(" url ", url);
        $http.get(url, config)
            .then(function (response) {
                console.log("getPartOffset then  ", response.data);
                $rootScope.resultMessage = response.data.result;

                if (response.data.result == "success") {
                    $scope.addAlert("success", "Чтение элемнта УСПЕШНО");

                    // vm.serviceGrid.totalItems = response.data.data.totalElements;
                    console.log("getPageOffset success ", response.data.data);
                    // vm.serviceGrid.data = response.data.data.content;
                    // row.entity = angular.extend(row.entity, vm.entity);
                    console.log("vm.serviceGrid.data before  ", vm.serviceGrid.data);
                    // vm.serviceGrid.data = angular.(vm.serviceGrid.data, response.data.data);
                    // vm.serviceGrid.data[vm.serviceGrid.data.length] = response.data.data;
                    vm.rowOffset = response.data.data;
                    // alert(vm.rowOffset.id);
                    vm.serviceGrid.data[vm.numberOfItemsOnPage] = vm.rowOffset;

                    console.log("vm.rowOffset after ", vm.rowOffset);
                    console.log("vm.serviceGrid.data after ", vm.serviceGrid.data);
                    // console.log(" value ", vm.serviceGrid.columnDefs[3].cellValue);
                    // vm.currentPageNumber = response.data.data.number + 1;
                    // vm.serviceGrid.paginationCurrentPage = vm.currentPageNumber;
                    console.log(">>>>>> $scope.getOnePartFromNextPage");
                } else {
                    $rootScope.resultMessage = response.data.error;
                    $scope.addAlert("warning", "Чтение элемнта ОШИБКА КЛИЕНТА");

                }
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
                $scope.addAlert("warning", "Чтение элемнта ОШИБКА СЕРВЕРА");

            });

    };

    /*$scope.filterGrid = function (value) {
        console.log(value);
        $scope.gridApi.grid.columns[3].filters[0].term = value;
    };*/
    $scope.getDeletePart = function (row) {
        var url = '/part/delete/' + row.entity.id;
        console.log("delete id", row.entity.id);
        console.log("vm.last 1", vm.last);
        /*
                if (!vm.last) {
                    $scope.getOnePartFromNextPage();
                    console.log("offsetRow ", vm.rowOffset);
                }*/

        // $scope.operation = "Удаление ";

        $http.get(url, config)
            .then(function (response) {
                // handleResult(result.value);
                // $rootScope.resultMessage = response.data.result;
                // $scope.addAlert(response.data.result, $rootScope.operation);
                console.log("delete then response.data", response.data);
                // console.log("delete then  response.data.resultMessage", response.data.resultMessage);
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {
                    $scope.addAlert("success", "Удаление УПЕШНО ");

                    console.log("delete success ", response.data);
                    console.log("vm.serviceGrid before ", vm.serviceGrid);

                    vm.serviceGrid.totalItems -= 1;
                    var index = vm.serviceGrid.data.indexOf(row.entity);
                    console.log("index ", index);
                    console.log(" vm.serviceGrid.data.length 1", vm.serviceGrid.data.length);
                    vm.serviceGrid.data.splice(index, 1);
                    console.log(" vm.serviceGrid.data.length 2", vm.serviceGrid.data.length);
                    var lastPage = Math.ceil(vm.serviceGrid.totalItems / vm.serviceGrid.paginationPageSize);
                    console.log("lastPage ", lastPage);
                    console.log("lvm.serviceGrid.paginationCurrentPage before ", vm.serviceGrid.paginationCurrentPage);
                    if (!vm.last) {
                        $scope.getOnePartFromNextPage();
                        console.log("vm.rowOffset", vm.rowOffset);
                        vm.serviceGrid.data[vm.numberOfItemsOnPage] = vm.rowOffset;
                    }
                    if (vm.serviceGrid.paginationCurrentPage == lastPage) {
                        vm.last = true;
                    }
                    if (vm.serviceGrid.paginationCurrentPage > lastPage) {
                        vm.serviceGrid.paginationCurrentPage--;
                    }
                    console.log("vm.last 2", vm.last);
                    console.log("lvm.serviceGrid.paginationCurrentPage after ", vm.serviceGrid.paginationCurrentPage);
                    console.log("lastPage after", lastPage);
                    // vm.serviceGrid.paginationCurrentPage = Math.ceil(vm.serviceGrid.totalItems / vm.serviceGrid.paginationPageSize);
                    console.log("delete catch  gridOptionsNumber ", vm.currentPageNumber, " index ", index);
                    console.log("cur page", vm.currentPageNumber, " item on page ", vm.numberOfItemsOnPage);
                    console.log("vm.serviceGrid after ", vm.serviceGrid);
                    console.log("vm.serviceGrid.totalItems", vm.serviceGrid.totalItems);
                    $scope.getCountSets();

                } else {
                    console.log("delete else resultMessage", response.data.resultMessage);
                    console.log("delete else", response.data.error);
                    console.log("delete else response 0", response.data);
                    // $rootScope.resultMessage = response.data.error;
                    $scope.addAlert("warning", "Удаление ОШИБКА КЛИЕНТА " + response.data.error);

                }
            }, function (response) {
                console.log("delete funtion response", response.data );
                // $rootScope.operation += response.data.error;
                console.log("delete funtion response 1", $scope.operation  );
                // $rootScope.resultMessage = "danger";
                $scope.addAlert("danger", "Удаление ОШИБКА СЕРВЕРА " + response.data.error);

            })
        // $scope.addAlert("danger", $rootScope.operation);
        // $scope.addAlert($rootScope.resultMessage, $rootScope.operation);
        console.log("delete funtion response 2", $rootScope.resultMessage, $scope.operation  );


    };

    $scope.addRow = function () {
        var newService = {
            "id": "0"
            /* "component": "publicФЫЙЦУЯ",
             "quantity": 2000,
             "necessary": 'true'*/
        };
        var rowTmp = {};
        rowTmp.entity = newService;
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm, $rootScope);
        console.log("add row ", newService, " service ", vm.serviceGrid);
        // getCurrentPage(currentPageNumber - 1, vm.numberOfItemsOnPage);
    };

    $scope.updateRow = function (row) {
        /*var newService = {
            "id": row.entity.id,
            "component": row.entity.component,
            "quantity": row.entity.quantity,
            "necessary": row.entity.necessary
        };*/
        var newService = row.entity;
        console.log("--------- updaterow >>>>>>>>>>>>>");
        console.log("updateRow row.entity ++++++++++++", row.entity);
        console.log("newService ++++++++++++", newService);

        var rowTmp = {};
        rowTmp.entity = newService;
        // vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.getOnePartFromNextPage());
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm, $rootScope);
        console.log("add row !!!!! ", newService, " service !!!!!!!!!!", vm.serviceGrid);
        console.log("============ updaterow <<<<<<<<<<<<<<");

        // $scope.getCurrentPage();
    };

}

RowEditor.$inject = ['$http', '$rootScope', '$modal'];

function RowEditor($http, $rootScope, $modal) {
    var service = {};
    service.editRow = editRow;

    function editRow(grid, row, filterTerm, searchTerm, rootScope) {
        $modal.open({
            templateUrl: '/js/edit-modal.html',
            controller: ['$http', '$modalInstance', 'PersonSchema', 'grid', 'row', 'filterTerm', 'searchTerm', 'rootScope', RowEditCtrl],
            controllerAs: 'vm',
            resolve: {
                grid: function () {
                    return grid;
                },
                row: function () {
                    return row;
                },
                filterTerm: function () {
                    return filterTerm;
                },
                searchTerm: function () {
                    return searchTerm;
                },
                rootScope: function () {
                    return rootScope;
                }

            }
        });
    }

    return service;
}


function RowEditCtrl($http, $modalInstance, PersonSchema, grid, row, filterTerm, searchTerm, $rootScope) {
    var vm = this;
    console.log("row.ENtity ", row.entity);
    console.log("grid ", grid);
    // console.log("grid.data.indexOf(row.entity) ", grid.data.indexOf(row.entity));
    vm.entity = angular.copy(row.entity);
    console.log("vm.entity before", vm.entity);
    console.log("RowEditCtrl vm.currentPageNumber", vm.currentPageNumber);

    vm.schema = PersonSchema;
    console.log("row.entity 1", row.entity);

    vm.entity = angular.copy(row.entity);
    vm.form = [
        'id',
        'component',
        'quantity',
        /* 'necessary',*/
        {
            key: "necessary",
            type: "select",
            titleMap: [
                {value: true, name: "Да"},
                {value: false, name: "Нет"}
            ]
        }
    ];

    vm.grid = grid;
    vm.row = row;

    console.log("vm.schema", vm.schema);
    console.log("vm.form", vm.form);
    console.log("vm.grid", vm.grid);
    console.log("vm.row", vm.row);

    vm.save = save;

    function save() {
        var urlAdd = "/part/add";
        var urlUpDate = "/part/update";
        console.log("rowEditCtrel add row.entity", row.entity);
        console.log("rowEditCtrel add vm.entity", vm.entity);
        // console.log("rowEditCtrel add vm.rowOffset", vm.rowOffset);
        console.log("rowEditCtrel add vm.currentPageNumber ", vm.currentPageNumber);
        console.log("rowEditCtrel add filterTerm", filterTerm);
        console.log("rowEditCtrel add searchTerm", searchTerm);

        console.log("vm.schema ", vm.schema);
        console.log("vm.entity ", vm.entity);
        console.log("row.entity ", row.entity);
        console.log("row.entity.component ", row.entity.component);
        console.log("row.entity.qu ", row.entity.quantity);
        // console.log("vm.form.$valid ", vm.form.$valid);
        // console.log("row.entity.$valid ", row.entity.$valid);
        console.log("if ", (( (!angular.isUndefined(vm.entity.component)) && (vm.entity.quantity ) )));
        console.log("if 1 ", !angular.isUndefined(vm.entity.component) );
        console.log("if 2 ", vm.entity.quantity  );

        if ( !angular.isUndefined(vm.entity.component) && vm.entity.quantity) {
            if (row.entity.id == '0') {

                row.entity = angular.extend(row.entity, vm.entity);
                // grid.data.push(row.entity);
                console.log("rowEditCtrel row.entity after", row.entity);
                console.log("grid data ", grid.data, " grid ", grid);
                console.log("grid data index", grid.data.indexOf(row.entity), " grid ", grid);
                var data = {
                    component: row.entity.component,
                    quantity: row.entity.quantity,
                    necessary: row.entity.necessary
                };
                console.log("data post ", data);

                /* var validate = jsen(schema);

                 validate({});

                 console.log("validate", validate);
                 console.log("validate.errors", validate.errors);*/

                /*
                            var Ajv = require('ajv');
                            var ajv = Ajv({allErrors: true});
                            // var valid = ajv.validate(userSchema, userData);
                            var valid = ajv.validate(vm.schema, row.entity);
                            if (valid) {
                                console.log('User data is valid');
                            } else {
                                console.log('User data is INVALID!');
                                console.log(ajv.errors);
                            }*/
                $http.post(urlAdd, data, config).then(function (response) {
                    $rootScope.resultMessage = response.data.result;
                    // $scope.operation = "Добавление "
                    if (response.data.result == "success") {
                        $rootScope.child.addAlert("success", "Добавление УПЕШНО ");
                        $rootScope.child.getCountSets();
                        console.log("----------- add >>>>>>>>>>>> ");
                        vm.totalItems = 1;


                        $modalInstance.close(row.entity);
                        console.log("$modalInstance ", $modalInstance);
                        // grid.paginationCurrentPage = Math.ceil(grid.totalItems / grid.paginationPageSize);

                        console.log("response.data.data.id ", response.data);
                        row.entity.id = response.data.data;

                        console.log(" dataFilterNecessary ", dataFilterNecessary);
                        console.log(" row.entity.necessary ", row.entity.necessary);
                        console.log(" edit filterTerm ", filterTerm);
                        console.log(" edit searchTerm ", searchTerm);
                        console.log(" edit searchTerm == row.entity.component ", searchTerm == row.entity.component);
                        console.log(" ((((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == \"\" ) ||\n" +
                            "                        (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase())))",
                            (((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == "" ) ||
                                (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase())))
                        );                 // console.log(" filterTerm ", filterTerm, "--- ",filterTerm);
                        // if (dataFilterNecessary == 'undefined') {
                        //     console.log(" flagFilterNecessary == true");
                        //
                        if (filterTerm == "true") {
                            filterTerm = true;
                        } else if (filterTerm == "false") {
                            filterTerm = false;
                        }
                        if (((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == "" ) ||
                            (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase()))) {

                            grid.data.push(row.entity);
                            grid.totalItems += 1;
                            if (grid.data.length > grid.paginationPageSize) {
                                grid.paginationCurrentPage = Math.ceil(grid.totalItems / grid.paginationPageSize);
                            }
                            console.log("  add in grid ", grid);
                        }
                        // }


                    } else {
                        $rootScope.resultMessage = response.data.error;
                        $rootScope.child.addAlert("waring", "Добавление ОШИБКА КЛИЕНТА " + response.data.error);

                    }
                    console.log("----------- add <<<<<<<<<<<<<<<<");
                }, function (response) {
                    $rootScope.resultMessage = response.data.error;
                    $rootScope.child.addAlert("danger", "Добавление ОШИБКА СЕРВЕРА " + response.data.error);

                });

                /*
                 * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
                 */
                console.log("rowEditCtrel row.entity ", row.entity);
                // grid.data.push(row.entity);

            } else {
                console.log("update id <> 0 ", row.entity);
                console.log(" update vm.entity before ", vm.entity, "row.entity ", row.entity);
                row.entity = angular.extend(row.entity, vm.entity);
                console.log(" update vm.entity after", vm.entity, "row.entity ", row.entity);
                var data = {};
                data = angular.copy(row.entity);
                // var dataFilter
                /*var data = {
                    id: row.entity.id,
                    component: row.entity.component,
                    quantity: row.entity.quantity,
                    necessary: row.entity.necessary
                };*/
                /*
                 * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
                 */
                $http.post(urlUpDate, data, config).then(function (response) {

                    $rootScope.resultMessage = response.data.result;
                    if (response.data.result == "success") {
                        $rootScope.child.addAlert("success", "Обновление УПЕШНО ");
                        vm.totalItems = 1;
                        $modalInstance.close(row.entity);
                        console.log("----------- update >>>>>>>>>>>>>>>>>>>>>>>");
                        console.log("$rootScope", $rootScope);
                        console.log("$rootScope $$ChildScope", $rootScope.$$ChildScope);
                        console.log("$rootScope $$scope ", $rootScope.child);
                        $rootScope.child.getCountSets();
                        // $rootScope.getNubmberOfElements();
                        // console.log(" grid before ", grid);
                        // console.log(" dataFilterNecessary ", dataFilterNecessary);
                        // console.log(" flagFilterNecessary ", flagFilterNecessary);
                        // console.log(" row.entity.necessary ", row.entity.necessary);
                        /*if (flagSearchComponent) {

                        } else {*/
                        console.log(" row.entity.necessary ", row.entity.necessary);
                        console.log(" edit filterTerm ", filterTerm);
                        console.log(" if update ", (((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == "" ) ||
                            (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase()))));
                        // if (filterTerm == row.entity.necessary || filterTerm == 'undefined') {
                        if (((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == "" ) ||
                            (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase()))) {
                            grid.data[grid.data.indexOf(row.entity)] = angular.copy(row.entity);
                            console.log("  stay in grid ", grid);

                        } else {

                            var index = grid.data.indexOf(row.entity);
                            grid.data.splice(index, 1);
                            // grid.totalItems -= 1;
                            console.log(" delete from grid ", grid);

                        }
                    } else {
                        $rootScope.resultMessage = response.data.error;
                        $scope.addAlert("waring", "Обновление ОШИБКА КЛИЕНТА " + response.data.error);

                    }
                    console.log("----------- update <<<<<<<<<<<<<<<<<<<<<<<<< ");

                }, function (response) {
                    $rootScope.resultMessage = response.data.error;
                    $rootScope.child.addAlert("waring", "Обновление ОШИБКА СЕРВЕРА " + response.data.error);

                });
                console.log("vm.form.$valid ", vm.form.$valid);

                // $modalInstance.close(row.entity);
            }
    }

        vm.remove = remove;

        function remove() {
            console.dir(row)
            if (row.entity.id != '0') {
                row.entity = angular.extend(row.entity, vm.entity);
                var index = grid.appScope.vm.serviceGrid.data.indexOf(row.entity);
                grid.appScope.vm.serviceGrid.data.splice(index, 1);
                /*
                 * $http.delete('http://localhost:8080/service/delete/'+row.entity.id).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot delete row (error in console)'); console.dir(response); });
                 */
            }
            $modalInstance.close(row.entity);
        }

    }
}
