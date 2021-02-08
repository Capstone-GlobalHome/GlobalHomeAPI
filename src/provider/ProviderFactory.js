import {providerList} from "./ProvidersList";

class ProviderFactory {
    getProvider(providerType) {
        if(!providerList[providerType]) {
            throw "Provider doesn't exists";
        }
        this.provider = new providerList[providerType]();
    }
}
export default ProviderFactory;