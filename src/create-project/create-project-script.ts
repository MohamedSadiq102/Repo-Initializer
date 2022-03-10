import * as $ from "jquery";
import { ISourceOrganization, IUserOrganization, ISyLabs } from "./Icreate-project";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { AggregateItemProvider } from "azure-devops-ui/Utilities/AggregateItemProvider";

export class CreateProjectTS {
    // validate azure devops details
    public static ValidateAzureDevOpsInfo(userOrganization: IUserOrganization, component: any)
    {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/_apis/projects/" + userOrganization.u_PROJECT + "?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'GET',
            success: function (result) { 
                // validate project
                if(result.id != undefined)
                {
                    component.setState({
                        mandatoryFieldMessage: "Project already exist!",
                        mandatoryFieldStatus: true,
                        mandatoryField: component.mandatoryFields.find((fileds: any) => fileds.name == "Project")?.name,
                    });               
                }  
                // validate access token  
                else if(result != undefined && result.indexOf("Azure DevOps Services | Sign In") > -1)
                {
                    component.setState({
                        mandatoryFieldMessage: "Access token is invalid!",
                        mandatoryFieldStatus: true,
                        mandatoryField: component.mandatoryFields.find((fileds: any) => fileds.name == "AccessToken")?.name,
                    });               
                }         
            },
            error: function (request) {
                // resouce does not exist means project dones not exist and good to go
                if(request.status == 404)
                {
                    component.setState({
                        mandatoryFieldMessage: "",
                        mandatoryFieldStatus: false,
                        mandatoryField: "",
                        headerMessage: "Step 2/4: Sylabs Cloud Details",
                        step: 2
                    });
                }
                // validate organization
                else{
                    component.setState({
                        mandatoryFieldMessage: "The Token is Valid for another Orgnization not for your Organisation!",
                        mandatoryFieldStatus: true,
                        mandatoryField: component.mandatoryFields.find((fileds: any) => fileds.name == "Organization")?.name,
                    });
                }
            }             
        });
    }

    // create project
    public static CreateProject(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/_apis/projects?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'POST',
            data: JSON.stringify(
                {
                    "name": userOrganization.u_PROJECT,
                    "description": userOrganization.u_DESCRIPTION,
                    "capabilities": {
                        "versioncontrol": {
                            "sourceControlType": "Git"
                        },
                        "processTemplate": {
                            "templateTypeId": "adcc42ab-9882-485e-a3ed-7678f01f66bc"
                        }
                    }
                }
            ),
            contentType: 'application/json; charset=utf-8',
            success: function (result) { 
                // check if project exist
                if(result.id != undefined)
                {
                    // fetch project
                    setTimeout(() => {
                        CreateProjectTS.FetchProject(userOrganization, sourceOrganization, syLabs, component);
                    }, 3 * 1000); 
                } 
                else
                {
                    component.setState({
                        showMessage: true,
                        message: "Error: The entered Access token or Organization is vot valid. Please correct the values and try again!"
                    });
                }                             
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: The entered Access token or Organization is vot valid. Please correct the values and try again!"
                });                
            }
        });
    }

    // fetch projectId
    public static FetchProject(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/_apis/projects/" + userOrganization.u_PROJECT + "?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'GET',
            success: function (result) { 
                // update projectId
                userOrganization.u_PROJECT_ID = result.id;

                //fetch repositories
                CreateProjectTS.FetchRepsitories(userOrganization, sourceOrganization, syLabs, component);
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // fetch repositories
    public static FetchRepsitories(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/" + userOrganization.u_PROJECT + "/_apis/git/repositories?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'GET',
            success: function (result) { 
                // check repository exist
                if(result.count>0){
                    userOrganization.u_REPO_ID = result.value[0].id;

                    //crate service endpoint
                    CreateProjectTS.CreateServiceEndpoint(userOrganization, sourceOrganization, syLabs, component);                    
                }
                else
                {
                    setTimeout(() => {
                        //fetch repositories
                        CreateProjectTS.FetchRepsitories(userOrganization, sourceOrganization, syLabs, component);
                    }, 2 * 1000);                
                }                
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // create service endpoint
    public static CreateServiceEndpoint(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component:any) {
        component.setState({
            step: 4,
            loaderText: "Creating service endpoint..."
        });

        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/_apis/serviceendpoint/endpoints?api-version=6.0-preview.4";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'POST',
            data: JSON.stringify(
                {
                    "name": userOrganization.u_PROJECT + "-ServiceEndpoint",
                    "type": "git",
                    "url": "https://" + sourceOrganization.b_ORGANIZATION + "@dev.azure.com/" + sourceOrganization.b_ORGANIZATION + "/" + sourceOrganization.b_PROJECT + "/_git/" + sourceOrganization.b_PROJECT,
                    "authorization": {
                      "parameters": {
                        "username": "",
                        "password": sourceOrganization.b_PAT
                      },
                      "scheme": "UsernamePassword"
                    },
                    "isShared": false,
                    "isReady": true,
                    "serviceEndpointProjectReferences": [
                      {
                        "projectReference": {
                          "id": userOrganization.u_PROJECT_ID,
                          "name": userOrganization.u_PROJECT
                        },
                        "name": sourceOrganization.b_PROJECT + "-ServiceEndpoint"
                      }
                    ]
                  }
            ),
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                // update servicec endpointId                
                userOrganization.u_SERVICE_ENDPOINT = result.id;

                //clone repository
                setTimeout(() => {
                    CreateProjectTS.CloneRepository(userOrganization, sourceOrganization, syLabs, component);
                }, 3 * 1000);                                 
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // clone repsitory
    public static CloneRepository(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        component.setState({
            step: 4,
            loaderText: "Cloning repository..."
        });
        
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/" + userOrganization.u_PROJECT + "/_apis/git/repositories/" + userOrganization.u_REPO_ID + "/importRequests?api-version=6.0-preview.1";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'POST',
            data: JSON.stringify(
                {
                    "parameters": {
                        "gitSource": {
                            "url": "https://" + sourceOrganization.b_ORGANIZATION + "@dev.azure.com/" + sourceOrganization.b_ORGANIZATION + "/" + sourceOrganization.b_PROJECT + "/_git/" + sourceOrganization.b_PROJECT
                        },
                        "serviceEndpointId": userOrganization.u_SERVICE_ENDPOINT
                    }
                }
            ),
            contentType: 'application/json; charset=utf-8',
            success: function(result){
                //clone repository
                CreateProjectTS.FetchBuildefinition(userOrganization, sourceOrganization, syLabs, component);
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // fetch build definition
    public static FetchBuildefinition(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + sourceOrganization.b_ORGANIZATION + "/" + sourceOrganization.b_PROJECT + "/_apis/build/definitions?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + sourceOrganization.b_PAT) },
            type: 'GET',
            success: function(result){
                // update build definition Id
                userOrganization.b_BUILD_DEF_ID = result.value[0].id;
                
                // fetch pipeline
                CreateProjectTS.FetchPipeline(userOrganization, sourceOrganization, syLabs, component)
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // fetch pipeline
    public static FetchPipeline(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + sourceOrganization.b_ORGANIZATION + "/" + sourceOrganization.b_PROJECT + "/_apis/build/definitions/" + userOrganization.b_BUILD_DEF_ID + "?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + sourceOrganization.b_PAT) },
            type: 'GET',
            success: function(result){
                // create build definition
                CreateProjectTS.CreateBuildDefinitions(userOrganization, sourceOrganization, syLabs, component);
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // create build definitions
    public static CreateBuildDefinitions(userOrganization: IUserOrganization, sourceOrganization: ISourceOrganization, syLabs: ISyLabs, component: any) {
        component.setState({
            step: 4,
            loaderText: "Creating build definition..."
        });
        
        // create endpoint
        let endpoint: string = "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/" + userOrganization.u_PROJECT + "/_apis/build/definitions?api-version=6.0";
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + userOrganization.u_PAT) },
            type: 'POST',
            data: JSON.stringify(
                {
                    "triggers": [
                        {
                            "branchFilters": [
                                "+master"
                            ],
                            "pathFilters": [],
                            "batchChanges": false,
                            "maxConcurrentBuildsPerBranch": 1,
                            "triggerType": "continuousIntegration"
                        }
                    ],
                    "variables": {
                        "git_token": {
                            "value": sourceOrganization.b_GIT_TOKEN,
                            "allowOverride": true,
                            "isSecret": true
                        },
                        "image_name": {
                            "value": syLabs.v_IMAGE_NAME,
                            "allowOverride": true
                        },
                        "image_tag": {
                            "value": syLabs.v_IMAGE_TAG,
                            "allowOverride": true
                        },
                        "is_signed": {
                            "value": syLabs.v_IS_SIGNED.toString().toLowerCase(),
                            "allowOverride": true
                        },
                        "organization": {
                            "value": userOrganization.u_ORGANIZATION,
                            "allowOverride": true
                        },
                        "pat": {
                            "value": userOrganization.u_PAT,
                            "allowOverride": true,
                            "isSecret": true
                        },
                        "project": {
                            "value": userOrganization.u_PROJECT,
                            "allowOverride": true
                        },
                        "signkey_comment": {
                            "value": syLabs.v_SIGNKEY_COMMENT,
                            "allowOverride": true
                        },
                        "signkey_email": {
                            "value": syLabs.v_SIGNKEY_EMAIL,
                            "allowOverride": true,
                            "isSecret": true
                        },
                        "signkey_fullname": {
                            "value": syLabs.v_SIGNKEY_FULLNAME,
                            "allowOverride": true
                        },
                        "signkey_passphrase": {
                            "value": syLabs.v_SIGNKEY_PASSPHRASE,
                            "allowOverride": true,
                            "isSecret": true
                        },
                        "sylabs_collection": {
                            "value": syLabs.v_SYLABS_COLLECTION,
                            "allowOverride": true
                        },
                        "sylabs_description": {
                            "value": syLabs.v_SYLABS_DESCRIPTION,
                            "allowOverride": true
                        },
                        "sylabs_token": {
                            "value": syLabs.v_SYLABS_TOKEN,
                            "allowOverride": true,
                            "isSecret": true
                        },
                        "sylabs_user": {
                            "value": syLabs.v_SYLABS_USER,
                            "allowOverride": true
                        }
                    },
                    "properties": {},
                    "tags": [],
                    "jobAuthorizationScope": "projectCollection",
                    "jobTimeoutInMinutes": 60,
                    "jobCancelTimeoutInMinutes": 5,
                    "process": {
                        "yamlFilename": "pipeline.yml",
                        "type": 2
                    },
                    "repository": {
                        "properties": {
                            "cloneUrl": "https://" + userOrganization.u_ORGANIZATION + "@dev.azure.com/" + userOrganization.u_ORGANIZATION + "/" + userOrganization.u_PROJECT + "/_git/" + userOrganization.u_PROJECT,
                            "fullName": userOrganization.u_PROJECT,
                            "defaultBranch": "refs/heads/master",
                            "isFork": "False",
                            "safeRepository": userOrganization.u_REPO_ID,
                            "reportBuildStatus": "true",
                            "cleanOptions": "0",
                            "fetchDepth": "0",
                            "gitLfsSupport": "false",
                            "skipSyncSource": "false",
                            "checkoutNestedSubmodules": "false",
                            "labelSources": "0",
                            "labelSourcesFormat": "$(build.buildNumber)"
                        },
                        "id": userOrganization.u_REPO_ID,
                        "type": "TfsGit",
                        "name": userOrganization.u_PROJECT,
                        "url": "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/" + userOrganization.u_PROJECT + "/_git/" + userOrganization.u_PROJECT,
                        "defaultBranch": "master",
                        "clean": null,
                        "checkoutSubmodules": false
                    },
                    "quality": "definition",
                    "drafts": [],
                    "queue": {
                        "pool": {
                            "id": 9,
                            "name": "Azure Pipelines",
                            "isHosted": true
                        }
                    },
                    "name": userOrganization.u_PROJECT,
                    "path": "\\",
                    "type": "build",
                    "queueStatus": "enabled",
                    "project": {
                        "id": userOrganization.u_PROJECT_ID,
                        "name": userOrganization.u_PROJECT,
                        "description": userOrganization.u_DESCRIPTION,
                        "url": "https://dev.azure.com/" + userOrganization.u_ORGANIZATION + "/_apis/projects/" + userOrganization.u_PROJECT_ID,
                        "state": "wellFormed",
                        "visibility": "private"
                    }
                }
            ),
            contentType: 'application/json; charset=utf-8',
            success: function () { 
                component.setState({
                    showMessage: false,
                    message: "Success: ",
                    step: 6,
                    headerMessage: ""
                });                            
            },
            error: function (request) {
                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message
                });
            }
        });
    }

    // fetch organizations
    public static async FetchOrganizations(component: any) {
        // create endpoint
        let endpoint: string = "https://app.vssps.visualstudio.com/_apis/accounts?memberId=" + component.memberId + "&api-version=6.0";
        let accounts = new AggregateItemProvider<IListBoxItem>();
        $.ajax({
            url: endpoint,
            headers: { 'Authorization': "Basic " + window.btoa(":" + component.state.accessToken) },
            type: 'GET',
            success: function (result) {
                if(result != undefined && result.count == undefined && result.indexOf("Azure DevOps Services | Sign In") > -1)
                {
                    let accountsddl = new AggregateItemProvider<IListBoxItem>();
            
                    accountsddl.push([
                        { id: component.currentOrganization, text: component.currentOrganization }
                    ]);

                    component.setState({
                        accounts: accountsddl,
                        organization: component.currentOrganization
                    });
                }
                else
                {
                    result.value.forEach((output: any) => {
                        let data: IListBoxItem[] = [
                            { id: output.accountId, text: output.accountName }
                        ];

                        accounts.push(data);
                    });

                    component.setState({
                        accounts: accounts,
                        organization: accounts.value[0].text
                    });
                }
            },
            error: function (request) {
                let accountsddl = new AggregateItemProvider<IListBoxItem>();
            
                accountsddl.push([
                    { id: component.currentOrganization, text: component.currentOrganization }
                ]);

                component.setState({
                    showMessage: true,
                    message: "Error: " + request.responseJSON.message,
                    accounts: accountsddl,
                    organization: component.currentOrganization
                });
            }
        });
    }
} 