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

MainCtrl.$inject = ['$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants', '$interval'];

function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $interval) {
    var vm = this;
    vm.resultMessage;
    vm.filterNecessary = false;
    vm.editRow = RowEditor.editRow;
    vm.numberOfItemsOnPage = 10;
    vm.size = 10;
    var urlGetNumberOfParts = '/api/part/number';
    // var totalItems = 0;
    vm.currentPageNumber = 1;
    // var totalPage = Math.ceil(vm.serviceGrid.totalItems / numberOfItemsOnPage);
    vm.serviceGrid = {
        paginationPageSizes: [vm.numberOfItemsOnPage, vm.numberOfItemsOnPage * 2, vm.numberOfItemsOnPage * 3],
        enableRowSelection: false,
        enableRowHeaderSelection: false,
        multiSelect: false,
        enableSorting: true,
        enableFiltering: true,
        useExternalFiltering: true,
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
        // $scope.getCurrentPage(vm.currentPageNumber - 1, vm.serviceGrid.paginationPageSize);
        $scope.getCurrentPage();
        getNubmberOfElements();

        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            // alert("Hello! I am an alert box!");
            vm.currentPageNumber = newPage;
            vm.numberOfItemsOnPage = pageSize;
            console.log("vm.filterNecessary ", vm.filterNecessary);
            console.log("vm.necessary ", vm.necessary);
            if (vm.filterNecessary) {
                console.log(" getCurrentPage Filter nec");

                $scope.getCurrentPageFilterNecessary(vm.necessary);
            } else {
                // $scope.getCurrentPage(vm.currentPageNumber - 1, vm.numberOfItemsOnPage);
                console.log(" getCurrentPage ");
                $scope.getCurrentPage();
            }

            console.log("getNumberOfParts paginationChanged vm.serviceGrid.pageSize ", pageSize);
            // console.log("getNumberOfParts paginationChanged vm.serviceGrid.totalItems ", vm.serviceGrid.totalItems);
            console.log("getNumberOfParts paginationChanged vm.serviceGrid.numberOfItemsOnPage ", vm.numberOfItemsOnPage);
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
            // cellFilter: "Да",
            /*filter: {
                /!*noTerm: true,*!/
                // term: true
                condition: function (searchTerm, cellValue) {
                    return cellValue.match(searchTerm);
                }
            }*/
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

    // $scope.getCurrentPage = function (newPage, pageSize) {
    $scope.getCurrentPage = function () {
        // var url = '/api/part/get?page=' + newPage + '&size=' + pageSize;
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

    $scope.getCurrentPageFilterNecessary = function (necessary) {
        // vm.currentPageNumber - 1, vm.numberOfItemsOnPage
        if (necessary == 1) {

            if (vm.necessary == 0 || vm.necessary == 'undefined') {

                vm.currentPageNumber = 1;
                console.log(" necessary 1  vm.necessary ", vm.necessary);
            }
            vm.necessary = 1;

        }
        if (necessary == 0) {
            console.log(" necessary 0 ", vm.necessary);

            if (vm.necessary == 1 || vm.necessary == 'undefined') {

                vm.currentPageNumber = 1;
                console.log(" necessary 0  vm.necessary ", vm.necessary);
            }
            vm.necessary = 0;
            console.log(" necessary 0  vm.necessary after ", vm.necessary);

        }


    var url = '/api/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + necessary;

    $http.get(url, config)
        .then(function (response) {
            console.log("getCurrentPageFilterPage then  ", response.data);

            if (response.data.result == "success") {
                vm.serviceGrid.totalItems = response.data.data.totalElements;
                console.log("getPage filter necessary success ", response.data.data.content);
                vm.serviceGrid.data = response.data.data.content;
                console.log("vm.serviceGrid.data necessary after ", vm.serviceGrid.data);
                console.log("vm.filterNecessary before ", vm.filterNecessary);

                if (vm.filterNecessary == false) {
                    vm.filterNecessary = true;
                }
                console.log("vm.filterNecessary after ", vm.filterNecessary);
                console.log("necessary ", necessary);

            }
            console.log("vm.necessary  ", vm.necessary);

        });

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
                $scope.getCurrentPage(vm.currentPageNumber - 1, vm.numberOfItemsOnPage);
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
    console.log("add row row.entity ++++++++++++", row.entity);
    console.log("newService ++++++++++++", newService);

    var rowTmp = {};
    rowTmp.entity = newService;
    vm.editRow(vm.serviceGrid, rowTmp);
    console.log("add row !!!!! ", newService, " service !!!!!!!!!!", vm.serviceGrid);
    // getCurrentPage(currentPageNumber - 1, vm.numberOfItemsOnPage);
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
                    vm.resultMessage = response.data.result;
                    vm.totalItems = 1;
                    $modalInstance.close(row.entity);
                    //console.log("Mainctrel" , MainCtrl);
                    // grid.vm.getCurrentPage(vm.currentPageNumber - 1, vm.numberOfItemsOnPage);
                    grid.totalItems += 1;
                    console.log("response.data.data.id ", response.data);
                    row.entity.id = response.data.data;

                    grid.paginationCurrentPage = Math.ceil(grid.totalItems / grid.paginationPageSize);
                    grid.data.push(row.entity);
                    /*console.log("rpaginationLastPage ", paginationLastPage, "grid.paginationCurrentPage ", grid.paginationCurrentPage);
                    if (grid.paginationCurrentPage < paginationLastPage) {
                        grid.paginationCurrentPage = paginationLastPage;
                        //grid.data.push(row.entity);

                    } else {
                        console.log("data.push row ", row.entity);
                    }*/


                    // grid.gridApi.core.refresh();
                    // grid.refresh();
                } else {
                    vm.resultMessage = response.data.error;
                }

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
            console.log(" copy data ", data);
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

                    // grid.data[grid.data.indexOf(row.entity)] = row.entity;
                    grid.data[grid.data.indexOf(row.entity)] = angular.copy(row.entity);

                } else {
                    vm.resultMessage = response.data.error;
                }

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
