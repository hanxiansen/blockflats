import { Service } from 'egg';
import * as AV from 'leancloud-storage';
import { internalServiceResponse } from '../shared/utils';
import { OK, ERROR, IInternal } from '../shared/constants';

const GUITableKey = 'UserTable';
const USPinTableKey = 'UserPinStarTable';

const GithubUserInfo = AV.Object.extend(GUITableKey);
const GithubUserPinStarInfo = AV.Object.extend(USPinTableKey);

interface IParams {
  [key: string]: any;
}

/**
 * Home Service
 */
export default class Home extends Service {

  public async verificationUser(id: number): Promise<IInternal<string>> {
    const query = new AV.Query(GUITableKey);
    query.equalTo('id', id);
    try {
      const d = await query.find();
      if (d && d.length > 0) {
        return internalServiceResponse(OK, '');
      } else {
        return internalServiceResponse(ERROR, '');
      }
    } catch (e) {
      return internalServiceResponse(ERROR, JSON.stringify(e));
    }
  }

  public async fetchUserTable(access_token: string) {
    const query = new AV.Query(GUITableKey);
    query.equalTo('access_token', access_token);
    try {
      return await query.find();
    } catch (e) {
      return false;
    }
  }

  public async saveUserTable(userInfo: any) {
    const githubUserInfo = new GithubUserInfo();
    Object.keys(userInfo).forEach((v: any) => {
      githubUserInfo.set(v, userInfo[v]);
    });
    const b = await new Promise((resolve, reject) => {
      githubUserInfo.save().then(() => {
        resolve(true);
      }, (error: any) => {
        reject(JSON.stringify(error));
      });
    });
    return typeof b === 'string' ? internalServiceResponse(ERROR, b) : internalServiceResponse(OK, '');
  }

  public async updateUserTable(id: number, params: IParams) {
    const query = new AV.Query(GUITableKey);
    query.equalTo('id', id);
    try {
      const userInfos = await query.find();
      if (userInfos.length === 1) {
        const userInfo = userInfos[0];
        for (const key in params) {
          if (params.hasOwnProperty(key)) {
            const element = params[key];
            userInfo.set(key, element);
          }
        }
        await userInfo.save();
        return internalServiceResponse(OK, '');
      } else {
        return internalServiceResponse(ERROR, '');
      }
    } catch (e) {
      return internalServiceResponse(ERROR, JSON.stringify(e));
    }
  }

  public async updatePinStar(o: AV.Queriable, pined: boolean) {
    o.set('flats_pined', pined);
    try {
      const updated = await o.save();
      return updated ? internalServiceResponse(OK, '') : internalServiceResponse(ERROR, '');
    } catch (e) {
      return internalServiceResponse(ERROR, JSON.stringify(e));
    }
  }

  public async fetchPinStar(id: number, userId: number) {
    const query = new AV.Query(USPinTableKey);
    query.equalTo('id', id);
    query.equalTo('flats_user_id', userId);
    try {
      return await query.find();
    } catch (e) {
      return false;
    }
  }

  public async fetchMarketPinStar(id: number, userId: number) {
    const query = new AV.Query(USPinTableKey);
    query.equalTo('id', id);
    query.equalTo('flats_user_id', userId);
    try {
      return await query.find();
    } catch (e) {
      return false;
    }
  }

  public async fetchPinStars(userId: number, page: number, limit = 10) {
    const query = new AV.Query(USPinTableKey);
    query.equalTo('flats_user_id', userId);
    query.equalTo('flats_pined', true);
    query.limit(limit);
    query.skip(page === 1 ? 0 : (page - 1) * limit);
    try {
      return await query.find();
    } catch (e) {
      return false;
    }
  }

  public async searchPinStar(searchKey: string) {
    const query = new AV.Query(USPinTableKey);
    query.contains('description', searchKey);
    query.equalTo('flats_pined', true);
    try {
      return await query.find();
    } catch (e) {
      return false;
    }
  }

  public async savePinStar(userId: number, star: any) {
    try {
      const pinStar = new GithubUserPinStarInfo();
      pinStar.set('id', star.id);
      pinStar.set('html_url', star.html_url);
      pinStar.set('flats_user_id', userId);
      pinStar.set('flats_pined', star.flats_pined);
      pinStar.set('full_name', star.full_name);
      pinStar.set('login', star.owner.login);
      pinStar.set('avatar_url', star.owner.avatar_url);
      pinStar.set('description', star.description);
      pinStar.set('language', star.language);
      pinStar.set('forks', star.forks);
      pinStar.set('forks_count', star.forks_count);
      pinStar.set('watchers', star.watchers);
      pinStar.set('watchers_count', star.watchers_count);
      pinStar.set('default_branch', star.default_branch);
      pinStar.set('license', star.license ? star.license.name : '');
      const b = await new Promise((resolve, reject) => {
        pinStar.save().then(() => {
          resolve(true);
        }, (error: any) => {
          reject(JSON.stringify(error));
        });
      });
      return typeof b === 'string' ? internalServiceResponse(
        ERROR,
        b,
      ) : internalServiceResponse(OK, '');
    } catch (e) {
      return internalServiceResponse(OK, JSON.stringify(e));
    }
  }
}
