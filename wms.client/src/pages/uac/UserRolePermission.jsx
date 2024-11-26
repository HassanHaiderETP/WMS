import React, { useEffect, useState } from 'react';
import DataTable from 'react-data-table-component';

function UserRolePermission({ darkMode }) {
    const [roles, setRoles] = useState([]);
    const [selectedRole, setSelectedRole] = useState('');
    const [tableData, setTableData] = useState([]);
    const [loading, setLoading] = useState(false);
    const API_url = 'https://' + import.meta.env.VITE_API_URL;
    const token = localStorage.getItem('authToken');

    // Fetch all roles on component mount
    useEffect(() => {
        fetchRoles();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/GetAllRoles`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setRoles(data);
                setSelectedRole(data[0]?.rolesId || '');
            } else {
                console.error('Error fetching roles');
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const fetchPermissions = async (roleId) => {
        setLoading(true);
        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/GetPermissions/${roleId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
            if (response.ok) {
                const data = await response.json();
                setTableData(data);
            } else {
                console.error('Error fetching permissions');
            }
        } catch (error) {
            console.error('Error:', error);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (selectedRole) fetchPermissions(selectedRole);
    }, [selectedRole]);

    const handleRoleChange = (e) => {
        setSelectedRole(e.target.value);
    };

    const handleCheckboxChange = (index) => {
        const newData = [...tableData];
        newData[index].isEnable = !newData[index].isEnable;
        setTableData(newData);
    };

    //const handleSave = async () => {
    //    try {
    //        console.log('Sending data:', tableData); // Add this line to log the data
    //        const response = await fetch(`${API_url}/api/UserRolesPermission/UpdatePermissions`, {
    //            method: 'POST',
    //            headers: {
    //                'Authorization': `Bearer ${token}`,
    //                'Content-Type': 'application/json'
    //            },
    //            body: JSON.stringify(tableData),
    //        });

    //        if (response.ok) {
    //            alert('Permissions updated successfully!');
    //        } else {
    //            alert('Error updating permissions.');
    //        }
    //    } catch (error) {
    //        console.error('Error:', error);
    //        alert('An error occurred while updating permissions.');
    //    }
    //};
    const handleSave = async () => {
        // Remove the userRole property from the tableData array before sending it
        const cleanedData = tableData.map(({ userRole, ...rest }) => rest);

        console.log('Sending cleaned data:', cleanedData);

        try {
            const response = await fetch(`${API_url}/api/UserRolesPermission/UpdatePermissions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(cleanedData),
            });

            if (response.ok) {
                alert('Permissions updated successfully!');
            } else {
                console.error('Response error:', await response.text());
                alert('Error updating permissions.');
            }
        } catch (error) {
            console.error('Fetch error:', error);
            alert('An error occurred while updating permissions.');
        }
    };


    // Table columns
    const columns = [
        { name: 'Sr#', selector: (_, index) => index + 1, sortable: true },
        { name: 'Module', selector: row => row.module, sortable: true },
        { name: 'Permission', selector: row => row.permission, sortable: true },
        {
            name: 'Activation',
            cell: (row, index) => (
                <input
                    type="checkbox"
                    checked={row.isEnable}
                    onChange={() => handleCheckboxChange(index)}
                />
            ),
        },
    ];

    // Custom styles for React DataTable
    const customStyles = {
        rows: {
            style: {
                minHeight: '48px', // Set row height
            },
        },
        headCells: {
            style: {
                backgroundColor: '#f3f4f6', // Light gray background
                color: '#374151', // Dark text
                fontWeight: 'bold',
                textAlign: 'center',
            },
        },
        cells: {
            style: {
                textAlign: 'center', // Center align text in cells
            },
        },
    };

    return (
        <>
            <section>
                <div className="flex justify-between md:flex-col items-start">
                    <div className="">
                            <h2 className="mb-4 font-bold">User Role Permission</h2>
                    </div>

                    {/* Dropdown for roles */}
                    <div className="">
                        <select
                            value={selectedRole}
                            onChange={handleRoleChange}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
                        >
                            {roles.map(role => (
                                <option key={role.rolesId} value={role.rolesId}>
                                    {role.rolesDesc}
                                </option>
                            ))}
                        </select>

                        <button
                            type="button"
                            className="ml-5 bg-blue-500 hover:bg-blue-600 text-white px-8 py-2 rounded"
                            onClick={handleSave}
                        >
                            Save
                        </button>
                    </div>
                </div>

                <div className="w-full mt-4">
                    <div className="overflow-x-auto">
                    <DataTable
                        columns={columns}
                        data={tableData}
                        pagination
                        highlightOnHover
                        pointerOnHover
                        theme={darkMode ? 'dark' : 'default'}
                        customStyles={customStyles}
                    />
                    </div>
                </div>
            </section>
        </>
    );
}

export default UserRolePermission;
