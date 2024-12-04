import React, { useState } from "react";
import PropTypes from "prop-types";
import { Link, NavLink } from "react-router-dom";
import { ChevronDownIcon, ChevronUpIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
    Avatar,
    Button,
    IconButton,
    Typography,
} from "@material-tailwind/react";
import { useMaterialTailwindController, setOpenSidenav } from "@/context";
import ETIcon from '../../../public/img/et-icon.svg';

export function Sidenav({ brandImg, brandName, routes }) {
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavColor, sidenavType, openSidenav } = controller;
    const sidenavTypes = {
        dark: "bg-gradient-to-br from-gray-800 to-gray-900",
        white: "bg-white shadow-sm",
        transparent: "bg-transparent",
    };

    // State to manage collapsible sections
    const [collapsedSections, setCollapsedSections] = useState({});

    const toggleCollapse = (section) => {
        setCollapsedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }));
    };

    return (
        <aside
            className={`${sidenavTypes[sidenavType]} ${openSidenav ? "translate-x-0" : "-translate-x-80"
                } fixed overflow-y-auto inset-0 z-50 my-4 ml-4 h-[calc(100vh-32px)] w-72 rounded-xl transition-transform duration-300 xl:translate-x-0 border border-blue-gray-100`}
        >
            <div className="relative">
                <Link to="/" className="py-6 px-8 text-center">
                    <Typography
                        variant="h6"
                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                        className="ml-5 flex items-center gap-2"
                    >
                        <img src={ETIcon} alt="ET Icon" className="w-6 h-6 mr-2" />
                        {brandName}
                    </Typography>
                </Link>
                <IconButton
                    variant="text"
                    color="white"
                    size="sm"
                    ripple={false}
                    className="absolute right-0 top-0 grid rounded-br-none rounded-tl-none xl:hidden"
                    onClick={() => setOpenSidenav(dispatch, false)}
                >
                    <XMarkIcon strokeWidth={2.5} className="h-5 w-5 text-white" />
                </IconButton>
            </div>
            <div className="m-4">
                {routes.map(({ layout, title, pages, collapsible }, key) => (
                    <ul key={key} className="mb-4 flex flex-col gap-1">
                        {title && (
                            <li className="mx-3.5 mt-4 mb-2 flex justify-between items-center">
                                <Typography
                                    variant="small"
                                    color={sidenavType === "dark" ? "white" : "blue-gray"}
                                    className="font-black uppercase opacity-75"
                                >
                                    {title}
                                </Typography>
                                {collapsible && (
                                    <IconButton
                                        variant="text"
                                        color={sidenavType === "dark" ? "white" : "blue-gray"}
                                        size="sm"
                                        ripple={false}
                                        onClick={() => toggleCollapse(title)}
                                    >
                                        {collapsedSections[title] ? (
                                            <ChevronUpIcon className="h-4 w-4" />
                                        ) : (
                                            <ChevronDownIcon className="h-4 w-4" />
                                        )}
                                    </IconButton>
                                )}
                            </li>
                        )}
                        {!collapsible || !collapsedSections[title]
                            ? pages.filter(({ hidden }) => !hidden).map(({ icon, name, path }) => (
                                <li key={name}>
                                    <NavLink to={`/${layout}${path}`}>
                                        {({ isActive }) => (
                                            <Button
                                                variant={isActive ? "gradient" : "text"}
                                                color={
                                                    isActive
                                                        ? sidenavColor
                                                        : sidenavType === "dark"
                                                            ? "white"
                                                            : "blue-gray"
                                                }
                                                className="flex items-center gap-4 px-4 capitalize"
                                                fullWidth
                                            >
                                                {icon}
                                                <Typography
                                                    color="inherit"
                                                    className="font-medium capitalize"
                                                >
                                                    {name}
                                                </Typography>
                                            </Button>
                                        )}
                                    </NavLink>
                                </li>
                            ))
                            : null}
                    </ul>
                ))}
            </div>
        </aside>
    );
}

Sidenav.defaultProps = {
    brandImg: "/img/et-icon.png",
    brandName: "WMS",
};

Sidenav.propTypes = {
    brandImg: PropTypes.string,
    brandName: PropTypes.string,
    routes: PropTypes.arrayOf(
        PropTypes.shape({
            layout: PropTypes.string,
            title: PropTypes.string,
            pages: PropTypes.arrayOf(
                PropTypes.shape({
                    icon: PropTypes.node,
                    name: PropTypes.string,
                    path: PropTypes.string,
                })
            ),
            collapsible: PropTypes.bool,
            hidden: PropTypes.bool,
        })
    ).isRequired,
};

Sidenav.displayName = "/src/widgets/layout/sidnave.jsx";

export default Sidenav;
