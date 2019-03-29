import { Controller } from 'egg';
import Axios from 'axios';
import * as querystring from 'querystring';
import { structureResponse } from '../shared/utils';
import { OK, ERROR, AXIOS_OK } from '../shared/constants';
import { GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET } from '../app_config';

const githubOAuthURL = 'https://github.com/login/oauth/authorize';
const githubAccessTokenURL = 'https://github.com/login/oauth/access_token';
const githubUserURL = 'https://api.github.com/user';
const githubStarsURL = 'https://api.github.com/user/starred';

export default class HomeController extends Controller {

  public async index() {
    const { ctx } = this;
    await ctx.render('index.nj', {
      env: this.config.env,
    });
  }

  /**
   * 跳转到Github授权页
   */
  public async oAuthPage() {
    const { ctx } = this;
    const params = `client_id=${GITHUB_CLIENT_ID}&state=${new Date().valueOf()}`;
    ctx.redirect(`${githubOAuthURL}?${params}`);
  }

  /**
   * 授权页面 callback
   */
  public async authorizationCallbackUrl() {
    const { ctx } = this;
    const { code } = ctx.query;
    const params = {
      client_id: GITHUB_CLIENT_ID,
      client_secret: GITHUB_CLIENT_SECRET,
      code,
    };
    try {
      const response = await Axios.post(githubAccessTokenURL, params);
      const query = querystring.parse(response.data);
      try {
        const userResponse = await Axios.get(`${githubUserURL}?access_token=${query.access_token}`);
        const userInfo = userResponse.data;
        userInfo.access_token = query.access_token;
        const usered = await this.service.home.verificationUser(userInfo.id);
        ctx.cookies.set('access_token', userInfo.access_token, {
          httpOnly: true,
          maxAge: 12 * 60 * 60 * 1000,
          encrypt: true,
        });
        console.log('set access_token', userInfo.access_token);
        ctx.cookies.set('user_id', String(userInfo.id), {
          httpOnly: true,
          maxAge: 12 * 60 * 60 * 1000,
          encrypt: true,
        });
        if (usered.code === OK) {
          // 用户已经存在通过id更新用户表
          const updateUsered = await this.service.home.updateUserTable(userInfo.id, userInfo);
          if (updateUsered.code === OK) {
            ctx.redirect('/');
          } else {
            ctx.body = structureResponse('更新用户数据失败', ERROR);
          }
        } else {
          const saveUsered = await this.service.home.saveUserTable(userInfo);
          if (saveUsered.code === OK) {
            ctx.redirect('/');
          } else {
            ctx.body = structureResponse('保存用户数据失败', ERROR);
          }
        }
      } catch (e) {
        ctx.body = structureResponse('获取用户数据失败', ERROR);
      }
    } catch (e) {
      ctx.body = structureResponse('oauth授权获取access_token失败', ERROR);
    }
  }

  /**
   * 获取用户信息
   */
  public async user() {
    const { ctx } = this;
    const access_token = ctx.cookies.get('access_token', {
      encrypt: true,
    });
    if (!access_token) {
      ctx.body = structureResponse('', ERROR);
    } else {
      const userInfo = await this.service.home.fetchUserTable(access_token);
      if (userInfo && userInfo.length > 0) {
        const originDate = userInfo[0].get('updatedAt');
        const nowDate = new Date();
        if (nowDate.getTime() > (originDate.getTime() + (12 * 60 * 60 * 1000))) {
          ctx.body = structureResponse(JSON.stringify(userInfo), ERROR, 'access_token timeout');
        } else {
          ctx.body = structureResponse(userInfo[0], OK);
        }
      } else {
        ctx.body = structureResponse(JSON.stringify(userInfo), ERROR);
      }
    }
  }

