import { login, logout, getInfo } from '@/api/login';
import { getToken, setToken, removeToken } from '@/utils/auth';
import defAva from '@/assets/images/profile.jpg';
import { defineStore } from 'pinia';

const useUserStore = defineStore('user', {
    state: (): {
        token?: string;
        name: string;
        avatar: string;
        roles: any[];
        permissions: string[];
        agreement: any;
        userInfo?: any;
    } => ({
        token: getToken(),
        name: '',
        avatar: '',
        roles: [],
        permissions: [],
        agreement: null,
        userInfo: {}
    }),
    actions: {
        // 登录
        login(userInfo: { username: string; password: string;}) {
            const username = userInfo.username.trim();
            const password = userInfo.password;
            return new Promise((resolve, reject) => {
                login(username, password)
                    .then((res: any) => {
                        setToken(res.data.token);
                        this.token = res.data.token;
                        resolve(1);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        // 获取用户信息
        getInfo() {
            return new Promise((resolve, reject) => {
                getInfo()
                    .then((res: any) => {
                        const user = res.data.user;
                        const avatar =
                            user.avatar === '' || user.avatar == null
                                ? defAva
                                : import.meta.env.VITE_APP_BASE_API + user.avatar;

                        if (res.data.admin) {
                            this.roles = ['admin'];
                        } else {
                            this.roles = ['ROLE_DEFAULT'];
                        }
                        this.permissions = res.data.permissions;
                        this.name = user.userName;
                        this.avatar = avatar;
                        this.agreement = res.data.agreement;
                        this.userInfo  = user;
                        resolve(res);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
        // 退出系统
        logOut() {
            return new Promise((resolve, reject) => {
                logout()
                    .then(() => {
                        this.token = '';
                        this.roles = [];
                        this.permissions = [];
                        removeToken();
                        resolve(1);
                    })
                    .catch(error => {
                        reject(error);
                    });
            });
        },
    },
});

export default useUserStore;
