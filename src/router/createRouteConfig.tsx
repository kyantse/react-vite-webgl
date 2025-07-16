import React, { Suspense } from "react";
import { RouteObject } from "react-router-dom";
import routeConfig, { IRoute } from ".";

/**
 * 将简单路由配置转化为 react-router-dom 所需要的配置
 * @param routeList
 * @returns
 */
function createRouteConfig(routeList: IRoute[]): RouteObject[] {
  return routeList.map((item) => {
    const Com = item.component;

    const Element = Com ? (
      <Suspense fallback={<p>Loading...</p>}>
        <Com />
      </Suspense>
    ) : (
      <p>Component not found</p> // 默认的错误提示
    );

    const routeConfigItem: RouteObject = {
      path: item.path,
      element: Element,
      ...item,
    };

    // 递归处理子路由，只有当 children 存在时才赋值
    if (item.children) {
      routeConfigItem.children = createRouteConfig(item.children);
    }

    return routeConfigItem;
  });
}

export const router = createRouteConfig(routeConfig.routes);
