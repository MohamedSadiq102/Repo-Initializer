//#region packages
import { Image } from "azure-devops-ui/Image";
import * as React from "react";
import * as VSS from "azure-devops-extension-sdk";
import { Link } from "azure-devops-ui/Link";
import { Dropdown } from "azure-devops-ui/Dropdown";
import { DropdownSelection } from "azure-devops-ui/Utilities/DropdownSelection";
import { Page } from "azure-devops-ui/Page";
import { Button } from "azure-devops-ui/Button";
import { FormItem } from "azure-devops-ui/FormItem";
import { TextField } from "azure-devops-ui/TextField";
import { Card } from "azure-devops-ui/Card";
import { Spinner, SpinnerSize } from "azure-devops-ui/Spinner";
import { Status, Statuses, StatusSize } from "azure-devops-ui/Status";
import { Toggle } from "azure-devops-ui/Toggle";
import { IListBoxItem } from "azure-devops-ui/ListBox";
import { MessageCard, MessageCardSeverity } from "azure-devops-ui/MessageCard";
import { AggregateItemProvider } from "azure-devops-ui/Utilities/AggregateItemProvider";
import { Icon, IconSize } from "azure-devops-ui/Icon";
import "./create-project.scss";
import { showRootComponent } from "../common";
import {CreateProjectTS} from "./create-project-script"
import { ISourceOrganization, ICreateProject, IMandatoryFields, ISyLabs, IUserOrganization } from "./Icreate-project";
import "./iconFont.css";
//#endregion

class CreateProject extends React.Component<{}, ICreateProject> {
    // accounts
    private accounts = new AggregateItemProvider<IListBoxItem>();
    private memberId = "";
    private currentOrganization = "";
    private selection = new DropdownSelection();

    // source organization
    private sourceOrganization: ISourceOrganization = {
        b_ORGANIZATION: "s0556006",
        b_PROJECT: "B.A.S.I.C",
        b_REPO_ID: "f083c037-afaa-4866-b0a2-a592ef003c80",
        b_PAT: "fitw5ja5dc7icbblaakvhwofhny4ch5zfaj6vcwv6gz2teptdr4q",
        b_GIT_TOKEN: "m5q3hl6y4a2zzzs3fqi2a4iuqauk46rrzt3afyoejb5lmvosmd7a"
    } as ISourceOrganization;

    // user's organization
    private userOrganization: IUserOrganization= {
        u_PAT: "", 
        u_ORGANIZATION: "", 
        u_PROJECT: "", 
        u_DESCRIPTION: "", 
        u_PROJECT_ID:"", 
        u_REPO_ID:"", 
        u_SERVICE_ENDPOINT:"", 
        b_BUILD_DEF_ID:""
    };

    // sylabs
    private syLabs: ISyLabs = {
        v_IMAGE_NAME: "",
        v_IMAGE_TAG: "",
        v_IS_SIGNED: true,
        v_SIGNKEY_COMMENT: "",
        v_SIGNKEY_EMAIL: "",
        v_SIGNKEY_FULLNAME: "",
        v_SIGNKEY_PASSPHRASE: "LDsmtRXnyFEAf2vxUq28DPHT6WU97VYL",
        v_SYLABS_COLLECTION: "",
        v_SYLABS_DESCRIPTION: "",
        v_SYLABS_USER: "",
        v_SYLABS_TOKEN: ""
    }

    // mandatory fields
    private mandatoryFields: IMandatoryFields[] = [
        {name: "AccessToken"}, 
        {name: "Organization"}, 
        {name: "Project"}, 
        {name: "ProjectDescription"}, 
        {name: "ImageName"},
        {name: "ImageTag"},
        {name: "IsSigned"},
        {name: "SignKeyComment"},
        {name: "SignKeyEmail"},
        {name: "SignKeyFullName"},
        {name: "SignKeyPassPharse"},
        {name: "SyLabsCollection"},
        {name: "SyLabsDescription"},
        {name: "SyLabsToken"},
        {name: "SyLabsUser"}
    ];
    
