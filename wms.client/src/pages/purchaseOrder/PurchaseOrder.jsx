import {
    useMaterialTailwindController,
    setOpenConfigurator,
    setOpenSidenav,
} from "@/context";
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import ModeEditOutlineOutlinedIcon from '@mui/icons-material/ModeEditOutlineOutlined';
import Select from 'react-select';
import Swal from 'sweetalert2';
import React, { useState, useEffect } from 'react';
import {
    Card,
    CardHeader,
    CardBody,
    Typography,
    Avatar,
    Chip,
    Input,
    Tooltip,
    Progress,
} from "@material-tailwind/react";
import axios from 'axios';
import DataTable from 'react-data-table-component';

function PurchaseOrder() {
    const [controller, dispatch] = useMaterialTailwindController();
    const { sidenavType, fixedNavbar, openSidenav } = controller;
    const [purchaseOrders, setpurchaseOrders] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const token = localStorage.getItem('authToken');
    const userId = localStorage.getItem('userId');
    const sidenavTypes = {
        dark: "bg-gradient-to-br from-gray-800 to-gray-900",
        white: "bg-white shadow-sm",
        transparent: "bg-transparent",
    };
    const api = axios.create({
        baseURL: import.meta.env.VITE_API_URL + '/',
        headers: {
            Authorization: token ? `Bearer ${token}` : ''
        }
    });
    const [selectedVendor, setSelectedVendor] = useState(null);

    const handleVendorChange = (selectedOption) => {
        setSelectedVendor(selectedOption);
    };

    useEffect(() => {
        fetchVendors();
        fetchPurchaseOrder();
        /*resetForm();*/
    }, []);

    // Fetch users permissions
    const fetchVendors = async () => {
        try {
            const response = await api.get(
                `api/PurchaseOrder/GetAllVendors`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    }
                }
            );
            setVendors(response.data);
        } catch (error) {
            console.error('Error fetching vendors:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching vendors: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    // Filter the data based on the search term
    const filteredData = purchaseOrders.filter((purchaseOrder) => {
        const normalizedSearchTerm = searchTerm.toLowerCase();
        return (
            purchaseOrder.requisitionId?.toString().toLowerCase().includes(normalizedSearchTerm) ||
            //(isEnabledSearch !== null && purchaseOrder.isEnabled === isEnabledSearch) ||
            purchaseOrder.vendorId.toString().toLowerCase().includes(normalizedSearchTerm) ||
            purchaseOrder.vendor.vendorName.toString().toLowerCase().includes(normalizedSearchTerm) ||
            purchaseOrder.createdDateTime.toString().toLowerCase().includes(normalizedSearchTerm) ||
            purchaseOrder.poSatus.toString().toLowerCase().includes(normalizedSearchTerm) ||
            purchaseOrder.approvedBy.toString().toLowerCase().includes(normalizedSearchTerm)
        );
    });

    // Table columns
    const columns = [
        { name: <strong>Sr#</strong>, selector: (_, index) => index + 1 },
        //{ name: <strong>Requisition ID</strong>, selector: row => row.requisitionId, sortable: true },
        { name: <strong>Vendor ID</strong>, selector: row => row.vendorId, sortable: true },
        { name: <strong>Vendor Name</strong>, selector: row => row.vendor.vendorName, sortable: true },
        { name: <strong>Created Date&Time</strong>, selector: row => row.createdDateTime, sortable: true },
        { name: <strong>PO Satus</strong>, selector: row => row.poSatus, sortable: true },
        { name: <strong>Approved By</strong>, selector: row => row.approvedBy, sortable: true },
        {
            name: <strong>Action</strong>,
            selector: row => row.userId,
            cell: row => (
                <div className="flex items-center">
                    {/* Update Button */}
                    <button
                        type="button"
                        onClick={() => handleRowClick(row)}
                        className="text-blue-500 hover:bg-blue-100 hover:text-blue-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                        
                    >
                        <ModeEditOutlineOutlinedIcon />
                    </button>

                    {/* Delete Button */}
                    <button
                        type="button"
                        onClick={() => handleDelete(row)}
                        className="text-red-500 hover:bg-red-100 hover:text-red-700 font-semibold py-2 px-3 rounded-lg transition-colors duration-300 ease-in-out"
                        
                    >
                        <DeleteOutlinedIcon />
                    </button>
                </div>
            ),
        },
    ];

    const customStyles = (sidenavType) => ({
        table: {
            style: {
                backgroundColor:
                    sidenavType === "dark"
                        ? "transparent"
                        : sidenavType === "transparent"
                            ? "transparent"
                            : "#ffffff",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
            },
        },
        rows: {
            style: {
                minHeight: "48px",
                backgroundColor:
                    sidenavType === "dark" ? "transparent" : "#ffffff",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                transition: "background-color 0.3s ease, background-image 0.3s ease",
            },
            hover: {
                style: {
                    backgroundImage:
                        sidenavType === "dark"
                            ? "linear-gradient(to bottom right, #1f2937, #111827)"
                            : sidenavType === "transparent"
                                ? "linear-gradient(to bottom right, #d1d5db, #e5e7eb)"
                                : "#e5e7eb",
                    backgroundColor: "transparent",
                    boxShadow:
                        sidenavType === "dark"
                            ? "0 4px 8px rgba(0, 0, 0, 0.5)"
                            : "0 2px 4px rgba(0, 0, 0, 0.2)",
                    color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                    transition: "all 0.3s ease",
                },
            },
        },
        headCells: {
            style: {
                backgroundColor:
                    sidenavType === "dark" ? "#1f2937" : "#f3f4f6",
                backgroundImage:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : "none",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                fontWeight: "bold",
            },
        },
        cells: {
            style: {
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
            },
        },
        pagination: {
            style: {
                backgroundColor:
                    sidenavType === "dark"
                        ? "linear-gradient(to bottom right, #374151, #1f2937)"
                        : sidenavType === "transparent"
                            ? "transparent"
                            : "#ffffff",
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                borderTop: "1px solid #e5e7eb", // Add a border for separation if needed
            },
            pageButtonsStyle: {
                color: sidenavType === "dark" ? "#f9fafb" : "#374151",
                fill: sidenavType === "dark" ? "#f9fafb" : "#374151", // Icons for page buttons
                "&:hover": {
                    backgroundColor:
                        sidenavType === "dark"
                            ? "#4b5563" // Slightly lighter on hover
                            : "#f3f4f6",
                },
            },
        },
    });

    const vendorOptions = vendors.map((vendor) => ({
        value: vendor.vendorId, // Set value to vendor ID for efficient selection
        label: vendor.vendorName, // Display vendor name in the dropdown
    }));

    const fetchPurchaseOrder = async () => {
        try {
            const response = await api.get('api/PurchaseOrder/GetAllPurchaseOrders');
            setpurchaseOrders(response.data);
        } catch (error) {
            console.error('Error fetching POs:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: `Error fetching POs: ${error.message}`,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

    const GeneratePO = async () => {
        const selectedVendorId = selectedVendor.value;
        const PO = {
            VendorId: selectedVendorId,
            ApprovedBy: userId,
            POSatus: "Created"
        };

        try {
            const response = await api.post('api/PurchaseOrder/CreatePO', PO);

            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Created!',
                    text: 'PO saved successfully!',
                    confirmButtonText: 'OK',
                    confirmButtonColor: '#3085d6',
                });
                
                fetchPurchaseOrder();
            }
        } catch (error) {
            console.error('Error creating PO:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error creating PO: ' + error.message,
                confirmButtonText: 'OK',
                confirmButtonColor: '#3085d6',
            });
        }
    };

  return (
    <>
        <section>
            <div className="flex justify-between md:flex-col items-start">
                <div className="">
                    <h2 className={`mt-2 mb-4 font-bold ${sidenavType === "dark" ? "text-white" : "text-blue-gray-500"}`}>
                        Purchase Order
                    </h2>
                </div>

                  <div className="flex">
                      <Select
                          options={vendorOptions}
                          placeholder="Select Vendor"
                          className="w-full mr-2"
                          onChange={handleVendorChange}
                      />
                      <button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded"
                          style={{ whiteSpace: 'nowrap' }}
                          onClick={GeneratePO}
                      >
                          Generate PO
                      </button>
                  </div>
            </div>

            <div className="mt-4 mr-auto md:mr-4 md:w-56">
                <Input
                    label="Search"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className={`${sidenavType === "dark" ? "text-white" : "text-blue-gray-500"}`}
                />
            </div>

            <div className="mt-12 mb-8 flex flex-col gap-12 w-full">
                <Card className={`${sidenavTypes[sidenavType]}`}>
                    <CardHeader variant="gradient" color="blue" className={`mb-8 p-6 ${sidenavTypes[sidenavType]}`}>
                        <Typography variant="h6" color="white">
                            Purchase Orders Table
                        </Typography>
                    </CardHeader>
                    <CardBody className="overflow-x-scroll px-0 pt-0 pb-2">
                        <div className="h-[17.5rem] overflow-y-scroll">
                            <DataTable
                                columns={columns}
                                data={filteredData}
                                pagination
                                highlightOnHover
                                pointerOnHover
                                //theme={darkMode ? 'dark' : 'default'}
                                customStyles={customStyles(sidenavType)}
                            />
                        </div>
                    </CardBody>
                </Card>
            </div>

        </section>
    </>
  );
}

export default PurchaseOrder;