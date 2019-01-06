//02.01.2019
var app = angular.module('influx', ['ngTouch', 'ngAnimate', 'ui.grid', 'ui.grid.pinning', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.bootstrap', 'ui.grid.edit', 'ui.grid.pagination', 'schemaForm'])
    .constant('PersonSchema', {
        type: 'object',
        properties: {
            id: {type: 'string', editable: false, title: 'ID', "default": "0", nullable: false, "readOnly": true},
            component: {
                type: 'string', title: 'Component', "default": "Franc", "minLength": 1, "maxLength": 100,
                "validationMessage": "Don't be greedy!"
            },
            quantity: {
                type: 'number', title: 'Quantity', "default": 25, "minimum": 0, "maximum": 9999, validation: {
                    required: true,
                    customRule: function (input) {
                        alert('bad data');
                    }
                }
            },

            /*   necessary: { type: 'string', title: 'Necessary', "default": true },*/
            necessary: {
                title: "Необходимость",
                type: 'boolean',
                "default": true
            }
        }

    })

app.controller('MainCtrl', MainCtrl);
app.controller('RowEditCtrl', RowEditCtrl);
app.service('RowEditor', RowEditor);

var config = {
    headers: {
        'Content-Type': 'application/json; charset=utf-8'
    }
}

var flagFilterNecessary = false;

var dataFilterNecessary = "undefined";

var flagSearchComponent = false;

MainCtrl.$inject = ['$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants', '$rootScope'];

function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $rootScope) {
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
    var urlGetNumberOfParts = '/api/part/number';
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
            "<button ng-click='grid.appScope.addRow()' > Add Part </button> <span  class=\"ui-grid-cell-contents\">{{grid.appScope.filterTerm}} {{grid.appScope.vm.resultMessage}}</span>",
        /*rowTemplate : "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"*/
        // rowTemlate : "ng-class='ui-grid-row-header-cell' "
    };

    vm.serviceGrid.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        console.log("onRegisterApi  ", vm.serviceGrid.totalItems);
        getNubmberOfElements();

        $scope.getCurrentPage();

        $scope.getMinQuantityWithNecessaryParts();
        // gridApi.core.refresh();
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
            cellTooltip: function (row) {
                return row.entity.title;
            },
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
            enableFiltering: false
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
    var myFunction = function () {
        // alert("!!")
    };
    var getNubmberOfElements = function () {
        $http.get(urlGetNumberOfParts, config, $scope)
            .then(function (response) {
                console.log("getNumberOfElements ", response.data);
                if (response.data.result == "success") {
                    console.log("getNumberOfParts success ", response.data.data);
                    console.log("getNumberOfParts success numberOfItemsOnPage ", vm.numberOfItemsOnPage);
                    // console.log("getNumberOfParts success totalItems ", vm.totalItems);
                    // vm.totalItems = response.data.data;
                    vm.serviceGrid.totalItems = response.data.data;
                } else {
                    $rootScope.resultMessage = response.data.error;
                }
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
            });
    }
    // $scope.filterterm = true;
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

    $scope.getMinQuantityWithNecessaryParts = function () {
        var url = "http://localhost:8887/api/parts/min";
        console.log("<<<<<<<<<< getMinQuantityWithNecessaryParts");
        console.log("$rootScope.resultMessage 1", $rootScope.resultMessage);
        // $rootScope.resultMessage = "";
        if ($rootScope.resultMessage == 'success') {
            $http.get(url, config, $scope)
                .then(function (response) {
                    $rootScope.operation = "Вычисление ";
                    $rootScope.resultMessage = response.data.result;
                    console.log("response  ", response.data);
                    console.log("$rootScope.resultMessage  ", $rootScope.resultMessage);
                    console.log("getMinNumberOfSet ", response.data);
                    if (response.data.result == "success") {
                        console.log("$rootScope.resultMessage  ", $rootScope.resultMessage);
                        console.log("getMinNumberOfSet success numberOfItemsOnPage ", vm.numberOfItemsOnPage);
                        console.log("scope.min response.data.data; ", response.data.data);
                        $scope.min = response.data.data;
                    } else {
                        $rootScope.resultMessage = response.data.error;
                    }
                }, function (response) {
                    $rootScope.resultMessage = response.data.error;
                });

            // console.log("getMinQuantityWithNecessaryParts timer tik ");
            console.log("$rootScope.resultMessage 2", $rootScope.resultMessage);
        } else {
            console.log("$rootScope.resultMessage 3", $rootScope.resultMessage);


        }

        /*$rootScope.resultMessage = "2 seconds";
        console.log("$rootScope.resultMessage 2", $rootScope.resultMessage);
        console.log("timer tak  ");*/
        console.log("$rootScope.resultMessage 4", $rootScope.resultMessage);

        console.log(">>>>>>>>> getMinQuantityWithNecessaryParts");
        // var myVar = setInterval(myTimer ,1000);
    }

    var sleep = function (milliseconds) {
        var start = new Date().getTime();
        for (var i = 0; i < 1e7; i++) {
            if ((new Date().getTime() - start) > milliseconds) {
                break;
            }
        }
    }

    $scope.clearResult = function () {
        console.log("<<<<<<< clearResult tik");
        setTimeout(myTimeout1, 2000);

        function myTimeout1() {
            sleep(2000);
            $rootScope.resultMessage = "2 seconds";
            console.log("clearResult$rootScope.resultMessage 2", $rootScope.resultMessage);
            console.log("clearResult myTimeout timer tak  ");
        }

        // setTimeout( $rootScope.resultMessage = "2 seconds", 2000);
        console.log(">>>>>>> clearResult tak");

        // if (grid)
    }

    var setResult = function (result) {
        console.log("<<<<<<< clearResult tik");
        setTimeout(myTimeout1, 6000);

        function myTimeout1() {
            sleep(1000);
            // $rootScope.resultMessage = "2 seconds";
            console.log("setResult$rootScope.resultMessage 1", $rootScope.resultMessage);
            $rootScope.resultMessage = result;
            console.log("setResult$rootScope.resultMessage 2", $rootScope.resultMessage);
            console.log("setResult myTimeout timer tak  ");
        }

        // setTimeout( $rootScope.resultMessage = "2 seconds", 2000);
        console.log(">>>>>>> clearResult tak");

        // if (grid)
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
                var url = '/api/part/get?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/api/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/api/part/getcomponent?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        console.log(" url ", url);
        vm.necessary = $scope.filterTerm;
        // $rootScope.resultMessage = "";
        $rootScope.operation = "Чтение страницы" + vm.currentPageNumber;

        $http.get(url, config)
            .then(function (response) {
                console.log("<<<<<< getCurrentPage then  ", response.data);
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {
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
                    // $scope.getMinQuantityWithNecessaryParts();
                } else {
                    $rootScope.resultMessage = response.data.error;
                }
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
                console.log(">>>>>> getCurrentPage then  ", response.data);

            });
        console.log(">>>>>>> getCurrentPage");

    };

    $scope.getOnePartFromNextPage = function () {
        console.log("<<<<<<< $scope.getOnePartFromNextPage");

        console.log("filterTerm 1", $scope.filterTerm);
        console.log("$scope.searchTerm 1", $scope.searchTerm);
        if ($scope.searchTerm == "") {
            if ($scope.filterTerm == "undefined") {
                var url = '/api/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/api/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/api/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        // if ($scope.filterTerm == "undefined") {
        //     var url = '/api/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
        // } else {
        //     var url = '/api/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
        // }
        console.log(" url ", url);
        $http.get(url, config)
            .then(function (response) {
                console.log("getPartOffset then  ", response.data);

                if (response.data.result == "success") {
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
                }
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
            });

    };

    /*$scope.filterGrid = function (value) {
        console.log(value);
        $scope.gridApi.grid.columns[3].filters[0].term = value;
    };*/
    $scope.getDeletePart = function (row) {
        var url = '/api/part/delete1/' + row.entity.id;
        console.log("delete id", row.entity.id);
        console.log("vm.last 1", vm.last);
        /*
                if (!vm.last) {
                    $scope.getOnePartFromNextPage();
                    console.log("offsetRow ", vm.rowOffset);
                }*/


        $http.get(url, config)
            .then(function (response) {
                // handleResult(result.value);
                $rootScope.operation = "Удаление ";
                console.log("delete then response.data", response.data);
                console.log("delete then  response.data.resultMessage", response.data.resultMessage);
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {

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
                    $scope.getMinQuantityWithNecessaryParts();

                } else {
                    console.log("delete else resultMessage", response.data.resultMessage);
                    console.log("delete else", response.data.error);
                    console.log("delete else response", response.data);
                    $rootScope.resultMessage = response.data.error;
                }
            }, function (response) {
                console.log("delete funtion response");
                $rootScope.resultMessage = response.data.error;
            })
    };

    $scope.getCurrentPageFilterComponent = function () {

        // flagFilterNecessary = true;
        // if ($scope.filterTerm == "true") {
        //     $scope.filterTerm = true;
        // } else if ($scope.filterTerm == "false") {
        //     $scope.filterTerm = false;
        // }
        // } else dataFilterNecessary = "undefined";
        // dataFilterNecessary = $scope.filterTerm;
        // $scope.filterTerm = "undefined";
        // $scope.dataFilterNecessary = dataFilterNecessary;
        $scope.filterTerm = "undefined";


        console.log("-------- getCurrentPageFilterComponent >>>>>>>>>>>");
        console.log(" dataFilterNecessary ", dataFilterNecessary);
        console.log(" flagFilterNecessary ", flagFilterNecessary);
        console.log(" $scope.filterTerm ", $scope.searchTerm);
        // if (dataFilterNecessary != $scope.filterTerm) {
        //
        //     console.log(" necessary 1 ", dataFilterNecessary);
        //
        //     // if (dataFilterNecessary == "false" || dataFilterNecessary == "undefined") {
        //
        //     vm.currentPageNumber = 1;
        //
        //     // console.log(" necessary 1  dataFilterNecessary=undefined ", dataFilterNecessary);
        //     // }
        // }
        // dataFilterNecessary = $scope.filterTerm;
        // console.log(" dataFilterNecessary after ", dataFilterNecessary);
        // console.log(" vm.currentPageNumber after ", vm.currentPageNumber);


        var url = '/api/part/getcomponent?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;

        $http.get(url, config)
            .then(function (response) {
                console.log("getCurrentPageFilterPage then  ", response.data);
                console.log("-------- getCurrentPageFilterNecessary get >>>>>>>>>>>");
                if (response.data.result == "success") {
                    vm.serviceGrid.totalItems = response.data.data.totalElements;
                    vm.currentPageNumber = response.data.data.number + 1;
                    console.log("response.data.data.number ", response.data.data.number);
                    vm.serviceGrid.paginationCurrentPage = vm.currentPageNumber;
                    // vm.serviceGrid.paginationCurrentPage = response.data.data.number;
                    console.log("getPage filter necessary success ", response.data.data.content);
                    vm.serviceGrid.data = response.data.data.content;

                    console.log("vm.serviceGrid.data necessary after ", vm.serviceGrid.data);
                    // console.log("flagFilterNecessary before ", flagFilterNecessary);
                    // console.log("flagFilterNecessary after ", flagFilterNecessary);

                } else {
                    $rootScope.resultMessage = response.data.error;
                }
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
                // console.log("dataFilterNecessary  ", dataFilterNecessary);
                // console.log("vm.serviceGrid  ", vm.serviceGrid);
                console.log("vm.serviceGrid paginationCurrentPage ", vm.serviceGrid.paginationCurrentPage);

                console.log("=========== getCurrentPageFilterComponent get<<<<<<<<<");
            });
        console.log("=========== getCurrentPageFilterComponent <<<<<<<<<");

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
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm);
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
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm);
        console.log("add row !!!!! ", newService, " service !!!!!!!!!!", vm.serviceGrid);
        console.log("============ updaterow <<<<<<<<<<<<<<");

        // $scope.getCurrentPage();
    };

}

