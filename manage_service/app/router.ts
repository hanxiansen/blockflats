import { Application } from 'egg';
import * as AV from 'leancloud-storage';
import { LEANCLOUD_DB_APP_ID, LEANCLOUD_DB_APP_KEY } from './app_config';

export default (app: Application) => {
  const { controller, router } = app;
  AV.init({
    appId: LEANCLOUD_DB_APP_ID,
    appKey: LEANCLOUD_DB_APP_KEY,
  });

  router.get('/', controller.home.index);
  router.get('/login', controller.home.oAuthPage);
  router.get('/path', controller.home.authorizationCallbackUrl);
  router.get('/user', controller.home.user); // 获取用户信息
  router.get('/stars', controller.home.fetchStarList); // 获取 star 列表
  router.get('/pin', controller.home.pin);  // pin
  router.post('/market_pin', controller.home.marketPin); // 集市 stars
  router.get('/pins', controller.home.fetchPinList); // 获取 pin 列表
  router.get('/search_pin', controller.home.searchPinStar); // 搜索 pin
};
