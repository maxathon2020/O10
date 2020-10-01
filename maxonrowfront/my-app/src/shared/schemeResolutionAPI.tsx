import Axios from 'axios';

export default class SchemeResolutionAPI {
    constructor(private baseUri: string){}

    async PutAttributeDefinitions(issuer: string, attributeDefinitions: NewAttributeDefinition[]) {
        return await Axios.put<AttributeDefinition[]>(this.baseUri + "/api/SchemeResolution/AttributeDefinitions?issuer=" + issuer, attributeDefinitions);
    }
}

export class NewAttributeDefinition {
    attributeName: string;
    schemeName: string;
    alias: string;
    description: string;
    isRoot: boolean;
}

export interface AttributeDefinition {
    schemeId: number;
    attributeName: string;
    schemeName: string;
    alias: string;
    description: string;
    isRoot: boolean;
    isActive: boolean;
}