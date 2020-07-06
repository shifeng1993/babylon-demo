/*
 * @Description: 扩展 - 物理引擎
 * @Author: shifeng
 * @Email: shifeng199307@gmail.com
 * @Date: 2020-07-03 16:28:51
 */ 

import * as Ammo from "ammo.js";

export let ammoModule: any;
export const ammoReadyPromise = new Promise((resolve) => {
    new Ammo().then((res: unknown) => {
        ammoModule = res;
        resolve(res);
    });
});
