/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 426:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyVaultActionParameters = void 0;
const util = __nccwpck_require__(837);
const core = __importStar(__nccwpck_require__(450));
class KeyVaultActionParameters {
    getKeyVaultActionParameters(handler) {
        this.keyVaultName = core.getInput("keyvault");
        this.secretsFilter = core.getInput("secrets");
        if (!this.keyVaultName) {
            core.setFailed("Vault name not provided.");
        }
        if (!this.secretsFilter) {
            core.setFailed("Secret filter not provided.");
        }
        var azureKeyVaultDnsSuffix = handler.getCloudSuffixUrl("keyvaultDns").substring(1);
        this.keyVaultUrl = util.format("https://%s.%s", this.keyVaultName, azureKeyVaultDnsSuffix);
        return this;
    }
}
exports.KeyVaultActionParameters = KeyVaultActionParameters;


/***/ }),

/***/ 792:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyVaultClient = void 0;
const core = __importStar(__nccwpck_require__(450));
const util = __nccwpck_require__(837);
const AzureRestClient_1 = __nccwpck_require__(475);
class KeyVaultClient extends AzureRestClient_1.ServiceClient {
    constructor(endpoint, timeOut, keyVaultUrl) {
        super(endpoint, timeOut);
        this.apiVersion = "7.0";
        this.tokenArgs = ["--resource", "https://vault.azure.net"];
        this.authHandler = endpoint;
        this.keyVaultUrl = keyVaultUrl;
        var keyvaultDns = endpoint.getCloudSuffixUrl("keyvaultDns").substring(1);
        this.tokenArgs[1] = "https://" + keyvaultDns;
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            var resourceManagerEndpointUrl = this.authHandler.baseUrl;
            if (resourceManagerEndpointUrl.endsWith('/')) {
                resourceManagerEndpointUrl = resourceManagerEndpointUrl.substring(0, resourceManagerEndpointUrl.length - 1); // need to remove trailing / from resourceManagerEndpointUrl to correctly derive suffix below
            }
            // Create HTTP transport objects
            var httpRequest = {
                method: 'GET',
                headers: {},
                uri: resourceManagerEndpointUrl + "/metadata/endpoints?api-version=2015-01-01"
            };
            this.tokenArgs = null;
            var armresponse = yield this.invokeRequest(httpRequest);
            core.debug(`armresponse: "${util.inspect(armresponse, { depth: null })}"`);
            var audience = armresponse.body.authentication.audiences[0];
            var kvResourceId = audience.replace("management", "vault");
            core.debug(`audience: "${audience}", kvResourceId: "${kvResourceId}"`);
            core.debug(`keyVaultUrl - "${this.keyVaultUrl}"`);
            this.tokenArgs = ["--resource", kvResourceId];
            this.apiVersion = "2016-10-01";
            yield this.authHandler.getToken(true, this.tokenArgs);
        });
    }
    invokeRequest(request) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                var response = yield this.beginRequest(request, this.tokenArgs);
                return response;
            }
            catch (exception) {
                throw exception;
            }
        });
    }
    getSecrets(nextLink, callback) {
        if (!callback) {
            core.debug("Callback Cannot Be Null");
            throw new Error("Callback Cannot Be Null");
        }
        // Create HTTP transport objects
        var url = nextLink;
        if (!url) {
            url = this.getRequestUriForbaseUrl(this.keyVaultUrl, '/secrets', {}, ['maxresults=25'], this.apiVersion);
        }
        var httpRequest = {
            method: 'GET',
            headers: {},
            uri: url,
        };
        console.log("Downloading Secrets From", url);
        this.invokeRequest(httpRequest).then((response) => __awaiter(this, void 0, void 0, function* () {
            var result = [];
            if (response.statusCode == 200) {
                if (response.body.value) {
                    result = result.concat(response.body.value);
                }
                if (response.body.nextLink) {
                    var nextResult = yield this.accumulateResultFromPagedResult(response.body.nextLink);
                    if (nextResult.error) {
                        return new AzureRestClient_1.ApiResult(nextResult.error);
                    }
                    result = result.concat(nextResult.result);
                    var listOfSecrets = this.convertToAzureKeyVaults(result);
                    return new AzureRestClient_1.ApiResult(null, listOfSecrets);
                }
                else {
                    var listOfSecrets = this.convertToAzureKeyVaults(result);
                    return new AzureRestClient_1.ApiResult(null, listOfSecrets);
                }
            }
            else {
                return new AzureRestClient_1.ApiResult((0, AzureRestClient_1.ToError)(response));
            }
        })).then((apiResult) => callback(apiResult.error, apiResult.result), (error) => callback(error));
    }
    getSecretValue(secretName, callback) {
        if (!callback) {
            core.debug("Callback Cannot Be Null");
            throw new Error("Callback Cannot Be Null");
        }
        // Create HTTP transport objects
        var httpRequest = {
            method: 'GET',
            headers: {},
            uri: this.getRequestUriForbaseUrl(this.keyVaultUrl, '/secrets/{secretName}', {
                '{secretName}': secretName
            }, [], this.apiVersion)
        };
        this.invokeRequest(httpRequest).then((response) => __awaiter(this, void 0, void 0, function* () {
            if (response.statusCode == 200) {
                var result = response.body.value;
                return new AzureRestClient_1.ApiResult(null, result);
            }
            else if (response.statusCode == 400) {
                return new AzureRestClient_1.ApiResult('Get Secret Failed Because Of Invalid Characters', secretName);
            }
            else {
                return new AzureRestClient_1.ApiResult((0, AzureRestClient_1.ToError)(response));
            }
        })).then((apiResult) => callback(apiResult.error, apiResult.result), (error) => callback(error));
    }
    convertToAzureKeyVaults(result) {
        var listOfSecrets = [];
        result.forEach((value, index) => {
            var expires;
            if (value.attributes.exp) {
                expires = new Date(0);
                expires.setSeconds(parseInt(value.attributes.exp));
            }
            var secretIdentifier = value.id;
            var lastIndex = secretIdentifier.lastIndexOf("/");
            var name = secretIdentifier.substr(lastIndex + 1, secretIdentifier.length);
            var azkvSecret = {
                name: name,
                contentType: value.contentType,
                enabled: value.attributes.enabled,
                expires: expires
            };
            listOfSecrets.push(azkvSecret);
        });
        return listOfSecrets;
    }
}
exports.KeyVaultClient = KeyVaultClient;


