import auth from '@/plugins/auth';
import router, { constantRoutes, dynamicRoutes } from '@/router';
import { getRouters } from '@/api/menu';
import Layout from '@/layout/index.vue';
import ParentView from '@/components/ParentView/index.vue';
import InnerLink from '@/layout/components/InnerLink/index.vue';
import { defineStore } from 'pinia';
import { RouteRecordRaw } from 'vue-router';

// 匹配views里面所有的.vue文件
const modules = import.meta.glob('./../../views/**/*.vue');
const meauBreadcrubm: any = {};
const usePermissionStore = defineStore('permission', {
    state: (): {
        routes: RouteRecordRaw[];
        addRoutes: RouteRecordRaw[];
        defaultRoutes: RouteRecordRaw[];
        topbarRouters: RouteRecordRaw[];
        sidebarRouters: RouteRecordRaw[];
        dynamicRoutesPath: string[];
        meauBreadcrubm: any
    } => ({
        routes: [],
        addRoutes: [],
        defaultRoutes: [],
        topbarRouters: [],
        sidebarRouters: [],
        dynamicRoutesPath: [],
        meauBreadcrubm: {}
    }),
    actions: {
        setRoutes(routes: RouteRecordRaw[]) {
            this.addRoutes = routes;
            this.routes = constantRoutes.concat(routes);
        },
        setDefaultRoutes(routes: RouteRecordRaw[]) {
            this.defaultRoutes = constantRoutes.concat(routes);
        },
        setTopbarRoutes(routes: RouteRecordRaw[]) {
            this.topbarRouters = routes;
        },
        setSidebarRouters(routes: RouteRecordRaw[]) {
            this.sidebarRouters = routes;
        },
        generateRoutes(enterpriseId?: any) {
            return new Promise<any[]>(resolve => {
                // 向后端请求路由数据
                getRouters(enterpriseId).then(res => {
                    const sdata = JSON.parse(JSON.stringify(res.data));
                    const rdata = JSON.parse(JSON.stringify(res.data));
                    const allRoutes = filterAsyncRouter(sdata);
                    const enterpriseAccessRouter = constantRoutes.filter(item => {
                        return item.path === '/enterprise';
                    })[0];
                    const eRouter = JSON.parse(JSON.stringify(enterpriseAccessRouter));
                    eRouter.hidden = false;
                    let sidebarRoutes = [];
                    const rewriteRoutes = filterAsyncRouter(rdata, false, true);
                    const asyncRoutes = filterDynamicRoutes(dynamicRoutes);
                    rewriteRoutes.push({ path: '*', redirect: '/404', hidden: true });
                    router.addRoutes(asyncRoutes.router);
                    if (getUrlParam('enterpriseId')) {
                        sidebarRoutes = allRoutes.filter(item => {
                            return item.name === 'EnterpriseAccess' && !item.hidden;
                        })[0].children;
                        sidebarRoutes.forEach(item => {
                            item.path = '/enterpriseAccess/' + item.path;
                        });
                        resolveMeauBreadcrubm(sidebarRoutes);
                    } else {
                        sidebarRoutes = allRoutes.filter(item => {
                            return item.name !== 'EnterpriseAccess' && !item.hidden;
                        });
                        resolveMeauBreadcrubm(allRoutes.filter(item => {
                            return item.name !== 'EnterpriseAccess' && !item.hidden;
                        }));
                        sidebarRoutes.push(eRouter);
                    }

                    // 处理三级路由
                    meauBreadcrubm['/enterprise/request'] = [{
                        meta: eRouter.children[0].meta,
                        path: eRouter.path,
                        redirect: 'noRedirect'
                    }];
                    state.meauBreadcrubm = meauBreadcrubm;
                    this.setRoutes(rewriteRoutes);
                    this.setSidebarRouters(constantRoutes.concat(sidebarRoutes));
                    this.setDefaultRoutes(sidebarRoutes);
                    this.setTopbarRoutes(defaultRoutes);
                    resolve(rewriteRoutes);
                });
            });
        },
    },
});

// 遍历后台传来的路由字符串，转换为组件对象
function filterAsyncRouter(asyncRouterMap: any[], lastRouter = false, type = false) {
    return asyncRouterMap.filter(route => {
        if (type && route.children) {
            route.children = filterChildren(route.children);
        }
        if (route.component) {
            // Layout ParentView 组件特殊处理
            if (route.component === 'Layout') {
                route.component = Layout;
            } else if (route.component === 'ParentView') {
                route.component = ParentView;
            } else if (route.component === 'InnerLink') {
                route.component = InnerLink;
            } else {
                route.component = loadView(route.component);
            }
        }
        if (route.children != null && route.children && route.children.length) {
            route.children = filterAsyncRouter(route.children, route, type);
        } else {
            delete route['children'];
            delete route['redirect'];
        }
        return true;
    });
}

function filterChildren(childrenMap: any[], lastRouter: any = false) {
    let children: any[] = [];
    childrenMap.forEach(el => {
        if (el.children && el.children.length) {
            if (el.component === 'ParentView' && !lastRouter) {
                el.children.forEach((c: any) => {
                    c.path = el.path + '/' + c.path;
                    if (c.children && c.children.length) {
                        children = children.concat(filterChildren(c.children, c));
                        return;
                    }
                    children.push(c);
                });
                return;
            }
        }
        if (lastRouter) {
            el.path = lastRouter.path + '/' + el.path;
        }
        children = children.concat(el);
    });
    return children;
}

// 处理菜单面包屑
function resolveMeauBreadcrubm(sidebarRoutes: any[], lastRoutePath='') {
    sidebarRoutes.forEach(item => {
        item.fullPath = (lastRoutePath ? lastRoutePath + '/' : '') + item.path;
        if (item.path === '/' && item.children.length === 1) {
            meauBreadcrubm['/' + item.children[0].path] = [
                {
                    meta: item.children[0].meta,
                    path: '/' + item.children[0].path,
                    redirect: 'noRedirect'
                }
            ];
        } else {
            if (!lastRoutePath) {
                meauBreadcrubm[item.fullPath] = [{
                    meta: item.meta,
                    path: item.fullPath,
                    redirect: 'noRedirect'
                }];
            } else {
                meauBreadcrubm[item.fullPath] = meauBreadcrubm[lastRoutePath].concat([{
                    meta: item.meta,
                    path: item.fullPath,
                    redirect: 'noRedirect'
                }]);
            }
            if (item.children&&item.children.length) {
                resolveMeauBreadcrubm(item.children, item.fullPath);
            }
        }
    });
}

// 动态路由遍历，验证是否具备权限
export function filterDynamicRoutes(routes: any[]) {
    const res: any[] = [];
    routes.forEach(route => {
        if (route.permissions) {
            if (auth.hasPermiOr(route.permissions)) {
                res.push(route);
            }
        } else if (route.roles) {
            if (auth.hasRoleOr(route.roles)) {
                res.push(route);
            }
        }
    });
    return res;
}

export const loadView = (view: any) => {
    let res;
    for (const path in modules) {
        const dir = path.split('views/')[1].split('.vue')[0];
        if (dir === view) {
            res = () => modules[path]();
        }
    }
    return res;
};

export default usePermissionStore;
