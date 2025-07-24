import { ComponentType, lazy } from "react";
import { RouteObject } from "react-router-dom";

// 使用交叉类型扩展 RouteObject
export type IRoute = RouteObject & {
  /**
   * 是否是菜单项
   * @default true
   */
  isMenu?: boolean;
  /**
   * 生成菜单的姓名
   */
  name: string;
  component: ComponentType;
  /**
   * 是否触发守卫逻辑
   * @default true
   */
  needGuard?: boolean;
  children?: IRoute[];
};

interface IRouteConfig {
  routes: IRoute[];
}

const routeConfig: IRouteConfig = {
  routes: [
    {
      name: "home",
      path: "/home",
      component: lazy(() => import("@/pages/home")),
    },
    {
      name: "map",
      path: "/map",
      component: lazy(() => import("@/pages/map")),
    },
    {
      name: "gl",
      path: "/",
      component: lazy(() => import("@/pages/gl")),
    },
  ],
};

export default routeConfig;
