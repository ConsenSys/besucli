export default class DownloadInfo {
    private readonly _link;
    private readonly _integrityHash;
    constructor(link: string, integrityHash: string);
    get link(): string;
    get integrityHash(): string;
}
