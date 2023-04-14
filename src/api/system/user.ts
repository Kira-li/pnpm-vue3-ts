import request from '@/utils/request';
import { parseStrEmpty } from '@/utils/public';

// 查询用户列表
export function listUser(query:any) {
    return request({
        url: '/system/user/list',
        method: 'get',
        params: query
    });
}

// 查询用户详细
export function getUser(userId:any) {
    return request({
        url: '/system/user/' + parseStrEmpty(userId),
        method: 'get'
    });
}

// 新增用户
export function addUser(data:any) {
    return request({
        url: '/system/user',
        method: 'post',
        data: data
    });
}

// 修改用户
export function updateUser(data:any) {
    return request({
        url: '/system/user',
        method: 'put',
        data: data
    });
}

// 删除用户
export function delUser(userId:string) {
    return request({
        url: '/system/user/' + userId,
        method: 'delete'
    });
}

// 用户密码重置
export function resetUserPwd(userId:string, password:string) {
    const data = {
        userId,
        password
    };
    return request({
        url: '/system/user/resetPwd',
        method: 'put',
        data: data
    });
}

// 用户状态修改
export function changeUserStatus(userId:string, status:string) {
    const data = {
        userId,
        status
    };
    return request({
        url: '/system/user/changeStatus',
        method: 'put',
        data: data
    });
}

// 查询用户个人信息
export function getUserProfile() {
    return request({
        url: '/system/user/profile',
        method: 'get'
    });
}

// 修改用户个人信息
export function updateUserProfile(data:any) {
    return request({
        url: '/system/user/profile',
        method: 'put',
        data: data
    });
}

// 用户密码重置
export function updateUserPwd(oldPassword:string, newPassword:string) {
    const data = {
        oldPassword,
        newPassword
    };
    return request({
        url: '/system/user/profile/updatePwd',
        method: 'put',
        params: data
    });
}

// 用户头像上传
export function uploadAvatar(data:any) {
    return request({
        url: '/system/user/profile/avatar',
        method: 'post',
        data: data
    });
}

// 查询授权角色
export function getAuthRole(userId:string) {
    return request({
        url: '/system/user/authRole/' + userId,
        method: 'get'
    });
}

// 保存授权角色
export function updateAuthRole(data:any) {
    return request({
        url: '/system/user/authRole',
        method: 'put',
        params: data
    });
}

// 查询部门下拉树结构
export function deptTreeSelect() {
    return request({
        url: '/system/user/deptTree',
        method: 'get'
    });
}

// 获取非系统角色用户
export function businessSelect() {
    return request({
        url: '/system/user/selectList',
        method: 'get'
    });
}

// 查看账号关联租户
export function selectRefEnterprise(userId:any) {
    return request({
        url: '/system/user/selectRefEnterprise/' + userId,
        method: 'get'
    });
}
// 新增用户协议
export function insertAgreement(data:any) {
    return request({
        url: '/system/user/insertExtend',
        method: 'post',
        data: data
    });
}
// 根据角色id查询租户下用户列表
export function roleUser(enterpriseId:string,roleId:string) {
    return request({
        url: `/system/enterprise/roleUser/${enterpriseId}/${roleId}`,
        method: 'get',
    });
}