/***/ }),

/***/ 151:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.KeyVaultHelper = exports.AzureKeyVaultSecret = void 0;
const core = __importStar(__nccwpck_require__(450));
const KeyVaultClient_1 = __nccwpck_require__(792);
const util = __nccwpck_require__(837);
class AzureKeyVaultSecret {
}
exports.AzureKeyVaultSecret = AzureKeyVaultSecret;
class KeyVaultHelper {
    constructor(handler, timeOut, keyVaultActionParameters) {
        this.keyVaultActionParameters = keyVaultActionParameters;
        this.keyVaultClient = new KeyVaultClient_1.KeyVaultClient(handler, timeOut, keyVaultActionParameters.keyVaultUrl);
    }
    initKeyVaultClient() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.keyVaultClient.init();
        });
    }
    downloadSecrets() {
        var downloadAllSecrets = false;
        if (this.keyVaultActionParameters.secretsFilter && this.keyVaultActionParameters.secretsFilter.length === 1 && this.keyVaultActionParameters.secretsFilter[0] === "*") {
            downloadAllSecrets = true;
        }
        if (downloadAllSecrets) {
            return this.downloadAllSecrets();
        }
        else {
            return this.downloadSelectedSecrets(this.keyVaultActionParameters.secretsFilter);
        }
    }
    downloadAllSecrets() {
        return new Promise((resolve, reject) => {
            this.keyVaultClient.getSecrets("", (error, listOfSecrets) => {
                if (error) {
                    return reject(core.debug(util.format("Get Secrets Failed \n%s", this.getError(error))));
                }
                if (listOfSecrets.length == 0) {
                    core.debug(util.format("No secrets found in the vault %s", this.keyVaultActionParameters.keyVaultName));
                    return resolve();
                }
                console.log(util.format("Number of secrets found in keyvault %s: %s", this.keyVaultActionParameters.keyVaultName, listOfSecrets.length));
                listOfSecrets = this.filterDisabledAndExpiredSecrets(listOfSecrets);
                console.log(util.format("Number of enabled secrets found in keyvault %s: %s", this.keyVaultActionParameters.keyVaultName, listOfSecrets.length));
                var getSecretValuePromises = [];
                listOfSecrets.forEach((secret, index) => {
                    getSecretValuePromises.push(this.downloadSecretValue(secret.name));
                });
                Promise.all(getSecretValuePromises).then(() => {
                    return resolve();
                });
            });
        });
    }
    downloadSelectedSecrets(secretsFilter) {
        let selectedSecrets = [];
        if (secretsFilter) {
            selectedSecrets = secretsFilter.split(',');
        }
        return new Promise((resolve, reject) => {
            var getSecretValuePromises = [];
            selectedSecrets.forEach((secretName) => {
                getSecretValuePromises.push(this.downloadSecretValue(secretName));
            });
            Promise.all(getSecretValuePromises).then(() => {
                return resolve();
            }, error => {
                return reject(new Error("Downloading selected secrets failed"));
            });
        });
    }
    downloadSecretValue(secretName) {
        secretName = secretName.trim();
        return new Promise((resolve, reject) => {
            this.keyVaultClient.getSecretValue(secretName, (error, secretValue) => {
                if (error) {
                    core.setFailed(util.format("Could not download the secret %s", secretName));
                }
                else {
                    this.setVaultVariable(secretName, secretValue);
                }
                return resolve();
            });
        });
    }
    setVaultVariable(secretName, secretValue) {
        if (!secretValue) {
            return;
        }
        core.setSecret(secretValue);
        core.exportVariable(secretName, secretValue);
        core.setOutput(secretName, secretValue);
    }
    filterDisabledAndExpiredSecrets(listOfSecrets) {
        var result = [];
        var now = new Date();
        listOfSecrets.forEach((value, index) => {
            if (value.enabled && (!value.expires || value.expires > now)) {
                result.push(value);
            }
        });
        return result;
    }
    getError(error) {
        core.debug(JSON.stringify(error));
        if (error && error.message) {
            return error.message;
        }
        return error;
    }
}
exports.KeyVaultHelper = KeyVaultHelper;


