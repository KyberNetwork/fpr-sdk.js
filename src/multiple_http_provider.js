import Web3 from "web3"

export default class MultiHttpProvider {
    // it's require to have at least one provider, the first one in list will be the main provider
    // which will be use for all request, for eth_sendRawTransaction request, it we use all providers
    // to broadcast tx
    constructor(providers, cb) {
        if (!providers || providers.length === 0){
            throw new Error("it's require at least one providers");
        }
        this._providers = providers;
        this._cb = cb;
    }
    prepareRequest(_async) {
        var request = Web3.providers.HttpProvider.prototype.prepareRequest.call(this._providers[0], _async);
        return request;
    }
    async send(payload, cb) {
        if (this._providers.length === 1 || payload.method !== "eth_sendRawTransaction") {
            return Web3.providers.HttpProvider.prototype.send.call(this._providers[0], payload, cb);
        }
        var allPromises = [];
        this._providers.map(e => {
            var p = new Promise(function (resolve, reject) {
                Web3.providers.HttpProvider.prototype.send.call(e, payload, (err, res) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(res);
                    }
                });
            });
            allPromises.push(p);
        });
        var userResults = [];
        var mainResult;
        for (var i = 0; i < allPromises.length; i++) {
            try {
                var r = await allPromises[i];
                if (r.error) {
                    userResults.push({ "error": r.error.message, "success": false, "provider": this._providers[i].host });
                    if (i == 0){
                        mainResult = {err: r.error}
                    }
                } else {
                    userResults.push({ "success": true, "provider": this._providers[i].host });
                    if (i == 0) {
                        mainResult = {res: r}
                    }
                }
            } catch (e) {
                userResults.push({ "error": e, "success": false, "provider": this._providers[i].host });
                if (i == 0){
                    mainResult = {err: e}
                }
            }
        }
        if (mainResult.res) {
            cb(null, mainResult.res)
        }else {
            cb(mainResult.err,null);
        }
        if (this._cb) {
            this._cb(userResults);
        }
        return undefined;
    }
}