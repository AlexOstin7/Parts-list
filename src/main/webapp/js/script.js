var app = angular.module('influx', ['ngTouch', 'ngAnimate', 'ui.grid', 'ui.grid.pinning', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.bootstrap', 'ui.grid.edit', 'ui.grid.pagination', 'schemaForm'])
    .constant('PersonSchema', {
        type: 'object',
        properties: {
            id: {type: 'string', editable: false, title: 'ID', "default": "0", nullable: false, "readOnly": true},
            component: {
                type: 'string', title: 'Component', "default": "San FranciscoЙЦФЫ", "minLength": 3, "maxLength": 10,
                "validationMessage": "Don't be greedy!"
            },
            quantity: {
                type: 'number', title: 'Quantity', "default": 25, "minimum": 0, "maximum": 99, validation: {
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

MainCtrl.$inject = ['$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants', '$interval'];

function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $log) {
    var vm = this;
    vm.resultMessage;
    // flagFilterNecessary = false;

    vm.editRow = RowEditor.editRow;
    vm.numberOfItemsOnPage = 10;
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
            "<button ng-click='grid.appScope.addRow()' > Add Part </button>"
        /*rowTemplate : "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"*/
        /*rowTemlate : "ng-class='ui-grid-row-header-cell'"*/
    };

    vm.serviceGrid.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        console.log("onRegisterApi  ", vm.serviceGrid.totalItems);
        getNubmberOfElements();

            $scope.getCurrentPage();

        // getNubmberOfElements();

        // gridApi.core.refresh();
        console.log(" gridApi ", gridApi);
        console.log(" gridApi current page ", gridApi.pagination.getPage());

        $scope.gridApi.core.on.rowsVisibleChanged(null,  myFunction2);
        /*gridApi.core.notifyDataChange(uiGridConstants.dataChange.EDIT) ;
        $scope.gridApi.core.on.rowsRendered( $scope, myFunction );*/
        /*{
            console.log(" gridApi.selection.on.rowSelectionChanged($scope,function(row)" );
            alert(' !');
            var msg = 'row selected ' + row.isSelected;
            $log.log(msg);
        };*/
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            // alert("Hello! I am an alert box!");
            vm.currentPageNumber = newPage;
            vm.numberOfItemsOnPage = pageSize;
            console.log("flagFilterNecessary ", flagFilterNecessary);
            console.log("dataFilterNecessary ", dataFilterNecessary);
            if ($scope.filterTerm == 'undefined') {
                console.log(" getCurrentPage ");
                $scope.getCurrentPage();

            } else {
                // $scope.getCurrentPage(vm.currentPageNumber - 1, vm.numberOfItemsOnPage);
                console.log(" getCurrentPage Filter nec");
                $scope.getCurrentPageFilterNecessary(dataFilterNecessary);
            }

            console.log("getNumberOfParts paginationChanged vm.serviceGrid.pageSize ", pageSize);
            // console.log("getNumberOfParts paginationChanged vm.serviceGrid.totalItems ", vm.serviceGrid.totalItems);
            console.log("getNumberOfParts paginationChanged vm.serviceGrid.numberOfItemsOnPage ", vm.numberOfItemsOnPage);
            console.log(" gridApi Pagination changed current page ", gridApi.pagination.getPage());
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
        {name: 'id', displayName: "ID", width: '10%', enableCellEdit: false, enableFiltering: false},
        {
            name: 'component',
            displayName: "Наименование",
            width: '50%',
            enableCellEdit: false,
            type: 'string',
            enableFiltering: false,
            cellTooltip: function (row) {
                return row.entity.title;
            },
            cellTemplate: '<div  style="text-align:left" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
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
            ' ng-click="grid.appScope.getDeletePart(row,newPage, pageSize)">' +
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

    /*$scope.searchGrid = function(searchTerm){
        $scope.gridApi.grid.columns[3].filters[0] = { term: searchTerm };
        console.log("searchTerm ", searchTerm);
        console.log("$scope.gridApi.grid.columns[3].filters[0] ", $scope.gridApi.grid.columns[3].filters[0])
    }*/
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
                }
            });
    }
    // $scope.filterterm = true;
    var myFunction2 = function( grid) {
        console.log(" ALERT 2", grid);
        // console.log(" ALERT 2 core ", grid.core);
        // // console.log(" ALERT 2", grid.core.refreshRows());
        // console.log(" ALERT 2", grid.core.getVisibleRows());
        // console.log(" ALERT 2", grid.core.getVisibleRows().length);
        // console.log(" ALERT 2 pagination ", grid.pagination);
        // console.log(" ALERT 2 pagination total page ", grid.pagination.getTotalPages());
        // console.log(" ALERT 2 pagination getPage", grid.pagination.getPage());
        // // console.log(" ALERT 2 pagination ", grid.pagination.nextPage());
        // console.log(" ALERT 2 pagination first row ", grid.pagination.getFirstRowIndex());
        // console.log(" ALERT 2 pagination last row ", grid.pagination.getLastRowIndex());
        // console.log(" call  ", (grid.pagination.getPage() < grid.pagination.getTotalPages() &&  grid.core.getVisibleRows().length < 10));
        // console.log(" vm.numberOfItemsOnPage  ", vm.numberOfItemsOnPage);
        if(grid.pagination.getPage() < grid.pagination.getTotalPages() &&  grid.core.getVisibleRows().length < vm.numberOfItemsOnPage) {
            $scope.getCurrentPageFilterNecessary();
}
    }

    $scope.filterTerm = "undefined";

    $scope.scopeFlagFilterNecessary = flagFilterNecessary;
    $scope.scopeDataFilterNecessary = dataFilterNecessary;

    $scope.filterReset = function () {
        $scope.filterTerm = "undefined";
        dataFilterNecessary = "undefined";
    }

    // $scope.getCurrentPage = function (newPage, pageSize) {
    $scope.getCurrentPage = function () {
        // var url = '/api/part/get?page=' + newPage + '&size=' + pageSize;
        flagFilterNecessary = false;
        $scope.filterTerm = "undefined";
        dataFilterNecessary = "undefined";

        var url = '/api/part/get?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
        $http.get(url, config)
            .then(function (response) {
                console.log("getCurrentPage then  ", response.data);

                if (response.data.result == "success") {
                    vm.serviceGrid.totalItems = response.data.data.totalElements;
                    console.log("getPage success ", response.data.data);
                    vm.serviceGrid.data = response.data.data.content;
                    console.log("vm.serviceGrid.data  ", vm.serviceGrid);
                    // console.log(" value ", vm.serviceGrid.columnDefs[3].cellValue);
                }
            });

    };

    $scope.getCurrentPageFilterNecessary = function () {
        // vm.currentPageNumber - 1, vm.numberOfItemsOnPage
        flagFilterNecessary = true;
         if ($scope.filterTerm == "true") {
             $scope.filterTerm = true;
        } else if ($scope.filterTerm == "false") {
             $scope.filterTerm = false;
         }
        // } else dataFilterNecessary = "undefined";
        // dataFilterNecessary = $scope.filterTerm;
        // $scope.filterTerm = "undefined";
        $scope.dataFilterNecessary = dataFilterNecessary;

        console.log("-------- getCurrentPageFilterNecessary >>>>>>>>>>>");
        console.log(" dataFilterNecessary ", dataFilterNecessary);
        console.log(" flagFilterNecessary ", flagFilterNecessary);
        console.log(" $scope.filterTerm ", $scope.filterTerm);
        if (dataFilterNecessary != $scope.filterTerm) {

            console.log(" necessary 1 ", dataFilterNecessary);

            // if (dataFilterNecessary == "false" || dataFilterNecessary == "undefined") {

            vm.currentPageNumber = 1;

            // console.log(" necessary 1  dataFilterNecessary=undefined ", dataFilterNecessary);
            // }
        }
        dataFilterNecessary = $scope.filterTerm;
        /*if ($scope.filterTerm == "true") {
            dataFilterNecessary = true;
        } else if ($scope.filterTerm == "false") {
            dataFilterNecessary = false;
        } else if ($scope.filterTerm == "undefined") {
            dataFilterNecessary = "undefined";
        }*/

        /*if (necessary == "false") {

            console.log(" necessary 0 ", dataFilterNecessary);

            if (dataFilterNecessary == "true" || dataFilterNecessary == "undefined") {

                vm.currentPageNumber = 1;
                console.log(" necessary 0  dataFilterNecessary= undefinded ", dataFilterNecessary);
            }
            dataFilterNecessary = false;

            console.log(" necessary 0  dataFilterNecessary after ", dataFilterNecessary);

        }*/
        console.log(" dataFilterNecessary after ", dataFilterNecessary);
        console.log(" vm.currentPageNumber after ", vm.currentPageNumber);


        var url = '/api/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + dataFilterNecessary;

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
                    console.log("flagFilterNecessary before ", flagFilterNecessary);
                    console.log("flagFilterNecessary after ", flagFilterNecessary);

                }
                console.log("dataFilterNecessary  ", dataFilterNecessary);
                // console.log("vm.serviceGrid  ", vm.serviceGrid);
                console.log("vm.serviceGrid paginationCurrentPage ", vm.serviceGrid.paginationCurrentPage);

                console.log("=========== getCurrentPageFilterNecessary get<<<<<<<<<");
            });
        console.log("=========== getCurrentPageFilterNecessary <<<<<<<<<");

    };
    /*$scope.filterGrid = function (value) {
        console.log(value);
        $scope.gridApi.grid.columns[3].filters[0].term = value;
    };*/
    $scope.getDeletePart = function (row, newPage, pageSize) {
        var url = '/api/part/delete/' + row.entity.id;
        console.log("delete id", row.entity.id);
        console.log("newPage ", newPage, " pageSize ", pageSize);
        $http.get(url, config)
            .then(function (response) {
                // handleResult(result.value);
                console.log("delete then ", response.data);

                if (response.data.result == "success") {
                    console.log("delete success ", response.data);
                    var index = vm.serviceGrid.data.indexOf(row.entity);
                    console.log("delete catch  gridOptionsNumber ", vm.currentPageNumber, " index ", index);
                    // $scope.gridOptions.data.splice(index, 1);
                    console.log("cur page", vm.currentPageNumber, " item on page ", vm.numberOfItemsOnPage);
                    console.log("newPage ", newPage, " pageSize ", pageSize);
                    if (dataFilterNecessary == "undefined") {
                        console.log("delete $scope.getCurrentPage(); ")
                        $scope.getCurrentPage();
                    } else {
                        console.log("delete  $scope.getCurrentPageFilterNecessary; ")

                        $scope.getCurrentPageFilterNecessary();
                    }
                    // $scope.getCurrentPage();
                    //  getCurrentPage(newPage, pageSize);
                    // getNubmberOfElements();
                    console.log("vm.serviceGrid.totalItems", vm.serviceGrid.totalItems);
                    vm.serviceGrid.totalItems -= 1;
                    console.log("(row.entity) ", row.entity);

                    // $scope.gridOptions.data = response.data.data.content;
                }
            }).catch(function () {
            console.log("catch data ", vm.serviceGrid.data);
        });
    };
