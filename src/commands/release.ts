import {Command, flags} from '@oclif/command'
import DefaultConfig from "../default-config"
import axios from 'axios';
import cli from 'cli-ux';
import DownloadInfo from "../model/download-info";
import * as fs from "fs";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logSymbols = require('log-symbols');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const download = require('download');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sha256File = require('sha256-file');


export default class Release extends Command {
    static description = 'create new release'

    static flags = {
        help: flags.help({char: 'h'}),
        owner: flags.string({char: 'o', description: 'github owner', default: DefaultConfig.owner}),
        repo: flags.string({char: 'r', description: 'github repository', default: DefaultConfig.repo}),
        branch: flags.string({char: 'b', description: 'branch to release', default: 'master'}),
        version: flags.string({char: 'v', description: 'version to release'}),
        force: flags.boolean({char: 'f'}),
    }

    async run() {
        const {flags} = this.parse(Release);
        this.log(`${logSymbols.info} Starting release process`);
        const releaseDescription = await Release.fetchReleaseDescriptionFromChangeLog(
            flags.owner,
            flags.repo,
            flags.branch,
            flags.version
        );
        const downloadInfo = await Release.generateDownloadInfo(flags.version as string);
        const updatedReleaseDescription = Release.updateWithDownloadInfo(releaseDescription, downloadInfo);
        const githubAccessToken = await Release.getGithubAccessToken();
        await Release.createGithubRelease(
            flags.owner,
            flags.repo,
            flags.version,
            updatedReleaseDescription,
            githubAccessToken
        );
        this.exit();
    }

    private static async fetchReleaseDescriptionFromChangeLog(owner: string, repo: string, branch: string, version: string | undefined): Promise<string> {
        cli.action.start('Fetching release description from change log');
        await cli.wait();
        try {
            const changeLogURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/CHANGELOG.md`
            const rawChangeLog = await axios.get(changeLogURL);
            const changeLogData = rawChangeLog.data;
            const regex = new RegExp(`## ${version}([\\s\\S]*?)## \\d`, 'gm');
            const str = changeLogData.match(regex)[0];
            const releaseDescription = str.substring(0, str.lastIndexOf("\n"));
            cli.action.stop(logSymbols.success);
            return releaseDescription;
        } catch (e) {
            cli.action.stop(logSymbols.error);
            throw e;
        }
    }

    private static async getGithubAccessToken(): Promise<string> {
        let token = process.env.GITHUB_ACCESS_TOKEN;
        if (!token) {
            token = await cli.prompt(`${logSymbols.warning} Requiring Github Access Token`, {type: 'hide'})
        }
        return token as string;
    }

    private static async generateDownloadInfo(version: string): Promise<DownloadInfo> {
        try {
            cli.action.start('Downloading release archive');
            const downloadLink = `https://dl.bintray.com/hyperledger-org/besu-repo/besu-${version}.zip`;
            const tmp = fs.mkdtempSync('release-');
            const tmpFile = `${tmp}/${version}.zip`;
            fs.writeFileSync(tmpFile, await download(downloadLink));
            cli.action.stop(logSymbols.success);
            cli.action.start('Computing integrity hash');
            const integrityHash = sha256File(tmpFile);
            cli.action.stop(logSymbols.success);
            fs.unlinkSync(tmpFile);
            fs.rmdirSync(tmp);
            return new DownloadInfo(downloadLink, integrityHash);
        } catch (e) {
            cli.action.stop(logSymbols.error);
            return Promise.reject(e);
        }
    }

    private static updateWithDownloadInfo(description: string, downloadInfo: DownloadInfo): string {
        return description;
    }

    private static async createGithubRelease(owner: string, repo: string, version: string | undefined,
                                             description: string, githubAccessToken: string): Promise<void> {
        cli.action.start('Creating release using Github API');
        await cli.wait();
        try {
            await axios.post(
                `https://api.github.com/repos/${owner}/${repo}/releases`,
                {
                    "tag_name": version,
                    "name": version,
                    "body": description,
                }, {
                    headers: {
                        "Accept": "application/vnd.github.v3+json",
                        "Authorization": `token ${githubAccessToken}`
                    }
                }
            );
            cli.action.stop(logSymbols.success);
        } catch (e) {
            cli.action.stop(logSymbols.error);
            throw e;
        }
    }
}
