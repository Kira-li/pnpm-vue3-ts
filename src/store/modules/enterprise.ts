
import { defineStore } from 'pinia';

const useEnterpriseStore = defineStore('enterprise', {
    state: () => ({
        info: {},
        taskType: '0' // 0 我的待办 1 与我相关
    }),
    actions: {
        setEnterpriseInfo(info:object) {
            this.info = info;
        },
        setEnterpriseTask(type:string) {
            this.taskType = type;
        }
    },
});

export default useEnterpriseStore;
