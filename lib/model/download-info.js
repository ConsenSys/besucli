"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class DownloadInfo {
    constructor(link, integrityHash) {
        this._link = link;
        this._integrityHash = integrityHash;
    }
    get link() {
        return this._link;
    }
    get integrityHash() {
        return this._integrityHash;
    }
}
exports.default = DownloadInfo;