    public constructor(props: {}) {
        super(props);      
          
        // Select the first item by default.
        this.selection.select(0);

        //initializeIcons();
        // set state
        this.state = {
            mandatoryFieldStatus: false,
            mandatoryFieldMessage: "",
            mandatoryField: "",
            headerMessage: "Step 1/4: Azure DevOps Details",
            step: 1,
            loaderText: "",
            showMessage: false,
            message: "",
            accessToken: "",
            organization: "",
            project: "",
            projectDescription: "",
            syLabsuser: "",
            syLabsToken: "",
            imageName: "",
            imageTag: "",
            isSigned: true,
            signKeyComment: "",
            signKeyEmail: "",
            signKeyFullName: "",
            syLabsCollection: "",
            syLabsDescription: "",
            accounts: this.accounts
        };
    }

    public componentDidMount() {
        VSS.init().then(() => {
            explicitNotifyLoaded: true;
            this.memberId = VSS.getUser().id;  
            this.currentOrganization = VSS.getHost().name;

            let accountsddl = new AggregateItemProvider<IListBoxItem>();
            
            accountsddl.push([
                { id: this.currentOrganization, text: this.currentOrganization }
            ]);
            this.setState({
                accounts: accountsddl,
                organization: this.currentOrganization
            });
        });
    }