RowEditor.$inject = ['$http', '$rootScope', '$modal'];

function RowEditor($http, $rootScope, $modal) {
    var service = {};
    service.editRow = editRow;

    function editRow(grid, row, filterTerm, searchTerm) {
        $modal.open({
            templateUrl: '/js/edit-modal.html',
            controller: ['$http', '$modalInstance', 'PersonSchema', 'grid', 'row', 'filterTerm', 'searchTerm', RowEditCtrl],
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
                }

            }
        });
    }

    return service;
}


function RowEditCtrl($http, $modalInstance, PersonSchema, grid, row, filterTerm, searchTerm) {
    var vm = this;
    console.log("row.ENtity ", row.entity);
    console.log("grid ", grid);
    // console.log("grid.data.indexOf(row.entity) ", grid.data.indexOf(row.entity));
    vm.entity = angular.copy(row.entity);
    console.log("vm.entity before", vm.entity);
    console.log("RowEditCtrl vm.currentPageNumber", vm.currentPageNumber);

    vm.schema = PersonSchema;
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

    vm.save = save;

    function save() {
        var urlAdd = "/api/part/add";
        var urlUpDate = "/api/part/update";
        console.log("rowEditCtrel add row.entity", row.entity);
        console.log("rowEditCtrel add vm.entity", vm.entity);
        // console.log("rowEditCtrel add vm.rowOffset", vm.rowOffset);
        console.log("rowEditCtrel add vm.currentPageNumber ", vm.currentPageNumber);
        console.log("rowEditCtrel add filterTerm", filterTerm);
        console.log("rowEditCtrel add searchTerm", searchTerm);
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
            $http.post(urlAdd, data, config).then(function (response) {
                if (response.data.result == "success") {
                    console.log("----------- add >>>>>>>>>>>> ");
                    $rootScope.resultMessage = response.data.result;
                    vm.totalItems = 1;
                    $modalInstance.close(row.entity);
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

                        // grid.modifyRows(dataTemp);
                        console.log("  add in grid ", grid);
                    }
                    // }


                } else {
                    $rootScope.resultMessage = response.data.error;
                }
                console.log("----------- add <<<<<<<<<<<<<<<<");
            }, function (response) {
                $rootScope.resultMessage = response.data.error;
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
                if (response.data.result == "success") {
                    $rootScope.resultMessage = response.data.result;
                    vm.totalItems = 1;
                    $modalInstance.close(row.entity);
                    console.log("----------- update >>>>>>>>>>>>>>>>>>>>>>>");
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
                }
                console.log("----------- update <<<<<<<<<<<<<<<<<<<<<<<<< ");

            }, function (response) {
                $rootScope.resultMessage = response.data.error;
            });
            $modalInstance.close(row.entity);
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
