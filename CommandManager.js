const Emojis = require("discord-emoji");

/* CG stands for Command Group */
const CGGeneral    = require('./commands/General.js');
const CGValidation = require('./commands/Validation.js');
const CGFun        = require('./commands/Fun.js');
const CGProfil     = require('./commands/Profil.js');

class CommandManager {
    constructor(delimiter) {
        this.delimiter = delimiter;
        this.commands = new Map();

        new CGGeneral(this);
        new CGValidation(this);
        new CGFun(this);
        new CGProfil(this);
    }

    registerCommand(name, ctx, handler, opts) {
        this.commands.set(name, { ctx: ctx, handle: handler, options: opts });
        console.log(`Command Registered : ${name}`);
    }

    static splitCommand(text) {
        let regex = /'([\s\x21-\xff]+)'|"([\s\x21-\xff]+)"|([\x21-\xff]+)/g;
        let res = [];
        let m = null;

        while((m = regex.exec(text)) != null) {
            res.push(m[1] || m[2] || m[3]);
        }

        return res;
    }

    getListener() {
        return msg => {
            if(msg.author.bot) return;
            if(!msg.content.startsWith(this.delimiter)) return;

            let text = msg.content.substr(1);
            if(text.length == 0)
                return;

            let args = CommandManager.splitCommand(text);
            args[0] = args[0].toLowerCase();
            let command = this.commands.get(args[0]);

            if(command) {
                let opts = command.options;
                if(opts) {
                    if(opts.hasOwnProperty('argCount') && args.length - 1 != opts.argCount) {
                        if(opts.hasOwnProperty('helper'))
                            msg.channel.sendMessage(`Usage : ${this.delimiter}${args[0]} ${typeof opts.helper == 'function' ? opts.helper(msg) : opts.helper}`);
                        else
                            msg.channel.sendMessage(`Usage incorrect de !${args[0]}. Aucune aide disponible ${Emojis.people.cry}`);

                        return;
                    }
                }

                command.handle.call(command.ctx, msg, args);
            }
        }
    }
}

module.exports = CommandManager;