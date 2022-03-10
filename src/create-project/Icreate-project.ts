import { AggregateItemProvider } from "azure-devops-ui/Utilities/AggregateItemProvider";
import { IListBoxItem } from "azure-devops-ui/ListBox";

// source azure devops interface
export interface ISourceOrganization {    
    b_ORGANIZATION: string;
    b_PROJECT: string;
    b_REPO_ID: string;
    b_PAT: string;
    b_GIT_TOKEN: string; 
}

// user azure deveops interface
export interface IUserOrganization {    
    u_SERVICE_ENDPOINT: string;
    u_REPO_ID: string;
    b_BUILD_DEF_ID: string;
    u_PROJECT_ID: string;
    u_ORGANIZATION: string | undefined;
    u_PROJECT: string;
    u_DESCRIPTION: string;
    u_PAT: string;
}

// sylabs interface
export interface ISyLabs {    
    v_IMAGE_NAME: string;
    v_IMAGE_TAG: string;
    v_IS_SIGNED: boolean;
    v_SIGNKEY_COMMENT: string;
    v_SIGNKEY_EMAIL: string;
    v_SIGNKEY_FULLNAME: string;
    v_SIGNKEY_PASSPHRASE: string;
    v_SYLABS_COLLECTION: string;
    v_SYLABS_DESCRIPTION: string;
    v_SYLABS_USER: string;
    v_SYLABS_TOKEN:string;
}

// extension interface
export interface ICreateProject {   
    mandatoryFieldStatus: boolean;
    mandatoryFieldMessage: string;
    mandatoryField: string | undefined;
    headerMessage: string;
    step: number;
    loaderText: string;
    showMessage: boolean;
    message: string;
    // input controls
    accessToken: string;
    organization: string | undefined;
    project: string;
    projectDescription: string;
    syLabsuser: string;
    syLabsToken: string;
    imageName: string;
    imageTag: string;
    isSigned: boolean;
    signKeyComment: string;
    signKeyEmail: string;
    signKeyFullName: string;
    syLabsCollection: string;
    syLabsDescription: string;
    accounts: AggregateItemProvider<IListBoxItem>
}

// mandatory fields interface
export interface IMandatoryFields{
    name: string
}