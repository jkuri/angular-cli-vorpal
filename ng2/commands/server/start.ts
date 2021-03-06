import * as path from 'path';
import * as chalk from 'chalk';
import * as webpack from 'webpack';
import * as webserv from 'webpack-dev-server';
import * as open from 'open';
import { getDevConfig, getCSSConfig } from '../../config/webpack/';
import { Helper } from '../../lib/helper';
import { Dir } from '../../lib/dir';
import { Utils } from '../../lib/utils';

const helper: any = new Helper();
const dir: any = new Dir();
const utils: any = new Utils();

let server: any;
let isRunning: boolean = false;

export function startServerCommand(s: any): any {
  return s
    .command('start', 'Builds and serves your app')
    .option('--port, -p <port>', 'Server port.')
    .types({
      string: ['port']
    })
    .validate((args, cb) => {
      if (!dir.isDirBuildable()) {
        s.ui.log(chalk.yellow('Cannot run server outside of the project directory.'));
        return false;
      }
    })
    .action((args, cb) => {
      let port = helper.isInt(args.options.port) ? parseInt(args.options.port, 10) : 4200;
      let config = getDevConfig();
      let cssConfig = getCSSConfig();
      
      config.entry.app.unshift(`webpack-dev-server/client?http://localhost:${port}/`);
      
      let compiler = webpack([config, cssConfig]);      

      server = new webserv(compiler, {
        contentBase: './src',
        quiet: true,
        historyApiFallback: true,
        watchOptions: {
          aggregateTimeout: 1000,
          poll: 100
        }
      });

      server.listen(port, () => {
        s.status = true;
        s.port = port;
        s.ui.log(chalk.yellow(`Server running at port ${port}`));
        open(`http://localhost:${port}`);
      });

      s.server = server;

      cb();
    })
    .cancel(() => {
      s.ui.log(chalk.yellow('Server successfully stopped.'));
      server.close();
    });
};
