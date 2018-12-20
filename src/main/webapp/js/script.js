var app = angular.module('influx', ['ngTouch', 'ngAnimate', 'ui.grid', 'ui.grid.pinning', 'ui.grid.moveColumns', 'ui.grid.selection', 'ui.grid.resizeColumns', 'ui.bootstrap', 'ui.grid.edit', 'ui.grid.pagination' ])

app.controller('MainCtrl', MainCtrl);
app.controller('RowEditCtrl', RowEditCtrl);
app.service('RowEditor', RowEditor);

var config = {
    headers: {
        'Content-Type': 'application/json;charset=utf-8;'
    }
}

MainCtrl.$inject = [ '$scope', '$http', '$modal', 'RowEditor', 'uiGridConstants' ];
function MainCtrl($scope, $http, $modal, RowEditor, uiGridConstants) {
	var vm = this;
    vm.resultMessage;
	vm.editRow = RowEditor.editRow;
    vm.numberOfItemsOnPage = 10;
    var urlGetNumberOfParts = '/api/part/number';
    // var totalItems = 0;
    var currentPageNumber = 0;
    // var totalPage = Math.ceil(vm.serviceGrid.totalItems / numberOfItemsOnPage);
	vm.serviceGrid = {
        paginationPageSizes: [vm.numberOfItemsOnPage, vm.numberOfItemsOnPage * 2, vm.numberOfItemsOnPage * 3],
        enableRowSelection : true,
		enableRowHeaderSelection : false,
		multiSelect : false,
		enableSorting : true,
		enableFiltering : true,
		enableGridMenu : false,
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
        gridFooterTemplate:'<div  style="text-align:left" ><button ng-click=\'grid.appScope.addRow()\' > Add Part </button></div>',
            /*"<button ng-click='grid.appScope.addRow()' > Add Part </button>",*/
		/*rowTemplate : "<div ng-dblclick=\"grid.appScope.vm.editRow(grid, row)\" ng-repeat=\"(colRenderIndex, col) in colContainer.renderedColumns track by col.colDef.name\" class=\"ui-grid-cell\" ng-class=\"{ 'ui-grid-row-header-cell': col.isRowHeader }\" ui-grid-cell></div>"*/
		rowTemlate : "ng-class='ui-grid-row-header-cell'"
	};

    vm.serviceGrid.onRegisterApi= function (gridApi) {
        $scope.gridApi = gridApi;
        console.log("onRegisterApi  ", vm.serviceGrid.totalItems);
        getCurrentPage(currentPageNumber, vm.serviceGrid.paginationPageSize);
        getNubmberOfElements();
        /*vm.gridApi = gridApi;*/
        gridApi.pagination.on.paginationChanged($scope, function (newPage, pageSize) {
            // alert("Hello! I am an alert box!");
            currentPageNumber = newPage;
            getCurrentPage(currentPageNumber - 1, pageSize);
            console.log("getNumberOfParts paginationChanged vm.serviceGrid.totalItems ", vm.serviceGrid.totalItems);
            console.log("getNumberOfParts paginationChanged vm.serviceGrid.numberOfItemsOnPage ", vm.numberOfItemsOnPage);
            vm.serviceGrid.totalPage = Math.ceil(vm.serviceGrid.totalItems / vm.numberOfItemsOnPage);
            console.log("Received: pageNumber=" + newPage + ", pageSize= " + pageSize, " total pages ", vm.serviceGrid.totalPage);
        });
        vm.msg = {};
        vm.serviceGrid.currentFocused = "";
        gridApi.edit.on.afterCellEdit($scope, function (rowEntity, colDef, newValue, oldValue) {
            vm.msg.lastCellEdited = 'edited row id:' + rowEntity.id + ' Column:' + colDef.name + ' newValue:' + newValue + ' oldValue:' + oldValue + " propName " + rowEntity.name;
            console.log("rowEntity ", rowEntity);
            postUpdatePart($scope, rowEntity);
            $scope.$apply();
        });
    };

	vm.serviceGrid.columnDefs = [
        {name: 'id', displayName: "ID", width: '5%', enableCellEdit: false , pinnedRight:true},
        {
            name: 'component', displayName: "Наименование", width: '65%', enableCellEdit: true, pinnedRight:true,
            cellTooltip: function (row) {
                return row.entity.title;
            },
            cellTemplate: '<div  style="text-align:left" white-space: normal title="TOOLTIP">{{COL_FIELD CUSTOM_FILTERS}}</div>'
        },
        {name: 'quantity', displayName: "Количество", width: '10%', enableCellEdit: true, type: 'number', pinnedRight:true},
        {name: 'necessary', displayName: "Необходимость", width: '10%', enableCellEdit: true, type: 'boolean', pinnedRight:true},
        {
            name: ' ',
            width: '5%',
            pinnedRight:true,
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
            pinnedRight:true,
            width: '10%',
            enableCellEdit: false,
            enableFiltering: false,
            enableSorting: false,
            cellTemplate: /*'<button class="btn primary" ng-click="grid.appScope.myclick()">Delete</button>'*/
            '<button class="glyphicon glyphicon-pencil"' +
            ' ng-click="grid.appScope.getAddBook(row,newPage, pageSize)">' +
            '</button>'
        }
        ];

    var getNubmberOfElements = function () {
        $http.get(urlGetNumberOfParts, config)
            .then(function (response) {
                console.log("getNumberOfParts ", response.data);
                if (response.data.result == "success") {
                     console.log("getNumberOfParts success ", response.data.data);
                     console.log("getNumberOfParts success numberOfItemsOnPage ", vm.numberOfItemsOnPage);
                     // console.log("getNumberOfParts success totalItems ", vm.totalItems);
                    // vm.totalItems = response.data.data;
                    vm.serviceGrid.totalItems = response.data.data;
                }
            });
    }

    var getCurrentPage = function (newPage, pageSize) {
        var url = '/api/part/get?page=' + newPage + '&size=' + pageSize;
        $http.get(url, config)
            .then(function (response) {
                console.log("getPage then  ", response.data);

                if (response.data.result == "success") {
                    console.log("getPage success ", response.data.data.content);

                    vm.serviceGrid.data = response.data.data.content;
                }
            });

    };
	// $http.get('/js/dataPartJson').success(function(response) {
	/*$http.get('/api/parts').success(function(response) {
		console.log(" get all parts", response.data)
		 vm.serviceGrid.data = response.data;
        getNubmberOfElements();
	});*/

	$scope.addRow = function() {
		var newService = {
			"id" : "0",
			"title" : "public",
			"description" : "ttt",
			"author" : "Ret",
			"isbn" : "0123-34",
			"printYear" : "2000",
			"readAlready" : "true"
		};
		var rowTmp = {};
		rowTmp.entity = newService;
		vm.editRow(vm.serviceGrid, rowTmp);
		console.log("add row ", newService, " service ", vm.serviceGrid);
		// getCurrentPage(newPage, pageSize);
	};

}

