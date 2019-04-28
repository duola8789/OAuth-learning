/**
 * Created By zh on 2019-04-28
 */
const Koa = require('koa');
const path = require('path');
const staticServer = require('koa-static');
const KoaRouter = require('koa-router');
const axios = require('axios');
const config = require('./config');

const app = new Koa();
const router = new KoaRouter();

const oauthController = async ctx => {
  // 获取授权码
  const { code } = ctx.request.query;
  console.log('authorization code: ', code);

  try {
    // 使用授权码 + clientID + clientSecret 获取 token
    const tokenRes = await axios({
      method: 'post',
      url: `https://github.com/login/oauth/access_token?client_id=${config.clientID}&client_secret=${config.clientSecret}&code=${code}`,
      headers: {
        accept: 'application/json'
      }
    });

    const token = tokenRes.data.access_token;
    console.log('access token: ', token);

    // 使用令牌获取数据
    const res = await axios.get('https://api.github.com/user', {
      headers: {
        accept: 'application/json',
        'Authorization': `token ${token}`
      }
    });
    console.log('result: ', res);

    // 拿到用户名，渲染到页面
    const { name } = res.data;
    ctx.response.redirect(`/welcome.html?name=${encodeURIComponent(name)}`);
  } catch (e) {
    console.log('There is something wrong when getting token: ');
  }
};

router.get('/oauth/redirect', oauthController);

// Koa静态文件服务的目录
app.use(staticServer(path.resolve('public')));

// 加载路由中间件
app.use(router.routes());

app.listen(8080, () => {
  console.log('Koa is listening in 8080');
});
