import router from './router';
import { ElMessage } from 'element-plus';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import { getToken } from '@/utils/auth';
import { isHttp } from '@/utils/validate';
import { isRelogin } from '@/utils/request';
import { getUrlParam } from '@/utils/public';
import { selectRefEnterprise } from '@/api/system/user';
import useUserStore from '@/store/modules/user';
import useSettingsStore from '@/store/modules/settings';
import usePermissionStore from '@/store/modules/permission';
import useEnterpriseStore from '@/store/modules/enterprise';

NProgress.configure({ showSpinner: false });

const whiteList = ['/login', '/register'];

router.beforeEach((to, from, next) => {
    NProgress.start();
    if (getToken()) {
        to.meta.title && useSettingsStore().setTitle(to.meta.title);
        /* has token*/
        if (to.path === '/login') {
            next({ path: '/' });
            NProgress.done();
        } else {
            const enterpriseId = getUrlParam('enterpriseId');
            if (useUserStore().roles.length === 0) {
                isRelogin.show = true;
                // 判断当前用户是否已拉取完user_info信息
                useUserStore()
                    .getInfo()
                    .then(() => {
                        isRelogin.show = false;
                        selectRefEnterprise(useUserStore().userInfo.userId).then(res => {
                            useEnterpriseStore().setEnterpriseInfo(res.data.enterprises.filter((item:any) => {
                                return item.id.toString() === enterpriseId;
                            })[0]);
                        });
                        usePermissionStore()
                            .generateRoutes()
                            .then(accessRoutes => {
                                // 根据roles权限生成可访问的路由表
                                const needRouter = enterpriseId ? accessRoutes.filter(item => {
                                    return item.name === 'EnterpriseAccess' || item.path === '*';
                                }) : accessRoutes;
                                needRouter.forEach(route => {
                                    console.log(route);
                                    if (!isHttp(route.path)) {
                                        router.addRoute(route); // 动态添加可访问路由表
                                    }
                                });
                                next({ ...to, replace: true }); // hack方法 确保addRoutes已完成
                            });
                    })
                    .catch(err => {
                        useUserStore()
                            .logOut()
                            .then(() => {
                                ElMessage.error(err);
                                next({ path: '/' });
                            });
                    });
            } else {
                if (to.query.enterpriseId) {
                    next();
                    return;
                }
                if (from.query.enterpriseId) {
                    to.query.enterpriseId = from.query.enterpriseId;
                    next({ ...to});
                    NProgress.done();
                } else {
                    next();
                }
            }
        }
    } else {
        // 没有token
        if (whiteList.indexOf(to.path) !== -1) {
            // 在免登录白名单，直接进入
            next();
        } else {
            next(`/login?redirect=${to.fullPath}`); // 否则全部重定向到登录页
            NProgress.done();
        }
    }
});

router.afterEach(() => {
    NProgress.done();
});
