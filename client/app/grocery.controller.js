(function () {
    angular.module("MyGroceryApp")
        .controller("ListCtrl", ListCtrl)
        .controller("AddCtrl", AddCtrl)
        .controller("EditCtrl", EditCtrl);

    ListCtrl.$inject = ['GroceryService', '$state'];

    function ListCtrl(GroceryService, $state) {
        var vm = this;
        vm.products = "";
        vm.typesOfSearch = ['Brand','Name'];
        vm.searchType = [];
        vm.searchType.selectedType = [];
        vm.sortBy = "";
        vm.keyword = "";

        vm.totalItems = 0;
        vm.itemsPerPage = 20;
        vm.currentPage = 1;
        vm.maxSize = 5; // control this number of display items on the pagination.

        vm.pageChanged = function() {
            console.log('Page changed to: ' + vm.currentPage);

            GroceryService.search(vm.searchType, vm.keyword, vm.sortBy, vm.itemsPerPage, vm.currentPage)
                .then(function (products) {
                    vm.products = products;
                    GroceryService.sum().then(function(result){
                        console.log(result);
                        vm.totalItems = result.sum;
                    });
                }).catch(function (err) {
                console.info("Some Error Occurred",err)
            });
        };

        vm.search = function (searchType, keyword, sortBy) {
            if(searchType.length==0) {
                alert('Please select at least one search type');
            }
            else {
                vm.searchType = searchType;
                vm.keyword = keyword;
                GroceryService.search(searchType, keyword, sortBy, vm.itemsPerPage, vm.currentPage)
                    .then(function (products) {
                        console.log(products);
                        vm.products = products;
                        GroceryService.sum().then(function(result){
                            console.log(result);
                            vm.totalItems = result.sum;
                        });
                    })
                    .catch(function (err) {
                        console.info("Some Error Occurred",err);
                    });
            }
        };
        
        vm.getProduct = function (id) {
            $state.go("edit", {'productId' : id});
        };

        GroceryService.search(vm.searchType, vm.keyword, vm.sortBy, vm.itemsPerPage, vm.currentPage)
            .then(function (products) {
                console.log("----- refresh list ");
                vm.products = products;
                GroceryService.sum().then(function(result){
                    console.log(result);
                    vm.totalItems = result.sum;
                });
            }).catch(function (err) {
            console.info("Some Error Occurred",err)
        });

    }

    EditCtrl.$inject = ['GroceryService', '$stateParams', '$state'];

    function EditCtrl(GroceryService, $stateParams, $state) {
        var vm = this;
        vm.product = {};

        vm.cancel = function () {
            $state.go("list");
        };
        
        GroceryService.edit($stateParams.productId)
            .then(function (product) {
                console.log(product);
                vm.product = product;
            }).catch(function (err) {
                console.info("Some Error Occurred",err)
            });

        vm.save = function () {
            console.log("Saving the changes");
            GroceryService.save(vm.product)
                .then(function (result) {
                    console.info("Product saved.");
                    $state.go("list");
                }).catch(function (err) {
                console.info("Some Error Occurred",err)
            });
        }

        vm.remove = function () {
            console.log("Removing this product");
            if (confirm("Do you really want to remove this product from your Groceries?") == true) {
                GroceryService.remove(vm.product)
                    .then(function (result) {
                        console.info("Product removed.");
                        $state.go("list");
                    }).catch(function (err) {
                    console.info("Some Error Occurred",err)
                });
            } else {
                //do nothing
            }
        }
    }

    AddCtrl.$inject = ['GroceryService', '$stateParams', '$state'];
    
    function AddCtrl(GroceryService, $stateParams, $state) {
        var vm = this;
        vm.product = {};
        vm.UPC12Exist = false;
        vm.cancel = function () {
            $state.go("list");
        };
        
        vm.save = function () {
            console.log("Saving the changes");
            GroceryService.isUPC12Exist(vm.product)
            .then(function (result) {
                console.info("Is UPC12 exist ?" + result);
                console.info("Is UPC12 exist ?" + result.data.sum);
                if(result.data.sum == 0){
                    GroceryService.add(vm.product)
                    .then(function (result) {
                        console.info("Product saved.");
                        $state.go("list");
                    }).catch(function (err) {
                        console.info("Some Error Occurred",err);
                    });
                }else{
                    vm.UPC12Exist = true;
                }
            }).catch(function (err) {
                console.info("Some Error Occurred",err);
            });
        }
    }
})();