    public render(): JSX.Element {
        // validate azure devops details
        const onSubmitAzureDevOpsDetails = (): void => {
            if(this.state.accessToken == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Access token!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "AccessToken")?.name,
                });          
            }  
            else if(this.state.organization == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Organization name!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "Organization")?.name,
                });
            } 
            else if(this.state.project == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Project name!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "Project")?.name,
                });
            } 
            else if(this.state.project.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "Project name should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "Project")?.name,
                });
            } 
            else if(this.state.projectDescription == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Project description!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "ProjectDescription")?.name,
                });
            }      
            else
            {
                this.userOrganization.u_PAT = this.state.accessToken;
                this.userOrganization.u_ORGANIZATION = this.state.organization;
                this.userOrganization.u_PROJECT = this.state.project;
                this.userOrganization.u_DESCRIPTION = this.state.projectDescription;

                CreateProjectTS.ValidateAzureDevOpsInfo(this.userOrganization, this);
            }   
        }

        // validate sylabs details
        const onSubmitSylabsNext = (): void => {
            if(this.state.syLabsuser == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter SyLabs user!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsUser")?.name,
                });                
            }  
            else if(this.state.syLabsToken == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter Sylabs token!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsToken")?.name,
                });
            } 
            else if(this.state.imageName == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Image name!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "ImageName")?.name,
                });
            } 
            else if(this.state.imageName.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "Image name should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "ImageName")?.name,
                });
            }
            else if(this.state.imageTag == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter the Image tag!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "ImageTag")?.name,
                });
            }      
            else
            {
                this.syLabs.v_SYLABS_USER = this.state.syLabsuser;
                this.syLabs.v_SYLABS_TOKEN = this.state.syLabsToken;
                this.syLabs.v_IMAGE_NAME = this.state.imageName;
                this.syLabs.v_IMAGE_TAG = this.state.imageTag;
                this.syLabs.v_IS_SIGNED = this.state.isSigned;

                this.setState({
                    mandatoryFieldMessage: "",
                    mandatoryFieldStatus: false,
                    mandatoryField: "",
                    headerMessage: "Step 3/4: Sylabs Cloud Details",
                    step: 3
                });                              
            }   
        }

        // validate syslabs details and then process request
        const onSubmitSylabsSubmit = (): void => {
            if(this.state.signKeyComment == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter Sign key comment!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SignKeyComment")?.name,
                });                
            }  
            else if(this.state.signKeyEmail == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter Sign key email!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SignKeyEmail")?.name,
                });
            } 
            else if(this.state.signKeyFullName == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter Sign key full name!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SignKeyFullName")?.name,
                });
            } 
            else if(this.state.syLabsCollection == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter SyLabs collection!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsCollection")?.name,
                });
            }
            else if(this.state.syLabsCollection.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "SyLabs collection should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsCollection")?.name,
                });
            }
            else if(this.state.syLabsDescription == "")
            {
                this.setState({
                    mandatoryFieldMessage: "Please enter SyLabs description!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsDescription")?.name,
                });
            }      
            else
            {
                this.syLabs.v_SIGNKEY_COMMENT = this.state.signKeyComment;
                this.syLabs.v_SIGNKEY_EMAIL = this.state.signKeyEmail;
                this.syLabs.v_SIGNKEY_FULLNAME = this.state.signKeyFullName;
                this.syLabs.v_SYLABS_COLLECTION = this.state.syLabsCollection;
                this.syLabs.v_SYLABS_DESCRIPTION = this.state.syLabsDescription;

                this.setState({
                    mandatoryFieldMessage: "",
                    mandatoryFieldStatus: false,
                    mandatoryField: "",
                    headerMessage: "Step 4/4: Provision",
                    step: 4,
                    loaderText: "Creating project..."
                });
                CreateProjectTS.CreateProject(this.userOrganization, this.sourceOrganization, this.syLabs, this);
            }   
        }

        // validate project name
        const onProjectChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
            this.setState({
                project: newValue,
            });

            if(newValue.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "Project name should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "Project")?.name,
                });
            }
            else{
                this.setState({
                    mandatoryFieldMessage: "",
                    mandatoryFieldStatus: false,
                });                
            }
        };

        // validate sylabs collection name
        const onSyLabsCollectionChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
            this.setState({
                syLabsCollection: newValue.toLowerCase(),
            });

            if(newValue.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "SyLabs collection should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "SyLabsCollection")?.name,
                });
            }
            else{
                this.setState({
                    mandatoryFieldMessage: "",
                    mandatoryFieldStatus: false,
                });                
            }
        };

        // validate image name
        const onImageNameChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, newValue: string) => {
            this.setState({
                imageName: newValue.toLowerCase(),
            });

            if(newValue.indexOf(" ") > -1)
            {
                this.setState({
                    mandatoryFieldMessage: "Image name should be without space!",
                    mandatoryFieldStatus: true,
                    mandatoryField: this.mandatoryFields.find(fileds => fileds.name == "ImageName")?.name,
                });
            }
            else{
                this.setState({
                    mandatoryFieldMessage: "",
                    mandatoryFieldStatus: false,
                });                
            }
        };

        return (
            <Page className="page flex-grow">
                <div className="page-content">                    
                    <div className="flex-column flex-column-margin">
                        <Button
                            text="Configure Project"
                            primary={true}
                            className="header"
                        />  
                        {this.state.showMessage && 
                            <MessageCard
                                className="flex-self-stretch message-card"
                                onDismiss={() => (this.setState({showMessage: false}))}
                                severity={MessageCardSeverity.Error}
                            >
                                {this.state.message}
                            </MessageCard>
                        }                                              
                        <Card className="flex-grow card" titleProps={{ text: this.state.headerMessage, ariaLevel: 3 }}>                                
                            { this.state.step == 1 && 
                                <div className="flex-row" style={{ flexWrap: "wrap" }}>
                                    <div className="flex-column flex-column-div" >
                                        <FormItem label="Access Token *" className="textbox" message={this.state.mandatoryField=="AccessToken" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="AccessToken"}>
                                            <Link className="link-azuredevops-img-info" tooltipProps={{ text: "Click to know about Personal Access Tokens" }} onClick={() => window.open("https://docs.microsoft.com/en-us/azure/devops/organizations/accounts/use-personal-access-tokens-to-authenticate?view=azure-devops&tabs=Windows")}>
                                                <Image alt="Access Token" src="../AzureDevOps.png" className="img-azuredevops-info" />
                                            </Link>
                                            <TextField
                                                value={this.state.accessToken}
                                                onChange={(e, newValue) => (this.setState({accessToken: newValue}))}                                                    
                                                placeholder="Personal Access Token"
                                                inputType="password"
                                                onBlur={() => (CreateProjectTS.FetchOrganizations(this))}
                                            />
                                        </FormItem>
                                        <FormItem label="Organization *" className="textbox" message={this.state.mandatoryField=="Organization" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="Organization"}>
                                            <Dropdown
                                                ariaLabel="Basic"
                                                className="example-dropdown"
                                                items={this.state.accounts.value}
                                                onSelect={(e, item) => (this.setState({organization: item.text}))}
                                                selection={this.selection}
                                            />                                            
                                        </FormItem>
                                        <FormItem label="Project *" className="textbox" message={this.state.mandatoryField=="Project" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="Project"}>
                                            <TextField
                                                value={this.state.project}
                                                onChange={onProjectChange}
                                                placeholder="Project Name Without Space"
                                            />
                                        </FormItem>
                                        <FormItem label="Project Description *" className="textbox" message={this.state.mandatoryField=="ProjectDescription" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="ProjectDescription"}>
                                            <TextField
                                                value={this.state.projectDescription}
                                                onChange={(e, newValue) => (this.setState({projectDescription: newValue}))}
                                                multiline
                                                rows={6}
                                                placeholder="Project Description"
                                            />
                                        </FormItem>
                                        <div className="submit-div">
                                            <Button
                                                    text="Next"
                                                    primary={true}
                                                    onClick={onSubmitAzureDevOpsDetails}
                                                    className="submit"
                                                />
                                        </div>
                                    </div>
                                </div>
                            }   
                            { this.state.step == 2 && 
                                <div className="flex-row" style={{ flexWrap: "wrap" }}>
                                    <div className="flex-column flex-column-div" >
                                        <FormItem label="SyLabs User *" className="textbox" message={this.state.mandatoryField=="SyLabsUser" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SyLabsUser"}>
                                            <Link className="link-sylabs-user-img-info" tooltipProps={{ text: "Click to login to SyLabs" }} onClick={() => window.open("https://cloud.sylabs.io/")}>
                                                <Image alt="Access Token" src="../SyLabs.png" className="img-sylabs-user-info" />
                                            </Link>
                                            <TextField
                                                value={this.state.syLabsuser}
                                                onChange={(e, newValue) => (this.setState({syLabsuser: newValue}))}
                                                placeholder="SyLabs User"
                                            />
                                        </FormItem>
                                        <FormItem label="SyLabs Token *" className="textbox" message={this.state.mandatoryField=="SyLabsToken" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SyLabsToken"}>
                                            <Link className="link-sylabs-token-img-info" tooltipProps={{ text: "Click to generate SyLabs token" }} onClick={() => window.open("https://cloud.sylabs.io/tokens")}>
                                                <Image alt="SyLabs Token" src="../SyLabs.png" className="img-sylabs-token-info" />
                                            </Link>
                                            <TextField
                                                value={this.state.syLabsToken}
                                                onChange={(e, newValue) => (this.setState({syLabsToken: newValue}))}
                                                inputType="password"
                                                rows={3}
                                                placeholder="SyLabs Access Token"
                                            />
                                        </FormItem>
                                        <FormItem label="Image Name *" className="textbox" message={this.state.mandatoryField=="ImageName" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="ImageName"}>
                                            <TextField
                                                value={this.state.imageName}
                                                onChange={onImageNameChange}
                                                placeholder="Image Name In Small Caps"
                                            />
                                        </FormItem>
                                        <FormItem label="Image Tag *" className="textbox" message={this.state.mandatoryField=="ImageTag" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="ImageTag"}>
                                            <TextField
                                                value={this.state.imageTag}
                                                onChange={(e, newValue) => (this.setState({imageTag: newValue}))}
                                                placeholder="Image Tag"
                                            />
                                        </FormItem>
                                        <FormItem label="Is Signed *" className="textbox">
                                            <Toggle
                                                offText={"No"}
                                                onText={"Yes"}
                                                checked={this.state.isSigned}
                                                onChange={(event, value) => (this.setState({isSigned: value}))}
                                                
                                            />
                                        </FormItem>                                            
                                        <div className="submit-div">
                                            <Button
                                                    text="Next"
                                                    primary={true}
                                                    onClick={onSubmitSylabsNext}
                                                    className="submit"
                                                />
                                        </div>
                                    </div>
                                </div>
                            }
                            { this.state.step == 3 && 
                                <div className="flex-row" style={{ flexWrap: "wrap" }}>
                                    <div className="flex-column flex-column-div" >
                                        <FormItem label="Sign Key Comment *" className="textbox" message={this.state.mandatoryField=="SignKeyComment" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SignKeyComment"}>
                                            <Link className="link-comment-img-info" tooltipProps={{ text: "Add comment upon container signing (development key)" }}>
                                                <Image alt="Help" src="../Help.png" className="img-help" />
                                            </Link>
                                            <TextField
                                                value={this.state.signKeyComment}
                                                onChange={(e, newValue) => (this.setState({signKeyComment: newValue}))}
                                                placeholder="Sign Key Comment"
                                            />
                                        </FormItem>
                                        <FormItem label="Sign Key Email *" className="textbox" message={this.state.mandatoryField=="SignKeyEmail" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SignKeyEmail"}>
                                            <Link className="link-email-img-info" tooltipProps={{ text: "The mail, which you have signed up in sylabs" }}>
                                                <Image alt="Help" src="../Help.png" className="img-help" />
                                            </Link>
                                            <TextField
                                                value={this.state.signKeyEmail}
                                                onChange={(e, newValue) => (this.setState({signKeyEmail: newValue}))}
                                                placeholder="Sign Key Email"
                                            />
                                        </FormItem>
                                        <FormItem label="Sign Key Full Name *" className="textbox" message={this.state.mandatoryField=="SignKeyFullName" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SignKeyFullName"}>
                                            <TextField
                                                value={this.state.signKeyFullName}
                                                onChange={(e, newValue) => (this.setState({signKeyFullName: newValue}))}
                                                placeholder="Sign Key Full Name"
                                            />
                                        </FormItem>
                                        <FormItem label="SyLabs Collection *" className="textbox" message={this.state.mandatoryField=="SyLabsCollection" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SyLabsCollection"}>
                                            <Link className="link-collection-img-info" tooltipProps={{ text: "The name of collection for group of images" }}>
                                                <Image alt="Help" src="../Help.png" className="img-help" />
                                            </Link>
                                            <TextField
                                                value={this.state.syLabsCollection}
                                                onChange={onSyLabsCollectionChange}
                                                placeholder="SyLabs Collection In Small Caps"
                                            />
                                        </FormItem>
                                        <FormItem label="SyLabs Description *" className="textbox" message={this.state.mandatoryField=="SyLabsDescription" && this.state.mandatoryFieldMessage} error={this.state.mandatoryFieldStatus && this.state.mandatoryField=="SyLabsDescription"}>
                                            <TextField
                                                value={this.state.syLabsDescription}
                                                onChange={(e, newValue) => (this.setState({syLabsDescription: newValue}))}
                                                placeholder="SyLabs Description"
                                            />
                                        </FormItem>
                                        <div className="submit-div">
                                            <Button
                                                    text="Submit"
                                                    primary={true}
                                                    onClick={onSubmitSylabsSubmit}
                                                    className="submit"
                                                />
                                        </div>
                                    </div>
                                </div>
                            }
                            { (this.state.step == 4) &&     
                                <div className="flex-row spinner">
                                    <Spinner label={this.state.loaderText} size={SpinnerSize.large}/>
                                </div>
                            } 
                            { this.state.step == 5 &&     
                                <div className="flex-row spinner">
                                    <Spinner label={this.state.loaderText} size={SpinnerSize.large}/>
                                </div>
                            }    
                            { this.state.step == 6 &&
                                <div className="flex-row success-div" style={{ flexWrap: "wrap" }}>
                                    <div className="flex-column status-example-column">
                                        <span>
                                            <Status
                                                    {...Statuses.Success}
                                                    key="success"
                                                    size={StatusSize.m}
                                                    className="status-example flex-self-center "
                                                />
                                            <span className="title-l success-span">Request has been executed successfully.</span>
                                        </span> 
                                        <div className="div-success-redirects">
                                            <Button
                                                text="Start a new project"
                                                iconProps={{ iconName: "Add" }}
                                                onClick={() => location.reload ()}
                                                primary={true}
                                                className="button-success-redirects"
                                            />
                                            <Button
                                                text="Go to your project"
                                                onClick={() => window.open("https://dev.azure.com/" + this.userOrganization.u_ORGANIZATION  + "/" + this.userOrganization.u_PROJECT)}
                                                className="button-success-redirects"
                                            />
                                        </div>                                       
                                    </div>
                                </div>
                            }                          
                        </Card> 
                        <Button
                            text="&copy; Mohamed Sadiq 2022"
                            className="header"
                            primary={true}
                            disabled={true}
                        />                    
                    </div>
                </div>
            </Page>
        );
    }
}
showRootComponent(<CreateProject />);