// $http.get('/js/dataPartJson').success(function(response) {
    /*$http.get('/api/parts').success(function(response) {
        console.log(" get all parts", response.data)
         vm.serviceGrid.data = response.data;
        getNubmberOfElements();
    });*/

    $scope.addRow = function () {
        var newService = {
            "id": "0"
            /* "component": "publicФЫЙЦУЯ",
             "quantity": 2000,
             "necessary": 'true'*/
        };
        var rowTmp = {};
        rowTmp.entity = newService;
        vm.editRow(vm.serviceGrid, rowTmp);
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
        console.log("add row row.entity ++++++++++++", row.entity);
        console.log("newService ++++++++++++", newService);

        var rowTmp = {};
        rowTmp.entity = newService;
        vm.editRow(vm.serviceGrid, rowTmp);
        console.log("add row !!!!! ", newService, " service !!!!!!!!!!", vm.serviceGrid);
        // console.log(" service !!!!!!!!!! vm ", vm);
        // console.log("$scope.gridApi.core.getVisibleRows($scope.gridApi.grid) ", $scope.gridApi.core.getVisibleRows($scope.gridApi.grid));
        // console.log(" dataFilter ", $scope.gridApi);

        /*$scope.gridApi.core.notifyDataChange( uiGridConstants.dataChange.ALL)  ;
        $scope.gridApi.core.refresh();*/
        /* if (vm.flagFilterNecessary == true) {
             console.log(" getCurrentPage Filter nec");

             $scope.getCurrentPageFilterNecessary(dataFilterNecessary);
         } else {
             // $scope.getCurrentPage(vm.currentPageNumber - 1, vm.numberOfItemsOnPage);
             console.log(" getCurrentPage ");
             $scope.getCurrentPage();
         }*/
        console.log("============ updaterow <<<<<<<<<<<<<<");

        // $scope.getCurrentPage();
    };

}