  /**
   * stars 列表页面
   */
  public async fetchStarList() {
    const { ctx } = this;
    const access_token = ctx.cookies.get('access_token', {
      encrypt: true,
    });
    const { page } = ctx.query;
    try {
      const response = await Axios.get(`${githubStarsURL}?access_token=${access_token}&page=${page}`);
      if (response && response.status === AXIOS_OK){
        const { data } = response;
        ctx.body = structureResponse(data, OK);
      } else {
        ctx.body = structureResponse(response.data, ERROR);
      }
    } catch (e) {
      ctx.body = structureResponse(e, ERROR);
    }
  }

  /**
   * pin 列表页面
   */
  public async fetchPinList() {
    const { ctx } = this;
    const access_token = ctx.cookies.get('access_token', {
      encrypt: true,
    });
    if (!access_token) {
      ctx.body = structureResponse('', ERROR);
    } else {
      const user_id = ctx.cookies.get('user_id', {
        encrypt: true,
      });
      const { page } = ctx.query;
      if (!user_id || !page) {
        ctx.body = structureResponse('', ERROR);
      } else {
        const findPined = await this.service.home.fetchPinStars(Number(user_id), Number(page));
        if (findPined && findPined.length > 0) {
          ctx.body = structureResponse(findPined, OK);
        } else {
          ctx.body = structureResponse('', ERROR);
        }
      }
    }
  }

  /**
   * pin 页面对 pin 的操作
   */
  public async pin() {
    const { ctx } = this;
    const access_token = ctx.cookies.get('access_token', {
      encrypt: true,
    });
    if (!access_token) {
      ctx.body = structureResponse('', ERROR);
    } else {
      const user_id = ctx.cookies.get('user_id', {
        encrypt: true,
      });
      const { id, pined } = ctx.query;
      try {
        /// 查询是这个用户id下的项目id
        const finded = await this.service.home.fetchPinStar(Number(id), Number(user_id));
        if (finded && finded.length > 0) {
          const findPinStar = finded[0];
          const updated = await this.service.home.updatePinStar(findPinStar, Number(pined) === 0 ? false : true);
          if (updated.code === OK) {
            ctx.body = structureResponse('', OK);
          } else {
            ctx.body = structureResponse(`无法更新id=${id}的数据`, ERROR);
          }
        } else {
          ctx.body = structureResponse('没有找到Pin过的数据', ERROR);
        }
      } catch (e) {
        ctx.body = structureResponse(JSON.stringify(e), ERROR);
      }
    }
  }

  /**
   * 集市列表操作pin的逻辑
   */
  public async marketPin() {
    const { ctx } = this;
    const access_token = ctx.cookies.get('access_token', {
      encrypt: true,
    });
    console.log('marketPin_access_token', access_token);
    if (!access_token) {
      ctx.body = structureResponse('', ERROR);
    } else {
      const user_id = ctx.cookies.get('user_id', {
        encrypt: true,
      });
      const body = ctx.request.body;
      try {
        const finded = await this.service.home.fetchMarketPinStar(Number(body.id), Number(user_id));
        if (finded && finded.length > 0) {
          const findPin = finded[0];
          const flatsPined = findPin.get('flats_pined');
          if (!flatsPined) {
            const updated = await this.service.home.updatePinStar(findPin, true);
            if (updated.code === OK) {
              ctx.body = structureResponse('', OK);
            } else {
              ctx.body = structureResponse(updated.msg, ERROR);
            }
          } else {
            ctx.body = structureResponse('', ERROR);
          }
        } else {
          const saveEd = await this.service.home.savePinStar(Number(user_id), body);
          if (saveEd.code === OK) {
            ctx.body = structureResponse('', OK);
          } else {
            ctx.body = structureResponse(saveEd.msg, ERROR);
          }
        }
      } catch (e) {
        ctx.body = structureResponse('', ERROR);
      }
    }
  }

  public async searchPinStar() {
    const { ctx } = this;
    const { searchKey } = ctx.query;
    const result = await this.service.home.searchPinStar(decodeURIComponent(searchKey));
    if (result && result.length > 0) {
      ctx.body = structureResponse(result, OK);
    } else {
      ctx.body = structureResponse('', ERROR);
    }
  }
}
