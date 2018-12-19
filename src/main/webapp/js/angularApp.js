var app = angular.module('app', ['ngTouch', 'ui.grid', 'ui.grid.pagination', 'ui.grid.edit', 'ui.grid.cellNav', 'ui.bootstrap'])

    // .controller('MainCtrl', MainCtrl)
    .controller('RowEditCtrl', RowEditCtrl)
    .service('RowEditor', RowEditor)
;

var config = {
    headers: {
        'Content-Type': 'application/json;charset=utf-8;'
    }
}



app.controller('postController', function ($scope, $http, $location) {
    $scope.submitForm = function () {
        var url = $location.absUrl() + "/api/organiazation/save";

        var config = {
            headers: {
                'Content-Type': 'application/json;charset=utf-8;'
            }
        }

        var data = {
            name: $scope.name,
            fullName: $scope.fullName,
            inn: $scope.inn,
            kpp: $scope.kpp,
            address: $scope.address,
            phone: $scope.phone,
            isActive: $scope.isActive
        };


        $http.post(url, data, config).then(function (response) {
            $scope.postResultMessage = "Sucessful!";
        }, function (response) {
            $scope.postResultMessage = "Fail!";
        });

        $scope.name = "";
        $scope.fullName = "";
        $scope.inn = "";
        $scope.kpp = "";
        $scope.address = "";
        $scope.phone = "";
        $scope.isActive = "";
    }
});

app.controller('getAllBooksController', function ($scope, $http, $location) {

    $scope.showAllBooks = false;
    $scope.my = function () {
        alert("Hello! I am an alert box!");
    };
    $scope.getAllBooks = function () {
        var url = $location.absUrl() + "api/books"; // "findall";

        var config = {
            headers: {
                'Content-Type': 'application/json;charset=utf-8;'
            }
        }

        $http.get(url, config).then(function (response) {
            console.log("response", response);
            //$http.get(url, config).success(function(response) {
            if (response.data.result == "success") {
                $scope.allBooks = response.data;
                $scope.showAllBooks = true;
            } else {
                $scope.getResultMessage = "get All Books Data Error!";
            }
        }, function (response) {
            $scope.getResultMessage = "Fail!";
        });
    }
    //getAllCustomers();
});

app.controller('postUpdateBookController', function ($scope, $http, $location) {

    $scope.postUpdateBook = function () {

        var url = $location.absUrl() + "/api/book/update";

        var data = {
            id: $scope.id,
            title: $scope.title,
            decription: $scope.decription,
            author: $scope.author,
            isbn: $scope.isbn,
            pritnYear: $scope.printYear,
            alreadyRead: $scope.alreadyRead
        };

        $http.post(url, data, app.config).then(function (response) {

            if (response.data.result == "success") {
                /* var list = response.data.data;
                 $scope.setView($scope.id, list.name, list.address, list.phone, list.active);
                 FactoryOffice.updateOfficeData($scope.office.id, list.name, list.address, list.phone, list.active);*/

                $scope.resultMessage = response.data.result;
                //FactoryOffice.modelOffice.showAll = true;
            } else {
                //$scope.getResultMessage = "Organization Data Error!";
                $scope.resultMessage = response.data.error;
                //FactoryOffice.modelOffice.showAll = false;
            }

        }, function (response) {
            $scope.resultMessage = response.data.error;
            //$scope.getResultMessage = "Fail!";
        });

    }
});

// MainCtrl.$inject = ['$scope','$http', 'RowEditor'];

