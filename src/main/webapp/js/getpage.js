
$scope.getCurrentPage = function () {
    // var url = '/api/part/get?page=' + newPage + '&size=' + pageSize;
    flagFilterNecessary = false;
    $scope.filterTerm = "undefined";
    dataFilterNecessary = "undefined";
    $scope.searchTerm = "";

    var url = '/api/part/get?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage;
    $http.get(url, config)
        .then(function (response) {
            console.log("getCurrentPage then  ", response.data);

            if (response.data.result == "success") {
                vm.serviceGrid.totalItems = response.data.data.totalElements;
                if(response.data.data.last) {
                    console.log(" first page ",response.data.data.first);
                    console.log(" last page ",response.data.data.last);
                    vm.last = true;

                } else {
                    vm.last = false;
                }
                console.log(" vm.serviceGrid", vm.serviceGrid);
                console.log("response.data.data ", response.data.data);
                vm.serviceGrid.data = response.data.data.content;
                console.log("vm.serviceGrid.data  ", vm.serviceGrid);
                // console.log(" value ", vm.serviceGrid.columnDefs[3].cellValue);
                vm.currentPageNumber = response.data.data.number + 1;
                vm.serviceGrid.paginationCurrentPage = vm.currentPageNumber;
            }
        });

};
if ($scope.searchTerm != "") {
    console.log("Pagination changed getCurrentPageFilterComponent ");
    $scope.getCurrentPageFilterComponent();
} else {
    if ($scope.filterTerm == 'undefined') {
        // if ($scope.flagFilterNecessary) {
        console.log("Pagination changed getCurrentPage ");
        $scope.getCurrentPage();
    } else {
        console.log("Pagination changed getCurrentPage Filter necessary");
        $scope.getCurrentPageFilterNecessary(dataFilterNecessary);
    }
}

$scope.getCurrentPageFilterNecessary = function () {
    // vm.currentPageNumber - 1, vm.numberOfItemsOnPage
    flagFilterNecessary = true;

    flagSearchComponent = false;
    $scope.searchTerm = "";

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


    var url = '/api/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;

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

$scope.getCurrentPageFilterNecessary = function () {
    // vm.currentPageNumber - 1, vm.numberOfItemsOnPage
    flagFilterNecessary = true;

    flagSearchComponent = false;
    $scope.searchTerm = "";

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


    var url = '/api/part/getnecessary?page=' + (vm.currentPageNumber - 1) + '&size=' + vm.numberOfItemsOnPage + '&necessary=' + $scope.filterTerm;

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