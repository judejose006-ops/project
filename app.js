var app = angular.module("movieApp", ["ngRoute"]);

app.config(function($routeProvider) {

    $routeProvider

    .when("/", {
        templateUrl: "home.html"
    })

    .when("/about", {
        templateUrl: "about.html"
    })

    .when("/movies", {
        templateUrl: "movies.html",
        controller: "MovieController"
    })

    .otherwise({
        redirectTo: "/"
    });

});

app.controller("MovieController", function($scope, $http) {

    $scope.searchMovie = function() {

        var movieName = $scope.movie;

        $http.get(
            "https://www.omdbapi.com/?apikey=564727fa&s=" + movieName
        )
        .then(function(response) {

            $scope.movies = response.data.Search;

        }, function(error) {

            console.log(error);

        });

    };

});