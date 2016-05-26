
angular
        .module('openeApp.files')
        .controller('FilesController', FilesController);

function FilesController($scope, $injector, filesService, $translate, $mdDialog, notificationUtilsService,
        alfrescoDownloadService, documentPreviewService, fileListItemActionService, sessionService) {
    var vm = this;
    vm.tab = 'my_files';
    vm.files = [];
    vm.loadList = loadList;

    vm.showAddFileDialog = showAddFileDialog;
    vm.downloadFile = downloadFile;
    vm.previewFile = previewFile;
    vm.deleteFile = deleteFile;
    vm.assignFile = assignFile;
    vm.addToCase = addToCase;
    vm.showComments = showComments;

    vm.actionItems = fileListItemActionService.getItems();
    vm.executeAction = executeAction;
    
    vm.columns = initColumns();

    vm.filterArray = {};
    vm.columnFilter = columnFilter;

    filesService.getUserFilesFolderRef(sessionService.getUserInfo().user.userName).then(function(response){
        vm.filesFolderNodeRef = response.nodeRef;
    });
    
    function loadList() {
        vm.files = [];
        var listF = vm.tab === 'my_files'
                ? filesService.getUserFiles
                : filesService.getGroupFiles;
        listF().then(function(files) {
            vm.files = files;
        }, showError);
    }

    function downloadFile(file) {
        alfrescoDownloadService.downloadFile(file.nodeRef, file.cm.title);
    }

    function previewFile(file) {
        documentPreviewService.previewDocument(file.nodeRef);
    }

    function deleteFile(file) {
        var vm = this;
        var confirm = $mdDialog.confirm()
                .title($translate.instant('COMMON.CONFIRM'))
                .textContent($translate.instant('FILE.ARE_YOU_SURE_YOU_WANT_TO_DELETE_FILE', {title: file.cm.title}))
                .ariaLabel('File delete confirmation')
                .targetEvent(null)
                .ok($translate.instant('COMMON.YES'))
                .cancel($translate.instant('COMMON.CANCEL'));
        $mdDialog.show(confirm).then(function() {
            filesService.deleteFile(file.nodeRef)
                    .then(function() {
                        vm.loadList();
                        notificationUtilsService.notify($translate.instant('FILE.DELETE_FILE_SUCCESS'));
                    });
        });
    }

    function showAddFileDialog(ev) {
        $mdDialog.show({
            controller: 'AddFileDialogController',
            controllerAs: 'addFileVm',
            templateUrl: 'app/src/files/view/addFiles.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                filesAddDialogService: {
                    addFiles: addFiles
                }
            }
        }).then(function(){
            vm.loadList();
        });
    }
    
    function addFiles(model) {
        return filesService.uploadOwnerFiles(model.owner, model.files, model.comment);
    }

    function assignFile(ev, file) {
        $mdDialog.show({
            controller: 'AssignFileDialogController',
            controllerAs: 'assignFileVm',
            templateUrl: 'app/src/files/view/assignFile.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                file: file
            }
        }).then(function(){
            vm.loadList();
        });
    }

    function addToCase(ev, file) {
        $mdDialog.show({
            controller: 'AddFileToCaseDialogController',
            controllerAs: 'addToCaseVm',
            templateUrl: 'app/src/files/view/addFileToCase.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                file: file
            }
        }).then(function(){
            vm.loadList();
        });
    }

    function showComments(ev, file) {
        var vm = this;
        $mdDialog.show({
            controller: 'FileCommentsDialogController',
            controllerAs: 'fileCommentsVm',
            templateUrl: 'app/src/files/view/fileComments.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            locals: {
                file: file
            }
        }).then(function(){
            vm.loadList();
        });
    }

    function executeAction(file, menuItem) {
        var vm = this;
        var service = $injector.get(menuItem.serviceName);
        service.executeFileAction(file, function(){
            vm.loadList();
        }, showError, $scope);
    }

    function showError(error) {
        if (error && error.domain) {
            notificationUtilsService.alert(error.message);
        }
    }
    
    function initColumns(){
        return {
            title: true,
            comment: true,
            created: true,
            creator: true,
            modified: true,
            modifier: true,
            action: true
        };
    }

    function columnFilter(item) {
        if (vm.filterArray.title) {
            var searchText = new RegExp(vm.filterArray.title, "i");
            var title = item["title"];
            if (title.search(searchText) < 0)
                return;
        }

        if (vm.filterArray.group) {
            var searchText = new RegExp(vm.filterArray.group, "i");
            var group = item["group"];
            if (group.search(searchText) < 0)
                return;
        }

        if (vm.filterArray.comment) {
            var searchText = new RegExp(vm.filterArray.comment, "i");
            var comment = item["comments"][0]["comment"];
            if (comment.search(searchText) < 0)
                return;
        }


        if (vm.filterArray.created !== undefined) {
            if (!vm.filterArray.created)
                return item;
            var d1a = Date.parse(vm.filterArray.created);
            var d1b = d1a + (24 * 60 * 60 * 1000);
            var d2 = item["created"];
            if (!(d2 >= d1a && d2 < d1b))
                return;
        }

        if (vm.filterArray.creator) {
            var searchText = new RegExp(vm.filterArray.creator, "i");
            var creator = item["creator"];
            if (creator.search(searchText) < 0)
                return;
        }

        if (vm.filterArray.modified !== undefined) {
            if (!vm.filterArray.modified)
                return item;
            var d1a = Date.parse(vm.filterArray.modified);
            var d1b = d1a + (24 * 60 * 60 * 1000);
            var d2 = item["modified"];
            if (!(d2 >= d1a && d2 < d1b))
                return;
        }

        if (vm.filterArray.modifier) {
            var searchText = new RegExp(vm.filterArray.modifier, "i");
            var modifier = item["modifier"];
            if (modifier.search(searchText) < 0)
                return;
        }

        return item;
    }
}
