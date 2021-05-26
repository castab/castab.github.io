(function () {
    angular.module('app', ['ngAnimate', 'ngRoute'])
    .controller('mainCtrl', ['$location', '$rootScope', 'projectDataService', function($location, $rootScope, projectDataService) {

        var vm = this;
        vm.exists = true;
        vm.buttonClicked = false;
        vm.projectData = {};
        vm.introComplete = false;
        vm.introSlide = 'slide';

        vm.click = function() {
            vm.exists = false;
            vm.buttonClicked = true;
        }
        vm.clickStart = function() {
            vm.introComplete = true;
            $location.path('/menu')
            vm.exists = true;
            vm.buttonClicked = false;
            vm.introComplete = false;
        }

        vm.changePage = function(project) {
            projectDataService.changePage(project);
            vm.currentProject = project;
        }

        projectDataService.getProjectData()
        .then(function(resp) {
            vm.projectData = resp;
            vm.currentProject = vm.projectData.current.projects[0];
        }, function(error) {
            console.log('There was an error fetching the data.');
        });

        $rootScope.$on('$routeChangeSuccess', function() {
            window.scrollTo(0,0);
            var slash = '/';
            // This doesn't need to run on the '/menu' or '/' pages
            if (!($location.path() == '/menu' || $location.path() == '/')) {
                vm.introSlide = '';
                // Need to evaluate what project should be loaded
                // Check if vm.projectData has content
                if (vm.projectData.current) {
                    // Looks like content is loaded
                    // Check if current project and route match up
                    if (!(slash.concat(vm.currentProject.route) == $location.path())) {
                        // Mismatch, clear it so it doesn't show up on the page
                        vm.currentProject = {};
                        // Then get correct current project and load it
                        _.forEach(vm.projectData, function(currentOrPreviousProjects) {
                            _.forEach(currentOrPreviousProjects.projects, function(project) {
                                if (slash.concat(project.route) == $location.path()) {
                                    vm.changePage(project);
                                    return false;
                                }
                            })
                        })
                    }
                }
            } else if ($location.path() == "/") {
                vm.introSlide = 'slide';
            }
        });

    }])
    .controller('navbarCtrl', ['$location', 'projectDataService', function($location, projectDataService) {
        var vm = this;
        vm.projectData = {};

        vm.isNavbarActive = function() {
            if ($location.path() != '/') {
                return true;
            } else {
                return false;
            }
        };
        vm.changePage = function(project) {
            projectDataService.changePage(project);
        };
        
        projectDataService.getProjectData()
        .then(function(resp) {
            vm.projectData = resp;
        }, function(error) {
            console.log("Failed to load Navbar project data")
        })

    }])
    .controller('preloadCtrl', [ '$scope', 'projectDataService', function($scope, projectDataService) {
        var vm = this;
        vm.imageUrls = [];

        vm.prepareImageUrls = function() {
            _.forEach(vm.projectData, function(currentOrPreviousProjects) {
                _.forEach(currentOrPreviousProjects.projects, function(project) {
                    vm.imageUrls.push(project.project_card_image_url);
                })
            })
        }

        projectDataService.getProjectData()
        .then(function(resp) {
            vm.projectData = resp;
            vm.prepareImageUrls();
        }, function(error) {
            console.log("Failed to load preload project data")
        })
    }])
    .service('projectDataService', ['$http', '$location', '$q', function($http, $location, $q) {
        var vm = this;
        vm.projectData = {};

        vm.changePage = function(project) {
            vm.currentProject = project;
            $('.navbar-collapse').collapse('hide');
            $location.path(project.route);
        };
        vm.getCurrentProject = function() {
            if (vm.currentProject) {
                return vm.currentProject;
            };
        };
        vm.getProjectData = function() {
            var defer = $q.defer(); // Start up a promise object
            if (vm.projectData.current) {
                // Data has already been loaded, resolve the promise with payload
                defer.resolve(vm.projectData);
            } else {
                // Data has not been loaded, fetch it
                $http.get('./data/data.json').then(
                    function(resp) {
                        vm.projectData = resp.data.projects;
                        vm.currentProject = vm.projectData.current.projects[0];
                        // All set, resolve the promise with payload
                        defer.resolve(vm.projectData);
                    },
                    function (error) {
                        console.log("error getting data");
                        // Can't get it for some reason, reject with error
                        defer.reject(error);
                    }
                );
            }
            // Return the promise object
            return defer.promise;
        };
        vm.isNavbarActive = function() {
            if ($location.path() != '/') {
                return true;
            } else {
                return false;
            }
        };
    }])
    .component('navbar', {
        templateUrl: 'navbar.html',
        controller: 'navbarCtrl',
        controllerAs: 'vm'
    })
    .animation('.jqslide', [function() {
        return {
            enter: function(element, doneFn) {
                element.css('display', 'none');
                jQuery(element).slideDown('slow', doneFn);
                return function(isCancelled) {
                    element.stop();
                }
            },
            leave: function(element, doneFn) {
                jQuery(element).slideUp('slow', doneFn);
                return function(isCancelled) {
                    element.stop();
                }
            }
        }
    }])
    .filter('trustUrl', ['$sce', function($sce) {
        return function(url) {
            return $sce.trustAsResourceUrl(url);
        }
    }])
    .config(['$routeProvider', function($routeProvider) {
        $routeProvider
        .when("/", {
            templateUrl: "intro.html"
        })
        .when("/menu", {
            templateUrl: "menu.html"
        })
        .when("/rgbleds", {
            templateUrl: "project.html"
        })
        .when("/webdev", {
            templateUrl: "project.html"
        })
        .when("/iot", {
            templateUrl: "project.html"
        })
        .when("/clmc", {
            templateUrl: "project.html"
        })
        .when("/slam", {
            templateUrl: "project.html"
        })
        .when("/wildwest", {
            templateUrl: "project.html"
        })
        .when("/bluetooth", {
            templateUrl: "project.html"
        })
        .when("/aboutme", {
            templateUrl: "project.html"
        })
        .otherwise( {
            redirectTo: "/menu"
        })
    }])

})();