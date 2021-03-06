
    angular
        .module('openeApp.workflows')
        .controller('StartSingleRecipientWorkflowController', StartSingleRecipientWorkflowController);
    
    function StartSingleRecipientWorkflowController($controller, userService, workflowDef) {
        
        angular.extend(this, $controller('BaseStartCaseWorkflowController', {}));
        var vm = this;
        vm.workflowDef = workflowDef;
        vm.BaseStartCaseWorkflowController_getWorkflowInfo = vm.getWorkflowInfo;
        vm.getWorkflowInfo = getWorkflowInfo;
        
        init();
        
        function init(){
            vm.init();
            userService.getPersons().then(function(result){
                vm.recipients = result;
            });
        }
        
        function getWorkflowInfo(){
            var wi = vm.BaseStartCaseWorkflowController_getWorkflowInfo();
            angular.merge(wi, {
                assignTo: vm.selectedRecipient
            });
            return wi;
        }

    }