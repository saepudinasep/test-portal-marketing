import React from 'react';

export default function Dashboard({ user }) {
    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
            <p>Welcome, {user?.name || 'User'}!</p>
            {/* Add dashboard content here */}
        </div>
    );
}
