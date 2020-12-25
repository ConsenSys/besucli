import {Command, flags} from '@oclif/command'
import DefaultConfig from "../default-config"
import axios from 'axios';

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
        const releaseDescription = await Release.fetchReleaseDescriptionFromChangeLog(
            flags.owner,
            flags.repo,
            flags.branch,
            flags.version
        );
        this.exit();
    }

    private static async fetchReleaseDescriptionFromChangeLog(owner: string, repo: string, branch: string, version: string | undefined): Promise<string> {
        const changeLogURL = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/CHANGELOG.md`
        const rawChangeLog = await axios.get(changeLogURL);
        const changeLogData = rawChangeLog.data;
        const regex = new RegExp(`## ${version}([\\s\\S]*?)## \\d`, 'gm');
        const str = changeLogData.match(regex)[0];
        return str.substring(0, str.lastIndexOf("\n"));
    }
}
