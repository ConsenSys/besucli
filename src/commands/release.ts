import {Command, flags} from '@oclif/command'
import DefaultConfig from "../default-config"
import axios from 'axios';
const commonmark = require('commonmark');

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
        const releaseDescription = await this.getChangeLog(flags.branch, flags.version);
        this.log(releaseDescription);
        this.exit();
    }

    private async getChangeLog(branch: string, version: string | undefined): Promise<string> {
        const owner = DefaultConfig.owner;
        const repo = DefaultConfig.repo;
        const changeLogURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/CHANGELOG.md`
        this.log(`retrieving change log information from: ${changeLogURL}`)
        const changeLogResponse = await axios.get(changeLogURL);
        const changeLogData = changeLogResponse.data;
        const regex = new RegExp(`## ${version}([\\s\\S]*?)## \\d`, 'gm');
        return  changeLogData.match(regex);
    }
}
