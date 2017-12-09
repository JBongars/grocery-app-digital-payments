(function () {
    
    angular.module("MyGroceryApp")
            .service("GroceryService", GroceryService);

    GroceryService.$inject = ['$http', '$q'];        
    
    function GroceryService($http, $q) {
        var vm = this;

        vm.sum = function () {
            var defer = $q.defer();
            $http.get("/api/products/sum")
                .then(function (result) {
                    defer.resolve(result.data);
                })
                .catch(function (err) {
                    defer.reject(err);
                });

            return defer.promise;
        };

        vm.edit = function (productId) {
            var defer = $q.defer();
            $http.get("/api/products/" + productId)
                .then(function (result) {
                    defer.resolve(result.data);
                })
                .catch(function (err) {
                    defer.reject(err);
                });

            return defer.promise;
        };
        
        vm.save = function (product) {
            var defer = $q.defer();
            console.log(product.id);
            console.log(product);
            $http.put("/api/products/" + product.id, product)
                .then(function (result) {
                    defer.resolve(result);
                })
                .catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        };

        vm.add = function (product) {
            var defer = $q.defer();
            $http.post("/api/products/", product)
                .then(function (result) {
                    defer.resolve(result);
                })
                .catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        };

        vm.isUPC12Exist = function (product) {
            var defer = $q.defer();
            console.log(product.id);
            console.log(product);
            console.log(product.upc12);
            $http.get("/api/products/exist/" + product.upc12)
                .then(function (result) {
                    console.log(result);
                    defer.resolve(result);
                })
                .catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        };

        vm.remove = function (product) {
            var defer = $q.defer();
            $http.delete("/api/products/" + product.id)
                .then(function (result) {
                    defer.resolve(result);
                })
                .catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        };
        
        vm.search = function (searchType, keyword, sortBy, items, page) {
            var defer = $q.defer();
            var params = {
                searchType: searchType,
                keyword: keyword,
                sortBy: sortBy,
                items: items,
                page: page
            };
            $http.get("/api/products", {
                params: params
                }).then(function (results) {
                    console.log(results.data)
                    defer.resolve(results.data);
                }).catch(function (err) {
                    defer.reject(err);
                });
            return defer.promise;
        };
    }
    
})();