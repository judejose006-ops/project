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

    var STORAGE_KEY = 'movieApp.collection.v1';


    function loadCollection() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch (e) {
            return [];
        }
    }

    function saveCollection() {
        localStorage.setItem(STORAGE_KEY, JSON.stringify($scope.movies));
    }

    $scope.movies = loadCollection(); 
    $scope.searchResults = []; 
    $scope.movie = '';
    $scope.newMovie = { Title: '', Year: '', Poster: '' };

    $scope.searchMovie = function() {
        var movieName = ($scope.movie || '').trim();
        if (!movieName) return;

        $http.get('https://www.omdbapi.com/?apikey=564727fa&s=' + encodeURIComponent(movieName))
        .then(function(response) {
            $scope.searchResults = response.data.Search || [];
        }, function(error) {
            console.log(error);
            $scope.searchResults = [];
        });
    };

    $scope.addToCollection = function(item) {
        
        var exists = $scope.movies.some(function(m) {
            return (item.imdbID && m.imdbID === item.imdbID) || (m.Title === item.Title && m.Year === item.Year);
        });
        if (exists) return;

        var movie = {
            id: item.imdbID || 'user-' + Date.now(),
            imdbID: item.imdbID,
            Title: item.Title || item.title || 'Untitled',
            Year: item.Year || item.year || '',
            Poster: item.Poster && item.Poster !== 'N/A' ? item.Poster : '',
            source: 'api',
            addedAt: Date.now()
        };

        $scope.movies.push(movie);
        saveCollection();
    };

    
    $scope.addMovie = function() {
        if (!$scope.newMovie.Title) return;

        var movie = {
            id: 'user-' + Date.now(),
            Title: $scope.newMovie.Title,
            Year: $scope.newMovie.Year || '',
            Poster: $scope.newMovie.Poster || '',
            source: 'user',
            addedAt: Date.now()
        };

        $scope.movies.push(movie);
        saveCollection();

    
        $scope.newMovie = { Title: '', Year: '', Poster: '' };
    };

   
    $scope.startEdit = function(m) {
        m._editing = true;
        m._backup = angular.copy(m);
    };

    $scope.saveEdit = function(m) {
        if (!m.Title) return; 
        m._editing = false;
        delete m._backup;
        saveCollection();
    };

    $scope.cancelEdit = function(m) {
        if (m._backup) {
            
            m.Title = m._backup.Title;
            m.Year = m._backup.Year;
            m.Poster = m._backup.Poster;
        }
        m._editing = false;
        delete m._backup;
    };

    $scope.deleteMovie = function(m) {
        var idx = $scope.movies.indexOf(m);
        if (idx >= 0) {
            $scope.movies.splice(idx, 1);
            saveCollection();
        }
    };

    
    $scope.totalMovies = function() {
        return $scope.movies.length;
    };

    $scope.lastAdded = function() {
        if (!$scope.movies.length) return null;
       
        var sorted = $scope.movies.slice().sort(function(a,b){ return (b.addedAt||0) - (a.addedAt||0); });
        return sorted[0];
    };

});
