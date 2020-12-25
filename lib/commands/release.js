"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const command_1 = require("@oclif/command");
const default_config_1 = require("../default-config");
const axios_1 = require("axios");
const cli_ux_1 = require("cli-ux");
const download_info_1 = require("../model/download-info");
const fs = require("fs");
// eslint-disable-next-line @typescript-eslint/no-var-requires
const logSymbols = require('log-symbols');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const download = require('download');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sha256File = require('sha256-file');
class Release extends command_1.Command {
    async run() {
        const { flags } = this.parse(Release);
        this.log(`${logSymbols.info} Starting release process`);
        const releaseDescription = await Release.fetchReleaseDescriptionFromChangeLog(flags.owner, flags.repo, flags.branch, flags.version);
        const downloadInfo = await Release.generateDownloadInfo(flags.version);
        const updatedReleaseDescription = Release.updateWithDownloadInfo(releaseDescription, downloadInfo);
        const githubAccessToken = await Release.getGithubAccessToken();
        await Release.createGithubRelease(flags.owner, flags.repo, flags.version, updatedReleaseDescription, githubAccessToken);
        this.exit();
    }
    static async fetchReleaseDescriptionFromChangeLog(owner, repo, branch, version) {
        cli_ux_1.default.action.start('Fetching release description from change log');
        await cli_ux_1.default.wait();
        try {
            const changeLogURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/CHANGELOG.md`;
            const rawChangeLog = await axios_1.default.get(changeLogURL);
            const changeLogData = rawChangeLog.data;
            const regex = new RegExp(`## ${version}([\\s\\S]*?)## \\d`, 'gm');
            const str = changeLogData.match(regex)[0];
            const releaseDescription = str.substring(0, str.lastIndexOf("\n"));
            cli_ux_1.default.action.stop(logSymbols.success);
            return releaseDescription;
        }
        catch (e) {
            cli_ux_1.default.action.stop(logSymbols.error);
            throw e;
        }
    }
    static async getGithubAccessToken() {
        let token = process.env.GITHUB_ACCESS_TOKEN;
        if (!token) {
            token = await cli_ux_1.default.prompt(`${logSymbols.warning} Requiring Github Access Token`, { type: 'hide' });
        }
        return token;
    }
    static async generateDownloadInfo(version) {
        try {
            cli_ux_1.default.action.start('Downloading release archive');
            const downloadLink = `https://dl.bintray.com/hyperledger-org/besu-repo/besu-${version}.zip`;
            const tmp = fs.mkdtempSync('release-');
            const tmpFile = `${tmp}/${version}.zip`;
            fs.writeFileSync(tmpFile, await download(downloadLink));
            cli_ux_1.default.action.stop(logSymbols.success);
            cli_ux_1.default.action.start('Computing integrity hash');
            const integrityHash = sha256File(tmpFile);
            cli_ux_1.default.action.stop(logSymbols.success);
            fs.unlinkSync(tmpFile);
            fs.rmdirSync(tmp);
            return new download_info_1.default(downloadLink, integrityHash);
        }
        catch (e) {
            cli_ux_1.default.action.stop(logSymbols.error);
            return Promise.reject(e);
        }
    }
    static updateWithDownloadInfo(description, downloadInfo) {
        const downloadSection = `

### Download link
${downloadInfo.link}
sha256: \`${downloadInfo.integrityHash}\`
`;
        return description + downloadSection;
    }
    static async createGithubRelease(owner, repo, version, description, githubAccessToken) {
        cli_ux_1.default.action.start('Creating release using Github API');
        await cli_ux_1.default.wait();
        // for testing purpose
        const releaseName = `${new Date().getTime()}`;
        //const releaseName = version;
        const requestPayload = {
            "tag_name": releaseName,
            "name": releaseName,
            "body": description,
        };
        try {
            await axios_1.default.post(`https://api.github.com/repos/${owner}/${repo}/releases`, requestPayload, {
                headers: {
                    "Accept": "application/vnd.github.v3+json",
                    "Authorization": `token ${githubAccessToken}`
                }
            });
            cli_ux_1.default.action.stop(logSymbols.success);
        }
        catch (e) {
            cli_ux_1.default.action.stop(logSymbols.error);
            throw e;
        }
    }
}
exports.default = Release;
Release.description = 'create new release';
Release.flags = {
    help: command_1.flags.help({ char: 'h' }),
    owner: command_1.flags.string({ char: 'o', description: 'github owner', default: default_config_1.default.owner }),
    repo: command_1.flags.string({ char: 'r', description: 'github repository', default: default_config_1.default.repo }),
    branch: command_1.flags.string({ char: 'b', description: 'branch to release', default: 'master' }),
    version: command_1.flags.string({ char: 'v', description: 'version to release' }),
    force: command_1.flags.boolean({ char: 'f' }),
};
