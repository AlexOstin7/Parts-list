//10.01.2019
var app = angular.module('parts-list', ['ui.grid', 'ui.bootstrap','ui.grid.pagination', 'schemaForm'])
    .constant('PersonSchema', {
        type: 'object',
        properties: {
            id: {type: 'string', editable: false, title: 'ID', "default": "0", nullable: false, "readOnly": true},
            component: {
                type: 'string', title: 'Наименование', "minLength": 1, "maxLength": 100,
                "validationMessage": "Введите наименование размером от 0 до 100 символов!"
            },
            quantity: {
                type: 'integer', title: 'Количество', "default": 1, "minimum": 1, "maximum": 2147483647
            },
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

MainCtrl.$inject = ['$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants', '$rootScope'];
child = {};

function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $rootScope) {
    var parentScope = $scope.$parent;
    parentScope.child = $scope;
    $scope.alerts = [];
    var vm = this;
    $rootScope.resultMessage = "success";
    vm.last;
    vm.rowOffset = {};
    vm.editRow = RowEditor.editRow;
    vm.numberOfItemsOnPage = 10;
    // vm.size = 10;
    vm.currentPageNumber = 1;
    dataFilterNecessary = 'undefined';
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
        // minRowsToShow: 14,
        enableFiltering: true,
        enableColumnMenus: false,
        useExternalPagination: true,
        showGridFooter: true,
        gridFooterTemplate: "<div align=\"left\"><button ng-click='grid.appScope.addRow();' > Add Part </button> ",
    };

    vm.serviceGrid.onRegisterApi = function (gridApi) {
        $scope.gridApi = gridApi;
        $scope.getCountSets();
        $scope.getCurrentPage();
        gridApi.core.refresh();
        $scope.gridApi.core.on.rowsVisibleChanged(null, catchRowVisibleChanged);
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            vm.currentPageNumber = newPage;
            vm.numberOfItemsOnPage = pageSize;
            $scope.getCurrentPage($scope.filterTerm);
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
            cellTemplate: '<div  style="text-align:left" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
        },
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
            cellFilter: true
        },
        {
            name: ' ',
            width: '10%',
            enableCellEdit: false,
            enableFiltering: false,
            enableSorting: false,
            cellTemplate: '<button class="glyphicon glyphicon-remove"' +
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
            cellTemplate:
            '<button class="glyphicon glyphicon-pencil"' +
            ' ng-click="grid.appScope.updateRow(row)">' +
            '</button>'
        }
    ];
    $scope.addAlert = function(type, message) {
        $scope.alerts.push({type: type, msg: message});
    };
    $scope.closeAlert = function(index) {
        $scope.alerts.splice(index, 1);
    };

    var catchRowVisibleChanged = function (grid) {
        if (grid.pagination.getPage() < grid.pagination.getTotalPages() && grid.core.getVisibleRows().length < vm.numberOfItemsOnPage) {
            $scope.getOnePartFromNextPage();
            vm.serviceGrid.totalItems--;
        }
    }

    $scope.getCountSets = function () {
        var url = "/part/min";
        if ($rootScope.resultMessage == 'success') {
            $http.get(url, config, $scope)
                .then(function (response) {
                    $rootScope.resultMessage = response.data.result;
                    if (response.data.result == "success") {
                        $scope.min = response.data.data;
                    } else {
                        $scope.addAlert("warning", "Вычисление поля можно собрать компьютров ОШИБКА КЛИЕНТА");
                    }
                }, function (response) {
                    $scope.addAlert("danger", "Вычисление поля можно собрать компьютров ОШИБКА СЕРВВЕРА");
                });
        }
    }

    $scope.searchTerm = "";
    $scope.filterTerm = "undefined";

    $scope.getCurrentPage = function () {
        if ($scope.searchTerm == "") {
            if ($scope.filterTerm == "undefined") {
                var url = '/part/get?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/part/getcomponent?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        vm.necessary = $scope.filterTerm;

        $http.get(url, config)
            .then(function (response) {
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {
                    $rootScope.resultMessage = 'success';
                    vm.serviceGrid.data = response.data.data.content;
                    vm.serviceGrid.totalItems = response.data.data.totalElements;
                    vm.currentPageNumber = response.data.data.number + 1;
                    vm.serviceGrid.paginationCurrentPage = vm.currentPageNumber;
                    if (response.data.data.last) {
                        vm.last = true;
                    } else {
                        vm.last = false;
                    }
                } else {
                    $scope.addAlert("warning", "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов ОШИБКА КЛИЕНТА" + response.data.error);
                }
            }, function (response) {
                $scope.addAlert("warning", "Чтение страницы " + vm.currentPageNumber + " размером в " + vm.numberOfItemsOnPage + " элемнтов ОШИБКА СЕРВЕРА" + response.data.error);
            });
    };

    $scope.getOnePartFromNextPage = function () {
        if ($scope.searchTerm == "") {
            if ($scope.filterTerm == "undefined") {
                var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
            } else {
                var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;
            }
        } else {
            var url = '/part/getoffset?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&component=' + $scope.searchTerm;
        }
        $http.get(url, config)
            .then(function (response) {
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {
                    vm.rowOffset = response.data.data;
                    vm.serviceGrid.data[vm.numberOfItemsOnPage] = vm.rowOffset;
                } else {
                    $scope.addAlert("warning", "Чтение элемнта ОШИБКА КЛИЕНТА" + response.data.error);
                }
            }, function (response) {
                $scope.addAlert("warning", "Чтение элемнта ОШИБКА СЕРВЕРА" + response.data.error);
            });
    };
    $scope.getDeletePart = function (row) {
        var url = '/part/delete/' + row.entity.id;
        $http.get(url, config)
            .then(function (response) {
                $rootScope.resultMessage = response.data.result;
                if (response.data.result == "success") {
                    vm.serviceGrid.totalItems -= 1;
                    var index = vm.serviceGrid.data.indexOf(row.entity);
                    vm.serviceGrid.data.splice(index, 1);
                    var lastPage = Math.ceil(vm.serviceGrid.totalItems / vm.serviceGrid.paginationPageSize);
                    if (!vm.last) {
                        $scope.getOnePartFromNextPage();
                        vm.serviceGrid.data[vm.numberOfItemsOnPage] = vm.rowOffset;
                    }
                    if (vm.serviceGrid.paginationCurrentPage == lastPage) {
                        vm.last = true;
                    }
                    if (vm.serviceGrid.paginationCurrentPage > lastPage) {
                        vm.serviceGrid.paginationCurrentPage --;
                    }
                    $scope.getCountSets();
                } else {
                    $scope.addAlert("warning", "Удаление ОШИБКА КЛИЕНТА " + response.data.error);

                }
            }, function (response) {
                $scope.addAlert("danger", "Удаление ОШИБКА СЕРВЕРА " + response.data.error);
            })
    };

    $scope.addRow = function () {
        var newService = {
            "id": "0"
        };
        var rowTmp = {};
        rowTmp.entity = newService;
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm, $rootScope);
    };

    $scope.updateRow = function (row) {
        var newService = row.entity;
        var rowTmp = {};
        rowTmp.entity = newService;
        vm.editRow(vm.serviceGrid, rowTmp, $scope.filterTerm, $scope.searchTerm, $rootScope);
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
    vm.entity = angular.copy(row.entity);
    vm.schema = PersonSchema;
    vm.entity = angular.copy(row.entity);
    vm.form = [
        'id',
        'component',
        'quantity',
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
        var urlAdd = "/part/add";
        var urlUpDate = "/part/update";

        if ( !angular.isUndefined(vm.entity.component) && vm.entity.quantity) {
            if (row.entity.id == '0') {
                row.entity = angular.extend(row.entity, vm.entity);
                var data = {
                    component: row.entity.component,
                    quantity: row.entity.quantity,
                    necessary: row.entity.necessary
                };
                $http.post(urlAdd, data, config).then(function (response) {
                    $rootScope.resultMessage = response.data.result;
                    if (response.data.result == "success") {
                        vm.totalItems = 1;
                        $modalInstance.close(row.entity);
                        row.entity.id = response.data.data;
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
                        }
                    } else {
                        $rootScope.resultMessage = response.data.error;
                        $rootScope.child.addAlert("waring", "Добавление ОШИБКА КЛИЕНТА " + response.data.error);
                    }
                }, function (response) {
                    $rootScope.resultMessage = response.data.error;
                    $rootScope.child.addAlert("danger", "Добавление ОШИБКА СЕРВЕРА " + response.data.error);
                });
            } else {
                row.entity = angular.extend(row.entity, vm.entity);
                var data = {};
                data = angular.copy(row.entity);
                $http.post(urlUpDate, data, config).then(function (response) {
                    $rootScope.resultMessage = response.data.result;
                    if (response.data.result == "success") {
                        vm.totalItems = 1;
                        $modalInstance.close(row.entity);
                        $rootScope.child.getCountSets();
                        if (((filterTerm == row.entity.necessary || filterTerm == 'undefined') && searchTerm == "" ) ||
                            (filterTerm == 'undefined' && row.entity.component.toLowerCase().match(searchTerm.toLowerCase()))) {
                            grid.data[grid.data.indexOf(row.entity)] = angular.copy(row.entity);
                        } else {
                            var index = grid.data.indexOf(row.entity);
                            grid.data.splice(index, 1);
                        }
                    } else {
                        $rootScope.resultMessage = response.data.error;
                        $scope.addAlert("waring", "Обновление ОШИБКА КЛИЕНТА " + response.data.error);
                    }
                }, function (response) {
                    $rootScope.resultMessage = response.data.error;
                    $rootScope.child.addAlert("waring", "Обновление ОШИБКА СЕРВЕРА " + response.data.error);
                });
            }
    }

    }
}
