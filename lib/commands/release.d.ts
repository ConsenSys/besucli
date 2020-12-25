import { Command, flags } from '@oclif/command';
export default class Release extends Command {
    static description: string;
    static flags: {
        help: import("@oclif/parser/lib/flags").IBooleanFlag<void>;
        owner: flags.IOptionFlag<string>;
        repo: flags.IOptionFlag<string>;
        branch: flags.IOptionFlag<string>;
        version: flags.IOptionFlag<string | undefined>;
        force: import("@oclif/parser/lib/flags").IBooleanFlag<boolean>;
    };
    run(): Promise<void>;
    private static fetchReleaseDescriptionFromChangeLog;
    private static getGithubAccessToken;
    private static generateDownloadInfo;
    private static updateWithDownloadInfo;
    private static createGithubRelease;
}