/***/ }),

/***/ 739:
/***/ (function(__unused_webpack_module, exports, __nccwpck_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
const core = __importStar(__nccwpck_require__(450));
const crypto = __importStar(__nccwpck_require__(113));
const AuthorizerFactory_1 = __nccwpck_require__(944);
const KeyVaultActionParameters_1 = __nccwpck_require__(426);
const KeyVaultHelper_1 = __nccwpck_require__(151);
const exec = __importStar(__nccwpck_require__(609));
const io = __importStar(__nccwpck_require__(915));
var azPath;
var prefix = !!process.env.AZURE_HTTP_USER_AGENT ? `${process.env.AZURE_HTTP_USER_AGENT}` : "";
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            let usrAgentRepo = crypto.createHash('sha256').update(`${process.env.GITHUB_REPOSITORY}`).digest('hex');
            let actionName = 'GetKeyVaultSecrets';
            let userAgentString = (!!prefix ? `${prefix}+` : '') + `GITHUBACTIONS_${actionName}_${usrAgentRepo}`;
            core.exportVariable('AZURE_HTTP_USER_AGENT', userAgentString);
            let handler = null;
            try {
                handler = yield AuthorizerFactory_1.AuthorizerFactory.getAuthorizer();
            }
            catch (error) {
                core.setFailed("Could not login to Azure.");
            }
            if (handler != null) {
                var actionParameters = new KeyVaultActionParameters_1.KeyVaultActionParameters().getKeyVaultActionParameters(handler);
                var keyVaultHelper = new KeyVaultHelper_1.KeyVaultHelper(handler, 100, actionParameters);
                azPath = yield io.which("az", true);
                var environment = yield executeAzCliCommand("cloud show --query name");
                environment = environment.replace(/"|\s/g, '');
                console.log('Running keyvault action against ' + environment);
                if (environment.toLowerCase() == "azurestack") {
                    yield keyVaultHelper.initKeyVaultClient();
                }
                keyVaultHelper.downloadSecrets();
            }
        }
        catch (error) {
            core.debug("Get secret failed with error: " + error);
            core.setFailed(!!error.message ? error.message : "Error occurred in fetching the secrets.");
        }
        finally {
            core.exportVariable('AZURE_HTTP_USER_AGENT', prefix);
        }
    });
}
function executeAzCliCommand(command) {
    return __awaiter(this, void 0, void 0, function* () {
        let stdout = '';
        let stderr = '';
        try {
            core.debug(`"${azPath}" ${command}`);
            yield exec.exec(`"${azPath}" ${command}`, [], {
                silent: true,
                listeners: {
                    stdout: (data) => { stdout += data.toString(); },
                    stderr: (data) => { stderr += data.toString(); }
                }
            });
        }
        catch (error) {
            throw new Error(stderr);
        }
        return stdout;
    });
}
run();


/***/ }),

/***/ 450:
/***/ ((module) => {

module.exports = eval("require")("@actions/core");


/***/ }),

/***/ 609:
/***/ ((module) => {

module.exports = eval("require")("@actions/exec");


/***/ }),

/***/ 915:
/***/ ((module) => {

module.exports = eval("require")("@actions/io");


/***/ }),

/***/ 944:
/***/ ((module) => {

module.exports = eval("require")("azure-actions-webclient/AuthorizerFactory");


/***/ }),

/***/ 475:
/***/ ((module) => {

module.exports = eval("require")("azure-actions-webclient/AzureRestClient");


/***/ }),

/***/ 113:
/***/ ((module) => {

"use strict";
module.exports = require("crypto");

/***/ }),

/***/ 837:
/***/ ((module) => {

"use strict";
module.exports = require("util");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __nccwpck_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			__webpack_modules__[moduleId].call(module.exports, module, module.exports, __nccwpck_require__);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	if (typeof __nccwpck_require__ !== 'undefined') __nccwpck_require__.ab = __dirname + "/";
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __nccwpck_require__(739);
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;