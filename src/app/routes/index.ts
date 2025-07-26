import express from "express";

import {AuthRoutes} from "../modules/Auth/auth.routes";
import {AdminRoutes} from "../modules/Admin/admin.route";
import {VendorRoutes} from "../modules/Vendor/vendor.route";
import {UserRoutes} from "../modules/User/user.route";

const router = express.Router();

const moduleRoutes = [
    {
        path: "/auth",
        route: AuthRoutes,
    },
    {
        path: "/admin",
        route: AdminRoutes,
    },

    {
        path: "/vendor",
        route: VendorRoutes,
    },

    {
        path: "/user",
        route: UserRoutes,
    },

];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
