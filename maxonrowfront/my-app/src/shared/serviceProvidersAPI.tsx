import Axios from 'axios';

export default class ServiceProvidersAPI {
    constructor(private baseUri: string){}

    async PutAttributeDefinitions(accountId: number, validationDefinitions: ValidationDefinitionsRequest) {
        return await Axios.put(this.baseUri + "/api/ServiceProviders/IdentityAttributeValidationDefinitions?accountId=" + accountId, validationDefinitions);
    }

}

export class ValidationDefinition {
    schemeName: string;
    validationType: string;
    criterionValue: string;
}

export class ValidationDefinitionsRequest {
    identityAttributeValidationDefinitions: ValidationDefinition[];
}