RowEditor.$inject = ['$http', '$rootScope', '$modal'];

function RowEditor($http, $rootScope, $modal) {
    var service = {};
    service.editRow = editRow;

// console.log("editRow  ", editRow)
    /*function editRow(grid, row) {
        console.log("ediRow row.entity ", row.entity);
        console.log("grid ", grid);
        $modal.open({
            templateUrl: '/js/service-edit.html',
            controller: ['$http', '$modalInstance', 'grid', 'row', RowEditCtrl],
            controllerAs: 'vm',
            resolve: {
                grid: function () {
                    return grid;
                },
                row: function () {
                    return row;
                }
            }
        });
    }*/

    function editRow(grid, row) {
        $modal.open({
            templateUrl: '/js/edit-modal.html',
            controller: ['$http', '$modalInstance', 'PersonSchema', 'grid', 'row', RowEditCtrl],
            controllerAs: 'vm',
            resolve: {
                grid: function () {
                    return grid;
                },
                row: function () {
                    return row;
                }
            }
        });
    }

    return service;
}


function RowEditCtrl($http, $modalInstance, PersonSchema, grid, row) {
    var vm = this;
    console.log("row.ENtity ", row.entity);
    console.log("grid ", grid);
    // console.log("grid.data.indexOf(row.entity) ", grid.data.indexOf(row.entity));
    vm.entity = angular.copy(row.entity);
    console.log("vm.entity before", vm.entity);
    console.log("vm.entity after", vm.entity);

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
        if (row.entity.id == '0') {
            console.log("rowEditCtrel add row.entity", row.entity);
            console.log("rowEditCtrel add vm.entity", vm.entity);
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
                    vm.resultMessage = response.data.result;
                    vm.totalItems = 1;
                    $modalInstance.close(row.entity);
                    grid.paginationCurrentPage = Math.ceil(grid.totalItems / grid.paginationPageSize);

                    console.log("response.data.data.id ", response.data);
                    row.entity.id = response.data.data;

                    console.log(" dataFilterNecessary ", dataFilterNecessary);
                    console.log(" row.entity.necessary ", row.entity.necessary);
                    // if (dataFilterNecessary == 'undefined') {
                    //     console.log(" flagFilterNecessary == true");
                    //

                    if (dataFilterNecessary == "undefined" || dataFilterNecessary == row.entity.necessary) {
                        grid.data.push(row.entity);
                        grid.totalItems += 1;
                        console.log("  add in grid ", grid);
                    }
                    // }


                } else {
                    vm.resultMessage = response.data.error;
                }

                console.log("----------- add <<<<<<<<<<<<<<<<");
            }, function (response) {
                vm.resultMessage = response.data.error;
            });

            /*
             * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
             */
            console.log("rowEditCtrel row.entity push ", row.entity);
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
                    vm.resultMessage = response.data.result;
                    vm.totalItems = 1;
                    $modalInstance.close(row.entity);
                    console.log("----------- update >>>>>>>>>>>>>>>>>>>>>>>");
                    // console.log(" grid before ", grid);
                    console.log(" dataFilterNecessary ", dataFilterNecessary);
                    console.log(" flagFilterNecessary ", flagFilterNecessary);
                    console.log(" row.entity.necessary ", row.entity.necessary);

                    if (dataFilterNecessary == 'undefined' || dataFilterNecessary == row.entity.necessary) {
                        grid.data[grid.data.indexOf(row.entity)] = angular.copy(row.entity);
                        console.log("  stay in grid ", grid);

                    } else {

                        var index = grid.data.indexOf(row.entity);
                        grid.data.splice(index, 1);
                        grid.totalItems -= 1;
                        console.log(" delete from grid ", grid);

                    }
                    // console.log(" grid after ", grid);
                    // gridApi.core.refresh();

                } else {
                    vm.resultMessage = response.data.error;
                }
                console.log("----------- update <<<<<<<<<<<<<<<<<<<<<<<<< ");

            }, function (response) {
                vm.resultMessage = response.data.error;
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
