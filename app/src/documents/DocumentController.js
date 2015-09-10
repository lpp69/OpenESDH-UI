(function(){
    
    angular
        .module('openeApp.documents')
        .controller('DocumentController', DocumentController);
    
    DocumentController.$inject = [ '$scope', '$stateParams', '$mdDialog', 'caseDocumentsService', 'documentPreviewService' ];
    
    function DocumentController($scope, $stateParams, $mdDialog, caseDocumentsService, documentPreviewService) {
    
        var caseId = $stateParams.caseId;
        var caseDocsFolderNodeRef = '';
        var vm = this;
        vm.caseId = caseId;
        vm.pageSize = 2;
        
        vm.loadDocuments = loadDocuments;
        vm.uploadDocument = uploadDocument;
        vm.previewDocument = previewDocument;
        vm.emailDocuments = emailDocuments;
        
        activate();
        
        function activate(){
            caseDocumentsService.getDocumentsFolderNodeRef(caseId).then(function(res){
                caseDocsFolderNodeRef = res.caseDocsFolderNodeRef;
            });
            loadDocuments(1);
        }
        
        function loadDocuments(page){
            var res = caseDocumentsService.getDocumentsByCaseId(caseId, page, vm.pageSize);
            res.then(function(response) {
                vm.documents = response.documents;
                vm.contentRange = response.contentRange;
                var pages = [];
                var pagesCount = Math.ceil(response.contentRange.totalItems / vm.pageSize); 
                for(var i=0; i < pagesCount; i++){
                    pages.push(i+1);
                }
                vm.pages = pages;
            });
        }
        
        function uploadDocument(ev){
            $mdDialog.show({
                controller: DialogController,
                templateUrl: 'app/src/documents/view/documentUploadDialog.html',
                parent: angular.element(document.body),
                targetEvent: ev,
                clickOutsideToClose:true
            })
            .then(function(fileToUpload) {
                if(!fileToUpload){
                    return;
                }
                caseDocumentsService.uploadCaseDocument(fileToUpload, caseDocsFolderNodeRef).then(function(result){
                    loadDocuments(1);
                });
            }, function() {
                //on cancel dialog
            });
        }
        
        function DialogController($scope, $mdDialog) {
            
            $scope.cancel = function() {
              $mdDialog.cancel();
            };
            
            $scope.upload = function(){
                $mdDialog.hide($scope.fileToUpload);
            };
        }
        
        function previewDocument(nodeRef){
            documentPreviewService.previewDocument(nodeRef);
        }

        function emailDocuments() {
            console.log('in emailDocuments');
        }
    }

})();