RowEditor.$inject = [ '$http', '$rootScope', '$modal' ];
function RowEditor($http, $rootScope, $modal) {
	var service = {};
	service.editRow = editRow;
// console.log("row editor ", editRow)
	function editRow(grid, row) {
		// console.log("editRow ", row.entity);
		$modal.open({
			templateUrl : '/js/service-edit.html',
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

function RowEditCtrl($http, $modalInstance, grid, row) {
	var vm = this;
	vm.entity = angular.copy(row.entity);
	vm.save = save;
	function save() {
        var urlAdd =  "/api/part/add";
		if (row.entity.id == '0') {
			console.log("rowEditCtrel row.entity", row.entity);
            row.entity = angular.extend(row.entity, vm.entity);
            // grid.data.push(row.entity);
            console.log("rowEditCtrel row.entity after", row.entity);
            var data = {
                title: row.entity.title,
                description: row.entity.description,
                author: row.entity.author,
                isbn: row.entity.isbn,
                pritnYear: row.entity.printYear,
                alreadyRead: row.entity.alreadyRead
            };
            $http.post(urlAdd, data, config).then(function(response) {
                if (response.data.result == "success") {
                    vm.resultMessage = response.data.result;
                    vm.serviceGrid.totalItems=1;
                    $modalInstance.close(row.entity);
                } else {
                    vm.resultMessage = response.data.error;
                }

            }, function (response) {
                vm.resultMessage = response.data.error;
            });

			/*
			 * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
			 */
			// row.entity = angular.extend(row.entity, vm.entity);
			//real ID come back from response after the save in DB
			// row.entity.id = Math.floor(100 + Math.random() * 1000);
            console.log("rowEditCtrel row.entity push ", row.entity);
			// grid.data.push(row.entity);

		} else {
			row.entity = angular.extend(row.entity, vm.entity);
			/*
			 * $http.post('http://localhost:8080/service/save', row.entity).success(function(response) { $modalInstance.close(row.entity); }).error(function(response) { alert('Cannot edit row (error in console)'); console.dir(response); });
			 */
		}
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
