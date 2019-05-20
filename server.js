//Основной файл
const config = require('config');
const config1 = require('./config/default');
const multer = require('koa-multer');
const upload = multer({ dest: 'uploads/' });
config1.dir=__dirname;

if (process.env.TRACE) {
  require('./libs/trace');
}
/*var cookie = require('koa-cookie');*/
const Koa = require('koa');
const app = new Koa();

const mongoose = require('./libs/mongoose');

// keys for in-koa KeyGrip cookie signing (used in session, maybe other modules)
app.keys = [config.secret];

const path = require('path');
const fs = require('fs');


const middlewares = fs.readdirSync(path.join(__dirname, 'middlewares')).sort();

middlewares.forEach(function(middleware) {
  app.use(require('./middlewares/' + middleware));
});


const Router = require('koa-router');

const router = new Router();
//Настройка маршрутизации
router.post('/reg', require('./routes/register').post);
router.post('/login', require('./routes/login').post);

router.post('/createstartup', require('./routes/createstartup').post);
//router.get('/', require('./routes/test').get);
router.post('/findStartups', require('./routes/startups').get);
router.post('/sendUserImg', require('./routes/sendUserImg').post);
router.post('/changeUserData', require('./routes/changeUserData').post);
router.post('/checkEmail', require('./routes/checkEmail').post);
router.post('/delMember', require('./routes/delMember').post);

router.get('/getMembers', require('./routes/getMembers').get);
router.get('/logout', require('./routes/logout').get);
router.get('/getNotifications', require('./routes/getNotifications').get);
router.get('/getInfoProfile', require('./routes/getInfoProfile').get);
router.get('/mystartup', require('./routes/mystartup').get);
//Работа  с сессией
app.use(async (ctx, next) => {
  var f=this.session;
  var v=ctx.session;
  if (!ctx.get('csrf-token')) ctx.set('csrf-token', ctx.csrf);
  await next();
});
app.use(router.routes());


//Обработка ошибки 404(при неправильном запросе рендеринг главной страницы)
app.use(async (ctx, next) => {
    try {
        await next()
        if (ctx.status === 404) {
            await require('./routes/main').get(ctx, next);
        }
    } catch (err) {
        // handle error
    }
});



app.listen(config1.port);








function setPendingStatus(status){
    config1.isPending=status;
}

