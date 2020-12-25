export default class DownloadInfo {
    private readonly _link: string;
    private readonly _integrityHash: string;

    constructor(link: string, integrityHash: string) {
        this._link = link;
        this._integrityHash = integrityHash;
    }


    get link(): string {
        return this._link;
    }

    get integrityHash(): string {
        return this._integrityHash;
    }
}