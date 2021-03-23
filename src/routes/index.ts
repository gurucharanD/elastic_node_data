import fs from 'fs';
import { Application } from 'express';
const ext = process.env.NODE_ENV === 'test' ? 'ts' : 'js';
export const Router = {
  build(app: Application) {
    const reg = new RegExp('^(?!.*\.test\.' + ext + '$).*\.' + ext + '$');
    const routes = fs.readdirSync(__dirname)
      .filter((file) => file !== `index.${ext}`)
      .filter((file) => file.match(reg))
      .map((file) => file.split('.')[0]);
    routes.forEach((route) => {
      app.use(`/${route}`, this.importSubRouter(`./${route}.${ext}`));
    });
  },
  importSubRouter(filePath: string) {
    return require(filePath);
  },
};
