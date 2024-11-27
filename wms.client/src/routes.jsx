import {
    HomeIcon,
    UserCircleIcon,
    TableCellsIcon,
    InformationCircleIcon,
    ServerStackIcon,
    RectangleStackIcon,
    LockClosedIcon, // Add icons for UAC pages
    UserPlusIcon,
    UserGroupIcon,
    KeyIcon,
} from "@heroicons/react/24/solid";
import { Home, Profile, Tables, Notifications } from "@/pages/dashboard";
import { SignIn, SignUp } from "@/pages/auth";


import CreateUser from './pages/Uac/CreateUser';
import CreateUserRole from './pages/Uac/CreateUserRole';
import UserRolePermission from './pages/Uac/UserRolePermission';
import ChangePassword from './pages/Uac/ChangePassword';

const icon = {
    className: "w-5 h-5 text-inherit",
};

export const routes = [
    {
        layout: "dashboard",
        pages: [
            {
                icon: <HomeIcon {...icon} />,
                name: "dashboard",
                path: "/home",
                element: <Home />,
            },
            {
                icon: <UserCircleIcon {...icon} />,
                name: "profile",
                path: "/profile",
                element: <Profile />,
            },
            //{
            //    icon: <TableCellsIcon {...icon} />,
            //    name: "tables",
            //    path: "/tables",
            //    element: <Tables />,
            //},
            {
                icon: <InformationCircleIcon {...icon} />,
                name: "notifications",
                path: "/notifications",
                element: <Notifications />,
            },
        ],
    },
    {
        layout: "dashboard",
        title: "uac",
        collapsible: true,
        pages: [
            {
                icon: <UserPlusIcon {...icon} />, // Icon for Create User
                name: "create user",
                path: "/uac/create-user",
                element: <CreateUser />,
            },
            {
                icon: <UserGroupIcon {...icon} />, // Icon for Create User Role
                name: "create user role",
                path: "/uac/create-user-role",
                element: <CreateUserRole />,
            },
            {
                icon: <LockClosedIcon {...icon} />, // Icon for User Role Permission
                name: "user role permission",
                path: "/uac/user-role-permission",
                element: <UserRolePermission />,
            },
            {
                icon: <KeyIcon {...icon} />, // Icon for Change Password
                name: "change password",
                path: "/uac/change-password",
                element: <ChangePassword />,
            }
        ],
    },
    {
        title: "auth pages",
        layout: "auth",
        collapsible: true,
        pages: [
            {
                icon: <ServerStackIcon {...icon} />,
                name: "sign in",
                path: "/sign-in",
                element: <SignIn />,
            },
            {
                icon: <RectangleStackIcon {...icon} />,
                name: "sign up",
                path: "/sign-up",
                element: <SignUp />,
            },
        ],
    },
];

export default routes;
