import request from '@/utils/request';

// 获取路由
export const getRouters = (enterpriseId:any) => {
    return request({
        url: '/getRouters',
        method: 'get',
    });
};