app.controller('MainCtrl', ['$scope', '$http', 'RowEditor', "uiGridConstants",  function ($scope, $http, $modal, RowEditor, $uibModal, uiGridConstants) {
// function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants, $uibModal) {
    $scope.title = "Adding Filters to AngularJS UI-Grid";
    var vm = this;
    vm.editRow = RowEditor.editRow;
    var numberOfItemsOnPage = 8;
    var urlGetNumberOfBooks = '/api/book/number';
    var totalItems = 0;
    var currentPage = 1;
    var totalPage = Math.ceil(totalItems / numberOfItemsOnPage);
    var myTemplate = "<a href='#' ng-click='grid.appScope.openModal($event, row)'>{{ row.entity.myFieldName }}</a>";

    vm.myData = [
        {
            id: '2',
            title: "Алгоритмы. Теория и практическое применение",
            description: "Численные алгоритмы, структурыданных, ьетодыработы с массивами, связанными списками и сетями",
            author: "Род Стивенс",
            isbn: "978-5-699-81729-0",
            printYear: "2017",
            readAlready: 'true',
        },
        {
            'first-name': 'Cox',
            friends: ['friend0'],
            address: {street: '301 Dove Ave', city: 'Laurel', zip: '39565'},
            getZip: function () {
                return this.address.zip;
            }
        }
    ];
    // SPECIFY FILTERING OPTIONS.
    $scope.gridOptions = {
        /* data: vm.myData,*/
        paginationPageSizes: [numberOfItemsOnPage, numberOfItemsOnPage * 2, numberOfItemsOnPage * 3],
        paginationPageSize: numberOfItemsOnPage,
        enableFiltering: true,
        enableColumnMenus: false,
        // totalItems: 0,
        useExternalPagination: true,
        showGridFooter: true,
        // gridFooterTemplate: "<button ng-click='edit-button.html'> Add Book </button>",
        gridFooterTemplate: "<button ng-click='addRow()'> Add Book </button>",

        // rowHeight: 60,
        // data: '$ctrl.myData',

        onRegisterApi: function (gridApi) {
            $scope.gridApi = gridApi;
            /*gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                paginationOptions.pageNumber = newPage;
                paginationOptions.pageSize = pageSize;
                $scope.pageSize = pageSize;
                $scope.currentPage = newPage;
                $scope.totalPage = Math.ceil($scope.gridOptions.totalItems/$scope.pageSize);
            });*/
            getPage(currentPage, $scope.gridOptions.paginationPageSize);
            getNubmberOfElements();
            /*vm.gridApi = gridApi;*/
            gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
                // alert("Hello! I am an alert box!");
                currentPage = newPage;
                getPage(currentPage - 1, pageSize);
                console.log("getNumberOfBooks paginationChanged ", totalItems);
                $scope.totalPage = Math.ceil(totalItems / numberOfItemsOnPage);
                console.log("Received: pageNumber=" + newPage + ", pageSize= " + pageSize, " total pages ", $scope.totalPage);
            });
            vm.msg = {};
            $scope.currentFocused = "";
            gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
                vm.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue + " propName " + rowEntity.name;
                console.log("rowEntity ", rowEntity);
                postUpdateBook($scope, rowEntity);
                $scope.$apply();
            });

            /*gridApi.selection.on.rowSelectionChangedBatch($scope,function(rows){
                var msg = 'rows changed ' + rows.length;
                myclick();
            });*/
            /* $scope.gridApi.core.on.sortChanged($scope, function (grid, sortColumns) {
                if (sortColumns.length == 0) {
                    paginationOptions.sort = null;
                } else {
                    paginationOptions.sort = sortColumns[0].sort.direction;
                }
                 getPage();
            });*/
        },

        columnDefs: [
            /*Edit	№	Id	Title	Description	Author	Isbn	Print year	Already Read*/
            {name: 'id', displayName: "ID", width: '5%', enableCellEdit: false},
            {
                name: 'title', displayName: "Title", width: '20%', enableCellEdit: true,
                cellTooltip: function (row) {
                    return row.entity.title;
                },
                cellTemplate: '<div class="grid-cell-contents wrap" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
            },
            {
                name: 'description', displayName: "Description", width: '20%', wordWrap: true,
                cellTooltip: function (row) {
                    return row.entity.description;
                },
                cellTemplate: '<div class="grid-cell-contents wrap" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
            },
            {
                name: 'author', displayName: "Author", width: '20%', enableCellEdit: true,
                cellTooltip: function (row) {
                    return row.entity.author;
                },
                cellTemplate: '<div class="grid-cell-contents wrap" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
            },
            {name: 'isbn', displayName: "isbn", width: '15%', enableCellEdit: true},
            {name: 'printYear', displayName: "print Year", width: '10%', enableCellEdit: true, type: 'number'},
            {name: 'readAlready', displayName: "Already Read", width: '5%', enableCellEdit: true, type: 'boolean'},
            {
                name: ' ',
                width: '2%',
                enableCellEdit: false,
                cellTemplate: /*'<button class="btn primary" ng-click="grid.appScope.myclick()">Delete</button>'*/
                '<button class="glyphicon glyphicon-remove"' +
                /*' ng-click="grid.appScope.getDeleteBook(row.entity.id).onClick(row.entity.id)">' +*/
                ' ng-click="grid.appScope.getDeleteBook(row,newPage, pageSize)">' +
                '</button>'
            },
            {
                name: '  ',
                width: '2%',
                enableCellEdit: false,
                cellTemplate: /*'<button class="btn primary" ng-click="grid.appScope.myclick()">Delete</button>'*/
                '<button class="\tglyphicon glyphicon-pencil"' +
                /*' ng-click="grid.appScope.getDeleteBook(row.entity.id).onClick(row.entity.id)">' +*/
                ' ng-click="grid.appScope.getAddBook(row,newPage, pageSize)">' +
                '</button>'
            },
            {
                field: 'a',
                displayName: 'My Field Name',
                cellTemplate: myTemplate
            },
        ]

    };

    var getPage = function (newPage, pageSize) {
        var url = '/api/book/get?page=' + newPage + '&size=' + pageSize;
        $http.get(url, config)
            .then(function (response) {
                console.log("getPage then  ", response.data);

                if (response.data.result == "success") {
                    console.log("getPage success ", response.data.data.content);

                    $scope.gridOptions.data = response.data.data.content;
                }
            });

    };
    var getNubmberOfElements = function () {
        $http.get(urlGetNumberOfBooks, config)
            .then(function (response) {
                console.log("getNumberOfBooks ", response.data);
                if (response.data.result == "success") {
                    // console.log("getNumberOfBooks success ", response.data.data);
                    totalItems = response.data.data;
                    $scope.gridOptions.totalItems = totalItems;
                }
            });
    }
    var postUpdateBook = function ($scope, data) {

        var url = /*$location.absUrl() + */ "/api/book/update";
        /*var resultMessage ;
            $scope.resultMessage  = resultMessage;*/

        console.log("postUpdate before ", data);
        var dataJSON = {
            id: $scope.id,
            title: $scope.title,
            decription: $scope.decription,
            author: $scope.author,
            isbn: $scope.isbn,
            pritnYear: $scope.printYear,
            alreadyRead: $scope.alreadyRead
        };
        console.log("postUpdate JSON before ", dataJSON);
        dataJSON = data;
        console.log("postUpdate JSON after ", dataJSON);
        $http.post(url, dataJSON, config).then(function (response) {
            console.log("Date update ", data, " response ", response);
            if (response.data.result == "success") {
                console.log("result message ", response.data.result);
                $scope.resultMessage = response.data.result;
            } else {
                resultMessage = response.data.error;
                alert("Hello! I am an error 1 box!");
            }

        }, function (response) {
            alert("Hello! I am an error 2 box!");
            resultMessage = response.data.error;
            //$scope.getResultMessage = "Fail!";
        });

    }
    $scope.getDeleteBook = function (row, newPage, pageSize) {
        var url = '/api/book/delete/' + row.entity.id;
        console.log("delete id", row.entity.id);
        $http.get(url, config)
            .then(function (response) {
                // handleResult(result.value);
                console.log("delete then ", response.data);

                if (response.data.result == "success") {
                    console.log("delete success ", response.data.data.content);

                    // $scope.gridOptions.data = response.data.data.content;
                }
            }).catch(function () {
            var index = $scope.gridOptions.data.indexOf(row.entity);
            console.log("delete catch  currentPage ", currentPage, " index ", index);
            // $scope.gridOptions.data.splice(index, 1);
            getPage(currentPage - 1, numberOfItemsOnPage);
            getNubmberOfElements();
            // $scope.gridOptions.totalItems = totalItems;
            /*$scope.gridApi.core.refresh();
            $scope.gridApi.core.refreshRows();*/
            /*getPage(0, $scope.gridOptions.paginationPageSize);
            getNubmberOfElements();*/
            // $scope.$apply();
            // handle errors
        });

    };
    var postSaveBook = function ($scope, data) {

        var url = /*$location.absUrl() + */ "/api/book/update";
        console.log("postSave before ", data);
        var dataJSON = {
            id: $scope.id,
            title: $scope.title,
            decription: $scope.decription,
            author: $scope.author,
            isbn: $scope.isbn,
            pritnYear: $scope.printYear,
            alreadyRead: $scope.alreadyRead
        };
        console.log("postUpdate JSON before ", dataJSON);
        dataJSON = data;
        console.log("postUpdate JSON after ", dataJSON);
        $http.post(url, dataJSON, config).then(function (response) {
            console.log("Date update ", data, " response ", response);
            if (response.data.result == "success") {
                console.log("result message ", response.data.result);
                $scope.resultMessage = response.data.result;
            } else {
                resultMessage = response.data.error;
                alert("Hello! I am an error 1 box!");
            }

        }, function (response) {
            alert("Hello! I am an error 2 box!");
            resultMessage = response.data.error;
            //$scope.getResultMessage = "Fail!";
        });

    };
    $scope.myclick = function (row) {
        alert("My click!- ", row);
        var index = $scope.gridOptions.data.indexOf(row.entity);
        var i = row.entity.id;
        $scope.gridOptions.data.splice(index, 1);
        console.log("index ", index);
        console.log("id ", i);

    };

    var openModal = function (e, row) {
        //in here, you can access the event object and row object
        var myEvent = e;
        var myRow = row;

        //this is how you open a modal
        var modalInstance = $uibModal.open({
            templateUrl: '/path/to/modalTemplate.html',
            controller: ['$modalInstance', 'PersonSchema', 'grid', 'row', getPaginationBookController],
            controllerAs: '$ctrl',
            backdrop: 'static',
            //disable the keyboard
            //keyboard: false,
            resolve: {
                //pass variables to the MyModalCtrl here
                event: function () {
                    console.log("modal event");
                    return myEvent;
                },
                row: function () {
                    console.log("modal row");
                    return myRow;
                }
            },

        });

        //call the modal to open, then decide what to do with the promise
        modalInstance.result.then(function () {
            //blah blah the user clicked okay
            console.log("modal ");
        }, function () {
            console.log("modal ");
            //blah blah the user clicked cancel
        })
    }

    vm.addRow = function() {
        var newService = {
            "id" : "0",
            "category" : "public",
            "exposednamespace" : "http://bced.wallonie.be/services/",
            "exposedoperation" : "-",
            "exposedws" : "-",
            "path" : "//*[local-name()='-']/text()",
            "provider" : "BCED",
            "version" : "1.0"
        };
        var rowTmp = {};
        rowTmp.entity = newService;
        $scope.editRow($scope.gridOptions, rowTmp);
    };

}]);
/*
MainCtrl.$inject = ['$http', 'RowEditor'];

function MainCtrl($http, RowEditor) {
    var vm = this;

    vm.editRow = RowEditor.editRow;

    vm.gridOptions = {
        columnDefs: [
            {field: 'id', name: '', cellTemplate: 'edit-button.html', width: 34},
            {name: 'name'},
            {name: 'company'},
            {name: 'phone'},
            {name: 'City', field: 'address.city'},
        ]
    };

    $http.get('http://ui-grid.info/data/500_complex.json')
        .success(function (data) {
            vm.gridOptions.data = data;
        });
}*/

RowEditor.$inject = [ '$http', '$rootScope', '$modal' ];
function RowEditor($http, $rootScope, $modal) {
    var service = {};
    service.editRow = editRow;

    function editRow(grid, row) {
        $modal.open({
            templateUrl : 'service-edit.html',
            controller : [ '$http', '$modalInstance', 'grid', 'row', RowEditCtrl ],
            controllerAs : 'vm',
            resolve : {
                grid : function() {
                    return grid;
                },
                row : function() {
                    return row;
                }
            }
        });
    }

    return service;
}

function RowEditCtrl($http, $modalInstance, grid, row)
{
    var vm = this;
    vm.entity = angular.copy(row.entity);
    vm.save = save;

    function save() {
        if (row.entity.id == '0') {
            /*
             * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
             */
            row.entity = angular.extend(row.entity, vm.entity);
            //real ID come back from response after the save in DB
            row.entity.id = Math.floor(100 + Math.random() * 1000);

            grid.data.push(row.entity);

        } else {
            row.entity = angular.extend(row.entity, vm.entity);
            /*
             * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
             */
        }
        $modalInstance.close(row.entity);
    }
}




