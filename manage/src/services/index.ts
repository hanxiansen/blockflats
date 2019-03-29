import axios from 'axios';
import Cookies from 'js-cookie';


export const signin = () => {
  return axios.get('/user', {
    withCredentials: true,
  });
}

export const fetchStarList = (page: number) => {
  return axios.get(`/stars?page=${page}`, {
    withCredentials: true,
  });
}

export const commitPin = (id: number, pined: boolean) => {
  return axios.get(`/pin?id=${id}&pined=${pined ? 1 : 0}`, {
    withCredentials: true,
  });
}

export const fetchPinStarList = (page: number) => {
  return axios.get(`/pins?page=${page}`, {
    withCredentials: true,
  });
}

export const commitMarketPin = (star: any) => {
  const csrftoken = Cookies.get('csrfToken');
  return axios.post(
    '/market_pin',
    star, {
      withCredentials: true,
      headers: {
        'x-csrf-token': csrftoken
      }
    }
  );
}

export const searchPinStar = (searchKey: string) => {
  return axios.get(`/search_pin?searchKey=${encodeURIComponent(searchKey)}`);
}
