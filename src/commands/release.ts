import {Command, flags} from '@oclif/command'

export default class Release extends Command {
    static description = 'create new release'

    static flags = {
        help: flags.help({char: 'h'}),
        // flag with a value (-n, --branch=VALUE)
        branch: flags.string({char: 'b', description: 'branch to release', default: 'master'}),
        // flag with no value (-f, --force)
        force: flags.boolean({char: 'f'}),
    }

    static args = [
        {name: 'branch'},
        {name: 'version'},
    ]

    async run() {
        const {flags} = this.parse(Release);
        this.log(`branch to release ${flags.branch}`);
    }
}
