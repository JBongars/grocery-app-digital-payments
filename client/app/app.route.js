(function () {
    angular.module("MyGroceryApp")
        .config(GroceryConfig);

    GroceryConfig.$inject = ["$stateProvider", "$urlRouterProvider"];

    function GroceryConfig($stateProvider, $urlRouterProvider) {
        $stateProvider
            .state("list", {
                url: "/list",
                templateUrl: "/views/list.html",
                controller: "ListCtrl as ctrl"
            })
            .state("edit", {
                url: "/edit/:productId",
                templateUrl: "/views/edit.html",
                controller: "EditCtrl as ctrl"
            })
            .state("add", {
                url: "/add",
                templateUrl: "/views/add.html",
                controller: "AddCtrl as ctrl"
            });

        $urlRouterProvider.otherwise("/list");
    }

    
})();